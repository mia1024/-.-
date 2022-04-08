// vi: shiftwidth=4
import * as Pinia from "pinia";
import * as Tree from "@lib/tree";
import * as Parser from "@lib/parser";

export interface State {
    nodes: Tree.TreeDict<Tree.Metadata.Full>;
    trail: Tree.TreeKey[];
    selected: Tree.TreeKey | null;

    // updated each time tree structure is modified; useful for triggering
    // DOM-layout detection reupdates via `watch`.  maybe we can use
    // `ResizeObserver` too, but we'll figure that out later.
    stamp: symbol;

    // updated each time structure is modified from interactive/structural
    // editor _only_ (not code editor); used via `watch` to trigger code
    // update.  TODO this is a temporary hack--eventually i think we want to do
    // smarter, diff'ed changes based on ranges
    structureStamp: symbol;
}

export const store = Pinia.defineStore("syntax", {
    state: (): State => {
        const root = Symbol();
        const nodes = Tree.newTreeDict<Tree.Metadata.Full>();
        nodes.set(
            root,
            Tree.Node.blank({
                range: {
                    start: Tree.Metadata.startPosition,
                    end: Tree.Metadata.startPosition,
                },
            }),
        );
        return {
            nodes,
            trail: [root],
            selected: null,
            stamp: Symbol(),
            structureStamp: Symbol(),
        };
    },
    actions: {
        setGeometry(key: Tree.TreeKey, geometry: Tree.Metadata.Geometry) {
            const node = this.nodes.get(key);
            if (typeof node === "undefined")
                throw Error("updateGeometry on missing node");
            node.metadata.geometry = geometry;
        },
        codeChange(code: string) {
            const result = Parser.parse(code);

            // TODO tree diff & apply, for now we just replace
            const dict = Tree.flatten(
                Tree.mapMetadata(result.expression, (range) => ({ range })),
            );
            this.nodes = dict.nodes;
            this.trail = [dict.root];
            this.stamp = Symbol();
        },
    },
});

if (import.meta.hot)
    import.meta.hot.accept(Pinia.acceptHMRUpdate(store, import.meta.hot));
