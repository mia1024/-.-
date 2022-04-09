<script setup lang="ts"></script>

<template>
    <div class="children"><slot /></div>
</template>

<style scoped lang="scss">
.children {
    grid-area: children;

    display: flex;
    margin-top: 1rem;

    // in an ideal world, I would want to use CSS grid here (takes care of
    // inter-element spacing more cleanly).  however, I ran into some terrible
    // performance issues on Firefox with deeply-nested CSS grids, causing an
    // expression as small as `a b c d e f g` to take ~20sec to render.  so
    // we're using flex for now.

    // display: grid;
    // grid-column-gap: 2rem;

    // <https://bugzilla.mozilla.org/show_bug.cgi?id=1682686>
    // <https://bugzilla.mozilla.org/show_bug.cgi?id=1591366>
}
</style>
