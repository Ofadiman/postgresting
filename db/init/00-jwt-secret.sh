#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

psql --variable=ON_ERROR_STOP=1 --username="$POSTGRES_USER" --dbname="$POSTGRES_DB" \
  --set=database="$POSTGRES_DB" --set=jwt_secret="$JWT_SECRET" <<'SQL'
alter database :"database" set app.jwt_secret to :'jwt_secret';
SQL
