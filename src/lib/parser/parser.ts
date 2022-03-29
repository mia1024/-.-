// vi: sw=4
import * as Token from "./token";
import * as Tree from "../tree";

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

type Tree = Tree.Tree<Tree.Metadata.Range>;

const enum ContainerTag {
    Paren,
    Root,
    Lambda,
}

// parametrized to distinguish between incomplete (i.e., not-necessarily-filled)
// elements vs. complete (i.e., non-null node) elements
interface Todo {
    node: Tree | undefined;
    container:
        | { tag: ContainerTag.Root }
        | { tag: ContainerTag.Paren; start: Tree.Metadata.Position }
        | {
              tag: ContainerTag.Lambda;
              param: string;
              start: Tree.Metadata.Position;
              paramStart: Tree.Metadata.Position;
              paramEnd: Tree.Metadata.Position;
          };
}

//export type Result =
//    | { readonly ok: true; readonly expression: Tree | null }
//    | { readonly ok: false; readonly errors: readonly Error[] };

export interface Result {
    readonly expression: Tree;
    readonly errors: readonly Error[];
}

interface State {
    readonly todo: Todo[];
    readonly errs: Error[];
    readonly tokens: IterableIterator<Token.Token>;
    end: Tree.Metadata.Position;
}

const handleToken: Record<
    Token.Tag,
    (state: State, token: Token.Token) => void
> = {
    [Token.Tag.ParenL](state, token) {
        state.todo.push({
            node: undefined,
            container: { tag: ContainerTag.Paren, start: token.range.start },
        });
    },
    [Token.Tag.Identifier](state, token) {
        insertTop(state, Tree.Node.variable(token.text, token.range));
    },
    [Token.Tag.Blank](state, token) {
        insertTop(state, Tree.Node.variable("", token.range));
    },
    [Token.Tag.ParenR](state, token) {
        for (;;) {
            const top = state.todo.pop();
            if (typeof top === "undefined") throw Error("empty stack");

            const tree = finalize(top, token.range.start, token.range.end);

            const parent = state.todo[state.todo.length - 1];
            if (typeof parent === "undefined") {
                state.errs.push({ tag: ErrorTag.ExtraClose, token });
                state.todo.push(top); // for error recovery
                return;
            }
            insertNode(parent, tree);

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
        state.end = first.value.range.end;

        switch (first.value.tag) {
            case Token.Tag.Dot:
                state.todo.push({
                    node: undefined,
                    container: {
                        tag: ContainerTag.Lambda,
                        param: "",
                        paramStart: first.value.range.start,
                        paramEnd: first.value.range.start,
                        start: tokenLambda.range.start,
                    },
                });
                return;
            case Token.Tag.Identifier:
                break;
            default:
                state.errs.push({
                    tag: ErrorTag.UnexpectedToken,
                    token: first.value,
                });
                return;
        }

        // real stuff
        state.todo.push({
            node: undefined,
            container: {
                tag: ContainerTag.Lambda,
                param: first.value.text,
                paramStart: first.value.range.start,
                paramEnd: first.value.range.end,
                start: tokenLambda.range.start,
            },
        });

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
                            paramStart: token.range.start,
                            paramEnd: token.range.end,
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
export function parse(tokens: readonly Token.Token[]): Result {
    const state: State = {
        todo: [
            {
                node: undefined,
                container: {
                    tag: ContainerTag.Root,
                },
            },
        ],
        errs: [],
        tokens: tokens[Symbol.iterator](),
        end: Tree.Metadata.startPosition,
    };

    for (;;) {
        const step = state.tokens.next();

        if (step.done) {
            const expression = handleEnd(state);
            return { expression, errors: state.errs };
        }

        const token = step.value;
        state.end = token.range.end;
        handleToken[token.tag](state, token);
    }
}

function insertNode(elem: Todo, node: Tree) {
    elem.node =
        typeof elem.node === "undefined"
            ? node
            : Tree.Node.application(elem.node, node, {
                  start: elem.node.metadata.start,
                  end: node.metadata.end,
              });
}

function insertTop(state: State, node: Tree) {
    const top = state.todo[state.todo.length - 1];
    if (typeof top === "undefined") throw Error("empty stack");
    insertNode(top, node);
}

function finalize(
    todo: Todo,
    endBefore: Tree.Metadata.Position,
    endAfter: Tree.Metadata.Position,
): Tree {
    const node =
        todo.node ?? Tree.Node.blank({ start: endBefore, end: endBefore });
    switch (todo.container.tag) {
        case ContainerTag.Root:
            return node;
        case ContainerTag.Lambda:
            return Tree.Node.abstraction(
                todo.container.param,
                node,
                {
                    start: todo.container.paramStart,
                    end: todo.container.paramEnd,
                },
                {
                    start: todo.container.start,
                    end: node.metadata.end,
                },
            );
        case ContainerTag.Paren:
            return {
                ...node,
                metadata: { start: todo.container.start, end: endAfter },
            };
    }
}

function handleEnd(state: State): Tree {
    const top = state.todo.pop();
    if (typeof top === "undefined") throw Error("empty stack");

    for (let curr = top; ; ) {
        if (curr.container.tag === ContainerTag.Paren)
            state.errs.push({ tag: ErrorTag.UnclosedParenthesis });

        const tree = finalize(curr, state.end, state.end);

        const parent = state.todo.pop();
        if (typeof parent === "undefined") return tree;
        insertNode(parent, tree);
        curr = parent;
    }
}
