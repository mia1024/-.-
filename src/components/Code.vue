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
                    ".cm-content": { fontFamily: "JetBrains Mono" },
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
