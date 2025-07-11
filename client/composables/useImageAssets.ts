// composables/useImageAssets.ts
import { computed, onMounted, ref, watch } from "vue";
import { useNuxtApp } from "nuxt/app";
import { common, header, menus } from "@/assets/images";

export function useImageAssets() {
    const { $colorMode } = useNuxtApp();
    const mode = computed(() => ($colorMode as {
		value: any; preference: "dark" | "light"
}).value);

    const menuImages = computed(() => {
		const currentMode = mode.value as "dark" | "light";
        return {
            call: menus.call[currentMode],
            meetingRoom: menus.meetingRoom[currentMode],
            cloud: menus.cloud[currentMode],
            capture: menus.capture[currentMode],
            drawing: menus.drawing[currentMode],
            notice: menus.notice[currentMode],
        };
    });

    const headerImages = computed(() => {
        const currentMode = (mode.value as "dark" | "light");
        return {
            logo: header.logo[currentMode],
            displayMode: header.displayMode[currentMode],
            displayDarkMode: header.displayDarkMode[currentMode],
            displayLightMode: header.displayLightMode[currentMode],
            language: header.language[currentMode],
            logout: header.logout[currentMode],
        };
    });

    const commonImages = computed(() => {
        const currentMode = (mode.value as "dark" | "light");
        return {
            dropdown: common.dropdown[currentMode],
            logOnGlass: common.logOnGlass[currentMode],
            logOnDesktop: common.logOnDesktop[currentMode],
            logOnMobile: common.logOnMobile[currentMode],
            logOffGlass: common.logOffGlass[currentMode],
            logOffDesktop: common.logOffDesktop[currentMode],
            logOffMobile: common.logOffMobile[currentMode],
            useCall: common.useCall[currentMode],
            useNotCall: common.useNotCall[currentMode],
            useChat: common.useChat[currentMode],
            useNotChat: common.useNotChat[currentMode],
        };
    });

    return {
        menuImages,
        headerImages,
        commonImages,
    };
}
