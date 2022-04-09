<template>
    <main>
        <Tree />
        <Library />
        <Code />
    </main>
</template>

<script lang="ts" setup>
import * as Vue from "vue";
import Tree from "@components/Tree.vue";
import Library from "@components/Library.vue";
import Code from "@components/Code.vue";

import * as Store from "./store";

const store = Store.syntax();

function handleKey(ev: KeyboardEvent) {
    // disabling for now because it's annoying af when it accidentally triggers
    //if (
    //    store.focus !== null &&
    //    (ev.code === "Delete" || ev.code === "Backspace")
    //)
    //    store.prune(store.focus);
}

function warnBeforeLeave(e: BeforeUnloadEvent) {
    e.preventDefault();
    e.returnValue = "";
}

if (import.meta.hot) {
    import.meta.hot.on("vite:beforeFullReload", (e) =>
        window.removeEventListener("beforeunload", warnBeforeLeave),
    );
}

Vue.onMounted(() => {
    window.addEventListener("keydown", handleKey);
    window.addEventListener("beforeunload", warnBeforeLeave);
});

Vue.onUnmounted(() => {
    window.removeEventListener("keydown", handleKey);
    window.removeEventListener("beforeunload", warnBeforeLeave);
});
</script>

<style scoped lang="scss">
@use "@/scss/colors";

main {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: grid;

    grid-template-areas: "tree library" "tree code";
    grid-template-columns: 67% 1fr;
    grid-template-rows: 67% 1fr;
}
</style>
