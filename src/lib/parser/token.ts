export const enum Tag {
  ParenL,
  ParenR,
  Hole,
  Lambda,
  Dot,
  Identifier,
}

export interface Definition {
  tag: Tag | null;
  pattern: RegExp;
}

export const definitions: Definition[] = [
  { tag: Tag.ParenL, pattern: /\(/ },
  { tag: Tag.ParenR, pattern: /\)/ },
  { tag: Tag.Hole, pattern: /_/ },
  { tag: Tag.Dot, pattern: /\./ },
  { tag: Tag.Identifier, pattern: /[A-Za-z_]\w*/ },
  { tag: null, pattern: /\s+/ },
].map((def) => ({ ...def, pattern: RegExp(def.pattern, "myu") }));

// TODO make syntax metadata
export interface Position {
  index: number;
  row: number;
  col: number;
}

export interface Range {
  start: Position;
  end?: Position;
}

export interface Token {
  tag: Tag;
  text: string;
  range: Range;
}
