// vi: shiftwidth=4
import * as Pinia from "pinia";
import * as Syntax from "@lib/syntax";
import * as Parser from "@lib/parser";

export interface State {
    nodes: Syntax.TreeDict<Metadata>;
    trail: Syntax.TreeKey[];
    focus: Syntax.TreeKey | null;

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

export interface BoundingBox {
    left: number;
    top: number;
    width: number;
    height: number;
}

export interface Geometry {
    tree: BoundingBox;
    node: BoundingBox;
    left?: BoundingBox;
}

export interface Metadata {
    geometry?: Geometry;
}

export const store = Pinia.defineStore("syntax", {
    state: (): State => {
        const root = Symbol();
        const nodes = Syntax.newTreeDict<Metadata>();
        nodes.set(root, Syntax.Node.blank({}));
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
            const key = Syntax.newTreeKey();
            this.nodes.set(key, Syntax.Node.blank({}));
            return key;
        },
        makeVariable(key: Syntax.TreeKey) {
            this.nodes.set(key, Syntax.Node.variable("x", {}));
            this.stamp = Symbol();
            this.structureStamp = Symbol();
        },
        rename(key: Syntax.TreeKey, name: string) {
            const node = this.nodes.get(key);
            if (typeof node === "undefined") throw Error("missing node");
            switch (node.data.type) {
                case Syntax.Node.NodeType.Variable:
                    node.data.name = name;
                    break;
                case Syntax.Node.NodeType.Abstraction:
                    node.data.parameter = name;
                    break;
                default:
                    throw Error("not a renameable node");
            }
            this.stamp = Symbol();
            this.structureStamp = Symbol();
        },
        makeAbstraction(key: Syntax.TreeKey) {
            this.nodes.set(
                key,
                Syntax.Node.abstraction("x", this.newBlank(), {}),
            );
            this.stamp = Symbol();
            this.structureStamp = Symbol();
        },
        makeApplication(key: Syntax.TreeKey) {
            this.nodes.set(
                key,
                Syntax.Node.application(this.newBlank(), this.newBlank(), {}),
            );
            this.stamp = Symbol();
            this.structureStamp = Symbol();
        },
        setGeometry(key: Syntax.TreeKey, geometry: Geometry) {
            const node = this.nodes.get(key);
            if (typeof node === "undefined")
                throw Error("updateGeometry on missing node");
            node.metadata.geometry = geometry;
        },
        prune(key: Syntax.TreeKey) {
            const go = (k: Syntax.TreeKey) => {
                const node = this.nodes.get(k);
                if (typeof node === "undefined")
                    throw Error("prune root missing");

                switch (node.data.type) {
                    case Syntax.Node.NodeType.Abstraction:
                        go(node.data.body);
                        break;
                    case Syntax.Node.NodeType.Application:
                        go(node.data.function);
                        go(node.data.argument);
                        break;
                }

                node.data = { type: Syntax.Node.NodeType.Blank };
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
            const dict = Syntax.flatten(
                Syntax.mapMetadata(result.expression, () => ({})),
            );
            this.nodes = dict.nodes;
            this.trail = [dict.root];
            this.stamp = Symbol();
        },
    },
});

if (import.meta.hot)
    import.meta.hot.accept(Pinia.acceptHMRUpdate(store, import.meta.hot));
