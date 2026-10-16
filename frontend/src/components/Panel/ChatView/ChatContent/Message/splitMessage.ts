export interface MessagePiece {
  kind: "text" | "code";
  content: string;
  language?: string;
}

const CODE_FENCE =
  /^[^\S\r\n]*```([^\s`]*)[^\S\r\n]*\r?\n([\s\S]*?)(?:^[^\S\r\n]*```[^\S\r\n]*$|(?![\s\S]))/gm;

export function splitMessage(text: string): MessagePiece[] {
  const pieces: MessagePiece[] = [];
  let lastIndex = 0;

  const pushText = (raw: string) => {
    const content = raw.trim();
    if (content) {
      pieces.push({ kind: "text", content });
    }
  };

  for (const match of text.matchAll(CODE_FENCE)) {
    const start = match.index ?? 0;
    pushText(text.slice(lastIndex, start));
    pieces.push({
      kind: "code",
      content: match[2].trimEnd(),
      language: match[1],
    });
    lastIndex = start + match[0].length;
  }

  pushText(text.slice(lastIndex));
  return pieces;
}
