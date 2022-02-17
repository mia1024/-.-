<script setup lang="ts">
import * as Syntax from "../lib/syntax";
import * as Store from "../store";
import * as Vue from "vue";
const props = defineProps<{
  nodeKey: symbol;
}>();

const store = Store.store();

// TODO fix unsafe index
const expr = Vue.computed(() => store.nodes[props.nodeKey]!);
</script>

<script></script>

<template>
  <div class="node">
    <button
      @click="store.clear(nodeKey)"
      class="close"
      v-if="expr.data.type !== Syntax.ExpressionType.Blank"
    >
      ×
    </button>
    <div class="data">
      <div v-if="expr.data.type === Syntax.ExpressionType.Blank">
        <div class="new">
          <button @click="store.insertVariable(nodeKey)">+var</button>
          <button @click="store.insertAbstraction(nodeKey)">+abs</button>
          <button @click="store.insertApplication(nodeKey)">+app</button>
        </div>
      </div>
      <div v-if="expr.data.type === Syntax.ExpressionType.Variable">
        <div class="var">var <input v-model="expr.data.name" /></div>
      </div>
      <div v-if="expr.data.type === Syntax.ExpressionType.Abstraction">
        <div class="param">λ <input v-model="expr.data.parameterName" /></div>
        <div class="body">
          <Tree :nodeKey="expr.data.body" />
        </div>
      </div>
      <div v-if="expr.data.type === Syntax.ExpressionType.Application">
        <div class="apply">@</div>
        <div class="application">
          <Tree :nodeKey="expr.data.function" />
          <Tree :nodeKey="expr.data.argument" />
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.node {
  display: grid;
  grid-template-areas: "data close";
}

.close {
  background: none;
  border: none;
  grid-area: close;
  align-self: start;
  cursor: pointer;
  opacity: 0.5;
}
.close:hover {
  opacity: 1;
}

.data {
  grid-area: data;
}

.new {
  display: flex;
  flex-direction: column;
}

.var,
.param {
  border: 1px solid #ddd;
  background-color: #eee;
  padding: 0.5rem 1rem;
}

.var input,
.param input {
  width: 3rem;
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
