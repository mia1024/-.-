// vi: sw=4
import * as Token from "./token";
import * as Syntax from "../syntax";

export const enum ErrorTag {
    UnexpectedToken,
    UnexpectedEnd,
    ExtraClose,
    EmptyExpression,
    UnclosedParenthesis,
}
export interface Error {
    readonly tag: ErrorTag;
    readonly token?: Token.Token; // TODO location handling for end
}

type Tree = Syntax.Tree<Token.Range>;

interface Todo {
    node: Tree | undefined;
    paren: boolean;
    lambdaParam?: string;
}

export type Result =
    | { readonly ok: true; readonly expression: Tree | null }
    | { readonly ok: false; readonly errors: readonly Error[] };

function insertNode(elem: Todo, node: Tree) {
    elem.node =
        typeof elem.node === "undefined"
            ? node
            : Syntax.Node.application(elem.node, node, node.metadata); // TODO fix metadata
}

const advanceEmpty: Record<
    Token.Tag,
    (args: {
        top: Todo;
        token: Token.Token;
        todo: Todo[];
        tokens: Iterator<Token.Token, null, never>;
    }) => Error | void
> = {
    [Token.Tag.ParenL]({ todo }) {
        todo.push({ node: undefined, paren: true });
    },
    [Token.Tag.ParenR]() {
        return { tag: ErrorTag.EmptyExpression };
    },
    [Token.Tag.Identifier]({ top, token }) {
        insertNode(top, Syntax.Node.variable(token.text, token.range));
    },
    [Token.Tag.Lambda]({ top, todo, tokens }) {
        params: for (;;) {
            const token = tokens.next().value;
            switch (token?.tag) {
                case Token.Tag.Identifier:
                    if (typeof top.lambdaParam === "undefined")
                        top.lambdaParam = token.text;
                    else
                        todo.push({
                            node: undefined,
                            paren: false,
                            lambdaParam: token.text,
                        });
                    break;
                case Token.Tag.Dot:
                    break params;
                case null:
                    return { tag: ErrorTag.UnexpectedEnd };
            }

            break;
        }
        return;
    },
    [Token.Tag.Dot]({ token }) {
        return { tag: ErrorTag.UnexpectedToken, token };
    },
    [Token.Tag.Hole]({ token, top }) {
        insertNode(top, Syntax.Node.blank(token.range));
    },
};

function finalize(todo: Todo): Tree {
    if (typeof todo.node === "undefined") throw Error("finalizing empty node");
    return typeof todo.lambdaParam === "undefined"
        ? todo.node
        : Syntax.Node.abstraction(todo.lambdaParam, todo.node, <any>"TODO");
}

function advance(
    todo: Todo[],
    tokens: Iterator<Token.Token, null, never>,
): Error | void {
    const top = todo[todo.length - 1];
    if (typeof top === "undefined") throw Error("empty todo stack");

    const token = tokens.next().value;

    if (typeof top.node === "undefined") {
        if (token === null) {
            return { tag: ErrorTag.EmptyExpression };
        }
        switch (token.tag) {
            case Token.Tag.ParenL:
                todo.push({ node: undefined, paren: true });
                return;
            case Token.Tag.ParenR:
                return { tag: ErrorTag.EmptyExpression, token };
            case Token.Tag.Identifier:
                insertNode(top, Syntax.Node.variable(token.text, token.range));
                return;
            case Token.Tag.Lambda:
                params: for (;;) {
                    const token = tokens.next().value;
                    switch (token?.tag) {
                        case Token.Tag.Identifier:
                            if (typeof top.lambdaParam === "undefined")
                                top.lambdaParam = token.text;
                            else
                                todo.push({
                                    node: undefined,
                                    paren: false,
                                    lambdaParam: token.text,
                                });
                            break;
                        case Token.Tag.Dot:
                            break params;
                        case null:
                            return { tag: ErrorTag.UnexpectedEnd };
                    }

                    break;
                }
                return;
            case Token.Tag.Dot:
                return { tag: ErrorTag.UnexpectedToken, token };
            case Token.Tag.Hole:
                insertNode(top, Syntax.Node.blank(token.range));
                return;
        }
    }

    if (token === null) {
        // TODO avoid redundant null checks
        for (;;) {
            const top = todo.pop();
            if (typeof top === "undefined") throw Error("empty stack");

            if (top.paren) return { tag: ErrorTag.UnclosedParenthesis };

            const tree = finalize(top);

            const parent = todo[todo.length - 1];
            if (typeof parent === "undefined") return;
            insertNode(parent, tree);
        }
    }
    switch (token.tag) {
        case Token.Tag.ParenL:
            todo.push({ node: undefined, paren: true });
            return;
        case Token.Tag.ParenR: {
            for (;;) {
                const top = todo.pop();
                if (typeof top === "undefined")
                    return { tag: ErrorTag.ExtraClose, token };

                const tree = finalize(top);
                if (top.paren) {
                    const last = todo[todo.length - 1];
                    if (typeof last === "undefined") throw Error("empty");
                    insertNode(last, tree);
                    return;
                }
            }
        }
        case Token.Tag.Identifier:
            top.node = Syntax.Node.application(
                top.node,
                Syntax.Node.variable(token.text, token.range),
                token.range, // TODO
            );
            return;
        case Token.Tag.Lambda:
            return { tag: ErrorTag.UnexpectedToken, token };
        case Token.Tag.Dot:
            return { tag: ErrorTag.UnexpectedToken, token };
        case Token.Tag.Hole:
            top.node = Syntax.Node.application(
                top.node,
                Syntax.Node.blank(token.range),
                token.range, // TODO
            );
            return;
    }
}

/**

Lambda-calculus grammar:

```
Expression -> <ApplicationOrAtom>
Expression -> [Lambda] [Identifier] <LambdaRest>

LambdaRest -> [Dot] <Expression>
LambdaRest -> [Identifier] <LambdaRest>

ApplicationOrAtom -> <Atom>
ApplicationOrAtom -> <ApplicationOrAtom> <Atom>

Atom -> [Identifier]
Atom -> [ParenL] <Expression> [ParenR]
```

The basic mechanism of this parser is based on that of [predictive
parsers][^1]. We maintain a "todo stack", on which unfinished nodes are created
and assembled. When nodes are finished, they are popped off the stack and
inserted as subtrees within the new top-element of the stack, i.e., their
parent node.

[1]: http://www.cs.ecu.edu/karl/5220/spr16/Notes/Top-down/LL1.html

*/
function parse(tokens: Token.Token[]): Result {
    if (tokens.length === 0) return { ok: true, expression: null };
    const iter = tokens[Symbol.iterator]();

    for (;;) {
        const step = iter.next();
        const token = step.done ? null : step.value;
    }
}
