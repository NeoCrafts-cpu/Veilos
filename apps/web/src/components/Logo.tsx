type LogoMarkProps = {
  size?: number | undefined;
  title?: string | undefined;
};

/** Window mark: private blue / public off-white V, lime proof at the vertex. */
export function LogoMark({ size = 36, title }: LogoMarkProps) {
  const labelled = Boolean(title);
  return (
    <svg
      className="logo-mark"
      width={size}
      height={size}
      viewBox="0 0 40 40"
      role={labelled ? "img" : "presentation"}
      {...(labelled ? { "aria-label": title } : { "aria-hidden": true as const })}
    >
      {title ? <title>{title}</title> : null}
      <rect x="2" y="2" width="36" height="36" fill="#080808" stroke="#f5f5f0" strokeWidth="3" />
      <rect x="6" y="5.5" width="3.5" height="3.5" fill="#f5f5f0" />
      <rect x="11.5" y="5.5" width="3.5" height="3.5" fill="#0000ff" />
      <rect x="17" y="5.5" width="3.5" height="3.5" fill="#b9ff00" />
      <polygon points="6,12 16,12 20,33 11,33" fill="#0000ff" />
      <polygon points="24,12 34,12 29,33 20,33" fill="#f5f5f0" />
      <rect x="18" y="30" width="4" height="4" fill="#b9ff00" />
    </svg>
  );
}

export function Logo({
  size = 36,
  withWordmark = true,
}: {
  size?: number | undefined;
  withWordmark?: boolean | undefined;
}) {
  return (
    <span className="brand-lockup">
      <LogoMark size={size} title={withWordmark ? undefined : "Veilos"} />
      {withWordmark ? <span className="brand">Veilos</span> : null}
    </span>
  );
}
