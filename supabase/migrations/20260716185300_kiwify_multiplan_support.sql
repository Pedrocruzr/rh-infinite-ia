-- =========================================================
-- Kiwify Multi-Plan Support
-- =========================================================

-- Update process_kiwify_approved_purchase RPC
create or replace function public.process_kiwify_approved_purchase(
  p_email text,
  p_name text,
  p_order_id text,
  p_payload jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_plan_id uuid;
  v_plan_code text;
  v_plan_name text;
  v_plan_credits integer;
  v_subscription_id uuid;
  v_balance integer := 0;
  v_now timestamptz := now();
  v_period_end timestamptz := now() + interval '1 month';
  v_amount_cents numeric;
begin
  -- Insert into pending purchases to log it
  insert into public.pending_kiwify_purchases (email, name, order_id, payload, processed)
  values (lower(trim(p_email)), p_name, p_order_id, coalesce(p_payload, '{}'::jsonb), false)
  on conflict (order_id) do nothing;

  -- Deduplicate transactions
  if exists (
    select 1
    from public.credit_transactions
    where source_type = 'kiwify_payment'
      and source_id = p_order_id
  ) then
    return jsonb_build_object('ok', true, 'duplicated', true, 'orderId', p_order_id);
  end if;

  -- Find if profile exists
  select id into v_user_id
  from public.profiles
  where lower(email) = lower(trim(p_email))
  limit 1;

  -- Extract amount in cents
  v_amount_cents := coalesce((p_payload->>'amount')::numeric, 0);

  -- Determine plan based on price paid (in cents)
  -- - 6000 to 7500 cents (R$ 60,00 to R$ 75,00) -> perfil_comportamental
  -- - 9000 to 18000 cents (R$ 90,00 to R$ 180,00) -> recrutamento_selecao
  -- - Otherwise -> start (R$ 297,00)
  if v_amount_cents >= 6000 and v_amount_cents <= 7500 then
    select id, code, name, monthly_credits
      into v_plan_id, v_plan_code, v_plan_name, v_plan_credits
    from public.plans
    where code = 'perfil_comportamental' and active = true
    limit 1;
  elsif v_amount_cents >= 9000 and v_amount_cents <= 18000 then
    select id, code, name, monthly_credits
      into v_plan_id, v_plan_code, v_plan_name, v_plan_credits
    from public.plans
    where code = 'recrutamento_selecao' and active = true
    limit 1;
  else
    select id, code, name, monthly_credits
      into v_plan_id, v_plan_code, v_plan_name, v_plan_credits
    from public.plans
    where code = 'start' and active = true
    limit 1;
  end if;

  if v_user_id is not null then
    -- Create active subscription
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
    on conflict (user_id) do update
    set plan_id = excluded.plan_id,
        status = 'active',
        current_period_start = excluded.current_period_start,
        current_period_end = excluded.current_period_end,
        cancel_at_period_end = false,
        updated_at = v_now
    returning id into v_subscription_id;

    -- Revoke old credits
    update public.credit_grants
       set remaining_credits = 0
     where user_id = v_user_id
       and source_type = 'subscription_cycle'
       and remaining_credits > 0;

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
      v_user_id,
      v_subscription_id,
      'subscription_cycle',
      p_order_id,
      v_plan_credits,
      v_plan_credits,
      v_period_end,
      jsonb_build_object(
        'provider', 'kiwify',
        'order_id', p_order_id,
        'purchase_status', 'approved_at_signup',
        'plan_code', v_plan_code,
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
      'kiwify_payment',
      p_order_id,
      format('Créditos do ciclo mensal liberados para o plano %s (Kiwify)', v_plan_name),
      jsonb_build_object(
        'provider', 'kiwify',
        'order_id', p_order_id,
        'plan_code', v_plan_code,
        'plan_name', v_plan_name
      ),
      v_now
    );

    -- Mark purchase as processed
    update public.pending_kiwify_purchases
       set processed = true
     where order_id = p_order_id;

    return jsonb_build_object(
      'ok', true,
      'status', 'processed_immediately',
      'mode', 'subscription',
      'orderId', p_order_id,
      'subscriptionId', v_subscription_id::text,
      'planCode', v_plan_code,
      'creditsGranted', v_plan_credits,
      'balanceAfter', v_balance
    );
  else
    return jsonb_build_object(
      'ok', true,
      'status', 'saved_for_later_registration',
      'orderId', p_order_id,
      'planCode', v_plan_code
    );
  end if;
end;
$$;


-- Update handle_new_user trigger to read Kiwify pricing properly
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_pending record;
  v_pending_asaas record;
  v_pending_hotmart record;
  v_plan_id uuid;
  v_plan_credits integer;
  v_subscription_id uuid;
  v_now timestamptz := now();
  v_period_end timestamptz := now() + interval '1 month';
  v_trial_end timestamptz := now() + interval '7 days';
  v_payment_value numeric;
  v_kiwify_amount numeric;
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

  -- A. Check if there is an unprocessed Hotmart purchase for this email (HIGHEST PRIORITY)
  select * into v_pending_hotmart
  from public.pending_hotmart_purchases
  where lower(email) = lower(new.email) and processed = false
  order by created_at desc
  limit 1;

  if v_pending_hotmart.id is not null then
    v_payment_value := (v_pending_hotmart.payload->'data'->'purchase'->'price'->>'value')::numeric;

    -- Get plan details based on price
    if v_payment_value >= 60.00 and v_payment_value <= 75.00 then
      select id, monthly_credits into v_plan_id, v_plan_credits
      from public.plans
      where code = 'perfil_comportamental' and active = true
      limit 1;
    elsif v_payment_value >= 90.00 and v_payment_value <= 180.00 then
      select id, monthly_credits into v_plan_id, v_plan_credits
      from public.plans
      where code = 'recrutamento_selecao' and active = true
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
      v_now,
      v_now
    )
    on conflict (user_id) do update
    set plan_id = excluded.plan_id,
        status = 'active',
        current_period_start = excluded.current_period_start,
        current_period_end = excluded.current_period_end,
        cancel_at_period_end = false,
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
      v_pending_hotmart.transaction_id,
      v_plan_credits,
      v_plan_credits,
      v_period_end,
      jsonb_build_object(
        'provider', 'hotmart',
        'transaction_id', v_pending_hotmart.transaction_id,
        'purchase_status', 'approved_at_signup',
        'is_external', true
      )
    );

    -- Recompute wallet balance
    perform public.recompute_credit_wallet(new.id);

    -- Mark purchase as processed
    update public.pending_hotmart_purchases
       set processed = true
     where id = v_pending_hotmart.id;
     
    return new;
  end if;

  -- B. Check if there is an unprocessed Asaas purchase for this email
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

  -- C. Check if there is an unprocessed Kiwify purchase for this email (FALLBACK)
  select * into v_pending
  from public.pending_kiwify_purchases
  where lower(email) = lower(new.email) and processed = false
  order by created_at desc
  limit 1;

  if v_pending.id is not null then
    v_kiwify_amount := coalesce((v_pending.payload->>'amount')::numeric, 0);

    -- Determine plan details based on price
    if v_kiwify_amount >= 6000 and v_kiwify_amount <= 7500 then
      select id, monthly_credits into v_plan_id, v_plan_credits
      from public.plans
      where code = 'perfil_comportamental' and active = true
      limit 1;
    elsif v_kiwify_amount >= 9000 and v_kiwify_amount <= 18000 then
      select id, monthly_credits into v_plan_id, v_plan_credits
      from public.plans
      where code = 'recrutamento_selecao' and active = true
      limit 1;
    else
      select id, monthly_credits into v_plan_id, v_plan_credits
      from public.plans
      where code = 'start' and active = true
      limit 1;
    end if;

    -- Create active subscription for Kiwify paid purchase
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
      new.id,
      v_plan_id,
      'active',
      v_now,
      v_period_end,
      false,
      v_now,
      v_now
    )
    on conflict (user_id) do update
    set plan_id = excluded.plan_id,
        status = 'active',
        current_period_start = excluded.current_period_start,
        current_period_end = excluded.current_period_end,
        cancel_at_period_end = false,
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
      v_pending.order_id,
      v_plan_credits,
      v_plan_credits,
      v_period_end,
      jsonb_build_object(
        'provider', 'kiwify',
        'order_id', v_pending.order_id,
        'purchase_status', 'approved_at_signup',
        'is_external', true
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
