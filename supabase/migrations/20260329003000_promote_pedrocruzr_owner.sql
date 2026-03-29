do $$
declare
  v_count integer;
begin
  update public.profiles
     set app_role = 'owner'
   where lower(email) = lower('pedrocruzr@gmail.com');

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RAISE NOTICE 'OWNER_ROWS_UPDATED=%', v_count;
end
$$;
