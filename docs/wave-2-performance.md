# Wave 2 performance notes

- Wave 1 authorization compile remains ~3 minutes for 8 impure circuits.
- Token and Merkle spikes compiled in seconds on Compact 0.31.1.
- The composed `economy.compact` has 12 impure circuits. Split only if measured proof time or artifact size requires it and a cross-contract spike is verified.
- Browser proving uses the wallet Proof Station when available, otherwise the local proof server. Do not send witnesses to hosted 1AM HTTP provers.
