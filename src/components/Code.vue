<template>
  <pre>{{ code }}</pre>
</template>

<script lang="ts" setup>
import * as Store from "@/store";
import * as Syntax from "@/lib/syntax";
import * as Vue from "vue";

const store = Store.store();

const code = Vue.computed(() => {
  const root = store.syntax.trail[store.syntax.trail.length - 1]!;
  const tree = Syntax.structure(store.syntax.nodes, root);
  return Syntax.stringifyCompact(tree);
});
</script>

<style scoped lang="scss">
pre {
  margin: 1rem;
  font-size: 1rem;
}
</style>
