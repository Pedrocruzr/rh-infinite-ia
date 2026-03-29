create or replace function public.get_latest_asaas_webhook_debug()
returns table (
  event_id text,
  event_type text,
  payload jsonb,
  processed_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
  v_is_owner boolean;
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

  return query
  select
    we.event_id,
    we.event_type,
    we.payload,
    we.processed_at
  from public.webhook_events we
  where we.provider = 'asaas'
  order by coalesce(we.processed_at, we.created_at) desc
  limit 1;
end;
$$;

revoke all on function public.get_latest_asaas_webhook_debug() from public;
grant execute on function public.get_latest_asaas_webhook_debug() to authenticated;
