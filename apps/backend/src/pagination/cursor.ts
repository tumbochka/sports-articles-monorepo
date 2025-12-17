type SportArticleCursor = { createdAt: string; id: string };

export function encodeCursor(c: SportArticleCursor): string {
  return Buffer.from(JSON.stringify(c), "utf8").toString("base64url");
}

export function decodeCursor(cursor: string): SportArticleCursor {
  const raw = Buffer.from(cursor, "base64url").toString("utf8");
  const parsed = JSON.parse(raw) as SportArticleCursor;

  if (!parsed?.createdAt || !parsed?.id) {
    throw new Error("Invalid cursor");
  }
  return parsed;
}
