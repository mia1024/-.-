<script setup lang="ts">
import type * as Tree from "@lib/tree";

import NodeWrapper from "@components/TreeNode/NodeWrapper";
import IdentifierInput from "@components/TreeNode/IdentifierInput";

defineProps<{
    treeKey: Tree.TreeKey;
    name: string;
    metadata: Tree.Metadata.Full;
}>();
</script>

<template>
    <NodeWrapper :blank="false" :treeKey="treeKey" :metadata="metadata">
        <IdentifierInput class="var" :value="name" :metadata="metadata" />
    </NodeWrapper>
</template>

<style scoped lang="scss">
@use "@/scss/colors";

.var {
    width: 3rem;
    text-align: center;
}
</style>
