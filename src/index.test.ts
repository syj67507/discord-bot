import { expect, test } from "vitest";
import { sum } from "./main2";

test("This is america", () => {
  const result = sum(1, 2);
  expect(result).toBe(3);
});
