# `@velios/credentials`

Organization-issued private credentials are the Wave 2 reference implementation.

- Issuer inserts a credential commitment.
- Holder proves class, organization binding, expiry, and non-revocation.
- Credential bodies stay in an AES-GCM store.
- Official Midnight VC packages stay behind an experimental adapter until MidnightJS 4.1.1 compatibility is proven.
