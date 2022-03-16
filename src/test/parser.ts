// vi: shiftwidth=4
import * as Tap from "tap";

import * as Lexer from "../lib/parser/lexer";
import * as Parser from "../lib/parser/parser";
import * as Token from "../lib/parser/token";
import * as Tree from "../lib/tree";

Tap.test("parse from tokens", (t) => {
    const { pl, pr, q, dot, λ, id, range, assemble } = Token.shorthand;

    const cases: {
        label: string;
        tokens: Token.Token[];
        expression: Tree.Tree<Tree.Metadata.Range>;
    }[] = [
        {
            label: "var",
            tokens: assemble([id("var")]),
            expression: Tree.Node.variable("var", range(0, 3)),
        },
        {
            label: "( parenVar )",
            tokens: assemble([pl, id("parenVar"), pr]),
            expression: Tree.Node.variable("parenVar", range(0, 12)),
        },
        {
            label: "fn arg",
            tokens: assemble([id("fn"), id("arg")]),
            expression: Tree.Node.application(
                Tree.Node.variable("fn", range(0, 2)),
                Tree.Node.variable("arg", range(3, 6)),
                range(0, 6),
            ),
        },
        {
            label: "( ) ( )",
            tokens: assemble([pl, pr, pl, pr]),
            expression: Tree.Node.application(
                Tree.Node.blank(range(0, 3)),
                Tree.Node.blank(range(4, 7)),
                range(0, 7),
            ),
        },
        {
            label: "[empty]",
            tokens: [],
            expression: Tree.Node.blank(range(0, 0)),
        },
        {
            label: "λ x .",
            tokens: assemble([λ, id("x"), dot]),
            expression: Tree.Node.abstraction(
                "x",
                Tree.Node.blank(range(5, 5)),
                range(0, 5),
            ),
        },
        {
            label: "( λ x . ) y",
            tokens: assemble([pl, λ, id("x"), dot, pr, id("y")]),
            expression: Tree.Node.application(
                Tree.Node.abstraction(
                    "x",
                    Tree.Node.blank(range(8, 8)),
                    range(0, 9),
                ),
                Tree.Node.variable("y", range(10, 11)),
                range(0, 11),
            ),
        },
        {
            label: "( ) x",
            tokens: assemble([pl, pr, id("x")]),
            expression: Tree.Node.application(
                Tree.Node.blank(range(0, 3)),
                Tree.Node.variable("x", range(4, 5)),
                range(0, 5),
            ),
        },
        {
            label: "a ( b c )",
            tokens: assemble([id("a"), pl, id("b"), id("c"), pr]),
            expression: Tree.Node.application(
                Tree.Node.variable("a", range(0, 1)),
                Tree.Node.application(
                    Tree.Node.variable("b", range(4, 5)),
                    Tree.Node.variable("c", range(6, 7)),
                    range(2, 9),
                ),
                range(0, 9),
            ),
        },
        {
            label: "( a b ) c",
            tokens: assemble([pl, id("a"), id("b"), pr, id("c")]),
            expression: Tree.Node.application(
                Tree.Node.application(
                    Tree.Node.variable("a", range(2, 3)),
                    Tree.Node.variable("b", range(4, 5)),
                    range(0, 7),
                ),
                Tree.Node.variable("c", range(8, 9)),
                range(0, 9),
            ),
        },
        {
            label: "a b ? c",
            tokens: assemble([id("a"), id("b"), q, id("c")]),
            expression: Tree.Node.application(
                Tree.Node.application(
                    Tree.Node.application(
                        Tree.Node.variable("a", range(0, 1)),
                        Tree.Node.variable("b", range(2, 3)),
                        range(0, 3),
                    ),
                    Tree.Node.variable("", range(4, 5)),
                    range(0, 5),
                ),
                Tree.Node.variable("c", range(6, 7)),
                range(0, 7),
            ),
        },
        {
            label: "λ x . y",
            tokens: assemble([λ, id("x"), dot, id("y")]),
            expression: Tree.Node.abstraction(
                "x",
                Tree.Node.variable("y", range(6, 7)),
                range(0, 7),
            ),
        },
        {
            label: "λ .",
            tokens: assemble([λ, dot]),
            expression: Tree.Node.abstraction(
                "",
                Tree.Node.blank(range(3, 3)),
                range(0, 3),
            ),
        },
        {
            label: "λ x . λ y . y x",
            tokens: assemble([
                λ,
                id("x"),
                dot,
                λ,
                id("y"),
                dot,
                id("y"),
                id("x"),
            ]),
            expression: Tree.Node.abstraction(
                "x",
                Tree.Node.abstraction(
                    "y",
                    Tree.Node.application(
                        Tree.Node.variable("y", range(12, 13)),
                        Tree.Node.variable("x", range(14, 15)),
                        range(12, 15),
                    ),
                    range(6, 15),
                ),
                range(0, 15),
            ),
        },
        {
            label: "( ( x ( ( y ) ) ) )",
            tokens: assemble([
                pl,
                pl,
                id("x"),
                pl,
                pl,
                id("y"),
                pr,
                pr,
                pr,
                pr,
            ]),
            expression: Tree.Node.application(
                Tree.Node.variable("x", range(4, 5)),
                Tree.Node.variable("y", range(6, 15)),
                range(0, 19),
            ),
        },
        {
            label: "( λ x . x ) ( λ y . y ) f",
            tokens: assemble([
                pl,
                λ,
                id("x"),
                dot,
                id("x"),
                pr,
                pl,
                λ,
                id("y"),
                dot,
                id("y"),
                pr,
                id("f"),
            ]),
            expression: Tree.Node.application(
                Tree.Node.application(
                    Tree.Node.abstraction(
                        "x",
                        Tree.Node.variable("x", range(8, 9)),
                        range(0, 11),
                    ),
                    Tree.Node.abstraction(
                        "y",
                        Tree.Node.variable("y", range(20, 21)),
                        range(12, 23),
                    ),
                    range(0, 23),
                ),
                Tree.Node.variable("f", range(24, 25)),
                range(0, 25),
            ),
        },
        {
            label: "( ( λ x . ( ( x ) ) ) )",
            tokens: assemble([
                pl,
                pl,
                λ,
                id("x"),
                dot,
                pl,
                pl,
                id("x"),
                pr,
                pr,
                pr,
                pr,
            ]),
            expression: Tree.Node.abstraction(
                "x",
                Tree.Node.variable("x", range(10, 19)),
                range(0, 23),
            ),
        },
        {
            label: "λ x y . y x",
            tokens: assemble([λ, id("x"), id("y"), dot, id("y"), id("x")]),
            expression: Tree.Node.abstraction(
                "x",
                Tree.Node.abstraction(
                    "y",
                    Tree.Node.application(
                        Tree.Node.variable("y", range(8, 9)),
                        Tree.Node.variable("x", range(10, 11)),
                        range(8, 11),
                    ),
                    range(4, 11),
                ),
                range(0, 11),
            ),
        },
        {
            label: "a ( λ v w x . λ y z . b ) c",
            tokens: assemble([
                id("a"),
                pl,
                λ,
                id("v"),
                id("w"),
                id("x"),
                dot,
                λ,
                id("y"),
                id("z"),
                dot,
                id("b"),
                pr,
                id("c"),
            ]),
            expression: Tree.Node.application(
                Tree.Node.application(
                    Tree.Node.variable("a", range(0, 1)),
                    Tree.Node.abstraction(
                        "v",
                        Tree.Node.abstraction(
                            "w",
                            Tree.Node.abstraction(
                                "x",
                                Tree.Node.abstraction(
                                    "y",
                                    Tree.Node.abstraction(
                                        "z",
                                        Tree.Node.variable("b", range(22, 23)),
                                        range(18, 23),
                                    ),
                                    range(14, 23),
                                ),
                                range(10, 23),
                            ),
                            range(8, 23),
                        ),
                        range(2, 25),
                    ),
                    range(0, 25),
                ),
                Tree.Node.variable("c", range(26, 27)),
                range(0, 27),
            ),
        },
    ];

    for (const c of cases) {
        const result = Parser.parse(c.tokens);
        t.strictSame(result.errors, [], c.label);
        t.strictSame(result.expression, c.expression, c.label);
    }

    t.end();
});

Tap.test("lex + parse", (t) => {
    t.end();
});
