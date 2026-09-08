import { ballotCommitment, voteNullifier } from "@velios/economy";
import { organizationCredentialHolder, type IssuedCredentialPublic } from "@velios/credentials";

export type Proposal = {
  proposalId: Uint8Array;
  actionCommitment: Uint8Array;
  voteStart: bigint;
  voteEnd: bigint;
  quorum: bigint;
  status: "open" | "finalized";
  ballots: Map<string, Uint8Array>;
  nullifiers: Set<string>;
  yes?: bigint;
  no?: bigint;
};

export function createProposal(input: Omit<Proposal, "status" | "ballots" | "nullifiers">): Proposal {
  return { ...input, status: "open", ballots: new Map(), nullifiers: new Set() };
}

export function castPrivateBallot(input: {
  proposal: Proposal;
  holder: Uint8Array;
  choice: 0n | 1n;
  salt: Uint8Array;
  now: bigint;
  credential: IssuedCredentialPublic;
  revoked: Uint8Array[];
}): { ballotCommitment: Uint8Array; nullifier: Uint8Array } {
  if (input.proposal.status !== "open") throw new Error("proposal closed");
  if (input.now < input.proposal.voteStart) throw new Error("vote not started");
  if (input.now > input.proposal.voteEnd) throw new Error("vote elapsed");
  const proved = organizationCredentialHolder.prove({
    credential: input.credential,
    requiredClass: "admin",
    periodEnd: input.proposal.voteEnd,
    revoked: input.revoked,
  });
  if (!proved.ok) throw new Error(proved.code);
  const nullifier = voteNullifier(input.proposal.proposalId, input.holder);
  const key = Buffer.from(nullifier).toString("hex");
  if (input.proposal.nullifiers.has(key)) throw new Error("already voted");
  const commitment = ballotCommitment({
    proposalId: input.proposal.proposalId,
    holder: input.holder,
    choice: input.choice,
    salt: input.salt,
  });
  input.proposal.nullifiers.add(key);
  input.proposal.ballots.set(key, commitment);
  return { ballotCommitment: commitment, nullifier };
}

export type TallyAdapter = {
  kind: "experimental-opening-tally";
  note: string;
};

export function experimentalTallyAdapter(): TallyAdapter {
  return {
    kind: "experimental-opening-tally",
    note:
      "Per-vote ledger rows are commitments and nullifiers only. A Compact proof that a disclosed aggregate equals every accepted opening is experimental; finalize writes only the final yes/no counts.",
  };
}

export function finalizeFromOpenings(
  proposal: Proposal,
  openings: { nullifier: Uint8Array; choice: 0n | 1n; salt: Uint8Array; holder: Uint8Array }[],
): { yes: bigint; no: bigint } {
  if (openings.length !== proposal.ballots.size) throw new Error("incomplete tally");
  let yes = 0n;
  let no = 0n;
  for (const opening of openings) {
    const expected = ballotCommitment({
      proposalId: proposal.proposalId,
      holder: opening.holder,
      choice: opening.choice,
      salt: opening.salt,
    });
    const key = Buffer.from(voteNullifier(proposal.proposalId, opening.holder)).toString("hex");
    const stored = proposal.ballots.get(key);
    if (!stored || !Buffer.from(stored).equals(Buffer.from(expected))) throw new Error("altered opening");
    if (opening.choice === 1n) yes += 1n;
    else no += 1n;
  }
  if (yes < proposal.quorum) throw new Error("quorum failure");
  proposal.status = "finalized";
  proposal.yes = yes;
  proposal.no = no;
  return { yes, no };
}
