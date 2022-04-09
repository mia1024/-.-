<template>
    <div class="code-container" ref="container"></div>
</template>

<script lang="ts" setup>
import * as Store from "@/store";
import * as Tree from "@lib/tree";
import * as Vue from "vue";
import { editor } from "@/editor/editor";

const store = Store.syntax();

const container = Vue.shallowRef<HTMLDivElement | null>(null);

Vue.onMounted(() => {
    container.value?.appendChild(editor.dom);
});
</script>

<style scoped lang="scss">
@use "@/scss/colors";
.code-container {
    grid-area: code;
    border-top: 1px solid transparentize(colors.$foreground, 0.3);

    display: grid;
}
</style>

<style lang="scss">
@use "@/scss/colors";

.cm-node-highlight {
    color: colors.$secondaryLight;
}
</style>
