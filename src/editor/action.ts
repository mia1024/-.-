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

function validIdentifier(value: string) {
    return value.match(/^[A-Za-z0-9]+$/) !== null;
}

export function rename(data: Tree.Metadata.Full, value: string) {
    if (value.length === 0) {
        replace(data, "_");
        return;
    }
    if (!validIdentifier(value)) {
        return;
    }
    replace(data, value);
}

export function clearNode(data: Tree.Metadata.Full) {
    replace(data, "()");
}
