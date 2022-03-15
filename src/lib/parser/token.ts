// vi: shiftwidth=4
import * as Tree from "@lib/tree";

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
    { tag: Tag.Hole, pattern: /_|◯/ },
    { tag: Tag.Dot, pattern: /\./ },
    { tag: Tag.Lambda, pattern: /\\|λ/ },
    { tag: Tag.Identifier, pattern: /[A-Za-z_]\w*/ },
    { tag: null, pattern: /\s+/ },
].map((def) => ({ ...def, pattern: RegExp(def.pattern, "myu") }));

export interface Token {
    readonly tag: Tag;
    readonly text: string;
    readonly range: Tree.Metadata.Range;
}

/* Shorthand constructors for quickly/conveniently creating token objects;
 * intended only for testing use
 */
export const shorthand = {
    pos: (i: number): Tree.Metadata.Position => ({ index: i, row: 0, col: i }),
    range: (i: number, j: number): Tree.Metadata.Range => ({
        start: { index: i, row: 0, col: i },
        end: { index: j, row: 0, col: j },
    }),
    pl: { tag: Tag.ParenL, text: "(" },
    pr: { tag: Tag.ParenR, text: ")" },
    hole: { tag: Tag.Hole, text: "_" },
    dot: { tag: Tag.Dot, text: "." },
    lambda: { tag: Tag.Lambda, text: "λ" },
    λ: { tag: Tag.Lambda, text: "λ" },
    id(s: string) {
        if (s.match(/^[A-Za-z_]\w*$/u) === null)
            throw Error("invalid identifier given");
        return { tag: Tag.Identifier, text: s };
    },
    assemble(tokens: Omit<Token, "range">[]): Token[] {
        const pos = { index: 0, row: 0, col: 0 };
        const assembled: Token[] = [];
        for (const token of tokens) {
            const start = { ...pos };
            pos.index += token.text.length;
            pos.col += token.text.length;
            assembled.push({ ...token, range: { start, end: { ...pos } } });
            pos.index += 1;
            pos.col += 1;
        }
        return assembled;
    },
};
