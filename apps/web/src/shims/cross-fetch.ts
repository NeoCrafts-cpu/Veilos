/** Browser fetch. Replaces the CJS `cross-fetch` ponyfill MidnightJS pulls in. */
const fetchFn = globalThis.fetch.bind(globalThis);
export { fetchFn as fetch };
export default fetchFn;
