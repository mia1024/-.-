import * as Node from "./node";
export * as Node from "./node";

export * as Metadata from "./metadata";

// structured representation
export type Tree<M> = Node.Node<Tree<M>, M>;

// flattened representation
export type TreeKey = symbol; // feeling cute, might change later
export const newTreeKey = (): TreeKey => Symbol();

export type TreeDict<Metadata> = Map<TreeKey, Node.Node<TreeKey, Metadata>>;
export const newTreeDict = <Metadata>() =>
    new Map<TreeKey, Node.Node<TreeKey, Metadata>>();

export const mapMetadata = <A, B>(
    tree: Tree<A>,
    fn: (metadata: A) => B,
): Tree<B> => {
    const goData = (data: Tree<A>["data"]): Tree<B>["data"] => {
        switch (data.tag) {
            case Node.Tag.Blank:
            case Node.Tag.Variable:
                return data;
            case Node.Tag.Abstraction:
                return {
                    ...data,
                    parameter: {
                        name: data.parameter.name,
                        metadata: fn(data.parameter.metadata),
                    },
                    body: go(data.body),
                };
            case Node.Tag.Application:
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
    root: TreeKey,
): Tree<Metadata> => {
    const node = nodes.get(root);
    if (typeof node === "undefined") throw new Error("missing subtree root");

    // TODO refactor into `structureData` helper but it's ok for now
    switch (node.data.tag) {
        case Node.Tag.Blank:
        case Node.Tag.Variable:
            // TS not smart enough to directly narrow type of `node`, so we have to
            // write out each key individually
            return { data: node.data, metadata: node.metadata };
        case Node.Tag.Abstraction:
            return {
                metadata: node.metadata,
                data: {
                    ...node.data,
                    body: structure(nodes, node.data.body),
                },
            };
        case Node.Tag.Application:
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
    tree: Tree<Metadata>,
): { nodes: TreeDict<Metadata>; root: TreeKey } => {
    const nodes = newTreeDict<Metadata>();

    const flattenData = (data: Tree<Metadata>["data"]) => {
        switch (data.tag) {
            case Node.Tag.Blank:
            case Node.Tag.Variable:
                return data;
            case Node.Tag.Abstraction:
                return { ...data, body: flattenSubtree(data.body) };
            case Node.Tag.Application:
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
    switch (expr.data.tag) {
        case Node.Tag.Blank:
            return "()";
        case Node.Tag.Variable:
            return expr.data.name || "?";
        case Node.Tag.Abstraction:
            return `(λ${expr.data.parameter}. ${stringifyCompact(
                expr.data.body,
            )})`;
        case Node.Tag.Application:
            const arg = stringifyCompact(expr.data.argument);
            const fn = stringifyCompact(expr.data.function);
            return `(${fn} ${arg})`;
    }
};
