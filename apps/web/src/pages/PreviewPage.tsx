import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "../state/session.js";

export function PreviewPage() {
  const navigate = useNavigate();
  const { choosePreview } = useSession();

  useEffect(() => {
    choosePreview();
    navigate("/app", { replace: true });
  }, [choosePreview, navigate]);

  return null;
}
