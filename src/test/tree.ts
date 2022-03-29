import * as Tap from "tap";

// avoiding path alias/mappings for now, since test runner can't handle it: see
// <https://github.com/TypeStrong/ts-node/discussions/1450#discussioncomment-1806115>

// import * as Syntax from "@lib/syntax";

import * as Tree from "../lib/tree";

Tap.test("basic `flatten` tests", (t) => {
    t.test("blank", (t) => {
        const { nodes, root } = Tree.flatten(Tree.Node.blank("dummy metadata"));
        t.equal(nodes.size, 1);
        t.same(nodes.get(root), Tree.Node.blank("dummy metadata"));

        t.end();
    });

    t.test("variable", (t) => {
        const { nodes, root } = Tree.flatten(
            Tree.Node.variable("varName", "metabanana"),
        );
        t.equal(nodes.size, 1);
        t.same(nodes.get(root), Tree.Node.variable("varName", "metabanana"));

        t.end();
    });

    t.test("abstraction", (t) => {
        const { nodes, root } = Tree.flatten(
            Tree.Node.abstraction(
                "paramName",
                Tree.Node.variable("bodyName", "bodyMeta"),
                "paramMeta",
                "absMeta",
            ),
        );

        const node = nodes.get(root);
        t.equal(nodes.size, 2);
        t.equal(node?.metadata, "absMeta");
        t.equal(node?.data.tag, Tree.Node.Tag.Abstraction);

        if (node?.data.tag !== Tree.Node.Tag.Abstraction) return; // type guard
        t.strictSame(node.data.parameter, {
            name: "paramName",
            metadata: "paramMeta",
        });

        const body = nodes.get(node.data.body);
        t.same(body, Tree.Node.variable("bodyName", "bodyMeta"));

        t.end();
    });

    t.test("application", (t) => {
        const { nodes, root } = Tree.flatten(
            Tree.Node.application(
                Tree.Node.variable("fnName", "fnMeta"),
                Tree.Node.variable("argName", "argMeta"),
                "appMeta",
            ),
        );

        const node = nodes.get(root);
        t.equal(nodes.size, 3);
        t.equal(node?.metadata, "appMeta");
        t.equal(node?.data.tag, Tree.Node.Tag.Application);

        if (node?.data.tag !== Tree.Node.Tag.Application) return; // type guard

        t.same(
            nodes.get(node.data.function),
            Tree.Node.variable("fnName", "fnMeta"),
        );
        t.same(
            nodes.get(node.data.argument),
            Tree.Node.variable("argName", "argMeta"),
        );

        t.end();
    });

    t.end();
});

Tap.test("basic `structure` tests", (t) => {
    t.end();
});

Tap.test("basic `prune` tests", (t) => {
    t.end();
});

Tap.test("`flatten` -> `structure` reconstructs original tree", (t) => {
    t.end();
});
