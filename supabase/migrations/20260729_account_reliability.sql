alter table public.profiles add column if not exists avatar_url text;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
begin
  insert into public.profiles(id,first_name,last_name,display_name,avatar_url,updated_at)
  values(
    new.id,
    nullif(new.raw_user_meta_data->>'first_name',''),
    nullif(new.raw_user_meta_data->>'last_name',''),
    coalesce(nullif(new.raw_user_meta_data->>'display_name',''),nullif(new.raw_user_meta_data->>'fullName','')),
    nullif(new.raw_user_meta_data->>'avatar_url',''),
    now()
  )
  on conflict(id) do update set
    first_name=coalesce(excluded.first_name,public.profiles.first_name),
    last_name=coalesce(excluded.last_name,public.profiles.last_name),
    display_name=coalesce(excluded.display_name,public.profiles.display_name),
    avatar_url=coalesce(excluded.avatar_url,public.profiles.avatar_url),
    updated_at=now();
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
