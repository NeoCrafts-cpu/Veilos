import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export function RouteAnnouncer() {
  const location = useLocation();
  const [message, setMessage] = useState("Veilos");

  useEffect(() => {
    const heading = document.getElementById("page-heading");
    const label = heading?.textContent?.trim() || document.title;
    setMessage(label);
    heading?.focus();
  }, [location.pathname]);

  return (
    <p className="sr-only" role="status" aria-live="polite">
      {message}
    </p>
  );
}
