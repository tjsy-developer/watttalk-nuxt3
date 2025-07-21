<script setup lang="ts">
import { onMounted, ref } from "vue";
const { $colorMode } = useNuxtApp() as any;
const { commonImages, headerImages } = useImageAssets();
import { iconKorea, iconSpain, iconUSA } from "@/assets/images/index";
import { useNuxtApp } from "nuxt/app";
import { useImageAssets } from "@/composables/useImageAssets";
import { useCommonStore } from "@/stores";
import { useLoginStore } from "@/stores/login";

const commonStore = useCommonStore();
const loginStore = useLoginStore();    

const isOpen = ref(false);
const isOpenDisplay = ref(false);
const isOpenLanguage = ref(false);

function toggle() {
    isOpen.value = !isOpen.value;
}

function handleToogleDisplay() {
    isOpenDisplay.value = !isOpenDisplay.value;
    isOpenLanguage.value = false;
}

function handleToogleLanguage() {
    isOpenLanguage.value = !isOpenLanguage.value;
    isOpenDisplay.value = false;
}

function handleChangeDisplay(mode: string) {
    $colorMode.preference = mode
}

function handleChangeLanguage(lang: string) {
    isOpenDisplay.value = false;

}

function logout() { }

onMounted(() => {
    console.log(headerImages)
})
</script>

<template>
    <header>
        <div class="logo">
            <img :src="headerImages.logo" alt="Hyundai" style="height: 24px" />
        </div>
        <div class="welcome">
            {{ `[${loginStore.headquarters} ${loginStore.branch} ${loginStore.nickname}]님 반갑습니다` }}
        </div>
        <div class="relative">
            <!-- Trigger -->
            <button @click="toggle" class="arrow-btn">
                <img :src="commonImages.dropdown" :class="isOpen ? 'dropdown active': 'dropdown'"/>
            </button>

            <!-- Dropdown -->
            <div class="dropdown-wrapper">
                <ul v-if="isOpen" class="dropdown-menu">
                    <li @click.stop="handleToogleDisplay" class="dropdown-option">
                        <img :src="headerImages.displayMode"/>
                        <div>
                            {{ "화면스타일" }}
                        </div>
                        <img :src="commonImages.dropdown" class="dropdown-img"/>
                        <ul v-if="isOpenDisplay" class="dropdown-menu sub">
                            <li @click.stop="handleChangeDisplay('light')" class="dropdown-option">
                                <img :src="headerImages.displayLightMode"/>
                                <div>
                                    {{ "라이트모드" }}
                                </div>
                            </li>
                            <li @click.stop="handleChangeDisplay('dark')" class="dropdown-option sub">
                                <img :src="headerImages.displayDarkMode"/>
                                <div>
                                    {{ "다크모드" }}
                                </div>
                            </li>
                        </ul>
                    </li>
                    <li @click.stop="handleToogleLanguage" class="dropdown-option">
                        <img :src="headerImages.language"/>
                        <div>
                            {{ "언어변경" }}
                        </div>
                        <img :src="commonImages.dropdown" class="dropdown-img"/>
                        <ul v-if="isOpenLanguage" class="dropdown-menu sub">
                            <li @click.stop="handleChangeLanguage('ko')" class="dropdown-option">
                                <img :src="iconKorea"/>
                                <div>
                                    {{ "한국어" }}
                                </div>
                            </li>
                            <li @click.stop="handleChangeLanguage('en')" class="dropdown-option sub">
                                <img :src="iconUSA"/>
                                <div>
                                    {{ "영어" }}
                                </div>
                            </li>
                            <li @click.stop="handleChangeLanguage('es')" class="dropdown-option sub">
                                <img :src="iconSpain"/>
                                <div>
                                    {{ "에스파냐어" }}
                                </div>
                            </li>
                        </ul>
                    </li>
                    <li @click="logout" class="dropdown-option">
                        <img :src="headerImages.logout"/>
                        <div>
                            {{ "로그아웃" }}
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    </header>
</template>

<style lang="scss">
.welcome {
    @include tc(color, "bg-text-color");
    font-size: 12px;
}
.dropdown-wrapper {
    position: relative;
}

.dropdown-trigger {
    padding: 8px 16px;
    font-size: 14px;
    background-color: #ffffff;
    border: 1px solid #ccc;
    cursor: pointer;
    border-radius: 4px;
}

.dropdown-menu {
    position: absolute;
    top: 100%;
    left: 0;
    border: 1px solid #3b3b3b;
    width: 140px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    z-index: 10;
    border-radius: 4px;
    padding-left: 0;
    margin-top: 0;
    @include tc(background-color, "component-bg-color");
    @include tc(color, "bg-text-color");
    @include tc(border-color, "border-color");
}

.dropdown-option {
    cursor: pointer;
    transition: background-color 0.2s;
    list-style: none;
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 16px;
    padding: 05px;
}

.dropdown-option:hover {
    @include tc(background-color, "select-color");
}

.arrow-btn {
    cursor: pointer;
    background-color: transparent;
    border: none;
    color: #fff;
    &:hover {
        @include tc(background-color, "border-color");
    }
}

.dropdown-img {
    transform: rotate(90deg);
}

.dropdown {
    transform: rotate(180deg);
}
.dropdown.active {
    transform: rotate(360deg);
}

.dropdown-menu.sub {
    position: absolute;
    top: 100%;
    left: 0;
    border: 1px solid #3b3b3b;
    /* margin-top: 8px; */
    width: 140px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    z-index: 10;
    border-radius: 4px;
    padding-left: 0;
    position: absolute;
    top: 0;
    left: 140px;
    @include tc(background-color, "component-bg-color");
    @include tc(color, "bg-text-color");
    @include tc(border-color, "border-color");
}
</style>
