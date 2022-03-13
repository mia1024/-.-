// vi: sw=4
import * as Token from "./token";
import * as Syntax from "../syntax";

export const enum ErrorTag {
    UnexpectedToken,
    UnexpectedEnd,
    ExtraClose,
    EmptyGroup,
}
export interface Error {
    readonly tag: ErrorTag;
    readonly token?: Token.Token; // TODO location handling for end
}

type Tree = Syntax.Tree<Token.Range>;

//const enum StateTag {
//    Start,
//    ParenStart,
//    AppOrAtom,
//    AbsLambda,
//}
//interface StateData {
//    [StateTag.Start]: null;
//    [StateTag.ParenStart]: null;
//    [StateTag.AppOrAtom]: { left: Tree };
//    [StateTag.AbsLambda]: null;
//}
//type State = { [S in StateTag]: { tag: S; data: StateData[S] } }[StateTag];

const enum TodoTag {
    Empty,
    AppOrAtom,
    Abs,
}
interface Todo {
    data:
        | { tag: TodoTag.Empty }
        | { tag: TodoTag.AppOrAtom; node: Tree }
        | { tag: TodoTag.Abs; param: string };
    paren: boolean;
    lambdaParam?: string;
}

function insertNode(elem: Todo, node: Tree) {}

function advance(
    todo: Todo[],
    tokens: Iterator<Token.Token, null, never>,
): Error | void {
    const top = todo[todo.length - 1];
    if (typeof top === "undefined") throw Error("empty todo stack");

    const token = tokens.next().value;

    switch (top.data.tag) {
        case TodoTag.Empty:
            switch (token?.tag) {
                case Token.Tag.ParenL:
                    todo.push({ data: { tag: TodoTag.Empty }, paren: true });
                    return;
                case Token.Tag.ParenR:
                    // TODO
                    return;
                case Token.Tag.Identifier:
                    insertNode(
                        top,
                        Syntax.Node.variable(token.text, token.range),
                    );
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
                                        data: { tag: TodoTag.Empty },
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
                case null:
                    return;
            }
        case TodoTag.AppOrAtom:
            switch (token?.tag) {
                case Token.Tag.ParenL:
                    todo.push({ data: { tag: TodoTag.Empty }, paren: true });
                    return;
                case Token.Tag.ParenR:
                    return;
                case Token.Tag.Identifier:
                    return;
                case Token.Tag.Lambda:
                    return;
                case Token.Tag.Dot:
                    return;
                case Token.Tag.Hole:
                    return;
                case null:
                    return;
            }
        case TodoTag.Abs:
            switch (token?.tag) {
                case Token.Tag.Identifier:
                    top.data = { tag: TodoTag.AbsBody, param: token.text };
                    return;
                case Token.Tag.ParenL:
                    return;
                case Token.Tag.ParenR:
                    return;
                case Token.Tag.Lambda:
                    return;
                case Token.Tag.Dot:
                    return;
                case Token.Tag.Hole:
                    return;
                case null:
                    return;
            }
    }
}

/**

Lambda-calculus grammar:

```
Expression -> <ApplicationOrAtom>
Expression -> [Lambda] [Identifier] [Dot] <Expression>

ApplicationOrAtom -> <Atom>
ApplicationOrAtom -> <ApplicationOrAtom> <Atom>

Atom -> [Identifier]
Atom -> [ParenL] <Expression> [ParenR]
```

The basic mechanism of this parser is based on [top-down LL(1)/predictive
parsers][^1]. We maintain a "todo stack", on which unfinished nodes are created
and assembled. When nodes are finished, they are popped off the stack and
inserted as subtrees within the new top-element of the stack, i.e., their
parent node.

Note that LL(1) parsers can't handle left recursion (i.e., rules like `A→A…`),
but our `ApplicationOrAtom` rule is left-recursive.  Predictive parsers work by
_predicting_ the rule to expand based on one token of lookahead; left-recursion
makes it impossible to make this prediction.  We work around this limitation by
essentially parsing the rule right-recursively (after all, `ApplicationOrAtom`
simply generates a list of `Atom`s--the only difference is the structure) and,
after the nodes are parsed, regrouping them left-recursively.

[1]: http://www.cs.ecu.edu/karl/5220/spr16/Notes/Top-down/LL1.html


*/

//export function parse(tokens: Token.Token[]) {
//    const stack: State[] = [{ tag: StateTag.Start, data: null }];
//    const errors: Error[] = [];
//
//    for (const token of tokens) {
//        const state = stack[stack.length - 1];
//        if (typeof state === "undefined")
//            throw Error("empty state stack, should never happen");
//
//        switch (state.tag) {
//            case StateTag.Start:
//                switch (token.tag) {
//                    case Token.Tag.ParenL:
//                        stack.push({ tag: StateTag.ParenStart, data: null });
//                        break;
//                    case Token.Tag.ParenR:
//                        errors.push({ tag: ErrorTag.ExtraClose, token });
//                        break;
//                    case Token.Tag.Identifier:
//                        stack.push({
//                            tag: StateTag.AppOrAtom,
//                            data: {
//                                left: Syntax.Node.variable(token.text, "TODO"),
//                            },
//                        });
//                        break;
//                    case Token.Tag.Lambda:
//                        stack.push({ tag: StateTag.AbsLambda, data: null });
//                        break;
//                }
//                break;
//
//            case StateTag.ParenStart:
//                switch (token.tag) {
//                    case Token.Tag.ParenL:
//                        stack.push({ tag: StateTag.ParenStart, data: null });
//                        break;
//                    case Token.Tag.ParenR:
//                        errors.push({ tag: ErrorTag.EmptyGroup, token });
//                        break;
//                    case Token.Tag.Identifier:
//                        stack.push({
//                            tag: StateTag.AppOrAtom,
//                            data: {
//                                left: Syntax.Node.variable(token.text, "TODO"),
//                            },
//                        });
//                        break;
//                    case Token.Tag.Lambda:
//                        stack.push({ tag: StateTag.AbsLambda, data: null });
//                        break;
//                }
//                break;
//
//            case StateTag.AppOrAtom:
//                tokens: switch (token.tag) {
//                    case Token.Tag.ParenL:
//                        stack.push({ tag: StateTag.ParenStart, data: null });
//                        break;
//                    case Token.Tag.ParenR:
//                        let node = state.data.left;
//                        stack.pop();
//                        for (;;) {
//                            const top = stack.pop();
//                            if (typeof top === "undefined") {
//                                errors.push({
//                                    tag: ErrorTag.ExtraClose,
//                                    token,
//                                });
//                                break tokens;
//                            }
//                            switch (top.tag) {
//                                case StateTag.ParenStart:
//                                    break;
//                            }
//                        }
//                }
//
//            case StateTag.AbsLambda:
//        }
//
//        //const action = actions[state.tag][token.tag];
//        //if (typeof action === "undefined") {
//        //    errors.push({ data: { tag: ErrorTag.UnexpectedToken, token } });
//        //    continue;
//        //}
//
//        //action(state.data, token)
//    }
//}
