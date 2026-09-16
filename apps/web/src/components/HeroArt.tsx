import { useCallback, useEffect, useState, type PointerEvent } from "react";
import { LogoMark } from "./Logo.js";

/**
 * Hero scene: one authorization on Midnight.
 * Private values stay masked. Only a public result remains. Decorative.
 */
export function HeroArt() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  const tilt = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (reducedMotion) return;
      const node = event.currentTarget;
      const box = node.getBoundingClientRect();
      const x = (event.clientX - box.left) / box.width - 0.5;
      const y = (event.clientY - box.top) / box.height - 0.5;
      node.style.setProperty("--tilt-y", `${(x * 14).toFixed(2)}deg`);
      node.style.setProperty("--tilt-x", `${(-y * 9 + 8).toFixed(2)}deg`);
    },
    [reducedMotion],
  );

  const resetTilt = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (reducedMotion) return;
      event.currentTarget.style.setProperty("--tilt-y", "-18deg");
      event.currentTarget.style.setProperty("--tilt-x", "10deg");
    },
    [reducedMotion],
  );

  return (
    <div
      className={`hero-art${reducedMotion ? " is-static" : ""}`}
      aria-hidden="true"
      onPointerMove={tilt}
      onPointerLeave={resetTilt}
    >
      <div className="hero-scene">
        <div className="hero-scene-glow" />
        <div className="hero-floor" />
        <div className="hero-ring" />
        <div className="hero-beam" />
        <div className="hero-stage-3d">
          <article className="hero-layer is-private">
            <span className="hero-layer-kicker">01 · Private</span>
            <strong>Policy</strong>
            <p className="hero-mask">██████████</p>
            <p className="hero-mask dim">vendor ████</p>
          </article>
          <article className="hero-layer is-proof">
            <span className="hero-layer-kicker">02 · Proof</span>
            <strong>Compact</strong>
            <svg className="hero-circuit" viewBox="0 0 168 56" fill="none">
              <path
                className="hero-circuit-path"
                d="M6 28 H30 L44 10 H78 L96 28 L78 46 H44 L30 28"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              <path className="hero-circuit-wire" d="M96 28 H162" stroke="currentColor" strokeWidth="1.8" />
              <circle className="hero-circuit-node" cx="96" cy="28" r="5.5" />
              <circle className="hero-circuit-node" cx="162" cy="28" r="3.5" />
            </svg>
          </article>
          <article className="hero-layer is-public">
            <span className="hero-layer-kicker">03 · Public</span>
            <strong>Result</strong>
            <p>ledger sees a proof</p>
          </article>
          <div className="hero-core">
            <LogoMark size={72} />
          </div>
        </div>
        <div className="hero-agent">
          <span className="hero-agent-dot" />
          TREASURY-01
        </div>
        <p className="hero-scene-caption">Private → Proof → Public</p>
      </div>
    </div>
  );
}
