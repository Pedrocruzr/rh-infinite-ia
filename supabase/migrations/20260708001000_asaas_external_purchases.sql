-- =========================================================
-- Asaas External Purchases (Payment Links) Support
-- =========================================================

-- 1. Table for pending Asaas purchases (before user registers)
create table if not exists public.pending_asaas_purchases (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  name text,
  payment_id text not null unique,
  subscription_id text,
  payload jsonb not null default '{}'::jsonb,
  processed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index for fast lookup by email
create index if not exists pending_asaas_purchases_email_idx 
  on public.pending_asaas_purchases (lower(email));

-- RLS for pending_asaas_purchases (restricted)
alter table public.pending_asaas_purchases enable row level security;

-- Trigger to update updated_at
drop trigger if exists trg_pending_asaas_purchases_updated_at on public.pending_asaas_purchases;
create trigger trg_pending_asaas_purchases_updated_at
before update on public.pending_asaas_purchases
for each row execute function public.set_updated_at();

-- 2. Update process_asaas_payment_event to support external purchases
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
  v_payment_id text := nullif(v_payment->>'id', '');
  v_payment_subscription_id text := nullif(v_payment->>'subscription', '');
  v_external_reference text := nullif(v_payment->>'externalReference', '');
  v_billing_type text := nullif(v_payment->>'billingType', '');
  v_payment_status text := nullif(v_payment->>'status', '');
  v_sub_id text := nullif(p_payload->'subscription'->>'id', '');
  v_user_id uuid;
  v_subscription_id uuid;
  v_plan_id uuid;
  v_plan_code text;
  v_plan_name text;
  v_plan_credits integer := 0;
  v_topup_code text;
  v_topup_name text;
  v_topup_credits integer := 0;
  v_topup_days integer := 30;
  v_balance integer := 0;
  v_now timestamptz := now();
  v_period_end timestamptz := now() + interval '1 month';
  
  -- External link variables
  v_customer_email text;
  v_customer_name text;
  v_payment_value numeric;
begin
  -- Check valid action events
  if p_event_type not in ('PAYMENT_CONFIRMED', 'PAYMENT_RECEIVED', 'PAYMENT_OVERDUE', 'SUBSCRIPTION_DELETED') then
    return jsonb_build_object('ok', true, 'ignored', true, 'reason', 'event_not_actionable');
  end if;

  -- Handle PAYMENT_OVERDUE (Inadimplência)
  if p_event_type = 'PAYMENT_OVERDUE' then
    if v_payment_subscription_id is not null then
      update public.subscriptions
         set status = 'past_due',
             updated_at = v_now
       where asaas_subscription_id = v_payment_subscription_id;

      return jsonb_build_object(
        'ok', true,
        'mode', 'subscription_overdue',
        'subscriptionId', v_payment_subscription_id,
        'status', 'past_due'
      );
    end if;
    return jsonb_build_object('ok', true, 'ignored', true, 'reason', 'payment_overdue_without_subscription');
  end if;

  -- Handle SUBSCRIPTION_DELETED (Cancelamento)
  if p_event_type = 'SUBSCRIPTION_DELETED' then
    if v_sub_id is not null then
      update public.subscriptions
         set status = 'canceled',
             updated_at = v_now
       where asaas_subscription_id = v_sub_id;

      return jsonb_build_object(
        'ok', true,
        'mode', 'subscription_deleted',
        'subscriptionId', v_sub_id,
        'status', 'canceled'
      );
    end if;
    return jsonb_build_object('ok', true, 'ignored', true, 'reason', 'subscription_deleted_without_id');
  end if;

  -- PAYMENT_CONFIRMED and PAYMENT_RECEIVED processing
  if v_payment_id is null then
    raise exception 'ASAAS_PAYMENT_ID_MISSING';
  end if;

  -- Deduplicate transactions
  if exists (
    select 1
    from public.credit_transactions
    where source_type = 'asaas_payment'
      and source_id = v_payment_id
  ) then
    return jsonb_build_object('ok', true, 'duplicated', true, 'paymentId', v_payment_id);
  end if;

  -- Subscription payment received
  if v_payment_subscription_id is not null then
    -- Try to find subscription in Stacker DB
    select s.id, s.user_id, s.plan_id, p.code, p.name, p.monthly_credits
      into v_subscription_id, v_user_id, v_plan_id, v_plan_code, v_plan_name, v_plan_credits
    from public.subscriptions s
    left join public.plans p on p.id = s.plan_id
    where s.asaas_subscription_id = v_payment_subscription_id
    limit 1;

    -- If subscription is not found, handle as external payment link
    if v_subscription_id is null then
      v_customer_email := lower(trim(p_payload->'customerDetails'->>'email'));
      v_customer_name := p_payload->'customerDetails'->>'name';
      v_payment_value := (v_payment->>'value')::numeric;

      if v_customer_email is not null then
        -- Find user profile
        select id into v_user_id
        from public.profiles
        where lower(email) = v_customer_email
        limit 1;

        -- Identify plan based on price (67.90/67.9/68 = perfil_comportamental, 297 = start)
        if v_payment_value >= 60.00 and v_payment_value <= 75.00 then
          select id, code, name, monthly_credits
            into v_plan_id, v_plan_code, v_plan_name, v_plan_credits
          from public.plans
          where code = 'perfil_comportamental' and active = true
          limit 1;
        else
          select id, code, name, monthly_credits
            into v_plan_id, v_plan_code, v_plan_name, v_plan_credits
          from public.plans
          where code = 'start' and active = true
          limit 1;
        end if;

        -- If user already exists, process immediately
        if v_user_id is not null then
          insert into public.subscriptions (
            user_id,
            plan_id,
            status,
            current_period_start,
            current_period_end,
            cancel_at_period_end,
            asaas_subscription_id,
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
            v_payment_subscription_id,
            v_now,
            v_now
          )
          on conflict (user_id) do update
          set plan_id = excluded.plan_id,
              status = 'active',
              current_period_start = excluded.current_period_start,
              current_period_end = excluded.current_period_end,
              cancel_at_period_end = false,
              asaas_subscription_id = excluded.asaas_subscription_id,
              updated_at = v_now
          returning id into v_subscription_id;

          -- Revoke old credits
          update public.credit_grants
             set remaining_credits = 0
           where user_id = v_user_id
             and source_type = 'subscription_cycle'
             and remaining_credits > 0;

          -- Grant new credits
          insert into public.credit_grants (
            user_id,
            subscription_id,
            source_type,
            source_id,
            total_credits,
            remaining_credits,
            expires_at,
            metadata
          )
          values (
            v_user_id,
            v_subscription_id,
            'subscription_cycle',
            v_payment_id,
            v_plan_credits,
            v_plan_credits,
            v_period_end,
            jsonb_build_object(
              'provider', 'asaas',
              'event_id', p_event_id,
              'event_type', p_event_type,
              'payment_id', v_payment_id,
              'billing_type', v_billing_type,
              'payment_status', v_payment_status,
              'plan_code', v_plan_code,
              'plan_name', v_plan_name,
              'is_external', true
            )
          );

          v_balance := public.recompute_credit_wallet(v_user_id);

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
            v_balance,
            'subscription_grant',
            'asaas_payment',
            v_payment_id,
            format('Créditos do ciclo mensal liberados para o plano %s (Compra externa)', v_plan_name),
            jsonb_build_object(
              'provider', 'asaas',
              'event_id', p_event_id,
              'event_type', p_event_type,
              'payment_id', v_payment_id,
              'subscription_id', v_payment_subscription_id,
              'plan_code', v_plan_code,
              'plan_name', v_plan_name
            ),
            v_now
          );

          return jsonb_build_object(
            'ok', true,
            'status', 'processed_immediately',
            'mode', 'subscription',
            'paymentId', v_payment_id,
            'subscriptionId', v_subscription_id::text,
            'planCode', v_plan_code,
            'creditsGranted', v_plan_credits,
            'balanceAfter', v_balance
          );
        else
          -- User does not exist, save for later registration
          insert into public.pending_asaas_purchases (
            email,
            name,
            payment_id,
            subscription_id,
            payload,
            processed
          )
          values (
            v_customer_email,
            v_customer_name,
            v_payment_id,
            v_payment_subscription_id,
            p_payload,
            false
          )
          on conflict (payment_id) do nothing;

          return jsonb_build_object(
            'ok', true,
            'status', 'saved_for_later_registration',
            'paymentId', v_payment_id,
            'subscriptionId', v_payment_subscription_id
          );
        end if;
      else
        raise exception 'ASAAS_CUSTOMER_EMAIL_MISSING';
      end if;
    end if;

    -- Standard internal subscription payment flow
    update public.subscriptions
       set status = 'active',
           current_period_start = v_now,
           current_period_end = v_period_end,
           cancel_at_period_end = false,
           updated_at = v_now
     where id = v_subscription_id;

    update public.credit_grants
       set remaining_credits = 0
     where user_id = v_user_id
       and source_type = 'subscription_cycle'
       and remaining_credits > 0;

    insert into public.credit_grants (
      user_id,
      subscription_id,
      source_type,
      source_id,
      total_credits,
      remaining_credits,
      expires_at,
      metadata
    )
    values (
      v_user_id,
      v_subscription_id,
      'subscription_cycle',
      v_payment_id,
      v_plan_credits,
      v_plan_credits,
      v_period_end,
      jsonb_build_object(
        'provider', 'asaas',
        'event_id', p_event_id,
        'event_type', p_event_type,
        'payment_id', v_payment_id,
        'billing_type', v_billing_type,
        'payment_status', v_payment_status,
        'plan_code', v_plan_code,
        'plan_name', v_plan_name
      )
    );

    v_balance := public.recompute_credit_wallet(v_user_id);

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
      v_balance,
      'subscription_grant',
      'asaas_payment',
      v_payment_id,
      format('Créditos do ciclo mensal liberados para o plano %s', v_plan_name),
      jsonb_build_object(
        'provider', 'asaas',
        'event_id', p_event_id,
        'event_type', p_event_type,
        'payment_id', v_payment_id,
        'subscription_id', v_payment_subscription_id,
        'plan_code', v_plan_code,
        'plan_name', v_plan_name
      ),
      v_now
    );

    return jsonb_build_object(
      'ok', true,
      'mode', 'subscription',
      'paymentId', v_payment_id,
      'subscriptionId', v_subscription_id::text,
      'planCode', v_plan_code,
      'creditsGranted', v_plan_credits,
      'balanceAfter', v_balance
    );
  end if;

  -- Topup payment received
  if v_external_reference like 'topup|%' then
    v_user_id := nullif(substring(v_external_reference from 'u:([0-9a-fA-F-]{36})'), '')::uuid;
    v_topup_code := nullif(substring(v_external_reference from 't:([A-Za-z0-9_-]+)'), '');

    if v_user_id is null or v_topup_code is null then
      raise exception 'ASAAS_TOPUP_REFERENCE_INVALID';
    end if;

    select name, credits, expires_in_days
      into v_topup_name, v_topup_credits, v_topup_days
    from public.topup_products
    where code = v_topup_code
      and active = true
    limit 1;

    if v_topup_name is null then
      raise exception 'ASAAS_TOPUP_NOT_FOUND';
    end if;

    insert into public.credit_grants (
      user_id,
      source_type,
      source_id,
      total_credits,
      remaining_credits,
      expires_at,
      metadata
    )
    values (
      v_user_id,
      'topup',
      v_payment_id,
      v_topup_credits,
      v_topup_credits,
      v_now + make_interval(days => v_topup_days),
      jsonb_build_object(
        'provider', 'asaas',
        'event_id', p_event_id,
        'event_type', p_event_type,
        'payment_id', v_payment_id,
        'billing_type', v_billing_type,
        'payment_status', v_payment_status,
        'topup_code', v_topup_code,
        'topup_name', v_topup_name,
        'expires_in_days', v_topup_days
      )
    );

    v_balance := public.recompute_credit_wallet(v_user_id);

    insert into public.credit_transactions (
      user_id,
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
      v_topup_credits,
      v_balance,
      'topup_grant',
      'asaas_payment',
      v_payment_id,
      format('Créditos de recarga liberados: %s', v_topup_name),
      jsonb_build_object(
        'provider', 'asaas',
        'event_id', p_event_id,
        'event_type', p_event_type,
        'payment_id', v_payment_id,
        'billing_type', v_billing_type,
        'payment_status', v_payment_status,
        'topup_code', v_topup_code,
        'topup_name', v_topup_name
      ),
      v_now
    );

    return jsonb_build_object(
      'ok', true,
      'mode', 'topup',
      'paymentId', v_payment_id,
      'topupCode', v_topup_code,
      'creditsGranted', v_topup_credits,
      'balanceAfter', v_balance
    );
  end if;

  return jsonb_build_object('ok', true, 'ignored', true, 'reason', 'unknown_payment_type');
end;
$$;


-- 3. Update handle_new_user trigger to support pending_asaas_purchases
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_pending record;
  v_pending_asaas record;
  v_plan_id uuid;
  v_plan_credits integer;
  v_subscription_id uuid;
  v_now timestamptz := now();
  v_period_end timestamptz := now() + interval '1 month';
  v_trial_end timestamptz := now() + interval '7 days';
  v_payment_value numeric;
begin
  -- Insert profile
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (id) do nothing;

  -- Insert credit wallet
  insert into public.credit_wallets (user_id, balance)
  values (new.id, 0)
  on conflict (user_id) do nothing;

  -- Check if there is an unprocessed Asaas purchase for this email (PRIORITY)
  select * into v_pending_asaas
  from public.pending_asaas_purchases
  where lower(email) = lower(new.email) and processed = false
  order by created_at desc
  limit 1;

  if v_pending_asaas.id is not null then
    v_payment_value := (v_pending_asaas.payload->'payment'->>'value')::numeric;

    -- Get plan details based on price
    if v_payment_value >= 60.00 and v_payment_value <= 75.00 then
      select id, monthly_credits into v_plan_id, v_plan_credits
      from public.plans
      where code = 'perfil_comportamental' and active = true
      limit 1;
    else
      select id, monthly_credits into v_plan_id, v_plan_credits
      from public.plans
      where code = 'start' and active = true
      limit 1;
    end if;

    -- Create subscription
    insert into public.subscriptions (
      user_id,
      plan_id,
      status,
      current_period_start,
      current_period_end,
      cancel_at_period_end,
      asaas_subscription_id,
      created_at,
      updated_at
    )
    values (
      new.id,
      v_plan_id,
      'active',
      v_now,
      v_period_end,
      false,
      v_pending_asaas.subscription_id,
      v_now,
      v_now
    )
    on conflict (user_id) do update
    set plan_id = excluded.plan_id,
        status = 'active',
        current_period_start = excluded.current_period_start,
        current_period_end = excluded.current_period_end,
        cancel_at_period_end = false,
        asaas_subscription_id = excluded.asaas_subscription_id,
        updated_at = v_now
    returning id into v_subscription_id;

    -- Grant credits
    insert into public.credit_grants (
      user_id,
      subscription_id,
      source_type,
      source_id,
      total_credits,
      remaining_credits,
      expires_at,
      metadata
    )
    values (
      new.id,
      v_subscription_id,
      'subscription_cycle',
      v_pending_asaas.payment_id,
      v_plan_credits,
      v_plan_credits,
      v_period_end,
      jsonb_build_object(
        'provider', 'asaas',
        'payment_id', v_pending_asaas.payment_id,
        'subscription_id', v_pending_asaas.subscription_id,
        'purchase_status', 'approved_at_signup',
        'is_external', true
      )
    );

    -- Recompute wallet balance
    perform public.recompute_credit_wallet(new.id);

    -- Mark purchase as processed
    update public.pending_asaas_purchases
       set processed = true
     where id = v_pending_asaas.id;
     
    return new;
  end if;

  -- Check if there is an unprocessed Kiwify purchase for this email (FALLBACK)
  select * into v_pending
  from public.pending_kiwify_purchases
  where lower(email) = lower(new.email) and processed = false
  order by created_at desc
  limit 1;

  if v_pending.id is not null then
    -- Get default 'start' plan details
    select id, monthly_credits into v_plan_id, v_plan_credits
    from public.plans
    where code = 'start' and active = true
    limit 1;

    if v_plan_id is null then
      select id, monthly_credits into v_plan_id, v_plan_credits
      from public.plans
      where active = true
      limit 1;
    end if;

    -- Create trialing subscription
    insert into public.subscriptions (
      user_id,
      plan_id,
      status,
      current_period_start,
      current_period_end,
      cancel_at_period_end
    )
    values (
      new.id,
      v_plan_id,
      'trialing',
      v_now,
      v_trial_end,
      false
    )
    on conflict (user_id) do update
    set plan_id = excluded.plan_id,
        status = 'trialing',
        current_period_start = excluded.current_period_start,
        current_period_end = excluded.current_period_end,
        cancel_at_period_end = false
    returning id into v_subscription_id;

    -- Grant credits
    insert into public.credit_grants (
      user_id,
      subscription_id,
      source_type,
      source_id,
      total_credits,
      remaining_credits,
      expires_at,
      metadata
    )
    values (
      new.id,
      v_subscription_id,
      'subscription_cycle',
      v_pending.order_id,
      v_plan_credits,
      v_plan_credits,
      v_trial_end,
      jsonb_build_object(
        'provider', 'kiwify',
        'order_id', v_pending.order_id,
        'purchase_status', 'approved_at_signup'
      )
    );

    -- Recompute wallet balance
    perform public.recompute_credit_wallet(new.id);

    -- Mark purchase as processed
    update public.pending_kiwify_purchases
       set processed = true
     where id = v_pending.id;
  end if;

  return new;
end;
$$;
