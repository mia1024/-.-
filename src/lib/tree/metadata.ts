export interface BoundingBox {
    left: number;
    top: number;
    width: number;
    height: number;
}

export interface Geometry {
    tree: BoundingBox;
    node: BoundingBox;
    left?: BoundingBox;
}

export interface Position {
    readonly index: number;
    readonly row: number;
    readonly col: number;
}

export interface Range {
    readonly start: Position;
    readonly end: Position;
}

export interface Full {
    geometry?: Geometry;
    range?: Range;
}

export const startPosition: Position = Object.freeze({
    index: 0,
    row: 0,
    col: 0,
});
