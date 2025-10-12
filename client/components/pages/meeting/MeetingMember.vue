<template>
    <div class="col-12">
        <div class="memberSearchBox">
            <input
                type="text"
                id="memberSearchInput"
                v-model="memberSearch"
                :placeholder="t('search')"
                class="row justify-end items-center memberSearchText"
            />
            <button class="memberSearchBtn">
                <img src="@/assets/images/ic_search.png" style="padding-right: 11px" />
            </button>
        </div>
        <div class="scrollingBox" ref="enRef">
            <OrganizationList
                :data="userList"
                :search="memberSearch"
                :use-check-box="true"
            />
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
import { updateStatusByChecked } from "@/composables/common";

const { t } = useI18n();
const props = defineProps({
    enterMember: {
        type: Array,
        default: () => [],
    },
    selectedMemberIds:{
        type: Array,
        default: () => [],
    },
});

// State
const dropdownImg = {
    dropdown: dropdownIcon,
    dropup: dropupIcon,
};
let userList = reactive([]);
const en_list = ref([]);
const hq_list = ref([]);
const br_list = ref([]);
const checkedValues = ref([]);
const memberSearch = ref("");
const enRef = ref(null); // Ref for the scrollingBox div

// Access Vuex Store
const callStore = useCallStore();
const loginStore = useLoginStore();
const meetingStore = useMeetingStore();
const userListStore = useUserListStore();

// Computed Properties
const userData = computed(() => callStore.userData);

// Watchers
watch(userList, (newVal) => {
    // Emits the updated checked values to the parent component
    console.log(userList);
    const result = extractLeafData(userList)
        function extractLeafData(treeData) {
        const names = [];
        const deviceIds = [];

        function traverse(node) {
            if (node.children && node.children.length > 0) {
                node.children.forEach((child) => traverse(child));
            } else {
                if (node.name && node.checked) {
                    names.push(node.name);
                }
                if (node.deviceId && node.checked) {
                    deviceIds.push(node.deviceId);
                }
            }
        }

        // 🚨 수정된 부분: treeData가 배열이므로 각 노드에 대해 traverse 호출
        if (Array.isArray(treeData)) {
            treeData.forEach(node => traverse(node));
        } else {
            traverse(treeData);
        }

        return { names, deviceIds };
    }
    console.log(result);
    emit("selectMember", result);
}, {
    // This is the key change!
    deep: true 
});
// Emits
const emit = defineEmits(["value"]);
const replaceArrayContents = (targetArray, sourceArray) => {
  targetArray.splice(0, targetArray.length, ...sourceArray);
};
// Lifecycle Hook
onMounted(() => {
    // userList를 props.enterMember로 초기화
    userList.splice(0, userList.length, ...props.enterMember);

    // props.selectedMemberIds를 기반으로 checked 상태 업데이트
    let updatedList = userList.slice(); // 기존 배열의 복사본을 만들어 작업
    props.selectedMemberIds.forEach(value => {
        updatedList = updateStatusByChecked(updatedList, value, true);
    });

    // 업데이트된 배열로 userList를 교체하여 watch를 트리거
    userList.splice(0, userList.length, ...updatedList);
});
</script>

<style lang="scss" scoped>
.scrollingBox {
    overflow-y: auto;
    overflow-x: hidden;
    width: 100%;
    height: 235px;
    z-index: 2;
    position: relative;
    background-color: #323232;
    padding-left: 10px;
    * {
        color: #fff;
    }
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
            width: 14px;
            height: 14px;
            line-height: 14px;
            text-align: center;
            vertical-align: middle;
            margin-right: 8px;
            margin-bottom: 4px;
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
