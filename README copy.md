# env/

Per-environment config for the Signalor frontend.

## Files

- `local.env` — local dev values (gitignored)
- `staging.env` — staging values (gitignored)
- `production.env` — production values (gitignored)
- `example.env` — committed template; copy this to one of the above when bootstrapping a new machine

## How it works

`pnpm env:<name>` copies `env/<name>.env` to `.env.local` at the project root. Next.js then loads `.env.local` automatically — no Next config changes, no extra runtime deps.

```sh
# Switch to local
pnpm env:local
pnpm dev

# Switch to staging values for a one-off test
pnpm env:staging
pnpm dev

# Back to local
pnpm env:local
```

The active env is whatever was last copied. The generated `.env.local` is also gitignored.

## Adding a new variable

1. Add the key to `example.env` with a placeholder + comment.
2. Add the key to each of `local.env` / `staging.env` / `production.env` with the right value per environment.
3. Run `pnpm env:<current>` to refresh `.env.local`.
