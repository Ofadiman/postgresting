# Postgresting

Postgresting is a learning project for understanding how [PostgREST](https://postgrest.org) works at a high level and how to integrate it with a frontend application.

It pairs a Postgres database, whose `api` schema PostgREST turns into a REST API, with a React app that calls that API from the browser. The feature it implements is username and password authentication: Postgres hashes passwords and signs JWTs itself, and the app has register and sign-in pages behind which a route guard protects the home page.

## How it fits together

`compose.yaml` runs three services, each published on `127.0.0.1` only:

| Service | Image                       | Port  | What it runs                                                |
| ------- | --------------------------- | ----- | ----------------------------------------------------------- |
| `db`    | `postgres:18.6`             | 25432 | Postgres, set up on first start by the scripts in `db/init` |
| `api`   | `postgrest/postgrest:v16.4` | 25000 | PostgREST, serving the `api` schema                         |
| `web`   | built from `Dockerfile`     | 25173 | The React Router dev server                                 |

PostgREST connects to Postgres as the `authenticator` role and switches roles for every request: to `anonymous` when the request carries no JWT, or to the role named in the token's `role` claim. Only objects in the `api` schema are reachable through the API. The `auth` schema keeps the users table and helper functions out of it, and the `extensions` schema holds `pgcrypto`. `db/init/02-schemas.sql` revokes the default execute privilege on new functions from `public`, so every function in `api` needs an explicit grant.

The React app renders only on the client (`ssr: false`) and sends its requests straight to PostgREST at `http://127.0.0.1:25000`.

## Features

### Authentication in Postgres

`db/init/03-auth.sql` defines two functions that PostgREST exposes as RPC endpoints. Both run as `security definer` so they can read and write `auth.users`, and both answer any method other than POST with 405, which keeps credentials in the request body.

- `POST /rpc/signup` lowercases the username and requires 3 to 32 letters, digits, or underscores. The password needs at least 8 characters and at most 72 bytes, the most bcrypt will hash. The function stores a bcrypt hash of the password and responds with 201 and a token. A taken username returns 409, and invalid input returns 400 with a hint that states the rule.
- `POST /rpc/login` checks the password against the stored hash and returns a token, or 401 with "Invalid username or password".

The functions raise custom `PTxxx` SQLSTATE codes, which PostgREST turns into the matching HTTP status.

Postgres signs the tokens itself. `auth.sign_jwt` builds an HS256 JWT with `pgcrypto`'s `hmac()` and the secret in the `app.jwt_secret` database setting. `db/init/00-jwt-secret.sh` writes that setting from the same secret Compose passes to PostgREST as `PGRST_JWT_SECRET`, so PostgREST accepts the tokens. Each token carries `role: authenticated`, the user id as `sub`, `iat`, and an `exp` one hour after issue.

### Frontend

The app uses React Router 8 in SPA mode, Material UI for components, TanStack Query for requests, React Hook Form with Zod for forms, and `@supabase/postgrest-js` as the PostgREST client.

`app/api.ts` creates the client and types it with `app/database.types.ts`, which the Supabase CLI generates from the `api` schema. That gives calls such as `api.rpc("signup", args)` checked argument and return types.

- `/register` asks for a username, a password, and a password confirmation. Zod checks the database's rules before the request goes out, counting password length in characters and measuring the 72-byte limit with `TextEncoder`. A 400 or 409 from PostgREST appears under the field it concerns.
- `/sign-in` asks for a username and password and shows a 401 as an alert above the form.
- Both forms save the token in `localStorage` and navigate to `/` on success. Any other error reaches the route error boundary.
- `/` sits inside a protected layout whose `clientLoader` decodes the stored token with `jose` and redirects to `/sign-in` when the token is missing, malformed, has no `exp`, or has expired. The home page has a sign-out button that removes the token.

The loader decodes the token without verifying its signature. No endpoint in the `api` schema requires the `authenticated` role, and the app does not send the token with any request.

Components follow the file layout described in `AGENTS.md`.

### Tests

The tests run in Vitest browser mode through Playwright, on Chromium, Firefox, and WebKit. Mock Service Worker intercepts PostgREST requests inside the browser, and a request without a handler fails the test. Istanbul measures coverage. Test files sit next to the code they cover.

## Running locally

You need Docker with Compose, and [mise](https://mise.jdx.dev) for the commands that run on the host.

Start the three services and sync `app` and `public` into the `web` container as you edit:

```sh
docker compose up --watch
```

The app is at http://127.0.0.1:25173 and PostgREST at http://127.0.0.1:25000.

Postgres runs the `db/init` scripts only while the `pgdata` volume is empty. After changing them, remove the volume and start again:

```sh
docker compose down --volumes
docker compose up --watch
```

Host commands go through `mise exec` so they use the Node and pnpm versions pinned in `mise.toml`:

| Command                                     | What it does                                                       |
| ------------------------------------------- | ------------------------------------------------------------------ |
| `mise exec -- pnpm install`                 | Installs dependencies                                              |
| `mise exec -- pnpm exec playwright install` | Downloads the browsers the tests run in                            |
| `mise exec -- pnpm test`                    | Runs the tests in watch mode                                       |
| `mise exec -- pnpm test:coverage`           | Runs the tests once and writes a coverage report to `coverage/`    |
| `mise exec -- pnpm typescript:check`        | Generates React Router route types and type checks the project     |
| `mise exec -- pnpm database:types`          | Regenerates `app/database.types.ts` from the running database      |

The passwords and JWT secret in `compose.yaml` and `db/init` are placeholders for local development.
