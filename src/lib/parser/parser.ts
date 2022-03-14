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

const enum ContainerTag {
    Paren,
    Root,
    Lambda,
}

// parametrized to distinguish between incomplete (i.e., not-necessarily-filled)
// elements vs. complete (i.e., non-null node) elements
interface Todo<Node> {
    node: Node;
    container:
        | { tag: ContainerTag.Root }
        | { tag: ContainerTag.Paren; start: Token.Position }
        | { tag: ContainerTag.Lambda; param: string; start: Token.Position };
}

export type Result =
    | { readonly ok: true; readonly expression: Tree | null }
    | { readonly ok: false; readonly errors: readonly Error[] };

interface State {
    readonly todo: Todo<Tree | undefined>[];
    readonly errs: Error[];
    readonly tokens: IterableIterator<Token.Token>;
    end: Token.Position;
}

const handleToken: Record<
    Token.Tag,
    (state: State, token: Token.Token) => void
> = {
    [Token.Tag.ParenL](state, token) {
        state.todo.push({
            node: undefined,
            container: { tag: ContainerTag.Paren, start: token.range.start },
            //paren: token.range.start,
            //lambda: null,
        });
    },
    [Token.Tag.Identifier](state, token) {
        insertTop(state, Syntax.Node.variable(token.text, token.range));
    },
    [Token.Tag.Hole](state, token) {
        insertTop(state, Syntax.Node.blank(token.range));
    },
    [Token.Tag.ParenR](state, token) {
        for (;;) {
            const top = state.todo.pop();
            if (typeof top === "undefined") throw Error("empty stack");

            if (typeof top.node === "undefined") {
                state.errs.push({ tag: ErrorTag.EmptyExpression, token });
                return;
            }

            // reconstruct to narrow type
            const tree = finalize({ ...top, node: top.node }, token.range.end);

            const parent = state.todo[state.todo.length - 1];
            if (typeof parent === "undefined") throw Error("empty");
            insertNode(parent, tree);

            //if (top.paren !== null) return;
            if (top.container.tag === ContainerTag.Paren) return;
        }
    },
    [Token.Tag.Dot](state, token) {
        state.errs.push({ tag: ErrorTag.UnexpectedToken, token });
        return;
    },
    [Token.Tag.Lambda](state, tokenLambda) {
        // TODO handle mandatory paren elsewhere???
        const top = state.todo[state.todo.length - 1];

        if (typeof top === "undefined") throw Error("empty stack");

        if (typeof top.node !== "undefined") {
            state.errs.push({
                tag: ErrorTag.UnexpectedToken,
                token: tokenLambda,
            });
            return;
        }

        const first = state.tokens.next();
        if (first.done) {
            state.errs.push({ tag: ErrorTag.UnexpectedEnd });
            return;
        }
        if (first.value.tag !== Token.Tag.Identifier) {
            state.errs.push({
                tag: ErrorTag.UnexpectedToken,
                token: first.value,
            });
            return;
        }

        // real stuff
        const curr: Todo<Tree | undefined> = {
            node: undefined,
            container: {
                tag: ContainerTag.Lambda,
                param: first.value.text,
                start: tokenLambda.range.start,
            },
            //paren: null,
            //lambda: null,
        };
        state.todo.push(curr);

        for (;;) {
            const next = state.tokens.next();
            if (next.done) {
                state.errs.push({ tag: ErrorTag.UnexpectedEnd });
                return;
            }
            const token = next.value;
            state.end = token.range.end;

            switch (token.tag) {
                case Token.Tag.Identifier:
                    state.todo.push({
                        node: undefined,
                        container: {
                            tag: ContainerTag.Lambda,
                            param: token.text,
                            start: token.range.start,
                        },
                    });
                    continue;
                case Token.Tag.Dot:
                    return;
            }
        }
    },
};

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
export function parse(tokens: Token.Token[]): Result {
    if (tokens.length === 0) return { ok: true, expression: null };

    const state: State = {
        todo: [
            {
                node: undefined,
                container: {
                    tag: ContainerTag.Root,
                } /*paren: null, lambda: null */,
            },
        ],
        errs: [],
        tokens: tokens[Symbol.iterator](),
        end: Token.start,
    };

    for (;;) {
        const step = state.tokens.next();

        if (step.done) {
            const expression = handleEnd(state);
            return state.errs.length === 0
                ? { ok: true, expression }
                : { ok: false, errors: state.errs };
        }

        const token = step.value;
        state.end = token.range.end;
        handleToken[token.tag](state, token);
    }
}

function insertNode(elem: Todo<Tree | undefined>, node: Tree) {
    elem.node =
        typeof elem.node === "undefined"
            ? node
            : Syntax.Node.application(elem.node, node, {
                  start: elem.node.metadata.start,
                  end: node.metadata.end,
              });
}

function insertTop(state: State, node: Tree) {
    const top = state.todo[state.todo.length - 1];
    if (typeof top === "undefined") throw Error("empty stack");
    insertNode(top, node);
}

function finalize(todo: Todo<Tree>, parenEnd: Token.Position): Tree {
    switch (todo.container.tag) {
        case ContainerTag.Root:
            return todo.node;
        case ContainerTag.Lambda:
            return Syntax.Node.abstraction(todo.container.param, todo.node, {
                start: todo.container.start,
                end: todo.node.metadata.end,
            });
        case ContainerTag.Paren:
            return {
                ...todo.node,
                metadata: { start: todo.container.start, end: parenEnd },
            };
    }
}

function handleEnd(state: State): Tree | null {
    const top = state.todo.pop();
    if (typeof top === "undefined") throw Error("empty stack");

    for (let curr = top; ; ) {
        if (curr.container.tag === ContainerTag.Paren) {
            state.errs.push({ tag: ErrorTag.UnclosedParenthesis });
            return null;
        }

        if (typeof curr.node === "undefined") {
            state.errs.push({ tag: ErrorTag.EmptyExpression });
            return null;
        }

        // reconstruct to narrow type (could also cast, but prefer not to on principle)
        const tree = finalize({ ...curr, node: curr.node }, state.end);

        const parent = state.todo.pop();
        if (typeof parent === "undefined") return tree;
        insertNode(parent, tree);
        curr = parent;
    }
}
