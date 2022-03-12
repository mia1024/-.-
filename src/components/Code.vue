<template>
  <textarea v-model="code"></textarea>
</template>

<script lang="ts" setup>
import * as Store from "@/store";
import * as Syntax from "@/lib/syntax";
import * as Vue from "vue";

const store = Store.syntax();

const code = Vue.computed(() => {
  const root = store.trail[store.trail.length - 1]!;
  const tree = Syntax.structure(store.nodes, root);
  return Syntax.stringifyCompact(tree);
});
</script>

<style scoped lang="scss">
pre {
  margin: 1rem;
  font-size: 1rem;
}
</style>
