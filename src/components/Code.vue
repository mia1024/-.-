<template>
    <div class="code-container" ref="container"></div>
</template>

<script lang="ts" setup>
import * as Store from "@/store";
import * as Tree from "@lib/tree";
import * as Vue from "vue";
import { editor } from "@/editor/editor";
import {highlight, removeAllHighlights} from "@/editor/extensions/highlight";

const store = Store.syntax();

const container = Vue.shallowRef<HTMLDivElement | null>(null);

Vue.onMounted(() => {
    container.value?.appendChild(editor.dom);
});

Vue.watch(
        () => store.selected,
        (after, before) => {
            if (after !== null) {
                const node = store.nodes.get(after)!;
                if (node.metadata.range !== undefined) {
                    editor.dispatch({
                        effects: [
                            removeAllHighlights.of(null),
                            highlight.of(node.metadata.range)
                        ],
                        sequential: true,
                    });
                }
            } else {
                editor.dispatch({
                    effects:[
                        removeAllHighlights.of(null),
                    ]
                })
            }
            // we can't use the following code currently because reparse
            // and all symbols changed.
            // TODO: use the code below instead of removing all effects
            //
            // if (before!==null){
            //     const node = store.nodes.get(before)!;
            //     console.log(before)
            //     if (node.metadata.range !== undefined) {
            //         const effect = removeHighlight.of(node.metadata.range);
            //         editor.value?.dispatch({
            //             effects: [
            //                 effect,
            //                 CmState.StateEffect.appendConfig.of(highlightField),
            //             ],
            //         });
            //     }
            // }
        },
);
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
