declare module "brotli-wasm"{
    let exp: Promise<{
        compress: ()=>Uint8Array,
        decompress: ()=>Uint8Array
    }>
    export = exp
}
