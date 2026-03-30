alter table public.subscriptions
  add column if not exists asaas_customer_id text,
  add column if not exists asaas_subscription_id text unique;

alter table public.topup_products
  add column if not exists expires_in_days integer not null default 30;

create table if not exists public.credit_grants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  source_type text not null
    check (source_type in ('subscription_cycle', 'topup')),
  source_id text not null,
  total_credits integer not null check (total_credits > 0),
  remaining_credits integer not null check (remaining_credits >= 0),
  expires_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (source_type, source_id)
);

create index if not exists credit_grants_user_id_idx
  on public.credit_grants(user_id);

create index if not exists credit_grants_expires_at_idx
  on public.credit_grants(expires_at);

alter table public.credit_grants enable row level security;

drop policy if exists "credit_grants_select_own" on public.credit_grants;
create policy "credit_grants_select_own"
on public.credit_grants
for select
to authenticated
using (auth.uid() = user_id);

create or replace function public.recompute_credit_wallet(p_user_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance integer := 0;
begin
  select coalesce(sum(remaining_credits), 0)
    into v_balance
  from public.credit_grants
  where user_id = p_user_id
    and remaining_credits > 0
    and (expires_at is null or expires_at > now());

  insert into public.credit_wallets (user_id, balance, updated_at)
  values (p_user_id, v_balance, now())
  on conflict (user_id) do update
    set balance = excluded.balance,
        updated_at = excluded.updated_at;

  return v_balance;
end;
$$;

create or replace function public.apply_usage_event_credits()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_needed integer;
  v_remaining integer;
  v_grant record;
  v_balance integer;
begin
  if new.credits_delta >= 0 then
    return new;
  end if;

  v_needed := abs(new.credits_delta);

  perform public.recompute_credit_wallet(new.user_id);

  select coalesce(balance, 0)
    into v_balance
  from public.credit_wallets
  where user_id = new.user_id;

  if coalesce(v_balance, 0) < v_needed then
    raise exception 'INSUFFICIENT_CREDITS';
  end if;

  v_remaining := v_needed;

  for v_grant in
    select id, remaining_credits
    from public.credit_grants
    where user_id = new.user_id
      and remaining_credits > 0
      and (expires_at is null or expires_at > now())
    order by expires_at asc nulls last, created_at asc
  loop
    exit when v_remaining <= 0;

    if v_grant.remaining_credits <= v_remaining then
      update public.credit_grants
         set remaining_credits = 0
       where id = v_grant.id;

      v_remaining := v_remaining - v_grant.remaining_credits;
    else
      update public.credit_grants
         set remaining_credits = remaining_credits - v_remaining
       where id = v_grant.id;

      v_remaining := 0;
    end if;
  end loop;

  v_balance := public.recompute_credit_wallet(new.user_id);

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
    new.user_id,
    new.credits_delta,
    v_balance,
    'agent_usage',
    'usage_event',
    new.id::text,
    'Consumo de créditos por execução de agente',
    jsonb_build_object(
      'usage_event_id', new.id,
      'agent_id', new.agent_id,
      'agent_run_id', new.agent_run_id,
      'event_type', new.event_type
    ),
    now()
  )
  on conflict do nothing;

  return new;
end;
$$;

drop trigger if exists trg_usage_events_apply_credits on public.usage_events;
create trigger trg_usage_events_apply_credits
after insert on public.usage_events
for each row execute function public.apply_usage_event_credits();

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
begin
  if p_event_type not in ('PAYMENT_CONFIRMED', 'PAYMENT_RECEIVED') then
    return jsonb_build_object('ok', true, 'ignored', true, 'reason', 'event_not_actionable');
  end if;

  if v_payment_id is null then
    raise exception 'ASAAS_PAYMENT_ID_MISSING';
  end if;

  if exists (
    select 1
    from public.credit_transactions
    where source_type = 'asaas_payment'
      and source_id = v_payment_id
  ) then
    return jsonb_build_object('ok', true, 'duplicated', true, 'paymentId', v_payment_id);
  end if;

  if v_payment_subscription_id is not null then
    select s.id, s.user_id, s.plan_id, p.code, p.name, p.monthly_credits
      into v_subscription_id, v_user_id, v_plan_id, v_plan_code, v_plan_name, v_plan_credits
    from public.subscriptions s
    left join public.plans p on p.id = s.plan_id
    where s.asaas_subscription_id = v_payment_subscription_id
    limit 1;

    if v_subscription_id is null then
      raise exception 'ASAAS_SUBSCRIPTION_NOT_FOUND';
    end if;

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
      'topup',
      'asaas_payment',
      v_payment_id,
      format('Créditos extras liberados via Asaas: %s', v_topup_name),
      jsonb_build_object(
        'provider', 'asaas',
        'event_id', p_event_id,
        'event_type', p_event_type,
        'payment_id', v_payment_id,
        'topup_code', v_topup_code,
        'topup_name', v_topup_name,
        'expires_in_days', v_topup_days
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

  if v_external_reference like 'rhia|%' then
    return jsonb_build_object(
      'ok', true,
      'ignored', true,
      'reason', 'legacy_reference',
      'paymentId', v_payment_id
    );
  end if;

  raise exception 'ASAAS_REFERENCE_NOT_SUPPORTED';
end;
$$;

revoke all on function public.recompute_credit_wallet(uuid) from public;
grant execute on function public.recompute_credit_wallet(uuid) to anon, authenticated;

revoke all on function public.process_asaas_payment_event(text, text, jsonb) from public;
grant execute on function public.process_asaas_payment_event(text, text, jsonb) to anon, authenticated;

update public.plans
   set active = false,
       updated_at = now()
 where code <> 'start';

insert into public.plans (
  code, name, description, price_cents, billing_interval, monthly_credits, max_users, active
)
values (
  'start',
  'Start',
  'Assinatura mensal recorrente',
  19700,
  'month',
  120,
  1,
  true
)
on conflict (code) do update
set
  name = excluded.name,
  description = excluded.description,
  price_cents = excluded.price_cents,
  billing_interval = excluded.billing_interval,
  monthly_credits = excluded.monthly_credits,
  max_users = excluded.max_users,
  active = excluded.active,
  updated_at = now();

update public.topup_products
   set active = false,
       updated_at = now()
 where code not in ('topup_essencial', 'topup_profissional', 'topup_intensivo');

insert into public.topup_products (
  code, name, credits, price_cents, expires_in_days, active
)
values
  ('topup_essencial', 'Essencial', 20, 3900, 30, true),
  ('topup_profissional', 'Profissional', 50, 6900, 30, true),
  ('topup_intensivo', 'Intensivo', 90, 9900, 30, true)
on conflict (code) do update
set
  name = excluded.name,
  credits = excluded.credits,
  price_cents = excluded.price_cents,
  expires_in_days = excluded.expires_in_days,
  active = excluded.active,
  updated_at = now();
