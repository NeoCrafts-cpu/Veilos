/**
 * Development-only plaintext operator-state endpoint.
 * Vite must not include this module in production chunks.
 */

const DEV_OPERATOR_STATE_PATH = "/@velios-operator-state";

export async function getDevOperatorState(): Promise<Response> {
  return fetch(DEV_OPERATOR_STATE_PATH);
}

export async function putOperatorStateDev(encoded: unknown): Promise<void> {
  const response = await fetch(DEV_OPERATOR_STATE_PATH, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(encoded),
  });
  if (!response.ok && response.status !== 204) {
    throw new Error("operator state persist failed");
  }
}
