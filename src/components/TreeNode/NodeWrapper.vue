<script setup lang="ts">
import type * as Tree from "@lib/tree";
import * as Store from "@/store";
import * as Action from "@/editor/action";
import * as Vue from "vue";

const props = defineProps<{
    treeKey: Tree.TreeKey;
    blank: boolean;
    metadata: Tree.Metadata.Full;
}>();

const elem = Vue.shallowRef<HTMLDivElement>();

const store = Store.syntax();

function measure() {
    if (elem.value === undefined) return;

    store.setNodeGeometry(props.treeKey, {
        left: elem.value.offsetLeft,
        top: elem.value.offsetTop,
        height: elem.value.offsetHeight,
        width: elem.value.offsetWidth,
    });
}

// every time the `treeKey` changes, that means the underlying syntax structure
// must have been changed/reparsed (and the current node is only being reused
// rather than replaced because of Vue virtual-DOM diffing reasons).  so we have
// to remeasure, but only on the next tick _after_ the current stuff has been
// rendered already.
Vue.watch(
    () => props.treeKey,
    // this is dumb, but we do three `nextTick`s here because the first one is
    // used to measure identifier input sizes & resize those input boxes; we
    // have to wait for that one to finish first, then remeasure layout.  so why
    // not two?  idk, it didn't work so I added one lol.  there is a better way
    // to do this--watch for a token associated with the tree, and update
    // according to that (instead of this specific key).  also, render inputs
    // directly from nodes to explicitly specify dependency
    () =>
        Vue.nextTick()
            .then(() => Vue.nextTick(measure))
            .then(() => Vue.nextTick(measure)),
);

Vue.onMounted(() => {
    Vue.nextTick(measure);
    window.addEventListener("resize", measure);
});
Vue.onUnmounted(() => window.removeEventListener("resize", measure));
</script>

<template>
    <div class="node-pad" :class="{ blank }">
        <div class="node" ref="elem">
            <button @click="Action.clearNode(metadata)" class="close">×</button>
            <slot />
        </div>
    </div>
</template>

<style scoped lang="scss">
@use "@/scss/colors";

.node-pad {
    // `node-pad` must not have relative position because `.node` needs to be
    // placed in the root-level tree viewport context in order for bounding-box
    // `offsetLeft`/etc. measurements to work correctly.  another workaround is
    // to measure the position of `node-pad` instead of `node`; it doesn't
    // really matter.  the important thing is that there is no _nesting_ of
    // `position: relative` elements.

    // use only in grid layout, otherwise align and justify with vertical column is swapped
    //grid-area: node;
    //justify-self: center;
    //align-self: start;

    align-self: center;

    padding: 0;
    margin: -1rem;
    padding: 1rem;
    margin-bottom: -1.5rem;
    padding-bottom: 1.5rem;
}

.node {
    position: relative;
    color: colors.$primaryDark;
}

.close {
    visibility: hidden;
    border-radius: 100%;
    color: white;
    background-color: colors.$alert;
    padding: 0.125em 0.25em;
    line-height: 1em;

    margin-left: -1rem;
    margin-top: -1rem;

    display: flex;
    justify-content: center;
    align-items: center;

    border: none;
    cursor: pointer;

    position: absolute;
    top: 0;
    left: 0;
}

.node-pad:not(.blank) {
    &:hover .close {
        visibility: visible;
    }

    .node {
        padding: 0.5rem;
    }

    .node,
    .param {
        background-color: colors.$primaryLight;
        border-radius: 0.25rem;
        border: 1px solid transparentize(colors.$foreground, 0.3);
    }
}
</style>
