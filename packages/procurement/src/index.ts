import { organizationCredentialHolder, type IssuedCredentialPublic } from "@velios/credentials";
import { awardCommitment, bidCommitment } from "@velios/economy";

export type Procurement = {
  procurementId: Uint8Array;
  windowStart: bigint;
  windowEnd: bigint;
  budget: bigint;
  status: "open" | "awarded";
  bids: Map<string, Uint8Array>;
  award?: Uint8Array;
  winnerBid?: Uint8Array;
};

export function createProcurement(input: Omit<Procurement, "status" | "bids">): Procurement {
  return { ...input, status: "open", bids: new Map() };
}

export function submitSealedBid(input: {
  lot: Procurement;
  holder: Uint8Array;
  amount: bigint;
  salt: Uint8Array;
  now: bigint;
  credential: IssuedCredentialPublic;
  revoked: Uint8Array[];
}): Uint8Array {
  if (input.lot.status !== "open") throw new Error("procurement closed");
  if (input.now < input.lot.windowStart) throw new Error("late bid");
  if (input.now > input.lot.windowEnd) throw new Error("late bid");
  const proved = organizationCredentialHolder.prove({
    credential: input.credential,
    requiredClass: "procurement",
    periodEnd: input.lot.windowEnd,
    revoked: input.revoked,
  });
  if (!proved.ok) throw new Error(proved.code);
  const key = Buffer.from(input.holder).toString("hex");
  if (input.lot.bids.has(key)) throw new Error("duplicate bid");
  const commitment = bidCommitment({
    procurementId: input.lot.procurementId,
    holder: input.holder,
    amount: input.amount,
    salt: input.salt,
  });
  input.lot.bids.set(key, commitment);
  return commitment;
}

export function awardLowestBid(input: {
  lot: Procurement;
  openings: { holder: Uint8Array; amount: bigint; salt: Uint8Array }[];
  awardSalt: Uint8Array;
  treasuryActionId: Uint8Array;
  authorizedActionIds: Iterable<Uint8Array>;
}): Uint8Array {
  const authorized = [...input.authorizedActionIds].some((id) =>
    Buffer.from(id).equals(Buffer.from(input.treasuryActionId)),
  );
  if (!authorized) throw new Error("authorization missing");
  if (input.openings.length !== input.lot.bids.size) throw new Error("incomplete openings");
  let winner = input.openings[0];
  if (!winner) throw new Error("no bids");
  for (const opening of input.openings) {
    const expected = bidCommitment({
      procurementId: input.lot.procurementId,
      holder: opening.holder,
      amount: opening.amount,
      salt: opening.salt,
    });
    const stored = input.lot.bids.get(Buffer.from(opening.holder).toString("hex"));
    if (!stored || !Buffer.from(stored).equals(Buffer.from(expected))) throw new Error("changed opening");
    if (opening.amount < winner.amount) winner = opening;
  }
  if (winner.amount > input.lot.budget) throw new Error("over-budget winner");
  const winnerBid = bidCommitment({
    procurementId: input.lot.procurementId,
    holder: winner.holder,
    amount: winner.amount,
    salt: winner.salt,
  });
  input.lot.status = "awarded";
  input.lot.winnerBid = winnerBid;
  input.lot.award = awardCommitment({
    procurementId: input.lot.procurementId,
    winnerBid,
    salt: input.awardSalt,
  });
  return input.lot.award;
}

export function publicProcurementView(lot: Procurement): {
  procurementId: Uint8Array;
  status: string;
  award?: Uint8Array;
  winnerBid?: Uint8Array;
} {
  return {
    procurementId: lot.procurementId,
    status: lot.status,
    award: lot.award,
    winnerBid: lot.winnerBid,
  };
}
