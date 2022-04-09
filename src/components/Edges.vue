<template>
    <svg>
        <path
            stroke="black"
            v-for="edge in edges"
            :d="`M${edge.parent.x} ${edge.parent.y} L${edge.child.x} ${edge.child.y}`"
        />
    </svg>
</template>

<script lang="ts" setup>
import * as Store from "@/store";
import * as Tree from "@/lib/tree";
import * as Vue from "vue";

const store = Store.syntax();

interface Position {
    x: number;
    y: number;
}

interface Edge {
    parent: Position;
    child: Position;
}

const getCenter = (box: Tree.Metadata.BoundingBox): Position => ({
    x: box.left + box.width / 2,
    y: box.top + box.height / 2,
});

const edges = Vue.computed(() => {
    const rootKey = store.trail[store.trail.length - 1];
    if (typeof rootKey === "undefined")
        throw Error("very bad very very bad trail should always be nonempty");

    const edges: Edge[] = [];
    const go = (key: Tree.TreeKey) => {
        const node = store.nodes.get(key);
        if (typeof node === "undefined") throw Error("edges: missing node");
        const geom = node.metadata.geometry;

        const parent = geom === undefined ? geom : getCenter(geom);

        switch (node.data.tag) {
            case Tree.Node.Tag.Abstraction:
                const paramGeom = node.data.parameter.metadata.geometry;
                const bodyGeom = store.nodes.get(node.data.body)?.metadata
                    .geometry;
                if (parent !== undefined) {
                    if (paramGeom !== undefined)
                        edges.push({ parent, child: getCenter(paramGeom) });
                    if (typeof bodyGeom !== "undefined")
                        edges.push({ parent, child: getCenter(bodyGeom) });
                }
                go(node.data.body);
                break;
            case Tree.Node.Tag.Application:
                const fnGeom = store.nodes.get(node.data.function)?.metadata
                    .geometry;
                const argGeom = store.nodes.get(node.data.argument)?.metadata
                    .geometry;
                if (parent !== undefined) {
                    if (typeof fnGeom !== "undefined")
                        edges.push({ parent, child: getCenter(fnGeom) });
                    if (typeof argGeom !== "undefined")
                        edges.push({ parent, child: getCenter(argGeom) });
                }
                go(node.data.function);
                go(node.data.argument);
                break;
        }
    };
    go(rootKey);

    return edges;
});
</script>

<style scoped lang="scss">
svg {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
}
</style>
