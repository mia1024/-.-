// vi: shiftwidth=4
import * as Pinia from "pinia";
import * as Tree from "@lib/tree";
import * as Parser from "@lib/parser";

export interface State {
    nodes: Tree.TreeDict<Tree.Metadata.Full>;
    trail: Tree.TreeKey[];
    focus: Tree.TreeKey | null;

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
        nodes.set(root, Tree.Node.blank({}));
        return {
            nodes,
            trail: [root],
            focus: null,
            stamp: Symbol(),
            structureStamp: Symbol(),
        };
    },
    actions: {
        newBlank() {
            const key = Tree.newTreeKey();
            this.nodes.set(key, Tree.Node.blank({}));
            return key;
        },
        makeVariable(key: Tree.TreeKey) {
            this.nodes.set(key, Tree.Node.variable("x", {}));
            this.stamp = Symbol();
            this.structureStamp = Symbol();
        },
        rename(key: Tree.TreeKey, name: string) {
            const node = this.nodes.get(key);
            if (typeof node === "undefined") throw Error("missing node");
            switch (node.data.tag) {
                case Tree.Node.Tag.Variable:
                    node.data.name = name;
                    break;
                case Tree.Node.Tag.Abstraction:
                    node.data.parameter = name;
                    break;
                default:
                    throw Error("not a renameable node");
            }
            this.stamp = Symbol();
            this.structureStamp = Symbol();
        },
        makeAbstraction(key: Tree.TreeKey) {
            this.nodes.set(
                key,
                Tree.Node.abstraction("x", this.newBlank(), {}),
            );
            this.stamp = Symbol();
            this.structureStamp = Symbol();
        },
        makeApplication(key: Tree.TreeKey) {
            this.nodes.set(
                key,
                Tree.Node.application(this.newBlank(), this.newBlank(), {}),
            );
            this.stamp = Symbol();
            this.structureStamp = Symbol();
        },
        setGeometry(key: Tree.TreeKey, geometry: Tree.Metadata.Geometry) {
            const node = this.nodes.get(key);
            if (typeof node === "undefined")
                throw Error("updateGeometry on missing node");
            node.metadata.geometry = geometry;
        },
        prune(key: Tree.TreeKey) {
            const go = (k: Tree.TreeKey) => {
                const node = this.nodes.get(k);
                if (typeof node === "undefined")
                    throw Error("prune root missing");

                switch (node.data.tag) {
                    case Tree.Node.Tag.Abstraction:
                        go(node.data.body);
                        break;
                    case Tree.Node.Tag.Application:
                        go(node.data.function);
                        go(node.data.argument);
                        break;
                }

                node.data = { tag: Tree.Node.Tag.Blank };
            };

            go(key);
            this.stamp = Symbol();
            this.structureStamp = Symbol();
        },
        codeChange(code: string) {
            const result = Parser.parse(code);
            if (result.tag !== Parser.ResultTag.Ok) return; // TODO

            if (result.expression === null) return;

            // TODO tree diff & apply, for now we just replace
            const dict = Tree.flatten(
                Tree.mapMetadata(result.expression, () => ({})),
            );
            this.nodes = dict.nodes;
            this.trail = [dict.root];
            this.stamp = Symbol();
        },
    },
});

if (import.meta.hot)
    import.meta.hot.accept(Pinia.acceptHMRUpdate(store, import.meta.hot));
