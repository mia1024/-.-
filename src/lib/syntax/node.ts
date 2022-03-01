export const enum NodeType {
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
export interface Node<Subtree, Metadata> {
  data:
    | { type: NodeType.Blank }
    | { type: NodeType.Variable; name: string }
    | {
        type: NodeType.Abstraction;
        parameter: string;
        body: Subtree;
      }
    | {
        type: NodeType.Application;
        function: Subtree;
        argument: Subtree;
      };
  metadata: Metadata;
}

export const blank = <Subtree, Metadata>(
  metadata: Metadata
): Node<Subtree, Metadata> => ({
  data: { type: NodeType.Blank },
  metadata,
});
export const variable = <Subtree, Metadata>(
  name: string,
  metadata: Metadata
): Node<Subtree, Metadata> => ({
  data: { type: NodeType.Variable, name },
  metadata,
});
export const abstraction = <Subtree, Metadata>(
  parameter: string,
  body: Subtree,
  metadata: Metadata
): Node<Subtree, Metadata> => ({
  data: { type: NodeType.Abstraction, parameter, body },
  metadata,
});

export const application = <Subtree, Metadata>(
  fn: Subtree,
  argument: Subtree,
  metadata: Metadata
): Node<Subtree, Metadata> => ({
  data: { type: NodeType.Application, function: fn, argument },
  metadata,
});
