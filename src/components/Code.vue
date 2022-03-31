<template>
    <div class="code-container" ref="container"></div>
    <!--textarea v-model="code"></textarea-->
</template>

<script lang="ts" setup>
import * as Store from "@/store";
import * as Tree from "@lib/tree";
import * as Vue from "vue";

import * as CmState from "@codemirror/state";
import * as CmView from "@codemirror/view";
import * as CmGutter from "@codemirror/gutter";
import { StateEffect } from "@codemirror/state";

const store = Store.syntax();

const container = Vue.shallowRef<HTMLDivElement | null>(null);
const editor = Vue.shallowRef<CmView.EditorView | null>(null);

Vue.onMounted(() => {
    if (container.value === null) return;

    editor.value = new CmView.EditorView({
        state: CmState.EditorState.create({
            extensions: [
                CmView.EditorView.theme({
                    "&": { fontSize: 12 },
                    ".cm-content": { fontFamily: "JetBrainsMono" },
                    "&.cm-editor.cm-focused": { outline: "none" },
                }),
                CmGutter.lineNumbers(),
                // custom hook to listen to code change events
                CmState.StateField.define<null>({
                    create: () => null,
                    update(_, tr) {
                        if (!tr.docChanged) return null;

                        store.codeChange(tr.newDoc.toString());

                        return null;
                    },
                }),
            ],
        }),
        parent: container.value,
    });
});

// TODO use $subscribe, per pinia documentation
Vue.watch([editor, () => store.structureStamp], () => {
    if (editor.value === null) return;

    const root = store.trail[store.trail.length - 1]!;
    const tree = Tree.structure(store.nodes, root);
    const stuff = Tree.stringifyCompact(tree);

    editor.value.dispatch(
        editor.value.state.update({
            changes: {
                from: 0,
                to: editor.value.state.doc.length,
                insert: stuff,
            },
        }),
    );
});

const highlight = CmState.StateEffect.define<Tree.Metadata.Range>();
const removeHighlight = CmState.StateEffect.define<Tree.Metadata.Range>();
const highlightMark = CmView.Decoration.mark({ class: "cm-node-highlight" });
//const highlightTheme = CmView.
// mostly copied from https://codemirror.net/6/examples/decoration/ because
// idk what im doing
const highlightField = CmState.StateField.define<CmView.DecorationSet>({
    create: function (state: CmState.EditorState): CmView.DecorationSet {
        return CmView.Decoration.none;
    },
    update: function (
        highlights: CmView.DecorationSet,
        transaction: CmState.Transaction,
    ): CmView.DecorationSet {
        highlights.map(transaction.changes);
        for (let e of transaction.effects) {
            if (e.is(highlight)) {
                highlights = highlights.update({
                    add: [
                        highlightMark.range(
                            e.value.start.index,
                            e.value.end.index,
                        ),
                    ],
                    filter: ()=>false // remove all other effects
                });
            } else if (e.is(removeHighlight)){
                highlights=highlights.update({
                    filter: (from,to,decoration) =>
                         !(from===e.value.start.index && to===e.value.end.index)
                })
            }
        }

        return highlights;
    },
    provide: (f) => CmView.EditorView.decorations.from(f),
});

Vue.watch(
    () => store.selected,
    (after, before) => {
        if (after !== null) {
            const node = store.nodes.get(after)!;
            if (node.metadata.range !== undefined) {
                const effect = highlight.of(node.metadata.range);
                editor.value?.dispatch({
                    effects: [
                        effect,
                        CmState.StateEffect.appendConfig.of(highlightField),
                    ],
                });
            }
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

//const code = Vue.computed(() => {
//    const root = store.trail[store.trail.length - 1]!;
//    const tree = Tree.structure(store.nodes, root);
//    return Tree.stringifyCompact(tree);
//});
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
