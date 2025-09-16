<script setup>
import { useLoginStore } from "@/stores/login";
import { getFormattedDate } from "@/utils/common";
import { useNuxtApp } from "nuxt/app";
import { onMounted, ref } from "vue";
import { useVfm } from "vue-final-modal";
const { t } = useI18n();
import VueDragResize from "vue3-drag-resize";

const vfm = useVfm();
const { $axios } = useNuxtApp();

const loginStore = useLoginStore();
const width = ref(0);
const height = ref(0);
const top = ref(0);
const left = ref(0);
const noticeList = ref([]);

function dragResize(newRect) {
    if (!newRect) return;
    width.value = newRect.width ?? 0;
    height.value = newRect.height ?? 0;
    top.value = newRect.top ?? 0;
    left.value = newRect.left ?? 0;
    console.log("drag");
}

async function getNoticeList() {
    const res = await $axios.post("noticeRest/notice_list", {
        en_seq: loginStore.sessionEnSeq,
    });

    if (res.data) {
        const data = res.data.map((value) => {
            console.log(getFormattedDate(value.save_time));
            return {
                ...value,
                save_time: getFormattedDate(value.save_time),
                effective_date: getFormattedDate(value.effective_date),
                isOpen: false,
            };
        });
        noticeList.value = [...data];
    }
}

const isFetching = ref(false);
let prevIsNoticeOpen = false;

watch(
    () => vfm.openedModals.map((m) => m.props?.modalId).join(","),
    (modalIdsStr) => {
        console.log("openedModals changed:", modalIdsStr);
        if (modalIdsStr == "notice-modal") {
            getNoticeList();
        }
    },
);
</script>

<template>
    <ClientOnly>
        <VueDragResize
            :is-active="true"
            :w="420"
            :h="420"
            :x="-540"
            :y="-410"
            @resizing="dragResize"
            @dragging="dragResize"
        >
            <div class="modal-body">
                <div>
                    <span>{{ t("공지사항") }}</span>
                    <img
                        class="close-icon"
                        src="@/assets/images/ic_close.png"
                        @click.stop="vfm.close('notice-modal')"
                    />
                </div>
                <section>
                    <ul v-for="notice in noticeList" :key="notice.noti_seq">
                        <li @click="notice.isOpen = !notice.isOpen">
                            <div class="notice content">
                                <div>
                                    <span>{{ notice.content }}</span>
                                    <img
                                        src="@/assets/images/ic_new.png"
                                        class="new-ico"
                                    />
                                </div>
                                <div>
                                    <img
                                        v-if="!notice.isOpen"
                                        src="@/assets/images/ic_dropdown.png"
                                        class="down-img"
                                    />
                                    <img
                                        v-else
                                        src="@/assets/images/ic_dropup.png"
                                        class="up-img"
                                    />
                                </div>
                            </div>
                            <div class="notice time">{{ notice.save_time }}</div>
                        </li>
                        <li v-if="notice.isOpen" @click="notice.isOpen = !notice.isOpen">
                            <div class="notice full-content">{{ notice.content }}</div>
                        </li>
                    </ul>
                </section>
            </div>
        </VueDragResize>
    </ClientOnly>
</template>

<style lang="scss" scoped>
.modal-body {
	border: 1px solid #4d4d4d;
    width: inherit;
    height: inherit;
    font-size: 14px;
    border-radius: 7px 7px 0 0;
    color: #d0d0d0;
    display: flex;
    flex-direction: column;
    > div {
        z-index: 1;
        border-radius: inherit;
        background-color: #4d4d4d;
        height: 25px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 6px;
    }
}
section {
    background-color: #262627;
    height: inherit;
    padding: 10px;
    ul,
    li:first-child {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 4px;
        margin: 0;
        gap: 2px;
        list-style: none;
        background-color: #353535;
        cursor: pointer;
        &:hover {
            background-color: #000;
            * {
                background-color: #000;
            }
        }
    }

    .notice.content {
        display: flex;
        justify-content: space-between;
        gap: 8px;
        > div {
            gap: 8px;
            display: flex;
            align-items: center;
        }
        .new-ico {
            height: 13px
        }
    }
    .notice.content span {
        display: inline-block; /* 또는 block */
        max-width: 300px; /* 줄일 폭 지정 */
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        vertical-align: middle; /* 선택 */
    }
    .notice.time {
        font-size: 13px;
        color: #8d8d8d;
    }
    .notice.full-content {
        padding: 7px;
		line-height: 1.5;
    }
}

.close-icon {
	cursor: pointer;
}
</style>
