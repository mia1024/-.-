import * as Parser from "./parser";
import * as Lexer from "./lexer";
import * as Tree from "@lib/tree";

export const enum ResultTag {
    Ok,
    LexFail,
    ParseFail,
}
// TODO error recovery
export interface Result {
    readonly expression: Tree.Tree<Tree.Metadata.Range>;
    readonly lexErrors: readonly Lexer.Error[];
    readonly parseErrors: readonly Parser.Error[];
}

export function parse(text: string): Result {
    const lex = Lexer.lex(text);
    const parse = Parser.parse(lex.tokens);

    return {
        expression: parse.expression,
        lexErrors: lex.errors,
        parseErrors: parse.errors,
    };
}
