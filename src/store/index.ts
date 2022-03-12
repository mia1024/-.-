import * as Pinia from "pinia";
import * as Syntax from "../lib/syntax";

export * as SyntaxStore from "./syntax";

export { store as syntax } from "./syntax";

type BoundingBox = Record<"left" | "top" | "width" | "height", number>;
type Geometry = Record<"tree" | "node", BoundingBox>;

export interface State {}

export const store = Pinia.defineStore("main", {
    state: (): State => {
        return {};
    },
    getters: {},
    actions: {},
});

if (import.meta.hot)
    import.meta.hot.accept(Pinia.acceptHMRUpdate(store, import.meta.hot));
