# AGENTS.md

## Toolchain

pnpm manages packages, and `pnpm-lock.yaml` is the only lockfile.

mise pins the Node and pnpm versions in `mise.toml`. Non-interactive shells skip mise activation, so a bare `pnpm` resolves to whatever global version is on `PATH`. Prefix every pnpm command with `mise exec --` to run the pinned versions:

```sh
mise exec -- pnpm install
```
