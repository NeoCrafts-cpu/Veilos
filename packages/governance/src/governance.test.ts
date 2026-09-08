import { holderCommitment, issueOrganizationCredential } from "@velios/credentials";
import { randomBytes32 } from "@velios/policy-engine";
import { describe, expect, it } from "vitest";
import { castPrivateBallot, createProposal, experimentalTallyAdapter, finalizeFromOpenings } from "./index.js";

describe("private ballots", () => {
  it("does not record a public yes/no per vote and rejects duplicates", () => {
    const proposalId = new Uint8Array(32).fill(8);
    const holderSecret = randomBytes32();
    const holder = holderCommitment(holderSecret);
    const credential = issueOrganizationCredential({
      holderSecret,
      organizationId: new Uint8Array(32).fill(1),
      className: "admin",
      expiry: 2_000_000_000n,
      salt: randomBytes32(),
      revocationSecret: randomBytes32(),
    });
    const proposal = createProposal({
      proposalId,
      actionCommitment: new Uint8Array(32).fill(2),
      voteStart: 1n,
      voteEnd: 10n,
      quorum: 1n,
    });
    const salt = randomBytes32();
    const vote = castPrivateBallot({
      proposal,
      holder,
      choice: 1n,
      salt,
      now: 5n,
      credential,
      revoked: [],
    });
    expect(JSON.stringify({ c: Buffer.from(vote.ballotCommitment).toString("hex") })).not.toMatch(/"choice"|yes|no/);
    expect(() =>
      castPrivateBallot({
        proposal,
        holder,
        choice: 0n,
        salt: randomBytes32(),
        now: 5n,
        credential,
        revoked: [],
      }),
    ).toThrow(/already voted/);
    const tally = finalizeFromOpenings(proposal, [
      { nullifier: vote.nullifier, choice: 1n, salt, holder },
    ]);
    expect(tally).toEqual({ yes: 1n, no: 0n });
    expect(experimentalTallyAdapter().kind).toBe("experimental-opening-tally");
    const early = createProposal({
      proposalId: new Uint8Array(32).fill(9),
      actionCommitment: new Uint8Array(32).fill(2),
      voteStart: 10n,
      voteEnd: 20n,
      quorum: 1n,
    });
    expect(() =>
      castPrivateBallot({
        proposal: early,
        holder: holderCommitment(randomBytes32()),
        choice: 1n,
        salt: randomBytes32(),
        now: 0n,
        credential,
        revoked: [],
      }),
    ).toThrow(/vote not started/);
    const incomplete = createProposal({
      proposalId: new Uint8Array(32).fill(7),
      actionCommitment: new Uint8Array(32).fill(2),
      voteStart: 1n,
      voteEnd: 10n,
      quorum: 1n,
    });
    castPrivateBallot({
      proposal: incomplete,
      holder: holderCommitment(holderSecret),
      choice: 1n,
      salt: randomBytes32(),
      now: 5n,
      credential,
      revoked: [],
    });
    expect(() => finalizeFromOpenings(incomplete, [])).toThrow(/incomplete tally/);
  });
});
