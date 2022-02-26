import * as Syntax from "./syntax";

export interface TreeState {
  nodes: Syntax.TreeDict;
  trail: Syntax.TreeKey[];
}

export const init = (): TreeState => {
  const root = Symbol();
  const nodes = Syntax.newTreeDict();
  nodes.set(root, Syntax.blank());
  return { nodes, trail: [root] };
};

const newBlank = (state: TreeState): Syntax.TreeKey => {
  const key = Syntax.newTreeKey();
  state.nodes.set(key, Syntax.blank());
  return key;
};

export const makeVariable = (state: TreeState, key: Syntax.TreeKey) => {
  state.nodes.set(key, Syntax.variable("x"));
};

export const makeAbstraction = (state: TreeState, key: Syntax.TreeKey) => {
  state.nodes.set(key, Syntax.abstraction("x", newBlank(state)));
};

export const makeApplication = (state: TreeState, key: Syntax.TreeKey) => {
  state.nodes.set(key, Syntax.application(newBlank(state), newBlank(state)));
};

export const prune = (state: TreeState, key: Syntax.TreeKey) => {
  const go = (k: Syntax.TreeKey) => {
    const node = state.nodes.get(k);
    if (typeof node === "undefined") throw Error("prune root missing");

    switch (node.data.type) {
      case Syntax.NodeType.Abstraction:
        go(node.data.body);
        break;
      case Syntax.NodeType.Application:
        go(node.data.function);
        go(node.data.argument);
        break;
    }

    node.data = { type: Syntax.NodeType.Blank };
  };
  go(key);
};
