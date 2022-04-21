import * as Tap from "tap";
import { compress, decompress } from "../lib/common/compression";
import { Base64 } from "js-base64";

function randomString(length: number) {
    let result = "";
    for (let i = 0; i < length; i++) {
        result += String.fromCharCode(Math.floor(Math.random() * 0x9fff));
        // end of U+9FFF  CJK Unified Ideographs
        // ref: https://www.unicode.org/Public/UCD/latest/ucd/Blocks.txt
    }
    return result;
}

Tap.test("compression", (t) => {
    t.test("compression and decompression", (t) => {
        for (let i = 0; i < 3000; i++) {
            const s = randomString(i);
            t.strictSame(s, decompress(compress(s)));
        }

        t.end();
    });
    t.end();
});
