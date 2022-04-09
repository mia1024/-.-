<script setup lang="ts">
import * as Action from "@/editor/action";
import * as Tree from "@lib/tree";
import * as Vue from "vue";

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

const sizerElem = Vue.shallowRef<HTMLDivElement>();
const width = Vue.shallowRef(0);
function measure() {
    if (sizerElem.value === undefined) return;
    width.value = sizerElem.value.clientWidth;
}
Vue.onMounted(measure);

Vue.watch(
    () => props.value,
    () => Vue.nextTick(measure),
);

function onInput(event: Event) {
    Action.rename(props.metadata, (event.target as HTMLInputElement).value);
}
</script>

<template>
    <div class="wrapper">
        <div class="sizer" ref="sizerElem">{{ value }}</div>
        <input
            :value="value"
            :style="{ width: `${width}px` }"
            size="1"
            @keydown="onKey"
            @input="onInput"
        />
    </div>
</template>

<style scoped lang="scss">
input {
    text-align: center;
}
.wrapper {
    position: relative;
    font-family: "JetBrains Mono", monospace;
}
.sizer {
    padding: 0 0.5rem;
    position: absolute;
    left: 0;
    top: 0;
    visibility: hidden;
}
</style>
