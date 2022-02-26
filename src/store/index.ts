import * as Pinia from "pinia";
import * as Vue from "vue";
import * as Syntax from "../lib/syntax";
import * as SyntaxState from "../lib/state";

type BoundingBox = Record<"left" | "top" | "width" | "height", number>;
type Geometry = Record<"tree" | "node", BoundingBox>;

export interface State {
  syntax: SyntaxState.TreeState;
  geometry: Map<Syntax.TreeKey, Geometry>;

  // updated each time tree structure is modified; useful for triggering
  // DOM-layout detection stuff.  maybe we can use `ResizeObserver` too, but
  // we'll figure that out later.
  stamp: symbol;
}

export const store = Pinia.defineStore("main", {
  state: (): State => {
    return {
      syntax: SyntaxState.init(),
      geometry: new Map<Syntax.TreeKey, Geometry>(),
      stamp: Symbol(),
    };
  },
  getters: {},
  actions: {
    clear(key: symbol) {
      SyntaxState.prune(this.syntax, key);
      this.stamp = Symbol();
    },
    insertVariable(key: symbol) {
      SyntaxState.makeVariable(this.syntax, key);
      this.stamp = Symbol();
    },
    insertAbstraction(key: symbol) {
      SyntaxState.makeAbstraction(this.syntax, key);
      this.stamp = Symbol();
    },
    insertApplication(key: symbol) {
      SyntaxState.makeApplication(this.syntax, key);
      this.stamp = Symbol();
    },
    updateGeometry(key: symbol, geometry: Geometry) {
      // TODO merge this into the node state properties
      this.geometry.set(key, geometry);
    },
  },
});

if (import.meta.hot)
  import.meta.hot.accept(Pinia.acceptHMRUpdate(store, import.meta.hot));
