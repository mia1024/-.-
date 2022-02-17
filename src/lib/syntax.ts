export const enum ExpressionType {
  Variable,
  Abstraction,
  Application,
  Blank,
}

// `Expression` is not recursive because we need a flat data structure for easy
// pure, Elm-style mutations.  Instead, we'll store a flat top-level dictionary
// mapping unique `symbol`s to nodes and store those `symbol` keys here instead,
// essentially as recursive "pointer"s.  This does mean we sacrifice a little
// bit of type-safety, but you know, whatever.
export interface Expression {
  data:
    | { type: ExpressionType.Blank }
    | { type: ExpressionType.Variable; name: string }
    | {
        type: ExpressionType.Abstraction;
        parameterName: string;
        body: symbol;
      }
    | {
        type: ExpressionType.Application;
        function: symbol;
        argument: symbol;
      };
}

export const stringifyCompact = (ctx: Record<symbol, Expression>) => {
  const go = (expr: Expression): string => {
    switch (expr.data.type) {
      case ExpressionType.Blank:
        return "_";
      case ExpressionType.Variable:
        return expr.data.name;
      case ExpressionType.Abstraction:
        const body = ctx[expr.data.body]!;
        return `λ${expr.data.parameterName}. ${go(body)}`;
      case ExpressionType.Application:
        const fn = ctx[expr.data.function]!;
        const arg = ctx[expr.data.argument]!;
        const strFn = go(fn);
        const strArg = go(arg);
        const parenFn =
          fn.data.type === ExpressionType.Abstraction ? `(${strFn})` : strFn;
        const parenArg =
          arg.data.type === ExpressionType.Abstraction ||
          arg.data.type === ExpressionType.Application
            ? `(${strArg})`
            : strArg;
        return `${parenFn} ${parenArg}`;
    }
  };
  return go;
};
