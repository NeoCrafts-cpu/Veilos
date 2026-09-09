/** Browser stand-in for Node's `assert`. Subsquid scale-codec uses it as a CJS require. */
export default function assert(value, message) {
  if (!value) {
    throw new Error(typeof message === "string" ? message : "assertion failed");
  }
}
export { assert };
