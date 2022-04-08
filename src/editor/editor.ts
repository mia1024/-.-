import * as CmState from "@codemirror/state";
import * as CmView from "@codemirror/view";
import * as CmGutter from "@codemirror/gutter";

import * as Store from "@/store";

export const editor = new CmView.EditorView({
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

                    const store = Store.syntax();
                    store.codeChange(tr.newDoc.toString());

                    return null;
                },
            }),
            //highlightField,
        ],
    }),
});
