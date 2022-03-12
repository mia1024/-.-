import * as Token from "./token";

const enum StateTag {
    Start,
}

interface StateData {
    [StateTag.Start]: { root: boolean };
}

interface State {
    data: { [Tag in StateTag]: { tag: Tag } & StateData[Tag] }[StateTag];
}

const actions: {
    [Tag in StateTag]: Record<Token.Tag, (data: StateData[Tag]) => void>;
} = {
    [StateTag.Start]: {
        [Token.Tag.ParenL](data) {},
        [Token.Tag.ParenR](data) {},
        [Token.Tag.Hole](data) {},
        [Token.Tag.Dot](data) {},
        [Token.Tag.Lambda](data) {},
        [Token.Tag.Identifier](data) {},
    },
};

export function parse(tokens: Token.Token[]) {
    for (const token of tokens) {
    }
}
