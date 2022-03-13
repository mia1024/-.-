export const enum Tag {
    ParenL,
    ParenR,
    Hole,
    Lambda,
    Dot,
    Identifier,
}

export interface Definition {
    readonly tag: Tag | null;
    readonly pattern: RegExp;
}

export const definitions: readonly Definition[] = [
    { tag: Tag.ParenL, pattern: /\(/ },
    { tag: Tag.ParenR, pattern: /\)/ },
    { tag: Tag.Hole, pattern: /_|○/ },
    { tag: Tag.Dot, pattern: /\./ },
    { tag: Tag.Lambda, pattern: /\\|λ/ },
    { tag: Tag.Identifier, pattern: /[A-Za-z_]\w*/ },
    { tag: null, pattern: /\s+/ },
].map((def) => ({ ...def, pattern: RegExp(def.pattern, "myu") }));

// TODO make syntax metadata
export interface Position {
    readonly index: number;
    readonly row: number;
    readonly col: number;
}

export interface Range {
    readonly start: Position;
    readonly end?: Position;
}

export interface Token {
    readonly tag: Tag;
    readonly text: string;
    readonly range: Range;
}
