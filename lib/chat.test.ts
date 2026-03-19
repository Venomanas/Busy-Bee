import { describe, expect, it } from "vitest";
import { conversationIdForPair } from "./chatId";

describe("conversationIdForPair", () => {
  it("is deterministic regardless of order", () => {
    expect(conversationIdForPair("b", "a")).toBe("a_b");
    expect(conversationIdForPair("a", "b")).toBe("a_b");
  });
});

