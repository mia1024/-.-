<template>
    <div class="view">
        <div class="scroller">
            <Edges />
            <TreeNode :treeKey="store.trail[store.trail.length-1]!" />
        </div>
    </div>
</template>

<script lang="ts" setup>
import TreeNode from "@components/TreeNode";
import Edges from "@components/Edges";
import * as Store from "@/store";
//import * as Syntax from "@lib/syntax";
const store = Store.syntax();
</script>

<style scoped lang="scss">
@use "@/scss/colors";
div.view {
    grid-area: tree;

    display: flex;
    overflow: auto;

    border-right: 1px solid transparentize(colors.$foreground, 0.3);

    // we need `.view` to have `position` defined because it's the container
    // relative to which the tree boxes are measured (using `offsetTop`, etc.).
    // furthermore, none of the intermediate subtree containers may have
    // `position` defined, or those interfere with the measurement.
    //
    // <https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetTop>
    // <https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetParent>
    position: relative;
}

.scroller {
    position: relative;
    padding: 3rem 5rem;
    margin: 0 auto;
}
</style>
