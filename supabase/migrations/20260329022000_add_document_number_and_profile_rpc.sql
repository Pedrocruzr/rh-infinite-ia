alter table public.profiles
add column if not exists document_number text;

create or replace function public.upsert_my_profile(
  p_email text,
  p_full_name text,
  p_avatar_url text,
  p_document_number text
)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
  v_row public.profiles;
begin
  v_uid := auth.uid();

  if v_uid is null then
    raise exception 'NOT_AUTHENTICATED';
  end if;

  insert into public.profiles (
    id,
    email,
    full_name,
    avatar_url,
    document_number,
    updated_at
  )
  values (
    v_uid,
    nullif(trim(p_email), ''),
    nullif(trim(p_full_name), ''),
    nullif(trim(p_avatar_url), ''),
    nullif(trim(p_document_number), ''),
    now()
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = excluded.full_name,
        avatar_url = excluded.avatar_url,
        document_number = excluded.document_number,
        updated_at = now()
  returning * into v_row;

  return v_row;
end;
$$;

revoke all on function public.upsert_my_profile(text, text, text, text) from public;
grant execute on function public.upsert_my_profile(text, text, text, text) to authenticated;
