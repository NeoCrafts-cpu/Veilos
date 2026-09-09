import type { JourneyStep } from "../../components/GuidedStepper.js";

export const SETUP_STEPS: JourneyStep[] = [
  { id: "readiness", label: "Readiness", to: "/app/setup" },
  { id: "org", label: "Organization", to: "/app/setup/org" },
  { id: "vault", label: "Operator vault", to: "/app/setup/vault" },
  { id: "review", label: "Review", to: "/app/setup/review" },
];

export const POLICY_STEPS: JourneyStep[] = [
  { id: "details", label: "Policy details" },
  { id: "review", label: "Review" },
];

export const AUTH_STEPS: JourneyStep[] = [
  { id: "details", label: "Request details", to: "/app/authorize/new" },
  { id: "review", label: "Review", to: "/app/authorize/review" },
];
