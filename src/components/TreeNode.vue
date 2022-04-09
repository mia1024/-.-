<script setup lang="ts">
import * as Tree from "@lib/tree";
import * as Store from "../store";
import * as Vue from "vue";

import Blank from "@components/TreeNode/Blank";
import Variable from "@components/TreeNode/Variable";
import Application from "@components/TreeNode/Application";
import Abstraction from "@components/TreeNode/Abstraction";

const props = defineProps<{
    treeKey: symbol;
}>();

const store = Store.syntax();

const isRoot = Vue.computed(
    () => store.trail[store.trail.length - 1]! === props.treeKey,
);
const isHover = Vue.computed(() => store.selected === props.treeKey);

// TODO fix unsafe index
const expr = Vue.computed(() => {
    const node = store.nodes.get(props.treeKey);
    if (typeof node === "undefined") throw Error("missing node");
    return node;
});

function setHover() {
    store.selected = props.treeKey;
}

function removeHover() {
    if (store.selected === props.treeKey) store.selected = null;
}
</script>

<template>
    <div
        class="tree"
        :class="{ root: isRoot, hover: isHover }"
        @mouseenter="setHover"
        @mouseleave="removeHover"
    >
        <template v-if="expr.data.tag === Tree.Node.Tag.Blank">
            <Blank :treeKey="treeKey" :metadata="expr.metadata" />
        </template>
        <template v-if="expr.data.tag === Tree.Node.Tag.Variable">
            <Variable
                :treeKey="treeKey"
                :name="expr.data.name"
                :metadata="expr.metadata"
            />
        </template>
        <template v-if="expr.data.tag === Tree.Node.Tag.Abstraction">
            <Abstraction
                :treeKey="treeKey"
                :parameter="expr.data.parameter"
                :metadata="expr.metadata"
            >
                <TreeNode
                    :treeKey="expr.data.body"
                    @mouseenter="removeHover"
                    @mouseleave="setHover"
                />
            </Abstraction>
        </template>
        <template v-if="expr.data.tag === Tree.Node.Tag.Application">
            <Application :metadata="expr.metadata" :treeKey="treeKey">
                <template v-slot:function>
                    <TreeNode
                        :treeKey="expr.data.function"
                        @mouseenter="removeHover"
                        @mouseleave="setHover"
                    />
                </template>
                <template v-slot:argument>
                    <TreeNode
                        :treeKey="expr.data.argument"
                        @mouseenter="removeHover"
                        @mouseleave="setHover"
                /></template>
            </Application>
        </template>
    </div>
</template>

<style scoped lang="scss">
@use "@/scss/colors";

.tree {
    // using flex temporarily for performance reasons (see comment in
    // `Children.vue`)
    display: flex;
    flex-direction: column;

    & + &,
    .param + & {
        // spacing in-between sibling trees.  I'd put this as `grid-column-gap`
        // on the `Children` container, but CSS grid perf issues, yada yada
        margin-left: 1rem;
    }

    //display: grid;
    //grid-template-areas: "node" "children";
    //grid-row-gap: 2rem;

    align-self: start;

    //background-color: rgba(0, 80, 50, 0.03);
    padding: 0.5rem;
    margin: -0.5rem;
    border-radius: 0.5rem;

    &.hover {
        outline: 2px dashed colors.$secondaryLight;
    }
}
</style>
