// plugins/janus.client.ts
import { defineNuxtPlugin } from "nuxt/app";
import Janus from "@/public/js/janus"
declare global {
    interface Window {
        Janus: any;
    }
}

declare module "nuxt/app" {
    interface NuxtApp {
        $Janus: any;
    }
}

declare module "vue" {
    interface ComponentCustomProperties {
        $Janus: any;
    }
}

export default defineNuxtPlugin(async (nuxtApp) => {
    if (process.client) {
        if (!window.Janus) {
            window.Janus = Janus;
        }
        nuxtApp.provide("Janus", window.Janus);
    }
});
