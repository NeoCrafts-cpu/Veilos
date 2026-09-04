# Wave 2 Migration

1. Freeze the Wave 1 contract. Do not mutate existing spend or policy openings.
2. Deploy `economy.compact` for new organizations.
3. Operator vault v2 already stores `{ state, journal }`. Economy credentials are a separate encrypted store.
4. Re-issue organization credentials; Wave 1 `credentialOk` is not accepted.
5. Existing Preview Wave 1 authorizations are not automatically settleable.
