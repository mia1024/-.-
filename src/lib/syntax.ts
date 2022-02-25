export const enum ExpressionType {
  Variable,
  Abstraction,
  Application,
  Blank,
}

// We parametrize `Expression` by the `Subtree` type to conveniently enable
// both the structured and flattened tree representations.  The structured
// representation (subtrees are stored directly as nested `Expression`s) is
// self-contained and a simpler/nicer data representation, but the flattened
// representation (subtrees are stored as references via TreeKeys/IDs
// corresponding to keys in a dictionary) is more well-adapted to encoding UI
// state.  The `Extra` type parameter is used to optionally attach extra
// UI-relevant data--e.g., line/column position, etc.
export interface Expression<Subtree, Extra> {
  data:
    | { type: ExpressionType.Blank }
    | { type: ExpressionType.Variable; name: string }
    | {
        type: ExpressionType.Abstraction;
        parameter: string;
        body: Subtree;
      }
    | {
        type: ExpressionType.Application;
        function: Subtree;
        argument: Subtree;
      };
  extra: Extra;
}

// structured representation
export type Tree<Extra> = Expression<Tree<Extra>, Extra>;

// flattened representation
type TreeKey = symbol; // feeling cute, might change later
export type TreeDict<Extra> = Map<TreeKey, Expression<TreeKey, Extra>>;

export const structure = <Extra>(
  trees: TreeDict<Extra>,
  root: TreeKey
): Tree<Extra> => {
  const node = trees.get(root);
  if (typeof node === "undefined") throw new Error("missing subtree root");

  switch (node.data.type) {
    case ExpressionType.Blank:
    case ExpressionType.Variable:
      return { extra: node.extra, data: node.data };
    case ExpressionType.Abstraction:
      return {
        extra: node.extra,
        data: {
          ...node.data,
          body: structure(trees, node.data.body),
        },
      };
    case ExpressionType.Application:
      return {
        extra: node.extra,
        data: {
          ...node.data,
          function: structure(trees, node.data.function),
          argument: structure(trees, node.data.argument),
        },
      };
  }
};

export const flatten = <Extra>(
  tree: Tree<Extra>
): { trees: TreeDict<Extra>; root: TreeKey } => {
  const trees = new Map<TreeKey, Expression<TreeKey, Extra>>();

  const go = (subtree: Tree<Extra>): TreeKey => {
    const key = Symbol();
    switch (subtree.data.type) {
      case ExpressionType.Blank:
      case ExpressionType.Variable:
        trees.set(key, { extra: subtree.extra, data: subtree.data });
        break;
      case ExpressionType.Abstraction:
        trees.set(key, {
          extra: subtree.extra,
          data: { ...subtree.data, body: go(subtree.data.body) },
        });
        break;
      case ExpressionType.Application:
        trees.set(key, {
          extra: subtree.extra,
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

  return { trees, root: go(tree) };
};

export const stringifyCompact = <Extra>(expr: Tree<Extra>): string => {
  switch (expr.data.type) {
    case ExpressionType.Blank:
      return "_";
    case ExpressionType.Variable:
      return expr.data.name;
    case ExpressionType.Abstraction:
      return `λ${expr.data.parameter}. ${stringifyCompact(expr.data.body)}`;
    case ExpressionType.Application:
      const arg = stringifyCompact(expr.data.argument);
      const fn = stringifyCompact(expr.data.function);
      const parenFn =
        expr.data.function.data.type === ExpressionType.Abstraction
          ? `(${fn})`
          : fn;
      const parenArg =
        expr.data.argument.data.type === ExpressionType.Abstraction ||
        expr.data.argument.data.type === ExpressionType.Application
          ? `(${arg})`
          : arg;
      return `${parenFn} ${parenArg}`;
  }
};
