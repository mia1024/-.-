import { Node, NodeType } from "./node";

// structured representation
export type Tree<Metadata> = Node<Tree<Metadata>, Metadata>;

// flattened representation
export type TreeKey = symbol; // feeling cute, might change later
export const newTreeKey = (): TreeKey => Symbol();

export type TreeDict<Metadata> = Map<TreeKey, Node<TreeKey, Metadata>>;
export const newTreeDict = <Metadata>() =>
  new Map<TreeKey, Node<TreeKey, Metadata>>();

export const mapMetadata = <A, B>(
  tree: Tree<A>,
  fn: (metadata: A) => B
): Tree<B> => {
  const goData = (data: Tree<A>["data"]): Tree<B>["data"] => {
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

  const go = (subtree: Tree<A>): Tree<B> => ({
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
      return "◯";
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
      return `(${parenFn} ${parenArg})`;
  }
};
