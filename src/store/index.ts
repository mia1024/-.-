import * as Pinia from "pinia";

export * as SyntaxStore from "./syntax";

export { store as syntax } from "./syntax";

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
