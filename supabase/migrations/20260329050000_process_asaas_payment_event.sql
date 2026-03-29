create or replace function public.process_asaas_payment_event(
  p_event_id text,
  p_event_type text,
  p_payload jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_payment jsonb := coalesce(p_payload->'payment', '{}'::jsonb);
  v_payment_id text;
  v_external_reference text;
  v_user_id uuid;
  v_plan_code text;
  v_plan_id uuid;
  v_plan_name text;
  v_plan_credits integer := 0;
  v_existing_subscription_id uuid;
  v_subscription_id uuid;
  v_current_balance integer := 0;
  v_next_balance integer := 0;
  v_now timestamptz := now();
  v_period_end timestamptz := now() + interval '1 month';
  v_billing_type text;
  v_payment_status text;
begin
  if p_event_type not in ('PAYMENT_CONFIRMED', 'PAYMENT_RECEIVED') then
    return jsonb_build_object(
      'ok', true,
      'ignored', true,
      'reason', 'event_not_actionable',
      'eventType', p_event_type
    );
  end if;

  v_payment_id := nullif(v_payment->>'id', '');
  v_external_reference := nullif(v_payment->>'externalReference', '');
  v_billing_type := nullif(v_payment->>'billingType', '');
  v_payment_status := nullif(v_payment->>'status', '');

  if v_payment_id is null then
    raise exception 'ASAAS_PAYMENT_ID_MISSING';
  end if;

  if exists (
    select 1
    from public.credit_transactions
    where source_type = 'asaas_payment'
      and source_id = v_payment_id
  ) then
    return jsonb_build_object(
      'ok', true,
      'duplicated', true,
      'paymentId', v_payment_id
    );
  end if;

  if v_external_reference is null then
    raise exception 'ASAAS_EXTERNAL_REFERENCE_MISSING';
  end if;

  v_user_id := nullif(substring(v_external_reference from 'u:([0-9a-fA-F-]{36})'), '')::uuid;
  v_plan_code := nullif(substring(v_external_reference from 'p:([A-Za-z0-9_-]+)'), '');

  if v_user_id is null then
    raise exception 'ASAAS_USER_ID_MISSING';
  end if;

  if v_plan_code is null then
    raise exception 'ASAAS_PLAN_CODE_MISSING';
  end if;

  select
    id,
    name,
    monthly_credits
  into
    v_plan_id,
    v_plan_name,
    v_plan_credits
  from public.plans
  where code = v_plan_code
    and active = true
  order by created_at desc
  limit 1;

  if v_plan_id is null then
    raise exception 'ASAAS_PLAN_NOT_FOUND';
  end if;

  v_plan_credits := coalesce(v_plan_credits, 0);

  select id
  into v_existing_subscription_id
  from public.subscriptions
  where user_id = v_user_id
  order by created_at desc
  limit 1;

  if v_existing_subscription_id is not null then
    update public.subscriptions
       set plan_id = v_plan_id,
           status = 'active',
           current_period_start = v_now,
           current_period_end = v_period_end,
           cancel_at_period_end = false,
           updated_at = v_now
     where id = v_existing_subscription_id
     returning id into v_subscription_id;
  else
    insert into public.subscriptions (
      user_id,
      plan_id,
      status,
      current_period_start,
      current_period_end,
      cancel_at_period_end,
      created_at,
      updated_at
    )
    values (
      v_user_id,
      v_plan_id,
      'active',
      v_now,
      v_period_end,
      false,
      v_now,
      v_now
    )
    returning id into v_subscription_id;
  end if;

  select balance
  into v_current_balance
  from public.credit_wallets
  where user_id = v_user_id;

  v_current_balance := coalesce(v_current_balance, 0);
  v_next_balance := v_current_balance + v_plan_credits;

  insert into public.credit_wallets (
    user_id,
    balance,
    updated_at
  )
  values (
    v_user_id,
    v_next_balance,
    v_now
  )
  on conflict (user_id) do update
    set balance = excluded.balance,
        updated_at = excluded.updated_at;

  insert into public.credit_transactions (
    user_id,
    subscription_id,
    delta,
    balance_after,
    transaction_type,
    source_type,
    source_id,
    description,
    metadata,
    created_at
  )
  values (
    v_user_id,
    v_subscription_id,
    v_plan_credits,
    v_next_balance,
    'subscription_grant',
    'asaas_payment',
    v_payment_id,
    format('Créditos liberados automaticamente via Asaas para o plano %s', v_plan_name),
    jsonb_build_object(
      'provider', 'asaas',
      'event_id', p_event_id,
      'event_type', p_event_type,
      'payment_id', v_payment_id,
      'billing_type', v_billing_type,
      'payment_status', v_payment_status,
      'plan_code', v_plan_code,
      'plan_name', v_plan_name,
      'external_reference', v_external_reference
    ),
    v_now
  );

  return jsonb_build_object(
    'ok', true,
    'activated', true,
    'paymentId', v_payment_id,
    'userId', v_user_id::text,
    'planCode', v_plan_code,
    'creditsGranted', v_plan_credits,
    'subscriptionId', v_subscription_id::text,
    'balanceAfter', v_next_balance
  );
end;
$$;

revoke all on function public.process_asaas_payment_event(text, text, jsonb) from public;
grant execute on function public.process_asaas_payment_event(text, text, jsonb) to anon, authenticated;
