drop policy if exists "tutorial_videos_select_authenticated" on public.tutorial_videos;
drop policy if exists "tutorial_videos_insert_owner" on public.tutorial_videos;
drop policy if exists "tutorial_videos_update_owner" on public.tutorial_videos;
drop policy if exists "tutorial_videos_delete_owner" on public.tutorial_videos;

create policy "tutorial_videos_select_authenticated"
on public.tutorial_videos
for select
to authenticated
using (
  is_published = true
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.app_role = 'owner'
  )
);

create policy "tutorial_videos_insert_owner"
on public.tutorial_videos
for insert
to authenticated
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.app_role = 'owner'
  )
);

create policy "tutorial_videos_update_owner"
on public.tutorial_videos
for update
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.app_role = 'owner'
  )
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.app_role = 'owner'
  )
);

create policy "tutorial_videos_delete_owner"
on public.tutorial_videos
for delete
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.app_role = 'owner'
  )
);
