import { defineNuxtPlugin } from "#app";

// polyfill
import { Buffer } from "buffer";
import util from "util";

if (process.client) {
    window.global = window;
    window.Buffer = Buffer;
    window.util = util;

    // socket.io-stream import
    const ss = require("socket.io-stream");
    window.ss = ss;
}
