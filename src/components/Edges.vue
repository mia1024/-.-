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
import * as Syntax from "@/lib/syntax";
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

const getCenter = (box: Store.SyntaxStore.BoundingBox): Position => ({
  x: box.left + box.width / 2,
  y: box.top + box.height / 2,
});

const edges = Vue.computed(() => {
  const rootKey = store.trail[store.trail.length - 1];
  if (typeof rootKey === "undefined")
    throw Error("very bad very very bad trail should always be nonempty");

  const edges: Edge[] = [];
  const go = (key: Syntax.TreeKey) => {
    const node = store.nodes.get(key);
    if (typeof node === "undefined") throw Error("edges: missing node");
    const geom = node.metadata.geometry;

    switch (node.data.type) {
      case Syntax.NodeType.Abstraction:
        const paramBox = node.metadata.geometry?.left;
        const bodyGeom = store.nodes.get(node.data.body)?.metadata.geometry;
        if (typeof geom !== "undefined") {
          if (typeof paramBox !== "undefined")
            edges.push({
              parent: getCenter(geom.node),
              child: getCenter(paramBox),
            });
          if (typeof bodyGeom !== "undefined")
            edges.push({
              parent: getCenter(geom.node),
              child: getCenter(bodyGeom.node),
            });
        }
        go(node.data.body);
        break;
      case Syntax.NodeType.Application:
        const fnGeom = store.nodes.get(node.data.function)?.metadata.geometry;
        const argGeom = store.nodes.get(node.data.argument)?.metadata.geometry;
        if (typeof geom !== "undefined") {
          if (typeof fnGeom !== "undefined")
            edges.push({
              parent: getCenter(geom.node),
              child: getCenter(fnGeom.node),
            });
          if (typeof argGeom !== "undefined")
            edges.push({
              parent: getCenter(geom.node),
              child: getCenter(argGeom.node),
            });
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
