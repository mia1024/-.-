import * as Tree from "@lib/tree";
import { editor } from "./editor";

function replace(data: Tree.Metadata.Full, text: string) {
    editor.dispatch(
        editor.state.update({
            changes: {
                from: data.range!.start.index,
                to: data.range!.end.index,
                insert: text,
            },
        }),
    );
}

export function makeVariable(data: Tree.Metadata.Full) {
    replace(data, "_");
}
export function makeAbstraction(data: Tree.Metadata.Full) {
    replace(data, "(λx.)");
}
export function makeApplication(data: Tree.Metadata.Full) {
    replace(data, "(() ())");
}

function sanitizeIdentifier(value: string) {
    const clean = value.replace(/[^A-Za-z0-9]/g, "");
    return clean || "_";
}

export function rename(data: Tree.Metadata.Full, value: string) {
    replace(data, sanitizeIdentifier(value));
}

export function clearNode(data: Tree.Metadata.Full) {
    replace(data, "()");
}
