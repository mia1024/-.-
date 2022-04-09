<script setup lang="ts">
import * as Tree from "@lib/tree";
import NodeWrapper from "@components/TreeNode/NodeWrapper";
import Widget from "@components/TreeNode/Widget";

defineProps<{ treeKey: Tree.TreeKey; metadata: Tree.Metadata.Full }>();
</script>

<template>
    <NodeWrapper blank :treeKey="treeKey" :metadata="metadata">
        <div class="hole" />
        <Widget :metadata="metadata" />
    </NodeWrapper>
</template>

<style scoped lang="scss">
@use "@/scss/colors";

.hole {
    border: 2px solid colors.$primaryLight;
    width: 1em;
    height: 1em;
    border-radius: 0.5em;
    background-color: colors.$background;
}
</style>
