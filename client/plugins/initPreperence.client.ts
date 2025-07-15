// plugins/init-preference.client.ts
import { useUserPreferenceStore } from "@/stores/common";
import { defineNuxtPlugin } from "nuxt/app";

export default defineNuxtPlugin(() => {
	if (process.client) {
		const store = useUserPreferenceStore();
        store.initFromStorage();
	}

});
