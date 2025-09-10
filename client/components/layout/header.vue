<template>
    <header>
        <div class="logo">
            <img :src="headerImages.logo" alt="Hyundai" style="height: 24px" />
        </div>
        <div class="welcome">
            {{
                `[${loginStore.headquarters} ${loginStore.branch} ${loginStore.nickname}]${t("님")} ${t("반갑습니다")}`
            }}
        </div>
        <div class="relative">
            <!-- Trigger -->
            <button @click="toggle" class="arrow-btn">
                <img
                    :src="commonImages.dropdown"
                    :class="isOpen ? 'dropdown active' : 'dropdown'"
                />
            </button>

            <!-- Dropdown -->
            <div class="dropdown-wrapper">
                <ul v-if="isOpen" class="dropdown-menu">
                    <li
                        @click.stop="handleToogleDisplay"
                        class="dropdown-option"
                        :class="isOpenDisplay ? 'clicked' : ''"
                    >
                        <img :src="headerImages.displayMode"/>
                        <div>
                            {{ t("화면스타일") }}
                        </div>
                        <img :src="commonImages.dropdown" class="dropdown-img" />
                        <ul v-if="isOpenDisplay" class="dropdown-menu sub">
                            <li
                                v-for="option in displayOptions"
                                :key="option.id"
                                @click.stop="handleChangeDisplay(option.id)"
                                class="dropdown-option"
                                :class="{ active: $colorMode.preference === option.id }"
                            >
                                <img :src="option.image" :alt="t(option.name)"/>
                                <div>
                                    {{ t(option.name) }}
                                </div>
                            </li>
                        </ul>
                    </li>
                    <li
                        @click.stop="handleToogleLanguage"
                        class="dropdown-option"
                        :class="isOpenLanguage ? 'clicked' : ''"
                    >
                        <img :src="headerImages.language" />
                        <div>
                            {{ t("언어변경") }}
                        </div>
                        <img :src="commonImages.dropdown" class="dropdown-img" />
                        <ul v-if="isOpenLanguage" class="dropdown-menu sub">
                            <li
                                v-for="langOption in languageOptions"
                                :key="langOption.id"
                                @click.stop="handleChangeLanguage(langOption.id)"
                                class="dropdown-option sub"
                                :class="{ active: preprenceStore.lang === langOption.id }"
                            >
                                <img :src="langOption.icon" :alt="t(langOption.name)" />
                                <div>
                                    {{ t(langOption.name) }}
                                </div>
                            </li>
                        </ul>
                    </li>
                    <li
                        @click="logout"
                        class="dropdown-option"
                    >
                        <img :src="headerImages.logout" />
                        <div>
                            {{ t("로그아웃") }}
                        </div>
                    </li>
                </ul>
            </div>
        </div>
        <div class="auto-save-box">
            <label>{{ t("영상 자동 저장") }}</label>
            <label class="toggleSwitch">
                <input
                    type="checkbox"
                    v-model="callStore.autoVideoSaveChange"
                    @change="handleChangeAutoSave"
                />
                <span class="slider">
                    <span class="labelText">
                        {{ callStore.autoVideoSaveChange ? "on" : "off" }}
                    </span>
                </span>
            </label>
        </div>
    </header>
</template>

<script setup>
import { onMounted, ref } from "vue";

const { commonImages, headerImages } = useImageAssets();
import { iconKorea, iconSpain, iconUSA } from "@/assets/images/index";
import { useNuxtApp } from "nuxt/app";
import { useImageAssets } from "@/composables/useImageAssets";
import { useLoginStore } from "@/stores/login";
import { useCallStore } from "@/stores/call";
import { useUserPreferenceStore } from "@/stores/common";
const { $colorMode } = useNuxtApp();
const { t, setLocale } = useI18n();
const router = useRouter();
const loginStore = useLoginStore();
const callStore = useCallStore();
const preprenceStore = useUserPreferenceStore();
const isOpen = ref(false);
const isOpenDisplay = ref(false);
const isOpenLanguage = ref(false);
const checked = ref(false);

const displayOptions = [
    { id: "light", name: "라이트 모드", image: headerImages.displayLightMode },
    { id: "dark", name: "다크 모드", image: headerImages.displayDarkMode },
];

// 언어 목록을 배열로 관리
const languageOptions = [
    { id: "ko", name: "한국어", icon: iconKorea },
    { id: "en", name: "영어", icon: iconUSA },
    { id: "es", name: "에스파냐어", icon: iconSpain },
];
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

function handleChangeDisplay(mode) {
    $colorMode.preference = mode;
}

function handleChangeLanguage(lang) {
    preprenceStore.setLang(lang);
    setLocale(lang);
}

function logout() {
    location.href = "http://localhost:8205";
    sessionStorage.clear();
}

function handleChangeAutoSave(e) {
    const target = e.target;
    const isChecked = target.checked;
    const res = isChecked ? true : false; // 예시
    callStore.setSendDurationEnable(res);
    callStore.setAutoVideoSaveChange(res);
}

onMounted(() => {
    console.log(headerImages);
});
</script>

<style lang="scss">
header > :last-child {
    margin-left: auto;
}
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

.dropdown-option.active {
    @include tc(background-color, "select-color");
}
.dropdown-option.clicked {
    @include tc(background-color, "select-color");
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

.auto-save-box {
    display: flex;
    color: #fff;
    align-self: flex-end;
    align-items: center;
    gap: 10px;
    margin-right: 15px;
}

.toggleSwitch {
    position: relative;
    display: inline-block;
    width: 60px;
    height: 34px;
    margin-bottom: 12px;
}

/* 숨긴 체크박스 */
.toggleSwitch input {
    opacity: 0;
    width: 0;
    height: 0;
}

/* 슬라이더 베이스 */
.slider {
    position: relative;
    background-color: #ccc;
    border-radius: 34px;
    cursor: pointer;
    user-select: none;
    transition: background-color 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* 둥근 슬라이더 원 */
.slider::before {
    content: "";
    position: absolute;
    left: 4px;
    width: 13px;
    height: 12px;
    background-color: white;
    border-radius: 50%;
    transition: transform 0.3s;
}

/* 체크 상태일 때 슬라이더 배경색 변경 */
.toggleSwitch input:checked + .slider {
    background-color: #2196f3;
}

/* 체크 상태일 때 둥근 원 오른쪽으로 이동 */
.toggleSwitch input:checked + .slider::before {
    transform: translateX(40px);
}

/* on/off 텍스트 */
.labelText {
    position: relative;
    font-weight: bold;
    font-size: 14px;
    z-index: 1;
    pointer-events: none;
    user-select: none;
}
</style>
