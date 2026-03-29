create or replace function public.process_asaas_webhook(
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
  v_inserted_id uuid;
begin
  insert into public.webhook_events (
    provider,
    event_id,
    event_type,
    payload,
    processing_status,
    processed_at,
    created_at
  )
  values (
    'asaas',
    p_event_id,
    p_event_type,
    coalesce(p_payload, '{}'::jsonb),
    'processed',
    now(),
    now()
  )
  on conflict (event_id) do nothing
  returning id into v_inserted_id;

  if v_inserted_id is null then
    return jsonb_build_object(
      'ok', true,
      'duplicated', true,
      'eventId', p_event_id
    );
  end if;

  return jsonb_build_object(
    'ok', true,
    'captured', true,
    'eventId', p_event_id
  );
end;
$$;

revoke all on function public.process_asaas_webhook(text, text, jsonb) from public;
grant execute on function public.process_asaas_webhook(text, text, jsonb) to anon, authenticated;
