import { Navigate, Route, Routes, useParams } from "react-router-dom";
import { LandingPage } from "./pages/LandingPage.js";
import { DashboardPage } from "./pages/DashboardPage.js";
import { OrganizationPage } from "./pages/OrganizationPage.js";
import { AgentPage } from "./pages/AgentPage.js";
import { AgentPolicyPage } from "./pages/AgentPolicyPage.js";
import { ActionPage } from "./pages/ActionPage.js";
import { AuthorizeReviewPage } from "./pages/AuthorizeReviewPage.js";
import { ProofPage } from "./pages/ProofPage.js";
import { ResultPage } from "./pages/ResultPage.js";
import { PrivacyPage } from "./pages/PrivacyPage.js";
import { PreviewPage } from "./pages/PreviewPage.js";
import { ActivityPage } from "./pages/ActivityPage.js";
import { SetupReadinessPage } from "./pages/setup/SetupReadinessPage.js";
import { SetupOrgPage } from "./pages/setup/SetupOrgPage.js";
import { SetupVaultPage } from "./pages/setup/SetupVaultPage.js";
import { SetupReviewPage } from "./pages/setup/SetupReviewPage.js";
import { SetupSuccessPage } from "./pages/setup/SetupSuccessPage.js";
import { AuditorPage } from "./pages/economy/AuditorPage.js";
import { CredentialsPage } from "./pages/economy/CredentialsPage.js";
import { GovernancePage } from "./pages/economy/GovernancePage.js";
import { ProcurementPage } from "./pages/economy/ProcurementPage.js";
import { SettlementReviewPage } from "./pages/economy/SettlementReviewPage.js";
import { TreasuryPage } from "./pages/economy/TreasuryPage.js";
import { Shell } from "./components/Shell.js";
import { useSession } from "./state/session.js";

function RedirectAgentAction() {
  return <Navigate to="/app/authorize/new" replace />;
}

function RedirectLegacyProof() {
  const { actionId } = useParams();
  return <Navigate to={`/app/actions/${actionId}/progress`} replace />;
}

function RedirectLegacyAgent() {
  const { agentId } = useParams();
  const { selectedContract, publicStore } = useSession();
  const contract = selectedContract ?? publicStore.contractAddress ?? "current";
  if (agentId === "new") return <Navigate to="/app/org/agent/new" replace />;
  return <Navigate to={`/app/org/${contract}/agent/${agentId}`} replace />;
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/app" element={<Shell />}>
        <Route index element={<DashboardPage />} />
        <Route path="setup" element={<SetupReadinessPage />} />
        <Route path="setup/org" element={<SetupOrgPage />} />
        <Route path="setup/vault" element={<SetupVaultPage />} />
        <Route path="setup/review" element={<SetupReviewPage />} />
        <Route path="setup/success" element={<SetupSuccessPage />} />
        <Route path="preview" element={<PreviewPage />} />
        <Route path="authorize/new" element={<ActionPage />} />
        <Route path="authorize/review" element={<AuthorizeReviewPage />} />
        <Route path="actions" element={<ActivityPage />} />
        <Route path="actions/:actionId/progress" element={<ProofPage />} />
        <Route path="actions/:actionId/proof" element={<RedirectLegacyProof />} />
        <Route path="actions/:actionId/privacy" element={<PrivacyPage />} />
        <Route path="actions/:actionId" element={<ResultPage />} />
        <Route path="org/agent/new" element={<AgentPolicyPage />} />
        <Route path="org/agent/new/review" element={<AgentPolicyPage />} />
        <Route path="org/agent/new/success" element={<AgentPolicyPage />} />
        <Route path="org/:contractAddress/agent/new" element={<AgentPolicyPage />} />
        <Route path="org/:contractAddress/agent/new/review" element={<AgentPolicyPage />} />
        <Route path="org/:contractAddress/agent/new/success" element={<AgentPolicyPage />} />
        <Route path="org/:contractAddress/agent/:agentId/policy" element={<AgentPolicyPage />} />
        <Route path="org/:contractAddress/agent/:agentId/policy/review" element={<AgentPolicyPage />} />
        <Route path="org/:contractAddress/agent/:agentId/policy/success" element={<AgentPolicyPage />} />
        <Route path="org/:contractAddress/agent/:agentId" element={<AgentPage />} />
        <Route path="org/:contractAddress" element={<OrganizationPage />} />
        <Route path="org" element={<OrganizationPage />} />
        <Route path="privacy" element={<PrivacyPage />} />
        <Route path="credentials" element={<CredentialsPage />} />
        <Route path="treasury" element={<TreasuryPage />} />
        <Route path="treasury/settle" element={<SettlementReviewPage />} />
        <Route path="governance" element={<GovernancePage />} />
        <Route path="procurement" element={<ProcurementPage />} />
        <Route path="auditor" element={<AuditorPage />} />
        <Route path="agents/:agentId/action" element={<RedirectAgentAction />} />
        <Route path="agents/:agentId" element={<RedirectLegacyAgent />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
