<template>
    <div class="main">
        <div class="graph-view">
            <Tree />
        </div>

        <div class="right-side-wrapper">
            <div class="library-view">
                <Library />
            </div>
            <div class="code-view">
                <Code />
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import * as Vue from "vue";
import Tree from "@components/Tree.vue";
import Library from "@components/Library.vue";
import Code from "@components/Code.vue";

import * as Store from "./store";

const store = Store.syntax();

function handleKey(ev: KeyboardEvent) {
    if (
        store.focus !== null &&
        (ev.code === "Delete" || ev.code === "Backspace")
    )
        store.prune(store.focus);
}

function warnBeforeLeave(e: BeforeUnloadEvent) {
    e.preventDefault();
    e.returnValue = "";
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

.main {
    display: flex;
    height: 100vh;

    .graph-view {
        flex-basis: 0;
        flex-grow: 2;
        border-right: 1px solid transparentize(colors.$foreground, 0.3);
    }

    .right-side-wrapper {
        flex-basis: 0;
        flex-grow: 1;
        display: flex;
        flex-direction: column;

        .library-view {
            flex-basis: 0;
            flex-grow: 2;
            border-bottom: 1px solid transparentize(colors.$foreground, 0.3);
        }

        .code-view {
            flex-basis: 0;
            flex-grow: 1;
        }
    }
}
</style>
