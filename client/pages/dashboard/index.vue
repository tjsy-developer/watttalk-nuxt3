<template>
    <div class="dashboard-container">
        <main class="main-content">
            <!-- 중앙 대시보드 콘텐츠 -->
        </main>
        <section class="right-panel">
            <ContactList></ContactList>
        </section>
    </div>
</template>

<script setup>
// import ContactList from '@/components/pages/dashboard/ContactList.vue'
import ContactList from "@/components/pages/dashboard/ContactList.vue";
import { userDataGetInfo } from "@/composables/common";
import useSocketEmitEvents from "@/composables/socket/useSocketEmit";
import { useLoginStore } from "@/stores/login";
import { callingBell } from "@/utils/common";
import { emitter } from "@/utils/eventBus";
import { useRoute, useRouter } from "nuxt/app";
import { storeToRefs } from "pinia";
import { ref, onMounted, onUpdated, onBeforeUnmount, computed } from "vue";
const router = useRouter();

const count = ref(0);

const commonStore = useCommonStore();
const modalStore = useModalStore();
const callStore = useCallStore();
const directMessageStore = useDirectMessageStore();
const loginStore = useLoginStore();
const meetingStore = useMeetingStore();
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
    autoCallAcceptTime,
    sendDurationEnable,
    autoVideoSaveChange,
    callingPopupResult,
    groupCallCancelFlag,
} = storeToRefs(callStore);

const { sendDMFlag, readProcFlag, previousMessageFlag, previousMessageInfo } =
    storeToRefs(directMessageStore);

// computed or methods 형태로 사용하려면
const getCallingPopupResult = computed(() => callStore.callingPopupResult);
const getGroupCallCancelFlag = computed(() => callStore.groupCallCancelFlag);
const getSendDMFlag = computed(() => directMessageStore.sendDMFlag);
const getReadProcFlag = computed(() => directMessageStore.readProcFlag);
const getPreviousMessageFlag = computed(() => directMessageStore.previousMessageFlag);

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

const { requestRefuseCalling, requestCalling, requestJoinMeeting } = useSocketEmitEvents();

watch(
    () => getCallingPopupResult.value,
    (result) => {
        console.log("*** watch: getCallingPopupResult result =", result);

        if (result == 1) {
            callingBell("stop");
            console.log("*** watch: accept");

            callStore.setUniqueRoomid(callingPopupResultData.uniqueRoomid);

            if (callingPopupResultData.meetingSeq != undefined) {
                if (callingPopupResultData.meetingSeq != null) {
                    console.log("*** watch: meetingSeq is Not Null !!");
                    // @ts-ignore
                    meettingStore.setMeetingSeq(callingPopupResultData.meetingSeq);
                    requestJoinMeeting({
                        meetingSeq: meettingStore.meetingSeq,
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
                callingAccept(
                    callingPopupResultData.roomid,
                    callingPopupResultData.deviceid,
                );
            }
        } else if (result === 0) {
            callingBell("stop");
            console.log("*** watch: reject");

            requestRefuseCalling(
                callingPopupResultData.roomid,
                callingPopupResultData.m_local_deviceid,
                callingPopupResultData.deviceid,
                callingPopupResultData.institution,
                callingPopupResultData.nickname,
            );

            callStore.setUniqueRoomid("");

            if (autoCallAcceptTime.value > 0 && funcAutoCallAceept.value != null) {
                console.log("*** socket: calling Reject >> AutoCallAccept Cancel");
                clearTimeout(funcAutoCallAceept.value);
                funcAutoCallAceept.value = null;
            }
        }

        callingPopupResultData.value = [];
        callStore.setCallingResult("init");
    },
);

watch(
    () => getGroupCallCancelFlag.value,
    (result) => {
        console.log("*** watch: getGroupCallCancelFlag");
        if (result === "cancel") {
            requestCancelCalling();
        }
        callStore.setGroupCallCancelFlag("");
    },
);

watch(
    () => getSendDMFlag.value,
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
    () => getReadProcFlag.value,
    (result) => {
        if (result) {
            // const info = store.state.directMessage.readMessageInfo[0];
            // readProcess(info.sender, info.receiver, info.datetime);
            // store.commit("directMessage/setReadProcFlag", false);
        }
    },
);

watch(
    () => getPreviousMessageFlag.value,
    (result) => {
        if (result) {
            // getPreviousMessage();
            // store.commit("directMessage/setPreviousMessageFlag", false);
        }
    },
);

// 마운트될 때 실행할 작업
onMounted(() => {
    sessionStorage.removeItem("m_inviting")
    sessionStorage.removeItem("hostRequestFlag")
    sessionStorage.setItem("m_callWaiting", false)
    sessionStorage.removeItem("m_remote_nickname")
    sessionStorage.removeItem("m_remote_devicetype")
    sessionStorage.removeItem("m_remote_status")
    sessionStorage.removeItem("m_remote_deviceid")

    emitter.on("calling", (response) => {
        const json = response;
        console.log("*** socket: calling response");
        console.log(json);

        if (sessionStorage.getItem("m_callWaiting") === "true") {
            const obj = {
                localdeviceid: loginStore.m_local_deviceid,
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
            modalStore.openModal("call");
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
            modalStore.openModal("call");

            // 사용자 동적 생성
            // 테스트 :: 사용자가 참가할 때 현재 방의 인원수를 알아야 하기에 추가
            if (json.roomNumberCount != null) {
                commonStore.setRoomNumberCount(json.roomNumberCount);
                commonStore.setRoomNumberCount();
            }

            // callingPopupResult
            Object.assign(callingPopupResultData, {
                roomid: json.roomid,
                m_local_deviceid: loginStore.m_local_deviceid,
                deviceid: json.deviceid,
                institution: json.institution,
                nickname: json.nickname,
                meetingSeq: json.meeting_seq,
                uniqueRoomid: json.unique_roomid,
            });

            /* 전화 자동 수락 */
            if (autoCallAcceptTime.value > 0) {
                console.log(
                    "*** socket: calling >> AutoCallAcceptTime = " +
                        this.autoCallAcceptTime,
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
    });

    emitter.on("canMakeCall", (response) => {
        if (response) {
            const json = response;
            // console.log("*** socket: canMakeCall response, json:", json)

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
                modalStore.openModal("call");

                // 통화 중 상대 초대할 경우 room ID 설정
                if (
                    self.contentsViewType == 2 &&
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
                modalStore.openModal("call");
            }
        }
    });

    emitter.on("groupRoom", (response) => {
        const json = JSON.parse(response);
        console.log("*** groupRoom response", json);

        if (json.roomid != "") {
            // 상대방이 전화를 받을 수 없는 상황일 때 처리
            if (json.canReceiveCall == 0) {
                console.log("*** socket: groupRoom >> 전화 걸기 불가능");

                // 거절 팝업창 표시
                commonStore.setAlert(3);
                modalStore.openModal("call");
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
                        meetingSeq: meettingStore.meetingSeq,
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
                    if (json.roomNumberCount != null) {
                        commonStore.setRoomNumberCount(json.roomNumberCount);
                        commonStore.makeUserListStatus();
                    }

                    // callingType 설정 : 회의실인지 영상통화 인지 구분
                    callStore.setCallingType("videoCall");

                    // 페이지 이동 (방입장)
                    router.push("/call")
                }
            }
        }
    });
});

function callingAccept(roomid, remotedeviceid) {
    const remoteInfo = userDataGetInfo(remotedeviceid)
    m_roomid.value = roomid
    m_remote_deviceid.value = remotedeviceid
    m_remote_nickname.value = remoteInfo.nickName
    m_remote_devicetype.value = remoteInfo.deviceType
    m_remote_status.value = remoteInfo.status

    // sessionStorage save
    sessionStorage.setItem("m_roomid", roomid)
    sessionStorage.setItem("m_remote_deviceid", remotedeviceid)
    sessionStorage.setItem("m_remote_nickname", remoteInfo.nickName)
    sessionStorage.setItem("m_remote_devicetype", remoteInfo.deviceType)
    sessionStorage.setItem("m_remote_status", remoteInfo.status)

    // call.vue 으로 이동하여 join 처리
    sessionStorage.setItem("createRoomFlag", "false")
    sessionStorage.setItem("inRoomFlag", "true")

    modalStore.closeModal("notice")

    // callingType 설정 : 회의실인지 영상통화 인지 구분
    callStore.setCallingType("videoCall")

    // 페이지 이동 (방입장)
    sessionStorage.setItem("m_callWaiting", "false")
    router.push("/call")

    console.log("*** methods: callingAccept")
}

// 언마운트되기 전 실행할 작업
onBeforeUnmount(() => {
    console.log("컴포넌트가 언마운트됩니다.");
});
</script>

<style lang="scss">
.dashboard-container {
    /* position: absolute;
    left: 64px;
    top: 64px;
    display: flex;
    height: 100vh;
    @include tc(background-color, 'bg-color') */
    display: flex;
    height: inherit;
}
.main-content {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
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
    overflow-y: auto;
    position: absolute;
    right: 230px;
    bottom: 0;
    box-sizing: border-box;
    @include tc(background-color, "component-bg-color");
}
</style>
