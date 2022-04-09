<script setup lang="ts">
import * as Vue from "vue";

import NodeWrapper from "./NodeWrapper.vue";
import IdentifierInput from "@components/TreeNode/IdentifierInput";
import Children from "./Children.vue";
import * as Tree from "@lib/tree";
import * as Store from "@/store";
const store = Store.syntax();

const paramElem = Vue.shallowRef<HTMLElement>();

const props = defineProps<{
    treeKey: Tree.TreeKey;
    parameter: {
        name: string;
        metadata: Tree.Metadata.Full;
    };
    metadata: Tree.Metadata.Full;
}>();

function measure() {
    if (paramElem.value === undefined) return;

    store.setParameterGeometry(props.treeKey, {
        left: paramElem.value.offsetLeft,
        top: paramElem.value.offsetTop,
        height: paramElem.value.offsetHeight,
        width: paramElem.value.offsetWidth,
    });
}

// TODO refactor into some common node-rendering wrapper.....
Vue.watch(
    () => props.treeKey,
    () => Vue.nextTick(measure),
);

Vue.onMounted(() => {
    measure();
    window.addEventListener("resize", measure);
});
Vue.onUnmounted(() => window.removeEventListener("resize", measure));
</script>

<template>
    <NodeWrapper :treeKey="treeKey" :blank="false" :metadata="metadata"
        >λ</NodeWrapper
    >
    <Children>
        <div class="param" ref="paramElem">
            λ
            <IdentifierInput
                :value="parameter.name"
                :metadata="parameter.metadata"
            />
        </div>
        <!--
        renders function body via `slot` to avoid mutual recursion w/ `TreeNode`,
        which volar can't handle:
        - <https://github.com/johnsoncodehk/volar/issues/655>
        - <https://github.com/johnsoncodehk/volar/issues/644>
        - maybe relevant: <https://github.com/vuejs/core/issues/1447>
        -->
        <slot />
    </Children>
</template>

<style scoped lang="scss">
@use "@/scss/colors";
.param {
    background-color: colors.$primaryLight;
    border-radius: 0.25rem;
    border: 1px solid transparentize(colors.$foreground, 0.3);

    align-self: start;
    padding: 0.5rem;
    white-space: nowrap;

    input {
        width: 3rem;
    }
}
</style>
