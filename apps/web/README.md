# `@velios/web`

Wave 1 UI: landing, Home, setup, authorize, activity, organization, proof, result, Privacy Inspector.

Two entry paths: operate your own organization, or inspect the public Preview organization. Guided setup creates an encrypted operator vault, deploys the org, then configures a private policy. Authorization records a verified result; it does not transfer funds. Browser proving on `:4177` goes through `/proof-server` (local `proof-server:8.1.0`). The hosted Vercel UI uses the wallet Proof Station when the connector exposes `getProvingProvider`. Hosted 1AM HTTP provers are rejected. Operator state is stored encrypted at rest and keyed by network + contract.

```bash
pnpm --filter @velios/web dev
```

Authorization is real only after Midnight `SucceedEntirely`. Missing stack → environment missing, never a fake success.
