<template>
  <div class="main">
    <div class="graph-view">
      <Tree />
    </div>

    <div class="right-side-wrapper">
      <div class="library-view">
        <Library />
      </div>
      <div class="code-view">
        <Code />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import Tree from "@components/Graph.vue";
import Library from "@components/Library.vue";
import Code from "@components/Code.vue";

import * as Store from "./store";

const store = Store.store();
</script>

<style scoped lang="scss">
.main {
  display: flex;
  height: 100vh;

  .graph-view {
    flex-basis: 0;
    flex-grow: 2;
    border-right: 1px solid #c0c0c0;
  }

  .right-side-wrapper {
    flex-basis: 0;
    flex-grow: 1;
    display: flex;
    flex-direction: column;

    .library-view {
      flex-basis: 0;
      flex-grow: 2;
      border-bottom: 1px solid #c0c0c0;
    }
    .code-view {
      flex-basis: 0;
      flex-grow: 1;
    }
  }
}
</style>
