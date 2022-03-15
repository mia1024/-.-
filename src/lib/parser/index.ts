import * as Parser from "./parser";
import * as Lexer from "./lexer";
import * as Tree from "@lib/tree";

export const enum ResultTag {
    Ok,
    LexFail,
    ParseFail,
}
// TODO error recovery
export type Result =
    | {
          readonly tag: ResultTag.Ok;
          readonly expression: Tree.Tree<Tree.Metadata.Range> | null;
      }
    | {
          readonly tag: ResultTag.LexFail;
          readonly errors: readonly Lexer.Error[];
      }
    | {
          readonly tag: ResultTag.ParseFail;
          readonly errors: readonly Parser.Error[];
      };

export function parse(text: string): Result {
    const lex = Lexer.lex(text);
    if (!lex.ok) return { tag: ResultTag.LexFail, errors: lex.errors };

    const parse = Parser.parse(lex.tokens);
    if (!parse.ok) return { tag: ResultTag.ParseFail, errors: parse.errors };

    return { tag: ResultTag.Ok, expression: parse.expression };
}
