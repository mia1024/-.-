<script setup lang="ts">
import * as Syntax from "../lib/syntax";
import * as Store from "../store";
import * as Vue from "vue";

const tree = Vue.ref<HTMLElement | null>(null);
const node = Vue.ref<HTMLElement | null>(null);
const left = Vue.ref<HTMLElement | null>(null);

const props = defineProps<{
  nodeKey: symbol;
}>();

const store = Store.syntax();

//const isRoot = Vue.computed(() => )

// TODO fix unsafe index
const expr = Vue.computed(() => {
  const node = store.nodes.get(props.nodeKey);
  if (typeof node === "undefined") throw Error("missing node");
  return node;
});

const getBox = (elem: HTMLElement) => ({
  left: elem.offsetLeft,
  top: elem.offsetTop,
  height: elem.offsetHeight,
  width: elem.offsetWidth,
});

const updateGeometry = () => {
  if (tree.value === null || node.value === null) return;
  store.setGeometry(props.nodeKey, {
    tree: getBox(tree.value),
    node: getBox(node.value),
    left: left.value === null ? undefined : getBox(left.value),
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
  <div
    class="tree"
    :class="{root: store.trail[store.trail.length-1]! === props.nodeKey}"
    ref="tree"
  >
    <div class="node-pad">
      <div
        class="node"
        :class="{ blank: expr.data.type === Syntax.NodeType.Blank }"
        ref="node"
      >
        <button
          @click="store.prune(nodeKey)"
          class="close"
          v-if="expr.data.type !== Syntax.NodeType.Blank"
        >
          ×
        </button>
        <template v-if="expr.data.type === Syntax.NodeType.Blank">
          <div class="hole" />
          <div class="new">
            <div class="pad">
              <button @click="store.makeVariable(nodeKey)">𝑥</button>
              <button @click="store.makeAbstraction(nodeKey)">λ</button>
              <button @click="store.makeApplication(nodeKey)">$</button>
            </div>
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
        <div class="param" ref="left">
          λ <input v-model="expr.data.parameter" />
        </div>
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
  margin-bottom: -1.5rem;
  padding-bottom: 1.5rem;

  &:hover {
    .close,
    .new {
      visibility: visible;
    }

    .hole {
      border-color: red;
    }
  }
}

.tree.root > .node-pad > .node.blank {
  & > .hole {
    border-color: red;
  }
  & > .new {
    visibility: visible;
  }
}

.node:not(.blank) {
  padding: 0.25rem 0.75rem;
}

.node:not(.blank),
.param {
  background-color: #eee;
  border-radius: 0.25rem;
  border: 1px solid rgba(0, 0, 0, 0.5);
}
.param {
  align-self: start;
  padding: 0.5rem;

  input {
    width: 3rem;
  }
}

.node {
  position: relative;

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
  border: 1px solid transparent;
  width: 1em;
  height: 1em;
  border-radius: 0.5em;
}
.new {
  position: absolute;
  display: flex;
  justify-content: center;
  left: 50%;
  top: 100%;
  width: 0;
  z-index: 1;
  flex-direction: row;
  font-size: 0.75em;
  visibility: hidden;

  .pad {
    display: flex;
    padding: 0.5rem;
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
