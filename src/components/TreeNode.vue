<template>
    <div
        class="tree"
        :class="{ root: isRoot, hover: isHover }"
        ref="tree"
        @mouseenter="setHover"
        @mouseleave="removeHover"
    >
        <button
            @click="store.prune(nodeKey)"
            class="close"
            v-if="expr.data.tag !== Tree.Node.Tag.Blank"
        >
            ×
        </button>
        <div class="node-pad">
            <div
                class="node"
                :class="{
                    blank: expr.data.tag === Tree.Node.Tag.Blank,
                }"
                ref="node"
            >
                <template v-if="expr.data.tag === Tree.Node.Tag.Blank">
                    <div class="hole" />
                    <div class="new">
                        <div class="pad">
                            <button @click="store.makeVariable(nodeKey)">
                                𝑥
                            </button>
                            <button @click="store.makeAbstraction(nodeKey)">
                                λ
                            </button>
                            <button @click="store.makeApplication(nodeKey)">
                                $
                            </button>
                        </div>
                    </div>
                </template>
                <template v-if="expr.data.tag === Tree.Node.Tag.Variable">
                    <input
                        class="var"
                        :value="expr.data.name"
                        @input="(e) => store.rename(nodeKey, (e.target as HTMLInputElement).value)"
                    />
                </template>
                <template v-if="expr.data.tag === Tree.Node.Tag.Abstraction">
                    λ
                </template>
                <template v-if="expr.data.tag === Tree.Node.Tag.Application">
                    $
                </template>
            </div>
        </div>
        <div class="children">
            <template v-if="expr.data.tag === Tree.Node.Tag.Abstraction">
                <div class="param" ref="left">
                    λ
                    <input
                        :value="expr.data.parameter.name"
                        @input="e => store.rename(nodeKey, (e.target as HTMLInputElement).value)"
                    />
                </div>
                <TreeNode
                    :nodeKey="expr.data.body"
                    @mouseenter="removeHover"
                    @mouseleave="setHover"
                />
            </template>
            <template v-if="expr.data.tag === Tree.Node.Tag.Application">
                <TreeNode
                    :nodeKey="expr.data.function"
                    @mouseenter="removeHover"
                    @mouseleave="setHover"
                />
                <TreeNode
                    :nodeKey="expr.data.argument"
                    @mouseenter="removeHover"
                    @mouseleave="setHover"
                />
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
import * as Tree from "@lib/tree";
import * as Store from "../store";
import * as Vue from "vue";

const tree = Vue.ref<HTMLElement | null>(null);
const node = Vue.ref<HTMLElement | null>(null);
const left = Vue.ref<HTMLElement | null>(null);
//const isHovering = Vue.ref<boolean>(false);

const props = defineProps<{
    nodeKey: symbol;
}>();

const store = Store.syntax();

const isRoot = Vue.computed(
    () => store.trail[store.trail.length - 1]! === props.nodeKey,
);
const isHover = Vue.computed(() => store.selected === props.nodeKey);

//const isRoot = Vue.computed(() => )

// TODO fix unsafe index
const expr = Vue.computed(() => {
    const node = store.nodes.get(props.nodeKey);
    if (typeof node === "undefined") throw Error("missing node");
    return node;
});

const getBox = (elem: HTMLElement) => ({
    left: elem.offsetLeft,
    top: elem.offsetTop,
    height: elem.offsetHeight,
    width: elem.offsetWidth,
});

const updateGeometry = () => {
    if (tree.value === null || node.value === null) return;
    store.setGeometry(props.nodeKey, {
        tree: getBox(tree.value),
        node: getBox(node.value),
        left: left.value === null ? undefined : getBox(left.value),
    });
};

// every time tree structure updates (as reflected by `stamp`), re-trigger
// geometry detection after next render tick
Vue.watch(
    () => store.stamp,
    () => Vue.nextTick(updateGeometry),
);
Vue.onMounted(() => {
    updateGeometry();
    window.addEventListener("resize", updateGeometry);
});
Vue.onUnmounted(() => {
    window.removeEventListener("resize", updateGeometry);
});

function setHover() {
    store.selected = props.nodeKey;
}

function removeHover() {
    if (store.selected === props.nodeKey) store.selected = null;
}

</script>

<style scoped lang="scss">
@use "@/scss/colors";

.tree {
    display: grid;
    grid-template-areas: "node" "children";
    grid-row-gap: 2rem;
    align-self: start;

    //background-color: rgba(0, 80, 50, 0.03);
    padding: 0.5rem;
    border-radius: 0.5rem;

    // add transparent border to make sure layout doesn't shift with border
    border: 2px solid transparent;

    &.hover {
        border: 2px dashed colors.$secondaryLight;
    }
}

.node-pad {
    grid-area: node;
    justify-self: center;
    align-self: start;
    padding: 0;
    margin: -1rem;
    padding: 1rem;
    margin-bottom: -1.5rem;
    padding-bottom: 1.5rem;

    &:hover {
        .close,
        .new {
            visibility: visible;
        }
    }
}

.tree.root > .node-pad > .node.blank {
    & > .new {
        visibility: visible;
    }
}

.node:not(.blank) {
    padding: 0.25rem 0.75rem;
}

.node:not(.blank),
.param {
    background-color: colors.$primaryLight;
    border-radius: 0.25rem;
    border: 1px solid transparentize(colors.$foreground, 0.3);
}

.param {
    align-self: start;
    padding: 0.5rem;

    input {
        width: 3rem;
    }
}

.close {
    visibility: hidden;
    border-radius: 100%;
    color: white;
    background-color: colors.$alert;
    padding: 0.125em 0.25em;
    line-height: 1em;

    display: flex;
    justify-content: center;
    align-items: center;

    border: none;
    cursor: pointer;

    position: absolute;
    top: 0;
    left: 0;
    margin-right: -0.25em;
    margin-bottom: -0.25em;
}

.node {
    position: relative;
    color: colors.$primaryDark;


    .var {
        width: 3rem;
        text-align: center;
    }
}

.children {
    grid-area: children;

    display: flex;

    & > * + * {
        margin-left: 2rem;
    }
}

.hole {
    border: 2px solid colors.$primaryLight;
    width: 1em;
    height: 1em;
    border-radius: 0.5em;
    background-color: colors.$background;
}

.new {
    position: absolute;
    display: flex;
    justify-content: center;
    left: 50%;
    top: 100%;
    width: 0;
    z-index: 1;
    flex-direction: row;
    font-size: 0.75em;
    visibility: hidden;

    .pad {
        display: flex;
        padding: 0.5rem;

        button {
            background: colors.$tertiaryLight;
            padding: 0.125em 0.5em;
            cursor: pointer;
            border: none;
            border-radius: 2px;

            & + button {
                margin-left: 0.5rem;
            }

            &:hover {
                background: darken(colors.$tertiaryLight, 10%);
            }
        }
    }
}

.body {
    margin: 0.5rem 1rem;
}

.apply {
    text-align: center;
}

.application {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-column-gap: 1rem;
}

input {
    background-color: colors.$background;
    border: 1px solid transparent;

    &:focus {
        border: 1px solid colors.$tertiaryLight;
    }
}
</style>
