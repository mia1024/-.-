<script setup lang="ts">
import * as Tree from "@lib/tree";
import NodeWrapper from "@components/TreeNode/NodeWrapper";
import Children from "@components/TreeNode/Children";

defineProps<{ treeKey: Tree.TreeKey; metadata: Tree.Metadata.Full }>();
</script>

<template>
    <NodeWrapper :treeKey="treeKey" :blank="false" :metadata="metadata"
        >$</NodeWrapper
    >
    <Children>
        <slot name="function" />
        <slot name="argument" />
    </Children>
</template>
