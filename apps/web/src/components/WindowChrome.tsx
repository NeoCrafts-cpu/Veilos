/** Decorative window controls. Hidden from AT; cards already have text headings. */
export function WindowChrome() {
  return (
    <div className="window-chrome" aria-hidden="true">
      <span />
      <span />
      <span />
    </div>
  );
}
