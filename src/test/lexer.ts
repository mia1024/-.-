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
    ];

    for (const c of cases) {
      const result = Lexer.lex(c.input);
      t.ok(result.ok);
      if (!result.ok) return; // type guard

      t.strictSame(
        result.tokens.map((token) => ({ tag: token.tag, text: token.text })),
        c.tokens
      );

      t.end();
    }
  });

  t.end();
});
