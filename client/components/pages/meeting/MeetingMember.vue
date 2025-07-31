<template>
    <div class="col-12">
        <div class="memberSearchBox">
            <input
                type="text"
                id="memberSearchInput"
                v-model="memberSearch"
                v-on:input="memberSearch = $event.target.value"
                :placeholder="$t('search')"
                class="row justify-end items-center memberSearchText"
            />
            <button class="memberSearchBtn">
                <img src="@/assets/images/ic_search.png" style="padding-right: 11px" />
            </button>
        </div>
        <div class="scrollingBox" ref="enRef">
            <OrganizationList
                :data="userList"
                :search="searchName"
                :use-check-box="true"
            />
            <!-- <div
                class="col-12 row items-center memberContents cursor-pointer"
                v-for="(encontents, encontentsKey) in en_list"
                :key="encontentsKey"
            >
                <div class="memberContentsBreakLine"></div>
                <div class="row memberEnList" style="width: 100%">
                    <input
                        type="checkbox"
                        @click="getCheck($event)"
                        :id="`enCheck${encontentsKey}`"
                        :class="`enCheck${encontentsKey}`"
                    />
                    <label :for="`enCheck${encontentsKey}`" class="enMemberCheck"></label>
                    <div
                        @click="getHqList($event)"
                        :class="`en${encontentsKey}`"
                        v-show="true"
                    >
                        <span style="text-align: left">{{ encontents.en }}</span>
                        <img src="@/assets/images/ic_dropdown.png" class="imgAbs" />
                    </div>
                    <div
                        class="row memberHqList row items-center memberContents"
                        v-for="(hqcontents, hqcontentsKey) in hq_list"
                        :key="hqcontentsKey"
                        v-show="false"
                    >
                        <input
                            type="checkbox"
                            @click="getCheck($event)"
                            :id="`hqCheck${hqcontentsKey}`"
                            :class="`hqCheck${hqcontentsKey} enCheck${encontentsKey}`"
                        />
                        <label
                            :for="`hqCheck${hqcontentsKey}`"
                            class="hqMemberCheck"
                        ></label>
                        <div
                            @click="getBrList($event)"
                            :class="`en${encontentsKey} hq${hqcontentsKey}`"
                        >
                            <span style="text-align: left">{{ hqcontents.hq }}</span>
                            <img src="@/assets/images/ic_dropdown.png" class="imgAbs" />
                        </div>
                        <div
                            class="row memberBrList row items-center memberContents"
                            v-for="(brcontents, brcontentsKey) in br_list"
                            :key="brcontentsKey"
                            v-show="false"
                        >
                            <input
                                type="checkbox"
                                @click="getCheck($event)"
                                :id="`brCheck${brcontentsKey}`"
                                :class="`brCheck${brcontentsKey} hqCheck${hqcontentsKey} enCheck${encontentsKey}`"
                            />
                            <label
                                :for="`brCheck${brcontentsKey}`"
                                class="brMemberCheck"
                            ></label>
                            <div
                                @click="getUserList($event)"
                                :class="`en${encontentsKey} hq${hqcontentsKey} br${brcontentsKey}`"
                            >
                                <span style="text-align: left">{{ brcontents.br }}</span>
                                <img
                                    src="@/assets/images/ic_dropdown.png"
                                    class="imgAbs"
                                />
                            </div>
                            <div
                                class="row memberUserList row items-center memberContents"
                                v-show="false"
                            >
                                <div
                                    class="row col-12 userContainer"
                                    v-for="(uscontents, uscontentsKey) in userData"
                                    :key="uscontentsKey"
                                    v-show="false"
                                >
                                    <input
                                        v-if="uscontents.devicetype != 4"
                                        type="checkbox"
                                        @click="getCheck($event)"
                                        v-model="checkedValues"
                                        :value="uscontents.nickname"
                                        :id="`userCheck${uscontentsKey}`"
                                        :class="`${uscontents.deviceid} brCheck${brcontentsKey} hqCheck${hqcontentsKey} enCheck${encontentsKey}`"
                                    />
                                    <label
                                        v-if="uscontents.devicetype != 4"
                                        :for="`userCheck${uscontentsKey}`"
                                        class="userMemberCheck"
                                    ></label>
                                    <div v-if="uscontents.devicetype != 4">
                                        <label
                                            :for="`${uscontentsKey}`"
                                            class="userMemberCheck"
                                        >
                                            <span>{{ uscontents.nickname }}</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div
                    class="memberContentsBreakLine"
                    v-if="en_list.length - 1 == encontentsKey"
                ></div>
            </div>
            <div class="col-12" style="margin: 22px"></div> -->
        </div>
    </div>
</template>

<script setup>
import { useCallStore } from "@/stores/call";
import { ref, computed, watch, onMounted, nextTick, reactive } from "vue";
import dropdownIcon from "@/assets/images/ic_dropdown.png";
import dropupIcon from "@/assets/images/ic_dropup.png";
import { useMeetingStore } from "@/stores/meeting";
import ContactList from "../dashboard/ContactList.vue";
import { useUserListStore } from "@/stores/userList";
import OrganizationList from "../dashboard/OrganizationList.vue";

const props = defineProps({
    enterMember: {
        type: Array,
        default: () => [],
    },
});

// State
const dropdownImg = {
    dropdown: dropdownIcon,
    dropup: dropupIcon,
};
const en_list = ref([]);
const hq_list = ref([]);
const br_list = ref([]);
const checkedValues = ref([]);
const memberSearch = ref("");
const enRef = ref(null); // Ref for the scrollingBox div
const userList = reactive([]);

// Access Vuex Store
const callStore = useCallStore();
const loginStore = useLoginStore();
const meetingStore = useMeetingStore();
const userListStore = useUserListStore();

// Computed Properties
const userData = computed(() => callStore.userData);

// Watchers
watch(checkedValues, (newVal) => {
    // Emits the updated checked values to the parent component
    emit("value", newVal);
});

watch(memberSearch, (newVal) => {
    searchMemberList(newVal);
});

// Emits
const emit = defineEmits(["value"]);

// Lifecycle Hook
onMounted(() => {

    userList[0] = {
        name: userListStore.userListAll.institution[0],
        children: userListStore.organizationList,
    };
    console.log(userList);
});
</script>

<style lang="scss">
/* You can define variables here if you have common values
   For example:
   $primary-color: #007bff;
   $border-radius: 6px;
*/

::-webkit-scrollbar {
    width: 10px;
}

::-webkit-scrollbar-track-piece {
    /* This pseudo-element usually takes properties for the track background */
}

::-webkit-scrollbar-thumb {
    border-radius: 6px;
}

.scrollingBox {
    overflow-x: auto;
    width: 100%;
    height: 235px;
    z-index: 2;
    position: relative;
    background-color: black;
    padding-left: 10px;
}

.memberSearchBox {
    width: 100%;
    height: 34px;
}

.memberSearchText {
    padding-left: 13px;
    padding-top: 12px;
    padding-bottom: 12px;
    font: normal normal bold 14px/16px NanumSquare;
    width: 100%;
    height: 100%;
}

.memberSearchBtn {
    position: absolute;
    top: 9px;
    right: 0px;
}

input[type="checkbox"] {
    display: none;

    + label {
        z-index: 2;
        cursor: pointer;
        width: 14px;
        height: 14px;
        border: 1px solid #4d4d4d;
        display: inline-block;
        position: relative;
        &:before {
            content: " ";
            display: inline-block;
            position: absolute;
            left: 0px;
            z-index: 2;
            width: 14px;
            height: 14px;
            line-height: 14px;
            text-align: center;
            vertical-align: middle;
            margin-right: 8px;
        }
    }

    + label:active:before,
    &:checked + label:active:before {
        box-shadow:
            0 1px 2px rgba(0, 0, 0, 0.05),
            inset 0px 1px 3px rgba(0, 0, 0, 0.1);
    }

    &:checked + label:before {
        content: "\2714";
        font-weight: normal;
        border-color: #2386d2;
        background: #2386d2;
        box-sizing: border-box;
        width: 13px;
        height: 12px;
    }
}

.org-tree {
    > .tree-node > .children {
        > .tree-node > .children {
            > .tree-node > .children {
                .status,
                img {
                    display: none;
                }
            }
        }
    }
}
.node-label {
    height: 3.5rem;
}
.tree-node > .children > .tree-node > .children > .tree-node > .node-label > img,
span {
    flex: none;
}
</style>
