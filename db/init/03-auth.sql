create table auth.users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique check (username ~ '^[a-z0-9_]{3,32}$'),
  password_hash text not null,
  created_at timestamptz not null default now()
);

create function auth.base64url(data bytea) returns text
language sql immutable
set search_path = ''
as $$
  select translate(encode(data, 'base64'), E'+/=\n', '-_');
$$;

create function auth.sign_jwt(payload json) returns text
language sql stable
set search_path = ''
as $$
  with signing_input as (
    select auth.base64url(convert_to('{"alg":"HS256","typ":"JWT"}', 'utf8'))
      || '.' || auth.base64url(convert_to(payload::text, 'utf8')) as value
  )
  select value || '.' || auth.base64url(extensions.hmac(value, current_setting('app.jwt_secret'), 'sha256'))
  from signing_input;
$$;

create function auth.issue_token(user_id uuid) returns text
language sql stable
set search_path = ''
as $$
  select auth.sign_jwt(json_build_object(
    'role', 'authenticated',
    'sub', user_id,
    'iat', extract(epoch from now())::integer,
    'exp', extract(epoch from now() + interval '1 hour')::integer
  ));
$$;

create function auth.require_post() returns void
language plpgsql stable
set search_path = ''
as $$
begin
  if current_setting('request.method', true) <> 'POST' then
    raise sqlstate 'PT405' using
      message = 'Method not allowed',
      hint = 'Send credentials in a POST request body.';
  end if;
end;
$$;

create function api.signup(username text, password text) returns table (token text)
language plpgsql security definer
set search_path = ''
as $$
declare
  normalized_username text := lower(signup.username);
  new_user_id uuid;
begin
  perform auth.require_post();

  if coalesce(normalized_username, '') !~ '^[a-z0-9_]{3,32}$' then
    raise sqlstate 'PT400' using
      message = 'Invalid username',
      hint = 'Use 3 to 32 letters, digits, or underscores.';
  end if;

  if signup.password is null or length(signup.password) < 8 or octet_length(signup.password) > 72 then
    raise sqlstate 'PT400' using
      message = 'Invalid password',
      hint = 'Use at least 8 characters and at most 72 bytes.';
  end if;

  insert into auth.users (username, password_hash)
  values (normalized_username, extensions.crypt(signup.password, extensions.gen_salt('bf', 10)))
  returning id into new_user_id;

  perform set_config('response.status', '201', true);
  return query select auth.issue_token(new_user_id);
exception
  when unique_violation then
    raise sqlstate 'PT409' using message = 'Username is already taken';
end;
$$;

create function api.login(username text, password text) returns table (token text)
language plpgsql security definer
set search_path = ''
as $$
declare
  user_id uuid;
begin
  perform auth.require_post();

  select u.id into user_id
  from auth.users u
  where u.username = lower(login.username)
    and u.password_hash = extensions.crypt(login.password, u.password_hash);

  if user_id is null then
    raise sqlstate 'PT401' using message = 'Invalid username or password';
  end if;

  return query select auth.issue_token(user_id);
end;
$$;

grant execute on function api.signup(text, text) to anonymous, authenticated;
grant execute on function api.login(text, text) to anonymous, authenticated;
