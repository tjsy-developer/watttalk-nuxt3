<template>
    <div>
        <div class="menu-container">
            <button
                v-for="(menuOpt, index) in contactListMenus"
                @click="handleChangeMenu(menuOpt.value)"
                :key="menuOpt.value"
                :class="menuType == menuOpt.value ? 'menu-btn selected' : 'menu-btn'"
            >
                {{ menuOpt.label }}
            </button>
        </div>
        <input
            :value="searchInput"
            @input="handleInput"
            placeholder="검색"
            class="searh-input"
        />
        <div>
            <RecentCallList
                v-if="menuType == 0"
                :data="userListStore.recentCallList"
                :search="searchName"
            />
            <OrganizationList
                v-if="menuType == 1"
                :data="userListStore.organizationList"
                :search="searchName"
            />
        </div>
    </div>
</template>

<script setup>
import MainModal from "@/components/modal/MainModal";
import OrganizationList from "@/components/pages/dashboard/OrganizationList.vue";
import RecentCallList from "@/components/pages/dashboard//RecentCallList.vue";

import useSocketEmitEvents from "@/composables/socket/useSocketEmit";

import { useCommonStore } from "@/stores";
import { useCallStore } from "@/stores/call";
import { useUserListStore } from "@/stores/userList";

import { useModal } from "vue-final-modal";
import { ref } from "vue";


const userListStore = useUserListStore();
const commonStore = useCommonStore();
const modalStore = useModalStore();
const callStore = useCallStore();

const { requestUserListAll, requestLastCallTime } = useSocketEmitEvents();
const { open } = useModal({
    component: MainModal,
    attrs: {
        title: "Hello World!",
        clickToClose: false,
        class: 'modal-container main-modal'
    },
});
const contactListMenus = [
    {
        label: "최근 통화 목록",
        value: 0,
    },
    {
        label: "조직도 목록",
        value: 1,
    },
];
const searchInput = ref("");
const searchName = ref("");
const menuType = ref(0);

let timer = null;

function handleInput(e) {
    const val = e.target.value;
    searchInput.value = val;

    if (timer) clearTimeout(timer);
    timer = window.setTimeout(() => {
        searchName.value = val.trim();
        console.log("searchName updated:", searchName.value); // 이 로그가 찍히는지 확인
    }, 500);
}

function handleChangeMenu(type) {
    menuType.value = type;
    if (type == 0) requestLastCallTime();
    else requestUserListAll();
}

onMounted(() => {
    requestLastCallTime()
    requestUserListAll()
});

onBeforeUnmount(() => {});
</script>

<style lang="scss">
.menu-container {
    padding: 5px;
    border-radius: 20px;
    display: flex;
    @include tc(background-color, "input-bg-color");
}
.menu-btn {
    flex: 1;
    height: 34px;
    border-radius: inherit;
    font-weight: 700;
    background-color: transparent;
    border: none;
    color: #fff;
    cursor: pointer;
    @include tc(color, "placeholder-color");
}

.menu-btn.selected {
    @include tc(background-color, "point-color");
    color: #fff;
}

.searh-input {
    width: 100%;
    height: 42px;
    padding-left: 20px;
    padding-right: 16px;
    border-radius: 21px;
    margin-top: 10px;
    margin-bottom: 18.43px;
    box-sizing: border-box;
    border: none;
    font-size: 16px;
    @include tc(background-color, "input-bg-color");
    @include tc(color, "input-color");
    &::placeholder {
        @include tc(color, "placeholder-color");
    }
}
</style>
