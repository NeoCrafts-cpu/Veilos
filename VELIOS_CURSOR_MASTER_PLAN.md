# VELIOS — Cursor Master Implementation Plan

> **Project:** VELIOS
> 
> **Positioning:** Privacy-native operating system for autonomous organizations
> 
> **Tagline:** **Humans define the rules. Agents execute them. Midnight proves they were followed.**
> 
> **Design direction:** Neo-brutalist Web3 interface inspired by the supplied XCHANGE reference, using the Midnight visual language: black, off-white, electric blue, with lime/red reserved for state indicators.
> 
> **Primary implementation environment:** Cursor + Grok 4.6, with WSL2 Ubuntu for project/runtime tooling.

---

## 0. IMPORTANT INSTRUCTIONS FOR THE AI CODING AGENT

You are the lead engineer for VELIOS.

VELIOS is a privacy-native operating system for autonomous organizations built on the Midnight Network.

The product principle is:

> Sensitive inputs remain private. Actions are verified through Compact/ZK logic. Only necessary results, commitments, and settlement information become public.

### Non-negotiable engineering rules

1. **Never invent Midnight APIs.**
2. Before implementing a Midnight integration, inspect the currently installed packages and official examples/docs available in the repository.
3. **Never mock blockchain behavior in production paths.** Mocks are acceptable only inside isolated unit tests where clearly labeled.
4. Do not silently substitute another blockchain, EVM contract, Solidity, or generic ZK framework for Midnight functionality.
5. Never expose private state in logs, URLs, analytics, error messages, browser storage, or frontend state unnecessarily.
6. Every Compact contract function must have tests.
7. Every end-to-end blockchain flow must have integration tests.
8. Every feature must explicitly document what is public and what is private.
9. Do not implement Wave 2 or Wave 3 functionality before the Wave 1 vertical slice works end-to-end.
10. Keep Midnight-related newly developed code compliant with the Buildathon's Apache 2.0 requirement.
11. Prefer small, composable modules over a giant contract.
12. Do not build tokenomics, NFTs, speculative features, or unrelated social features.
13. Do not use placeholder UI for a completed feature. A completed feature must connect to the real underlying functionality.
14. Keep the public/private boundary visible in the product UX.
15. Every major security/privacy assumption must be written down in `SECURITY.md` or the relevant architecture document.
16. If an ecosystem feature is immature or experimental, isolate it behind an adapter so core VELIOS functionality does not depend on it.
17. Never claim that a proof, transaction, credential, payment, or contract interaction succeeded unless the real underlying operation succeeded.
18. Never commit secrets, private keys, mnemonic phrases, API keys, wallet credentials, or production endpoints to the repository.
19. All scripts must be reproducible from a clean checkout.
20. Keep the repository understandable to a hackathon judge who has only the README and 10 minutes to inspect the code.

---

# 1. PRODUCT VISION

## 1.1 What is VELIOS?

VELIOS is a privacy operating system for autonomous organizations.

An organization can contain:

- human members
- AI agents
- private credentials
- private treasury state
- governance
- procurement
- credit
- permissions
- reputation
- payments
- compliance policies

The core concept is that the organization should not need to reveal sensitive internal information merely to prove that an action is valid.

Example:

An AI treasury agent requests a $4,800 supplier payment.

The public chain should not need to see:

- the agent's entire credential
- the exact internal spending policy
- the organization's private balance
- internal supplier metadata
- private authorization inputs

Instead, VELIOS proves the required predicates and exposes the resulting authorization/settlement outcome.

The fundamental flow is:

```text
PRIVATE INPUTS
      |
      v
PRIVATE STATE
      |
      v
POLICY / CONSTRAINTS
      |
      v
ZK PROOF / VERIFICATION
      |
      v
MIDNIGHT COMPACT CONTRACT
      |
      v
PUBLIC RESULT / SETTLEMENT
```

## 1.2 The core product statement

> Organizations should not have to choose between blockchain verifiability and business confidentiality.

## 1.3 The product's strongest narrative

> **Humans define the rules. Agents execute them. Midnight proves they were followed.**

## 1.4 The strongest demo sentence

> **The blockchain sees the proof. Not the secret.**

---

# 2. BUILDATHON STRATEGY

The Buildathon materials define a three-wave program and emphasize meaningful iteration. The supplied rules state that Engineering & Implementation carries 40% of judging weight; QA & Reliability 15%; Product & Vision 15%; UX & Design 15%; Communication 10%; Business Development & Viability 5%.

The technical gate requires at least one Compact contract that compiles successfully, meaningful Midnight functionality, a public repository, and the required submission artifacts.

## 2.1 Optimization strategy

Prioritize in this order:

1. Real Midnight integration.
2. Correct privacy/public-state architecture.
3. Compiling, tested Compact contracts.
4. Full end-to-end functionality without mocks.
5. Clear product narrative.
6. Strong UX and visual identity.
7. Advanced ecosystem integrations only after the core works.

## 2.2 Wave strategy

### Wave 1 — VELIOS CORE

Build the smallest complete vertical slice:

- organization
- identity/basic membership
- AI agent
- private authorization policy
- action request
- proof generation/verification
- Compact contract authorization
- real Midnight transaction
- public result
- tests
- privacy inspector

### Wave 2 — VELIOS ECONOMY

Expand into an organization platform:

- DID integration
- verifiable credentials
- treasury
- NIGHT/payment flows
- shielded operations where appropriate
- private governance
- private voting
- selective disclosure
- procurement
- auditor interface

### Wave 3 — VELIOS NETWORK

Turn it into a broader protocol/platform:

- private credit
- reputation
- escrow
- agent marketplace
- cross-chain execution through Effectstream where justified
- mobile flow using Kuira where justified
- public developer API / verifier tooling
- external auditor/verification flows

---

# 3. CORE VELIOS MODULES

## 3.1 Organization

Represents an autonomous organization.

Responsibilities:

- organization lifecycle
- organization identifier
- member authorization
- internal roles
- policy ownership
- contract references

Public examples:

- organization identifier
- active/inactive state
- creation metadata where safe

Private examples:

- internal role details
- private organizational attributes
- sensitive authorization data

## 3.2 Identity

Use Midnight-native identity capabilities where practical.

Target concepts:

- `did:midnight`
- private identity state
- organization membership
- role claims
- revocation-aware credentials

Do not hard-code assumptions about a specific current DID API. Inspect the exact version and reference implementation before coding.

## 3.3 Credentials

Use the Midnight credential ecosystem as an adapter rather than building an unrelated credential standard.

Potential credentials:

- CFO
- Procurement Manager
- Auditor
- Employee
- Vendor
- Investor
- Agent Operator

The application should prefer proving facts about a credential rather than dumping the credential contents into public state.

## 3.4 Agents

An agent is an autonomous actor with:

- identity
- owner/principal
- status
- permissions
- private policy
- allowed actions
- reputation (future)

Examples:

- Treasury Agent
- Procurement Agent
- Credit Agent
- Compliance Agent

## 3.5 Policy Engine

Each agent operates under a private authorization policy.

Possible policy attributes:

- per-action limit
- daily spend limit
- allowed vendors
- allowed categories
- operating hours
- geographic/network constraints if relevant
- required credential classes
- proposal approval requirements
- self-modification restriction

Not every policy value must be public.

The important design goal is to prove predicates such as:

```text
amount <= private_action_limit
AND
current_daily_spend + amount <= private_daily_limit
AND
agent_is_active
AND
credential_is_valid
AND
supplier_is_allowed
```

without unnecessarily disclosing the underlying private values.

## 3.6 Action System

Treat important agent operations as `Actions` rather than generic transactions.

Example:

```text
Action:
  type: PAYMENT
  agent: TREASURY-01
  recipient: supplier-8271
  amount: 4800
  reason: security-audit
```

Public result:

```text
Action ID
Proof commitment / verification result
Outcome
Timestamp
Settlement reference if applicable
```

Private inputs:

- private agent data
- exact private policy values
- private credentials
- private organizational state
- sensitive supplier data

## 3.7 Treasury

Wave 2+.

Capabilities:

- view private balance when permitted
- deposit
- withdrawal
- transfer
- payment
- escrow
- settlement
- authorization checks

Use Midnight's real payment/asset functionality where available and appropriate.

## 3.8 Governance

Wave 2+.

Capabilities:

- proposals
- private eligibility proof
- private voting
- quorum
- voting weights
- delegated voting
- policy changes

Example proposal:

```text
Increase Treasury Agent daily limit
$25,000 -> $50,000
```

The public result can show:

```text
YES: 78%
NO: 22%
QUORUM: SATISFIED
RESULT: PASSED
```

without exposing every private ballot.

## 3.9 Procurement

Wave 2+.

A private procurement flow can support:

- budget constraints
- delivery constraints
- vendor qualifications
- private bids
- private scoring
- winning proof

Example:

```text
Budget <= $10,000
Delivery <= 30 days
Qualification >= 80
```

The protocol verifies the constraints without exposing all competing bids.

## 3.10 Credit

Wave 3.

A credit module can prove predicates such as:

```text
income >= threshold
AND
debt_ratio <= threshold
AND
credit_score >= threshold
```

without exposing exact raw values.

Use the Midnight ZKLoan example as a technical reference where appropriate, but keep VELIOS's core authorization architecture independent of any experimental example component.

## 3.11 Reputation

Wave 3.

A user/vendor/agent should be able to prove:

```text
reputation >= 90
```

rather than publicly revealing the exact underlying score and all historical activity.

## 3.12 Escrow

Wave 3.

Conceptually:

```text
Buyer
  |
  v
Shielded / controlled funds
  |
  v
Vendor
  |
  v
Proof of delivery
  |
  v
Release
```

## 3.13 Cross-chain execution

Wave 3 only.

Potential architecture:

```text
VELIOS
  |
  | private authorization proof
  v
MIDNIGHT
  |
  | verified public instruction
  v
EFFECTSTREAM
  |
  +--> external chain
```

Midnight should act as the privacy/authorization layer rather than simply becoming another generic cross-chain wallet.

## 3.14 Mobile

Wave 3 only.

Potential flow:

```text
Desktop VELIOS
      |
      v
Sensitive approval request
      |
      v
Mobile signer
      |
      v
Private credential / proof
      |
      v
Midnight settlement
```

Use Kuira if and only if the current version provides the functionality required by the final product.

---

# 4. WAVE 1 SPECIFICATION — VELIOS CORE

## 4.1 Required vertical slice

The Wave 1 build is complete only when this works against a real Midnight environment:

```text
Connect wallet
   |
   v
Create / join organization
   |
   v
Create agent
   |
   v
Set private policy
   |
   v
Agent requests action
   |
   v
Build private witness / proof inputs
   |
   v
Verify in Compact / Midnight
   |
   v
Execute / authorize real transaction
   |
   v
Display public result
```

## 4.2 Wave 1 UI screens

### Screen A — Organization

```text
ACME AUTONOMOUS SYSTEMS

MEMBERS        12
AGENTS          4
TREASURY      PRIVATE
PROPOSALS       7

[ CREATE AGENT ]
```

### Screen B — Agent

```text
TREASURY-01

STATUS
ACTIVE

ROLE
Treasury Operator

PRIVATE POLICY

DAILY LIMIT
██████████

PER ACTION
██████████

APPROVED VENDORS
██████████

SELF MODIFY
NO

[ VIEW POLICY PROOF ]
```

### Screen C — Action request

```text
TREASURY-01
REQUEST PAYMENT

Recipient
supplier-8271

Amount
$4,800

Reason
Security audit

[ REQUEST AUTHORIZATION ]
```

### Screen D — Proof generation

```text
COLLECTING PRIVATE STATE
████████████████████

BUILDING WITNESS
████████████████████

GENERATING ZK PROOF
████████████████████

SUBMITTING TO MIDNIGHT
████████████████████
```

### Screen E — Result

```text
AUTHORIZED

✓ Agent authorized
✓ Credential valid
✓ Policy satisfied
✓ Amount permitted
✓ Supplier permitted

PUBLIC DATA
----------------------
ACTION ID
PROOF COMMITMENT
RESULT
TIMESTAMP

PRIVATE DATA
----------------------
████████████████
████████████████
████████████████
```

## 4.3 Failure demo

Wave 1 must also have a clear rejection scenario.

Example:

```text
Requested amount: $48,000
Private policy limit: $25,000
```

Result:

```text
PROOF REJECTED

POLICY VIOLATION
Requested amount exceeds
private authorization constraint.
```

Do not reveal the private policy value unless it is intentionally part of that user's disclosure context.

---

# 5. COMPACT CONTRACT DESIGN — CONCEPTUAL

Do not blindly copy these names into code. Use them as the intended domain model and adapt them to the current Compact syntax/API version.

## 5.1 Main domain entities

```text
Organization
Agent
PolicyCommitment
CredentialReference
Action
AuthorizationResult
```

## 5.2 Conceptual contract operations

```text
createOrganization()
registerMember()
createAgent()
setAgentPolicy()
requestAction()
authorizeAction()
rejectAction()
recordResult()
```

## 5.3 Public state candidates

```text
organizationId
organizationStatus
agentId
agentStatus
actionId
actionType
actionResult
timestamp
proof/result commitment
```

## 5.4 Private state candidates

```text
agent role
private policy values
credential details
sensitive organization attributes
private vendor details
private financial values
private authorization inputs
```

## 5.5 Authorization predicate example

Conceptually:

```text
agent exists
AND agent is active
AND credential is valid
AND requested amount <= private limit
AND daily total + requested amount <= private daily limit
AND requested vendor satisfies private allow-list rule
AND action has not been executed previously
```

The exact implementation must follow the currently supported Compact primitives and Midnight execution model.

---

# 6. DATA PRIVACY MODEL

Create a formal `docs/privacy-model.md`.

## 6.1 Private information

VELIOS should treat the following as private by default:

- private role information
- policy values
- raw credential contents
- exact private balance where not intended for public disclosure
- individual governance ballots
- private vendor bids
- private agent authorization inputs
- financial history
- internal business metadata

## 6.2 Public information

Potentially public:

- action existence
- proof/commitment reference
- verification result
- contract state needed for public verification
- settlement event
- proposal outcome
- credential verification outcome, not necessarily credential contents

## 6.3 Privacy Inspector

A core screen should visually show:

```text
                    VELIOS PRIVACY INSPECTOR

PRIVATE INPUTS                 PUBLIC OUTPUT
--------------                 -------------
Agent role       ███████        Action ID       0x8291
Spending limit   ███████        Result          VERIFIED
Treasury state  ███████        Contract        0x92AF
Credential       ███████        Timestamp       ...
Vendor profile   ███████        Proof           VALID

              PRIVATE -> PROOF -> PUBLIC
```

This UI is not decorative. It is an educational component that explains the Midnight design.

---

# 7. THREAT MODEL

Create `docs/threat-model.md`.

Minimum threat categories:

1. Unauthorized agent action.
2. Excessive spending.
3. Expired credential.
4. Revoked credential.
5. Wrong organization.
6. Wrong agent.
7. Replay / duplicate action.
8. Tampered private witness.
9. Forged commitment.
10. Unauthorized policy modification.
11. Private-state leakage through frontend logs.
12. Private-state leakage through URL/query parameters.
13. Private-state leakage through analytics.
14. Malicious vendor/supplier input.
15. Frontend falsely displaying success when the transaction failed.
16. Stale indexer state being presented as final truth.
17. Partial transaction / asynchronous state mismatch.
18. Experimental Midnight ecosystem integration becoming a single point of failure.

Every threat should have:

```text
Threat
Impact
Mitigation
Test
Residual risk
```

---

# 8. TEST STRATEGY

Testing is a major scoring category, so treat it as part of the product.

## 8.1 Unit tests

Test:

- domain validation
- policy predicates
- serialization
- state transitions
- edge conditions

## 8.2 Compact contract tests

Minimum cases:

| Scenario | Expected |
|---|---|
| Valid action | PASS |
| Amount above limit | REJECT |
| Inactive agent | REJECT |
| Invalid credential | REJECT |
| Expired credential | REJECT |
| Wrong organization | REJECT |
| Duplicate action | REJECT |
| Replay attempt | REJECT |
| Modified witness | REJECT |
| Valid governance vote | PASS |
| Double vote | REJECT |
| Unauthorized policy change | REJECT |

## 8.3 Integration tests

The test environment should exercise:

```text
Frontend
 -> wallet
 -> proof provider
 -> Compact contract
 -> network
 -> indexer
 -> UI state update
```

## 8.4 E2E tests

At minimum:

1. Create organization.
2. Create agent.
3. Configure policy.
4. Request permitted payment.
5. Verify proof.
6. Execute transaction.
7. Confirm public result.
8. Request prohibited payment.
9. Confirm proof rejection.
10. Confirm UI correctly reflects rejection.

## 8.5 Privacy regression tests

Ensure that private values do not accidentally appear in:

- console logs
- error messages
- URL parameters
- Redux/Zustand state when not necessary
- query strings
- localStorage unless explicitly justified
- telemetry
- public event payloads

---

# 9. REPOSITORY STRUCTURE

Recommended monorepo:

```text
velios/
|
+-- apps/
|   +-- web/
|       +-- app/
|       +-- components/
|       +-- features/
|       +-- hooks/
|       +-- lib/
|
+-- packages/
|   +-- contracts/
|   |   +-- organization/
|   |   +-- identity/
|   |   +-- credentials/
|   |   +-- policies/
|   |   +-- agents/
|   |   +-- treasury/
|   |   +-- governance/
|   |   +-- procurement/
|   |   +-- credit/
|   |
|   +-- midnight/
|   |   +-- providers/
|   |   +-- wallet/
|   |   +-- proof/
|   |   +-- indexer/
|   |   +-- network/
|   |
|   +-- identity/
|   +-- credentials/
|   +-- policy-engine/
|   +-- shared-types/
|   +-- ui/
|
+-- tests/
|   +-- contracts/
|   +-- integration/
|   +-- privacy/
|   +-- e2e/
|
+-- scripts/
|   +-- local-dev/
|   +-- deploy/
|   +-- seed/
|
+-- docs/
|   +-- architecture.md
|   +-- privacy-model.md
|   +-- threat-model.md
|   +-- contract-spec.md
|   +-- wave-progress.md
|
+-- README.md
+-- AGENTS.md
+-- MIDNIGHT.md
+-- SECURITY.md
+-- ROADMAP.md
```

Keep the structure understandable to judges.

---

# 10. FRONTEND DESIGN SYSTEM

## 10.1 Design target

The supplied visual reference is a neo-brutalist Web3 exchange/marketplace interface.

VELIOS should borrow the visual language, not copy the layout or assets.

Design characteristics:

- thick borders
- hard rectangular cards
- hard shadows
- oversized typography
- asymmetric modular grid
- technical window-like panels
- dense information display
- monochrome base
- strong electric accent color
- status labels
- little terminal/data details
- minimal rounded UI
- high contrast
- no generic “soft SaaS” look

## 10.2 Color system

Primary:

```text
MIDNIGHT BLACK   #080808
OFF WHITE        #F5F5F0
ELECTRIC BLUE    #0000FF
DARK BLUE        #0808A8
SOFT BLUE        #4D4DFF
BORDER GREY      #2A2A2A
TEXT GREY        #A8A8A8
SUCCESS LIME     #B9FF00
DANGER RED       #FF3B30
```

Usage:

```text
BLACK = structure/background
WHITE = primary information
BLUE = actions, Midnight identity, verification
LIME = success only
RED = failures only
GREY = supporting metadata
```

## 10.3 Cards

Preferred visual language:

```css
border: 2px solid #080808;
border-radius: 0;
box-shadow: 6px 6px 0 #080808;
```

Do not apply this blindly to every element; use hierarchy.

## 10.4 Typography

Use a heavy/condensed display face for:

- VELIOS
- TREASURY
- AGENTS
- PRIVATE
- PROOF
- AUTHORIZED

Use a readable mono or mono-adjacent face for:

- contract IDs
- hashes
- DIDs
- transaction IDs
- statuses
- network information

Do not add font files to the repository just for aesthetics if an appropriate web/system font can achieve the look.

Use IBM Plex Sans for display and UI, IBM Plex Mono for hashes and addresses. Do not use Archivo Black or Impact — they collide on all-caps headings and look corrupted.

---

# 11. LANDING PAGE

Suggested structure:

```text
NAVBAR
VELIOS   PRODUCT   PROTOCOL   DOCS   CONNECT WALLET

HERO
PRIVATE.
VERIFIABLE.
AUTONOMOUS.

Organizations shouldn't expose their secrets
to prove that their actions are valid.

[ LAUNCH VELIOS ]   [ VIEW PROTOCOL ]

LIVE MODULE PREVIEWS
Private treasury
Agent authorization
Privacy inspector

HOW IT WORKS
PRIVATE -> PROOF -> PUBLIC

AGENT CONTROL
Humans define rules; agents execute them.

PRIVATE TREASURY
Financial actions without unnecessary disclosure.

IDENTITY & CREDENTIALS
Prove facts without revealing everything.

GOVERNANCE
Private eligibility and private voting.

PROCUREMENT
Private bids, public validity.

MIDNIGHT ARCHITECTURE
Compact / Private State / ZK / Wallet / Indexer

LIVE DEMO

ROADMAP

GITHUB / DOCS
```

---

# 12. DASHBOARD LAYOUT

The dashboard should feel like a Web3 operating system.

```text
+--------------------------------------------------------------+
| VELIOS / ACME                    MIDNIGHT ● LIVE             |
+--------------------------------------------------------------+
| OVERVIEW | TREASURY | AGENTS | GOVERNANCE | IDENTITY       |
| CREDENTIALS | PROCUREMENT | CREDIT | PRIVACY | DEVELOPER   |
+--------------------------------------------------------------+

+----------------------+  +-------------------------------+
| PRIVATE TREASURY     |  | VERIFIED ACTIONS              |
|                      |  |                               |
| $1.284M              |  | 1,284                         |
| SHIELDED             |  |                               |
+----------------------+  +-------------------------------+

+-------------------------------+
| AI AGENTS                     |
|                               |
| TREASURY-01        ● ACTIVE  |
| PROCUREMENT-02     ● ACTIVE  |
| CREDIT-01          ○ PAUSED  |
| COMPLIANCE-01      ● ACTIVE  |
+-------------------------------+

+-------------------------------+
| PRIVACY BOUNDARY              |
| PRIVATE --- ZK --- PUBLIC     |
+-------------------------------+
```

---

# 13. LANGUAGE / TERMINOLOGY

Use a consistent protocol vocabulary.

Prefer:

| Avoid | Prefer |
|---|---|
| Transaction | Action |
| Bot | Agent |
| Smart contract | Policy contract / contract |
| User | Principal / member |
| Private data | Private state |
| Transaction accepted | Proof verified / action authorized |
| Permission | Policy |
| Profile | Identity / credential set |
| Score | Reputation |

Do not force this terminology where it becomes unnatural; clarity is more important than jargon.

---

# 14. DEVELOPMENT ENVIRONMENT

Recommended:

```text
Windows
 |
 +-- Cursor
 |     \-- Grok 4.6
 |
 +-- WSL2 Ubuntu
       |
       +-- Node.js
       +-- pnpm
       +-- Midnight local dev environment
       +-- Proof server
       +-- Indexer
       +-- test tooling
```

Prefer keeping Node/package execution inside WSL if the repository is being developed there, rather than mixing Windows and WSL dependency trees.

---

# 15. CURSOR + GROK 4.6 WORKFLOW

Do not give Grok a single command like “build all of VELIOS.”

Use controlled stages.

## Stage 1 — Architecture

Ask the agent to:

1. inspect the repo
2. inspect installed Midnight packages
3. inspect official examples available locally
4. write architecture docs
5. stop

## Stage 2 — Contract

Ask it to:

1. implement the smallest Compact domain model
2. compile it
3. add tests
4. stop

## Stage 3 — Midnight integration

Ask it to:

1. implement providers
2. connect wallet
3. connect proof server
4. connect indexer
5. deploy/interact
6. add integration tests

## Stage 4 — UI

Only after the real backend flow works.

## Stage 5 — Hardening

Ask for:

- security review
- privacy review
- test gap analysis
- race/async-state analysis
- error handling
- UX failure handling

---

# 16. ROOT `AGENTS.md` CONTENT

Use this as the repository-level instruction file:

```text
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
```

---

# 17. ROOT `MIDNIGHT.md` CONTENT

```text
# VELIOS Midnight Integration Rules

VELIOS is Midnight-first.

Primary ecosystem concepts:

- Compact smart contracts
- Private state
- Public ledger state
- ZK proofs
- MidnightJS
- DApp Connector / wallet integration
- Proof provider / proof server
- Indexer
- DID
- Verifiable Credentials
- NIGHT / supported asset functionality
- Local development environment

Before using any package:

1. Confirm it is installed.
2. Confirm the current exported APIs.
3. Check the official example/version that matches the installed package.
4. Write a small integration test before building the feature around it.

Never assume API signatures from memory.
Never copy outdated snippets without verification.
```

---

# 18. ROOT `SECURITY.md` CONTENT

```text
# VELIOS Security Rules

Private by default.

Never expose through:
- console.log
- URL/query parameters
- client analytics
- public events
- server logs
- error messages
- telemetry
- screenshots in automated tests

Protect:
- private witnesses
- private credentials
- policy values
- private financial state
- wallet secrets
- signing material
- user-controlled sensitive metadata

Every authorization feature must include negative tests.
Every asynchronous transaction flow must handle:
- pending
- success
- failure
- timeout
- stale state
- rejected proof

The UI must never display a successful result from optimistic state alone.
```

---

# 19. ROOT `ROADMAP.md` CONTENT

```text
# VELIOS Roadmap

## Wave 1 — VELIOS CORE

Goal:
Prove the core private authorization loop.

Deliver:
- organization
- agent
- private policy
- action request
- proof
- Compact verification
- real Midnight transaction
- indexer result
- Privacy Inspector
- contract tests
- E2E tests

## Wave 2 — VELIOS ECONOMY

Goal:
Turn the core protocol into an organization operating layer.

Deliver:
- DID
- credentials
- treasury
- payments
- governance
- private voting
- procurement
- selective disclosure
- auditor interface

## Wave 3 — VELIOS NETWORK

Goal:
Turn VELIOS into a broader autonomous organization protocol.

Deliver:
- credit
- reputation
- escrow
- agent marketplace
- external verification
- Effectstream integration where justified
- Kuira/mobile flow where justified
- developer APIs
```

---

# 20. FIRST IMPLEMENTATION PROMPT FOR CURSOR

Paste the following as the first project-level task after creating the repository:

```text
You are the lead engineer for VELIOS.

Read all root project documents first:
- AGENTS.md
- ARCHITECTURE.md
- MIDNIGHT.md
- SECURITY.md
- ROADMAP.md

Do NOT implement the application yet.

Your first task is architecture discovery.

1. Inspect the current repository.
2. Inspect package.json / workspace configuration.
3. Identify the currently installed Midnight packages.
4. Inspect the official/example code already present in the repository.
5. Identify the exact APIs that are available for:
   - Compact contracts
   - MidnightJS
   - wallet/DApp Connector
   - proof provider
   - indexer
   - local development environment
6. Identify any APIs that are uncertain or version-dependent.
7. Create ARCHITECTURE.md with:
   - system architecture
   - domain model
   - public/private state boundary
   - contract responsibilities
   - provider responsibilities
   - frontend/backend boundaries
   - data flow
   - error handling flow
8. Create docs/privacy-model.md.
9. Create docs/threat-model.md.
10. Create docs/contract-spec.md.
11. Create a test matrix for Wave 1.
12. Create a dependency/version report.

Do not write feature implementation code yet.
Do not invent APIs.
Do not create mocks.

Stop after the architecture is complete and summarize:
- what is confirmed
- what is uncertain
- what should be implemented first
```

---

# 21. SECOND CURSOR PROMPT — CONTRACT

After architecture review:

```text
Implement only the Wave 1 Compact organization/authorization core described in docs/contract-spec.md.

Scope:
- organization
- agent
- policy representation/commitment
- action
- authorization
- result recording

Requirements:
1. Use only the confirmed Compact APIs.
2. Make the private/public boundary explicit.
3. Compile the contract.
4. Add comprehensive positive and negative tests.
5. Test replay/duplicate actions.
6. Test inactive agents.
7. Test invalid authorization conditions.
8. Do not build frontend code.
9. Do not add Wave 2 functionality.

After implementation:
- run the contract compiler
- run all contract tests
- show the exact commands used
- report failures honestly
- update docs if any implementation detail changed
```

---

# 22. THIRD CURSOR PROMPT — MIDNIGHT INTEGRATION

```text
Implement the real Midnight integration for the already-tested Wave 1 contract.

Connect:
- wallet
- provider
- proof server
- contract
- indexer
- frontend data layer

Requirements:
1. No production mocks.
2. Confirm all APIs from installed packages before coding.
3. Create typed provider interfaces.
4. Handle pending/success/failure/rejected states.
5. Add integration tests.
6. Verify real transaction outcomes.
7. Do not expose private values in logs or URLs.
8. Keep the private/public boundary from the architecture intact.

Do not redesign the contract.
Do not add Wave 2 features.
```

---

# 23. FOURTH CURSOR PROMPT — FRONTEND

```text
Build the Wave 1 VELIOS frontend around the already-working real Midnight integration.

Visual direction:
- neo-brutalist Web3
- inspired by the supplied XCHANGE reference
- do not copy assets or exact composition
- Midnight black/white/electric-blue palette
- hard borders
- hard shadows
- oversized typography
- browser/window panels
- technical status labels
- dense modular dashboard
- minimal rounded cards

Pages:
1. Landing
2. Dashboard
3. Organization
4. Agent
5. Action request
6. Proof generation
7. Action result
8. Privacy Inspector

Requirements:
- no fake transaction success
- every action uses real data
- loading states
- proof rejection state
- wallet connection state
- network status
- clear public/private representation
- responsive desktop-first design
- accessible keyboard interaction
- no excessive animation
```

---

# 24. FIFTH CURSOR PROMPT — FULL QA PASS

```text
Act as a senior security engineer, QA engineer, and Midnight integration reviewer.

Review the entire Wave 1 VELIOS implementation.

Check:
- Compact correctness
- private/public state boundaries
- replay protection
- authorization bypasses
- stale state
- async transaction races
- proof rejection behavior
- credential failure behavior
- frontend false-success states
- secrets in logs
- sensitive URL parameters
- error handling
- contract test coverage
- E2E coverage
- local environment reproducibility

Do not rewrite the application blindly.
First produce a prioritized findings report.
Then fix only confirmed issues.
Run all relevant tests after each group of fixes.
```

---

# 25. DEMO SCRIPT

The final presentation should show a concrete story rather than a feature dump.

## Scene 1 — Organization

Create/open:

```text
ACME AUTONOMOUS SYSTEMS
```

## Scene 2 — Agent

Open:

```text
TREASURY-01
```

Show that the agent operates under a private policy.

## Scene 3 — Valid action

Request:

```text
$4,800 security audit payment
```

## Scene 4 — Proof

Show:

```text
Collect private state
Build witness
Generate proof
Verify with Midnight
```

## Scene 5 — Authorization

Show:

```text
AUTHORIZED
```

## Scene 6 — Privacy Inspector

Show the public/private split.

## Scene 7 — Attack

Request:

```text
$48,000
```

Show:

```text
PROOF REJECTED
```

## Scene 8 — Explain the architecture

```text
PRIVATE -> PROOF -> PUBLIC
```

## Scene 9 — Roadmap

Show that Waves 2 and 3 add:

```text
Credentials
Treasury
Governance
Procurement
Credit
Reputation
Cross-chain
Mobile
```

---

# 26. WAVE 2 DEMO SCRIPT

1. Login / identify through Midnight-compatible identity.
2. Show private credentials.
3. Create treasury policy.
4. Launch private governance proposal.
5. Vote privately.
6. Change agent policy through governance.
7. Launch private procurement.
8. Submit hidden bids.
9. Show verified winner.
10. Open selective-disclosure audit screen.

---

# 27. WAVE 3 DEMO SCRIPT

1. Private credit eligibility.
2. Reputation proof.
3. Escrow.
4. Agent-to-agent transaction.
5. Cross-chain action through Effectstream if stable and justified.
6. Mobile authorization through Kuira if stable and justified.
7. External auditor verifies public proof.
8. Show VELIOS as infrastructure rather than a single application.

---

# 28. README STRUCTURE

The repository README should be judge-friendly.

Recommended:

```text
# VELIOS

One-sentence description

## Why VELIOS

## Why Midnight

## Core Demo

## Architecture

## Public vs Private State

## Compact Contracts

## DID / Credentials

## Agent Authorization

## Treasury / Governance / Procurement

## Local Development

## Testing

## Security / Threat Model

## Wave Progress

## Demo Video

## Screenshots

## Roadmap

## License
```

The README should clearly identify what was built in the current Wave and what changed from the previous Wave.

---

# 29. DOCUMENTATION CHECKLIST

Before each Wave submission, verify:

- [ ] README complete
- [ ] architecture updated
- [ ] privacy model updated
- [ ] threat model updated
- [ ] test matrix updated
- [ ] current test results included
- [ ] local setup instructions verified from a clean environment
- [ ] Compact contract compiles
- [ ] Midnight-related code is publicly available as required
- [ ] `midnightntwrk` GitHub labeling requirements handled
- [ ] demo video reflects the exact submitted build
- [ ] slide deck reflects the exact submitted build
- [ ] changelog explains Wave progress

---

# 30. ECOSYSTEM REFERENCES

Use the official/current versions of these resources as the source of truth during implementation:

- Midnight Docs: https://docs.midnight.network/
- Midnight GitHub: https://github.com/midnightntwrk
- Midnight RPS Sample: https://github.com/mashharuki/midnight-rps-sample-app
- Midnight Local Dev: https://github.com/midnightntwrk/midnight-local-dev
- Effectstream: https://github.com/effectstream/effectstream
- Kuira SDK Android: https://github.com/kuiralabs/kuira-sdk-android
- Midnight Expert / Kapa: https://docs.midnight.network/blog/migrating-to-kapa-and-midnight-expert
- Midnight DApp Connector: https://github.com/midnightntwrk/midnight-dapp-connector-api
- Midnight Wallet: https://github.com/midnightntwrk/midnight-wallet-dapp
- MidnightJS: https://github.com/midnightntwrk/midnight-js
- Midnight DID: https://github.com/midnightntwrk/midnight-did
- Midnight Verifiable Credentials: https://github.com/midnightntwrk/midnight-verifiable-credentials
- Private Party example: https://github.com/midnightntwrk/example-private-party
- ZKLoan example: https://github.com/midnightntwrk/example-zkloan

When docs and installed package APIs disagree, verify against the current package version and current official repository before implementation.

---

# 31. IMPORTANT SCOPE RULE

VELIOS should feel large to the judge while remaining implementable.

The trick is **not** to build every feature at once.

Build one extremely strong privacy authorization loop first:

```text
IDENTITY
   |
   v
AGENT
   |
   v
PRIVATE POLICY
   |
   v
ACTION
   |
   v
ZK / PROOF
   |
   v
COMPACT
   |
   v
MIDNIGHT
   |
   v
PUBLIC RESULT
```

Then reuse this architecture to add:

```text
credentials
   |
treasury
   |
governance
   |
procurement
   |
credit
   |
reputation
   |
escrow
   |
cross-chain
   |
mobile
```

Each new module should reuse the same core principle:

> **Prove the rule was satisfied without unnecessarily revealing the secret that made it true.**

---

# 32. FINAL SUCCESS CRITERIA

## Wave 1 is successful when

A real user can:

1. Connect a wallet.
2. Create or access an organization.
3. Create an AI agent.
4. Configure a private policy.
5. Request a valid action.
6. Generate/verify the required proof.
7. Execute the real Midnight contract interaction.
8. See the public result.
9. Attempt an invalid action.
10. Observe a real proof/authorization rejection.
11. Inspect exactly what was private versus public.
12. Run the complete automated test suite.

## Wave 2 is successful when

The organization can manage:

- identity
- credentials
- treasury
- payments
- governance
- private voting
- procurement
- selective disclosure

through the same privacy-first architecture.

## Wave 3 is successful when

VELIOS demonstrates:

- private credit
- reputation
- escrow
- autonomous agent interactions
- external verification
- cross-chain execution where stable
- mobile authorization where stable
- developer/integration potential

At that point, the project should look less like a single hackathon DApp and more like a **privacy infrastructure platform for autonomous organizations**.

---

# 33. FINAL PRODUCT POSITIONING

### Product name

**VELIOS**

### Category

Privacy infrastructure for autonomous organizations.

### Tagline

**Humans define the rules. Agents execute them. Midnight proves they were followed.**

### Secondary tagline

**The blockchain sees the proof. Not the secret.**

### One-sentence pitch

> VELIOS lets organizations and AI agents execute financial, procurement, and governance actions under private policies while Midnight cryptographically proves that every action was authorized without exposing the underlying sensitive data.

### Three-word product pillars

**PRIVATE. VERIFIABLE. AUTONOMOUS.**

---

# 34. IMPLEMENTATION ORDER — DO NOT DEVIATE WITHOUT REASON

```text
PHASE 0
Repository + tooling

PHASE 1
Architecture docs

PHASE 2
Compact core

PHASE 3
Contract tests

PHASE 4
MidnightJS / wallet / proof / indexer

PHASE 5
Real end-to-end transaction

PHASE 6
Wave 1 UI

PHASE 7
Privacy Inspector

PHASE 8
Security + QA

PHASE 9
Demo + README + submission

WAVE 2
DID + VC + Treasury + Governance + Procurement

WAVE 3
Credit + Reputation + Escrow + External execution + Mobile
```

Never skip ahead because a future feature looks more exciting.

**The strongest version of VELIOS is the one where the core authorization path is real, tested, explainable, and impossible to confuse with a mocked blockchain demo.**
