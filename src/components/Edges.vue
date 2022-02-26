<template>
  <svg>
    <path
      stroke="black"
      v-for="edge in coords"
      :d="`M${edge.from.x} ${edge.from.y} L${edge.to.x} ${edge.to.y}`"
    />
  </svg>
</template>

<script lang="ts" setup>
import * as Store from "@/store";
import * as Syntax from "@/lib/syntax";
import * as Vue from "vue";

const store = Store.store();

const edgeToCoords = (edge: Record<"parent" | "child", symbol>) => {
  const parent = store.geometry.get(edge.parent);
  const child = store.geometry.get(edge.child);
  if (typeof parent === "undefined" || typeof child === "undefined") return [];

  return [
    {
      from: {
        x: parent.node.left + parent.node.width / 2,
        y: parent.node.top + parent.node.height,
      },
      to: { x: child.node.left + child.node.width / 2, y: child.node.top },
    },
  ];
};

const coords = Vue.computed(() => {
  const rootKey = store.syntax.trail[store.syntax.trail.length - 1];
  if (typeof rootKey === "undefined") throw Error("wtf");

  const edges: Record<"parent" | "child", symbol>[] = [];
  const go = (key: Syntax.TreeKey) => {
    const node = store.syntax.nodes.get(key);
    if (typeof node === "undefined") throw Error("edges: missing node");

    switch (node.data.type) {
      case Syntax.NodeType.Abstraction:
        edges.push({ parent: key, child: node.data.body });
        go(node.data.body);
        break;
      case Syntax.NodeType.Application:
        edges.push({ parent: key, child: node.data.function });
        edges.push({ parent: key, child: node.data.argument });
        go(node.data.function);
        go(node.data.argument);
        break;
    }
  };
  go(rootKey);

  return edges.flatMap(edgeToCoords);
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
