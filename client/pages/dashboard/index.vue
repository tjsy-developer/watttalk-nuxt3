<template>
    <div class="dashboard-container">
        <img class="dashboard-bg" src="@/assets/images/darkmode/logo/main_logo_hdcar.svg">
        <section class="left-panel">
            <div class="panel-user">
                <div>
                    <span>{{ t("안녕하세요") }}&nbsp;</span>
                    <span class="panel bold">{{ loginStore.nickname }}</span>
                    <span>{{ t("님") }},</span>
                </div>
                <span>{{ t("H 톡에 오신 것을 환영합니다") }}</span>
            </div>
            <div>
                <button @click="handleClickCloud('mypage')">내 정보 ></button>
                <button @click="logout">로그아웃 ></button>
            </div>
            <div class="penel button-group">
                <button @click="handleClickNotice" class="panel">
                    <img src="@/assets/images/darkmode/bt_d_bg.svg" />
                    <label>{{ t("공지사항") }}</label>
                    <img src="@/assets/images/darkmode/ic_d_notice.svg" />
                </button>
                <router-link to="/meeting" title="회의실">
                    <img src="@/assets/images/darkmode/bt_d_bg.svg" />
                    <label>{{ t("회의실") }}</label>
                    <img src="@/assets/images/darkmode/ic_d_meeting.svg" />
                </router-link>
                <button @click="handleClickCloud('login')">
                    <img src="@/assets/images/darkmode/bt_d_bg.svg" />
                    <label>{{ t("클라우드") }}</label>
                    <img src="@/assets/images/darkmode/ic_d_cloud.svg" />
                </button>
                <button>
                    <img src="@/assets/images/darkmode/bt_d_bg.svg" />
                    <label>{{ t("카메라/소리 설정") }}</label>
                    <img src="@/assets/images/darkmode/ic_d_camera.svg" />
                </button>
            </div>
        </section>
        <section class="right-panel">
            <ContactList></ContactList>
        </section>
    </div>
</template>

<script setup>
// import ContactList from '@/components/pages/dashboard/ContactList.vue'
import ContactList from "@/components/pages/dashboard/ContactList.vue";
import { userDataGetInfo } from "@/composables/common";
import { useSignallingSocket } from "@/composables/socket/useSignallingSocket";
import useSocketEmitEvents from "@/composables/socket/useSocketEmit";
import { useUserPreferenceStore } from "@/stores/common";
import { useLoginStore } from "@/stores/login";
import { useMeetingStore } from "@/stores/meeting";
import { callingBell, getDirectMessageTimeZone, getManagerDomain } from "@/utils/common";
import { useModal, useModalSlot, useVfm } from "vue-final-modal";
import { userListGetNickname } from "@/utils/userList";
import { useNuxtApp, useRoute, useRouter } from "nuxt/app";
import { storeToRefs } from "pinia";
import { emit } from "process";
import { ref, onMounted, onUpdated, onBeforeUnmount, computed, onUnmounted } from "vue";
import { useTokenStore } from "@/stores/token";
const router = useRouter();

const count = ref(0);
const { t } = useI18n();

const meetingStore = useMeetingStore();
const commonStore = useCommonStore();
const modalStore = useModalStore();
const callStore = useCallStore();
const directMessageStore = useDirectMessageStore();
const loginStore = useLoginStore();
const preferenceStore = useUserPreferenceStore();
const tokenStore = useTokenStore();

// 상태 값 추출
const {
    contentsViewType,
    roomNumberCount,
    hq_list,
    br_list,
    accessDeviceCheck,
    accessDeviceOS,
} = storeToRefs(commonStore);

const {
    recentData,
    recentDataAll,
    userData,
    userDataAll,
    sendDurationEnable,
    autoVideoSaveChange,
    callingPopupResult,
    groupCallCancelFlag,
} = storeToRefs(callStore);

const {
    useAutoPictureAccept,
    useAutoDiscalling,
    useDirectCall,
    autoCallAcceptTime,
    onlyVoiceCallId,
    videoRecording,
    roomNumber,
} = storeToRefs(preferenceStore);

const { sendDMFlag, readProcFlag, previousMessageFlag, previousMessageInfo } =
    storeToRefs(directMessageStore);

definePageMeta({
    layout: "waiting",
});
const vfm = useVfm();

const getCallingPopupResult = computed(() => callStore.callingPopupResult);
const getGroupCallCancelFlag = computed(() => callStore.groupCallCancelFlag);
const getSendDMFlag = computed(() => directMessageStore.sendDMFlag);
const getReadProcFlag = computed(() => directMessageStore.readProcFlag);
const getPreviousMessageFlag = computed(() => directMessageStore.previousMessageFlag);

const { signallingSocket } = useSignallingSocket();
const { requestCancelCalling } = useSocketEmitEvents();
const buttonIndex = ref("");
const isFilter = ref(0);
const brCnt = ref(0);
const tokenCheckResult = ref(false);
const m_local_deviceid = ref("");
const g_remoteMonitoringAppName = ref("");
const appJson = ref("");
const m_priRelayUrl = ref("");
const m_priRelayUsername = ref("");
const m_priRelayCredential = ref("");
const m_iceServers = ref({});
const m_en_seq = ref("");
const m_lang = ref("");
const rowIndex = ref([]);
const callReadyStuatsDOM = ref("");
const searchData = ref("");
const m_remote_deviceid = ref("");
const m_remote_nickname = ref("");
const m_remote_devicetype = ref("");
const m_remote_status = ref("");
const m_roomid = ref("");
const m_headquarters = ref("");
const m_branch = ref("");
const noSearchData = ref(false);
const prevButtonType = ref("");
const powerManageLink = ref("");
const funcAutoCallAceept = ref(null); // setTimeout 타입 명시

const callingPopupResultData = reactive({
    roomid: "",
    m_local_deviceid: "",
    deviceid: "",
    institution: "",
    nickname: "",
    meetingSeq: null,
    uniqueRoomid: "",
});

const { requestRefuseCalling, requestCalling, requestJoinMeeting } =
    useSocketEmitEvents();

const handleClickNotice = () => {
    // open();
    vfm.toggle("notice-modal");
    console.log(vfm);
};

const handleClickCloud = (path) => {
    const params = {
        accessToken: tokenStore.accessToken,
        refreshToken: tokenStore.enRToken,
        en_seq: loginStore.sessionEnSeq,
        hq_seq: loginStore.sessionHqSeq,
        br_seq: loginStore.sessionBrSeq,
        auth: loginStore.sessionAuth,
        user_id: loginStore.m_local_deviceid,
        user_name: loginStore.nickname,
        user_seq: "",
        en_alias: loginStore.institution,
        hq_alias: loginStore.headquarters,
        br_alias: loginStore.branch,
        email: loginStore.sessionEmail,
        device_type: loginStore.sessionDeviceType,
        redirect: "/" + path
    };
    const queryString = new URLSearchParams(params).toString();
    const domain = `${getManagerDomain()}/login?${queryString}`;
    window.open(domain, "target");
};

watch(getCallingPopupResult, (result) => {
    console.log("*** watch: getCallingPopupResult result =", result);

    if (result == 1) {
        callingBell("stop");
        console.log("*** watch: accept");

        callStore.setUniqueRoomid(callingPopupResultData.uniqueRoomid);

        if (callingPopupResultData.meetingSeq != undefined) {
            if (callingPopupResultData.meetingSeq != null) {
                console.log("*** watch: meetingSeq is Not Null !!");
                // @ts-ignore
                meetingStore.setMeetingSeq(callingPopupResultData.meetingSeq);
                requestJoinMeeting({
                    meetingSeq: meetingStore.meetingSeq,
                    roomID: callingPopupResultData.roomid,
                    uniqueRoomID: callStore.uniqueRoomid,
                });
            } else {
                meetingStore.setMeetingSeq(null);
                callingAccept(
                    callingPopupResultData.roomid,
                    callingPopupResultData.deviceid,
                );
            }
        } else {
            console.log("1. meetingSeq == undefined.");
            meetingStore.setMeetingSeq(null);
            callingAccept(callingPopupResultData.roomid, callingPopupResultData.deviceid);
        }
    } else if (result === 0) {
        callingBell("stop");
        console.log("*** watch: reject", callingPopupResultData);

        requestRefuseCalling({
            remoteDeviceId: callingPopupResultData.deviceid,
            roomID: callingPopupResultData.roomid,
            institution: callingPopupResultData.institution,
            nickname: callingPopupResultData.nickname,
        });

        callStore.setUniqueRoomid("");

        if (autoCallAcceptTime.value > 0 && funcAutoCallAceept.value != null) {
            console.log("*** socket: calling Reject >> AutoCallAccept Cancel");
            clearTimeout(funcAutoCallAceept.value);
            funcAutoCallAceept.value = null;
        }
    }

    callingPopupResultData.value = [];
    callStore.setCallingResult("init");
});

watch(
    () => getGroupCallCancelFlag,
    (result) => {
        console.log("*** watch: getGroupCallCancelFlag");
        if (result === "cancel") {
            requestCancelCalling();
        }
        callStore.setGroupCallCancelFlag("");
    },
);

watch(
    () => getSendDMFlag,
    (result) => {
        if (result) {
            // const messageList = store.state.directMessage.directMessageList;
            // const lastMsg = messageList[messageList.length - 1];
            // sendDirectMessageRequest(
            // 	lastMsg.sender,
            // 	lastMsg.receiver,
            // 	lastMsg.type,
            // 	lastMsg.message,
            // 	lastMsg.datetime
            // );
            // store.commit("directMessage/setSendDMFlag", false);
        }
    },
);

watch(
    () => getReadProcFlag,
    (result) => {
        if (result) {
            // const info = store.state.directMessage.readMessageInfo[0];
            // readProcess(info.sender, info.receiver, info.datetime);
            // store.commit("directMessage/setReadProcFlag", false);
        }
    },
);

watch(
    () => getPreviousMessageFlag,
    (result) => {
        if (result) {
            // getPreviousMessage();
            // store.commit("directMessage/setPreviousMessageFlag", false);
        }
    },
);

const handleCreateRoomID = (response) => {
    if (response) {
        const json = JSON.parse(response);
        console.log("*** create room id response:", json);
        // console.log("*** socket: createRoom response : roomid: " + json.roomid)

        if (json.roomid != "") {
            // 새로 생성한 roomid sessionStorage 등록
            sessionStorage.setItem("m_roomid", json.roomid);
            sessionStorage.setItem("inRoomFlag", "true");
            sessionStorage.setItem("createRoomFlag", "true");

            // callingType 설정 : 회의실인지 영상통화 인지 구분
            callStore.setCallingType("videoCall");

            // uniqueRoomid 설정
            callStore.setUniqueRoomid(json.unique_roomid);

            // 페이지 이동 (방입장)
            router.push("/call");
            commonStore.setChangeViewType(2);
        }
    }
};

const handleCalling = (response) => {
    const json = JSON.parse(response);
    console.log("*** socket: calling response", json);
    console.log(json);

    const isWaiting = sessionStorage.getItem("m_callWaiting") === "true";
    if (isWaiting) {
        const obj = {
            remoteDeviceId: json.deviceid,
            roomID: json.roomid,
            institution: json.institution,
            nickname: json.nickname,
        };
        const json2 = JSON.stringify(obj);

        requestRefuseCalling(json2);
        console.log("*** socket: emit refuseCalling");
        console.log(json2);
        return;
    }

    sessionStorage.setItem("m_callWaiting", "true");

    callingBell("play");

    m_remote_deviceid.value = json.deviceid;

    // 동시에 전화를 거는 경우
    if (json.callstatus == 0) {
        console.log("*** socket: calling >> If you are calling at the same time");

        // 통화중 팝업창 표시
        commonStore.setAlert(1);
    } else {
        console.log("*** socket: calling >> When not making calls at the same time");

        const remoteInfo = userDataGetInfo(json.deviceid);

        callStore.callingPopupInfo({
            institution: remoteInfo.enName,
            headquarters: remoteInfo.hqName,
            branch: remoteInfo.brName,
            nickname: remoteInfo.nickName,
        });

        // 통화중 팝업창 표시
        commonStore.setAlert(0);

        // 사용자 동적 생성
        // 테스트 :: 사용자가 참가할 때 현재 방의 인원수를 알아야 하기에 추가
        if (json.roomNumberCount != null) {
            commonStore.setRoomNumberCount(json.roomNumberCount);
            commonStore.makeUserListStatus();
        }

        // callingPopupResult
        callingPopupResultData.roomid = json.roomid;
        callingPopupResultData.m_local_deviceid = loginStore.m_local_deviceid;
        callingPopupResultData.deviceid = json.deviceid;
        callingPopupResultData.institution = json.institution;
        callingPopupResultData.nickname = json.nickname;
        callingPopupResultData.meetingSeq = json.meeting_seq;
        callingPopupResultData.uniqueRoomid = json.unique_roomid;

        console.log(autoCallAcceptTime.value);
        /* 전화 자동 수락 */
        if (autoCallAcceptTime.value > 0) {
            console.log(
                "*** socket: calling >> AutoCallAcceptTime = " + autoCallAcceptTime.value,
            );
            funcAutoCallAceept.value = setTimeout(() => {
                // 방에 입장한 상태가 아니라면 전화를 수락한다.
                /*
                    m_callWating == true => 전화가 온 상태
                    거절 또는 수락했을 경우 m_callWating = false
                    즉, 내가 거절 또는 수락을 안눌른 상태이면서 현재 페이지일 경우 방에 자동 입장
                */
                if (
                    sessionStorage.getItem("inRoomFlag") !== "true" &&
                    commonStore.contentsViewType == 0 &&
                    sessionStorage.getItem("m_callWaiting") == "true"
                ) {
                    console.log("*** socket: calling >> Start AutoCallAccept");

                    // 전화 수락
                    callStore.setCallingResult(1);
                    // 모달 닫기
                    modalStore.closeModal("call");
                }
            }, autoCallAcceptTime.value * 1000);
        }
    }
};

const handleCanMakeCall = (response) => {
    if (response) {
        const json = JSON.parse(response);
        console.log("*** socket: canMakeCall response, json:", json);

        // 통화 가능
        if (json.status == 1) {
            // create peer connection
            // insert janus peer connection
            // 방에 입장한 상태에서 전화 걸기
            // calling 페이지에서 처리

            // 상대방의 device id를 이용하여 기업 본부 지사 정보 가져오기
            // callingPopup get Info

            const remoteInfo = userDataGetInfo(json.remotedeviceid);

            callStore.callingPopupInfo({
                institution: remoteInfo.enName,
                headquarters: remoteInfo.hqName,
                branch: remoteInfo.brName,
                nickname: remoteInfo.nickName,
            });

            // 통화 연결 중 팝업 띄움
            // 사용자 초대 기능 사용 중 설정
            sessionStorage.setItem("m_inviting", true);

            commonStore.setAlert(6);

            // 통화 중 상대 초대할 경우 room ID 설정
            if (
                contentsViewType.value == 2 &&
                sessionStorage.getItem("m_roomid") != null
            ) {
                m_roomid.value = sessionStorage.getItem("m_roomid");
            }

            requestCalling({
                remoteDeviceId: remoteInfo.deviceId,
                roomID: sessionStorage.getItem("m_roomid"),
                callType: 1,
                institution: remoteInfo.enName,
                nickname: remoteInfo.nickName,
            });
        }
        // 통화 불가
        else {
            // console.log("*** socket: canMakeCall >> 초대하는 사용자가 다른 호스트와 통화중인 경우 통화 송신을 막는다.")

            // 통화중 팝업창 표시
            commonStore.setAlert(1);
        }
    }
};

const handleGroupRoom = (response) => {
    const json = JSON.parse(response);
    console.log("*** groupRoom response", json);

    if (json.roomid != "") {
        // 상대방이 전화를 받을 수 없는 상황일 때 처리
        if (json.canReceiveCall == 0) {
            console.log("*** socket: groupRoom >> 전화 걸기 불가능");

            // 거절 팝업창 표시
            commonStore.setAlert(3);
            sessionStorage.setItem("m_callWaiting", "false");
        } else {
            // 발신중 팝업 제거
            modalStore.closeModal("call");

            // uniqueRoomid 등록
            callStore.setUniqueRoomid(json.unique_roomid);

            // 회의실로 입장할 경우
            if (json.meeting_seq != null) {
                console.log("*** socket: groupRoom is MeetingSeq Not Null !!");
                meetingStore.setMeetingSeq(json.meeting_seq);
                requestJoinMeeting({
                    meetingSeq: meetingStore.meetingSeq,
                    roomID: json.roomid,
                    uniqueRoomID: callStore.uniqueRoomid,
                });
            } else {
                // 연락처에서 콜한 경우
                // 새로 생성한 roomid sessionStorage 등록
                sessionStorage.setItem("m_roomid", json.roomid);
                sessionStorage.setItem("inRoomFlag", "true");
                sessionStorage.setItem("createRoomFlag", "false");

                // 사용자가 참가할 때 현재 방의 인원수를 알아야 하기에 추가
                console.log(json.roomNumberCount);
                if (json.roomNumberCount != null) {
                    commonStore.setRoomNumberCount(json.roomNumberCount);
                    commonStore.makeUserListStatus();
                }

                // callingType 설정 : 회의실인지 영상통화 인지 구분
                callStore.setCallingType("videoCall");

                // 페이지 이동 (방입장)
                router.push("/call");
                commonStore.setChangeViewType(2);
            }
        }
    }
};

const handleCancelCalling = (response) => {
    console.log("*** socket: cancelCalling response");
    console.log(response);

    callingBell("stop");

    // 수신 모달 해제
    modalStore.closeModal("call");
    sessionStorage.setItem("m_callWaiting", "false");

    /* 전화 자동 수락 */
    if (autoCallAcceptTime.value > 0) {
        // 자동 수락 취소
        if (funcAutoCallAceept.value != null) {
            console.log("*** socket: cancelCalling >> AutoCallAccept Cancel");
            clearTimeout(funcAutoCallAceept.value);
            funcAutoCallAceept.value = null;
        }
    }
};

const handleMultiRefuseCalling = (response) => {
    console.log("*** socket: multiRefuseCalling response");
    console.log(response);
    // 통화 발신창 닫기 --> 통화 거절 팝업
    commonStore.setAlert(3);
    sessionStorage.setItem("m_callWaiting", "false");
};

const handleInviteCancelCalling = (response) => {
    try {
        const json = JSON.parse(response);
        console.log("*** socket: inviteCancelcalling response");
        console.log(json);

        m_remote_deviceid.value = json.deviceid;

        // 1:N 시 방을 나간 해당 대상만 Disconnection 처리
        if (json.multiuser != undefined && json.multiuser == 1) {
            console.log(
                "*** socket: inviteCancelcalling >> 1:N 시 방을 나간 해당 대상만 Disconnection 처리",
            );

            // 팝업 hide
            modalStore.closeModal("call");
            console.log("callingPopupHide");

            // 통화 대기 중 상태 -> 통화 종료 상태로 변경
            sessionStorage.setItem("m_callWaiting", false);
        } else {
            console.log(
                "*** socket: inviteCancelcalling >> 1:1 시 방을 완전히 나가는 걸로 처리",
            );

            // 팝업 hide
            modalStore.closeModal("call");

            // 통화 대기 중 상태 -> 통화 종료 상태로 변경
            sessionStorage.setItem("m_callWaiting", false);
        }

        callingBell("stop");
    } catch (e) {
        console.error(e);
    }
};

// 소켓 openMeetingChecking 받기
const handleOpenMeetingChecking = (response) => {
    if (meetingStore.openMeetingCheck == false) {
        const json = JSON.parse(response);

        // 회의실 open 상태
        if (json.start_status == 1) {
            console.log("*** socket.on: 회의실이 open 되어있다. 참여하자");
            console.log("*** socket.on: 입장할 room id 는 ", json.roomid, " 입니다.");

            // 입장 전에 uniqueRoomid 설정
            callStore.setUniqueRoomid(json.unique_roomid);

            requestJoinMeeting({
                meetingSeq: meetingStore.meetingSeq,
                roomID: json.roomid,
                uniqueRoomID: callStore.uniqueRoomid,
            });

            // 회의실 0 = close 상태, 회의실 2 = delete 상태
        }
        meetingStore.setOpenMeetingCheck("");
    }
};

const handleJoinMeeting = (response) => {
    console.log("*** socket.on: joinMeeting res = ", response);
    const json = JSON.parse(response);
    console.log("*** socket.on: json = ", json);

    sessionStorage.setItem("m_roomid", json.roomid);
    sessionStorage.setItem("createRoomFlag", "false"); // 내가 방장이 아니라는 것을 알기 위해서
    sessionStorage.setItem("inRoomFlag", "true"); // 방에 입장했다는 것을 알기 위해서

    if (json.roomNumberCount) {
        // console.log("#" + json.roomNumberCount)
        // console.log("@" + self.$store.state.roomNumberCount)
        if (json.roomNumberCount >= commonStore.roomNumberCount) {
            commonStore.setRoomNumberCount(json.roomNumberCount);
        }
    }

    commonStore.makeUserListStatus();

    // callingType 설정 : 회의실인지 영상통화 인지 구분
    callStore.setCallingType("meetingCall");
    // sessionStorage.setItem("callingType", "meetingCall")

    // 페이지 이동 (방입장)
    commonStore.setChangeViewType(2);
    router.push("/call");
};

function callingAccept(roomid, remotedeviceid) {
    console.log(roomid, remotedeviceid, "여기찍어라");
    const remoteInfo = userDataGetInfo(remotedeviceid);
    m_roomid.value = roomid;
    m_remote_deviceid.value = remotedeviceid;
    m_remote_nickname.value = remoteInfo.nickName;
    m_remote_devicetype.value = remoteInfo.deviceType;
    m_remote_status.value = remoteInfo.status;

    // sessionStorage save
    sessionStorage.setItem("m_roomid", roomid);
    sessionStorage.setItem("m_remote_deviceid", remotedeviceid);
    sessionStorage.setItem("m_remote_nickname", remoteInfo.nickName);
    sessionStorage.setItem("m_remote_devicetype", remoteInfo.deviceType);
    sessionStorage.setItem("m_remote_status", remoteInfo.status);

    // call.vue 으로 이동하여 join 처리
    sessionStorage.setItem("createRoomFlag", "false");
    sessionStorage.setItem("inRoomFlag", "true");

    modalStore.closeModal("notice");

    // callingType 설정 : 회의실인지 영상통화 인지 구분
    callStore.setCallingType("videoCall");

    // 페이지 이동 (방입장)
    sessionStorage.setItem("m_callWaiting", "false");
    router.push("/call");
    commonStore.setChangeViewType(2);

    console.log("*** methods: callingAccept");
}

function logout() {
    location.href = getManagerDomain();
    sessionStorage.clear();
}

// 마운트될 때 실행할 작업
onMounted(() => {
    sessionStorage.setItem("m_callWaiting", false);
    sessionStorage.setItem("inRoomFlag", false);
    sessionStorage.removeItem("m_inviting");
    sessionStorage.removeItem("hostRequestFlag");
    sessionStorage.removeItem("m_remote_nickname");
    sessionStorage.removeItem("m_remote_devicetype");
    sessionStorage.removeItem("m_remote_status");
    sessionStorage.removeItem("m_remote_deviceid");
    commonStore.makeUserListStatus();

    signallingSocket.on("createRoomID", handleCreateRoomID);
    signallingSocket.on("calling", handleCalling);
    signallingSocket.on("canMakeCall", handleCanMakeCall);
    signallingSocket.on("groupRoom", handleGroupRoom);
    signallingSocket.on("cancelCalling", handleCancelCalling);
    signallingSocket.on("multiRefuseCalling", handleMultiRefuseCalling);
    signallingSocket.on("inviteCancelCalling", handleInviteCancelCalling);
    signallingSocket.on("openMeetingChecking", handleOpenMeetingChecking);
    signallingSocket.on("joinMeeting", handleJoinMeeting);
});

// 언마운트되기 전 실행할 작업
onBeforeUnmount(() => {
    signallingSocket.off("createRoomID", handleCreateRoomID);
    signallingSocket.off("calling", handleCalling);
    signallingSocket.off("canMakeCall", handleCanMakeCall);
    signallingSocket.off("groupRoom", handleGroupRoom);
    signallingSocket.off("cancelCalling", handleCancelCalling);
    signallingSocket.off("multiRefuseCalling", handleMultiRefuseCalling);
    signallingSocket.off("inviteCancelCalling", handleInviteCancelCalling);
    signallingSocket.off("openMeetingChecking", handleOpenMeetingChecking);
    signallingSocket.off("joinMeeting", handleJoinMeeting);
});
</script>

<style lang="scss">
.dashboard-container {
    display: flex;
    height: inherit;
    gap: 10%;
    justify-content: center;
    
}

.dashboard-bg {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
}

.main-content {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
}

.left-panel {
    @media screen and (max-width: 1310px) {
        display: none;
    }
    font-size: 2.2rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    max-width: 30%;
    row-gap: 2rem;
    * {
        color: #fff;
    }
    .panel-user {
        font-size: 3rem;
    }
    .bold {
        font-weight: 700;
    }
    button {
        color: #9d9d9d;
        &:hover {
            font-weight: 700;
        }
    }
}

.right-panel {
    width: 100%;
    max-width: 616px;
    height: 100%;
    max-height: 753px;
    padding: 41px 38px 8px 42px;
    z-index: 1;
    border-top-left-radius: 20px;
    border-top-right-radius: 20px;
    bottom: 0;
    box-sizing: border-box;
    align-self: end;
    @include tc(background-color, "component-bg-color");
}

.button-group {
    display: flex;
    flex-wrap: wrap;
    margin-top: 28px;
    column-gap: 2px;
    row-gap: 8px;
    button, a {
        &:hover {
            box-shadow: 0 11px 17px rgba(0, 0, 0, .329412)
        }
        position: relative;
    }
    a {
        padding: 1px 6px;
    }
    img:last-child {
        position: absolute;
        left: 53px;
        top: 68px;
    }
    label {
        position: absolute;
        top: 39px;
        left: 0;
        width: 100%;
        font-size: 14px;
        text-align: center;
    }
}
</style>
