create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (id) do nothing;

  insert into public.credit_wallets (user_id, balance)
  values (new.id, 0)
  on conflict (user_id) do nothing;

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
    new.id,
    'topup',
    'welcome:' || new.id::text,
    20,
    20,
    null,
    jsonb_build_object(
      'reason', 'welcome_credits',
      'granted_at_signup', true
    )
  )
  on conflict (source_type, source_id) do nothing;

  perform public.recompute_credit_wallet(new.id);

  return new;
end;
$$;
