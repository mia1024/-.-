// vi: shiftwidth=4
import * as Pinia from "pinia";
import * as Tree from "@lib/tree";
import * as Parser from "@lib/parser";
import {compress} from "@lib/common/compression";

export interface State {
    nodes: Tree.TreeDict<Tree.Metadata.Full>;
    trail: Tree.TreeKey[];
    selected: Tree.TreeKey | null;
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
        };
    },
    actions: {
        setNodeGeometry(
            key: Tree.TreeKey,
            geometry: Tree.Metadata.BoundingBox,
        ) {
            const node = this.nodes.get(key);
            if (typeof node === "undefined")
                throw Error("setNodeGeometry on missing node");
            node.metadata.geometry = geometry;
        },
        setParameterGeometry(
            key: Tree.TreeKey,
            geometry: Tree.Metadata.BoundingBox,
        ) {
            const node = this.nodes.get(key);
            if (typeof node === "undefined")
                throw Error("setParameterGeometry on missing node");

            // oh how I wish I could make this type-safe...
            if (node.data.tag !== Tree.Node.Tag.Abstraction)
                throw Error("setParameterGeometry on non-abstraction node");
            node.data.parameter.metadata.geometry = geometry;
        },
        codeChange(code: string) {
            const result = Parser.parse(code);

            // TODO tree diff & apply, for now we just replace
            const dict = Tree.flatten(
                Tree.mapMetadata(result.expression, (range) => ({ range })),
            );
            this.nodes = dict.nodes;
            this.trail = [dict.root];
            if (code && code != '()')
                location.hash=compress(code)
            else
                location.hash=''
        },
    },
});

if (import.meta.hot)
    import.meta.hot.accept(Pinia.acceptHMRUpdate(store, import.meta.hot));
