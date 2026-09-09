import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/Button.js";
import { FormField } from "../../components/FormField.js";
import { JourneyLayout } from "../../components/JourneyLayout.js";
import { useDocumentTitle } from "../../hooks/useDocumentTitle.js";
import { validateLabel } from "../../lib/validation.js";
import { useSession } from "../../state/session.js";
import { SETUP_STEPS } from "./steps.js";

export function SetupOrgPage() {
  useDocumentTitle("Organization details");
  const navigate = useNavigate();
  const { setupDraft, setSetupDraft, startOwnerSetup } = useSession();
  const [errors, setErrors] = useState<{ name?: string; member?: string }>({});

  return (
    <JourneyLayout
      title="Organization details"
      objective="These labels become public identifiers. They are not demo names."
      steps={SETUP_STEPS}
      current={1}
      actions={
        <Button
          onClick={() => {
            const name = validateLabel(setupDraft.organizationName, "Organization name");
            const member = validateLabel(setupDraft.memberLabel, "Founding member label");
            setErrors({
              ...(name ? { name } : {}),
              ...(member ? { member } : {}),
            });
            if (name || member) return;
            startOwnerSetup();
            navigate("/app/setup/vault");
          }}
        >
          Review organization
        </Button>
      }
    >
      <form className="form card" onSubmit={(event) => event.preventDefault()}>
        <FormField
          id="org-name"
          label="Organization name"
          value={setupDraft.organizationName}
          onChange={(event) => setSetupDraft({ ...setupDraft, organizationName: event.target.value })}
          hint="Example only: ACME AUTONOMOUS SYSTEMS. Enter your own name."
          error={errors.name}
        />
        <FormField
          id="member-label"
          label="Founding member label"
          value={setupDraft.memberLabel}
          onChange={(event) => setSetupDraft({ ...setupDraft, memberLabel: event.target.value })}
          hint="Example only: FOUNDING-MEMBER. Must be 32 bytes or fewer."
          error={errors.member}
        />
      </form>
    </JourneyLayout>
  );
}
