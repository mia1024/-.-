<script setup lang="ts">
import Tree from "./components/Tree.vue";

import * as Store from "./store";
import * as Syntax from "./lib/syntax";

const store = Store.store();
</script>

<template>
  <button @click='store.reset()'>reset</button>
  <div class="tree">
    <Tree :nodeKey="store.root" />
  </div>

  <pre>
  {{Syntax.stringifyCompact(store.nodes)(store.nodes[store.root]!)}}
  </pre>
</template>

<style>
.tree {
  display: flex;
  flex-direction: row;
  justify-content: center;
}

pre {
  margin: 1rem auto;
  width: 40rem;
  background: #eee;
  border: 1px solid #ddd;
  padding: 0.5rem 1rem;
}
</style>
