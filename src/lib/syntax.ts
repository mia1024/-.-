export const enum NodeType {
  Variable,
  Abstraction,
  Application,
  Blank,
}

// We parametrize `Node` by the `Subtree` type to conveniently enable
// both the structured and flattened tree representations.  The structured
// representation (subnodes are stored directly as nested `Node`s) is
// self-contained and a simpler/nicer data representation, but the flattened
// representation (subnodes are stored as references via TreeKeys/IDs
// corresponding to keys in a dictionary) is more well-adapted to encoding UI
// state.
export interface Node<Subtree> {
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
}

export const blank = <Subtree>(): Node<Subtree> => ({
  data: { type: NodeType.Blank },
});
export const variable = <Subtree>(name: string): Node<Subtree> => ({
  data: { type: NodeType.Variable, name },
});
export const abstraction = <Subtree>(
  parameter: string,
  body: Subtree
): Node<Subtree> => ({ data: { type: NodeType.Abstraction, parameter, body } });

export const application = <Subtree>(
  fn: Subtree,
  argument: Subtree
): Node<Subtree> => ({
  data: { type: NodeType.Application, function: fn, argument },
});

// structured representation
export type Tree = Node<Tree>;

// flattened representation
export type TreeKey = symbol; // feeling cute, might change later
export const newTreeKey = (): TreeKey => Symbol();

export type TreeDict = Map<TreeKey, Node<TreeKey>>;
export const newTreeDict = () => new Map<TreeKey, Node<TreeKey>>();

export const structure = (nodes: TreeDict, root: TreeKey): Tree => {
  const node = nodes.get(root);
  if (typeof node === "undefined") throw new Error("missing subtree root");

  switch (node.data.type) {
    case NodeType.Blank:
    case NodeType.Variable:
      return { data: node.data };
    case NodeType.Abstraction:
      return {
        data: {
          ...node.data,
          body: structure(nodes, node.data.body),
        },
      };
    case NodeType.Application:
      return {
        data: {
          ...node.data,
          function: structure(nodes, node.data.function),
          argument: structure(nodes, node.data.argument),
        },
      };
  }
};

export const flatten = (tree: Tree): { nodes: TreeDict; root: TreeKey } => {
  const nodes = treeDict();

  const go = (subtree: Tree): TreeKey => {
    const key = Symbol();
    switch (subtree.data.type) {
      case NodeType.Blank:
      case NodeType.Variable:
        nodes.set(key, { data: subtree.data });
        break;
      case NodeType.Abstraction:
        nodes.set(key, {
          data: { ...subtree.data, body: go(subtree.data.body) },
        });
        break;
      case NodeType.Application:
        nodes.set(key, {
          data: {
            ...subtree.data,
            function: go(subtree.data.function),
            argument: go(subtree.data.argument),
          },
        });
        break;
    }
    return key;
  };

  return { nodes, root: go(tree) };
};

export const stringifyCompact = (expr: Tree): string => {
  switch (expr.data.type) {
    case NodeType.Blank:
      return "_";
    case NodeType.Variable:
      return expr.data.name;
    case NodeType.Abstraction:
      return `λ${expr.data.parameter}. ${stringifyCompact(expr.data.body)}`;
    case NodeType.Application:
      const arg = stringifyCompact(expr.data.argument);
      const fn = stringifyCompact(expr.data.function);
      const parenFn =
        expr.data.function.data.type === NodeType.Abstraction ? `(${fn})` : fn;
      const parenArg =
        expr.data.argument.data.type === NodeType.Abstraction ||
        expr.data.argument.data.type === NodeType.Application
          ? `(${arg})`
          : arg;
      return `${parenFn} ${parenArg}`;
  }
};
