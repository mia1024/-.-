export type ToUnion<T extends Record<string, Record<string, any>>> = {
    [K in keyof T]: { tag: K } & T[K];
}[keyof T];
