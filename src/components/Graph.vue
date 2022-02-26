<template>
  <div class="view">
    <Edges />
    <TreeNode :nodeKey="store.syntax.trail[store.syntax.trail.length-1]!" />
  </div>
</template>

<script lang="ts" setup>
import TreeNode from "@components/TreeNode";
import Edges from "@components/Edges";
import * as Store from "@/store";
const store = Store.store();
</script>

<style scoped lang="scss">
div.view {
  margin: 3rem;
  display: flex;
  justify-content: center;

  // we need `.view` to have `position` defined because it's the container
  // relative to which the tree boxes are measured (using `offsetTop`, etc.).
  // furthermore, none of the intermediate subtree containers may have
  // `position` defined, or those interfere with the measurement.
  //
  // <https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetTop>
  // <https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetParent>
  position: relative;
}
</style>
