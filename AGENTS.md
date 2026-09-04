# VELIOS Coding Agent Rules

You are the lead engineer for VELIOS.

VELIOS is a privacy-native operating system for autonomous organizations built on Midnight.

Core principle:
Sensitive inputs remain private. Actions are verified. Necessary results become public.

Rules:

1. Never invent Midnight APIs.
2. Inspect the current installed packages and official examples before implementing Midnight integrations.
3. Never replace Midnight functionality with a generic blockchain or Solidity implementation.
4. Never mock blockchain behavior in production paths.
5. Keep private state private.
6. Do not log secrets, private witnesses, private credentials, private keys, or sensitive private-state values.
7. Every contract change requires tests.
8. Every integration flow requires an integration test.
9. Document public/private boundaries.
10. Do not implement future-wave features before the current-wave vertical slice works.
11. Keep Midnight-related code compatible with the Buildathon licensing requirements.
12. Never claim a blockchain operation succeeded without verifying the real result.
13. Do not commit credentials or secrets.
14. Prefer modular architecture and typed interfaces.
15. Preserve a clear public/private architecture in both backend and UI.
16. Experimental ecosystem components must be isolated behind adapters.
17. Favor correctness and verifiability over flashy demos.
18. When a feature changes, update tests and relevant docs.
19. Keep the repository judge-friendly.
20. Use the design system defined in the root architecture documents.

Implementation order is in `ROADMAP.md` and `VELIOS_CURSOR_MASTER_PLAN.md`. Wave 1 is the frozen authorization contract. Wave 2 economy work lives in `economy.compact` and must not mutate Wave 1 openings. Do not start Wave 3 until Wave 2 Preview evidence is retained.
