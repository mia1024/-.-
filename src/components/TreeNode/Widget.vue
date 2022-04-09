<script setup lang="ts">
import * as Action from "@/editor/action";
import type * as Tree from "@lib/tree";
defineProps<{ metadata: Tree.Metadata.Full }>();
</script>

<template>
    <div class="new">
        <div class="pad">
            <button @click="Action.makeVariable(metadata)">𝑥</button>
            <button @click="Action.makeAbstraction(metadata)">λ</button>
            <button @click="Action.makeApplication(metadata)">$</button>
        </div>
    </div>
</template>

<style scoped lang="scss">
@use "@/scss/colors";

.node-pad:hover .new {
    visibility: visible;
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
</style>
