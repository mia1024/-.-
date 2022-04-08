import * as Tree from "@lib/tree";

import * as CmState from "@codemirror/state";
import * as CmView from "@codemirror/view";
import * as CmGutter from "@codemirror/gutter";

const highlight = CmState.StateEffect.define<Tree.Metadata.Range>();
const removeHighlight = CmState.StateEffect.define<Tree.Metadata.Range>();
const removeAllHighlights = CmState.StateEffect.define<null>();
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
        for (const e of transaction.effects) {
            if (e.is(highlight)) {
                if (e.value.start.index === e.value.end.index) continue;
                highlights = highlights.update({
                    add: [
                        highlightMark.range(
                            e.value.start.index,
                            e.value.end.index,
                        ),
                    ],
                });
            } else if (e.is(removeHighlight)) {
                highlights = highlights.update({
                    filter: (from, to, decoration) =>
                        !(
                            from === e.value.start.index &&
                            to === e.value.end.index
                        ),
                });
            } else if (e.is(removeAllHighlights)) {
                highlights = highlights.update({
                    filter: () => false, // remove all other effects
                });
            }
        }

        return highlights;
    },
    provide: (f) => CmView.EditorView.decorations.from(f),
});
