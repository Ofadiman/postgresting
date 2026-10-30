import { afterAll, afterEach, beforeAll } from "vitest";

import { worker } from "./worker";

beforeAll(async () => {
  await worker.start({ onUnhandledFrame: "error", quiet: true });
});

afterEach(() => {
  worker.resetHandlers();
  localStorage.clear();
});

afterAll(async () => {
  await worker.stop();
});
