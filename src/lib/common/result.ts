export type Result<Ok, Err> =
    | { readonly ok: true; value: Ok }
    | { readonly ok: false; error: Err };
