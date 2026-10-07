alter default privileges revoke execute on functions from public;

create schema extensions;
create extension pgcrypto with schema extensions;

create schema auth;

create schema api;
grant usage on schema api to anonymous, authenticated;
