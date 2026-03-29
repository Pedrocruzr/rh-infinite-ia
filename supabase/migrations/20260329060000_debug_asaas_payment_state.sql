create or replace function public.get_asaas_payment_state_debug(
  p_payment_id text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
  v_is_owner boolean;
  v_subscription jsonb;
  v_wallet jsonb;
  v_tx_count integer := 0;
  v_transactions jsonb := '[]'::jsonb;
begin
  v_uid := auth.uid();

  if v_uid is null then
    raise exception 'NOT_AUTHENTICATED';
  end if;

  select exists(
    select 1
    from public.profiles
    where id = v_uid
      and lower(coalesce(app_role, '')) = 'owner'
  )
  into v_is_owner;

  if not v_is_owner then
    raise exception 'FORBIDDEN';
  end if;

  select jsonb_build_object(
    'id', s.id,
    'status', s.status,
    'plan_id', s.plan_id,
    'current_period_start', s.current_period_start,
    'current_period_end', s.current_period_end,
    'updated_at', s.updated_at,
    'plan', jsonb_build_object(
      'id', p.id,
      'code', p.code,
      'name', p.name,
      'monthly_credits', p.monthly_credits
    )
  )
  into v_subscription
  from public.subscriptions s
  left join public.plans p on p.id = s.plan_id
  where s.user_id = v_uid
  order by s.created_at desc
  limit 1;

  select jsonb_build_object(
    'user_id', w.user_id,
    'balance', w.balance,
    'updated_at', w.updated_at
  )
  into v_wallet
  from public.credit_wallets w
  where w.user_id = v_uid;

  select count(*)
  into v_tx_count
  from public.credit_transactions ct
  where ct.user_id = v_uid
    and ct.source_type = 'asaas_payment'
    and ct.source_id = p_payment_id;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', ct.id,
        'delta', ct.delta,
        'balance_after', ct.balance_after,
        'transaction_type', ct.transaction_type,
        'source_type', ct.source_type,
        'source_id', ct.source_id,
        'description', ct.description,
        'metadata', ct.metadata,
        'created_at', ct.created_at
      )
      order by ct.created_at desc
    ),
    '[]'::jsonb
  )
  into v_transactions
  from public.credit_transactions ct
  where ct.user_id = v_uid
    and ct.source_type = 'asaas_payment'
    and ct.source_id = p_payment_id;

  return jsonb_build_object(
    'payment_id', p_payment_id,
    'subscription', v_subscription,
    'wallet', v_wallet,
    'payment_transaction_count', v_tx_count,
    'transactions', v_transactions
  );
end;
$$;

revoke all on function public.get_asaas_payment_state_debug(text) from public;
grant execute on function public.get_asaas_payment_state_debug(text) to authenticated;
