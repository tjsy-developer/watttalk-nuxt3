<template>
    <div>
        <div class="menu-container">
            <button
                v-for="(menuOpt, index) in contactListMenus"
                @click="handleChangeMenu(menuOpt.value)"
                :key="menuOpt.value"
                :class="menuType == menuOpt.value ? 'menu-btn selected': 'menu-btn'"
            >{{ menuOpt.label }}</button>
        </div>
        <input :value="searchInput" @input="handleInput" placeholder="검색" class="searh-input" />
        <div>
            <RecentCallList v-if="menuType == 0" :data="recentData" :search="searchName" />
            <OrganizationTree v-if="menuType == 1" :data="orgData" :search="searchName" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import OrganizationTree from "@/components/pages/dashboard/OrganizationTree.vue";
import RecentCallList from "@/components/pages/dashboard//RecentCallList.vue";

const contactListMenus = [
    {
        label: '최근 통화 목록',
        value: 0,
    },
    {
        label: '조직도 목록',
        value: 1,
    }
]

const recentData = [
    {
        name: "경기북부본부",
        deviceType: 1,
        status: 0,
        children: [],
    },
    {
        name: "서울본부",
        children: [],
        deviceType: 2,
        status: 1,
    },
    {
        name: "서울본부",
        children: [],
        deviceType: 3,
        status: 1,
    },
];

const orgData = [
    {
        name: "경기북부본부",
        children: [
            {
                name: "1차부서",
                children: [
                    {
                        name: "2차부서",
                        children: [],
                        deviceType: 1,
                        status: 0,
                    },
                ],
            },
        ],
    },
    {
        name: "서울본부",
        children: [
            {
                name: "마케팅팀",
                children: [{ name: "디자인파트", deviceType: 2,  status: 1, }],
            },
        ],
    },
    {
        name: "서울본부",
        children: [
            {
                name: "마케팅팀",
                children: [{ name: "디자인파트", deviceType: 3,  status: 1, }],
            },
        ],
    },
];

const searchInput = ref("");
const searchName = ref("");

const menuType = ref<number>(0);

let timer: number | null = null;

function handleInput(e: Event) {
    const val = (e.target as HTMLInputElement).value;
    searchInput.value = val;

    if (timer) clearTimeout(timer);
    timer = window.setTimeout(() => {
        searchName.value = val.trim();
        console.log("searchName updated:", searchName.value); // 이 로그가 찍히는지 확인
    }, 500);
}

function handleChangeMenu(type: number) {
    menuType.value = type
}
</script>

<style lang="scss">
.menu-container {
    padding: 5px;
    border-radius: 20px;
    display: flex;
    @include tc(background-color, 'input-bg-color');
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
    @include tc(color, 'placeholder-color');
}

.menu-btn.selected {
    @include tc(background-color, 'point-color');
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
    @include tc(background-color, 'input-bg-color');
    @include tc(color, 'input-color');
    &::placeholder {
        @include tc(color, 'placeholder-color');
    }
}
</style>