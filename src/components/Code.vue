<template>
    <div class="code-container" ref="container"></div>
    <!--textarea v-model="code"></textarea-->
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
textarea {
    margin: 1rem;
    font-size: 1rem;
    font-family: "JetBrains Mono", monospace;
}

.code-container {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;

    display: grid;
}
</style>

<style lang="scss">
@use "@/scss/colors";

.cm-node-highlight {
    color: colors.$secondaryLight;
}
</style>
