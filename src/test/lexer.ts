import * as Tap from "tap";
import * as Lexer from "../lib/parser/lexer";
import * as Token from "../lib/parser/token";

Tap.test("lexer", (t) => {
    t.test("basic examples", (t) => {
        const cases = [
            {
                input: "()",
                tokens: [
                    { tag: Token.Tag.ParenL, text: "(" },
                    { tag: Token.Tag.ParenR, text: ")" },
                ],
            },
            {
                input: "(λ y. xy)",
                tokens: [
                    { tag: Token.Tag.ParenL, text: "(" },
                    { tag: Token.Tag.Lambda, text: "λ" },
                    { tag: Token.Tag.Identifier, text: "y" },
                    { tag: Token.Tag.Dot, text: "." },
                    { tag: Token.Tag.Identifier, text: "xy" },
                    { tag: Token.Tag.ParenR, text: ")" },
                ],
            },
            {
                input: "λa○bc _",
                tokens: [
                    { tag: Token.Tag.Lambda, text: "λ" },
                    { tag: Token.Tag.Identifier, text: "a" },
                    { tag: Token.Tag.Hole, text: "○" },
                    { tag: Token.Tag.Identifier, text: "bc" },
                    { tag: Token.Tag.Hole, text: "_" },
                ],
            },
            {
                input: "\\x. x y(\\z.(zy)x)",
                tokens: [
                    { tag: Token.Tag.Lambda, text: "\\" },
                    { tag: Token.Tag.Identifier, text: "x" },
                    { tag: Token.Tag.Dot, text: "." },
                    { tag: Token.Tag.Identifier, text: "x" },
                    { tag: Token.Tag.Identifier, text: "y" },
                    { tag: Token.Tag.ParenL, text: "(" },
                    { tag: Token.Tag.Lambda, text: "\\" },
                    { tag: Token.Tag.Identifier, text: "z" },
                    { tag: Token.Tag.Dot, text: "." },
                    { tag: Token.Tag.ParenL, text: "(" },
                    { tag: Token.Tag.Identifier, text: "zy" },
                    { tag: Token.Tag.ParenR, text: ")" },
                    { tag: Token.Tag.Identifier, text: "x" },
                    { tag: Token.Tag.ParenR, text: ")" },
                ],
            },
        ];

        for (const c of cases) {
            const result = Lexer.lex(c.input);
            t.ok(result.ok);
            if (!result.ok) return; // type guard

            t.strictSame(
                result.tokens.map((token) => ({
                    tag: token.tag,
                    text: token.text,
                })),
                c.tokens,
            );
        }

        t.end();
    });

    // TODO test positions

    t.end();
});
