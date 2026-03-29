alter table public.profiles
add column if not exists app_role text not null default 'user';

alter table public.profiles
drop constraint if exists profiles_app_role_check;

alter table public.profiles
add constraint profiles_app_role_check
check (app_role in ('user', 'owner'));
