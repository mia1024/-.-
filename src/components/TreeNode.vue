<script setup lang="ts">
import * as Syntax from "../lib/syntax";
import * as Store from "../store";
import * as Vue from "vue";

const tree: Vue.Ref<HTMLElement | null> = Vue.ref(null);
const node: Vue.Ref<HTMLElement | null> = Vue.ref(null);

const props = defineProps<{
  nodeKey: symbol;
}>();

const store = Store.store();

// TODO fix unsafe index
const expr = Vue.computed(() => store.syntax.nodes.get(props.nodeKey)!);

const getBox = (elem: HTMLElement) => ({
  left: elem.offsetLeft,
  top: elem.offsetTop,
  height: elem.offsetHeight,
  width: elem.offsetWidth,
});

const updateGeometry = () => {
  if (tree.value === null || node.value === null) return;

  store.updateGeometry(props.nodeKey, {
    tree: getBox(tree.value),
    node: getBox(node.value),
  });
};

Vue.watch(
  () => store.stamp,
  () => Vue.nextTick(updateGeometry)
);
Vue.onMounted(() => {
  updateGeometry();
  window.addEventListener("resize", updateGeometry);
});
Vue.onUnmounted(() => {});
</script>

<script></script>

<template>
  <div class="tree" ref="tree">
    <div class="node-pad">
      <div class="node" ref="node">
        <button
          @click="store.clear(nodeKey)"
          class="close"
          v-if="expr.data.type !== Syntax.NodeType.Blank"
        >
          ×
        </button>
        <template v-if="expr.data.type === Syntax.NodeType.Blank">
          <div class="hole" />
          <div class="new">
            <button @click="store.insertVariable(nodeKey)">𝑥</button>
            <button @click="store.insertAbstraction(nodeKey)">λ</button>
            <button @click="store.insertApplication(nodeKey)">$</button>
          </div>
        </template>
        <template v-if="expr.data.type === Syntax.NodeType.Variable">
          <input class="var" v-model="expr.data.name" />
        </template>
        <template v-if="expr.data.type === Syntax.NodeType.Abstraction">
          λ
        </template>
        <template v-if="expr.data.type === Syntax.NodeType.Application">
          $
        </template>
      </div>
    </div>
    <div class="children">
      <template v-if="expr.data.type === Syntax.NodeType.Abstraction">
        <div class="param">λ <input v-model="expr.data.parameter" /></div>
        <TreeNode :nodeKey="expr.data.body" />
      </template>
      <template v-if="expr.data.type === Syntax.NodeType.Application">
        <TreeNode :nodeKey="expr.data.function" />
        <TreeNode :nodeKey="expr.data.argument" />
      </template>
    </div>
  </div>
</template>

<style scoped lang="scss">
.tree {
  display: grid;
  grid-template-areas: "node" "children";
  grid-row-gap: 2rem;
  align-self: start;

  background-color: rgba(0, 80, 50, 0.03);
  padding: 0.5rem;
  border-radius: 0.5rem;
}

.node-pad {
  grid-area: node;
  justify-self: center;
  align-self: start;
  padding: 0;
  margin: -1rem;
  padding: 1rem;

  &:hover {
    .close,
    .new {
      visibility: visible;
    }
  }
}
.node {
  position: relative;
  background-color: #eee;
  border-radius: 0.25rem;
  border: 1px solid rgba(0, 0, 0, 0.5);
  padding: 0.5rem;

  .close {
    visibility: hidden;

    color: white;
    background-color: #f67;
    padding: 0.125em 0.25em;
    line-height: 1em;

    display: flex;
    justify-content: center;
    align-items: center;

    border: none;
    cursor: pointer;

    position: absolute;
    bottom: 100%;
    right: 100%;
    margin-right: -0.25em;
    margin-bottom: -0.25em;
  }

  .var {
    width: 3rem;
    text-align: center;
  }
}

.children {
  grid-area: children;

  display: flex;
  & > * + * {
    margin-left: 2rem;
  }
}

.hole {
  border: 1px solid gray;
  width: 1em;
  height: 1em;
  border-radius: 0.5em;
}
.new {
  visibility: hidden;
  position: absolute;
  display: flex;
  bottom: 100%;
  left: 100%;
  z-index: 1;
  flex-direction: row;
  font-size: 0.75em;
  margin-left: -0.25em;
  margin-bottom: -0.25em;

  button {
    background: #bee;
    padding: 0.125em 0.5em;
    cursor: pointer;
    border: none;
    border-radius: 2px;
    & + button {
      margin-left: 0.5rem;
    }
    &:hover {
      background: #9dc;
    }
  }
}

.param {
  background-color: #eee;
  padding: 0.5rem;
  align-self: start;

  input {
    width: 3rem;
  }
}

.body {
  margin: 0.5rem 1rem;
}

.apply {
  text-align: center;
}

.application {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-column-gap: 1rem;
}
</style>
