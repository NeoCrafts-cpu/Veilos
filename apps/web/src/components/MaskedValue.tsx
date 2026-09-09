export function MaskedValue({ label }: { label: string }) {
  return (
    <p className="mask">
      <span aria-hidden="true">██████████</span>
      <span className="sr-only">{label}: private value hidden</span>
    </p>
  );
}
