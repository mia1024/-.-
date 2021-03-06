import * as Lib from "@lib/common";

export const enum Tag {
    Variable,
    Abstraction,
    Application,
    Blank,
}
// We parametrize `Node` by the `Subtree` type to conveniently enable both the
// structured and flattened tree representations.  The structured
// representation (subnodes are stored directly as nested `Node`s) is
// self-contained and a simpler/nicer data representation, but the flattened
// representation (subnodes are stored as references via TreeKeys/IDs
// corresponding to keys in a dictionary) is more well-adapted to encoding UI
// state.  The `Metadata` type parameter is used to store UI-related data, e.g.
// window coordinates for drawing edges, row/col numbers in code editor, etc.

//export type Data<Subtree, Metadata> = {
//    [Tag.Blank]: {};
//    [Tag.Variable]: { name: string };
//    [Tag.Abstraction]: {
//        parameter: { name: string; metadata: Metadata };
//        body: Subtree;
//    };
//    [Tag.Application]: { function: Subtree; argument: Subtree };
//};
//
//export type Node<Subtree, Metadata> = {
//    data: {}
//    metadata: Metadata;
//};

//export type NodeFor<T extends Tag, Subtree, Metadata> = {
//    data: Data<Subtree, Metadata>[T];
//    metadata: Metadata;
//};

export interface Node<Subtree, Metadata> {
    data:
        | { tag: Tag.Blank }
        | { tag: Tag.Variable; name: string }
        | {
              tag: Tag.Abstraction;
              parameter: { name: string; metadata: Metadata };
              body: Subtree;
          }
        | {
              tag: Tag.Application;
              function: Subtree;
              argument: Subtree;
          };
    metadata: Metadata;
}

export function blank<Subtree, Metadata>(
    metadata: Metadata,
): Node<Subtree, Metadata> {
    return {
        data: { tag: Tag.Blank },
        metadata,
    };
}

export function variable<Subtree, Metadata>(
    name: string,
    metadata: Metadata,
): Node<Subtree, Metadata> {
    return {
        data: { tag: Tag.Variable, name },
        metadata,
    };
}

export function abstraction<Subtree, Metadata>(
    parameterName: string,
    body: Subtree,
    parameterMetadata: Metadata,
    metadata: Metadata,
): Node<Subtree, Metadata> {
    return {
        data: {
            tag: Tag.Abstraction,
            parameter: { name: parameterName, metadata: parameterMetadata },
            body,
        },
        metadata,
    };
}

export function application<Subtree, Metadata>(
    fn: Subtree,
    argument: Subtree,
    metadata: Metadata,
): Node<Subtree, Metadata> {
    return {
        data: { tag: Tag.Application, function: fn, argument },
        metadata,
    };
}
