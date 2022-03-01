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

// structured representation
export type Tree<Metadata> = Node<Tree<Metadata>, Metadata>;

// flattened representation
export type TreeKey = symbol; // feeling cute, might change later
export const newTreeKey = (): TreeKey => Symbol();

export type TreeDict<Metadata> = Map<TreeKey, Node<TreeKey, Metadata>>;
export const newTreeDict = <Metadata>() =>
  new Map<TreeKey, Node<TreeKey, Metadata>>();

export const mapMetadata = <Metadata, NewMetadata>(
  tree: Tree<Metadata>,
  fn: (metadata: Metadata) => NewMetadata
): Tree<NewMetadata> => {
  const goData = (data: Tree<Metadata>["data"]): Tree<NewMetadata>["data"] => {
    switch (data.type) {
      case NodeType.Blank:
      case NodeType.Variable:
        return data;
      case NodeType.Abstraction:
        return { ...data, body: go(data.body) };
      case NodeType.Application:
        return {
          ...data,
          function: go(data.function),
          argument: go(data.argument),
        };
    }
  };

  const go = (subtree: Tree<Metadata>): Tree<NewMetadata> => ({
    data: goData(subtree.data),
    metadata: fn(subtree.metadata),
  });

  return go(tree);
};

export const structure = <Metadata>(
  nodes: TreeDict<Metadata>,
  root: TreeKey
): Tree<Metadata> => {
  const node = nodes.get(root);
  if (typeof node === "undefined") throw new Error("missing subtree root");

  // TODO refactor into `structureData` helper but it's ok for now
  switch (node.data.type) {
    case NodeType.Blank:
    case NodeType.Variable:
      // TS not smart enough to directly narrow type of `node`, so we have to
      // write out each key individually
      return { data: node.data, metadata: node.metadata };
    case NodeType.Abstraction:
      return {
        metadata: node.metadata,
        data: {
          ...node.data,
          body: structure(nodes, node.data.body),
        },
      };
    case NodeType.Application:
      return {
        metadata: node.metadata,
        data: {
          ...node.data,
          function: structure(nodes, node.data.function),
          argument: structure(nodes, node.data.argument),
        },
      };
  }
};

export const flatten = <Metadata>(
  tree: Tree<Metadata>
): { nodes: TreeDict<Metadata>; root: TreeKey } => {
  const nodes = newTreeDict<Metadata>();

  const flattenData = (data: Tree<Metadata>["data"]) => {
    switch (data.type) {
      case NodeType.Blank:
      case NodeType.Variable:
        return data;
      case NodeType.Abstraction:
        return { ...data, body: flattenSubtree(data.body) };
      case NodeType.Application:
        return {
          ...data,
          function: flattenSubtree(data.function),
          argument: flattenSubtree(data.argument),
        };
    }
  };

  const flattenSubtree = (subtree: Tree<Metadata>): TreeKey => {
    const key = Symbol();
    nodes.set(key, {
      metadata: subtree.metadata,
      data: flattenData(subtree.data),
    });
    return key;
  };

  return { nodes, root: flattenSubtree(tree) };
};

export const stringifyCompact = <Metadata>(expr: Tree<Metadata>): string => {
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
