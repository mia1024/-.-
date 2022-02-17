import * as Pinia from "pinia";
import * as Vue from "vue";
import * as Syntax from "../lib/syntax";

export interface State {
  root: symbol;
  nodes: Record<symbol, Syntax.Expression>;
}

export const store = Pinia.defineStore("main", {
  state: (): State => {
    const rootKey = Symbol("root");
    return {
      root: rootKey,
      nodes: {
        [rootKey]: { data: { type: <const>Syntax.ExpressionType.Blank } },
      },
    };
  },
  actions: {
    reset() {
      this.nodes = {
        [this.root]: { data: { type: Syntax.ExpressionType.Blank } },
      };
    },
    clear(key: symbol) {
      this.nodes[key]!.data = { type: Syntax.ExpressionType.Blank };
    },
    insertVariable(key: symbol) {
      this.nodes[key] = {
        data: { type: Syntax.ExpressionType.Variable, name: "x" },
      };
    },
    insertAbstraction(key: symbol) {
      const bodyKey = Symbol("body");
      this.nodes[bodyKey] = { data: { type: Syntax.ExpressionType.Blank } };
      this.nodes[key] = {
        data: {
          type: Syntax.ExpressionType.Abstraction,
          parameterName: "x",
          body: bodyKey,
        },
      };
    },
    insertApplication(key: symbol) {
      const fnKey = Symbol();
      const argKey = Symbol();
      this.nodes[fnKey] = { data: { type: Syntax.ExpressionType.Blank } };
      this.nodes[argKey] = { data: { type: Syntax.ExpressionType.Blank } };
      this.nodes[key] = {
        data: {
          type: Syntax.ExpressionType.Application,
          function: fnKey,
          argument: argKey,
        },
      };
    },
  },
});

if (import.meta.hot)
  import.meta.hot.accept(Pinia.acceptHMRUpdate(store, import.meta.hot));
