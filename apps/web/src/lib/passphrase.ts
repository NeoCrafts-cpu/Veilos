const MIN_LENGTH = 16;
const CLASSES = [/[A-Z]/, /[a-z]/, /[0-9]/, /[^A-Za-z0-9]/];

export function validateOperatorPassphrase(passphrase: string): string | undefined {
  if (passphrase.length < MIN_LENGTH) {
    return `Use at least ${MIN_LENGTH} characters.`;
  }
  const matched = CLASSES.filter((rule) => rule.test(passphrase)).length;
  if (matched < 3) {
    return "Use at least three of: uppercase, lowercase, digits, and symbols.";
  }
  return undefined;
}
