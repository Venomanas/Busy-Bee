export function conversationIdForPair(a: string, b: string) {
  return [a, b].sort().join("_");
}

