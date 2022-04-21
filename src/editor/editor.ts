import * as CmState from "@codemirror/state";
import * as CmView from "@codemirror/view";
import * as CmGutter from "@codemirror/gutter";
import { highlightField } from "@/editor/extensions/highlight";
import * as Store from "@/store";
import { decompress } from "@lib/common/compression";


let code: string | undefined = undefined;

if (location.hash) {
    code = decompress(location.hash);
    console.log("Editor initialized from fragment", code);
}

export const editor = new CmView.EditorView({
    state: CmState.EditorState.create({
        doc:code,
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
            highlightField,
        ],
    }),
});
