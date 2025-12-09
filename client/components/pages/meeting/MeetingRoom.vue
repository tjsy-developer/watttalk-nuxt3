<template>
    <div class="window">
        <div v-if="!props.compData" class="empty row column items-center justify-center">
            <button @click="makingBtnClick" class="makeMeetingBtn">
                + {{ t("createMeeting") }}
            </button>
        </div>

        <div v-else-if="props.compData.customData.status == 0" class="nonplaying">
            <span class="room-status">{{ t("beforeOpening") }}</span>
            <span class="font22">{{ props.compData.customData.title }}</span>
            <img
                src="@/assets/images/conference/ic_hm_active.png"
                alt="Icon"
                class="imageLocation"
            />
        </div>

        <div v-else-if="props.compData.customData.status == 1" class="playing">
            <span class="room-status">{{ t("ongoing") }}</span>
            <span class="font22">{{ props.compData.customData.title }}</span>
            <img
                src="@/assets/images/conference/ic_hm_active.png"
                alt="Icon"
                class="imageLocation"
            />
        </div>

        <div v-else-if="props.compData.customData.status == 2" class="closeMeeting">
            <span class="room-status">{{ t("endMeeting") }}</span>
            <span class="font22">{{ props.compData.customData.title }}</span>
        </div>

        <div v-if="props.compData" class="mtConten">
            <div class="contentBox column justify-start">
                <div
                    v-if="
                        props.compData.customData.type === 0 ||
                        props.compData.customData.type === 1
                    "
                    class="contentView"
                >
                    <img src="@/assets/images/conference/ic_date.png" alt="Date Icon" />
                    <span class="spanTitle">{{ t("meetingDate") }}:&nbsp;</span>
                    <span class="timeOverFlow">{{
                        format(props.compData.startDate)
                    }}</span>
                </div>
                <div v-else class="contentView">
                    <img
                        v-if="displayMode == 'darkmode'"
                        src="@/assets/images/conference/ic_con_start.png"
                        alt="Conference Start Icon"
                    />
                    <img
                        v-else
                        src="@/assets/images/lightmode/conference/ic_con_start.svg"
                        alt="Conference Start Icon"
                    />
                    <span>{{ t("meetingStartPeriod") }} :&nbsp;</span>
                    <span class="timeOverFlow">
                        {{ format(props.compData.startDate) }}
                        {{ time() ? time().split("-")[0] : "" }}
                    </span>
                </div>

                <div
                    v-if="
                        props.compData.customData.type === 0 ||
                        props.compData.customData.type === 1
                    "
                    class="contentView"
                >
                    <img src="@/assets/images/conference/ic_time.png" alt="Time Icon" />
                    <span>{{ t("meetingTime") }}:&nbsp;</span>
                    <span class="timeOverFlow">{{ time() }}</span>
                </div>
                <div v-else class="contentView">
                    <img
                        v-if="displayMode == 'darkmode'"
                        src="@/assets/images/conference/ic_con_end.png"
                        alt="Conference End Icon"
                    />
                    <img
                        v-else
                        src="@/assets/images/lightmode/conference/ic_con_end.svg"
                        alt="Conference End Icon"
                    />
                    <span>{{ t("meetingEndPeriod") }} :&nbsp;</span>
                    <span class="timeOverFlow">
                        {{
                            props.compData.customData.type === 3
                                ? t("meeting validity period")
                                : format(props.compData.endDate) +
                                  (time() ? time().split("-")[1] : "")
                        }}
                    </span>
                </div>

                <div class="contentView">
                    <img
                        src="@/assets/images/conference/ic_hm.png"
                        alt="Participants Icon"
                        class="participantsImg"
                    />
                    <span>{{ t("meetingMember") }}:&nbsp;</span>
                    <span
                        class="participant"
                        :data-tooltip="props.compData.customData.member"
                        >{{ props.compData.customData.member }}</span
                    >
                </div>

                <div v-if="showCctvList" class="contentView">
                    <img
                        src="@/assets/images/conference/ic_cctv_m.png"
                        alt="CCTV Icon"
                        class="cctvIcon"
                    />
                    <span class="participantsTitle">CCTV:&nbsp;</span>
                    <span class="participant">{{ cctvList }}</span>
                </div>

                <div
                    v-if="
                        preprenceStore.useDirectCall &&
                        props.compData.customData.type === 3 &&
                        props.compData.customData.checkOptionTxt
                    "
                    class="optionTxt"
                >
                    <span>* {{ t("추가 기능") }}&nbsp;:&nbsp;</span>
                    <div>
                        <span v-if="props.compData.customData.entry_notification_yn">{{
                            t("회의 초대 알림 발송")
                        }}</span>
                        <span v-if="props.compData.customData.direct_call_yn">{{
                            t("스마트글라스 다이렉트콜 입장")
                        }}</span>
                        <span v-if="props.compData.customData.everyone_start_yn">{{
                            t("누구나 회의 시작 가능")
                        }}</span>
                    </div>
                </div>
            </div>

            <div class="btnLocation">
                <div
                    :class="{
                        hidden:
                            props.compData.customData.master !== device_id ||
                            props.compData.customData.status !== 0,
                    }"
                    class="operation"
                >
                    <button
                        @click="roomModify(props.compData.customData.meeting_seq)"
                        class="modifyBtn"
                    >
                        {{ t("meetingModify") }}
                    </button>
                    <button
                        @click="
                            askingDeleteMeetingRoom(props.compData.customData.meeting_seq)
                        "
                        class="deleteMeetingBtn"
                    >
                        {{ t("meetingDelete") }}
                    </button>
                </div>

                <div
                    v-if="
                        props.compData.customData.everyone_start_yn == 1 &&
                        props.compData.customData.member_deviceid.includes(device_id)
                    "
                    class="button-container"
                >
                    <button
                        v-if="props.compData.customData.status == 0"
                        @click="
                            checkMediaDevice(
                                'openMeeting',
                                props.compData.customData.meeting_seq,
                            )
                        "
                        class="contentBtn"
                        :style="{
                            backgroundColor:
                                displayMode == 'darkmode' ? ' #009B2A' : '#02a499',
                        }"
                    >
                        {{ t("meetingStart") }}
                    </button>
                    <button
                        v-else-if="props.compData.customData.status == 1"
                        @click="
                            checkMediaDevice(
                                'joinMeeting',
                                props.compData.customData.meeting_seq,
                            )
                        "
                        class="contentBtn"
                        style="background-color: #2386d2"
                    >
                        {{ t("meetingEnter") }}
                    </button>
                </div>

                <div
                    v-if="props.compData.customData.everyone_start_yn == 0"
                    class="row justify-center items-center"
                >
                    <button
                        v-if="
                            props.compData.customData.master == device_id &&
                            props.compData.customData.status == 0
                        "
                        @click="
                            checkMediaDevice(
                                'openOwnMeeting',
                                props.compData.customData.meeting_seq,
                            )
                        "
                        class="contentBtn"
                        :style="{
                            backgroundColor:
                                displayMode == 'darkmode' ? ' #009B2A' : '#02a499',
                        }"
                    >
                        {{ t("meetingStart") }}
                    </button>
                    <button
                        v-else-if="
                            props.compData.customData.status == 1 &&
                            props.compData.customData.member_deviceid.includes(device_id)
                        "
                        @click="
                            checkMediaDevice(
                                'joinMeeting',
                                props.compData.customData.meeting_seq,
                            )
                        "
                        class="contentBtn"
                        style="background-color: #2386d2"
                    >
                        {{ t("meetingEnter") }}
                    </button>
                    <button
                        v-else-if="
                            props.compData.customData.master != device_id &&
                            props.compData.customData.status == 0 &&
                            props.compData.customData.member_deviceid.includes(device_id)
                        "
                        @click="
                            checkMediaDevice(
                                'joinMeeting',
                                props.compData.customData.meeting_seq,
                            )
                        "
                        class="contentBtn"
                        style="background-color: #575757"
                        disabled
                    >
                        {{ t("meetingEnter") }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, getCurrentInstance } from "vue";
import { useNuxtApp } from "nuxt/app"; // To access $nuxtSocket, $modal global properties
const { t } = useI18n();
// import MeetingModal from "@/components/meeting/meetingModal.vue"; // .vue extension is crucial
// import DeleteMeeting from "@/components/meeting/deleteMeeting.vue"; // .vue extension
// import DeviceSelectModal from "@/components/modals/deviceSelectModal.vue"; // .vue extension

import { useLoginStore } from "@/stores/login";
import { useMeetingStore } from "@/stores/meeting";
import { useCallStore } from "@/stores/call";
import { useModalStore } from "@/stores/modal";
import { useModal } from "vue-final-modal";
import MeetingModal from "@/components/modal/meeting/MeetingModal.vue";
import useSocketEmitEvents from "@/composables/socket/useSocketEmit";
import { useUserPreferenceStore } from "@/stores/common";
import DeleteMeetingModal from "@/components/modal/meeting/DeleteMeetingModal.vue";
import { useSignallingSocket } from "@/composables/socket/useSignallingSocket";

const props = defineProps({
    compData: Object,
    index: Number,
    allView: Boolean,
    lang: String,
});

const loginStore = useLoginStore();
const meetingStore = useMeetingStore();
const modalStore = useModalStore();
const commonStore = useRoomStore();
const preprenceStore = useUserPreferenceStore();

const device_id = ref("");
const nickname = ref("");
const windowWidth = ref(null);
const windowHeight = ref(null);
const checkDirectCall = ref(undefined);
const displayMode = ref("darkmode");
const cctvList = ref("");
const showCctvList = ref(false);
const { signallingSocket } = await useSignallingSocket();
const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
};

// Common function for modalsContainerStyle
const getModalsContainerStyle = () => {
    return document.getElementById("modalsContainer")?.style;
};

const openMeetingCheck = (meetingSeq) => {
    const obj = { meeting_seq: meetingSeq };
    const json = JSON.stringify(obj);

    console.log("*** socket.commit:: openMeetingChecking");
    meetingStore.setOpenMeetingCheck(true);

    signallingSocket.emit("openMeetingChecking", json);
    signallingSocket.on("openMeetingChecking", (response) => {
        const resJson = JSON.parse(response);
        console.log(resJson);
        if (resJson.start_status === 0) {
            console.log("openMeeting");
            openMeeting(meetingSeq);
        } else if (resJson.start_status === 1) {
            console.log("joinMeeting");
            joinMeeting(meetingSeq, 1);
        } else if (resJson.start_status === 3) {
            console.log("회의실이 삭제되어있다.");
            commonStore.setNoneOverlayAlertStatus(8);
        }
    });
};

const openMeeting = (meetingSeq) => {
    const openMeetingData = {
        entryNotification: props.compData.customData.entry_notification_yn,
    };
    console.log("*** methods: openMeeting::");
    console.log("*** methods: openMeeting:: meetingSeq = ", meetingSeq);
    meetingStore.setOpenAndJoin("open");
    meetingStore.setMeetingSeq(meetingSeq);
    meetingStore.setMeetingOpenFlag(true);
    meetingStore.setOpenMeetingData(openMeetingData);
};

const joinMeeting = (meetingSeq, type) => {
    if (!type) {
        meetingStore.setOpenMeetingCheck(false);
    }
    console.log("*** methods: joinMeeting::");
    console.log("*** methods: joinMeeting:: meetingSeq = ", meetingSeq);

    meetingStore.setOpenAndJoin("join");
    meetingStore.setMeetingSeq(meetingSeq);
    meetingStore.setMeetingJoinFlag(true);
};

const makingBtnClick = async () => {
    console.log("*** methods: makingBtnClick");
    const { open, close } = useModal({
        component: MeetingModal,
        styleValue: {
            width: "650px",
            height: "440px",
        },
        key: `meeting-modal`,
        attrs: {
            onClose: () => close(),
        },
    });
    open();
};

const askingDeleteMeetingRoom = async (meetingSeq) => {
    console.log("*** methods: askingDeleteMeetingRoom:: meetingSeq = ", meetingSeq);
    const { open: deleteModalOpen, close } = useModal({
        component: DeleteMeetingModal,
        key: `meeting-modal`,
        attrs: {
            seq: meetingSeq,
            onClose: () => close(),
        },
    });
    deleteModalOpen();
};

const format = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = leadZero(d.getMonth() + 1);
    const day = leadZero(d.getDate());
    const formatted = `${year}.${month}.${day}`;
    return formatted;
};

// 공백 채워넣기
const leadZero = (value) => {
    const zeroWithValue = String(value).padStart(2, "0");
    return zeroWithValue;
};

const time = () => {
    if (props.compData.customData.time !== "") {
        const t = props.compData.customData.time.split(",");
        let t1 = t[0];
        let t2 = t[1];
        let amPm1 = "";
        let amPm2 = "";

        if (Number(t1.slice(0, 2)) < 12) {
            amPm1 = "오전";
        } else {
            amPm1 = "오후";
            if (Number(t1.slice(0, 2)) !== 12) {
                // Fix: use !== instead of !=
                const tt1 = ("0" + (Number(t1.slice(0, 2)) - 12)).slice(-2);
                t1 = tt1 + t1.slice(2, t1.length);
            }
        }

        if (Number(t2.slice(0, 2)) < 12) {
            amPm2 = "오전";
        } else {
            amPm2 = "오후";
            if (Number(t2.slice(0, 2)) !== 12) {
                // Fix: use !== instead of !=
                const tt2 = ("0" + (Number(t2.slice(0, 2)) - 12)).slice(-2);
                t2 = tt2 + t2.slice(2, t2.length);
            }
        }
        return `${amPm1} ${t1} - ${amPm2} ${t2}`;
    }
};

const roomModify = async (meetingSeq) => {
    console.log("*** methods: roomModify:: meetingSeq = ", meetingSeq);
    console.log("*** methods: roomModify:: modify this.compData = ", props.compData);
    meetingStore.setMeetingSeq(meetingSeq);
    const { open, close } = useModal({
        component: MeetingModal,
        key: `meeting-edit-modal`,
        class: "modal-container meeting-modal",
        attrs: {
            compData: props.compData,
            index: props.index,
            allView: props.allView,
            onClose: () => {
                close();
                meetingStore.meetingMemberDeleteAll();
                meetingStore.meetingMemberIdAllDelete();
                meetingStore.meetingMemberEmailDeleteAll();
                meetingStore.emailDeleteAll();
            },
        },
    });
    open();
};

const onResize = () => {
    windowWidth.value = window.innerWidth;
    windowHeight.value = window.innerHeight;
};

const deviceSettingFin = (type, seq) => {
    commonStore.setDeviceModifyState(false);
    if (type === "openOwnMeeting") {
        openMeeting(seq);
    } else if (type === "openMeeting") {
        openMeetingCheck(seq);
    } else if (type === "joinMeeting") {
        joinMeeting(seq);
    }
};

const openDeviceModal = (meetingType, meetingSeq) => {
    console.log(deviceSettingFin);
    const modalsParameter = {
        type: meetingType,
        func: () => deviceSettingFin(meetingType, meetingSeq),
    };
    modalStore.openModal("device", modalsParameter);
};

const checkMediaDevice = async (type, seq) => {
    if (getCookie("closeDeviceModalPermanant") === "true") {
        deviceSettingFin(type, seq);
    } else {
        openDeviceModal(type, seq);
    }
};

const setCctvList = () => {
    if (
        !props.compData ||
        !props.compData.customData ||
        !props.compData.customData.cctv_list ||
        props.compData.customData.cctv_list.length < 1
    ) {
        showCctvList.value = false; // Ensure it's false if no data
        return;
    }
    showCctvList.value = true;
    let list = ""; // Use a local variable to build the string
    props.compData.customData.cctv_list.forEach((ele, index) => {
        if (index === 0) {
            list = ele.name;
        } else {
            list += ", " + ele.name;
        }
    });
    cctvList.value = list; // Assign to ref once
};

onMounted(() => {
    console.log(props.compData)
    windowWidth.value = window.innerWidth;
    windowHeight.value = window.innerHeight;
    window.addEventListener("resize", onResize);

    device_id.value = loginStore.m_local_deviceid;
    nickname.value = loginStore.nickname;
    setCctvList();
});

onUnmounted(() => {
    window.removeEventListener("resize", onResize);
    console.log("*** onUnmounted: Window resize listener removed.");

    if (signallingSocket) {
        console.log("*** onUnmounted: Socket Event Remove Started !!");
        console.log("*** onUnmounted: All socket event listeners removed.");
    }
});

watch(
    [() => loginStore.m_local_deviceid, () => loginStore.nickname],
    ([newDeviceId, newNickname]) => {
        device_id.value = newDeviceId;
        nickname.value = newNickname;
    },
    { immediate: true },
); // immediate: true makes it run on initial setup too

watch(
    () => props.compData,
    () => {
        setCctvList();
    },
    { deep: true },
);
</script>

<style lang="scss">
.participant {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    height: 31px;
    line-height: 31px;
    margin-top: 3px;
    cursor: pointer;
    width: 69%;
}

/* 툴팁 본체 */
.participant::after {
    content: attr(data-tooltip);
    position: absolute;
    right: -38%;
    transform: scale(0.95) translateY(6px); /* 등장 시 부드럽게 올라오게 */
    margin-bottom: 10px;
    padding: 10px 14px;
    background: rgba(34, 34, 34, 0.92); /* 완전한 블랙 대신 살짝 투명한 다크 */
    color: #fff;
    font-size: 14px;
    line-height: 1.4;
    border-radius: 10px;
    /* ✨ 이중 그림자: 깊이감 + 부드러움 */
    box-shadow:
        0 8px 20px rgba(0, 0, 0, 0.25),
        0 2px 6px rgba(150, 150, 150, 0.15);
    opacity: 0;
    pointer-events: none;
    transition:
        opacity 0.25s ease,
        transform 0.25s ease;
    z-index: 20;
    max-width: 62%;
    white-space: normal;
    text-align: left;
    left: 114px;
}

/* 화살표 */
.participant::before {
    content: "";
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    bottom: calc(100% - 2px);
    border-width: 6px;
    border-style: solid;
    border-color: #222 transparent transparent transparent;
    opacity: 0;
    transition: opacity 150ms ease;
    z-index: 20;
}

/* Hover 시 표시 및 확대 효과 */
.participant:hover::after,
.participant:focus::after {
    opacity: 1;
    transform: scale(1);
}

.participant:hover::before,
.participant:focus::before {
    opacity: 1;
}

.textEllipsisEn {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    height: 31px;
    line-height: 31px;
    margin-top: 3px;
    cursor: pointer;
}

.timeOverFlow {
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: clip;
    // width: 57%;
}

.btnLocation {
    display: flex;
    justify-content: space-between;
    padding: 10px;
    min-height: 32px;
    .operation {
        display: flex;
        > button {
            text-decoration-line: underline;
        }
    }
    .operation.hidden {
        visibility: hidden;
    }
}

.operation {
    width: auto;
    height: 32px;
    display: flex;
    align-items: center;
}

.contentBtn {
    width: 76px;
    height: 32px;
    border-radius: 9px;
    margin-left: 10px;
    color: #fff;
}

.contentBox {
    padding: 2rem 0;
}

.contentView {
    display: flex;
    align-items: center;
    height: 31px;
    padding-left: 2.5rem;
    padding-bottom: 7px;
    position: relative;

    img {
        padding-right: 11px;
    }

    .spanTitle {
        font: normal normal bold 14px/18px NanumSquare;
        letter-spacing: 0px;
    }

    .participantsImg {
        align-items: start;
        margin-bottom: auto;
    }

    .participantsTitle {
        font: normal normal bold 14px/18px NanumSquare;
        letter-spacing: 0px;
        margin-top: 3px;
        height: 100%;
        align-items: start;
    }

    .spanContent {
        font: normal normal normal 14px/18px NanumSquare;
        letter-spacing: 0px;
    }
}

.mtContent {
    width: 100%;
    height: calc(100% - 97px);
}

.imageLocation {
    position: absolute;
    object-fit: cover;
    right: 0px;
    height: 100%;
    @media screen and (min-height: 460px) {
        //
    }
    @media screen and (max-height: 459px) {
        height: 80px;
    }
}

.makingBtn {
    width: 106.66px;
    height: 32px;
    border-radius: 9px;
    font: normal normal bold 16px/18px NanumSquare;
    letter-spacing: 0px;
}

.room-status {
    font: normal normal normal 16px/18px NanumSquare;
    letter-spacing: 0px;
    color: #fff;
    position: absolute;
    left: 2rem;
    top: 2rem;
}

.font22 {
    font: normal normal bold 22px/26px NanumSquare;
    letter-spacing: 0px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 90%;
    position: absolute;
    left: 2rem;
    top: 5rem;
    color: #fff;
}

.closeMeeting {
    width: 100%;
    height: 44%;
    position: relative;
    background: #4c4c4c 0 0 no-repeat padding-box;
}

.nonplaying {
    width: 100%;
    flex: 0 0 97px;
    position: relative;
    background: #4c4c4c 0 0 no-repeat padding-box;
}

.playing {
    width: 100%;
    flex: 0 0 97px;
    position: relative;
    background: #1068ac 0% 0% no-repeat padding-box;
}

.mtConten {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}
.empty {
    width: 100%;
    min-height: 274px;
    display: flex;
    align-items: center;
    justify-content: center;
    font: normal normal bold 18px/21px NanumSquare;
    letter-spacing: 0px;
    border: 1px dashed rgb(112, 112, 112);
}

.window {
    width: 100%;
    height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;

    & > button {
        width: 100%;
        height: 100%;
    }

    & > img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    // margin-bottom: 50px;
}

.optionTxt {
    display: flex;
    width: 90%;
    height: 31px;
    padding-left: 30px;
    font-size: 14px;
    align-items: flex-start;
    > div {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }
}

.button-container {
    color: #fff;
}
</style>
