<script setup lang="ts">
import * as Action from "@/editor/action";
import * as Tree from "@lib/tree";

const props = defineProps<{
    value: string;
    metadata: Tree.Metadata.Full;
}>();

function onKey(event: KeyboardEvent) {
    // unguaranteed hack: special keys (e.g., return, escape) are have
    // multicharacter identifiers; let those pass
    if (event.key.length > 1) return;

    // otherwise, ensure that key is alphanumeric
    if (
        !(
            ("a" <= event.key && event.key <= "z") ||
            ("A" <= event.key && event.key <= "Z") ||
            ("0" <= event.key && event.key <= "9")
        )
    )
        event.preventDefault();
}

function onInput(event: Event) {
    Action.rename(props.metadata, (event.target as HTMLInputElement).value);
}
</script>

<template>
    <input :value="value" @keydown="onKey" @input="onInput" />
</template>

<style scoped lang="scss"></style>
