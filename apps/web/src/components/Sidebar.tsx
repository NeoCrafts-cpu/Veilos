import { useEffect, useId, useRef, type RefObject } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { pathMatches, WORKSPACE_NAV } from "../lib/navigation.js";
import { useSession } from "../state/session.js";
import { Logo } from "./Logo.js";

export function Sidebar({
  open,
  hidden,
  onClose,
  onHide,
  toggleRef,
}: {
  open: boolean;
  hidden: boolean;
  onClose: () => void;
  onHide: () => void;
  toggleRef: RefObject<HTMLButtonElement | null>;
}) {
  const location = useLocation();
  const titleId = useId();
  const navRef = useRef<HTMLElement>(null);
  const { publicStore } = useSession();

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const firstLink = navRef.current?.querySelector<HTMLElement>("a, button");
    firstLink?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !navRef.current) return;
      const focusable = [...navRef.current.querySelectorAll<HTMLElement>("a, button")].filter(
        (node) => !node.hasAttribute("disabled"),
      );
      if (focusable.length === 0) return;
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      (toggleRef.current ?? previouslyFocused)?.focus();
    };
  }, [open, onClose, toggleRef]);

  return (
    <aside
      ref={navRef}
      id="workspace-sidebar"
      className={`sidebar${open ? " is-open" : ""}${hidden ? " is-hidden" : ""}`}
      aria-labelledby={titleId}
      aria-hidden={hidden && !open}
      {...(hidden && !open ? { inert: true } : {})}
    >
      <div className="sidebar-brand">
        <div className="sidebar-brand-row">
          <Link to="/app" className="brand-lockup-link" onClick={onClose}>
            <Logo size={40} />
          </Link>
          <button type="button" className="btn ghost sidebar-hide" onClick={onHide}>
            Hide
          </button>
        </div>
        <p id={titleId} className="brand-sub">
          {publicStore.organizationName}
        </p>
      </div>
      <nav className="sidebar-nav" aria-label="Primary">
        {WORKSPACE_NAV.map((group) => (
          <div key={group.id} className="sidebar-group">
            <p className="sidebar-group-label">{group.label}</p>
            {group.items.map((item) => {
              const current = pathMatches(item, location.pathname);
              return (
                <NavLink
                  key={item.id}
                  to={item.to}
                  {...(item.end ? { end: true } : {})}
                  aria-current={current ? "page" : undefined}
                  className={current ? "is-current" : ""}
                  onClick={onClose}
                >
                  {item.label}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
