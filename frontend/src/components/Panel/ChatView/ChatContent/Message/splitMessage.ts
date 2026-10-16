export interface MessagePiece {
  kind: "text" | "code";
  content: string;
  language?: string;
}

const CODE_FENCE =
  /^([^\S\r\n]*)```([^\s`]*)[^\S\r\n]*\r?\n([\s\S]*?)(?:^[^\S\r\n]*```[^\S\r\n]*$|(?![\s\S]))/gm;

function stripIndent(code: string, width: number): string {
  return code
    .split("\n")
    .map((line) => {
      let cut = 0;
      while (cut < width && (line[cut] === " " || line[cut] === "\t")) {
        cut++;
      }
      return line.slice(cut);
    })
    .join("\n");
}

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
    const [block, indent, language, body] = match;
    const start = match.index ?? 0;
    pushText(text.slice(lastIndex, start));
    pieces.push({
      kind: "code",
      content: stripIndent(body, indent.length).trimEnd(),
      language,
    });
    lastIndex = start + block.length;
  }

  pushText(text.slice(lastIndex));
  return pieces;
}
