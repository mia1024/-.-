import * as Token from "./token";
import * as Tree from "@lib/tree";

export interface Error {
    range: Tree.Metadata.Range;
}

export interface LexResult {
    readonly tokens: readonly Token.Token[];
    readonly errors: readonly Error[];
}

export const lex = (input: string): LexResult => {
    const pos = { index: 0, row: 0, col: 0 };
    const tokens: Token.Token[] = [];
    const errors: Error[] = [];

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

            const end: Tree.Metadata.Position = { ...pos };

            if (def.tag !== null)
                tokens.push({
                    tag: def.tag,
                    text,
                    range: { start, end },
                });

            continue outer;
        }

        // no token patterns matched, push error & skip one character
        errors.push({
            range: {
                start: { ...pos },
                end: { index: pos.index + 1, col: pos.col + 1, row: pos.row },
            },
        });
        if (input[pos.index++] === "\n") {
            ++pos.row;
            pos.col = 0;
        } else ++pos.col;
    }

    return { tokens, errors };
};
