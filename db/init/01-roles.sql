create role authenticator noinherit login password 'mysecretpassword';

create role anonymous nologin;
create role authenticated nologin;

grant anonymous, authenticated to authenticator;
