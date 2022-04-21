import { deflate, inflate } from "pako";
import { Base64 } from "js-base64";

export function compress(
    data: string,
    level: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 = 9,
) {
    const buf = new TextEncoder().encode(data);
    const compressed = deflate(buf, {
        level,
    });
    return Base64.fromUint8Array(compressed);
}

export function decompress(data: string) {
    const buf = Base64.toUint8Array(data);
    const decompressed = inflate(buf);
    return new TextDecoder("utf8").decode(decompressed);
}
