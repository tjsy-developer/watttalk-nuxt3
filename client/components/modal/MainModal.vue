<template>
    <div
        class="main-container notice directCall"
        v-if="commonStore.alertNum > 0 && commonStore.alertNum < 5"
    >
        <div class="notice notice-header">
            <span>{{ t("알림창") }}</span>
            <button @click="openModalCheck">
                <img src="@/assets/images/ic_close.png" :alt="t('닫기')"/>
            </button>
        </div>
        <div class="main-container" v-if="commonStore.alertNum == 1">
            <img
                src="@/assets/images/ic_popup_error-4.png"
                class="absoluteCallingImg"
                alt="Calling"
            />
            <h3 class="status-description">
                {{ t("상대방이 통화중입니다.") }} <br />
                {{ t("잠시 후 다시 걸어주시기 바랍니다.") }}
            </h3>
        </div>
        <div class="main-container" v-if="commonStore.alertNum == 2">
            <img
                src="@/assets/images/ic_popup_error-4.png"
                class="absoluteCallingImg"
                alt="Calling"
            />
            <h3 class="status-description">
                {{ t("통신 에러로 통화 연결이 끊어졌습니다") }}
            </h3>
        </div>
        <div class="main-container" v-if="commonStore.alertNum == 3">
            <img
                src="@/assets/images/ic_popup_rejection.png"
                class="absoluteCallingImg"
                alt="Calling"
            />
            <h3 class="status-description">
                {{ t("상대방이 전화를 받을 수 없습니다") }}
                <br />
                {{ t("잠시 후 다시 걸어주시기 바랍니다") }}
            </h3>
        </div>
        <div class="main-container" v-if="commonStore.alertNum == 4">
            <img
                src="@/assets/images/calling/ic_call_2.png"
                class="absoluteCallingImg"
                alt="Calling"
            />
            <h3 class="status-description">
                {{ t("해당 룸에 정원이 초과되어 접속 할 수 없습니다") }}
            </h3>
        </div>
    </div>
    <div
        class="main-container receive-call directCall"
        v-else-if="commonStore.alertNum == 0"
    >
        <div class="main-container" v-if="commonStore.alertNum == 0">
            <div class="status-box">
                <div class="status-text">{{ t("수신 중") }}</div>
            </div>
            <img
                src="@/assets/images/calling/ic_call_2.png"
                class="absoluteCallingImg"
                alt="Calling"
            />
            <span class="status-description">
                {{ callStore.callingPopupInstitution }}
                {{ callStore.callingPopupHeadquarters }}
                {{ callStore.callingPopupBranch }}
                {{ callStore.callingPopupNickname }}
            </span>
            <div class="button-container">
                <button @click="checkMediaDevice('acceptMeeting')" class="button accept">
                    <img src="@/assets/images/ic_popup_ok.png" />
                    <span>{{ t("수락") }}</span>
                </button>
                <button @click="setCallingResult(0)" class="button decline">
                    <img src="@/assets/images/ic_popup_finish.png" />
                    <span>{{ t("거절") }}</span>
                </button>
            </div>
        </div>
    </div>
    <!-- alertNum == 5 -->
    <div
        class="main-container sending-call directCall"
        v-else-if="commonStore.alertNum == 5"
    >
        <div class="main-container" v-if="commonStore.alertNum == 5">
            <div class="status-box">
                <div class="status-text">{{ t("발신 중") }}</div>
            </div>
            <img
                src="@/assets/images/calling/ic_call_1.png"
                class="absoluteCallingImg"
                alt="Calling"
            />
            <span class="status-description">
                {{ callStore.callingPopupInstitution }}
                {{ callStore.callingPopupHeadquarters }}
                {{ callStore.callingPopupBranch }}
                {{ callStore.callingPopupNickname }}
            </span>
            <div class="button-container">
                <button @click="setCancelCalling()" class="button cancel">
                    <img src="@/assets/images/ic_popup_finish.png" />
                    <span>{{ t("취소") }}</span>
                </button>
            </div>
        </div>
    </div>
    <!-- alertNum == 6 -->
    <div
        class="main-container sending-call directCall"
        v-else-if="commonStore.alertNum == 6"
    >
        <div class="main-container" v-if="commonStore.alertNum == 6">
            <div class="status-box">
                <div class="status-text">{{ t("발신 중") }}</div>
            </div>
            <img
                src="@/assets/images/calling/ic_call_1.png"
                class="absoluteCallingImg"
                alt="Calling"
            />
            <span class="status-description">
                {{ callStore.callingPopupInstitution }}
                {{ callStore.callingPopupHeadquarters }}
                {{ callStore.callingPopupBranch }}
                {{ callStore.callingPopupNickname }}
            </span>
            <div class="button-container">
                <button @click="setInviteCancelCalling()" class="button cancel">
                    <img src="@/assets/images/ic_popup_finish.png" />
                    <span>{{ t("취소") }}</span>
                </button>
            </div>
        </div>
    </div>
    <!-- alertNum == 7 (urgent) -->
    <div
        class="main-container sending-call directCall"
        v-else-if="commonStore.alertNum == 7"
    >
        <div class="main-container" v-if="commonStore.alertNum == 7">
            <div class="status-box">
                <div class="status-text">{{ t("긴급통화") }}</div>
                <div class="status-text">{{ t("발신 중") }}</div>
            </div>

            <img
                src="@/assets/images/calling/ic_call_1.png"
                class="absoluteCallingImg"
                alt="Calling"
            />
            <span class="status-description">
                {{ callStore.callingPopupInstitution }}
                {{ callStore.callingPopupHeadquarters }}
                {{ callStore.callingPopupBranch }}
                {{ callStore.callingPopupNickname }}
            </span>
            <div class="button-container">
                <button @click="setInviteCancelCalling()" class="button cancel">
                    <img src="@/assets/images/ic_popup_finish.png" />
                    <span>{{ t("취소") }}</span>
                </button>
            </div>
        </div>
    </div>
    <!-- alertNum == 8 (directCall) -->
    <div
        class="main-container receive-call directCall"
        v-else-if="commonStore.alertNum == 8"
    >
        <div class="main-container" v-if="commonStore.alertNum == 8">
            <div class="status-box">
                <div class="status-text">{{ t("수신 중") }}</div>
            </div>
            <img
                src="@/assets/images/calling/ic_call_2.png"
                class="absoluteCallingImg"
                alt="Calling"
            />
            <span class="status-description">{{ directcallTxt }}</span>
            <div class="button-container">
                <button @click="checkMediaDevice('directCall')" class="button accept">
                    <img src="@/assets/images/ic_popup_ok.png" />
                    <span>{{ t("수락") }}</span>
                </button>
                <button @click="directCallResult(0)" class="button decline">
                    <img src="@/assets/images/ic_popup_finish.png" />
                    <span>{{ t("거절") }}</span>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
// import noneOverlayModal from "@/components/noneOverlayAlert";
// import deviceSelectModal from "@/components/modals/deviceSelectModal";
import { onMounted } from "vue";
import { useRoomStore } from "@/stores/room";
import { useDirectCallStore } from "@/stores/directCall";
import { useNuxtApp } from "nuxt/app";
import { useMeetingStore } from "@/stores/meeting";
import { useModal, VueFinalModal } from "vue-final-modal";
import { useLoginStore } from "@/stores/login";
import useSocketEmitEvents from "@/composables/socket/useSocketEmit";
import { useSignallingSocket } from "@/composables/socket/useSignallingSocket";

const { t } = useI18n();
const commonStore = useRoomStore();
const directCallStore = useDirectCallStore();
const callStore = useCallStore();
const meetingStore = useMeetingStore();
const modalStore = useModalStore();
const loginStore = useLoginStore();

const directcallTxt = ref("");
const directcallSeq = ref("");
const route = useRoute();
const { signallingSocket } = useSignallingSocket();

const { hide } = useModal("modal");

const {
    requestCreateRoomID,
    requestJoinMeeting,
    requestInviteCancelCalling,
    requestOpenMeetingChecking,
} = useSocketEmitEvents();

onMounted(() => {
    if (commonStore.alertNum == 8) {
        firstEntry();
    }

    signallingSocket.on("openMeetingChecking", (response) => {
        console.log("*** socket.on: openMeetingChecking res = ", response);
        const json = JSON.parse(response);
        console.log("*** socket.on: json = ", json);
        if (json.start_status == 0) {
            if (json.everyone_start_yn == 1) {
                meetingStore.setMeetingSeq(directcallSeq.value)
                callStore.setUniqueRoomid(json.unique_roomid)
                requestCreateRoomID(json.unique_roomid);
                this.$store.commit("directcall/clearDirectCallInfo");
            } else {
                noneOverlayModal(6)
            }
        } else if (json.start_status == 1) {
            callStore.setUniqueRoomid(json.unique_roomid)
            requestJoinMeeting({
                meetingSeq: directcallSeq.value,
                roomID: json.roomid,
                uniqueRoomID: json.unique_roomid,
            });
        } else if (json.start_status == 3) {
            noneOverlayModal(8)
        }
    });
});
function openModalCheck() {
    modalStore.closeModal("call");
}
function close() {
    console.log("*** methods: close 1:1 통화 시 상대방이 전화를 거절할 경우 통화종료");
    // 1:1 통화 시 상대방이 전화를 거절했을 경우 :: 방장은 야누스를 소멸하고 연락처화면으로 다시 넘어간다.
    if (
        commonStore.alertNum == 3 &&
        commonStore.janusUse == true &&
        commonStore.feedsLength == 0 // feedsLength == 0 -> 1:1 통화 중 상대방이 안들어왔을 경우
    ) {
        // janus destory
        commonStore.janus.destroy();
        openModalCheck(); // 떠있는 모달 체크
        noneOverlayModal(2);
        // contactList.vue 로 이동은 destoryed 에서 진행하기 때문에 넘기지 않음.
        // this.$store.commit("changeViewType", 0)
    } else {
        openModalCheck(); // 떠있는 모달 체크
    }
}
// 통화 종료 관련 팝업
function noneOverlayModal(seq) {
    commonStore.setNoneOverlayAlertStatus(seq);
    modalStore.openModal("noneOvelay");
}
function setCallingResult(callingResult) {
    console.log("*** methods: setCallingResult Result = " + callingResult);
    console.log("*** 0: decline, 1: Accept");

    // 0 : decline,  1 : Accept
    if (callingResult == 0) {
        callStore.setCallingResult(0);
        close();
    } else {
        callStore.setCallingResult(1);
        close();
    }
    sessionStorage.setItem("m_callWaiting", false)
}

function setCancelCalling() {
    callStore.setGroupCallCancelFlag("cancel");
}

function setInviteCancelCalling() {
    sessionStorage.removeItem("m_inviting");
    requestInviteCancelCalling({
        remoteDeviceId: sessionStorage.getItem("m_remote_deviceid"),
        roomID: sessionStorage.getItem("m_roomid"),
    });
    modalStore.closeModal("call");
}

function directCallResult(type) {
    const meetingSeq = directcallSeq.value;
    if (type == 1) {
        requestOpenMeetingChecking(meetingSeq);
        meetingStore.setOpenMeetingCheck(true);
        meetingStore.setMeetingSeq(meetingSeq);
        directCallStore.resetDirectCallInfo();
        close();
    } else {
        if (directCallStore.directcallList.length > 1) {
            directCallStore.clearDirectCallInfo();
        } else if (directCallStore.directcallList.length == 1) {
            directCallStore.resetDirectCallInfo();
            close();
        }
    }
}

function firstEntry() {
    const res = directCallStore.directcallList;
    const index = res.length - 1;
    directcallTxt.value =
        `${res[index].member_name} ${t("님이")} ${res[index].subject} ${t("회의를 시작했습니다")}`;
    directcallSeq.value = res[index].meeting_seq;
}

function checkMediaDevice(type) {
    if (getCookie("closeDeviceModalPermanant") == "true") {
        deviceSettingFin(type);
    } else {
        openDeviceModal(type);
    }
}

function openDeviceModal(meetingType) {
    const modalsParameter = {
        type: meetingType,
        func: () => deviceSettingFin(meetingType),
    };
    modalStore.openModal("device", modalsParameter);
}

function deviceSettingFin(type) {
    commonStore.setDeviceModifyState(false);
    if (type == "directCall") {
        directCallResult(1);
    } else if (type == "acceptMeeting") {
        setCallingResult(1);
    }
}

const setDirectCallInfo = computed(() => directCallStore.directcallList);

watch(setDirectCallInfo, (newVal) => {
    if (newVal.length > 1) {
        const last = newVal[newVal.length - 1];
        directcallTxt.value = `${last.member_name}${t("님이")}${last.subject}${t("회의를 시작했습니다")}`;
        directcallSeq.value = last.meeting_seq;
    }
});

onBeforeUnmount(() => {
    directCallStore.resetDirectCallInfo();
});
</script>

<style lang="scss" scoped>
.main-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    row-gap: 57px;
    width: 700px;
    height: 480px;
}

.notice {
    background: #262627;
}

.notice-header {
    position: absolute;
    left: 0;
    top: 0;
    display: flex;
    justify-content: space-between;
    width: 100%;
    color: #fff;
    background: #363636 0 0 no-repeat padding-box;
    align-items: center;
    padding: 0 0 0 5px;
    box-sizing: border-box;
    font-size: 1.4rem;
    > button {
        background: transparent;
        border: none;
    }
}
.receive-call {
    background: transparent linear-gradient(119deg, #c623d2, #004cff) 0 0 no-repeat
        padding-box;
}

.sending-call {
    background: transparent linear-gradient(119deg, #23d252, #006fff) 0 0 no-repeat
        padding-box;
}

.status-description {
    color: #fff;
    text-align: center;
    line-height: 1.5;
    font-size: 17px;
}

.button-container {
    display: flex;

    .modal-icon {
        width: 65px;
        height: 65px;
    }
    button + button {
        margin-left: 30px;
    }
    > button {
        color: #fff;
        width: 170px;
        height: 46px;
        border-radius: 20px;
        border: none;

        display: flex;
        align-items: center;
        justify-content: center;
        column-gap: 10px;
        &.accept {
            background-color: #e600d7;
        }
        &.decline {
            background-color: #1c8eff;
        }
        &.cancel {
            background-color: #4a4a4a;
        }
    }
}

.status-box {
    position: absolute;
    top: 30px;
    font-size: 18px;
    opacity: 0.47;
    right: 26px;
    color: #fff;
    display: flex;
    gap: 8px;
}
</style>
