import * as Tap from "tap";

// avoiding path alias/mappings for now, since test runner can't handle it: see
// <https://github.com/TypeStrong/ts-node/discussions/1450#discussioncomment-1806115>

// import * as Syntax from "@lib/syntax";

import * as Syntax from "../lib/syntax";

Tap.test("basic `flatten` tests", (t) => {
  t.test("blank", (t) => {
    const { nodes, root } = Syntax.flatten(Syntax.blank("dummy metadata"));
    t.equal(nodes.size, 1);
    t.same(nodes.get(root), Syntax.blank("dummy metadata"));

    t.end();
  });

  t.test("variable", (t) => {
    const { nodes, root } = Syntax.flatten(
      Syntax.variable("varName", "metabanana")
    );
    t.equal(nodes.size, 1);
    t.same(nodes.get(root), Syntax.variable("varName", "metabanana"));

    t.end();
  });

  t.test("abstraction", (t) => {
    const { nodes, root } = Syntax.flatten(
      Syntax.abstraction(
        "paramName",
        Syntax.variable("bodyName", "bodyMeta"),
        "absMeta"
      )
    );

    const node = nodes.get(root);
    t.equal(nodes.size, 2);
    t.equal(node?.metadata, "absMeta");
    t.equal(node?.data.type, Syntax.NodeType.Abstraction);

    if (node?.data.type !== Syntax.NodeType.Abstraction) return; // type guard
    t.equal(node.data.parameter, "paramName");

    const body = nodes.get(node.data.body);
    t.same(body, Syntax.variable("bodyName", "bodyMeta"));

    t.end();
  });

  t.test("application", (t) => {
    const { nodes, root } = Syntax.flatten(
      Syntax.application(
        Syntax.variable("fnName", "fnMeta"),
        Syntax.variable("argName", "argMeta"),
        "appMeta"
      )
    );

    const node = nodes.get(root);
    t.equal(nodes.size, 3);
    t.equal(node?.metadata, "appMeta");
    t.equal(node?.data.type, Syntax.NodeType.Application);

    if (node?.data.type !== Syntax.NodeType.Application) return; // type guard

    t.same(nodes.get(node.data.function), Syntax.variable("fnName", "fnMeta"));
    t.same(
      nodes.get(node.data.argument),
      Syntax.variable("argName", "argMeta")
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
