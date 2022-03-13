import * as Token from "./token";

export interface LexError {
    range: Token.Range;
}

export type LexResult =
    | { ok: true; tokens: readonly Token.Token[] }
    | { ok: false; errors: readonly LexError[] };

export const lex = (input: string): LexResult => {
    const pos = { index: 0, row: 0, col: 0 };
    const tokens: Token.Token[] = [];
    const errors: LexError[] = [];

    outer: while (pos.index < input.length) {
        for (const def of Token.definitions) {
            def.pattern.lastIndex = pos.index;
            const match = def.pattern.exec(input);

            if (match === null) continue;
            const text = match[0]!;

            const start = { ...pos };

            const lines = text.split("\n");
            pos.index = def.pattern.lastIndex;
            pos.row += lines.length - 1;
            pos.col = lines[lines.length - 1]!.length;

            const end: Token.Position = { ...pos };

            if (def.tag !== null)
                tokens.push({
                    tag: def.tag,
                    text,
                    range: { start, end },
                });

            continue outer;
        }

        // no token patterns matched, push error & skip one character
        errors.push({ range: { start: pos } });
        if (input[pos.index++] === "\n") {
            ++pos.row;
            pos.col = 0;
        } else ++pos.col;
    }

    return errors.length === 0 ? { ok: true, tokens } : { ok: false, errors };
};
