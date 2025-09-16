<template>
    <div
        :style="{
            height:
                commonStore.callingLayoutType == 5
                    ? `calc(100vh - ${headerHeight}px)`
                    : '',
        }"
        class="calling"
    >
        <CallLayout />
        <!-- <PreviewModal
            v-for="i in previewModalInfo.previewModalcnt"
            :key="i"
            :name="'previewModal' + i"
            :open-modal-index="i"
        /> -->
        <div id="you"></div>
        <div id="register"></div>
        <div id="username"></div>

        <!-- <div class="loaderWrap column items-center justify-center">
            <div id="loader"></div>
            <div
                v-if="maskLoading"
                class="maskLoading column items-center justify-center"
            >
                <p
                    v-if="maskLoading && maskLoadingType == 'prepairVideoCall'"
                    class="column items-center justify-center"
                >
                    <span>{{ t("prepareVideoCall1") }}</span>
                    <span>{{ t("prepareVideoCall2") }}</span>
                </p>
                <p
                    v-else-if="maskLoading && maskLoadingType == 'ThumnailTransfer'"
                    class="column items-center justify-center"
                >
                    <span>{{ t("호스트를 변경 중입니다") }}</span>
                    <span>{{ t("잠시만 기다려주세요") }}</span>
                </p>
            </div>
        </div> -->
        <canvas id="captureCanvas" style="display: none"></canvas>
    </div>
</template>

<script setup>
import $ from "jquery";
import { useCommonStore } from "@/stores";
import { useCallStore } from "@/stores/call";
import { useChattingStore } from "@/stores/chatting";
import { useDirectMessageStore } from "@/stores/directMessage";
import { useDrawingCanvasStore } from "@/stores/drawing";
import { useLoginStore } from "@/stores/login";
import { useMeetingStore } from "@/stores/meeting";
import { useNuxtApp } from "nuxt/app";
import {
    ref,
    onMounted,
    onUnmounted,
    onUpdated,
    onBeforeUnmount,
    reactive,
    computed,
    nextTick,
} from "vue";
import {
    commonToastMessage,
    customUserNickname,
    getImageFileName,
    getNickname,
    userDataGetInfo,
} from "@/composables/common";
import useSocketEmitEvents from "@/composables/socket/useSocketEmit";
import {
    convertImageToBlob,
    escapeFullScreen,
    getChattingTimeZone,
    getFeedsDisplay,
    getPersonnelInRoom,
    getWorldTime,
    handleFileDownload,
} from "@/utils/common";
const { t } = useI18n();
import { useModalStore } from "@/stores/modal";
import { useUserPreferenceStore } from "@/stores/common";
import CallLayout from "@/components/pages/call/CallLayout.vue";
import { checkMainVideo, userListGetNickname } from "@/utils/userList";
import FilePreviewModal from "@/components/modal/FilePreviewModal.vue";
import { useModal } from "vue-final-modal";
import LoadingModal from "@/components/modal/LoadingModal.vue";
import { useSignallingSocket } from "@/composables/socket/useSignallingSocket";
const { signallingSocket, transferSocket } = useSignallingSocket();

const {
    requestMultiCalling,
    requestMultiRefuseCalling,
    requestCancelCalling,
    requestScreenSharing,
    requestUserListAll,
    requestLastCallTime,
    requestUserStatus,
    requestForceLeave,
} = useSocketEmitEvents();
// import Janus from "@/public/js/janus"
const router = useRouter();

let Janus;

const commonStore = useCommonStore();
const callStore = useCallStore();
const loginStore = useLoginStore();
const chattingStore = useChattingStore();
const drawingStore = useDrawingCanvasStore();
const directMessageStore = useDirectMessageStore();
const meetingStore = useMeetingStore();
const modalStore = useModalStore();
const preferenceStore = useUserPreferenceStore();

let server = ref(null);
let janus = ref(null);
let sfutest = ref(null);

let opaqueId = ref("");
let myroom = ref("");
let myusername = ref(null);
let myid = ref(null);
let mystream = ref(null);
let mypvtid = ref(null);

// 배열 reactive
let feeds = ref([]);
let bitrateTimer = reactive([]);

let doSimulcast = ref("");
let doSimulcast2 = ref("");
let subscriber_mode = ref("");

let setIntervalStream = ref("");

// nested 객체 reactive
let multiCallingData = reactive({
    localdeviceid: "",
    remotedeviceid: "",
    roomid: "",
    institution: "",
    nickname: "",
});

let videoOffResult = ref(false);
let callingLayoutType = ref(1);
let myVideoCheckInterval = ref(null);

let videoArray = reactive([]);
let videoStream = reactive([]);

let chattingCallingIndex = ref("");

let oldDurationFlag = ref(false);
let chattingFileSendIndex = ref("");
let sendFileReader = ref(null);
let fileReceivedSize = ref(0);
let receiveFileType = ref("");
let fileReceiveTotalSize = ref(0);
let fileReceiveBuffer = ref([]);

let str_stream_picture_file_path = ref("");

let iceStateConnect = ref(undefined);
let iceStateCheck = ref(undefined);

let callingTimerStart = ref(false);
let callTimerInterval = ref("");

let callTime = ref(0);
let callHour = ref(0);
let callMin = ref(0);
let callSec = ref(0);

let bitrateTimerinterval = ref(null);
let canvasDrawInterval = ref(null);
let videoNoneCanvasInterval = ref(null);

let roomFullCheck = ref(false);
let PDFCancelUploadInterval = ref("");
let PDFsendFileName = ref("");

let mainVideoBitrate = ref(2000000);
let subVideoBitrate = ref(1500000);
let fullScreenApplyCount = ref(0);

let maskLoading = ref(false);
let autoPictureModal = ref(false);
let funcAutoCallAceept = ref(null);
let motionFailCheck = ref(false);
let sendDurationEnableFlag = ref(false);
let resultMaxNum = ref(0);
let funcAutoDiscalling = ref(null);
let rateStopper = ref(null);
let previewModalState = ref(false);

let interval = ref("");
let keepAliveList = reactive([]);

definePageMeta({
    layout: "video",
});

// 마운트될 때 실행할 작업
onMounted(() => {
    console.log("컴포넌트가 마운트되었습니다.");
    nextTick(() => {
        const { $Janus } = useNuxtApp();
        Janus = $Janus;
        createLoadingMask("prepairVideoCall");
        sayHello();
    });

    if (sessionStorage.getItem("createRoomFlag") === "true") {
        // 연락처 -> 통화화면으로 접근시에만 sending 및 통화연결
        if (callingType.value == "videoCall") {
            createRoomRequest(
                loginStore.m_local_deviceid,
                sessionStorage.getItem("m_roomid"),
                uniqueRoomid.value, // 2021-07-21 추가
            );

            // -> kyj 방 생성 후 최초 통화 발신중 메세지 출력
            // 자신의 언어에 따라 닉네임 변경
            const customNickname = customUserNickname(
                sessionStorage.getItem("m_remote_deviceid"),
            );
            console.log("*** mounted: sending customNickname: ", customNickname);
            callingLayoutChange("sending", customNickname, 1);
        }

        // ksh 추가
        // videoCallHost Check
        videoCallHostCheck(
            sessionStorage.getItem("m_roomid"),
            loginStore.m_local_deviceid,
        );
    } else {
        joinRoomRequest(
            loginStore.m_local_deviceid,
            sessionStorage.getItem("m_roomid"),
            uniqueRoomid.value, // 2021-07-21 추가
        );
    }

    // 처음으로 연결된 상대방의 영상을 큰 비디오에 자동으로 담기 위해 calling.vue 입장 Flag 값 기록
    sessionStorage.setItem("otherPartyAccess", "false");
    // console.log(
    //  "sessionStorage.setItem(otherPartyAccess): " +
    //      sessionStorage.getItem("otherPartyAccess")
    // )

    signallingSocket.on("created", (response) => {
        const json = JSON.parse(response);
        console.log("*** socket: created response. roomid: " + json.roomid);

        // set global variable
        sessionStorage.setItem("m_roomid", json.roomid);
        // sessionStorage.setItem("m_roomid", "1234")

        // 방을 생성한 후 전화걸기
        callingRequest(
            loginStore.m_local_deviceid,
            sessionStorage.getItem("m_remote_deviceid"),
            sessionStorage.getItem("m_roomid"),
            1,
            sessionStorage.getItem("m_institution"),
            sessionStorage.getItem("m_nickname"),
        );
    });

    signallingSocket.on("joined", (response) => {
        console.log(
            "*** socket: joined response. " + loginStore.m_local_deviceid + " is joined",
        );
    });

    signallingSocket.on("calling", function (response) {
        const json = JSON.parse(response);
        console.log("*** socket: calling response. json: " + response);

        sessionStorage.setItem("m_remote_deviceid", json.deviceid);

        // 동시에 전화를 거는 경우
        if (json.callstatus == 0) {
            // console.log("calling >> If you are calling at the same time")
            // 통화중 팝업창 표시
            contentsBtnClick(1);
        } else {
            // 통화 화면에서 calling이 올 경우는 거절 처리한다.
            // 내가 통화 종료중에 다른 사람이 전화했을 경우
            const obj = {
                localdeviceid: loginStore.m_local_deviceid,
                remotedeviceid: json.deviceid,
                roomid: json.roomid,
                institution: json.institution,
                nickname: json.nickname,
            };
            const json2 = JSON.stringify(obj);
            signallingSocket.emit("refuseCalling", json2);
            console.log("*** socket: emit refuseCalling. json: ", json2);

            // console.log("calling >> When not making calls at the same time")
            // // 통화 수락, 거절 팝업창 표시
            // const userInfo =
            //  userListGetInstitution(
            //      sessionStorage.getItem("m_remote_deviceid")
            //  ) +
            //  " " +
            //  userListGetNickname(sessionStorage.getItem("m_remote_deviceid"))
            // const result = confirm(userInfo + " 수신전화")
            // if (result) {
            //  callingAccept(json.roomid, json.deviceid)
            // } else {
            //  callingReject(
            //      json.roomid,
            //      loginStore.m_local_deviceid,
            //      json.deviceid,
            //      json.institution,
            //      json.nickname
            //  )
            // }
        }
    });

    signallingSocket.on("refuseCalling", function (response) {
        const json = JSON.parse(response);
        console.log("*** socket: refusecalling response. json: " + response);

        sessionStorage.setItem("m_remote_deviceid", json.deviceid);

        // "상대방이 전화를 받을 수 없습니다" 팝업
        contentsBtnClick(3);

        // 1:1 일 경우 3초 뒤 모달 제거 및 야누스 소멸
        if (commonStore.feedsLength == 0) {
            setTimeout(function () {
                // janus destroy
                commonStore.janus.destroy();

                // contactList.vue 로 이동
                commonStore.setChangeViewType(0);
                router.push("/dashboard");
                modalStore.closeModal("call");
            }, 3000);
        }

        // 발신 중 callingWindow 삭제
    });

    // 상대방이 전화 취소했을 시
    signallingSocket.on("cancelCalling", function (response) {
        // const json = JSON.parse(response)
        console.log("*** socket: cancelCalling response. json: " + response);

        // 해당 index layout change
        // for (let i = 1; i < 15; i++) {
        for (let i = 1; i < currentRoomNumberCount.value; i++) {
            if (!feeds.value[i]) {
                callingLayoutChange("none", "", i);
                sessionStorage.setItem("m_callWaiting", "false");

                // 해당 수락 거절 메시지 삭제
                chattingStore.chattingMessageList.splice(chattingCallingIndex.value, 1);

                // 하단 정렬일 경우에만
                // callingLayout 4 하단 레이아웃 default 버튼 변경
                callStore.setUnderStatus(0);
                setInitUnderStatus(0);
                break;
            }
        }

        // 전화벨 끄기
        callingBell("stop");

        /* 전화 자동 수락 취소 */
        if (autoCallAcceptTime.value > 0) {
            if (funcAutoCallAceept.value != null) {
                console.log("*** socket: cancelCalling >> AutoCallAccept Cancel");
                clearTimeout(funcAutoCallAceept.value);
                funcAutoCallAceept.value = null;
            }
        }
    });

    signallingSocket.on("multiCalling", function (response) {
        if (response) {
            const json = JSON.parse(response);
            console.log("*** socket: multiCalling response. json:" + response);

            escapeFullScreen();

            if (sessionStorage.getItem("m_callWaiting") === "true") {
                const obj = {
                    localdeviceid: loginStore.m_local_deviceid,
                    remotedeviceid: json.deviceid,
                    roomid: json.roomid,
                    institution: json.institution,
                    nickname: json.nickname,
                };
                const json2 = JSON.stringify(obj);
                signallingSocket.emit("refuseCalling", json2);
                console.log("*** socket: emit refuseCalling. json: ", json2);
                return;
            }

            sessionStorage.setItem("m_callWaiting", "true");

            let alreadyJoined = false;
            let previousFeedIndex = null;

            if (keepAliveList.includes(json.deviceid)) {
                alreadyJoined = true;
                previousFeedIndex = findFeedsIndexDeviceid(json.deviceid);
            }

            // 방 인원수를 체크하여 동적으로 CallingWindow 생성
            if (!keepAliveList.includes(json.deviceid)) {
                checkRoomNumberCount();
            }

            // 현재시간 UTC 생성
            const nowDate = getWorldTime();

            // 통화 수락 / 거절 메세지 출력
            // 맨 뒤의 숫자를 Feeds Index 번호 부여해야 함
            // for (let i = 1; i < 15; i++) {
            if (alreadyJoined) {
            } else {
                for (let i = 1; i < currentRoomNumberCount.value; i++) {
                    if (!feeds.value[i] || (alreadyJoined && previousFeedIndex != null)) {
                        if (alreadyJoined) i = previousFeedIndex;
                        // 사용자의 언어에 따라 닉네임 변경
                        const customNickname = customUserNickname(json.deviceid);
                        console.log(
                            "*** mounted: multicalling socket on event > customNickname: ",
                            customNickname,
                        );
                        // callingLayoutChange("receive", json.nickname, i)
                        callingLayoutChange("receive", customNickname, i);

                        // 통화 수락/ 거절이 왓을 때 해당 화면을 보여줄수 있도록 스크롤 이동
                        const currentCallingLayoutType = commonStore.callingLayoutType;
                        // 이동할 위치 찾기
                        const callingScroll = i;
                        if (currentCallingLayoutType == 4) {
                            if (callingScroll > 5) {
                                document.getElementsByClassName(
                                    "callingLayoutWrap4",
                                )[0].scrollLeft = 262 * (callingScroll - 5);
                            } else {
                                // 스크롤이 뒤에 있을 때 앞에서 들어올 경우 스크롤바 이동
                                document.getElementsByClassName(
                                    "callingLayoutWrap4",
                                )[0].scrollLeft = 0;
                            }
                        } else if (currentCallingLayoutType == 3) {
                            if (callingScroll > 4) {
                                document.getElementsByClassName(
                                    "callingLayoutWrap3",
                                )[0].scrollTop = 122 * (callingScroll - 4);
                            } else {
                                document.getElementsByClassName(
                                    "callingLayoutWrap3",
                                )[0].scrollTop = 0;
                            }
                        } else if (currentCallingLayoutType == 1) {
                            if (callingScroll > 9) {
                                document.getElementsByClassName(
                                    "callingLayout1",
                                )[0].scrollTop = document.body.scrollHeight;
                            } else {
                                document.getElementsByClassName(
                                    "callingLayout1",
                                )[0].scrollTop = 0;
                            }
                        }
                        // 수락 거절 메세지
                        addReceiveMessageList(
                            json.nickname,
                            nowDate,
                            getChattingTimeZone(nowDate),
                            json.nickname,
                            1,
                            3,
                        );

                        // 수락 거절 메세지 index 저장
                        chattingCallingIndex.value =
                            chattingStore.chattingMessageList.length - 1;
                        break;
                    }
                }

                multiCallingData = {
                    localdeviceid: loginStore.m_local_deviceid,
                    remotedeviceid: json.deviceid,
                    roomid: sessionStorage.getItem("m_roomid"),
                    institution: sessionStorage.getItem("m_institution"),
                    nickname: sessionStorage.getItem("m_nickname"),
                };

                // 전화벨 켜기
                callingBell("play");

                // 하단 정렬일 경우에만
                // callingLayout 4 하단 레이아웃 통화 버튼으로 변경
                callStore.setUnderStatus(1);

                /* 전화 자동 수락 */
                if (autoCallAcceptTime.value > 0) {
                    console.log(
                        "*** socket: multiCalling >> AutoCallAcceptTime = " +
                            autoCallAcceptTime.value,
                    );
                    funcAutoCallAceept.value = setTimeout(() => {
                        /*
								m_callWating == true => 전화가 온 상태
								거절 또는 수락했을 경우 m_callWating = false
							*/
                        if (sessionStorage.getItem("m_callWaiting") == "true") {
                            console.log(
                                "*** socket: multiCalling >> Start AutoCallAccept",
                            );
                            // 전화 수락
                            callStore.setMultiCallingResult(1);
                        } else {
                            console.log(
                                "*** socket: multiCalling >> not Start AutoCallAccept !",
                            );
                        }
                    }, autoCallAcceptTime.value * 1000);
                }
            }
        }
    });

    // receive > his_seq, status
    signallingSocket.on("callStartTime", function (response) {
        if (response) {
            const json = JSON.parse(response);
            console.log("*** socket: callStartTime response. json:" + response);

            if (json.status === 1) {
                sessionStorage.setItem("m_his_seq", json.his_seq);
            }
        }
    });

    // videoOnOff on event
    signallingSocket.on("videoOnOff", function (response) {
        if (response) {
            const json = JSON.parse(response);
            console.log("*** socket: videoOnOff response. json:" + response);
            // console.log(json.rfid)

            const videoOnOffIndex = findFeedsIndexRfid(json.rfid);

            // 사용자 언어에 따라 닉네임 변경
            const customNickname = customUserNickname(
                feeds.value[videoOnOffIndex].rfdeviceid,
            );
            console.log(
                "*** mounted: videoOnOff socket on event > customNickname: ",
                customNickname,
            );

            // video OFF
            if (json.status == 0) {
                // console.log(feeds[videoOnOffIndex])
                // video OFF 화면 전환

                callingLayoutChange("unpublished", customNickname, videoOnOffIndex);

                // Video Hide
                $("#panel-inner" + videoOnOffIndex).hide();

                // VideoMain Index와 해당 Index가 동일 할 경우 Main 이미지 변경
                if (callStore.videoMainIndex == videoOnOffIndex) {
                    // mainVideoChangeFunc(0, feeds[videoOnOffIndex].rfdisplay)
                    console.log("여기");
                    mainVideoChangeFunc(0, customNickname);
                }
            } else {
                callingLayoutChange("attach", customNickname, videoOnOffIndex);

                // video Stream Show
                $("#panel-inner" + videoOnOffIndex).show();

                if (callStore.videoMainIndex == videoOnOffIndex) {
                    // mainVideoChangeFunc(1, feeds[videoOnOffIndex].rfdisplay)
                    mainVideoChangeFunc(1, customNickname);
                }
                if (callingLayoutType != 1) {
                    videoResize();
                }
            }
            nextTick(() => {
                setAudioOutput();
            });
        }
    });

    // screenSharing on event
    signallingSocket.on("screenSharing", function (response) {
        if (response) {
            const json = JSON.parse(response);
            console.log("*** socket: screenSharing response. json:" + response);
            // console.log(json.rfid)

            const screenSharingIndex = findFeedsIndexRfid(json.rfid);

            // Screen Sharing OFF
            if (json.status == 0) {
                // 메인 비디오 풀 스크린 버튼 제거
                // callStore.setMainVideoFullScreen", false)

                // 메인 비디오 풀 스크린 텍스트 박스 제거
                callStore.setMainVideoFullScreenText(false);

                if (document.exitFullscreen) {
                    document.exitFullscreen().catch((err) => Promise.resolve(err));
                } else if (document.webkitExitFullscreen) {
                    /* Safari */
                    document.webkitExitFullscreen().catch((err) => Promise.resolve(err));
                }
            } else {
                // console.log(feeds[screenSharingIndex])

                // 메인 비디오 풀 스크린 버튼 생성
                // callStore.setMainVideoFullScreen", true)

                // 메인 비디오 풀 스크린 텍스트 박스 생성
                callStore.setMainVideoFullScreenText(true);

                // 1초뒤 사용자에게 보여줄 토스트 메시지 : 메인 화면 하단에 전체 화면 아이콘을 클릭해주세요.
                setTimeout(function () {
                    commonToastMessage(t("mainVideo FullScreen"));
                }, 1000);

                const beforeMainIndex = callStore.videoMainIndex;
                // main Index 변경
                callStore.setVideoMainIndex(screenSharingIndex);

                // 레이저 포인터가 true일 경우 flase로 바꾼다. -> 초기화 시키는 것임.
                if (callStore.laserPointerShow) {
                    callStore.setLaserPointerShow(false);
                }

                // video Layout Type Change
                if (commonStore.callingLayoutType != 3) {
                    // videolayout change
                    saveVideoInfo();
                }

                // 1번레이아웃에서 다른사용자가 메인일 때 드로잉을 시작한경우 3번레이아웃으로 바뀌면서
                // 호스트가 메인이되며 기존 메인이였던 사용자의 화면 비율을 원래대로 돌려야한다.
                if (beforeMainIndex == 0) {
                    console.log(document.getElementById("myvideo"));
                    document.getElementById("myvideo").style.scale = 1;
                } else {
                    console.log(document.getElementById("remotevideo" + beforeMainIndex));
                    document.getElementById("remotevideo" + beforeMainIndex).style.scale =
                        1;
                }
            }
        }
    });

    // receive Message
    signallingSocket.on("notification", function (response) {
        if (response) {
            const json = JSON.parse(response);
            console.log("*** socket: notification response. json:" + response);

            // 보낸사람의 닉네임을 사용자의 언어에 따라 변경하는 코드
            const customNickname = customUserNickname(json.deviceid);
            console.log(
                "*** mounted: socket > notification > customNickname: ",
                customNickname,
            );

            // mainVideo의 닉네임도 사용자의 언어에 따라 변경할 수 있도록 한다.
            // json 중 메인비디오의 이름만 받아오지만, 메인화면은 호스트가 관리하기 때문에 mainIndex가 동일할 것이라고 생각한다.
            // mainVideo가 자신이라면,
            let mainVideoCustomNickname = "";
            if (json.mainVideoName != undefined) {
                if (json.mainVideoDeviceid == loginStore.m_local_deviceid) {
                    mainVideoCustomNickname = sessionStorage.getItem("m_nickname");
                } else {
                    mainVideoCustomNickname = customUserNickname(json.mainVideoDeviceid);
                }
                console.log(
                    "*** mounted: socket > notification > mainVideocustomNickname: ",
                    mainVideoCustomNickname,
                );
            }

            addReceiveMessageList(
                // json.nickname,
                customNickname,
                json.datetime,
                getChattingTimeZone(json.datetime),
                json.message,
                json.level,
                json.type,
                // json.mainVideoName
                mainVideoCustomNickname,
            );
        }
    });

    // 다른 사용자가 통화 종료했을 경우
    signallingSocket.on("discalling", function (response) {
        if (response) {
            const json = JSON.parse(response);
            if (keepAliveList.includes(json.deviceid)) return;
            console.log("*** socket: discalling response. json:" + response);

            const userNickname = userListGetNickname(json.deviceid);
            const feedsIndex = findFeedsIndexEndUserCall(userNickname);

            // 통화 중에 다른 사용자가 퇴장했을 경우 - 해당 사용자의 줌레벨 값을 1로 초기화 시킨다.(ksy)
            if (
                !(
                    typeof commonStore.userListStatus[feedsIndex] == "undefined" ||
                    commonStore.userListStatus[feedsIndex] == null
                )
            ) {
                commonStore.userListStatus[feedsIndex].zoomLevel = 1;
            }
            console.log(userNickname, feedsIndex);

            // 파일 수신중 송신자가 퇴장 시 파일수신창 없애기
            if (userNickname == commonStore.fileSendNickname) {
                // fileReceiveAllow = false

                // 파일 송수신 진행 중 초기화
                // sessionStorage.setItem("fileSendingFlag", false)

                // 파일 수락/거절 채팅 인덱스를 가져온다
                const fileChatIndex =
                    commonStore.userListStatus[feedsIndex].fileReceiveInfo.fileChatIndex;

                // 송신자가 파일 송신 취소를 메세지에 추가
                addChatFileSendMessage(userNickname, 10, feedsIndex, fileChatIndex);

                // 수신측 파일 송수신 초기화
                fileReceiveReset(json.deviceid, feedsIndex);
                // fileReceiveAllow = false

                // const rfidIndex = userDataGetIndex(json.deviceid)
                // console.log("discalling일 경우", rfidIndex)
                // console.log(
                //  "*** methods: fileSend - 전송자가 파일 전송을 취소했을 경우"
                // )

                // fileReceiveBuffer.value = []
                // fileReceivedSize.value = 0

                // const sendFileNickname =
                //  chattingStore.chattingMessageList[
                //      chattingFileSendIndex
                //  ].nickname

                // const message = sendFileNickname + t("fileSending text10")

                // // 현재시간 UTC 가져오기
                // const nowDate = getWorldTime()

                // set(
                //  chattingStore.chattingMessageList,
                //  chattingFileSendIndex,
                //  {
                //      type: 0,
                //      message,
                //      date: nowDate,
                //      chattingDate: getChattingTimeZone(nowDate),
                //      nickname: sendFileNickname,
                //      level: 1,
                //      isReceived: true
                //  }
                // )
                // 퇴장한 사람 파일수신창 없애기
                callingLayoutChange(
                    "none",
                    sessionStorage.getItem("m_nickname"),
                    feedsIndex,
                );
                // 파일 송신률병합 후 제거 - ksy
                // callingLayoutChange(
                //  "attach",
                //  sessionStorage.getItem("m_nickname"),
                //  0
                // )
                $("#myvideo").show();

                commonStore.fileSend();
                // 파일 송수신 flag 초기화
                //commonStore.fileSendStatus", 0)
                //commonStore.setFileModalFlag", false) // 파일 송수신 팝업 flag 초기화

                // 하단 정렬일 경우에만
                // callingLayout 4 하단 레이아웃 default 버튼 변경
                // callStore.setUnderStatus", 0)
                setInitUnderStatus(0);
            }
            console.log(commonStore.fileSendStatus);
            // 파일 송신 중에 수신자가 퇴장 시 거절처리 진행
            if (
                (commonStore.fileSendStatus == 2 || commonStore.fileSendStatus == 3) &&
                userNickname == commonStore.fileReceiver
            ) {
                // 거절 팝업창으로 변경
                commonStore.setFileSendStatus(4);

                console.log(sendFileReader.value, rateStopper.value);
                // 송신할 파일 Reader 중단
                if (
                    !(
                        typeof sendFileReader.value == "undefined" ||
                        sendFileReader.value == null
                    )
                ) {
                    sendFileReader.value.abort();
                }

                // 전송률 전송 재귀함수 정지
                if (
                    !(
                        typeof rateStopper.value == "undefined" ||
                        rateStopper.value == null
                    )
                ) {
                    rateStopper.value();
                    rateStopper.value = null;
                }
                // 사진 전송 중 메세지 -> 사진 수신 거절 메세지로 변경 ksy
                const fileChatIndex =
                    commonStore.userListStatus[feedsIndex].fileSendInfo.fileChatIndex;
                addChatFileSendMessage(userNickname, 6, feedsIndex, fileChatIndex);
            }

            console.log("discalling on Event : " + roomFullCheck.value);
            if (!roomFullCheck.value) {
                // 통화 종료 시 t = nuxt 버전에 따라서 충돌이 일어나므로, setTimeout으로 예외처리 하면 된다는 답변을 받았음.
                setTimeout(function () {
                    const receiveMessage = userNickname + t("chatting Leave");
                    const nowDate = getWorldTime();
                    addReceiveMessageList(
                        userNickname,
                        nowDate,
                        getChattingTimeZone(nowDate),
                        receiveMessage,
                        1,
                        0,
                    );
                    getPersonnelInRoom();
                }, 500);
            } else {
                // 룸 가득 차있다는 flag 초기화
                roomFullCheck.value = false;
            }

            console.log(
                "*** socket: discalling > autoDiscalling.value = " + autoDiscalling.value,
            );
            /* 통화 자동 종료가 설정되어있는지 체크한다. */
            if (autoDiscalling.value) {
                /*
						방 안에 혼자남았을 경우 통화를 자동으로 종료한다.
						사용자가 나가면 feeds를 empty로 바꾸기 때문에 값이 비어있는지 체크해야 한다.
					*/
                const NullFilterFeeds = feeds.value.filter(function (item) {
                    return item !== null;
                });

                if (NullFilterFeeds.length == 0) {
                    console.log("*** socket: discalling > start AutoDiscalling");

                    // 자동종료 팝업창 표시
                    noneOverlayModal(19);

                    // 자동 통화 종료 설정
                    funcAutoDiscalling.value = setTimeout(() => {
                        // 자동 통화 종료 진행한다.
                        callStore.setAutoDiscallingResult(true);
                        commonStore.janus.destroy();
                    }, 5000);
                }
            }

            /* glass > 연결이 끊겼을 경우 움직임 없음 알람에 속해있을 경우 제외한다. */
            if (callStore.motionNoMoveInfo.length != 0 && callStore.motionNoMoveFlag) {
                /* 해당 deviceid가 배열에 존재하는지 확인한다. */
                for (let i = 0; i < callStore.motionNoMoveInfo.length; i++) {
                    if (callStore.motionNoMoveInfo[i].deviceid == json.deviceid) {
                        console.log("*** socket: discalling > motionNoMove Remove !");
                        const motionNoMove = callStore.motionNoMoveInfo[i];
                        /* deviceid가 움직임 없음 배열에 존재한다 */
                        /* 현재 움직임 없음 배열의 길이를 체크한다. > length == 1 일 경우 움직임 없음 Flag를 false 변경 */
                        if (callStore.motionNoMoveInfo.length == 1) {
                            /* 움직임 없음 모션 Flag = false 로 변경한다. > 해당 건을 삭제 후에는 length 가 0이기 때문에 */
                            callStore.setMotionNoMoveFlag(false);
                        }

                        /* 해당 deviceid를 움직임 없음 배열에서 삭제한다. */
                        callStore.deleteMotionNoMoveInfo(i);

                        /* 움직임 없음 모션 아이콘을 subVideo에서 삭제한다. */
                        setSubVideoMotionNoMove(motionNoMove.rfIndex, false);
                    }
                }
            }
            // 나간 사람 오디오 제거해줌
            const permanantAuido = document.getElementById(`audioControl${feedsIndex}`);
            permanantAuido.srcObject = null;
        }
    });

    // ========= 통화 중 연락처 화면 관련 function ===========

    // User Call Ready Status on/off Event
    signallingSocket.on("callReadyStatus", (response) => {
        try {
            const json = JSON.parse(response);
            console.log("*** socket: callReadyStatus. json: ", json);
            const buttonIndex = sessionStorage.getItem("ListViewType");

            if (buttonIndex == 1) {
                const userIndex = userDataGetIndex(json.deviceid);

                // set(callStore.userData[userIndex], "status", json.status);
                callStore.userData[userIndex].status = json.status;

                // 조직도 목록 갱신
                // userListAllRequest(m_local_deviceid, m_en_seq)
            } else {
                const userIndex = recentDataGetIndex(json.deviceid);

                callStore.recentData[userIndex].status = json.status;
                // set(callStore.recentData[userIndex], "status", json.status);

                // 최근통화 목록 갱신
                // recentListAllRequest(m_local_deviceid)
            }
        } catch (e) {
            console.log(e);
        }
    });

    // userStatus :: calling에서는 상대방을 초대하는 것 외에는 없음.
    signallingSocket.on("userStatus", (response) => {
        if (response) {
            const json = JSON.parse(response);
            console.log("*** socket: userStatus response");
            console.log(json);
            const remoteInfo = userDataGetInfo(json.deviceid);
            sessionStorage.setItem("m_remote_deviceid", json.deviceid);
            sessionStorage.setItem("m_remote_nickname", remoteInfo.nickName);
            sessionStorage.setItem("m_remote_devicetype", remoteInfo.deviceType);
            sessionStorage.setItem("m_remote_status", remoteInfo.status);

            console.log(
                "*** socket: userStatus sessionStorage.setItem(inRoomFlag): " +
                    sessionStorage.getItem("inRoomFlag"),
            );

            // 자신이 통화중인 경우 상대방 초대하기
            if (sessionStorage.getItem("inRoomFlag") === "true") {
                console.log("*** socket: 자신이 통화중인 경우 상대방 초대하기");
                console.log("*** socket: inRoomFlag: true");

                // 초대하는 사용자가 다른 호스트와 통화중인 경우 통화 송신을 막는다
                canMakeCallRequest(json.deviceid);
                sessionStorage.setItem("m_callWaiting", "true");
            }
        }
    });

    // 통화중 상대방 초대하기
    signallingSocket.on("canMakeCall", (response) => {
        if (response) {
            const json = JSON.parse(response);
            console.log("*** socket: canMakeCall response. json: " + response);

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

                // 긴급 통화 일 경우 7번 모달 출력
                if (callStore.urgentCallingFlag) {
                    contentsBtnClick(7);

                    // 긴급 통화 Flag 초기화
                    callStore.setUrgentCallingFlag(false);
                } else {
                    // 일반 통화 일 경우 6번 모달 출려
                    contentsBtnClick(6);
                }

                // 통화 중 상대 초대할 경우 room ID 설정
                let m_roomid = sessionStorage.getItem("m_roomid");

                callingRequest(
                    loginStore.m_local_deviceid,
                    json.remotedeviceid,
                    sessionStorage.getItem("m_roomid"),
                    1,
                    remoteInfo.enName,
                    remoteInfo.nickName,
                    meetingStore.meetingSeq, // 미팅에서 입장한 사용자가 다른 사용자를 초대했을 경우 필요
                );
            }
            // 통화 불가
            else {
                console.log(
                    "*** socket: canMakeCall >> 초대하는 사용자가 다른 호스트와 통화중인 경우 통화 송신을 막는다.",
                );

                // 통화중 팝업창 표시
                contentsBtnClick(1);
            }
        }
    });

    signallingSocket.on("inviteCancelCalling", function (response) {
        try {
            const json = JSON.parse(response);
            console.log("*** socket: inviteCancelcalling response");
            console.log(json);

            m_remote_deviceid = json.deviceid;

            // audio bell
            // m_audio_bell.pause();

            // 1:N 시 방을 나간 해당 대상만 Disconnection 처리
            if (json.multiuser != undefined && json.multiuser == 1) {
                console.log(
                    "*** socket: inviteCancelcalling >> 1:N 시 방을 나간 해당 대상만 Disconnection 처리",
                );

                // 팝업 hide
                modalStore.closeModal("call");

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
        } catch (e) {
            console.error(`${e}`);
        }
    });

    // 비회원 초대 이메일 체크 --- ksy
    signallingSocket.on("inviteNoneMember", function (response) {
        if (response) {
            console.log("*** socket: inviteNoneMember response. json:" + response);

            const json = JSON.parse(response);

            if (json.result == 1) {
                // 이미 초대되어 있는 사용자
                meetingAlertModal(2);
            } else if (json.result == 0) {
                // 초대 완료
                meetingAlertModal(3);
            }
            // 회의중 비회원 초대 모달 초기화
            // meetingStore.setMeetingAlertStatus", 0)
        }
    });

    // hostCheck
    signallingSocket.on("videoCallHostCheck", function (response) {
        try {
            const json = JSON.parse(response);
            console.log("** socket on videoCallHostCheck", json); // string이 나와야 합니다.

            // 2. 길이 확인
            if (json.deviceid == loginStore.m_local_deviceid) {
                // 호스트 아이콘 생성
                setHostIcon(0, true);
                // 호스트 버튼 변경
                chattingStore.setVideoCallHost(true);
                // 2021.06.22 글라스 -> PC 전화 걸 경우 duration이 발생 하지 않으므로 해당 로직 추가
                // 방에 혼자가 아니고 (1 보다 클 경우)
                if (personnelInRoom.value > 1) {
                    // 바둑판이 아닐 경우만 실행 -> 바둑판에서도 메인화면을 설정할 수 있으므로 실행한다.
                    // if (commonStore.callingLayoutType != 1) {
                    // 호스트가 바라보는 화면으로 전환한다
                    if (videoCallHost.value) {
                        // duration이 2번 찍혀야하기 때문에 먼저는 내 자신을 duration 한 후 0.5초 뒤 글라스를 메인으로 한다.
                        console.log("hostSelectedMainVideo 24");
                        hostSelectedMainVideo(myid.value);

                        const showHostMainIndex = callStore.videoMainIndex;
                        let showHostMainRfid = "";

                        if (showHostMainIndex == 0) {
                            showHostMainRfid = myid.value;
                            console.log("내가 메인");
                        } else {
                            showHostMainRfid = feeds.value[showHostMainIndex].rfid;
                            console.log("나 메인 아님");
                        }

                        setTimeout(function () {
                            hostSelectedMainVideo(showHostMainRfid);
                        }, 500);
                    }
                    // }
                }
            } else {
                const index = findFeedsIndexDeviceid(json.deviceid);
                // 호스트 아이콘 생성
                setHostIcon(index, true);

                // 호스트 버튼 변경
                chattingStore.setVideoCallHost(false);
            }
        } catch (e) {
            console.error(e);
        }
    });

    // 호스트 변경
    signallingSocket.on("videoCallHostChange", function (response) {
        try {
            const json = JSON.parse(response);
            console.log("*** socket: videoCallHostChange response. json: " + response);

            // 채팅 메시지 변수
            let chattingNickname = "";

            if (json.status == 1) {
                // 수락 -> 자신
                if (json.host_deviceid == loginStore.m_local_deviceid) {
                    console.log(
                        "*****현재 드로잉 활성화 상태: ".concat(
                            commonStore.isDrawingEnable,
                        ),
                    );

                    // 썸네일을 이관하는 시간이 소요되기 때문에 로딩바를 생성한다
                    if (commonStore.isDrawingEnable) {
                        console.log("썸네일 이관 모달을 생성했다.");
                        createLoadingMask("ThumnailTransfer");
                    }
                    setHostIcon(0, true);

                    // 호스트 버튼 변경
                    chattingStore.setVideoCallHost(true);

                    // 호스트 변경 메시지 변수 저장
                    chattingNickname = sessionStorage.getItem("m_nickname");

                    // 전체 음소거 일 경우 또는 강제로 전 호스트가 마이크를 off 했을 경우 호스트가 변경되었기 때문에 마이크 off 를 on으로 변경해야 한다.
                    if (callStore.allMicMuteFlag || callStore.forceMicOnOffFlag) {
                        // 현재 마이크 상태가 off 일 경우에만 진행
                        if (isSounded.value) {
                            // 음소거 버튼 변경
                            commonStore.setIsSounded();

                            // 마이크 음소거 해제
                            toggleMute();

                            // 마이크 on/off socket event 실행
                            micOnOff(1, myid.value);

                            // userListStatus 마이크 아이콘 해제
                            setUserListMicMute(0, false);
                        }
                    }

                    let message = "";
                    if (preferenceStore.lang == "ko") {
                        message = chattingNickname + t("hostChange text1");
                    } else {
                        message = t("hostChange text1") + chattingNickname;
                    }

                    // 호스트 변경 메시지 보내기
                    const chattingMessage = message;
                    const chattingLevel = 2;
                    const chattingType = 0;

                    addSendMessageList(
                        chattingNickname,
                        chattingMessage,
                        chattingLevel,
                        chattingType,
                    );
                } else {
                    // 새로운 호스트의 index 검색
                    const index = findFeedsIndexDeviceid(json.host_deviceid);
                    setHostIcon(index, true);

                    // 호스트 버튼 변경
                    chattingStore.setVideoCallHost(false);

                    // 호스트 변경 메시지 변수 저장
                    chattingNickname = userListGetNickname(json.host_deviceid);
                }

                // 바둑판이 아닐 경우만 실행
                // 바둑판이 아닐 경우에만 실행이였지만, 바둑판에서도 메인화면을 변경할 수 있도록 변경하므로 주석처리한다.
                // if (commonStore.callingLayoutType != 1) {
                // 호스트가 바라보는 화면으로 전환한다
                if (videoCallHost.value) {
                    const showHostMainIndex = callStore.videoMainIndex;
                    let showHostMainRfid = "";

                    if (showHostMainIndex == 0) {
                        showHostMainRfid = myid.value;
                    } else if (
                        showHostMainIndex != 0 &&
                        feeds.value[showHostMainIndex] == null
                    ) {
                        showHostMainRfid = myid.value;
                    } else {
                        showHostMainRfid = feeds.value[showHostMainIndex].rfid;
                    }

                    console.log("hostSelectedMainVideo 25");
                    hostSelectedMainVideo(showHostMainRfid);
                    // }
                }

                // diconnect, discalling 시는 prev_host_deviceid를 돌려주지 않음.
                // 정상적인 호스트 요청 시 prev_host_deviceid를 돌려줌. 그리고 상대방이 나가지 않았기에 왕관표시 제거 해야함.
                if (
                    json.prev_host_deviceid != null ||
                    json.prev_host_deviceid != undefined
                ) {
                    // 이전 호스트의 index 검색 -> 왕관표시 제거
                    const prevHostindex = findFeedsIndexDeviceid(json.prev_host_deviceid);
                    setHostIcon(prevHostindex, false);

                    // 호스트 수락 거절 팝업 닫기
                    modalStore.closeModal("host");
                }
            } else if (json.status == 0) {
                // 호스트 요청 대기중 팝업 삭제
                modalStore.closeModal("host");

                // 호스트가 존재하지 않음. -> 호스트 요청자
                // alert("룸 안에 호스트가 존재하지 않습니다.")
                alertModal(0);
            } else if (json.status == 2) {
                // 거절 -> 호스트
                hostPermissionRequest(2);
            } else if (json.status == 3) {
                // 호스트 요청 대기중 팝업 삭제
                modalStore.closeModal("host");

                // 잘못된 요청 내가 호스트를 요청했던 호스트가 현재 룸 호스트와 다르다 -> 호스트 요청자
                // alert("잘못된 요청입니다. \n다시 호스트 요청을 진행해주세요.")
                alertModal(1);
            } else if (json.status == 4) {
                // 새로운 호스트가 입장 시 아이콘 생성
                // 새로운 호스트의 index 검색
                const index = findFeedsIndexDeviceid(json.host_deviceid);
                setHostIcon(index, true);
            }
        } catch (e) {
            console.error(`${e}`);
        }
    });

    // 호스트 요청 팝업 socket event
    signallingSocket.on("videoCallHostRequest", function (response) {
        // json.hostrequest_deviceid = host 요청자
        // localdeviceid = host
        try {
            const json = JSON.parse(response);
            console.log("*** socket: videoCallHostRequest response. json: " + response);
            /* 거절 조건 */
            // 현재 수락 거절 팝업창이 떠있을 경우 거절
            // 현재 pdf 파일을 업로드 중일 경우 거절 (signalling)
            // 현재 pdf 파일을 이미지로 변환 중일 경우 (web)
            // 현재 고화질 캡쳐를 요청 또는 진행 중일 경우
            // 모션 낙하 알람이 떠 있는 경우
            // 모션 졸도 알람이 떠 있는 경우
            if (
                sessionStorage.getItem("hostRequestFlag") == "true" ||
                callStore.pdfUploading ||
                drawingStore.isPdfUploading ||
                callStore.HQCaptureFlag ||
                callStore.motionFallFlag ||
                callStore.motionNoMoveFlag
            ) {
                console.log(
                    "*** mounted: videoCallHostRequest - 호스트 요청 수신 -> 거절처리",
                );
                hostChange(
                    0, // 거절
                    sessionStorage.getItem("m_roomid"),
                    loginStore.m_local_deviceid,
                    json.host_request_deviceid,
                );

                return;
            }

            if (json.status == 0) {
                // 호스트 요청 대기중 팝업 삭제
                modalStore.closeModal("host");

                // 현재 방에 호스트가 존재하지 않습니다. -> 호스트 요청자에게
                // alert("현재 방에 호스트가 존재하지 않습니다.")
                alertModal(0);
            } else if (json.status == 2) {
                // 호스트 요청 대기중 팝업 삭제
                modalStore.closeModal("host");

                // 호스트는 PC만 가능합니다. -> 호스트 요청자에게
                // alert("요청자가 PC가 아닙니다.")
                alertModal(2);
            } else {
                // 호스트의 deviceid로 nickname 조회
                const hostRequestNickname = userListGetNickname(
                    json.host_request_deviceid,
                );

                // 호스트 수락 거절 팝업-> 현재 호스트에게
                hostPermissionRequest(0, hostRequestNickname, json.host_request_deviceid);

                // 호스트 팝업 세션 등록
                sessionStorage.setItem("hostRequestFlag", true);
            }
        } catch (e) {
            console.error(`${e}`);
        }
    });

    // 호스트 요청 취소 response
    signallingSocket.on("videoCallHostCancel", function (response) {
        try {
            // const json = JSON.parse(response)
            console.log("*** socket: videoCallHostCancel response. json: " + response);

            // 현재 수락 거절 팝업창이 떠있을 경우에만 실행.
            if (sessionStorage.getItem("hostRequestFlag") == "true") {
                // 팝업 닫기
                modalStore.closeModal("host");

                // 호스트 팝업 세션 삭제
                sessionStorage.removeItem("hostRequestFlag");
            }
        } catch (e) {
            console.error(`${e}`);
        }
    });

    // 전체 음소거 관리
    signallingSocket.on("allMicOnOff", function (response) {
        try {
            const json = JSON.parse(response);
            console.log("*** socket: allMicOnOff response. json: " + response);

            // 마이크 상태 변경 호출
            micStatusChange(json.status, json.hostDeviceid);
        } catch (e) {
            console.error(`${e}`);
        }
    });

    // 현재 방이 전체 음소거 인지 아닌지 확인요청이 들어옴.
    signallingSocket.on("requestSettingInRoom", function (response) {
        try {
            const json = JSON.parse(response);
            console.log("*** socket: requestSettingInRoom reponse. json: " + response);
            console.log("feeds", feeds.value);
            let mainVideoRfid = "";
            /* main Video에 대한 rfid 값 찾기 */
            // 1) mainVideoIndex가 자신이고,
            // 2) 사용자가 혼자이며,
            // 3) createRoomFalg가 true일 경우 방에 혼자 인 것으로 간주하고,
            // 4) rfid를 "createRoom"으로 보낸다.
            if (
                callStore.videoMainIndex == 0 &&
                personnelInRoom.value == 1 &&
                sessionStorage.getItem("createRoomFlag") === "true"
            ) {
                mainVideoRfid = "createRoom"; // 상대방은 createRoom을 받으면, 1:1 이므로 자기 자신을 mainIndex로 지정한다.
            } else if (callStore.videoMainIndex == 0) {
                // 1) 사용자가 혼자가 아니며,
                // 2) mainVideo가 자신일 경우 자신의 rfid
                mainVideoRfid = myid.value;
            } else {
                // 1) 사용자가 혼자가 아니며,
                // 2) mainIndex가 나 외에 다른 사람일 경우
                mainVideoRfid = feeds.value[callStore.videoMainIndex].rfid;
            }

            /* 현재 방에 있는 사용자 중 음소거와 videoOFF가 있는지 체크 */
            const muteRfid = [];
            const videoOffRfid = [];
            const zoomLevelObj = [];

            // feeds (사용자) for문 수행 -> unpublished와 mute가 있는지 확인.
            for (let i = 0; i < feeds.value.length; i++) {
                const obj = {};
                // 자신 일 경우 : myid.value
                if (i == 0) {
                    // unpublished (videoOff) 가 있는지 확인한다. -> 있으면 videoOffRfid 에 push
                    if (commonStore.userListStatus[i].status == "unpublished") {
                        videoOffRfid.push(myid.value);
                    }

                    // mute (음소거) 가 있는지 확인한다. -> 있으면 muteRfid 에 push
                    if (commonStore.userListStatus[i].mute == true) {
                        muteRfid.push(myid.value);
                    }

                    // 나의 zoomLevel값을 셋팅한다
                    if (commonStore.userListStatus[i].zoomLevel) {
                        console.log(commonStore.userListStatus[i].zoomLevel);
                        obj.rfid = myid.value;
                        obj.zoomLevel = commonStore.userListStatus[i].zoomLevel;
                        zoomLevelObj.push(obj);
                    }
                } else {
                    checkAlreadyJoined(json.requestDeviceid);
                    console.log(feeds.value);

                    // if (checkResult != false) {
                    // 	// feeds[checkResult] = [];
                    // 	console.log(feeds)
                    // 	$(`#videoremote${checkResult}`).removeClass('no-video-container');
                    // }

                    // unpublished (videoOff) 가 있는지 확인한다. -> 있으면 videoOffRfid 에 push
                    if (commonStore.userListStatus[i].status == "unpublished") {
                        videoOffRfid.push(feeds.value[i].rfid);
                    }

                    // mute (음소거) 가 있는지 확인한다. -> 있으면 muteRfid 에 push
                    if (commonStore.userListStatus[i].mute == true) {
                        muteRfid.push(feeds.value[i].rfid);
                    }

                    if (commonStore.userListStatus[i].zoomLevel && feeds.value[i]) {
                        console.log(commonStore.userListStatus[i].zoomLevel);
                        obj.rfid = feeds.value[i].rfid;
                        obj.zoomLevel = commonStore.userListStatus[i].zoomLevel;
                        zoomLevelObj.push(obj);
                    }
                }
            }

            // 호스트(자신)이 화면 공유 중인지 확인한다.
            let useScreenShare = false;

            if (commonStore.isShare) {
                useScreenShare = true;
            }

            // 호스트(자신)이 드로잉 중인지 확인한다.
            let useDrawing = false;

            if (commonStore.isDrawing) {
                useDrawing = true;
            }

            /* 스마트글라스 -> PC 에게 전화 시 영상녹화 여부에 대해 알려주는 내용을 저장한다. */
            /* 호스트가 없는 방에 PC가 들어가서, 호스트가 된 경우 스마트 글라스에서 영상 저장 여부를 보낸다. */
            if (json.sendDurationEnable != undefined && json.sendDurationEnable != null) {
                callStore.setSendDurationEnable(json.sendDurationEnable);

                sendDurationEnableFlag.value = json.sendDurationEnable;
            }

            // 현재 방이 전체 음소거 인지 아닌지 체크하여 요청자에게 보내주기
            // 현재 호스트가 바라보는 메인 화면은 어떤 것인지 rfid 체크하여 보내주기
            if (json.status == 1) {
                resultSettingInRoom(
                    json.requestDeviceid,
                    loginStore.m_local_deviceid,
                    mainVideoRfid,
                    muteRfid,
                    videoOffRfid,
                    useScreenShare,
                    useDrawing,
                    zoomLevelObj,
                );
            }
        } catch (e) {
            console.error(`${e}`);
        }
    });

    // 호스트가 바라보는 화면으로 전환한다.
    signallingSocket.on("hostSelectedMainVideo", function (response) {
        // try {
        const json = JSON.parse(response);
        console.log("*** socket: hostSelectedMainVideo response. json: " + response);

        // rfid로 index를 조회한다.
        let feedsIndex = findFeedsIndexRfid(json.rfid);

        // 아래 코드로 인해 메인영상 선택 테두리 동작이 오류가 생김 (kyj 주석 처리)
        // if (!feedsIndex) {
        //  console.log("feedsIndex 없음")
        //  return;
        // }

        // 호스트가 바라보는 메인 비디오로 변경
        console.log("hostSelectedMainVideo socket on feedsIndex", feedsIndex);
        commonStore.setMainVideoIndex(feedsIndex);
        if (feedsIndex !== "") {
            commonStore.userListStatus[feedsIndex].zoomLevel = json.level;

            // 호스트가 바라보는 메인 비디오 화면으로 변경
            hostViewMainVideo(feedsIndex);
        }

        // 자신일 경우에는 자신의 비트레이트를 올린다.
        if (feedsIndex == 0) {
            if (!commonStore.isShare && !commonStore.isDrawing) {
                changeBitrate(mainVideoBitrate.value);
            }
        } else {
            // 자신이 메인이 아닐 경우에는 비트레이트를 낮춘다.
            // eslint-disable-next-line no-lonely-if
            if (!commonStore.isShare && !commonStore.isDrawing) {
                changeBitrate(subVideoBitrate.value);
            }
        }
        // } catch (e) {
        //  console.error(`${e}`)
        // }
    });

    // 메인영상 카메라 줌 적용 (ksy)
    signallingSocket.on("setZoomLevel", function (response) {
        try {
            let fid = "";
            const json = JSON.parse(response);
            console.log("***** setZoomlLevel", json);
            // const deviceId = json.deviceid
            // const level = json.level

            // feedsIndex - 줌레벨을 변경한 글라스
            const feedsIndex = findFeedsIndexDeviceid(json.deviceid);
            console.log("setzoomLevel deviceid, level", json.deviceid, json.level);
            console.log("feedsIndex:", feedsIndex);

            // showHostMainIndex - 호스트
            const showHostMainIndex = callStore.videoMainIndex;
            console.log("showHostMainIndex:", showHostMainIndex);

            console.log("rfid", feeds.value, "myid.value", myid.value);
            if (feedsIndex && feedsIndex !== 0) {
                commonStore.userListStatus[feedsIndex].zoomLevel = json.level;
                feeds.value[feedsIndex].zoomLevel = json.level;
            } else {
                commonStore.userListStatus[0].zoomLevel = json.level;
                // feeds.value[0].zoomLevel = json.level
            }

            if (videoCallHost.value && feedsIndex == showHostMainIndex) {
                console.log("나는 호스트이고 메인인 사용자가 줌레벨을 변경했다");
                hostSelectedMainVideo(feeds.value[showHostMainIndex].rfid);
            }
            console.log(commonStore.userListStatus, feeds.value);
        } catch (err) {
            console.log(err);
        }
    });

    // 최초 방 입장 시 호스트가 설정한 방에 대한 정보 받아오기
    signallingSocket.on("resultSettingInRoom", function (response) {
        // try {
        const json = JSON.parse(response);
        console.log("*** socket: resultSettingInRoom response. json: " + response);

        /* 방에 대한 설정 : 전체 음소거 인지 음소거가 아닌지 */
        // 마이크 상태 변경 호출
        micStatusChange(json.micStatus, json.hostDeviceid);

        /* 호스트가 바라보는 mainVideo로 변경 */
        let mainFeedsIndex = 0; // json.mainRfid == createRoom 일 경우 자신과 1:1 통화 중이므로, mainIndex가 자신으로 변경되어야 함.

        // 1:1 일 경우 createRoom이 mainRfid가 돌아온다.

        // 1:1이 아닐 경우
        if (json.mainRfid !== "createRoom") {
            // rfid로 index를 조회한다.
            mainFeedsIndex = findFeedsIndexRfid(json.mainRfid);

            // 호스트가 바라보는 메인 비디오 안테나 상태 등록
            antennaCheck(json.mainRfid);
        } else if (
            (json.mainRfid == "createRoom" && json.useScreenShare) ||
            (json.mainRfid == "createRoom" && json.useDrawing)
        ) {
            // 1:1 통화이면서, 호스트가 화면 공유 중 일 때, 또는 1:1 통화중이면서, 호스트가 드로잉일 때
            // 호스트의 아이디로 feeds를 찾아서 메인 화면으로 전환한다.
            mainFeedsIndex = findFeedsIndexDeviceid(json.hostDeviceid);

            // 호스트가 바라보는 메인 비디오 안테나 상태 등록
            if (feeds.value[mainFeedsIndex] != null) {
                antennaCheck(feeds.value[mainFeedsIndex].rfid);
            }
        }

        console.log("layout test resultSettingInRoom", mainFeedsIndex);

        /* 위에서 분기처리할 때 처리하도록 수정 */
        // 호스트가 바라보는 메인 비디오 안테나 상태 등록
        // antennaCheck(json.mainRfid)
        // antennaCheck(feeds.value[mainFeedsIndex].rfid)

        /* 현재 방에 videoOFF 되어 있는 사람을 설정 한다. */
        if (json.videoOffRfid.length != 0) {
            for (let i = 0; i < json.videoOffRfid.length; i++) {
                const videoOffIndex = findFeedsIndexRfid(json.videoOffRfid[i]);
                // const videoOffNickname = feeds.value[videoOffIndex].rfdisplay

                // 사용자가 선택한 언어에 따라서 닉네임을 설정한다.
                const customNickname = customUserNickname(
                    feeds.value[videoOffIndex].rfdeviceid,
                );
                console.log(
                    "*** mounted > resultSettingInRoom > customNickname : ",
                    customNickname,
                );
                callingLayoutChange("unpublished", customNickname, videoOffIndex);

                // Video Hide
                $("#panel-inner" + videoOffIndex).hide();

                // 호스트가 바라보는 mainVideo의 feedsIndex와 mainVideo가 같을 경우 Main 이미지 변경
                if (callStore.videoMainIndex == mainFeedsIndex) {
                    mainVideoChangeFunc(0, customNickname);
                }
            }
        }

        /* 현재 방에있는 사용자들의 줌레벨을 설정한다. */
        if (json.zoomLevelObj.length != 0) {
            console.log(json.zoomLevelObj);
            setTimeout(() => {
                for (let i = 0; i < json.zoomLevelObj.length; i++) {
                    const index = findFeedsIndexRfid(json.zoomLevelObj[i].rfid);
                    setUserListZoomLevel(index, json.zoomLevelObj[i].zoomLevel);
                    let curMainVideoZoomLevel = commonStore.userListStatus[i].zoomLevel;
                    let targetToChange = "";
                    if (
                        callStore.videoMainIndex == i &&
                        commonStore.callingLayoutType !== 1
                    ) {
                        console.log(i);
                        let curMainVideoZoomLevel =
                            commonStore.userListStatus[i].zoomLevel;
                        targetToChange = document.getElementById("videoMain");
                    } else if (
                        callStore.videoMainIndex == i &&
                        commonStore.callingLayoutType == 1
                    ) {
                        if (i == 0) {
                            console.log(document.getElementById("myvideo"));
                            targetToChange = document.getElementById("myvideo");
                        } else {
                            console.log(document.getElementById("remotevideo" + i));
                            targetToChange = document.getElementById("remotevideo" + i);
                        }
                    }
                    if (targetToChange) {
                        targetToChange.style.scale = `${100 * curMainVideoZoomLevel}%`;
                    }
                }
                // 호스트가 바라보는 메인 비디오로 변경
                console.log(
                    "hostSelectedMainVideo zoomLevelObj.length!=0 feedsIndex",
                    mainFeedsIndex,
                );
                hostViewMainVideo(mainFeedsIndex);
            }, 10);
        } else {
            // 호스트가 바라보는 메인 비디오로 변경
            console.log(
                "hostSelectedMainVideo zoomLevelObj.length==0 feedsIndex",
                mainFeedsIndex,
            );
            hostViewMainVideo(mainFeedsIndex);
        }

        if (json.useDrawing) {
            drawingStore.setDrawingVideo(false);
        }
        // 호스트가 화면 공유 상태라면, 메인 화면으로 바꿀 수 있도록 유도한다.
        console.log("json.useScreenShare: " + json.useScreenShare);
        if (json.useScreenShare) {
            // 메인 비디오 풀 스크린 버튼 생성
            // callStore.setMainVideoFullScreen", true)

            // 메인 비디오 풀 스크린 텍스트 박스 생성
            callStore.setMainVideoFullScreenText(true);

            // 사용자에게 보여줄 토스트 메시지
            commonToastMessage(t("mainVideo FullScreen"));
        }

        // 자신이 메인이 아닐 경우에만 실행한다.
        //
        if (json.mainRfid != myid.value && json.mainRfid !== "createRoom") {
            /* 신규 사용자 Audio Duration 생성 */
            insertNewAudioDuration(
                json.mainRfid, // main_uid
                myid.value, // my_uid
                loginStore.m_local_deviceid,
                uniqueRoomid.value, // uniqueRoomid.value
            );
        } else if (
            (json.mainRfid != myid.value &&
                json.mainRfid == "createRoom" &&
                json.useScreenShare) ||
            (json.mainRfid != myid.value &&
                json.mainRfid == "createRoom" &&
                json.useDrawing)
        ) {
            // 1:1 통화이지만, 호스트가 화면 공유 또는 드로잉일 경우 자신을 신규 사용자 AudioDuration을 등록한다.
            /* 신규 사용자 Audio Duration 생성 */
            insertNewAudioDuration(
                feeds.value[mainFeedsIndex].rfid, // main_uid
                myid.value, // my_uid
                loginStore.m_local_deviceid,
                uniqueRoomid.value, // uniqueRoomid.value
            );
        }

        /* 영상 녹화 저장 여부 저장 */
        callStore.setSendDurationEnable(json.sendDurationEnable);

        // 메인 비디오 스크린 크기 조정
        // videoResize()
        // } catch (e) {
        //  console.error(`${e}`)
        // }
    });

    // 마이크 상태 update // 0 : micOFF, 1: micON
    signallingSocket.on("micOnOff", function (response) {
        try {
            const json = JSON.parse(response);
            console.log("*** socket: micOnOff response. json: " + response);

            // 받아온 rfid가 자신일 경우
            // status에 따라 음소거 및 음소거 해제를 한다.
            if (json.rfid == myid.value) {
                if (json.status !== null || json.status !== undefined) {
                    // leftBar 음소거 버튼 변경
                    commonStore.setIsSounded();
                    // 마이크 음소거
                    toggleMute();

                    if (json.status == 0) {
                        setUserListMicMute(0, true);
                    } else {
                        setUserListMicMute(0, false);
                    }
                }
            } else {
                // 받아온 rfid가 다른 사용자일 경우
                // 받아온 rfid로 index를 검색한다.
                const feedsIndex = findFeedsIndexRfid(json.rfid);

                if (feedsIndex != "") {
                    // index의 mute를 변경한다.
                    if (json.status == 0) {
                        // 음소거
                        setUserListMicMute(feedsIndex, true);
                    } else {
                        // 음소거 해제
                        setUserListMicMute(feedsIndex, false);
                    }
                }
            }
        } catch (e) {
            console.error(`${e}`);
        }
    });

    // 강제 마이크 on off
    signallingSocket.on("forceMicOnOff", function (response) {
        try {
            const json = JSON.parse(response);
            console.log("*** socket: forceMicOnOff reponse. json: " + response);

            // 받아온 rfid가 자신일 경우
            // status에 따라 음소거 및 음소거 헤제 및 설정한다.
            if (json.rfid == myid.value) {
                if (json.status !== null || json.status !== undefined) {
                    // leftBar 음소거 버튼 변경
                    commonStore.setIsSounded();
                    // 마이크 음소거
                    toggleMute();

                    if (json.status == 0) {
                        setUserListMicMute(0, true);

                        // 호스트가 강제로 음소거 했다는 것을 저장한다.
                        callStore.setForceMicOnOffFlag(true);
                        // callStore.setForceMicOnOffFlag", true)

                        // 개인 마이크 상태 변경
                        callStore.setMicOnOffClick(true);

                        // 토스트 메세지 출력 : 음소거
                        if (preferenceStore.lang == "ko") {
                            commonToastMessage(
                                t("toastMessage host") +
                                    sessionStorage.getItem("m_nickname") +
                                    t("toastMessage MicOff"),
                            );
                        } else {
                            commonToastMessage(
                                t("toastMessage MicOff") +
                                    sessionStorage.getItem("m_nickname"),
                            );
                        }
                    } else {
                        setUserListMicMute(0, false);

                        // 호스트가 강제로 음소거 했었다는 것을 초기화 한다.
                        callStore.setForceMicOnOffFlag(false);

                        // 개인 마이크 상태 변경: 음소거 해제
                        callStore.setMicOnOffClick(false);

                        // 토스트 메세지 출력 : 음소거 해제
                        if (preferenceStore.lang == "ko") {
                            commonToastMessage(
                                t("toastMessage host") +
                                    sessionStorage.getItem("m_nickname") +
                                    t("toastMessage MicOn"),
                            );
                        } else {
                            commonToastMessage(
                                t("toastMessage MicOn") +
                                    sessionStorage.getItem("m_nickname"),
                            );
                        }
                    }
                }
            } else {
                // 받아온 rfid가 다른 사용자일 경우
                // 받아온 rfid로 index를 검색한다.
                const feedsIndex = findFeedsIndexRfid(json.rfid);

                // index의 mute를 변경한다.
                if (json.status == 0) {
                    // 음소거
                    setUserListMicMute(feedsIndex, true);
                } else {
                    // 음소거 해제
                    setUserListMicMute(feedsIndex, false);
                }
            }
        } catch (e) {
            console.error(`${e}`);
        }
    });

    // changeDuration
    signallingSocket.on("changeDuration", function (response) {
        try {
            // const json = JSON.parse(response)
            console.log("*** socket: on changeDuration. json: " + response);
        } catch (e) {
            console.error(`${e}`);
        }
    });

    // 강제퇴장 socket on event
    signallingSocket.on("forceLeave", function (response) {
        try {
            console.log("*** socket: forceLeave. json: " + response);

            // eslint-disable-next-line no-unused-vars
            const json = JSON.parse(response);

            // 강제퇴장 팝업창 표시
            noneOverlayModal(3);

            // janus destroy
            commonStore.janus.destroy();
        } catch (e) {
            console.error(`${e}`);
        }
    });

    // 소켓 leaveMeeting 받기
    signallingSocket.on("leaveMeeting", (response) => {
        console.log("*** socket: leaveMeeting response. json: ", response);
        const json = JSON.parse(response);

        if (json.roomid) {
            console.log("*** socket: leaveMeeting - 회의실 퇴장 성공");
        } else {
            console.log("*** socket: leaveMeeting - 회의실 퇴장 실패");
        }
    });

    // 파일 수신자가 송신자에게 파일수신 수락/거절 질문을 받았을 때 (kyj)
    signallingSocket.on("fileTransfer", (response) => {
        try {
            escapeFullScreen();
            console.log("*** socket: on fileTransfer. json: ", response);

            const json = JSON.parse(response);

            const rfidIndex = findFeedsIndexDeviceid(json.deviceid);
            // console.log("*** socket: fileTransfer response - fileReceiver handleId: " + feeds.value[rfidIndex].rfid)
            // console.log("*** socket: fileTransfer response - fileReceiver handleId: " + myid.value)

            // 누군가 나에게 파일 전송을 요청했을 때 callingWindow 수락 거절 창으로 변경되어야
            // 이미 내가 파일 송수신을 하고 있을 경우 보낸 사람에게 거절로 보낸다.
            // 파일 중복 수신으로 인하여 주석 ksy
            // if (sessionStorage.getItem("fileSendingFlag") == "true") {
            //  // status : 0 Decline, 1 Access
            //  const obj = {
            //      localdeviceid: loginStore.m_local_deviceid,
            //      remotedeviceid: json.deviceid,
            //      status: 0,
            //      // handleId: myid.value
            //      handleId: feeds.value[rfidIndex].rfid
            //  }
            //  const sendJson = JSON.stringify(obj)
            //  signallingSocket.emit("fileReceiver", sendJson)
            //  console.log(
            //      "*** socket: emit fileReceiver - 다른 사용자와 파일 송신 중 -> 거절 처리. json: " +
            //          sendJson
            //  )
            //  return
            // }

            // // 고화질 캡쳐 요청 중에도 파일 송수신을 거절처리 해야한다.
            // // 파일 송수신 상태가 아니며, HQCaptrue 요청했을 경우
            // // HQcapture 요청 후 답변이 돌아오면 FileSendingFlag는 true가 된다.
            // if (
            //  sessionStorage.getItem("fileSendingFlag") == "false" &&
            //  callStore.HQCaptureFlag
            // ) {
            //  // status : 0 Decline, 1 Access
            //  const obj = {
            //      localdeviceid: loginStore.m_local_deviceid,
            //      remotedeviceid: json.deviceid,
            //      status: 0,
            //      // handleId: myid.value
            //      handleId: feeds.value[rfidIndex].rfid
            //  }
            //  const sendJson = JSON.stringify(obj)
            //  signallingSocket.emit("fileReceiver", sendJson)
            //  console.log(
            //      "*** socket: emit fileReceiver - 고화질 캡쳐 중 -> 거절 처리. json: " +
            //          sendJson
            //  )
            //  return
            // }

            // fileReceiver 저장
            commonStore.setFileReceiver(json.deviceid);

            /* 파일 송수신과 고화질 캡쳐 구분 */
            // 고화질 캡쳐일 경우는 바로 수락 처리 한다.
            if (json.HQCapture == 1) {
                console.log("*** socket: filetransfer > HQCaptrue Start");
                const nickname = findFeedsNicknameByDeviceid(json.deviceid);

                // 수락 처리
                commonStore.setReceiveFileResFlag({
                    flag: true,
                    selectedUserName: nickname,
                });
                commonStore.setFileSendStatus(3);
                commonStore.setFileSendFlag(true);

                $("#remotevideo" + rfidIndex).hide();
                $("#panel-inner" + rfidIndex).hide();

                // $("#myvideo").hide()

                // 수신 파일 정보를 저장
                fileReceiveTotalSize.value = json.filelength;
                receiveFileType.value = getFileExtension(json.filetype);
            } else {
                // 내 화면을 파일 수락/거절 질의로 callingWindow 변경
                // callingLayoutChange(2, sessionStorage.getItem("m_nickname"), 0)
                // $("#myvideo").hide()

                // 파일 수신측 파일 수신 수락/거절 팝업 처리
                // 상대방 id : json.local_deviceid
                const fileSendNickname = userListGetNickname(json.deviceid);
                const status = commonStore.userListStatus[rfidIndex].status;

                // callingWindow에 파일 보내는 사람 이름 저장
                commonStore.setFileSendNickname(fileSendNickname);

                // 하단 정렬일 경우에만
                // callingLayout 4 하단 레이아웃 파일 송수신으로 버튼 변경
                callStore.setUnderStatus(2);

                // 현재시간 UTC 가져오기
                const nowDate = getWorldTime();

                // 수락 거절 메세지 보내기
                addReceiveMessageList(
                    fileSendNickname,
                    nowDate,
                    getChattingTimeZone(nowDate),
                    fileSendNickname,
                    1,
                    5,
                );

                // 파일 수신 수락/거절메시지  채팅 index 저장
                chattingFileSendIndex.value =
                    chattingStore.chattingMessageList.length - 1;

                // 수신자측 PC에서 송신자 화면을 파일 수락/거절 질의로 callingWindow 변경
                callingLayoutChange(2, fileSendNickname, rfidIndex);

                /* ksy
						index: 송신자 callingWindow index 저장,
						fileReceiveInfo: {
								fileChatIndex: 파일 수락/거절 메시지 채팅인덱스 저장,
								fileSendNickname: 송신자 이름 저장,
								beforeStatus: 수신완료 or 거절 할 경우 송신자측 이전 화면 상태값 저장
							}
					*/
                commonStore.setFileReceiveInfo({
                    index: rfidIndex,
                    fileReceiveInfo: {
                        fileChatIndex: chattingFileSendIndex.value,
                        fileSendNickname: fileSendNickname,
                        beforeStatus: status,
                    },
                });

                $("#remotevideo" + rfidIndex).hide();
                $("#panel-inner" + rfidIndex).hide();

                // 수신 파일 정보를 저장
                fileReceiveTotalSize.value = json.filelength;
                receiveFileType.value = getFileExtension(json.filetype);

                // 파일 송수신 효과음 호출
                fileReceiveMessageBell("play");

                console.log(
                    "*** socket: filetransfer > AutoPictureAccept Check = " +
                        autoPictureAccept.value,
                );

                /* 파일 송수신 자동 수락 체크 */
                if (autoPictureAccept.value) {
                    // console.log("*** socket: filetransfer > start AutoPictureAccept")

                    // 파일 수신 자동 수락 처리
                    setTimeout(() => {
                        const nickname = findFeedsNicknameByDeviceid(json.deviceid);
                        // console.log("nickname:", nickname)
                        commonStore.setReceiveFileResFlag({
                            flag: true,
                            selectedUserName: nickname,
                        });
                        commonStore.setFileSendStatus(3);
                        commonStore.setFileSendFlag(true);
                    }, 700);
                }
                callStore.setUnderStatus(2);
            }
        } catch (e) {
            console.error(`${e}`);
        }
    });

    // 파일 송신자가 수신자로부터 파일수신 수락/거절을 받았을 때 (kyj)
    signallingSocket.on("fileReceiver", (response) => {
        try {
            console.log("*** socket: fileReceiver response. json: ", response);

            const json = JSON.parse(response);

            // 보낸 사람의 닉네임 가져오기
            const nickname = userListGetNickname(json.deviceid);
            const rfIndex = findFeedsIndexDeviceid(json.deviceid);
            // 현재시간 UTC 가져오기
            const nowDate = getWorldTime();

            // 파일 송신측이 수신측으로부터 파일 수신 거절을 받았을 때
            if (json.status === 0) {
                // 거절 팝업창으로 변경
                commonStore.setFileSendStatus(4);

                // 사진 전송 중 메세지 -> 사진 수신 거절 메세지로 변경 ksy
                const fileChatIndex =
                    commonStore.userListStatus[rfIndex].fileSendInfo.fileChatIndex;
                addChatFileSendMessage(nickname, 6, rfIndex, fileChatIndex);
            }
            // 수락을 받았을 때
            else {
                const file = commonStore.sendFileData[0];

                // 파일 송신중 모달창으로 변경
                commonStore.setFileSendStatus(3);

                console.log(
                    `*** socket: fileReceiver - file is ${[
                        file.name,
                        file.size,
                        file.type,
                        file.lastModified,
                    ].join(" ")}`,
                );
                // handle 0 size file
                if (file.size == 0) {
                    console.log(
                        "*** socket: fileReceiver - file is empty, please select a non-empty file",
                    );
                    return;
                }
                const chunkSize = 16384;

                let offset = 0;
                sendFileReader.value = new FileReader();

                sendFileReader.value.addEventListener("error", (error) =>
                    console.error(
                        "*** socket: fileReceiver - Error reading file:",
                        error,
                    ),
                );
                sendFileReader.value.addEventListener("abort", (event) => {
                    console.error(
                        "*** socket: fileReceiver - 송신할 파일 Reader를 중단하였습니다!",
                    );
                });
                sendFileReader.value.addEventListener("load", (e) => {
                    // joinMember 계산 : 보내는 사람(자신) + ", " + 받는사람
                    const fileJoinMembers =
                        sessionStorage.getItem("m_nickname") + ", " + nickname;

                    // streamTransfer 로 업로드
                    sendFileServerUpload(
                        "picture",
                        file,
                        file.name,
                        file.size,
                        fileJoinMembers,
                    );
                });

                const readSlice = (o) => {
                    const slice = file.slice(offset, o + chunkSize);
                    sendFileReader.value.readAsArrayBuffer(slice);
                };
                readSlice(0);
                // 사진 전송 중 메시지 -> 사진 수신 완료 메세지로 변경 ksy
                const fileChatIndex =
                    commonStore.userListStatus[rfIndex].fileSendInfo.fileChatIndex;
                addChatFileSendMessage(nickname, 1, rfIndex, fileChatIndex);
            }
        } catch (e) {
            console.error(`${e}`);
        }
    });

    // 파일 수신측에서 파일 송신 취소 socket event
    signallingSocket.on("cancelFileTransfer", function (response) {
        console.log("*** socket: cancelFileTransfer response");
        console.log(response);
        const json = JSON.parse(response);

        if (json.localdeviceid != null && json.remotedeviceid != null) {
            // 송신자의 작은 영상에 파일 송신 취소 표시
            const rfidIndex = findFeedsIndexDeviceid(json.localdeviceid);
            const nickname = userListGetNickname(json.localdeviceid);

            // 파일 수락/거절 채팅 인덱스를 가져온다
            const fileChatIndex =
                commonStore.userListStatus[rfidIndex].fileReceiveInfo.fileChatIndex;
            callingLayoutChange(6, nickname, rfidIndex);

            // 송신자가 파일 송신 취소를 메세지에 추가
            addChatFileSendMessage(nickname, 10, rfidIndex, fileChatIndex);

            // 수신측 파일 송수신 초기화
            fileReceiveReset(json.localdeviceid, rfidIndex);

            // 하단 정렬일 경우에만
            // callingLayout 4 하단 레이아웃 default 버튼 변경
            // callStore.setUnderStatus", 0)
            setInitUnderStatus(0);
        }
    });

    // disconnect 시
    signallingSocket.on("disconnect", function (response) {
        console.log("socket disconnect !!! ");
        // signallingToastMessage(t("signallingSocket Disconnect"));
    });

    // callingTimer 초기화
    setCallingTimer("init");

    // changeAntenna
    signallingSocket.on("changeAntenna", function (response) {
        // console.log("*** socket: changeAntenna response")
        // console.log(response)

        const json = JSON.parse(response);

        antennaCheck(json.rfid);
    });

    // 썸네일 이관
    signallingSocket.on("moveThumbnail", function (response) {
        drawingStore.setChangedHost(true);
        console.log("*** socket: moveThumbnail response");
        // console.log(response)
        drawingStore.initDrawing();
        drawingStore.setChangedHost(true);
        const json = JSON.parse(response);
        drawingStore.setBeforeHostIndex(json.selectedFileIndex);
        drawingStore.setIsGivenThumbnailTransfer(true);
        drawingStore.setIndexes({
            group: json.lastGroup,
            index: json.lastIndex,
        });
        drawingStore.setFirstHistory(json.firstHistory);
        drawingStore.setNewFirstFiles(json.firstFiles);
        // drawingStore.setCanvasJson", json.lastCanvasJson)
        // console.log("*******##** Changed lastCanvasJson  #1")
        // drawingStore.setCanvasHistory", json.canvasHistory)
        // console.log("drawing/setCanvasHistory: ", json.canvasHistory)

        // ksy:: 기존 호스트가 선택한 썸네일로 설정해준다.  ▽(img, canvas) 관련 index
        drawingStore.setSelectedFileIndex(0);
        // 썸네일에 추가한다.
        if (json.thumbnailList != null) {
            drawingStore.setAllFiles(json.thumbnailList);
            // console.log("******##** received files", drawingStore.files)
        }
        if (json.pdfUrlSaveArrays.length > 0) {
            drawingStore.setThumbnailPdfUrlSaveArrays(json.pdfUrlSaveArrays);
        }
        // ksy:: 기존 호스트가 드로잉 사용 중이였는지 체크
        let drawingState = json.isDrawingEnable;
        // 호스트 이관 후 드로잉 활성화 상태라면 드로잉 화면으로 변경한다
        setTimeout(() => {
            // ksy:: 렌더링 해줄 canvas 정보를 셋팅한다(type == img, canvas)
            if (drawingStore.files[json.selectedFileIndex].type !== "pdf") {
                console.log("여기7");
                drawingStore.setCanvasHistory(
                    drawingStore.files[json.selectedFileIndex].history,
                );
            } else {
                // ksy:: 렌더링 해줄 canvas 정보를 셋팅한다(type == pdf)
                console.log(
                    "moveThumbnail",
                    drawingStore.files[json.selectedFileIndex].pdf[json.selectedPdfIndex]
                        .history,
                );
                console.log("여기8");
                drawingStore.setCanvasHistory(
                    drawingStore.files[json.selectedFileIndex].pdf[json.selectedPdfIndex]
                        .history,
                );
            }

            // ksy:: 기존 호스트가 선택한 썸네일로 설정해준다. ▽(pdf) 관련 index
            drawingStore.setPdfIndex(json.selectedPdfIndex);
            // thumbnail.vue fileClick() 안에 설명
            drawingStore.setBeforeIndexInitialized(true);
            if (drawingState) {
                // 썸네일 이관하는 시간이 소요되기 때문에 로딩바를 생성한다
                // createLoadingMask("ThumnailTransfer")

                // 드로잉을 활성화 시켜준다.
                commonStore.setIsDrawing(true);

                // 비디오는 비활성화 시킨다.
                drawingStore.setDrawingVideo(false);
            }
            // ksy:: 썸네일 이관이 끝나면 로딩바 제거
            loadingMaskDelete();
            nextTick(() => {
                drawingStore.setCanvasHistoryFin(true);
            });
        }, 500);
    });

    // 파일 업로드된 이미지 url 수신
    signallingSocket.on("sendFileImageUrl", async function (response) {
        console.log("*** socket: on sendFileImageUrl");
        console.log(response);

        const json = JSON.parse(response);

        let url = "";
        if (json.url != null && json.name != null) {
            url = `${json.url}/${json.name}`;
            url = await convertImageToBlob(url);
            // 캡쳐 일 경우
            if (callStore.isCapture) {
                drawingStore.setIsOpenSaveThumbnail(false);

                // 호스트가 아니라면 팝업 닫기
                modalStore.closeModal("noneOverlayModal");

                if (videoCallHost.value && accessDeviceCheck.value == "PC") {
                    // 드로잉으로 이동하시겠습니까 ? 모달
                    noneOverlayModal(16);
                }

                // 드로잉 썸네일 등록
                drawingStore.setSaveThumbnailImg({
                    type: "img",
                    src: url,
                    status: "off",
                });

                /* 캡쳐 저장 완료 - 초기화 시작 */
                // captureSaveFlag false 변경 = 초기화
                callStore.setCaptureSaveFlag(false);
                callStore.setIsCapture(false);
            } else {
                drawingStore.setIsOpenSaveThumbnail(false);

                // 호스트인 경우 썸네일 등록 및 수신 사진 미리보기 표시
                if (videoCallHost.value) {
                    // 드로잉이 켜져있을 경우 썸네일만 등록하기
                    if (commonStore.isDrawing) {
                        // 드로잉 썸네일 등록하기
                        drawingStore.setSaveThumbnailImg({
                            type: "img",
                            src: url,
                            status: "on",
                        });
                        drawingStore.setSaveThumbnailImgInCanvas("on");
                        drawingStore.setSrc(saveThumbnailImg.value);
                        drawingStore.setIsOpenSaveThumbnail(true);
                        drawingStore.setThumbnailFileReceive(true);
                    } else {
                        // const previewManageIndex = commonStore.previewModalInfo.previewModalcnt
                        // 미리보기
                        // autoPictureModal = true 일 경우 Modal을 지우고 Show -> 맨 마지막으로 받은 사진을 보여주기 위함
                        if (autoPictureModal) {
                            // modal.hide("previewModal")
                            // previewModal(url, "show")
                            // modal.show("previewModal" + previewManageIndex)

                            // 바로 보일 경우 간혈적으로 미리보기가 안뜨는 현상이 있어서 예외처리
                            setTimeout(() => {
                                // 수신파일 이미지 미리보기
                                previewModal(url);
                            }, 500);
                        } else {
                            // 수신파일 이미지 미리보기
                            // previewModal(url)
                            previewModal(url);
                        }

                        // 드로잉 썸네일 추가
                        drawingStore.setSaveThumbnailImg({
                            type: "img",
                            src: url,
                            status: "off",
                        });

                        // setSrc
                        // drawingStore.setSrc", {
                        //  type: "img",
                        //  src: url,
                        //  status: "off"
                        // })
                    }
                }
                // 호스트가 아닌 경우 수신 사진 미리보기 표시
                else {
                    if (autoPictureModal.value) {
                        // 바로 보일 경우 간혈적으로 미리보기가 안뜨는 현상이 있어서 예외처리
                        setTimeout(() => {
                            // 수신파일 이미지 미리보기
                            previewModal(url);
                        }, 500);
                    } else {
                        // 수신파일 이미지 미리보기
                        previewModal(url);
                    }
                }

                // 로컬 개발이 아닌 경우에만 PC 에 저장
                // if (window.location.hostname != "localhost") {
                handleFileDownload(url, json.name);
                // const a = document.createElement("a")
                // a.style.display = "none"
                // a.href = url
                // a.download = json.name
                // document.body.appendChild(a)
                // a.click()
                // setTimeout(() => {
                // document.body.removeChild(a)
                // window.URL.revokeObjectURL(url)
                // }, 100)
                // }
                const rfIndex = findFeedsIndexDeviceid(json.deviceid);

                /***** 파일 수신 완료 처리 *****/

                // 고화질 캡쳐인 경우
                if (callStore.HQCaptureFlag) {
                    // 고화질 캡쳐 버튼 초기화
                    // callStore.setHQCaptrueFlag", false)

                    // 내 화면을 비디오로 변환
                    const rfIndex = findFeedsIndexDeviceid(json.deviceid);
                    callingLayoutChange(
                        "attach",
                        commonStore.userListStatus[rfIndex].text,
                        rfIndex,
                    );

                    /***** 파일 수신 초기화 *****/
                    fileReceiveReset(json.deviceid, rfIndex);
                }
                // 파일 수신인 경우
                else {
                    // 내 화면을 파일 수신 완료로 변경
                    // callingLayoutChange(5, sessionStorage.getItem("m_nickname"), 0)
                    const rfIndex = findFeedsIndexDeviceid(json.deviceid);
                    const fileChatIndex =
                        commonStore.userListStatus[rfIndex].fileReceiveInfo.fileChatIndex;

                    // 수신자측 PC , 송신자 화면을 파일 수신 완료로 변경 ksy
                    callingLayoutChange(
                        5,
                        commonStore.userListStatus[rfIndex].text,
                        rfIndex,
                    );

                    // 채팅창에 파일 수신 완료 메세지 추가 (3)
                    addChatFileSendMessage(
                        commonStore.userListStatus[rfIndex].text,
                        3,
                        rfIndex,
                        fileChatIndex,
                    );

                    /***** 파일 수신 초기화 *****/
                    fileReceiveReset(json.deviceid, rfIndex);
                }
            }
        }
    });

    // 현재 사용중인 회의 정보 가져오기
    if (meetingStore.meetingSeq != null) {
        getMeetingInfo(meetingStore.meetingSeq);
    }

    // 현재 사용중인 회의 socket 받고 vuex 저장
    signallingSocket.on("getMeetingInfo", (response) => {
        const json = JSON.parse(response);
        console.log("*** socket.on: getMeetingInfo json = ", json);

        meetingStore.setCurrentMeetingInfo({
            meetingSeq: json.meeting_seq,
            subject: json.subject,
            startTime: json.start_time,
            endTime: json.end_time,
            maker: json.maker,
            roomid: json.roomid,
            cctvList: json.cctv_list,
        });
    });

    // pdf To Image 진행률 받기
    transferSocket.on("pdfToImageRate", (response) => {
        const json = JSON.parse(response);
        // console.log("*** transfer socket.on: pdfToImageRate json = ", json)

        // 현재 PDF Upload cancel Flag가 true인지 확인한다.
        if (callStore.PDFcancelUploadFlag == true) {
            // true 라면 cancel 이벤트를 보낸다.
            const pdfToImageCancelInfo = {
                file_name: PDFsendFileName.value,
            };
            const pdfToImageCancelJson = JSON.stringify(pdfToImageCancelInfo);
            transferSocket.emit("pdfToImageCancel", pdfToImageCancelJson);
            console.log(
                "*** transfer socket: pdfToImageCancel request:",
                pdfToImageCancelInfo,
            );

            // 진행률 관련해서 초기화를 시킨다.
            /* 업로드 취소 FLOW start */
            // 드로잉 pdf 업로드 flag로 변경
            callStore.setDrawingGetPDFUploadFlag(false);

            // 드로잉 pdf 업로드 중임을 저장 Flag 초기화
            // -> 이것이 true일 경우 호스트 변경 요청을 막기 때문에 false로 변경
            callStore.setPDFUploading(false);

            // 진행률 0 만들기
            callStore.setPDFUploadProgrss(0);
        } else {
            // 소수점으로 돌아온 값을 버림으로 한다.
            // 버림으로 하게 되면 100%가 안될 수도 있다. -> pdfToImg event가 수신되면 100%로 변경한다.
            let transferRate = callStore.pdfUploadProgrss;
            transferRate += Math.floor(json.rate);

            // 진행률이 100보다 클 경우 100으로 설정
            if (transferRate > 100) {
                transferRate = 100;
            }

            // pdf 서버 업로드 진행률 증가
            callStore.setPDFUploadProgrss(transferRate);
        }
    });

    // pdf To Image 받기 -- 문제 발생 예상 부분
    transferSocket.on("pdfToImage", (response) => {
        const json = JSON.parse(response);
        // console.log("*** transfer socket.on: pdfToImage json = ", json)

        // null 일 경우 -> 취소 완료
        if (json.pages == null) {
            // 쌓인 Que 중 가장 앞쪽에 있는 Que 제거
            callStore.removePdfUploadQueArray();

            // PDF CancelUpload Flag 초기화를 interval 에서 초기화하면 pdfToImage를 무조건 false로 타기 때문에
            // 여기서 초기화를 진행한다.
            callStore.setPDFcancelUploadFlag(false);
            console.log(
                "*** setPDFCancelUploadFlag Change : ",
                callStore.PDFcancelUploadFlag,
            );

            // 이번 업로드 건은 취소하였고, 쌓인 Que가 있는지 확인한다.
            // queArray의 length가 남아있으면, 쌓여있던 Que를 실행시켜라.
            if (callStore.pdfUploadQueArray.length > 0) {
                console.log("QueArray가 0보다 크며, 남은 Que가 있다.");

                // upload 시작
                callStore.setPDFUploading(true);
                drawingPDFServerUpload(
                    callStore.pdfUploadQueArray[0].name,
                    callStore.pdfUploadQueArray[0].size,
                    callStore.pdfUploadQueArray[0].src,
                );
            }
            /* 업로드 취소 FLOW end */
        } else {
            // 진행률이 소수점 자리로 되어 있어서 100%가 안될 수도 있으므로. -> pdfToImg event가 수신되면 100%로 변경한다.
            callStore.setPDFUploadProgrss(100);

            // pdf 서버 업로드 진행률 표시 제거 및 초기화 : ksy
            callStore.setPDFUploadProgrss(0);

            // 이미지 변환까지 끝낸 후 이미지 목록을 보내주었으니 pdf To Image 종료
            // false로 하면, 호스트 이전 가능 및 진행률 표시 제거
            callStore.setPDFUploading(false);

            // 다 종료 된 후에 금방 업로드 한 파일 Que를 제거한다. -> queArray 맨 앞번째를 제거한다.
            callStore.removePdfUploadQueArray();

            // queArray의 length가 남아있으면, 쌓여있던 Que를 실행시켜라.
            if (callStore.pdfUploadQueArray.length > 0) {
                console.log("QueArray가 0보다 크며, 남은 Que가 있다.");

                // upload 시작
                callStore.setPDFUploading(true);
                drawingPDFServerUpload(
                    callStore.pdfUploadQueArray[0].name,
                    callStore.pdfUploadQueArray[0].size,
                    callStore.pdfUploadQueArray[0].src,
                );
            }
        }

        // kjs : json을 이용하여 img url를 변경한다.
        drawingStore.setPdfUrlSaveArrays(json);
    });

    // 룸이 가득찼을 때 event 수신
    // receive > leaveDeviceid, remoteDeviceid, roomid
    signallingSocket.on("roomFull", (response) => {
        const json = JSON.parse(response);
        console.log("*** socket.on: roomFull json = ", json);

        // 룸 가득 참을 알려줌. -> 퇴장 메세지를 찍지 않음.
        roomFullCheck.value = true;
        console.log("roomFull on Event : " + roomFullCheck.value);

        if (json.remoteDeviceid == loginStore.m_local_deviceid) {
            // 룸이 가득찼을 때 입장한 사람의 서브 비디오를 비우고
            // 해당 index layout change
            for (let i = 1; i < currentRoomNumberCount.value; i++) {
                if (!feeds.value[i]) {
                    callingLayoutChange("none", "", i);
                    sessionStorage.setItem("m_callWaiting", "false");

                    // // 해당 수락 거절 메시지 삭제
                    // chattingStore.chattingMessageList.splice(
                    //  chattingCallingIndex,
                    //  1
                    // )

                    // 하단 정렬일 경우에만
                    // callingLayout 4 하단 레이아웃 default 버튼 변경
                    // callStore.setUnderStatus", 0)
                    setInitUnderStatus(0);
                    break;
                }
            }

            // 바로 보내게 되면 입장 메세지보다 빠를 수도 있으므로, 1초뒤에 퇴장 메세지를 보낸다.
            setTimeout(function () {
                // 사용자들이 알 수 있게 메세지를 전송한다.
                const leaveNickname = userListGetNickname(json.leaveDeviceid);
                const chattingNickname = sessionStorage.getItem("m_nickname");
                let chattingMessage = "";

                if (preferenceStore.lang == "ko") {
                    chattingMessage =
                        t("videoRoom Full") + leaveNickname + t("videoRoom Full1");
                } else {
                    chattingMessage = leaveNickname + t("videoRoom Full");
                }
                const chattingLevel = 2; // 공지
                const chattingType = 0;

                addSendMessageList(
                    chattingNickname,
                    chattingMessage,
                    chattingLevel,
                    chattingType,
                );
            }, 1000);
        }
    });

    // drawing on event
    signallingSocket.on("drawing", function (response) {
        if (response) {
            const json = JSON.parse(response);
            console.log("*** socket: drawing response. json:" + response);
            // console.log(json.rfid)

            const drawingIndex = findFeedsIndexRfid(json.rfid);
            const beforeMainIndex = callStore.videoMainIndex;
            // drawing OFF
            if (json.status == 0) {
                // drawing OFF
                // 호스트가 드로잉을 종료했고  일반사용자의 #videoMainWrap의 높이를 조정한다 -inherit
                console.log("*** drawing height fit-content change");
                drawingStore.setDrawingVideo(true);

                // 호스트가 드로잉을 비활성화 했음을 store 에 저장한다
                commonStore.setIsDrawingEnable({
                    result: false,
                });
                console.log("**** 드로잉 활성화 상태: ", commonStore.isDrawingEnable);
            } else {
                // 호스트가 드로잉을 시작했고  일반사용자의 #videoMainWrap의 높이를 조정한다 -inherit
                console.log("*** drawing height inherit change");
                if (!videoCallHost.value) {
                    drawingStore.setDrawingVideo(false);
                }
                // 1번레이아웃에서 다른사용자가 메인일 때 드로잉을 시작한경우 3번레이아웃으로 바뀌면서
                // 호스트가 메인이되며 기존 메인이였던 사용자의 화면 비율을 원래대로 돌려야한다.
                if (beforeMainIndex == 0) {
                    console.log(document.getElementById("myvideo"));
                    document.getElementById("myvideo").style.scale = 1;
                } else {
                    console.log(document.getElementById("remotevideo" + beforeMainIndex));
                    document.getElementById("remotevideo" + beforeMainIndex).style.scale =
                        1;
                }

                // main Index 변경
                callStore.setVideoMainIndex(drawingIndex);

                // 레이저 포인터가 true일 경우 flase로 바꾼다. -> 초기화 시키는 것임.
                if (callStore.laserPointerShow) {
                    callStore.setLaserPointerShow(false);
                }

                // video Layout Type Change
                if (commonStore.callingLayoutType != 3) {
                    // videolayout change
                    saveVideoInfo();
                }

                // 호스트가 드로잉을 활성화 했음을 store 에 저장한다
                commonStore.setIsDrawingEnable({
                    result: true,
                });
                console.log("**** 드로잉 활성화 상태: ", commonStore.isDrawingEnable);
            }
        }
    });

    // laserPointer on event
    signallingSocket.on("laserPointer", function (response) {
        if (response) {
            const json = JSON.parse(response);
            console.log("*** socket: laserPointer response. json:" + response);

            if (json != null && commonStore.callingLayoutType != 1) {
                const laserPointer = document.getElementById("laserPointer");
                const laserCircle = document.getElementById("laserCircle");

                // 현재 선택된 x 좌표의 값/DOM 전체 길이 x 0.01 = 레이저 포인터 위치의 퍼센트
                const xLocationPercent = (json.xLocation * 100).toFixed(1);
                const yLocationPercent = (json.yLocation * 100).toFixed(1);

                console.log(`${xLocationPercent}%`);
                console.log(`${yLocationPercent}%`);

                // 레이저 포인터 위치 변경
                laserPointer.style.left = `${xLocationPercent}%`;
                laserPointer.style.top = `${yLocationPercent}%`;

                // 레이저를 감싸는 원 포인터 위치 변경
                laserCircle.style.left = `${xLocationPercent}%`;
                laserCircle.style.top = `${yLocationPercent}%`;

                // laserPointer Show
                callStore.setLaserPointerShow(true);

                // 레이저 포인터의 클래스를 삭제하고 추가함으로써 css 초기화 후 애니메이션 재실행
                laserCircle.classList.remove("laserCircle");
                laserPointer.classList.remove("laserPointer");

                setTimeout(function () {
                    laserCircle.classList.add("laserCircle");
                    laserPointer.classList.add("laserPointer");
                }, 50);
            }
        }
    });

    // HQ Capture 취소
    signallingSocket.on("cancelHQCapture", function (response) {
        if (response) {
            // const json = JSON.parse(response)
            console.log("*** socket: failHQCapture response. json:" + response);
            /* 파일 송수신 초기화 및 고화질 캡쳐 초기화 */

            // const rfidIndex = findFeedsIndexDeviceid(remotedeviceid)
            console.log("*** mounted: failHQCaptrue - 고화질 파일 전송을 취소했을 경우");

            fileReceiveBuffer.value = [];
            fileReceivedSize.value = 0;

            // 내 화면을 비디오로 변경
            callingLayoutChange("attach", sessionStorage.getItem("m_nickname"), 0);
            $("#myvideo").show();

            commonStore.fileSend();
            // 파일 송수신 flag 초기화
            commonStore.setFileSendStatus(0);
            commonStore.setFileModalFlag(false); // 파일 송수신 팝업 flag 초기화

            // 고화질 캡쳐 버튼 활성화
            callStore.setHQCaptrueFlag(false);

            // 모달 출력 - 고화질 촬영을 실패하였습니다. 잠시 후 시도해주세요.
            noneOverlayModal(18);
        }
    });

    // 이전 메세지 보기 이벤트 받기
    signallingSocket.on("getPreviousMessage", (response) => {
        // console.log("*** socket.on: getPreviousMessage res = ", response)
        console.log("*** socket.on: getPreviousMessage");
        const json = JSON.parse(response);
        // console.log("*** socket.on: json = ", json)

        // 이전 메세지 없음
        if (json.message.length == 0) {
            // console.log("데이터 없다")
            directMessageStore.previousMessageNone(false);
        }
        // if {
        // 메시지 10개를 가져오는데 0개 이상일때 채팅이력을 차례대로 넣어준다
        if (json.message.length > 0) {
            for (let i = 0; i < json.message.length; i++) {
                if (json.message[i].sender == loginStore.m_local_deviceid) {
                    // 발신
                    const userNickname = userListGetNickname(json.message[i].receiver);

                    directMessageStore.previousSendDM({
                        message: json.message[i].message,
                        sender: loginStore.m_local_deviceid,
                        receiver: json.message[i].receiver,
                        senderNickname: sessionStorage.getItem("m_nickname"),
                        receiverNickname: userNickname,
                        datetime: json.message[i].datetime,
                        chattingDateTime: getDirectMessageTimeZone(
                            json.message[i].datetime,
                        ),
                        readCheck: JSON.parse(json.message[i].readCheck),
                    });
                } else {
                    // 수신
                    const userNickname = userListGetNickname(json.message[i].sender);

                    directMessageStore.previousReceiveDM({
                        message: json.message[i].message,
                        sender: json.message[i].sender,
                        receiver: json.message[i].receiver,
                        senderNickname: userNickname,
                        receiverNickname: sessionStorage.getItem("m_nickname"),
                        datetime: json.message[i].datetime,
                        chattingDateTime: getDirectMessageTimeZone(
                            json.message[i].datetime,
                        ),
                        readCheck: JSON.parse(json.message[i].readCheck),
                        // compareDatetime: json.compareDatetime
                    });
                }

                // 가져온 메시지 만큼 돌고나서 메시지 개수가 10개 이하이면 더이상 가져올 메시지가 없다는 것으로 판단
                // 이후 (이전 데이터보기) 버튼을 없앤다
                if (json.message.length - 1 == i && json.message.length < 10) {
                    directMessageStore.previousMessageNone(false);
                } else {
                    // 채팅이 10개 이상이거나 다른 채팅모달로 넘어갔을때를 대비하여 다시 true로 변경
                    directMessageStore.previousMessageNone(true);
                }
            }
        }
    });

    // test :: requestBroadCast
    signallingSocket.on("requestBroadCast", function (response) {
        if (response) {
            const json = JSON.parse(response);
            console.log("*** socket: requestBroadCast response. json:" + response);

            // userList일 경우
            if (json.eventName == "userListAll") {
                userListAllRequest(loginStore.m_local_deviceid, loginStore.sessionEnSeq);
            }
        }
    });

    // 모바일로 접근했을 경우 전체화면으로 변경
    if (accessDeviceCheck.value == "Mobile") {
        console.log("*** mounted: Mobile Full Screen");
        document.getElementById("main").webkitRequestFullScreen();
    }

    // 메인화면 전체 보기 버튼 생성
    callStore.setMainVideoFullScreen(true);

    /* 모션 알람 socket on event */
    signallingSocket.on("motionDetect", function (response) {
        if (response) {
            const json = JSON.parse(response);
            console.log("*** socket: motionDetect response. json:" + response);
            /*
					status = 2 > 움직임 없음 감지
					status = 3 > 움직임 없음 감지 초기화
					status = 4 > 낙하 감지
				*/

            if (json.status == 2) {
                /* 움직임 없음 모션 정보 배열의 길이가 0일 경우 바로 등록한다. */
                if (callStore.motionNoMoveInfo.length == 0) {
                    console.log(
                        "*** socket: motionDetect > 움직임 없음 모션 배열 = 0 > 움직임 없음 등록",
                    );
                    /* 저장할 변수 생성 */
                    const datetimeUTC = getWorldTime();
                    const datetime = getMotionTimeZone(datetimeUTC);
                    const nickname = customUserNickname(json.deviceid);
                    const rfIndex = findFeedsIndexDeviceid(json.deviceid);
                    const userNickname = getNickname(nickname);

                    /* 해당하는 사용자가 없을 경우 아무것도 하지 않는다. */
                    if (feeds.value[rfIndex] == null) {
                        return;
                    }
                    const rfid = feeds.value[rfIndex].rfid;

                    /* 움직임 없음 모션 정보 등록 */
                    callStore.addMotionNoMoveInfo({
                        deviceid: json.deviceid,
                        datetime,
                        datetimeUTC,
                        status: json.status,
                        nickname,
                        rfid,
                        rfIndex,
                        userNickname,
                    });

                    /* 움직임 없음 모션 아이콘을 subVideo에 등록한다. */
                    setSubVideoMotionNoMove(rfIndex, true);

                    /* 움직임 없음 모션 Flag = true 로 변경한다. */
                    callStore.setMotionNoMoveFlag(true);

                    /* 레이아웃을 3번으로 변경한다. > 좌측정렬로 변경 */
                    // if (
                    //  store.state.callingLayoutType != 3 &&
                    //  !store.state.videoLayoutChangeResult
                    // ) {
                    //  // videolayout change
                    //  console.log("*** 모션 알람 발생 > 좌측정렬로 화면 전환")
                    //  saveVideoInfo()
                    // } else if (
                    //  store.state.callingLayoutType != 3 &&
                    //  store.state.videoLayoutChangeResult
                    // ) {
                    //  /* 레이아웃이 3번이 아니고, 이미 레이아웃을 변경하고 있는 중이라면 motionFailCheck 를 True로 한다. */
                    //  /* motaionFailCheck == true 일 경우 이전에 하던 레이아웃 변경을 다 하고,  videolayoutChange() 에서 다시 좌측정렬로 변경한다. */
                    //  console.log(
                    //      "*** 모션 알람 발생 > 현재 레이아웃 변경 중 이므로 motionFailCheck = True로 변경"
                    //  )
                    //  motionFailCheck = true
                    // }

                    /* 사이렌 알람 소리 */
                    emergencyAlarmBell("play");
                } else {
                    /* 움직임 없음 모션 정보에 해당 deviceid가 있는지 체크한다. */
                    for (let i = 0; i < callStore.motionNoMoveInfo.length; i++) {
                        if (callStore.motionNoMoveInfo[i].deviceid == json.deviceid) {
                            console.log(
                                "*** socket: motionDetect > 움직임 없음 모션 배열에 해당 id 존재 > 사고 발생 정보 업데이트",
                            );
                            // 같은 deviceid를 가진 정보가 있다면 사고 발생 정보를 업데이트한다.
                            const datetimeUTC = getWorldTime();
                            const datetime = getMotionTimeZone(datetimeUTC);
                            const nickname = customUserNickname(json.deviceid);
                            const rfIndex = findFeedsIndexDeviceid(json.deviceid);

                            /* 해당하는 사용자가 없을 경우 아무것도 하지 않는다. */
                            if (feeds.value[rfIndex] == null) {
                                return;
                            }

                            const rfid = feeds.value[rfIndex].rfid;

                            set(callStore.motionNoMoveInfo, i, {
                                deviceid: json.deviceid,
                                datetime,
                                datetimeUTC,
                                status: json.status,
                                nickname,
                                rfid,
                                rfIndex,
                            });

                            /* 움직임 없음 모션 아이콘을 subVideo에 등록한다. */
                            setSubVideoMotionNoMove(rfIndex, true);

                            /* 움직임 없음 모션 Flag = true 로 변경한다. */
                            callStore.setMotionNoMoveFlag(true);

                            /* 이미 레이아웃이 좌측정렬 일 것으로 예상되므로 좌측정렬을 하지 않는다. */

                            /* 사이렌 알람 소리 */
                            emergencyAlarmBell("play");
                            break;
                        }

                        // 마지막까지 수행했지만, 일치하는 deviceid가 없음 -> 추가한다.
                        if (i == callStore.motionNoMoveInfo.length - 1) {
                            console.log(
                                "*** socket: motionDetect > 움직임 없음 모션 배열에 존재하지 않음 > 움직임 없음 등록",
                            );
                            /* 저장할 변수 생성 */
                            const datetimeUTC = getWorldTime();
                            const datetime = getMotionTimeZone(datetimeUTC);
                            const nickname = customUserNickname(json.deviceid);
                            const rfIndex = findFeedsIndexDeviceid(json.deviceid);
                            const userNickname = getNickname(nickname);

                            /* 해당하는 사용자가 없을 경우 아무것도 하지 않는다. */
                            if (feeds.value[rfIndex] == null) {
                                return;
                            }

                            const rfid = feeds.value[rfIndex].rfid;

                            /* 움직임 없음 모션 정보 등록 */
                            callStore.addMotionNoMoveInfo({
                                deviceid: json.deviceid,
                                datetime,
                                datetimeUTC,
                                status: json.status,
                                nickname,
                                rfid,
                                rfIndex,
                                userNickname,
                            });

                            /* 움직임 없음 모션 아이콘을 subVideo에 등록한다. */
                            setSubVideoMotionNoMove(rfIndex, true);

                            /* 움직임 없음 모션 Flag = true 로 변경한다. */
                            callStore.setMotionNoMoveFlag(true);

                            /* 레이아웃을 3번으로 변경한다. > 좌측정렬로 변경 (20221025 - ksy 주석)*/
                            // if (
                            //  store.state.callingLayoutType != 3 &&
                            //  !store.state.videoLayoutChangeResult
                            // ) {
                            //  console.log("*** 모션 알람 발생 > 좌측정렬로 화면 전환")
                            //  // videolayout change
                            //  saveVideoInfo()
                            // } else if (
                            //  store.state.callingLayoutType != 3 &&
                            //  store.state.videoLayoutChangeResult
                            // ) {
                            //  /* 레이아웃이 3번이 아니고, 이미 레이아웃을 변경하고 있는 중이라면 motionFailCheck 를 True로 한다. */
                            //  /* motaionFailCheck == true 일 경우 이전에 하던 레이아웃 변경을 다 하고,  videolayoutChange() 에서 다시 좌측정렬로 변경한다. */
                            //  console.log(
                            //      "*** 모션 알람 발생 > 현재 레이아웃 변경 중 이므로 motionFailCheck = True로 변경"
                            //  )
                            //  motionFailCheck = true
                            // }

                            /* 사이렌 알람 소리 */
                            emergencyAlarmBell("play");
                        }
                    }
                }
            } else if (json.status == 3) {
                /* 움직임 없음 배열이 0 일 경우에는 아무것도 하지 않는다. */
                if (callStore.motionNoMoveInfo.length != 0) {
                    /* 해당 deviceid가 배열에 존재하는지 확인한다. */
                    for (let i = 0; i < callStore.motionNoMoveInfo.length; i++) {
                        if (callStore.motionNoMoveInfo[i].deviceid == json.deviceid) {
                            console.log(
                                "*** socket: motionDetect > 움직임 없음 초기화 > 움직임 없음 배열에서 삭제",
                            );
                            const motionNoMove = callStore.motionNoMoveInfo[i];
                            /* deviceid가 움직임 없음 배열에 존재한다 */

                            /* 현재 움직임 없음 배열의 길이를 체크한다. > length == 1 일 경우 움직임 없음 Flag를 false 변경 */
                            if (callStore.motionNoMoveInfo.length == 1) {
                                /* 움직임 없음 모션 Flag = false 로 변경한다. > 해당 건을 삭제 후에는 length 가 0이기 때문에 */
                                callStore.setMotionNoMoveFlag(false);
                            }

                            /* 해당 deviceid를 움직임 없음 배열에서 삭제한다. */
                            callStore.deleteMotionNoMoveInfo(i);

                            /* 움직임 없음 모션 아이콘을 subVideo에서 삭제한다. */
                            setSubVideoMotionNoMove(motionNoMove.rfIndex, false);

                            console.log(
                                "*** socket: motionDetect > 움직임 없음 초기화 > " +
                                    motionNoMove.rfIndex +
                                    " 번째 사용자 움직임 없음 아이콘 삭제",
                            );

                            /* 사이렌 알람 소리 끄기 */
                            emergencyAlarmBell("stop");
                        }
                    }
                }
            } else if (json.status == 4) {
                /* 낙하 모션 정보 배열의 길이가 0일 경우 바로 등록한다. */
                if (callStore.motionFallInfo.length == 0) {
                    console.log(
                        "*** socket: motionDetect > 낙하 배열 길이 = 0 > 낙하 배열에 등록",
                    );
                    /* 저장할 변수 생성 */
                    const datetimeUTC = getWorldTime();
                    const datetime = getMotionTimeZone(datetimeUTC);
                    const nickname = customUserNickname(json.deviceid);
                    const rfIndex = findFeedsIndexDeviceid(json.deviceid);

                    /* 해당하는 사용자가 없을 경우 아무것도 하지 않는다. */
                    if (feeds.value[rfIndex] == null) {
                        return;
                    }
                    const rfid = feeds.value[rfIndex].rfid;

                    /* 낙하 모션 정보 등록 */
                    callStore.addMotionFallInfo({
                        deviceid: json.deviceid,
                        datetime,
                        datetimeUTC,
                        status: json.status,
                        nickname,
                        rfid,
                        rfIndex,
                    });

                    /* 낙하 모션 아이콘을 subVideo에 등록한다. */
                    setSubVideoMotionFall(rfIndex, true);

                    /* motion Flag = true 로 변경한다. */
                    callStore.setMotionFallFlag(true);

                    /* 레이아웃을 3번으로 변경한다. > 좌측정렬로 변경(20221025 - ksy 주석) */
                    // if (
                    //  store.state.callingLayoutType != 3 &&
                    //  !store.state.videoLayoutChangeResult
                    // ) {
                    //  console.log("*** 모션 알람 발생 > 좌측정렬로 화면 전환")
                    //  // videolayout change
                    //  saveVideoInfo()
                    // } else if (
                    //  store.state.callingLayoutType != 3 &&
                    //  store.state.videoLayoutChangeResult
                    // ) {
                    //  /* 레이아웃이 3번이 아니고, 이미 레이아웃을 변경하고 있는 중이라면 motionFailCheck 를 True로 한다. */
                    //  /* motaionFailCheck == true 일 경우 이전에 하던 레이아웃 변경을 다 하고,  videolayoutChange() 에서 다시 좌측정렬로 변경한다. */
                    //  console.log(
                    //      "*** 모션 알람 발생 > 현재 레이아웃 변경 중 이므로 motionFailCheck = True로 변경"
                    //  )
                    //  motionFailCheck = true
                    // }

                    /* 사이렌 알람 소리 */
                    emergencyAlarmBell("play");
                } else {
                    /* 낙하 모션 정보에 해당 deviceid가 있는지 체크한다. */
                    for (let i = 0; i < callStore.motionFallInfo.length; i++) {
                        if (callStore.motionFallInfo[i].deviceid == json.deviceid) {
                            console.log(
                                "*** socket: motionDetect > 낙하 배열에 존재하는 id > 사고 발생 정보 업데이트",
                            );
                            // 같은 deviceid를 가진 정보가 있다면 사고 발생 정보를 업데이트한다.
                            const datetimeUTC = getWorldTime();
                            const datetime = getMotionTimeZone(datetimeUTC);
                            const nickname = customUserNickname(json.deviceid);
                            const rfIndex = findFeedsIndexDeviceid(json.deviceid);

                            /* 해당하는 사용자가 없을 경우 아무것도 하지 않는다. */
                            if (feeds.value[rfIndex] == null) {
                                return;
                            }

                            const rfid = feeds.value[rfIndex].rfid;

                            set(callStore.motionFallInfo, i, {
                                deviceid: json.deviceid,
                                datetime,
                                datetimeUTC,
                                status: json.status,
                                nickname,
                                rfid,
                                rfIndex,
                            });

                            /* 낙하 모션 아이콘을 subVideo에 등록한다. */
                            setSubVideoMotionFall(rfIndex, true);

                            /* motion Flag = true 로 변경한다. */
                            callStore.setMotionFallFlag(true);

                            /* 이미 레이아웃이 좌측정렬 일 것으로 예상되므로 좌측정렬을 하지 않는다. */

                            /* 사이렌 알람 소리 */
                            emergencyAlarmBell("play");
                            break;
                        }

                        // 마지막까지 수행했지만, 일치하는 deviceid가 없음 -> 추가한다.
                        if (i == callStore.motionFallInfo.length - 1) {
                            console.log(
                                "*** socket: motionDetect > 낙하 배열에 존재하지 않는 id > 낙하 배열에 등록",
                            );
                            /* 저장할 변수 생성 */
                            const datetimeUTC = getWorldTime();
                            const datetime = getMotionTimeZone(datetimeUTC);
                            const nickname = customUserNickname(json.deviceid);
                            const rfIndex = findFeedsIndexDeviceid(json.deviceid);

                            /* 해당하는 사용자가 없을 경우 아무것도 하지 않는다. */
                            if (feeds.value[rfIndex] == null) {
                                return;
                            }

                            const rfid = feeds.value[rfIndex].rfid;

                            /* 낙하 모션 정보 등록 */
                            callStore.addMotionFallInfo({
                                deviceid: json.deviceid,
                                datetime,
                                datetimeUTC,
                                status: json.status,
                                nickname,
                                rfid,
                                rfIndex,
                            });

                            /* 낙하 모션 아이콘을 subVideo에 등록한다. */
                            setSubVideoMotionFall(rfIndex, true);

                            /* motion Flag = true 로 변경한다. */
                            callStore.setMotionFallFlag(true);

                            /* 레이아웃을 3번으로 변경한다. > 좌측정렬로 변경  (20221025 - ksy 주석)*/
                            // if (
                            //  store.state.callingLayoutType != 3 &&
                            //  !store.state.videoLayoutChangeResult
                            // ) {
                            //  console.log("*** 모션 알람 발생 > 좌측정렬로 화면 전환")
                            //  // videolayout change
                            //  saveVideoInfo()
                            // } else if (
                            //  store.state.callingLayoutType != 3 &&
                            //  store.state.videoLayoutChangeResult
                            // ) {
                            //  /* 레이아웃이 3번이 아니고, 이미 레이아웃을 변경하고 있는 중이라면 motionFailCheck 를 True로 한다. */
                            //  /* motaionFailCheck == true 일 경우 이전에 하던 레이아웃 변경을 다 하고,  videolayoutChange() 에서 다시 좌측정렬로 변경한다. */
                            //  console.log(
                            //      "*** 모션 알람 발생 > 현재 레이아웃 변경 중 이므로 motionFailCheck = True로 변경"
                            //  )
                            //  motionFailCheck = true
                            // }

                            /* 사이렌 알람 소리 */
                            emergencyAlarmBell("play");
                        }
                    }
                }
            }
        }
    });

    /* 테스트 */
    // setSubVideoMotionFall(0, false)
    // setSubVideoMotionNoMove(0, true)
    // const obj = {
    //  localdeviceid: "test2",
    //  remotedeviceid: "test",
    //  status: 4
    // }

    // const sendJson = JSON.stringify(obj)
    // setTimeout(() => {
    //  if (loginStore.m_local_deviceid == "test2") {
    //      signallingSocket.emit("motionDetect", sendJson)
    //      console.log("*** socket: emit motionDetect Stop. json: " + sendJson)
    //  }
    // }, 5000)

    // const obj3 = {
    //  localdeviceid: "test3",
    //  remotedeviceid: "test",
    //  status: 2
    // }
    // const sendJson3 = JSON.stringify(obj3)
    // setTimeout(() => {
    //  if (loginStore.m_local_deviceid == "test3") {
    //      signallingSocket.emit("motionDetect", sendJson3)
    //      console.log("*** socket: emit motionDetect Stop. json: " + sendJson3)
    //  }
    // }, 5000)

    // const obj2 = {
    //  localdeviceid: "test4",
    //  remotedeviceid: "test",
    //  status: 4
    // }
    // const sendJson2 = JSON.stringify(obj2)
    // setTimeout(() => {
    //  if (loginStore.m_local_deviceid == "test4") {
    //      signallingSocket.emit("motionDetect", sendJson2)
    //      console.log("*** socket: emit motionDetect Stop. json: " + sendJson2)
    //  }
    // }, 5000)

    // const obj4 = {
    //  localdeviceid: "test",
    //  remotedeviceid: "p2test",
    //  status: 4
    // }
    // const sendJson4 = JSON.stringify(obj4)
    // setTimeout(() => {
    //  if (loginStore.m_local_deviceid == "admin") {
    //      signallingSocket.emit("motionDetect", sendJson4)
    //      console.log("*** socket: emit motionDetect Stop. json: " + sendJson4)
    //  }
    // }, 15000)

    signallingSocket.on("insertGPS", (response) => {
        console.log(JSON.parse(response), "GPS response");
    });
    signallingSocket.on("getMyGPSList", (response) => {
        if (gpsListEvent.value.type == 0) {
            // console.log(JSON.parse(response), "MYGPS ALL")
            if (JSON.parse(response).length != 0) {
                callStore.setMyGpsList(JSON.parse(response));
            }
        } else if (gpsListEvent.value.type == 1) {
            // console.log(JSON.parse(response), "MYGPS JUST ONE")
            const mine = callStore.myGpsList;
            if (mine[mine.length - 1].savetime != JSON.parse(response)[0].savetime) {
                callStore.setMyGpsListPush(JSON.parse(response)[0]);
            }
        }
    });
    signallingSocket.on("getUserGPSList", (response) => {
        callStore.setOtherGpsList(JSON.parse(response));
    });

    // 스트림 해상도 변경
    signallingSocket.on("startStreamMode", (response) => {
        console.log("*** socket: on startStreamMode");
        const json = JSON.parse(response);
        console.log(json);
        if (json.stream_type == 1) {
            callStore.setHQCaptureShow(true);
            callStore.setStreamMode(1);
        } else if (json.stream_type == 0) {
            callStore.setHQCaptureShow(false);
            callStore.setStreamMode(0);
        }
    });

    // 파일 전송률 수신
    signallingSocket.on("fileSendRate", (response) => {
        console.log("*** socket: on fileSeneRate");
        const json = JSON.parse(response);
        // console.log(json)
        const rfIndex = findFeedsIndexDeviceid(json.deviceid);
        const data = {
            index: rfIndex, //  callinWindow 송신자 화면인덱스
            rate: json.rate, // 수신율
        };
        commonStore.setFileReceptionRate(data);
    });
    signallingSocket.on("resultEntryNotification", (response) => {
        console.log("*** socket: on resultEntryNotification. respones >", response);
        const json = JSON.parse(response);
        const resData = json.entry_notification_list;
        const chattingNickname = sessionStorage.getItem("m_nickname");
        const chattingLevel = 2; // 공지
        const chattingType = 0;
        const nowDate = getWorldTime();
        for (let i = 0; i < resData.length; ++i) {
            let chattingMessage;
            if (resData[i].message == "Shipped" || resData[i].message == "발송 완료") {
                if (sessionStorage.getItem("languageCode") == "ko") {
                    chattingMessage =
                        resData[i].member_name + t("chatting enterence notification")[0];
                } else {
                    chattingMessage =
                        t("chatting enterence notification")[0] +
                        " " +
                        resData[i].member_name;
                }
            } else if (
                resData[i].message == "logout state" ||
                resData[i].message == "로그아웃 상태"
            ) {
                if (sessionStorage.getItem("languageCode") == "ko") {
                    chattingMessage =
                        resData[i].member_name + t("chatting enterence notification")[1];
                } else {
                    chattingMessage =
                        t("chatting enterence notification")[1] +
                        " " +
                        resData[i].member_name;
                }
            } else if (
                resData[i].message == "busy state" ||
                resData[i].message == "통화중 상태"
            ) {
                if (sessionStorage.getItem("languageCode") == "ko") {
                    chattingMessage =
                        resData[i].member_name + t("chatting enterence notification")[2];
                } else {
                    chattingMessage =
                        t("chatting enterence notification")[2] + resData[i].member_name;
                }
            }
            setTimeout(() => {
                addReceiveMessageList(
                    chattingNickname,
                    nowDate,
                    getChattingTimeZone(nowDate),
                    chattingMessage,
                    chattingLevel,
                    chattingType,
                );
            }, 2100);
        }
    });
    signallingSocket.on("keepAliveStream", (response) => {
        console.log("*** keepAliveStream event ***");
        console.log(response);
        if (!response) return;
        const json = JSON.parse(response);
        keepAliveList.push(json.glassid);
        setTimeout(() => {
            checkRejoined(json.glassid);
        }, 180000);
    });
    if (process.env.forceLogtout24) {
        setTimeout(() => {
            // 통화중이란걸 watt manager에 알려주기 위함
            // 통화중에는 24시간이 지나더라도 강제 로그아웃 진행 X
            const cookieName = sessionStorage.getItem("id") + "ManagerLoginTime";
            deleteCookie(cookieName);
            setCookie(cookieName, "calling");
        }, 10000);
    }
});

// 데이터가 업데이트될 때 실행할 작업
onUpdated(() => {
    // console.log('컴포넌트가 업데이트되었습니다. 현재 count는:', count.value)
});

// 언마운트되기 전 실행할 작업
onBeforeUnmount(() => {
    console.log("컴포넌트가 언마운트됩니다.");
});

function streamMediaChange() {
    console.log("*** media devices modified");
    const videoDefine = "stdres-16:9";
    if (commonStore.isDrawing || commonStore.isShare) {
        setAudioOutput();
        return;
    }
    sfutest.value.createOffer({
        media: {
            audioRecv: false,
            videoRecv: false,
            audioSend: true,
            videoSend: true,
            video: videoDefine,
            replaceAudio: true,
            replaceVideo: true,
            data: true,
            keepVideo: false,
            selectedMicID: commonStore.selectedMicID,
            selectedCamIndex: commonStore.selectedCamIndex,
        },
        simulcast: doSimulcast.value,
        simulcast2: doSimulcast2.value,
        success(jsep) {
            Janus.debug("Got publisher SDP!", jsep);

            nextTick(() => {
                if (callStore.cameraDeviceIndex == -1) {
                    muteVideoCustom();
                }
                if (
                    commonStore.selectedMicID == "false" ||
                    commonStore.selectedMicID == false
                ) {
                    callStore.setMicOnOffClick(true);
                    commonStore.setIsSoundedTrue();
                } else {
                    callStore.setMicOnOffClick(false);
                    commonStore.setIsSoundedFalse();
                }
                setAudioOutput();
            });
        },
        error(error) {
            Janus.error("WebRTC error:", error);
            console.log("WebRTC error:", error);
        },
    });
    commonStore.setDeviceModifyState(false);
}
async function setAudioOutput() {
    console.log("*** audio output device change");
    console.log(`*** audio output device id = ${commonStore.selectedAudioID}`);
    const audioOutID = commonStore.selectedAudioID;
    //
    for (let iLoop = 0; iLoop < 15; ++iLoop) {
        const permanantAuido = document.getElementById(`audioControl${iLoop}`);
        if (document.getElementById(`waitingvideo${iLoop}`)) {
            document.getElementById(`waitingvideo${iLoop}`).remove();
        }
        if (document.getElementById("no-video-container")) {
            document.getElementById("no-video-container").remove();
        }
        if (document.getElementsByClassName("spinner")[iLoop]) {
            document.getElementsByClassName("spinner")[iLoop].remove();
        }
        const audioElement = permanantAuido;
        if (audioElement && audioElement.srcObject) {
            let videoElement;
            if (iLoop == 0) {
                console.log("change local audio out");
                videoElement = document.getElementById("myvideo");
            } else {
                console.log("change remote audio out");
                videoElement = document.getElementById(`remotevideo${iLoop}`);
            }
            if (typeof videoElement.setSinkId === "undefined") {
                alert("Browser does not support setSinkId. Please use Chrome or Edge");
                return;
            }
            if (audioOutID != false && audioOutID != "false") {
                console.log("set audio");
                videoElement.removeAttribute("muted", false);
                videoElement.muted = false;
                try {
                    if (
                        permanantAuido &&
                        permanantAuido.srcObject &&
                        permanantAuido.srcObject.getAudioTracks().length > 0
                    ) {
                        await permanantAuido
                            .setSinkId(audioOutID)
                            .then(() => {
                                console.log(
                                    `Success, audio output device attached: ${audioOutID}`,
                                );
                                videoElement.muted = true;
                                permanantAuido.muted = false;
                            })
                            .catch((err) => {
                                if (err.name === "SecurityError") {
                                    alert(
                                        `You need to use https for selecting audio output device: ${err}`,
                                    );
                                } else {
                                    console.log(`audio output change err: ${err}`);
                                    // 여기서 재귀 호출 제거 또는 조건부 처리
                                }
                            });
                    } else {
                        console.log("No audio track, skip audio output change");
                    }
                } catch (err) {
                    console.log(err);
                    return;
                }
            } else {
                console.log("*** set audio muted");
                videoElement.setAttribute("muted", "muted");
                videoElement.muted = "muted";
                permanantAuido.setAttribute("muted", "muted");
                permanantAuido.muted = "muted";
            }
        }
    }
    const sfutest = commonStore.sfutest;
    if (commonStore.isSounded) {
        sfutest.muteAudio();
    } else {
        sfutest.unmuteAudio();
    }
}

function createRoomRequest(deviceid, roomid, uniqueRoomid) {
    const obj = { deviceid, roomid, unique_roomid: uniqueRoomid };
    const json = JSON.stringify(obj);
    signallingSocket.emit("createRoom", json);
    // console.log("*** socket: emit createRoom. json: ", json)
}
// 상대방 통화 수신 가능한지 체크
function canReceiveCallRequest(localdeviceid, remotedeviceid) {
    const obj = {
        localdeviceid,
        remotedeviceid,
    };
    const json = JSON.stringify(obj);
    signallingSocket.emit("canReceiveCall", json);
    // console.log("*** socket: emit canReceiveCall. json: ", json)
}
function joinRoomRequest(deviceid, roomid, uniqueRoomid) {
    console.log(typeof deviceid, typeof roomid, typeof uniqueRoomid);
    const obj = { deviceid, roomid, unique_roomid: uniqueRoomid };
    const json = JSON.stringify(obj);
    signallingSocket.emit("joinRoom", json);
    console.log("*** socket: emit joinRoom. json: ", json);
}
function callingRequest(
    localdeviceid,
    remotedeviceid,
    roomid,
    calltype,
    institution,
    nickname,
    meetingSeq,
) {
    // console.log("calling > uniqueRoomid : " + uniqueRoomid)
    let obj = {};
    if (feeds.value.length == 0) {
        obj = {
            localdeviceid,
            remotedeviceid,
            roomid,
            calltype,
            institution,
            nickname,
            meetingSeq,
            unique_roomid: uniqueRoomid.value, // unqiueRoomid 추가
        };
    } else {
        obj = {
            localdeviceid,
            remotedeviceid,
            roomid,
            calltype,
            institution,
            nickname,
            roomNumberCount: currentRoomNumberCount.value,
            meetingSeq,
            unique_roomid: uniqueRoomid.value,
        };
    }
    const json = JSON.stringify(obj);
    signallingSocket.emit("calling", json);
    // console.log("*** socket: emit calling. json: ", json)
}
function discallingRequest(localdeviceid, remotedeviceid, roomid, institution, nickname) {
    const obj = {
        localdeviceid,
        remotedeviceid,
        roomid,
        institution,
        nickname,
    };
    const json = JSON.stringify(obj);
    signallingSocket.emit("discalling", json);

    // console.log("*** socket: emit discalling. json: ", json)
}
function cancelCallingRequest() {
    const obj = {
        localdeviceid: loginStore.m_local_deviceid,
        remotedeviceid: sessionStorage.getItem("m_remote_deviceid"),
        roomid: sessionStorage.getItem("m_roomid"),
        institution: sessionStorage.getItem("m_institution"),
        nickname: sessionStorage.getItem("m_nickname"),
    };
    const json = JSON.stringify(obj);
    signallingSocket.emit("cancelCalling", json);
    // console.log("*** socket: emit cancelCalling. json: ", json)
}
function callingAccept(roomid, remotedeviceid) {
    // sessionStorage save
    sessionStorage.setItem("m_roomid", roomid);
    // sessionStorage.setItem("m_roomid", "1234")
    sessionStorage.setItem("m_remote_deviceid", remotedeviceid);
    sessionStorage.setItem("m_remote_nickname", userListGetNickname(remotedeviceid));
    sessionStorage.setItem("m_remote_devicetype", userListGetDevicetype(remotedeviceid));
    sessionStorage.setItem("m_remote_status", userListGetStatus(remotedeviceid));
    // Janus 에서 Answer 역할 수행
}
function callingReject(roomid, localdeviceid, remotedeviceid, institution, nickname) {
    const obj = {
        localdeviceid,
        remotedeviceid,
        roomid,
        institution,
        nickname,
    };
    const json = JSON.stringify(obj);
    signallingSocket.emit("refuseCalling", json);
    // console.log("*** socket: emit refuseCalling. json: ", json)
}
function getQueryStringValue(name) {
    name = name.replace(/[[]/, "\\[").replace(/[\]]/, "\\]");
    const regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
    const results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}
// 사용자가 입력한 이름이 규칙에 합당한지 체크
function registerUsername() {
    // DOM 요소 참조
    const usernameInput = document.getElementById("username");
    const registerButton = document.getElementById("register");
    const youLabel = document.getElementById("you");

    console.log("*** methods: registerUsername", usernameInput ? 1 : 0); // .length 대신 요소 존재 여부로 확인

    // usernameInput이 존재하지 않을 경우
    if (!usernameInput) {
        // 이 부분은 jQuery 버전의 `$("#username").length === 0`에 해당하지만,
        // 순수 JS에서는 요소가 없으면 바로 반환하는 것이 일반적입니다.
        // 원본 코드의 의도상 'username' 필드가 없으면 동적으로 생성하는 대신,
        // 'register' 버튼에 클릭 리스너를 다시 붙이고 'username'에 포커스하려는 시도로 보입니다.
        // HTML에 해당 요소가 항상 있다고 가정하고 처리하는 것이 더 일반적입니다.
        // 여기서는 요소를 찾지 못하면 경고를 띄우고 종료합니다.
        console.warn("Input field with ID 'username' not found.");
        return;
    }

    try {
        // 필드 비활성화
        usernameInput.disabled = true;
        registerButton.disabled = true;

        // 기존 이벤트 리스너 제거 (unbind("click") 대체)
        // registerUsername 함수 자체를 이벤트 핸들러로 사용하고 있으므로,
        // 이 함수를 재귀적으로 호출할 때 중복 리스너 등록을 피하기 위해 제거합니다.
        // removeEventListener에 전달하는 함수는 addEventListener에 사용된 것과 동일한 함수여야 합니다.
        // 따라서 함수 참조를 미리 정의하고 사용해야 합니다.
        // 이 예시에서는 함수를 다시 등록할 때마다 이전 리스너를 제거하는 방식으로 구현합니다.
        registerButton.removeEventListener("click", registerUsername); // 자신을 제거

        const username = usernameInput.value;

        if (username === "") {
            youLabel.className = "label label-warning"; // 기존 클래스 제거 후 새 클래스 추가
            youLabel.innerHTML = "Insert your display name (e.g., pippo)";

            usernameInput.disabled = false;
            usernameInput.value = ""; // 입력값 초기화
            registerButton.disabled = false;
            registerButton.addEventListener("click", registerUsername); // 이벤트 리스너 다시 추가
            return;
        }

        // m_nickname에 하이푼이 들어가있으면 처리를 못한다. 어떻게 해야하는가?
        // 이메일 같은 경우는 하이푼이 들어가있을수도 있는데..
        // 정규식: 영문, 숫자, 한글 외의 문자열이 있는지 테스트 (하이픈 포함 시 정규식 수정 필요)
        if (/[^a-zA-Z0-9가-힣]/.test(username)) {
            youLabel.className = "label label-warning";
            youLabel.innerHTML = "Input is not alphanumeric";

            usernameInput.disabled = false;
            usernameInput.value = ""; // 입력값 초기화
            registerButton.disabled = false;
            registerButton.addEventListener("click", registerUsername); // 이벤트 리스너 다시 추가
            return;
        }

        const register = {
            request: "join",
            room: myroom.value, // 외부 변수 myroom의 .value 속성 접근
            ptype: "publisher",
            display:
                (username || loginStore.nickname) + "#" + loginStore.m_local_deviceid, // 외부 변수 loginStore 접근
        };
        myusername.value = username || loginStore.nickname; // 외부 변수 myusername의 .value 속성 접근

        // sfutest.value가 유효한지 확인 후 send 호출
        if (sfutest.value && typeof sfutest.value.send === "function") {
            sfutest.value.send({ message: register });
        } else {
            console.error(
                "sfutest object or its send method is not properly initialized.",
            );
        }
    } catch (error) {
        console.error("Error during registration:", error); // console.log 대신 console.error 사용
    } finally {
        // 성공적으로 등록되었거나 오류가 발생했더라도 입력 필드와 버튼 상태를 복구하지 않으므로,
        // 이 finally 블록은 필요에 따라 조정될 수 있습니다.
        // 원본 코드에서는 오류 발생 시만 재활성화하는 로직이 있었으므로 그 흐름을 따릅니다.
    }
}

function publishOwnFeed(useAudio) {
    // console.log("*** methods: publishOwnFeed")
    // Publish our stream
    $("#publish").attr("disabled", true).unbind("click");

    /// ///////////////////////////////////////////////////////////////////
    let video = true;
    let audio =
        commonStore.selectedMicID == false || commonStore.selectedMicID == "false"
            ? false
            : true;
    // video on     audio on
    if (
        onlyVoiceID.value.includes(loginStore.m_local_deviceid) ||
        callStore.cameraNotAllowed ||
        callStore.cameraDeviceIndex == -1
    ) {
        video = false;
    }
    /* 모바일 체크 - 모바일일 경우 true / true */
    const filter = "win16|win32|win64|mac|linux";
    if (navigator.platform) {
        if (!filter.includes(navigator.platform.toLowerCase())) {
            // alert("Mobile")
            publishOwnFeedCustom(video, audio);
        } else {
            // alert("PC")
            navigator.mediaDevices
                .getUserMedia({ video, audio })
                .then(function (stream) {
                    // console.log("stream.getVideoTracks() = ", stream.getVideoTracks())
                    // console.log("stream.getAudioTracks() = ", stream.getAudioTracks())

                    // 여기까지 도달했다면 video, audio 값을 createOffer에 사용하도록 한다.
                    // res = {"video": video, "auido": auido}
                    console.log("미디어 장치 체크 중.. 비디오 on 오디오 on 성공");
                    publishOwnFeedCustom(video, audio);
                })
                .catch(function (e) {
                    // console.log("e.name = ", e.name)
                    // console.log("e.message = ", e.message)
                    console.log(
                        "비디오 on 오디오 on 실패 했습니다. 오디오 on 실행합니다.",
                    );

                    /// ///////////////////////////////////////////////////////////////////
                    video = false;
                    audio = true;
                    // video off        audio on
                    navigator.mediaDevices
                        .getUserMedia({ video, audio })
                        .then(function (stream) {
                            // console.log(
                            //  "stream.getVideoTracks() = ",
                            //  stream.getVideoTracks()
                            // )
                            // console.log(
                            //  "stream.getAudioTracks() = ",
                            //  stream.getAudioTracks()
                            // )

                            // 여기까지 도달했다면 video, audio 값을 createOffer에 사용하도록 한다.
                            // res = {"video": video, "auido": auido}
                            console.log(
                                "미디어 장치 체크 중.. 비디오 off 오디오 on 성공",
                            );
                            publishOwnFeedCustom(video, audio);
                        })
                        .catch(function (e) {
                            // console.log("e.name = ", e.name)
                            // console.log("e.message = ", e.message)
                            console.log(
                                "비디오 off 오디오 on 실패 했습니다. 비디오 on  실행합니다.",
                            );

                            /// ///////////////////////////////////////////////////////////////////
                            video = true;
                            audio = false;
                            // video on     audio off
                            navigator.mediaDevices
                                .getUserMedia({ video, audio })
                                .then(function (stream) {
                                    // console.log(
                                    //  "stream.getVideoTracks() = ",
                                    //  stream.getVideoTracks()
                                    // )
                                    // console.log(
                                    //  "stream.getAudioTracks() = ",
                                    //  stream.getAudioTracks()
                                    // )

                                    // 여기까지 도달했다면 video, audio 값을 createOffer에 사용하도록 한다.
                                    // res = {"video": video, "auido": auido}
                                    console.log(
                                        "미디어 장치 체크 중.. 비디오 on 오디오 off 성공",
                                    );
                                    publishOwnFeedCustom(video, audio);
                                })
                                .catch(function (e) {
                                    // console.log("e.name = ", e.name)
                                    // console.log("e.message = ", e.message)
                                    // console.log(
                                    //  "비디오 on 오디오 off 실패 했습니다. 비디오 오디오 없이 영상통화를 실행합니다."
                                    // )

                                    /// ///////////////////////////////////////////////////////////////////
                                    video = false;
                                    audio = false;
                                    // res = {"video": video, "auido": auido}
                                    publishOwnFeedCustom(video, audio);
                                });
                        });
                });
        }
    }

    // // 디바이스 체크 TEST !!!
    // if (loginStore.m_local_deviceid == "admin") {
    //  // callStore.setCameraDevice", false)
    //  useAudio = false
    // }
}
function publishOwnFeedCustom(videoSend, audioSend) {
    // console.log("*** methods: publishOwnFeedCustom")
    // console.log("videoSend = ", videoSend)
    // console.log("audioSend = ", audioSend)

    // const parent = this

    // globalAudioSend.value = audioSend
    // globalVideoSend = videoSend
    let audioSendParams = audioSend != false ? true : false;
    callStore.setGlobalAudioSend(audioSendParams);
    callStore.setGlobalVideoSend(videoSend);

    // 한계에 다다랐을 때 시도한 방법. 안된다고 판단하기엔 섣부르다.
    Janus.deviceAudioState = audioSend;
    Janus.deviceVideoState = videoSend;

    // console.log("Janus.deviceAudioState = ", Janus.deviceAudioState)
    // console.log("Janus.deviceVideoState = ", Janus.deviceVideoState)

    // videoType: true 의 경우 어떤 해상도를 이용할지, videoType: false의 경우 #videoNone canvas 공유
    let videoType = "";
    if (videoSend) {
        videoType = "stdres-16:9";
    } else {
        videoType = "videoNone";
        // 캔버스에 접근
        const canvas = document.getElementById("videoNone");
        const context = canvas.getContext("2d");
        // console.log("canvas = ", canvas)
        // console.log("context = ", context)

        // 인터벌이 살아있다면 clear
        if (videoNoneCanvasInterval.value != null) {
            clearInterval(videoNoneCanvasInterval.value);
        }

        // x좌표/y좌표 1, 1 위치에 가로/세로 1, 1의 투명색 점을 1초 마다 찍는 코드
        // 이렇게 함으로 canvas의 mediaStream이 재생되고 있다고 알림
        videoNoneCanvasInterval.value = setInterval(function () {
            context.fillStyle = "rgb(0, 0, 0, 0)";
            context.fillRect(1, 1, 1, 1);
        }, 125);
    }

    // 화면 공유를 할 때 audio 값을 전달하기 위함
    // globalAudioSend.value = audioSend
    callStore.setGlobalAudioSend(audioSendParams);

    sfutest.value.createOffer({
        // Add data:true here if you want to publish datachannels as well
        // video: "hires-16:9" 추가함. 1280 720 해상도
        // cameraDevice
        media: {
            audioRecv: false,
            videoRecv: false,
            // audioSend: true,
            audioSend,
            // videoSend: true,
            videoSend, // 카메라가 없을 경우 보내지 않도록 한다.
            // video: "hires"
            video: videoType,
            // =>kyj
            data: true,
            selectedMicID: commonStore.selectedMicID,
            selectedCamIndex: commonStore.selectedCamIndex, // <=kyj
        }, // Publishers are sendonly
        // If you want to test simulcasting (Chrome and Firefox only), then
        // pass a ?simulcast=true when opening demo page: it will turn
        // the following 'simulcast' property to pass to janus.js to true
        simulcast: doSimulcast.value,
        simulcast2: doSimulcast2.value,
        success(jsep) {
            // console.log("createOffer 성공")
            // console.log("^^^^^^^^^")
            Janus.debug("Got publisher SDP!", jsep);
            const publish = { request: "configure", audioSend, video: true };
            // You can force a specific codec to use when publishing by using the
            // audiocodec and videocodec properties, for instance:
            //      publish["audiocodec"] = "opus"
            // to force Opus as the audio codec to use, or:
            //      publish["videocodec"] = "vp9"
            // to force VP9 as the videocodec to use. In both case, though, forcing
            // a codec will only work if: (1) the codec is actually in the SDP (and
            // so the browser supports it), and (2) the codec is in the list of
            // allowed codecs in a room. With respect to the point (2) above,
            // refer to the text in janus.plugin.videoroom.jcfg for more details
            sfutest.value.send({ message: publish, jsep });
        },
        error(error) {
            Janus.error("WebRTC error:", error);
            console.log("WebRTC error:", error);
            if (audioSend) {
                publishOwnFeed(false);
            } else {
                Janus.log("****** function publishOwnFeed");

                // if 문으로 Permission dismissed 일 경우 마이크 또는 비디오가 허용되지 않았습니다.
                if (
                    error.message == "Permission dismissed" ||
                    error.message == "Permission denied"
                ) {
                    alert(
                        "마이크 또는 비디오가 허용되지 않았습니다. \n마이크 또는 비디오를 허용 후에 다시 통화 하시기 바랍니다.",
                    );

                    // 통화 종료 처리
                    callStore.setHangupCallingConfirmFlag(true);
                    return;
                }

                alert("WebRTC error... " + error.message);

                $("#publish")
                    .removeAttr("disabled")
                    .click(function () {
                        publishOwnFeed(true);
                    });
            }
        },
    });
}
// 오디오 mute on/off 함수
function toggleMute() {
    let muted = sfutest.value.isAudioMuted();
    Janus.log((muted ? "Unmuting" : "Muting") + " local stream...");
    if (muted) sfutest.value.unmuteAudio();
    else sfutest.value.muteAudio();
    muted = sfutest.value.isAudioMuted();
    $("#mute").html(muted ? "Unmute" : "Mute");
}
// 파일 송신
function fileSend(result) {
    //

    // 송신자가 파일을 받을지 물어볼 때
    if (result == 2) {
        const remoteDeviceId = commonStore.fileReceiver;
        console.log("fileSend 시", remoteDeviceId);

        const file = commonStore.sendFileData[0];
        console.log(
            `*** methods: fileSend - file is ${[
                file.name,
                file.size,
                file.type,
                file.lastModified,
            ].join(" ")}`,
        );

        const obj = {
            localdeviceid: loginStore.m_local_deviceid,
            remotedeviceid: commonStore.fileReceiver,
            filename: file.name,
            filetype: file.type,
            filelength: file.size,
            HQCapture: 0, // 2021-08-30 추가 0 - false
        };
        const json = JSON.stringify(obj);
        signallingSocket.emit("fileTransfer", json);
        console.log("*** socket: emit fileTransfer. json: " + json);

        //- 송신중 메세지 index 설정 - addChatFileSendMessage()에서 chattingFileSendIndex.value 값 사용
        chattingFileSendIndex.value = chattingStore.chattingMessageList.length;

        // 채팅창에 파일 송신중 메세지 추가 (1)
        addChatFileSendMessage(userListGetNickname(remoteDeviceId), 1, "");

        // 송신 중 채팅 인덱스 저장 -ksy
        chattingFileSendIndex.value = chattingStore.chattingMessageList.length - 1;

        // 송신자 측 채팅인덱스 및 파일 정보 저장
        const rfidIndex = findFeedsIndexDeviceid(commonStore.fileReceiver);
        const status = commonStore.userListStatus[rfidIndex].status;
        const name = commonStore.userListStatus[rfidIndex].text;

        callingLayoutChange(status, name, rfidIndex);

        /* 송신자측 PC 파일 관련 정보 저장-ksy
					index: 수신자 index
					fileSendInfo: {
						fileChatIndex: 송신중 메세지 index 저장
						fileReceiveNickname: 수신자 이름 저장
					}*/
        commonStore.setFileSendInfo({
            index: rfidIndex,
            fileSendInfo: {
                fileChatIndex: chattingFileSendIndex.value,
                fileReceiveNickname: commonStore.fileReceiver,
            },
        });
    }
    // 수락했을 때
    else if (result == 3) {
        console.log("파일수락 시 ", feeds.value, receiveFileResFlag.value);
        // 송신자가 보낸 파일을 수락 클릭했을 경우 송신자이름으로 index 조회- ksy
        const rfidIndex = findFeedsIndexNickname(
            receiveFileResFlag.value.selectedUserName,
        );
        let rfdeviceid = feeds.value[rfidIndex].rfdeviceid;
        // console.log("*** methods: fileSend - 수락했을 때, remote deviceid = " + rfdeviceid)
        // console.log("*** methods: fileSend - fileReceiver handleId = " + feeds.value[rfidIndex].rfid)
        // console.log("*** methods: fileSend - fileReceiver handleId = " + myid.value.value)
        // status : 0 Decline, 1 Access

        const obj = {
            localdeviceid: loginStore.m_local_deviceid,
            remotedeviceid: rfdeviceid, //-ksy
            status: 1,
            // handleId: myid.value
            handleId: feeds.value[rfidIndex].rfid,
        };
        const sendJson = JSON.stringify(obj);
        signallingSocket.emit("fileReceiver", sendJson);
        console.log("*** socket: emit fileReceiver. json: " + sendJson);

        // 송신 진행률 -ksy 주석
        // 내 화면 수신중으로 변환하기.
        // callingLayoutChange(result, sessionStorage.getItem("m_nickname"), 0)
        // 보낸 사용자 화면을 수신중으로 변환하기.
        callingLayoutChange(
            result,
            commonStore.userListStatus[rfidIndex].text,
            rfidIndex,
        );

        /* HQ Capture 중이 아닐 경우에만 메세지 출력 - 분기처리 */
        if (!callStore.HQCaptureFlag) {
            // 채팅창에 파일 수신중 메세지 추가 (2) -ksy 주석
            // const sendFileNickname =
            //  chattingStore.chattingMessageList[
            //      chattingFileSendIndex.value
            //  ].nickname

            // 수신중 채팅 인덱스 저장 addChatFileSendMessage(송신자 이름, 2, 송신자 인덱스, 파일 채팅인덱스) - ksy
            const fileChatIndex =
                commonStore.userListStatus[rfidIndex].fileReceiveInfo.fileChatIndex;
            addChatFileSendMessage(
                commonStore.userListStatus[rfidIndex].text,
                2,
                rfidIndex,
                fileChatIndex,
            );

            // 하단 정렬일 경우에만
            // callingLayout 4 하단 레이아웃 default 버튼 변경
            // callStore.setUnderStatus", 0)
            setInitUnderStatus(0);
        }
    } else if (result == 4) {
        // 거절했을 때
        // 송신자가 보낸 파일을 거절 클릭했을 경우 송신자이름으로 index 조회- ksy
        const rfidIndex = findFeedsIndexNickname(
            receiveFileResFlag.value.selectedUserName,
        );
        let rfdeviceid = feeds.value[rfidIndex].rfdeviceid;

        if (
            commonStore.fileSendStatus == 2 ||
            commonStore.fileSendStatus == 3 ||
            commonStore.fileSendStatus == 6
        ) {
            // 내 callingWIndow 상태가 파일 송수신 진행중이면 return
            // 내 callingWindow 상태가 파일 송수신 진행중이 아닐 경우만.
            if (
                commonStore.userListStatus[0].status == 2 ||
                commonStore.userListStatus[0].status == 3
            ) {
                return;
            } else {
                // 내 화면을 비디오로 변경
                // callingLayoutChange("attach", sessionStorage.getItem("m_nickname"), 0)
                // $("#myvideo").show()
                // 송신자 화면을 비디오로 변환
                callingLayoutChange(
                    "attach",
                    commonStore.userListStatus[rfidIndex].text,
                    rfidIndex,
                );
                $("#remotevideo" + rfidIndex).show();
                $("#panel-inner" + rfidIndex).show();
                return;
            }
        }

        // 거절했을 때 파일 수신 거절 전송
        console.log("*** methods: fileSend - 거절했을 경우");
        // console.log(
        //  "*** methods: fileSend - fileReceiver handleId = " +
        //      feeds.value[rfidIndex].rfid
        // )
        console.log("*** methods: fileSend - fileReceiver handleId = " + myid.value);

        // status : 0 Decline, 1 Access
        const obj = {
            localdeviceid: loginStore.m_local_deviceid,
            remotedeviceid: rfdeviceid, //ksy
            status: 0,
            // handleId: myid.value
            handleId: feeds.value[rfidIndex].rfid,
        };
        const sendJson = JSON.stringify(obj);
        signallingSocket.emit("fileReceiver", sendJson);
        console.log("*** socket: emit fileReceiver. json: " + sendJson);

        // 채팅창에 파일 수신 거절 메세지 추가 (4)
        // fileChatIndex - 수락/거절 채팅 index
        const fileChatIndex =
            commonStore.userListStatus[rfidIndex].fileReceiveInfo.fileChatIndex;
        const sendFileNickname =
            chattingStore.chattingMessageList[fileChatIndex].nickname;
        // 수락/거절창 -> 거절 메시지로 변경- ksy
        addChatFileSendMessage(sendFileNickname, 4, rfidIndex, fileChatIndex);

        // 파일 송수신 초기화
        fileReceiveReset(feeds.value[rfidIndex].rfdeviceid, rfidIndex);

        // 하단 정렬일 경우에만
        // callingLayout 4 하단 레이아웃 default 버튼 변경
        // callStore.setUnderStatus", 0)
        setInitUnderStatus(0);
    }
    // 수신측 PC에서 파일수신 flow 끝나고 초기화 - ksy
    commonStore.setReceiveFileResFlag({ flag: false, selectedUserName: "" });
}
// 비디오 mute 함수
function muteVideoCustom() {
    console.log("*** methods: muteVideoCustom", commonStore.fileSendStatus);

    sfutest.value.muteVideo();

    // $("#videolocal").html(
    //  '<div class="row justify-center items-center" style="background-color: #151515; width: 100%; height: 100%; padding-bottom: 30px; "><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADQAAAA0CAYAAADFeBvrAAAABHNCSVQICAgIfAhkiAAABntJREFUaEPNWktsW1UQPWM7dR3iWCm1Yuw0aUVbGlRA6qYVRaJsEItKIDaAyqbiv0AVEhJ0wU+qRCs2VCwKiK6gQBESLWLDAonyEVRdgCoQTegnaWInbpomlpM4TmIPHPMcbMf2e/fZrjLSU6K8uTNz7sy998x9ETRRVLULwCMA7gZwm/VErZ/0NAYgYf3k7+cBnBKRqWaFIY0aUtU+AI8CeBjAfQC8hjZzAH4EcBrAVyIybDi+TN01IFW9E8ARAHsbCaDK2G8AHBSRP9zYNQakqr0ADgHYB8DjxqmDMXkAJwC8LiJDDvSXVYwAqeozAI4CCJg4aUA3A+BFETnu1IYjQKp6C4BPrAXv1HYz9b4EsF9EZuyM2gJS1R0AvgBwu52xFr//m5uP3dqqC0hVX7IWfluLg3Vq3rYEawJS1V0AfgCwWsAUQS8CeEBEfq42C1UBqWoMwO8A1judulK9xcVFpNNpTE9PI5vNlpnweDwIBoPLjxv7ACYA7BCR0crxKwCpahDAT9Zpb+SPQCYmJpBKpRyNa2trQzgcRigUcqRfofQbgHtFZL7079UAHQbwiqmH+fl5DA8PI5/nEWImBBSNkiEZyxERebUmIOvQHATgNzHNjCQSpGjuxe/3Y+PGjWBJGgizs62ULpVlSFU/B/CYgUE0kplKPy4zdVJEHi/aWgakqjsB/GoChroXL14E106zhKXnYk1tF5E/GUMpoO8B3G8SGDeA69evmwyx1WXJbdmyxbT0vhWRh5YBqeo2AH/ZeqtQGBgYcLUJ2Pnp7u7GunXr7NQq3/eLyIVChlSVO8XbJhbm5uYKu1orpL29HX19bLOMhC3H4SIgrh2uIcfSinIrdd7f3+84FkvxrIjsElWNWG2xLVEt9TAyMoKZGVvyaxrUsv6mTZuwdu1ak/EKIEZAzwM4ZjKSuiw3ll2rhCXH0jOU/QT0PoDnDAeuVkAfENAp64LDCBOZgVPOZmTYUt68eTPI9QzlNAEZbwh0sgo3BYZ1loB4CWG8R5LyXLlyxXACnal3dHRgw4YNzpTLtQYIiATPiIwWbTSb9hTtuqQ/HJ4ioGkArhqSZrDsyjRw3XD9uJQCoAsA7nBpAJcvX17Rlbq1xXE9PT2FbtalFErOmJSWOiPTJig3jV1l0ORv5HENyBkCMu6BKh02oydy2QtVhnKSgN4FcKCBWSkMZaZIhyovRZzYdcmuq5k+SkDs9j5z4rioMzs7i2QyWbgHqORbPJ9u3LjhqARJbQim0kY8Hi/0Q3xn2JI/QUCdALjTOSKnpQxBRNDb27uCc3E9ETSvspi54lPkZlz0/L0a+RwdHS2Mo3i93sIm4ZDTkZyGHLcPqoqrV6+uIKQExZns6uK3LvdC0JysaoSXhywPWxv5r32gkpMGb2hoCJkMb2KrSyAQKJTgmjVr7ByveM82nqVaTxyAKmvw6rbg165dw+TkpKNAWR4sqc7OTvh8vppj2EuxtPjkcvyIV1+4lnjgsgxryP8tuJWlqucRs8LsuBGWIwPgw4AYePFxY68OxzsjIntos/TWZ7d1BVzm69KlS1hYWHDjvyVjYrFYIfsVwivhX8oAWVkq641YZiy31SQsY5Yes2/JaRHhl/eCVN6cbre+OnhZGmTTzaA0zZ4QXvCvX1/4MMLFd0/xknEFICtLbwJ4w2QjaHbAdva4Hrdu3cosvSUijHdZqn194GH79eDg4N7VmJ1i5NFo9FwoFNopIjxQawPim3Q6HR4bG0ssLS3V3nftprGF730+31JXV1dfOBxe8cmjJt1JJpP7pqamPs7n844oUQvjLzPt8Xi0s7PzyWg0+mk1n3WDjcfjH6VSqaduVrBO/IRCoeOxWOzpWrq2sz8+Pv5sKpU6lsvljL5EOQnORMfr9eZDodALkUjkw3rjbAFxcDKZ3J1Op79bWFhwdZliEng1Xb/fP9fR0fFgd3d31S/ftptCNaMjIyOxXC53bm5ujv82dtOkvb19zOfz3dXT0+OITDrKUGn0iUTiUCaTOZDNZm35fCOo/X7/bCAQeC8ajR40sWMMqGg8kUgQ1GuZTOZWE4d2uoFAYDIQCByKRCK8GjAW14CKnuLxOEnty9lsdk82mw2pqpFNHox+vz/V1tZ2xuPxvBOLxWzXScObgtNp4oHs9Xr3iQj/RTOSz+e7RSSsqmHaEJEJVZ3weDxJAOOqej6Xy50IBoP1uzunAfyr9w+YOZifVwIdWQAAAABJRU5ErkJggg=="></div>'
    // )
    // 내 화면을 비디오 Mute 로 변경
    callingLayoutChange("unpublished", sessionStorage.getItem("m_nickname"), 0);

    // if(commonStore.userListStatus[0].status == 2 || commonStore.userListStatus[0].status == 3) {
    //  callStore.setPreviousWorking", "fileReceiving")
    // }
    // 파일 수신 중인 경우 수신창화면을 끄지않는다. -ksy(임시코드)
    // if(commonStore.fileSendStatus !== 3) {
    //  callingLayoutChange("unpublished", sessionStorage.getItem("m_nickname"), 0)
    //  callStore.setPreviousWorking", "unpublished")
    // }

    // 화면 공유 중지 후 video OFF 일 경우 myvideo가 생성 전에 실행되므로 setTimeout 실행 (1초여야만 숨김 가능,, 그전 까지 돔 생성 안됌)
    if (callStore.myVideoStatus == "videoOFF") {
        //
        setTimeout(function () {
            $("#myvideo").hide();

            // 나의 비디오 상태 초기화
            callStore.setMyVideoStatus("");
        }, 1500);
    } else {
        $("#myvideo").hide();
    }

    if (callStore.videoMainIndex == 0) {
        mainVideoChangeFunc(0, "localstream");
    }

    // signalling socket video off emit
    const obj = {
        rfid: myid.value,
        status: 0,
    };
    const json = JSON.stringify(obj);
    signallingSocket.emit("videoOnOff", json);
    console.log("*** socket: emit videoOnOff. json: " + json);
}
// 비디오 unmute 함수
function unmuteVideoCustom() {
    console.log("*** methods: unmuteVideoCustom", commonStore.userListStatus[0].status);
    // if(commonStore.userListStatus[0].status !== 2 && commonStore.userListStatus[0].status !== 3) {
    //  console.log("타면안됨")
    //  callingLayoutChange("attach", sessionStorage.getItem("m_nickname"), 0)
    //  $("#myvideo").show()
    //  // callStore.setPreviousWorking", "attach")
    // }

    // if (callStore.previousWorkingStatus !== "") {

    // }
    // 내 화면을 비디오로 변경
    callingLayoutChange("attach", sessionStorage.getItem("m_nickname"), 0);
    $("#myvideo").show();

    if (callStore.videoMainIndex == 0) {
        mainVideoChangeFunc(1, "localstream");
        $("#videoMainCaption").html(sessionStorage.getItem("m_nickname"));
    }

    sfutest.value.unmuteVideo();

    // signalling socket video on emit
    const obj = {
        rfid: myid.value,
        status: 1,
    };

    const json = JSON.stringify(obj);
    signallingSocket.emit("videoOnOff", json);
    console.log("*** socket: emit videoOnOff. json: " + json);
}
// 일정 시간 간격으로 main video.srcObject 의 값이 있는지 체크.
function main_stream_check() {
    // console.log("----- cunstom.js : function main_stream_check2 -----");
    const mainVideo = document.getElementById("videoMain");

    if (!mainVideo) {
        if (commonStore.callingLayoutType != 1) {
        } else if (commonStore.callingLayoutType == 1) {
            // 바둑판일 경우에 메인으로 선택된 사용자가 나갔는지 체크한다.
            // 나갔을 경우 다른 사용자로 메인을 변경한다.

            // mainIndex를 가져온다.
            const mainIndex = callStore.videoMainIndex;
            let mainRemoteDom = "";

            // mainIndex가 자신일 경우
            if (mainIndex == 0) {
                // console.log("mainIndex가 자신이다.")
                mainRemoteDom = document.getElementById("myvideo");
            } else {
                // mainIndex가 다른사용자일 경우
                // console.log("mainIndex가 다른사용자이다.")
                mainRemoteDom = document.getElementById("remotevideo" + mainIndex);
            }

            if (mainRemoteDom != null) {
                // console.log("mainRemotedom이 존재한다.")
                if (mainRemoteDom.srcObject == null) {
                    // console.log("mainRemotedom의 srcObject가 없다. 즉 사용자가 나갔다.")
                    setting_main_video();
                } else {
                    // eslint-disable-next-line no-lonely-if
                    if (mainRemoteDom.srcObject.active == false) {
                        // console.log("----- remote 화면의 사용자가 나갔다. (검정 화면)")
                        setting_main_video();
                    } else {
                        // console.log("----- main 화면에 정상적으로 나온다")
                    }
                }
            } else {
                // mainDom이 없을 경우에 메인 사용자가 나간 것으로 간주한다.
                setting_main_video();
            }
        }
        return;
    }

    // main 화면이 없는 상태라면 접속해있는 remote가 있는지 체크하여 있다면 넣어주고, 없다면 pass.
    if (mainVideo.srcObject == null) {
        // console.log("----- main 화면에 아무것도 재생되고 있지 않다. (흰 화면)");
        insert_main_video(mainVideo);
    } else {
        // console.log("----- main 화면에 무언가 재생되고 있거나, 재생되었었다.")
        // eslint-disable-next-line no-lonely-if
        if (mainVideo.srcObject.active == false) {
            // console.log("----- main 화면의 remote가 나갔다. (검정 화면)")
            insert_main_video(mainVideo);
        } else {
            // console.log("----- main 화면에 무언가 재생되고 있다.");
        }
    }
}
// main_video에 mediaStream을 넣어주는 과정
function insert_main_video(mainVideo) {
    // console.log("*** methods: insert_main_video")
    // 화면 공유 또는 드로잉일 경우 자신이 메인이다.
    if (commonStore.isShare == true || commonStore.isDrawing == true) {
        if (mainVideo != null && $("#myvideo")[0] != null) {
            mainVideo.srcObject = $("#myvideo")[0].srcObject;
            $("#videoMainCaption").html(sessionStorage.getItem("m_nickname"));
            // Main Index 관리
            callStore.setVideoMainIndex(0);
            return;
        }
    }

    let i = 0;

    // currentRoomCount = 방안의 사용자 수
    for (i = 1; i < currentRoomNumberCount.value; i++) {
        const remoteTemp = document.getElementById("remotevideo" + i);

        // remotevideo N을 반복하며 해당 엘리먼트가 있다면 해당 video를 넣어준다.
        if (remoteTemp != null) {
            // videoMain Index가 자신일 경우
            if (callStore.videoMainIndex == 0) {
                console.log("*** methods: insert_main_video - mainIndex = 자신");

                const localVideo = document.getElementById("myvideo");
                mainVideo.srcObject = localVideo.srcObject;

                // 자신의 이름 받아오고 Main에 넣어주기
                $("#videoMainCaption").html(sessionStorage.getItem("m_nickname"));

                // Main Index 관리
                callStore.setVideoMainIndex(callStore.videoMainIndex);

                // 다른 사용자에게 호스트가 바라보는 비디오가 바뀌었음을 알림.
                console.log("hostSelectedMainVideo 1");
                if (videoCallHost.value) {
                    hostSelectedMainVideo(myid.value);
                }

                // border Color Change
                mainVideoBorder(callStore.videoMainIndex);

                // videoOFF 일 경우 예외처리 mainVideo Change
                mainVideoChangeFunc("localstream", 1);
            } else if (
                // LayoutChange 시 MainIndex가 없다면 Main Index = 1 설정 (ex: 바둑판 -> 하단정렬 이동 시 예외처리)
                // MainIndex 존재, Feeds 존재 한다면 VideoMain으로 보여준다.
                callStore.videoMainIndex != "" &&
                feeds.value[callStore.videoMainIndex] != null &&
                callStore.videoMainIndex == i
            ) {
                // LayoutChange 시 MainIndex가 있다면, Main Image를 변경하고 for문을 멈춘다.
                console.log("*** methods: insert_main_video - MainIndex exist.");
                // console.log("MainIndex 존재한다.")
                // console.log(
                //  "remotevideo" +
                //      callStore.videoMainIndex +
                //      "의 영상이 main으로 들어온다."
                // )
                mainVideo.srcObject = remoteTemp.srcObject;

                // remote의 이름 받아오고 Main에 넣어주기
                const remoteCaption = $(
                    "#remoteCaption" + callStore.videoMainIndex,
                ).text();
                // console.log("remoteCaption = " + remoteCaption)

                $("#videoMainCaption").html(remoteCaption);

                // Main Index 관리
                callStore.setVideoMainIndex(callStore.videoMainIndex);

                // border Color Change
                mainVideoBorder(i);

                // videoOFF 일 경우 예외처리
                if (
                    commonStore.userListStatus[callStore.videoMainIndex].status ==
                    "unpublished"
                ) {
                    // videoOFF 일 경우 예외처리 mainVideo Change
                    mainVideoChangeFunc(0, remoteCaption);
                } else {
                    // videoON 일 경우 예외처리 mainVideo Change
                    mainVideoChangeFunc(1, remoteCaption);
                }

                // 다른 사용자에게 호스트가 바라보는 비디오가 바뀌었음을 알림.
                console.log("hostSelectedMainVideo 2");
                if (videoCallHost.value) {
                    hostSelectedMainVideo(feeds.value[i].rfid);
                } else {
                    let curMainVideoZoomLevel =
                        commonStore.userListStatus[callStore.videoMainIndex].zoomLevel;
                    document.getElementById("videoMain").style.scale =
                        `${100 * curMainVideoZoomLevel}%`;
                }

                break;
                // VideoMainIndex 가 null일 경우 처음 사용자를 보여준다.
            } else if (callStore.videoMainIndex == "") {
                console.log("*** methods: insert_main_video - videoMainIndex Null ");
                // console.log("remotevideo" + i + "의 영상이 main으로 들어온다.")
                mainVideo.srcObject = remoteTemp.srcObject;

                // remote의 이름 받아오고 Main에 넣어주기
                const remoteCaption = $("#remoteCaption" + i).text();
                // console.log("remoteCaption = " + remoteCaption)

                $("#videoMainCaption").html(remoteCaption);

                // Main Index 관리
                callStore.setVideoMainIndex(i);

                // border Color Change
                mainVideoBorder(i);

                // 다른 사용자에게 호스트가 바라보는 비디오가 바뀌었음을 알림.
                console.log("hostSelectedMainVideo 3");
                if (videoCallHost.value) {
                    hostSelectedMainVideo(feeds.value[i].rfid);
                }

                break;
                // VideoMainIndex는 존재하지만, Feeds가 Null (현재 나간상태)일 경우 처음 들어온 사람을 보여준다.
            } else if (
                callStore.videoMainIndex != "" &&
                feeds.value[callStore.videoMainIndex] == null
            ) {
                console.log(
                    "*** methods: insert_main_video - videoMainIndex 존재하지만 현재 나간 상태.",
                );
                // console.log("remotevideo" + i + "의 영상이 main으로 들어온다.")
                mainVideo.srcObject = remoteTemp.srcObject;

                // remote의 이름 받아오고 Main에 넣어주기
                const remoteCaption = $("#remoteCaption" + i).text();
                // console.log("remoteCaption = " + remoteCaption)

                $("#videoMainCaption").html(remoteCaption);

                // Main Index 관리
                callStore.setVideoMainIndex(i);

                // border Color Change
                mainVideoBorder(i);

                // videoOFF 일 경우 예외처리 mainVideo Change
                mainVideoChangeFunc(1, remoteCaption);

                // 다른 사용자에게 호스트가 바라보는 비디오가 바뀌었음을 알림.
                console.log("hostSelectedMainVideo 4");
                if (videoCallHost.value) {
                    hostSelectedMainVideo(feeds.value[i].rfid);
                }

                break;
            }
        }

        // 상대방이 없을 경우 자신의 화면을 보여준다.
        if (i == currentRoomNumberCount.value - 1) {
            if ($("#myvideo").length === 0) {
                // console.log("----- main 화면에 넣어줄 remote 가 아무도 없다.")
                $("#videoMainCaption").html("");
            } else {
                if (commonStore.isVideo) {
                    // videoOFF 일 경우 예외처리 mainVideo Change
                    mainVideoChangeFunc(0, "localstream");
                } else {
                    mainVideoChangeFunc(1, "localstream");
                }
                // 파일 송신중에 퇴장했을 경우

                // 파일 수신중에 퇴장했을 경우

                // 다른 사용자에게 호스트가 바라보는 비디오가 바뀌었음을 알림.
                console.log("hostSelectedMainVideo 5");
                if (videoCallHost.value) {
                    hostSelectedMainVideo(myid.value);
                }

                mainVideo.srcObject = $("#myvideo")[0].srcObject;
                $("#videoMainCaption").html(sessionStorage.getItem("m_nickname"));
                // Main Index 관리
                callStore.setVideoMainIndex(0);
            }
        }
    }
}
// 바둑판 레이아웃에서 이전 메인 사람이 나갔으므로 다른 사용자로 메인을 변경해주는 함수
function setting_main_video() {
    // currentRoomCount = 방안의 사용자 수
    for (let i = 1; i < currentRoomNumberCount.value; i++) {
        const remoteTemp = document.getElementById("remotevideo" + i);

        // remotevideo N을 반복하며 해당 엘리먼트가 있다면 해당 video를 넣어준다.
        if (remoteTemp != null) {
            // videoMain Index가 자신일 경우
            if (callStore.videoMainIndex == 0) {
                console.log("*** methods: setting_main_video - mainIndex = 자신");

                // Main Index 관리
                callStore.setVideoMainIndex(callStore.videoMainIndex);

                // 다른 사용자에게 호스트가 바라보는 비디오가 바뀌었음을 알림.
                console.log("hostSelectedMainVideo 6");
                if (videoCallHost.value) {
                    hostSelectedMainVideo(myid.value);
                }

                // border Color Change
                mainVideoBorder(callStore.videoMainIndex);
            } else if (
                // LayoutChange 시 MainIndex가 없다면 Main Index = 1 설정 (ex: 바둑판 -> 하단정렬 이동 시 예외처리)
                // MainIndex 존재, Feeds 존재 한다면 VideoMain으로 보여준다.
                callStore.videoMainIndex != "" &&
                feeds.value[callStore.videoMainIndex] != null &&
                callStore.videoMainIndex == i
            ) {
                // LayoutChange 시 MainIndex가 있다면, Main Image를 변경하고 for문을 멈춘다.
                console.log("*** methods: setting_main_video - MainIndex exist.");

                // Main Index 관리
                callStore.setVideoMainIndex(callStore.videoMainIndex);

                // border Color Change
                mainVideoBorder(i);

                // 다른 사용자에게 호스트가 바라보는 비디오가 바뀌었음을 알림.
                console.log("hostSelectedMainVideo 7");
                if (videoCallHost.value) {
                    hostSelectedMainVideo(feeds.value[i].rfid);
                }

                break;
                // VideoMainIndex 가 null일 경우 처음 사용자를 보여준다.
            } else if (callStore.videoMainIndex == "") {
                console.log("*** methods: setting_main_video - videoMainIndex Null ");

                // Main Index 관리
                callStore.setVideoMainIndex(i);

                // border Color Change
                mainVideoBorder(i);

                // 다른 사용자에게 호스트가 바라보는 비디오가 바뀌었음을 알림.
                console.log("hostSelectedMainVideo 8");
                if (videoCallHost.value) {
                    hostSelectedMainVideo(feeds.value[i].rfid);
                }

                break;
                // VideoMainIndex는 존재하지만, Feeds가 Null (현재 나간상태)일 경우 처음 들어온 사람을 보여준다.
            } else if (
                callStore.videoMainIndex != "" &&
                feeds.value[callStore.videoMainIndex] == null
            ) {
                console.log(
                    "*** methods: setting_main_video - videoMainIndex 존재하지만 현재 나간 상태.",
                );

                // Main Index 관리
                callStore.setVideoMainIndex(i);

                // border Color Change
                mainVideoBorder(i);

                // 다른 사용자에게 호스트가 바라보는 비디오가 바뀌었음을 알림.
                console.log("hostSelectedMainVideo 9");
                if (videoCallHost.value) {
                    hostSelectedMainVideo(feeds.value[i].rfid);
                }

                break;
            }
        }

        // 상대방이 없을 경우 자신의 화면을 보여준다.
        if (i == currentRoomNumberCount.value - 1) {
            if ($("#myvideo").length === 0) {
                // console.log("----- main 화면에 넣어줄 remote 가 아무도 없다.")
                // $("#videoMainCaption").html("")
            } else {
                console.log(
                    "*** methods: setting_main_video - 방에 아무도 없으므로 자신이 메인",
                );
                // 다른 사용자에게 호스트가 바라보는 비디오가 바뀌었음을 알림.
                console.log("hostSelectedMainVideo 10");
                if (videoCallHost.value) {
                    hostSelectedMainVideo(myid.value);
                }

                // Main Index 관리
                callStore.setVideoMainIndex(0);
            }
        }
    }
}
// 자신의 모니터 화면을 공유하는 기능 type = true 모니터 화면 공유, type = false 카메라 영상 공유
function screenShare(type) {
    console.log("*** methods: screenShare");
    // console.log("****** 화면 공유 플래그 type = ", type)
    //
    console.log("globalVideoSend.value = ", globalVideoSend.value);
    console.log("globalAudioSend.value = ", globalAudioSend.value);

    // const useAudio = true
    const useAudio = globalAudioSend.value;
    let videoOrScreen = "stdres-16:9"; // 영상을 stdres로 보여주는지 hires로 보여주는지 전역 변수로 사용되면 좋을 듯 하다.

    if (type) {
        videoOrScreen = "screen";
        // console.log("공유한다.")
    } else {
        // 전역으로 관리되는 카메라 장치 값이 true 라면 카메라 공유를 하겠지만, false라면 video None을 사용
        if (globalVideoSend.value) {
            videoOrScreen = "stdres-16:9";
        } else {
            videoOrScreen = "videoNone";
        }
        // console.log("공유하지 않는다.")

        if (myVideoCheckInterval.value != null) {
            // console.log("****** Interval이 null이 아니다. clear 해준다.")
            clearInterval(myVideoCheckInterval.value); // 자기 자신 인터벌 클리어
        }

        /* 21-07-26 드로잉 관련 기능 분리 */
        // // drawing 일 경우 공유 중지 클릭 시
        // // 드로잉 숨김 및 드로잉 버튼 변경
        // if (commonStore.isDrawing) {
        //  commonStore.isDrawing")
        // }

        // 화면 공유 전 나의 상태가 video OFF 였다면 videoOFF 상태로 돌려주기.
        if (callStore.myVideoStatus == "videoOFF") {
            commonStore.setIsVideo();
        }
    }

    // mic가 off일 경우 mic 음소거 처리
    let replaceAudioResult = "";
    if (commonStore.isSounded) {
        replaceAudioResult = false;
    } else {
        replaceAudioResult = true;
    }
    console.log("createOffer 전 globalVideoSend.value = ", globalVideoSend.value);
    sfutest.value.createOffer({
        media: {
            audioRecv: false,
            videoRecv: false,
            audioSend: useAudio,
            // videoSend: true,
            videoSend: globalVideoSend.value,
            replaceAudio: replaceAudioResult, // peer 재협상 시 true 필요 -> 원래는 true였으나 현재내 마이크 상태에 따라 true false 설정 으로 변경  20210426 : ksh
            replaceVideo: true, // peer 재협상 시 true 필요
            video: videoOrScreen, // screen 공유 시 "screen"
            // =>kyj
            data: true,
            selectedMicID: commonStore.selectedMicID,
            selectedCamIndex: commonStore.selectedCamIndex,
            // <=kyj
        },
        success(jsep) {
            Janus.debug("Got publisher SDP!", jsep);
            const publish = {
                request: "configure",
                audio: useAudio,
                video: true,
            };

            sfutest.value.send({ message: publish, jsep });

            if (type) {
                console.log(" type == true !!");
                // 내 자신이 videoOFf 일 경우 MyVideoStatus를 videoOFF로 저장하고,
                // 현재 비디오를 attach로 변경한다.
                // 저장하는 이유는, 화면공유를 종료할 때 MyVideoStatus가 videoOFF이면 자신의 카메라 비디오 오프를 해주기 위해서.
                const hostSelectedMainIndex = callStore.videoMainIndex;
                if (hostSelectedMainIndex == 0) {
                    // video가 Off일 경우 비디오를 켜준다. - 임시
                    if (commonStore.isVideo == true) {
                        callStore.setMyVideoStatus("videoOFF");
                        commonStore.setIsVideo();
                    }
                } else {
                    // 다른사용자(videoOFF상태)가 메인인 경우 - 호스트가 화면 공유를 시작할 때 videoOFF화면이 사라지지않는 버그 처리 ksy
                    mainVideoChangeFunc(
                        1,
                        commonStore.userListStatus[hostSelectedMainIndex].text,
                    );
                }

                const beforeMainIndex = callStore.videoMainIndex;
                // main Index 변경
                callStore.setVideoMainIndex(0);

                // video Layout Type Change
                if (commonStore.callingLayoutType != 3) {
                    // videolayout change
                    saveVideoInfo();
                } else {
                    const mainIndex = callStore.videoMainIndex;
                    let video = "";
                    if (mainIndex == 0) {
                        video = document.getElementById("myvideo");

                        const mainVideo = document.getElementById("videoMain");
                        mainVideo.srcObject = video.srcObject;
                        $("#videoMainCaption").html(sessionStorage.getItem("m_nickname"));

                        mainVideoBorder(mainIndex);
                    } else {
                        video = document.getElementById("remotevideo" + mainIndex);

                        const mainVideo = document.getElementById("videoMain");
                        mainVideo.srcObject = video.srcObject;
                        $("#videoMainCaption").html(feeds.value[mainIndex].rfdisplay);

                        // main border 생성
                        mainVideoBorder(mainIndex);
                        // location.reload()
                    }
                }

                // mainVideo Change Duration 보내기
                // hostSelected 호출
                console.log("hostSelectedMainVideo 10");
                hostSelectedMainVideo(myid.value);

                // 모니터 공유 시에만 interval.value 생성
                myVideoCheckInterval.value = setInterval(function () {
                    // console.log("*** methods: screenShare - make Interval")
                    // if ($("#myvideo")[0].srcObject.getTracks()[1] != undefined) {
                    if ($("#myvideo")[0] != null) {
                        // console.log(
                        //  "readyState = ",
                        //  $("#myvideo")[0].srcObject.getTracks()[1].readyState
                        // )

                        // 영상 공유 시 생성되는 창에서 '공유 중지' 클릭 시 ~~readyState = ended가 된다.
                        // 마이크 장치 없이 모니터 공유하는 경우도 발생
                        // 오디오미디어스트림이 없으니 [1]를 찾을 수 없다는 error 발생
                        // srcObject.getTracks()[1]이 아니라 srcObject.getVideoTracks() 로 바꾼다.
                        if (
                            // $("#myvideo")[0].srcObject.getTracks()[1].readyState ==
                            $("#myvideo")[0].srcObject.getVideoTracks()[0].readyState ==
                            "ended"
                        ) {
                            commonStore.setIsShare(); // side bar 영상공유 버튼 값 변경
                            // screenShare(false);             // 모니터 공유 -> 내 카메라 영상 공유

                            /* 21-07-26 드로잉 관련 기능 분리 */
                            // // drawing 일 경우 공유 중지 클릭 시
                            // // 드로잉 숨김 및 드로잉 버튼 변경
                            // if (commonStore.isDrawing) {
                            //  commonStore.isDrawing")
                            // }
                        }
                    } else {
                        console.log(" type == false !!");
                    }
                }, 1000);

                // console.log("반짝반짝 효과 끄기")
                // clearInterval(callDivInterval)
                // const callDiv = document.getElementById("callDiv")
                // callDiv.style.border = "none"

                // 문서공유 알림
                requestScreenSharing();

                // 1번레이아웃에서 다른사용자가 메인일 때 드로잉을 시작한경우 3번레이아웃으로 바뀌면서
                // 호스트가 메인이되며 기존 메인이였던 사용자의 화면 비율을 원래대로 돌려야한다.
                if (beforeMainIndex == 0) {
                    // console.log(document.getElementById("myvideo"))
                    document.getElementById("myvideo").style.scale = 1;
                } else if (beforeMainIndex !== 0 && feeds.value.length !== 0) {
                    // console.log(document.getElementById("remotevideo" + beforeMainIndex))
                    document.getElementById("remotevideo" + beforeMainIndex).style.scale =
                        1;
                }
            } else {
                // console.log("type == false !! ")
                // if (commonStore.isVideo == true) {
                //  commonStore.isVideo")
                // }

                // 화면공유 -> 드로잉으로 이동하는 것이라면 드로잉을 시작해라.
                console.log("screenMoveToDrawing", callStore.screenMoveToDrawing);

                // noneOverlatyAlert에서 화면공유 중 드로잉으로 이동한다는 것을 true로 설정헌다.
                if (callStore.screenMoveToDrawing) {
                    console.log(
                        "screenMoveToDrawing true이기 때문에 drawing을 실행합니다.",
                    );
                    commonStore.setIsDrawing();

                    // noneOverlatyAlert에서 화면공유 중 드로잉으로 이동한다는 것을 변수에 저장한다.
                    // 화면공유 -> 드로잉 이동 시 드로잉 호출 후 초기화
                    callStore.setScreenMoveToDrawing(false);
                }
            }
        },
        error(error) {
            Janus.error("WebRTC error:", error);
            console.log("*** methods: screenShare - WebRTC Error. ", error);
            if (commonStore.isShare) {
                // console.log("어디로 들어오는지 보자. 1")
                // console.log(
                //  "vuex의 값을 수정한다. ",
                //  commonStore.isShare,
                //  " >>> ",
                //  !commonStore.isShare
                // )
                commonStore.setIsShare();
            } else {
                // console.log("어디로 들어오는지 보자. 2")
                screenShare(false);
            }
            // 화면 공유 error 발생 시 내 카메라 영상 공유하는 예외처리
            // publishOwnFeed(true);
        },
    });
}
function unpublishOwnFeed() {
    // Unpublish our stream
    console.log("*** methods: unpublishOwnFeed");
    const unpublish = { request: "unpublish" };
    sfutest.value.send({ message: unpublish });
}
function newRemoteFeed(id, display, audio, video) {
    console.log("*** methods: newRemoteFeed");
    // console.log("****** function newRemoteFeed - id = ")
    // console.log(id)
    // console.log("****** function newRemoteFeed - display = ")
    // console.log(display)
    // console.log("****** function newRemoteFeed - audio = ")
    // console.log(audio)
    // console.log("****** function newRemoteFeed - video = ")
    // console.log(video)

    // A new feed has been published, create a new plugin handle and attach to it as a subscriber
    let remoteFeed = null;

    // 주요 로직
    janus.value.attach({
        plugin: "janus.plugin.videoroom",
        opaqueId: opaqueId.value,
        success(pluginHandle) {
            console.log("*** methods: newRemoteFeed success");
            // console.log(
            //  "****** function newRemoteFeed() - success: function() - pluginHandle = "
            // )
            // console.log(pluginHandle)

            remoteFeed = pluginHandle;
            remoteFeed.simulcastStarted = false;
            Janus.log(
                "Plugin attached! (" +
                    remoteFeed.getPlugin() +
                    ", id=" +
                    remoteFeed.getId() +
                    ")",
            );
            Janus.log("  -- This is a subscriber");
            // We wait for the plugin to send us an offer
            // 입장 요청을 하기 위한 정보를 담아둠.
            const subscribe = {
                request: "join",
                room: myroom.value,
                ptype: "subscriber",
                feed: id,
                private_id: mypvtid.value,
            };
            // In case you don't want to receive audio, video or data, even if the
            // publisher is sending them, set the 'offer_audio', 'offer_video' or
            // 'offer_data' properties to false (they're true by default), e.g.:
            //      subscribe["offer_video"] = false;
            // For example, if the publisher is VP8 and is Safari, let's avoid video
            if (
                Janus.webRTCAdapter.browserDetails.browser === "safari" &&
                (video === "vp9" || (video === "vp8" && !Janus.safariVp8))
            ) {
                if (video) video = video.toUpperCase();
                window.toastr.warning(
                    "Publisher is using " +
                        video +
                        ", but Safari doesn't support it: disabling video",
                );
                subscribe.offer_video = false;
            }
            remoteFeed.videoCodec = video;

            // 방 인원수를 체크하여 동적으로 CallingWindow 생성
            checkRoomNumberCount();

            // 초대 중일 경우 사용자가 들어왔으니 팝업 hide
            if (sessionStorage.getItem("m_inviting") === "true") {
                /* 기존에는 닉네임이였으나, 상대방이 영문일 경우 nickname을 비교할 수 있는 방법이 없으므로, deviceid로 비교 */

                // 기존에는 display 하나 있었으나, display 안에 #구분자로 deviceid를 넣게 되어 getFeedsDisplay function 호출
                const newDeviceid = getFeedsDisplay("deviceid", display);
                // 내가 갖고 있는 통화 상대의 id와 야누스가 갖고 있는 통화 상대의 id가 같을 경우 팝업 hide
                if (sessionStorage.getItem("m_remote_deviceid") == newDeviceid) {
                    sessionStorage.removeItem("m_inviting");

                    // 연락처 목록이 열려있을 경우 연락처 목록 닫기
                    if (callStore.isContactListShow) {
                        callStore.setContactListShow();
                    }

                    // 팝업 닫기
                    // $modal.hide("modal");
                    modalStore.closeModal("call");
                }
            }
            // 입장 요청
            remoteFeed.send({ message: subscribe });
        },
        error(error) {
            Janus.error("  -- Error attaching plugin...", error);
            alert("Error attaching plugin... " + error);
        },
        // 서버로부터 메세지 수신
        onmessage(msg, jsep) {
            console.log("*** methods: newRemoteFeed - onmessage");
            // console.log("****** function newRemoteFeed() - onmessage - msg = ")
            // console.log(msg)
            // console.log("****** function newRemoteFeed() - onmessage - jsep = ")
            // console.log(jsep)

            const event = msg.videoroom;
            console.log("*** methods: newRemoteFeed - onmessage. event = " + event);
            // console.log("****** function newRemoteFeed() - onmessage - event = ")
            // console.log(event)

            if (msg.error) {
                alert(msg.error);
            } else if (event) {
                if (event === "attached") {
                    // Subscriber created and attached
                    for (let i = 1; i < currentRoomNumberCount.value - 1; i++) {
                        if (!feeds.value[i]) {
                            feeds.value[i] = remoteFeed;
                            console.log("remoteFeeds", remoteFeed);
                            // console.log("****** feeds 할당: ", feeds)

                            remoteFeed.rfindex = i;

                            // feeds Length 관리
                            // setUserListLength()
                            // 사용자 추가
                            // addUserListStatus()
                            break;
                        }
                    }

                    remoteFeed.rfid = msg.id;

                    remoteFeed.rfdisplay = getFeedsDisplay("display", msg.display);

                    // rfdeviceid 추가 : 상대방의 deviceid를 알아야 하므로 추가.
                    remoteFeed.rfdeviceid = getFeedsDisplay("deviceid", msg.display);

                    // nickname 추가 : 상대방의 nickname를 알아야 하므로 추가.
                    remoteFeed.nickname = customUserNickname(remoteFeed.rfdeviceid);

                    // 참여자 계산
                    getPersonnelInRoom();

                    if (!remoteFeed.spinner) {
                        const target = document.getElementById(
                            "videoremote" + remoteFeed.rfindex,
                        );
                        console.log(window.Spinner);
                        if (window.Spinner) {
                            remoteFeed.spinner = new window.Spinner({ top: 100 }).spin(
                                target,
                            );
                        }
                    } else {
                        remoteFeed.spinner.spin();
                    }
                    Janus.log(
                        "Successfully attached to feed " +
                            remoteFeed.rfid +
                            " (" +
                            // remoteFeed.rfdisplay +
                            getFeedsDisplay("display", remoteFeed.rfdisplay) +
                            ") in room " +
                            msg.room,
                    );
                    Janus.log(
                        "----- function newRemoteFeed: onmessage ----- Successfully attached to feed " +
                            remoteFeed.rfid +
                            " (" +
                            remoteFeed.rfdisplay +
                            ") in room " +
                            msg.room,
                    );
                    $("#remote" + remoteFeed.rfindex)
                        .removeClass("hide")
                        .html(remoteFeed.rfdisplay)
                        .show();

                    nextTick(() => {
                        setAudioOutput();
                    });
                } else if (event === "event") {
                    // Check if we got a simulcast-related event from publisher
                    const substream = msg.substream;
                    const temporal = msg.temporal;
                    if (
                        (substream !== null && substream !== undefined) ||
                        (temporal !== null && temporal !== undefined)
                    ) {
                        if (!remoteFeed.simulcastStarted) {
                            remoteFeed.simulcastStarted = true;
                            // Add some new buttons
                            addSimulcastButtons(
                                remoteFeed.rfindex,
                                remoteFeed.videoCodec === "vp8" ||
                                    remoteFeed.videoCodec === "h264",
                            );
                        }
                        // We just received notice that there's been a switch, update the buttons
                        updateSimulcastButtons(remoteFeed.rfindex, substream, temporal);
                    }
                } else if (event === "slow_link") {
                    console.log("slow_link");
                    if (
                        document.getElementsByClassName(
                            `no-video-text${remoteFeed.rfindex}`,
                        )[0]
                    )
                        document.getElementsByClassName(
                            `no-video-text${remoteFeed.rfindex}`,
                        )[0].innerHTML = t("network down");
                } else {
                    // What has just happened?
                }
            }
            if (jsep) {
                console.log("*** methods: onmessage - Handling SDP");
                Janus.debug("Handling SDP as well...", jsep);
                // Answer and attach
                remoteFeed.createAnswer({
                    jsep,
                    // Add data:true here if you want to subscribe to datachannels as well
                    // (obviously only works if the publisher offered them in the first place)
                    media: {
                        audioSend: false,
                        videoSend: false,
                        // =>kyj
                        data: true,
                        // <=kyj
                    }, // We want recvonly audio/video
                    success(jsep) {
                        console.log("*** methods: createAnswer - Got SDP. " + jsep);
                        // Janus.debug("Got SDP!", jsep)
                        const body = { request: "start", room: myroom.value };
                        remoteFeed.send({ message: body, jsep });
                    },
                    error(error) {
                        console.log("*** methods: createAnswer WebRTC error. " + error);
                        // Janus.error("WebRTC error:", error)
                        // Janus.log("****** function newRemoteFeed - onmessage")
                        alert("WebRTC error... " + error.message);
                    },
                });
            }
        },
        iceState(state) {
            // console.log("*** methods: newRemoteFeed - iceState. state = " + state)
            console.log(
                "ICE state of WebRTC PeerConnection newRemoteFeed (feed #" +
                    remoteFeed.rfindex +
                    ") changed to state = " +
                    state,
            );
            // console.log(
            //  "****** function newRemoteFeed() - iceState: function() - state = "
            // )
            // console.log(state)
            Janus.log(
                "ICE state of WebRTC PeerConnection (feed #" +
                    remoteFeed.rfindex +
                    ") changed to " +
                    state,
            );
        },
        webrtcState(on) {
            Janus.log(
                "Janus says WebRTC PeerConnection (feed #" +
                    remoteFeed.rfindex +
                    ") is " +
                    (on ? "up" : "down") +
                    " now",
            );
        },
        onlocalstream(stream) {
            // The subscriber stream is recvonly, we don't expect anything here
            Janus.log(
                "----- function newRemoteFeed: onlocalstream ----- stream:",
                stream,
            );
        },
        onremotestream(stream) {
            console.log("*** methods: onremoteStream");
            // console.log("######## ON REMOTE STREAM 한다 ##########")
            Janus.debug("Remote feed #" + remoteFeed.rfindex + ", stream:", stream);
            Janus.log(
                "----- function newRemoteFeed: onremotestream ----- Remote feed #" +
                    remoteFeed.rfindex +
                    ", stream:",
                stream,
            );
            let addButtons = false;
            if ($("#remotevideo" + remoteFeed.rfindex).length === 0) {
                addButtons = true;

                // video div의 자식 요소를 모두 제거한다.
                // $("#videoremote" + remoteFeed.rfindex).empty()

                // 자신의 언어에 따라 사용자의 닉네임을 바꾸어준다.
                const customNickname = customUserNickname(remoteFeed.rfdeviceid);

                console.log(
                    "*** mounted: newRemoteFeed > customNickname",
                    customNickname,
                );

                // 상대방 화면을 비디오로 변경
                callingLayoutChange("attach", customNickname, remoteFeed.rfindex);

                // if(videoCallHost) {
                //  hostSelectedMainVideo(remoteFeed.rfid)
                // }
                sessionStorage.setItem("m_callWaiting", "false");

                // 참여자 계산
                getPersonnelInRoom();

                // video div의 테두리를 없앤다.
                // $("#videoremote" + remoteFeed.rfindex).css("border", "none")

                $("#videoremote" + remoteFeed.rfindex).append(
                    '<div class="panel-inner" id="panel-inner' +
                        remoteFeed.rfindex +
                        '" style="width:100%; height:100%; position: absolute;"/>',
                );

                // No remote video yet
                // video를 보여주기 위한 DOM을 생성. But, 재생은 아님. 스피너가 보이는 상태.
                $("#panel-inner" + remoteFeed.rfindex).append(
                    '<video class="rounded centered" id="waitingvideo' +
                        remoteFeed.rfindex +
                        '" width="100%" height="100%" />',
                );

                $("#panel-inner" + remoteFeed.rfindex).append(
                    '<video class="rounded centered relative hide" id="remotevideo' +
                        remoteFeed.rfindex +
                        '" width="100%" height="100%" style="object-fit: fill" autoplay playsinline muted="muted" />',
                );

                // 동적으로 생성된 video 태그에 vue가 인식할 수 있도록 onClick 이벤트를 설정하는 부분.
                const video = document.getElementById("remotevideo" + remoteFeed.rfindex);

                // 최초로 사용자가 연결되었을 때 부터 Timer 시작
                // callingTimer가 시작했는지 체크
                if (!callingTimerStart.value) {
                    setCallingTimer("start");

                    // 사용자가 입장하여 callingTimer을 시작한다.
                    callingTimerStart.value = true;
                }

                // 최초 연결된 사용자를 큰 비디오에 표시
                if (sessionStorage.getItem("otherPartyAccess") === "false") {
                    sessionStorage.setItem("otherPartyAccess", "true");

                    // 통화 수락으로 방에 입장한 경우
                    // onlocalstream 보다 on remotestream 을 먼저 접근하므로
                    // videoMain 쪽 객체 정의
                    if (sessionStorage.getItem("createRoomFlag") === "false") {
                    }

                    try {
                        // 바둑판이 아닐 경우에만 메인화면 교체
                        if (commonStore.callingLayoutType != 1) {
                            // 큰 비디오에 적용
                            const videoMain = document.getElementById("videoMain");
                            videoMain.srcObject = video.srcObject;
                            // $("#videoMainCaption").html(remoteFeed.rfdisplay)
                            $("#videoMainCaption").html(customNickname); // 사용자가 선택한 언어에 따라 닉네임 변경
                            // console.log(
                            //  "videoMainCaption - 최초 연결: " + remoteFeed.rfdisplay
                            // )

                            // Main Index 관리
                            callStore.setVideoMainIndex(remoteFeed.rfindex);
                        }

                        // oldDuration 등록을 위한 Flag 설정
                        if (videoCallHost.value) {
                            oldDurationFlag.value = true;

                            // 바둑판일 경우에 border를 생성한다. -> 바둑판외에는 main_stream_check에서 생성한다.
                            if (commonStore.callingLayoutType == 1) {
                                // Main Index 관리
                                callStore.setVideoMainIndex(remoteFeed.rfindex);

                                // MainVideo Border Change
                                mainVideoBorder(remoteFeed.rfindex);

                                // 바로 실행 시 상대방의 remoteStream을 찾지 못하여 오류 발생하므로 시간차 실행
                                setTimeout(() => {
                                    // host가 바라보는 메인 화면으로 변경
                                    console.log("hostSelectedMainVideo 11");
                                    hostSelectedMainVideo(remoteFeed.rfid);
                                }, 500);
                            }
                        }

                        // Main Index 관리
                        callStore.setVideoMainIndex(remoteFeed.rfindex);
                    } catch (error) {
                        console.log("*** methods: onremoteStream. try error" + error);
                    }
                }

                // 새로운 사용자가 입장 시 방이 전체 음소거 일 경우 음소거 버튼 생성
                if (callStore.allMicMuteFlag == true) {
                    setUserListMicMute(remoteFeed.rfindex, true);
                }

                // janus destroy 시 이전 사용자들은 남겨야 하기 때문에 다시 한번 remoteStream을 호출한다.
                video.addEventListener("click", function () {
                    // video_change(
                    console.log("상대방 Viedo 클릭");

                    // 드로잉 할 때는, 메인화면을 변경할 수 없습니다 출력.
                    if (commonStore.isDrawing) {
                        commonToastMessage(t("toastMessage Drawing NoChangeMainVideo"));
                        return;
                    }

                    if (videoCallHost.value) {
                        // 바둑판이 아닐 경우
                        if (commonStore.callingLayoutType != 1) {
                            $("#videoMainCaption").html(customNickname); // 사용자의 언어에 따라 닉네임 변경

                            // MainVideo Check
                            if (callStore.videoMainIndex != remoteFeed.rfindex) {
                                mainVideoChangeFunc(1, customNickname);
                            }

                            // Main Index 관리
                            callStore.setVideoMainIndex(remoteFeed.rfindex);

                            // MainVideo Border Change
                            mainVideoBorder(remoteFeed.rfindex);

                            // host가 바라보는 메인 화면으로 변경
                            console.log("hostSelectedMainVideo 13");
                            hostSelectedMainVideo(remoteFeed.rfid);
                        } else if (commonStore.callingLayoutType == 1) {
                            // 바둑판 일 경우에도 메인화면을 변경할 수 있도록 수정한다.
                            // 실제로 메인 비디오가 존재하지 않기 때문에 mainIndex만 변경하도록 한다.

                            // Main Index 관리
                            callStore.setVideoMainIndex(remoteFeed.rfindex);

                            // MainVideo Border Change
                            mainVideoBorder(remoteFeed.rfindex);

                            // host가 바라보는 메인 화면으로 변경
                            console.log("hostSelectedMainVideo 14");
                            hostSelectedMainVideo(remoteFeed.rfid);
                        }
                    }
                });

                // remote의 이름을 보여주는 div
                // $("#panel-inner" + remoteFeed.rfindex).append(
                //     '<div class="row items-center" style="position: absolute; bottom: 0px; width: 100%; height: 30px; color: white; background-color: rgba(0, 0, 0, 0.5); padding: 0 7px; z-index: 1;"><span id="remoteCaption' +
                //         remoteFeed.rfindex +
                //         '" class="col text-left remoteCaptionName" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 18px;">' +
                //         customNickname +
                //         "</span></div>",
                // );

                $("#panel-inner" + remoteFeed.rfindex).append(
                    '<span class="label label-primary hide" id="curres' +
                        remoteFeed.rfindex +
                        '" style="position: absolute; bottom: 0px; left: 0px; margin: 15px;"></span>' +
                        '<span class="label label-info hide" id="curbitrate' +
                        remoteFeed.rfindex +
                        '" style="position: absolute; bottom: 0px; right: 0px; margin: 15px;"></span>',
                );

                // Show the video, hide the spinner and show the resolution when we get a playing event
                // 스피너를 없애고, 생성한 비디오 태그에 playing 속성(?)을 바인드. (영상이 재생되도록 하는 것인가? 아니면, 영상이 재생되는 동안 계속 실행되는 것인가? why? curresN.text(해상도) 가 있기 때문에.)
                // 기존
                $("#remotevideo" + remoteFeed.rfindex).bind("playing", function () {
                    console.log("*** methods: onremoteStream bind Playing");
                    if (remoteFeed.spinner) remoteFeed.spinner.stop();
                    remoteFeed.spinner = null;
                    $("#waitingvideo" + remoteFeed.rfindex).remove();
                    // if (videoWidth)
                    //     $("#remotevideo" + remoteFeed.rfindex)
                    //         .removeClass("hide")
                    //         .show();
                    Janus.log(
                        "----- function newRemoteFeed: onremotestream ----- resolution show ",
                    );

                    // 작은 비디오 화면 오디오 뮤트(영상통화 레이아웃 변경 시 오디오 일시적 안들림 오류)
                    // start
                    $("#remotevideo" + remoteFeed.rfindex).prop(
                        "muted",
                        !$("#remotevideo" + remoteFeed.rfindex).prop("muted"),
                    );
                    const audioControl = document.getElementById(
                        "audioControl" + remoteFeed.rfindex,
                    );
                    // 레이아웃 변경 해도 안 끊기는 오디오 등록
                    audioControl.srcObject = video.srcObject;
                    // end

                    if (Janus.webRTCAdapter.browserDetails.browser === "firefox") {
                        // Firefox Stable has a bug: width and height are not immediately available after a playing
                        setTimeout(function () {
                            const width = $("#remotevideo" + remoteFeed.rfindex).get(
                                0,
                            ).videoWidth;
                            const height = $("#remotevideo" + remoteFeed.rfindex).get(
                                0,
                            ).videoHeight;
                            $("#curres" + remoteFeed.rfindex)
                                .removeClass("hide")
                                .text(width + "x" + height)
                                .show();
                        }, 2000);
                    }
                });
            }

            console.log(
                "*** methods: newRemoteFeed > onremoteStream > user: " +
                    remoteFeed.rfdisplay,
            );
            console.log(
                "*** methods: newRemoteFeed > onremoteStream > index: " +
                    remoteFeed.rfindex,
            );

            // video에 넣어주는 스트림을 객체에 저장
            Janus.attachMediaStream(
                $("#remotevideo" + remoteFeed.rfindex).get(0),
                stream,
            );

            console.log(
                "*** methods: newRemoteFeed > onremoteStream > attacheMediaStream",
            );
            // console.log(stream)
            // console.log(stream.getVideoTracks())
            // console.log($("#remotevideo" + remoteFeed.rfindex).get(0))

            const videoTracks = stream.getVideoTracks();
            if (stream.getAudioTracks()[0]) {
                const audioStream = new MediaStream();
                audioStream.addTrack(stream.getAudioTracks()[0]);
                const permanantAuido = document.getElementById(
                    `audioControl${remoteFeed.rfindex}`,
                );
                permanantAuido.srcObject = audioStream;
            }
            // 스트림이 없을 경우 'No remote video available' 문구 생성
            if (!videoTracks || videoTracks.length === 0) {
                // No remote video
                // 비디오가 없을 경우, hide
                // $("#panel-inner" + remoteFeed.rfindex).hide()
                if (
                    $("#videoremote" + remoteFeed.rfindex + " .no-video-container")
                        .length === 0
                ) {
                    Janus.log(
                        "----- function newRemoteFeed: onremotestream ----- no remote video ",
                    );

                    console.log("******** No webcam available ********* onremoteStream");

                    $("#panel-inner" + remoteFeed.rfindex).append(
                        '<div class="no-video-container" style="position:absolute; top: 20%; left: 10%; font-size:16px;>' +
                            '<i class="fa fa-video-camera fa-5 no-video-icon"></i>' +
                            `<span class="no-video-text${remoteFeed.rfindex}">No webcam available</span>` +
                            "</div>",
                    );
                }
            } else {
                // 비디오가 없는 상태에서 벗어난다면, 네모 박스를 없애고 다시 비디오 show()
                console.log(
                    "----- function newRemoteFeed: onremotestream ----- on remote video!!!!!!!!!! ",
                );

                setTimeout(() => {
                    $(
                        "#videoremote" + remoteFeed.rfindex + " .no-video-container",
                    ).remove();
                    $("#remotevideo" + remoteFeed.rfindex)
                        .removeClass("hide")
                        .show();
                }, 3000);

                // $("#panel-inner" + remoteFeed.rfindex).show()
                // // 현재 통신 연결이 불안정에서 안정으로 변경될 때
                // if (
                //  commonStore.userListStatus[remoteFeed.rfindex].status ==
                //  "unstable"
                // ) {
                //  // // 삭제했던 비디오 태그 생성
                //  // $("#videoMainDiv").empty()
                //  // $("#videoMainDiv").css("justify-content", "center")
                //  // $("#videoMainDiv").append(
                //  //  "<div class='panel-inner' id='panel-inner-main' />"
                //  // )
                //  // $("#panel-inner-main").append(
                //  //  '<video id="videoMain" style="height: 100%;" autoplay></video>'
                //  // )
                //  // $("#panel-inner-main").append(
                //  //  "<div class='row items-center' style='position: absolute; bottom: 0px; width: 100%; height: 30px; color: white; background-color: rgba(0, 0, 0, 0.5); padding: 0 15px;'>" +
                //  //      "<span id='videoMainCaption' class='col text-left' style='overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 18px;'>" +
                //  //      remoteFeed.rfdisplay +
                //  //      "</span>" +
                //  //      "</div>"
                //  // )
                //  // $("#panel-inner-main").append(
                //  //  "<span class='label label-primary hide' id='curres-main' style='position: absolute; bottom: 0px; left: 0px; margin: 15px;'></span>" +
                //  //      "<span class='label label-info hide' id='curbitrate-main' style='position: absolute; bottom: 0px; right: 0px; margin: 15px;'></span>"
                //  // )
                //  mainVideoChangeFunc(5, remoteFeed.rfdisplay)

                //  // 불안정 이미지 삭제
                //  callingLayoutChange("attach", remoteFeed.rfdisplay, remoteFeed.rfindex )
                // }
            }
            if (!addButtons) return;
            if (
                Janus.webRTCAdapter.browserDetails.browser === "chrome" ||
                Janus.webRTCAdapter.browserDetails.browser === "firefox" ||
                Janus.webRTCAdapter.browserDetails.browser === "safari"
            ) {
                $("#curbitrate" + remoteFeed.rfindex)
                    .removeClass("hide")
                    .show();

                // console.log("@@@@@@@@@@@@@@@@@@@@@")
                // const bitrate = remoteFeed.getBitrate()
                // const height = $("#remotevideo" + remoteFeed.rfindex).get(0)
                //  .videoHeight
                // const deviceType = userListGetDevicetype(
                //  remoteFeed.rfdisplay
                // )

                // bitrateInterval(bitrate, height, deviceType)

                // 실시간으로 bit, 해상도 변경 해주는 interval.value function
                // bitrateTimer[remoteFeed.rfindex] = setInterval(function() {
                //  // Janus.log("----- function newRemoteFeed: onremotestream ----- resolution and bitrate Update ");
                //  // Display updated bitrate, if supported
                //  const bitrate = remoteFeed.getBitrate()
                //  $("#curbitrate" + remoteFeed.rfindex).text(bitrate)
                //  // Check if the resolution changed too
                //  const width = $("#remotevideo" + remoteFeed.rfindex).get(0)
                //      .videoWidth
                //  const height = $("#remotevideo" + remoteFeed.rfindex).get(0)
                //      .videoHeight
                //  if (width > 0 && height > 0)
                //      $("#curres" + remoteFeed.rfindex)
                //          .removeClass("hide")
                //          .text(width + "x" + height)
                //          .show()
                // }, 1000)
            }

            // 영상이 재생 중임에도 no webcam 문구가 나타나는 문제 해결 방안으로 remove를 제일 마지막에 둔다.
            if (
                $("#videoremote" + remoteFeed.rfindex + " .no-video-container").length !=
                0
            ) {
                console.log(
                    "영상이 재생 중임에도 no webcam 문구가 나타났기에 해당 문구를 제거해주겠다.",
                );
                $("#videoremote" + remoteFeed.rfindex + " .no-video-container").remove();
            }
            nextTick(() => {
                setAudioOutput();
            });
        },
        // 해당 비디오의 모든 정보를 제거 (공유하지 않거나 퇴장할 때 호출?)
        oncleanup() {
            Janus.log(" ::: Got a cleanup notification (remote feed " + id + ") :::");
            Janus.log(
                "----- function newRemoteFeed: oncleanup ----- ::: Got a cleanup notification (remote feed " +
                    id +
                    ") :::",
            );
            if (remoteFeed.spinner) remoteFeed.spinner.stop();
            remoteFeed.spinner = null;
            $("#panel-inner" + remoteFeed.rfindex).remove();
            $("#remotevideo" + remoteFeed.rfindex).remove();
            $("#waitingvideo" + remoteFeed.rfindex).remove();
            $("#novideo" + remoteFeed.rfindex).remove();
            $("#curbitrate" + remoteFeed.rfindex).remove();
            $("#curres" + remoteFeed.rfindex).remove();
            // if (bitrateTimer[remoteFeed.rfindex])
            //  clearInterval(bitrateTimer[remoteFeed.rfindex])

            // bitrateTimer.value[remoteFeed.rfindex] = null;
            remoteFeed.simulcastStarted = false;
            $("#simulcast" + remoteFeed.rfindex).remove();
            // #simulcast 는 뭐지??

            // $("#videoremote" + remoteFeed.rfindex).css(
            //  "border",
            //  "2px dashed rgb(55, 55, 55)"
            // )
            // $("#videoremote" + remoteFeed.rfindex).append(
            //  '<div class="col-12 row justify-center">' +
            //      '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAABHNCSVQICAgIfAhkiAAAAYtJREFUOE/NVbFOAkEQfbMVVlpoY4O2NmIltxujfoEaP0A6W6ysDBA6K3/BHyCWlhizgxYk+AsmdhY06DXcmDEBzwtcFmOUTTa53Z19825m9g1Za0sAakR0iNQQkTtm3kvvpb+ttXUiqmXO2yJyxsw9stbeENFBFuCHwArTHwwG6+ScE12JyJZ6msYwZN85p/c3h8Ph/hjYe08hl/NsrLVtItr9f2Dn3I6INAHcM/NFTkK/GCt9NcyrgCiKjowxLQAt7/1xDvAVAK2yalBcQ4HTDv8WWGOaJMnyiIGIbBtjzgE8iMhlJhS3nU7nPRueiYxHZRNYfkXv/XMocJOINlLGqwDKAF4APKZB4jg+7Xa7r0HAWaP5Sp6qlEoFMzemxTSUsbW2AqCYJMl1kFbMADybVkRRtGCMWYnj+G1SokZ/Oj8iFFjP+MZ4tBCRHhH1U6/tiZmrOYJTIaKTzLkK0JI2DW1NutCgL/5Cz9NO1GDm+ueTLpVKS4VCQR2MhzGmn9eqyuXyGgCdE+98AFoG93t04PIwAAAAAElFTkSuQmCC" />' +
            //      "</div>"
            // )
        },
        // =>kyj
        ondataopen(data) {
            Janus.log("Other's The DataChannel is available!");
        },
        ondata(data) {
            // DataChannel 기능 제거
            // Janus.debug("We got data from the DataChannel!", data)
            // // console.log("*** methods: onData json: " + data)
            // // console.log("Other's Ondata json:", data)
            // fileReceiveBuffer.value.push(data)
            // fileReceivedSize += data.byteLength
            // // console.log("*** methods: onData fileReceivedSize: " + fileReceivedSize)
            // // console.log("*** methods: onData fileReceiveTotalSize: " + fileReceiveTotalSize)
            // // 파일 수신 진행률
            // const rate = Math.round(
            //  (fileReceivedSize / fileReceiveTotalSize) * 100
            // )
            // callStore.setReceptionRate", rate)
            // // console.log("*** methods: onData - file reception rate: " + rate)
            // // 파일 수신 완료
            // if (fileReceivedSize === fileReceiveTotalSize) {
            //  console.log("*** methods: onData - Received File Save Start")
            //  const received = new Blob(fileReceiveBuffer.value)
            //  const url = window.URL.createObjectURL(received)
            //  const a = document.createElement("a")
            //  a.style.display = "none"
            //  a.href = url
            //  // PC에 저장
            //  const fname = getImageFileName(receiveFileType.value)
            //  // console.log("***** image file name: ".concat(fname))
            //  a.download = fname
            //  document.body.appendChild(a)
            //  a.click()
            //  setTimeout(() => {
            //      document.body.removeChild(a)
            //      window.URL.revokeObjectURL(url)
            //  }, 100)
            //  // $("#panel-inner" + 0).hide()
            //  // 로컬 일 경우에는 썸네일에 추가 되지 않음 - url알 수 없음.
            //  // 로컬 일 경우에는 미리보기만 출력
            //  // if (window.location.hostname == "localhost") {
            //  //  previewModal(url)
            //  // }
            //  // 파일을 다 전송 받았을때의 처리
            //  // const remoteDeviceId = commonStore.fileReceiver
            //  // const obj = {
            //  //  localdeviceid: loginStore.m_local_deviceid,
            //  //  remoteDeviceId: remoteDeviceId,
            //  //  status: 1
            //  // }
            //  // const sendJson = JSON.stringify(obj)
            //  // signallingSocket.emit("fileTransferFinish", sendJson)
            //  /* 고화질 캡쳐와 분기처리 */
            //  if (callStore.HQCaptureFlag) {
            //      // 파일 송수신 중 초기화
            //      sessionStorage.setItem("fileSendingFlag", false)
            //      // 파일 송수신 flag 초기화
            //      commonStore.fileSendStatus", 0)
            //      // 파일 송수신 진행률 초기화
            //      callStore.setReceptionRate", 0)
            //      callingLayoutChange("attach", sessionStorage.getItem("m_nickname"), 0)
            //      // leftSidebar 고화질 캡쳐 버튼 초기화
            //      callStore.setHQCaptrueFlag", false)
            //      $("#myvideo").show()
            //  } else {
            //      callingLayoutChange(5, sessionStorage.getItem("m_nickname"), 0)
            //      setTimeout(() => {
            //          let message = ""
            //          if (preferenceStore.lang == "ko") {
            //              message =
            //                  commonStore.fileSendNickname +
            //                  t("fileSending text3")
            //          } else {
            //              message =
            //                  t("fileSending text3") +
            //                  commonStore.fileSendNickname
            //          }
            //          // 현재시간 UTC 가져오기
            //          const nowDate = getWorldTime()
            //          $set(
            //              chattingStore.chattingMessageList,
            //              chattingFileSendIndex.value,
            //              {
            //                  type: 0,
            //                  message,
            //                  date: nowDate,
            //                  chattingDate: getChattingTimeZone(nowDate),
            //                  nickname: sessionStorage.getItem("m_nickname"),
            //                  level: 1
            //                  // isReceived: true
            //              }
            //          )
            //          // 파일 송수신 중 초기화
            //          sessionStorage.setItem("fileSendingFlag", false)
            //          // 파일 송수신 flag 초기화
            //          commonStore.fileSendStatus", 0)
            //          // 파일 송수신 진행률 초기화
            //          callStore.setReceptionRate", 0)
            //          callingLayoutChange("attach", sessionStorage.getItem("m_nickname"), 0)
            //          $("#myvideo").show()
            //          // let previousWork = callStore.previousWorkingStatus
            //          // console.log("파일 수신 완료 후", previousWork)
            //          // if (previousWork != "" && previousWork !== "attach") {
            //          //  callingLayoutChange(previousWork, sessionStorage.getItem("m_nickname"), 0)
            //          // } else {
            //          //  callingLayoutChange("attach", sessionStorage.getItem("m_nickname"), 0)
            //          //  $("#myvideo").show()
            //          // }
            //          // 파일 수신중 이전작업상태값 초기화
            //          // callStore.setPreviousWorking", "")
            //          // $("#panel-inner" + 0).show()
            //      }, 2000)
            //  }
            // }
            // // else {
            // //   console.log("*** methods: onData - Received File Save ing")
            // //   // 파일을 다 전송 받았을때의 처리
            // //   const remoteDeviceId = commonStore.fileReceiver
            // //   const obj = {
            // //       localdeviceid: loginStore.m_local_deviceid,
            // //       remoteDeviceId: remoteDeviceId,
            // //       status: 0
            // //   }
            // //   const sendJson = JSON.stringify(obj)
            // //   signallingSocket.emit("fileTransferFinish", sendJson)
            // // }
        },
        // <=kyj
    });
}
function addSimulcastButtons(feed, temporal) {
    const index = feed;
    $("#remote" + index)
        .parent()
        .append(
            '<div id="simulcast' +
                index +
                '" class="btn-group-vertical btn-group-vertical-xs pull-right">' +
                '   <div class"row">' +
                '       <div class="btn-group btn-group-xs" style="width: 100%">' +
                '           <button id="sl' +
                index +
                '-2" type="button" class="btn btn-primary" data-toggle="tooltip" title="Switch to higher quality" style="width: 33%">SL 2</button>' +
                '           <button id="sl' +
                index +
                '-1" type="button" class="btn btn-primary" data-toggle="tooltip" title="Switch to normal quality" style="width: 33%">SL 1</button>' +
                '           <button id="sl' +
                index +
                '-0" type="button" class="btn btn-primary" data-toggle="tooltip" title="Switch to lower quality" style="width: 34%">SL 0</button>' +
                "       </div>" +
                "   </div>" +
                '   <div class"row">' +
                '       <div class="btn-group btn-group-xs hide" style="width: 100%">' +
                '           <button id="tl' +
                index +
                '-2" type="button" class="btn btn-primary" data-toggle="tooltip" title="Cap to temporal layer 2" style="width: 34%">TL 2</button>' +
                '           <button id="tl' +
                index +
                '-1" type="button" class="btn btn-primary" data-toggle="tooltip" title="Cap to temporal layer 1" style="width: 33%">TL 1</button>' +
                '           <button id="tl' +
                index +
                '-0" type="button" class="btn btn-primary" data-toggle="tooltip" title="Cap to temporal layer 0" style="width: 33%">TL 0</button>' +
                "       </div>" +
                "   </div>" +
                "</div>",
        );
    // Enable the simulcast selection buttons
    $("#sl" + index + "-0")
        .removeClass("btn-primary btn-success")
        .addClass("btn-primary")
        .unbind("click")
        .click(function () {
            window.toastr.info(
                "Switching simulcast substream, wait for it... (lower quality)",
                null,
                { timeOut: 2000 },
            );
            if (!$("#sl" + index + "-2").hasClass("btn-success"))
                $("#sl" + index + "-2")
                    .removeClass("btn-primary btn-info")
                    .addClass("btn-primary");
            if (!$("#sl" + index + "-1").hasClass("btn-success"))
                $("#sl" + index + "-1")
                    .removeClass("btn-primary btn-info")
                    .addClass("btn-primary");
            $("#sl" + index + "-0")
                .removeClass("btn-primary btn-info btn-success")
                .addClass("btn-info");
            feeds.value[index].send({
                message: { request: "configure", substream: 0 },
            });
        });
    $("#sl" + index + "-1")
        .removeClass("btn-primary btn-success")
        .addClass("btn-primary")
        .unbind("click")
        .click(function () {
            window.toastr.info(
                "Switching simulcast substream, wait for it... (normal quality)",
                null,
                { timeOut: 2000 },
            );
            if (!$("#sl" + index + "-2").hasClass("btn-success"))
                $("#sl" + index + "-2")
                    .removeClass("btn-primary btn-info")
                    .addClass("btn-primary");
            $("#sl" + index + "-1")
                .removeClass("btn-primary btn-info btn-success")
                .addClass("btn-info");
            if (!$("#sl" + index + "-0").hasClass("btn-success"))
                $("#sl" + index + "-0")
                    .removeClass("btn-primary btn-info")
                    .addClass("btn-primary");
            feeds.value[index].send({
                message: { request: "configure", substream: 1 },
            });
        });
    $("#sl" + index + "-2")
        .removeClass("btn-primary btn-success")
        .addClass("btn-primary")
        .unbind("click")
        .click(function () {
            window.toastr.info(
                "Switching simulcast substream, wait for it... (higher quality)",
                null,
                { timeOut: 2000 },
            );
            $("#sl" + index + "-2")
                .removeClass("btn-primary btn-info btn-success")
                .addClass("btn-info");
            if (!$("#sl" + index + "-1").hasClass("btn-success"))
                $("#sl" + index + "-1")
                    .removeClass("btn-primary btn-info")
                    .addClass("btn-primary");
            if (!$("#sl" + index + "-0").hasClass("btn-success"))
                $("#sl" + index + "-0")
                    .removeClass("btn-primary btn-info")
                    .addClass("btn-primary");
            feeds.value[index].send({
                message: { request: "configure", substream: 2 },
            });
        });
    if (!temporal)
        // No temporal layer support
        return;
    $("#tl" + index + "-0")
        .parent()
        .removeClass("hide");
    $("#tl" + index + "-0")
        .removeClass("btn-primary btn-success")
        .addClass("btn-primary")
        .unbind("click")
        .click(function () {
            window.toastr.info(
                "Capping simulcast temporal layer, wait for it... (lowest FPS)",
                null,
                { timeOut: 2000 },
            );
            if (!$("#tl" + index + "-2").hasClass("btn-success"))
                $("#tl" + index + "-2")
                    .removeClass("btn-primary btn-info")
                    .addClass("btn-primary");
            if (!$("#tl" + index + "-1").hasClass("btn-success"))
                $("#tl" + index + "-1")
                    .removeClass("btn-primary btn-info")
                    .addClass("btn-primary");
            $("#tl" + index + "-0")
                .removeClass("btn-primary btn-info btn-success")
                .addClass("btn-info");
            feeds.value[index].send({
                message: { request: "configure", temporal: 0 },
            });
        });
    $("#tl" + index + "-1")
        .removeClass("btn-primary btn-success")
        .addClass("btn-primary")
        .unbind("click")
        .click(function () {
            window.toastr.info(
                "Capping simulcast temporal layer, wait for it... (medium FPS)",
                null,
                { timeOut: 2000 },
            );
            if (!$("#tl" + index + "-2").hasClass("btn-success"))
                $("#tl" + index + "-2")
                    .removeClass("btn-primary btn-info")
                    .addClass("btn-primary");
            $("#tl" + index + "-1")
                .removeClass("btn-primary btn-info")
                .addClass("btn-info");
            if (!$("#tl" + index + "-0").hasClass("btn-success"))
                $("#tl" + index + "-0")
                    .removeClass("btn-primary btn-info")
                    .addClass("btn-primary");
            feeds.value[index].send({
                message: { request: "configure", temporal: 1 },
            });
        });
    $("#tl" + index + "-2")
        .removeClass("btn-primary btn-success")
        .addClass("btn-primary")
        .unbind("click")
        .click(function () {
            window.toastr.info(
                "Capping simulcast temporal layer, wait for it... (highest FPS)",
                null,
                { timeOut: 2000 },
            );
            $("#tl" + index + "-2")
                .removeClass("btn-primary btn-info btn-success")
                .addClass("btn-info");
            if (!$("#tl" + index + "-1").hasClass("btn-success"))
                $("#tl" + index + "-1")
                    .removeClass("btn-primary btn-info")
                    .addClass("btn-primary");
            if (!$("#tl" + index + "-0").hasClass("btn-success"))
                $("#tl" + index + "-0")
                    .removeClass("btn-primary btn-info")
                    .addClass("btn-primary");
            feeds.value[index].send({
                message: { request: "configure", temporal: 2 },
            });
        });
}
function updateSimulcastButtons(feed, substream, temporal) {
    // Check the substream
    const index = feed;
    if (substream === 0) {
        window.toastr.success("Switched simulcast substream! (lower quality)", null, {
            timeOut: 2000,
        });
        $("#sl" + index + "-2")
            .removeClass("btn-primary btn-success")
            .addClass("btn-primary");
        $("#sl" + index + "-1")
            .removeClass("btn-primary btn-success")
            .addClass("btn-primary");
        $("#sl" + index + "-0")
            .removeClass("btn-primary btn-info btn-success")
            .addClass("btn-success");
    } else if (substream === 1) {
        window.toastr.success("Switched simulcast substream! (normal quality)", null, {
            timeOut: 2000,
        });
        $("#sl" + index + "-2")
            .removeClass("btn-primary btn-success")
            .addClass("btn-primary");
        $("#sl" + index + "-1")
            .removeClass("btn-primary btn-info btn-success")
            .addClass("btn-success");
        $("#sl" + index + "-0")
            .removeClass("btn-primary btn-success")
            .addClass("btn-primary");
    } else if (substream === 2) {
        window.toastr.success("Switched simulcast substream! (higher quality)", null, {
            timeOut: 2000,
        });
        $("#sl" + index + "-2")
            .removeClass("btn-primary btn-info btn-success")
            .addClass("btn-success");
        $("#sl" + index + "-1")
            .removeClass("btn-primary btn-success")
            .addClass("btn-primary");
        $("#sl" + index + "-0")
            .removeClass("btn-primary btn-success")
            .addClass("btn-primary");
    }
    // Check the temporal layer
    if (temporal === 0) {
        window.toastr.success("Capped simulcast temporal layer! (lowest FPS)", null, {
            timeOut: 2000,
        });
        $("#tl" + index + "-2")
            .removeClass("btn-primary btn-success")
            .addClass("btn-primary");
        $("#tl" + index + "-1")
            .removeClass("btn-primary btn-success")
            .addClass("btn-primary");
        $("#tl" + index + "-0")
            .removeClass("btn-primary btn-info btn-success")
            .addClass("btn-success");
    } else if (temporal === 1) {
        window.toastr.success("Capped simulcast temporal layer! (medium FPS)", null, {
            timeOut: 2000,
        });
        $("#tl" + index + "-2")
            .removeClass("btn-primary btn-success")
            .addClass("btn-primary");
        $("#tl" + index + "-1")
            .removeClass("btn-primary btn-info btn-success")
            .addClass("btn-success");
        $("#tl" + index + "-0")
            .removeClass("btn-primary btn-success")
            .addClass("btn-primary");
    } else if (temporal === 2) {
        window.toastr.success("Capped simulcast temporal layer! (highest FPS)", null, {
            timeOut: 2000,
        });
        $("#tl" + index + "-2")
            .removeClass("btn-primary btn-info btn-success")
            .addClass("btn-success");
        $("#tl" + index + "-1")
            .removeClass("btn-primary btn-success")
            .addClass("btn-primary");
        $("#tl" + index + "-0")
            .removeClass("btn-primary btn-success")
            .addClass("btn-primary");
    }
}
// 영상 클릭 시 화면 전환
function video_change(_this) {
    console.log("*** methods: video_change");
    // console.log("----- calling.vue : methods video_change() -----");
    // console.log("_srcObject = " + _srcObject);
    // eslint-disable-next-line camelcase
    const main_video = document.getElementById("videoMain");
    main_video.srcObject = _srcObject;
    $("#videoMainCaption").html(sessionStorage.getItem("m_nickname"));
}
// loginUserInfo 요청
// loginUserInfoRequest() {
//  const obj = {
//      deviceid: loginStore.m_local_deviceid,
//      language: sessionStorage.getItem("languageCode")
//  }
//  const json = JSON.stringify(obj)
//  signallingSocket.emit("loginUserInfo", json)
//  console.log("loginUserInfo request:" + json)
// },
// Calling Popup
function changeAlertNum(seq) {
    commonStore.setAlert(seq);
}
function contentsBtnClick(seq) {
    escapeFullScreen();

    changeAlertNum(seq);
}
// -> kyj 통화 화면에서 발신중, 수신중 메세지 표시
function callingLayoutChange(status, text, col) {
    console.log("callingLayoutChange", status, text, col);
    const nickname = getNickname(text);
    console.log("*** methods: callingLayoutChange")
    commonStore.setUserListStatus({
        text,
        col,
        status,
        nickname,
    });
    videoResize();
    // console.log(
    //  "callingLayoutChange: " + commonStore.userListStatus[col].text
    // )
    // console.log(
    //  "callingLayoutChange: " + commonStore.userListStatus[col].status
    // )
}
// 멀티통화 거절
function multiCallingReject(
    localdeviceid,
    remotedeviceid,
    roomid,
    institution,
    nickname,
) {
    const obj = {
        localdeviceid,
        remotedeviceid,
        roomid,
        institution,
        nickname,
    };

    const sendJson = JSON.stringify(obj);
    signallingSocket.emit("multiRefuseCalling", sendJson);
    console.log("*** socket: emit multiRefuseCalling. json: ", sendJson);

    // 멀티통화 수락 거절 화면 숨김
    // 아직 아무도 안들어온 경우
    // 맨 뒤의 숫자를 Feeds Index 번호 부여해야 함
    // for (let i = 1; i < 15; i++) {
    for (let i = 1; i < currentRoomNumberCount.value; i++) {
        if (!feeds.value[i]) {
            callingLayoutChange("none", "", i);
            sessionStorage.setItem("m_callWaiting", "false");
            break;
        }
    }
}
// 멀티통화 수락
function multiCallingAccept(localdeviceid, remotedeviceid, roomid) {
    const obj = {
        localdeviceid,
        remotedeviceid,
        roomid,
        // 새로운 사용자에게 현재 방에 몇명 있는지 보내준다.
        roomNumberCount: currentRoomNumberCount.value,
        // 새로운 사용자 입장 시 회의실이라면 meeting_seq를 보내어서 meeting에 접속할 수 있게 한다.
        meeting_seq: meetingStore.meetingSeq,
        unique_roomid: uniqueRoomid.value, // 2021-07-21 추가
    };

    const sendJson = JSON.stringify(obj);
    signallingSocket.emit("multiCalling", sendJson);

    console.log("*** socket: emit multiCalling. json: ", sendJson);

    //
    // 멀티통화 수락 클릭 시 통화 연결 중 이미지 전환
    // for (let i = 1; i < 15; i++) {
    for (let i = 1; i < currentRoomNumberCount.value; i++) {
        if (!feeds.value[i]) {
            callingLayoutChange("connecting", "", i);

            // 10초 뒤에도 연결 중일 경우 "통신 에러"로 이미지 변경
            setTimeout(function () {
                callingConnectingCheck(i);
            }, 10000);
            break;
        }
    }
}
// 통화 연결 상태 체크
function callingConnectingCheck(index) {
    console.log("*** methods: callingConnectingCheck");
    // 연결 중일 경우 error로 이미지 변경
    if (commonStore.userListStatus[index].status == "connecting") {
        // console.log("callingConnectingCheck Result : Fail")
        callingLayoutChange("error", "", index);
        // m_callWaiting false 변경
        sessionStorage.setItem("m_callWaiting", false);
    }
}
// mainVideo Show & Hide
function mainVideoChangeFunc(type, req) {
    // console.log("*** methods: mainVideoChangeFunc", type)
    let name = "";
    if (req == "localstream") {
        name = sessionStorage.getItem("m_nickname");
    } else {
        name = req;
    }
    const setNickname = getNickname(name);
    // console.log("name : " + name)
    // type 0 :: videoOFFShow
    // type 1 :: videoOFFHide
    // type 2: mainVideo만 hide
    // type 3 :: videoOFF Vuex init & unstable Vuex init
    // type 4 :: unstable Show
    // type 5 :: unstable OFF
    if (commonStore.callingLayoutType == 1) {
        // console.log("@@@@@@ Main Video Change :: callingLayout 1")
        return;
    }

    if (type == 0) {
        // console.log("mainVideoChange Video OFF")
        const width = $("#videoMainDivWrap").width();
        $("#videoMainDivWrap").css("width", width);

        $("#videoMainDiv").hide();
        console.log("videoOFF");
        commonStore.setMainVideoStatus({
            type: "videoOFF",
            text: name,
            nickname: setNickname,
        });

        videoOffResult.value = true;
    } else if (type == 1) {
        // console.log("type 1 !!!")
        // width값 수정 한 것 초기화
        $("#videoMainDivWrap").css("width", "");

        // video Show
        $("#videoMainDiv").show();

        // 초기화
        commonStore.setMainVideoStatus({
            type: "",
            text: name,
            nickname: setNickname,
        });

        videoOffResult.value = false;
    } else if (type == 2) {
        // video Hide
        $("#videoMainDiv").hide();
    } else if (type == 3) {
        commonStore.setMainVideoStatus({
            type: "",
            text: name,
            nickname: setNickname,
        });
    } else if (type == 4) {
        const width = $("#videoMainDivWrap").width();
        $("#videoMainDivWrap").css("width", width);

        $("#videoMainDiv").hide();

        commonStore.setMainVideoStatus({
            type: "unstable",
            text: name,
            nickname: setNickname,
        });
    } else if (type == 5) {
        if (videoOffResult.value == true) {
            console.log("videoOFF");
            commonStore.setMainVideoStatus({
                type: "videoOFF",
                text: name,
                nickname: setNickname,
            });
        } else {
            // width값 수정 한 것 초기화
            $("#videoMainDivWrap").css("width", "");

            // video Show
            $("#videoMainDiv").show();

            commonStore.setMainVideoStatus({
                type: "",
                text: name,
                nickname: setNickname,
            });
        }
    }
}
function videoLayoutChange() {
    return;
    // console.log("*** methods: videoLayoutChange")
    //
    let newLocalElement = "";
    let videoElement = "";
    setTimeout(function () {
        for (let i = 0; i < currentRoomNumberCount.value; i++) {
            if (i == 0) {
                newLocalElement = document.getElementById("videolocal");
                newLocalElement.insertAdjacentHTML(
                    "beforeend",
                    callStore.videoTagArray[0],
                );
                videoElement = document.getElementById("myvideo");
                videoElement.srcObject = callStore.videoStreamArray[0];

                // mainVideo Change click event 생성
                const myvideo = document.getElementById("myvideo");

                myvideo.addEventListener("click", function () {
                    // 드로잉 할 때는, 메인화면을 변경할 수 없습니다 출력.
                    if (commonStore.isDrawing) {
                        commonToastMessage(t("toastMessage Drawing NoChangeMainVideo"));
                        return;
                    }

                    if (videoCallHost.value) {
                        // 바둑판 형식이 아닐 경우
                        if (commonStore.callingLayoutType != 1) {
                            // 메인화면 변경
                            video_change(this);

                            // 메인화면 Index 관리
                            callStore.setVideoMainIndex(0);

                            mainVideoChangeFunc(1, "localstream");

                            // Main Video Border Change
                            mainVideoBorder(0);

                            // host가 바라보는 메인 화면으로 변경
                            console.log("hostSelectedMainVideo 15");
                            hostSelectedMainVideo(myid.value);
                        } else if (commonStore.callingLayoutType == 1) {
                            const beforeMainIndex = callStore.videoMainIndex;
                            if (beforeMainIndex == 0 && feeds.value.length !== 0) {
                                document.getElementById("myvideo").style.scale = 1;
                            } else if (
                                beforeMainIndex !== 0 &&
                                feeds.value.length !== 0
                            ) {
                                document.getElementById(
                                    "remotevideo" + beforeMainIndex,
                                ).style.scale = 1;
                            }

                            // 바둑판 일 경우에도 메인화면을 변경할 수 있도록 수정한다.
                            // 실제로 메인 비디오가 존재하지 않기 때문에 mainIndex만 변경하도록 한다.

                            // 메인화면 Index 관리
                            callStore.setVideoMainIndex(0);

                            // Main Video Border Change
                            mainVideoBorder(0);

                            // host가 바라보는 메인 화면으로 변경
                            console.log("hostSelectedMainVideo 16");
                            hostSelectedMainVideo(myid.value);
                        }
                    }
                });
            } else {
                // 해당 예외처리 하게 되면, 중간에 사람이 나가면 그 자리에서 break가 발생하여 주석처리
                // if (feeds.value[i] == null) {
                //  break
                // }
                // eslint-disable-next-line no-lonely-if
                if (feeds.value[i] != null) {
                    // 중복 생성으로 인한 예외처리 : 이미 paneel inner + i가 존재하지 않을 경우만 만들기
                    if (!document.getElementById("panel-inner" + i)) {
                        // console.log("panel-inner 존재하지 않음. : panel-inner" + i)
                        newLocalElement = document.getElementById("videoremote" + i);
                        newLocalElement.insertAdjacentHTML(
                            "beforeend",
                            callStore.videoTagArray[i],
                        );
                        videoElement = document.getElementById("remotevideo" + i);
                        videoElement.srcObject = callStore.videoStreamArray[i];
                    }

                    /* 바둑판 일 경우에도 메인화면을 클릭할 수 있도록 기능을 변경하므로 주석처리 */
                    // 바둑판 형식일 경우 mainVideoBorder 색상 제거
                    // if (commonStore.callingLayoutType == 1) {
                    //  const initFindClass = document.getElementsByClassName(
                    //      "mainVideoBorder"
                    //  )
                    //  // console.log(initFindClass[0])

                    //  // init
                    //  if (initFindClass[0] !== undefined) {
                    //      // console.log(initFindClass[0].id)
                    //      const initFindElement = document.getElementById(
                    //          initFindClass[0].id
                    //      )
                    //      initFindElement.classList.remove("mainVideoBorder")
                    //      initFindElement.style.border = "none"
                    //  }
                    // }

                    // mainVideo Change click event 생성
                    const video = document.getElementById("remotevideo" + i);

                    video.addEventListener("click", function () {
                        // 드로잉 할 때는, 메인화면을 변경할 수 없습니다 출력.
                        if (commonStore.isDrawing) {
                            commonToastMessage(
                                t("toastMessage Drawing NoChangeMainVideo"),
                            );
                            return;
                        }

                        // video_change(
                        if (videoCallHost.value) {
                            // 바둑판 형식일 경우
                            if (commonStore.callingLayoutType != 1) {
                                // eslint-disable-next-line camelcase
                                const main_video = document.getElementById("videoMain");

                                // // mainVideo가 videoOff가 아닐 경우(video가 off이면 해당 영상이 숨겨져있으므로 return 처리만 하게 됨) && mainVideo와 현재 클릭한 video가 같다면 변경하지 않도록 하기. (중복클릭 방지)
                                // if (
                                //  !commonStore.isVideo &&
                                //  main_video.srcObject == srcObject
                                // ) {
                                //  return
                                // }

                                main_video.srcObject = srcObject;
                                // 사용자의 언어에 따라 닉네임 변경
                                const customNickname = customUserNickname(
                                    feeds.value[i].rfdeviceid,
                                );
                                console.log(
                                    "*** methods: videoLayoutChange > customNickname: ",
                                    customNickname,
                                );
                                // $("#videoMainCaption").html(feeds.value[i].rfdisplay)
                                $("#videoMainCaption").html(customNickname);

                                // MainVideo Check
                                if (callStore.videoMainIndex != feeds.value[i].rfindex) {
                                    // $("#videoMainOff").remove()
                                    // $("#videoMain").show()
                                    // mainVideoChangeFunc(1, feeds.value[i].rfdisplay)
                                    mainVideoChangeFunc(1, customNickname);
                                }
                                // const beforeMainIndex = callStore.videoMainIndex
                                // if (beforeMainIndex == 0 && feeds.value.length !== 0) {
                                //  document.getElementById("myvideo").style.scale = 1
                                // } else if (beforeMainIndex !== 0 && feeds.value.length !== 0) {
                                //  document.getElementById("remotevideo" + beforeMainIndex).style.scale = 1
                                // }

                                // Main Index 관리
                                callStore.setVideoMainIndex(feeds.value[i].rfindex);

                                // MainVideo border Change
                                mainVideoBorder(feeds.value[i].rfindex);

                                // host가 바라보는 메인 화면으로 변경
                                console.log("hostSelectedMainVideo 17");
                                hostSelectedMainVideo(feeds.value[i].rfid);
                            } else if (commonStore.callingLayoutType == 1) {
                                const beforeMainIndex = callStore.videoMainIndex;
                                if (beforeMainIndex == 0 && feeds.value.length !== 0) {
                                    document.getElementById("myvideo").style.scale = 1;
                                } else if (
                                    beforeMainIndex !== 0 &&
                                    feeds.value.length !== 0
                                ) {
                                    document.getElementById(
                                        "remotevideo" + beforeMainIndex,
                                    ).style.scale = 1;
                                }
                                // 바둑판 일 경우에도 메인화면을 변경할 수 있도록 수정한다.
                                // 실제로 메인 비디오가 존재하지 않기 때문에 mainIndex만 변경하도록 한다.

                                // Main Index 관리
                                callStore.setVideoMainIndex(feeds.value[i].rfindex);

                                // MainVideo border Change
                                mainVideoBorder(feeds.value[i].rfindex);

                                // host가 바라보는 메인 화면으로 변경
                                console.log("hostSelectedMainVideo 18");
                                hostSelectedMainVideo(feeds.value[i].rfid);
                            }
                        }
                    });

                    if (i == callStore.videoMainIndex) {
                        // console.log("main")
                        // console.log(i)
                        const width = $("#videoMainDivWrap").width();
                        $("#videoMainDivWrap").css("width", width);
                        const mainType = commonStore.userListStatus[i].status;
                        const mainText = commonStore.userListStatus[i].text;
                        // console.log(mainType)
                        // console.log(mainText)
                        if (mainType == "unpublished") {
                            // Main Video 태그를 jauns에서 만들어주기 때문에, 생성 전 일 수도 있으므로 1초뒤 실행
                            mainVideoChangeFunc(0, mainText);
                        } else {
                            mainVideoChangeFunc(1, mainText);
                        }
                        mainVideoBorder(i);
                    }
                }
            }

            if (i == currentRoomNumberCount.value - 1) {
                commonStore.setVideoLayoutChangeResult(false);

                /* motionFailCheck.value == ture 일 경우 videoLayoutchange를 다시 한다. */
                if (motionFailCheck.value) {
                    setTimeout(() => {
                        /* 좌측 정렬이 아닐 경우에만 화면 전환 */
                        if (commonStore.callingLayoutType != 3) {
                            saveVideoInfo();
                        }

                        /* 모션 fail 초기화 */
                        motionFailCheck.value = false;
                        console.log("motionFailCheck False로 초기화");
                    }, 1000);
                }
            }
        }

        // 해당 DOM 이 null 일 경우 재귀함수
        if (newLocalElement == null || videoElement == null) {
            videoLayoutChange();
        }
    }, 2000);
}
// 방에 있는 인원수 체크하여 CallingWindow 동적 생성
function checkRoomNumberCount() {
    console.log("*** methods: checkRoomNumberCount");
    const NullFilterFeeds = feeds.value.filter(function (item) {
        return item !== null;
    });
    // NullFilterFeeds >> 0 (local = empty) 도 Null 값으로 처리하기 때문에 + 1
    if (
        feeds.value.length == currentRoomNumberCount.value - 1 &&
        NullFilterFeeds.length + 1 == currentRoomNumberCount.value - 1
    ) {
        // console.log("Feeds의 length가 같다. callinWindow 추가해야 한다.")
        // addUserListStatus
        addUserListStatus();
        // 현재 roomCount 변화
        commonStore.setRoomNumberCount(currentRoomNumberCount.value + 1);
    }
    // feeds.value length 관리
    commonStore.setFeedsNumberCount(feeds.value.length + 1);
}
function addUserListStatus() {
    console.log("*** methods: addUserListStatus");
    commonStore.addUserListStatus();
}
function mainVideoBorder(index) {
    /* index :: callinwindow index
				만들어진 태그에 class를 추가하면 vue + nuxt는 알아 듣지 못함.
				class를 init 구분자로 사용
				로컬 일 경우 반응 X
			*/

    // console.log("*** methods: mainVideoBorder")
    // mainVideoBorder Class를 사용하고 있는 Element가 있는지 확인
    const initFindClass = document.getElementsByClassName("mainVideoBorder");

    // console.log("mainVideoBorder index: ".concat(index))
    // console.log("initFindClass: ", initFindClass)

    // local Click 시 mainVideoBorder 숨김
    if (index == 0) {
        if (initFindClass.length == 0) {
            // console.log("index 0 인 경우 initFindClass empty")
            return;
        }

        // console.log("index 0 인 경우 initFindClass[0]: ".concat(initFindClass[0]))
        const initFindElement = document.getElementById(initFindClass[0].id);
        initFindElement.classList.remove("mainVideoBorder");
        // initFindElement.style.border = "none"
    } else {
        // if (initFindClass.length == 0) {
        //  console.log("index 0 이 아닌 경우 initFindClass empty")
        //  return
        // }

        // console.log("index 0 이 아닌 경우 initFindClass[0]: ".concat(initFindClass[0]))

        // init (기존 테두리 클리어)
        if (initFindClass.length > 0) {
            console.log("initFindClass[0].id: ".concat(initFindClass[0].id));
            const initFindElement = document.getElementById(initFindClass[0].id);
            initFindElement.classList.remove("mainVideoBorder");
            // initFindElement.style.border = "none"
        }

        // else {
        // border Make
        // const mainVideoElement = document.getElementById("remotevideo" + index)
        // const mainVideoElement = document.getElementById("videoremote" + index)

        // console.log(mainVideoElement)

        // }
        let mainVideoElement = "";
        if (commonStore.callingLayoutType == 1) {
            mainVideoElement = document.getElementById("videoremote" + index);
            mainVideoElement.classList.add("mainVideoBorder");
            // mainVideoElement.style.border = "4px solid white"
            // mainVideoElement.style.overflow = "hidden"
        } else {
            mainVideoElement = document.getElementById("videoremote" + index);
            mainVideoElement.classList.add("mainVideoBorder");
            // mainVideoElement.style.border = "4px solid white"
        }
    }
}
function saveVideoInfo() {
    // console.log("*** methods: saveVideoInfo - changeLayoutType")
    // mask Show
    commonStore.setVideoLayoutChangeResult(true);

    //
    videoArray.value = [];
    videoStream.value = [];
    // 이전 비디오 저장
    // for 조건 문 중 해당 기업의 최대 인원 수로 for문 조건
    // if (videoremote + i)의 dom이 없을 경우 break <-- break 하게 되면, 중간에 사람이 나가면 break 되므로 구현하지 않음.
    for (let i = 0; i < commonStore.roomNumberCount; i++) {
        if (i == 0) {
            videoArray.value[i] = document.getElementById("myvideo").outerHTML;
            videoStream.value[i] = document.getElementById("myvideo").srcObject;
        } else {
            const remoteElement = document.getElementById("remotevideo" + i);
            if (remoteElement != null && remoteElement.srcObject != null) {
                videoArray.value[i] = document.getElementById(
                    "panel-inner" + i,
                ).outerHTML;
                videoStream.value[i] = document.getElementById(
                    "remotevideo" + i,
                ).srcObject;
            }
        }
    }

    // console.log("*** methods: saveVideoInfo. Data: ")
    // console.log(videoArray.value)
    // console.log(videoStream)

    callStore.setVideoInfoArray({
        videoTag: videoArray.value,
        videoStream: videoStream.value,
    });

    commonStore.changeLayoutType(3);

    // main 화면 변경
    setTimeout(function () {
        const mainIndex = callStore.videoMainIndex;
        let video = "";
        if (mainIndex == 0) {
            video = document.getElementById("myvideo");

            const mainVideo = document.getElementById("videoMain");
            mainVideo.srcObject = video.srcObject;
            $("#videoMainCaption").html(sessionStorage.getItem("m_nickname"));

            mainVideoBorder(mainIndex);
        } else {
            video = document.getElementById("remotevideo" + mainIndex);

            const mainVideo = document.getElementById("videoMain");
            mainVideo.srcObject = video.srcObject;

            // 사용자의 언어에 따라 닉네임 변경
            const customNickname = customUserNickname(feeds.value[mainIndex].rfdeviceid);
            // console.log("*** methods: saveVideoInfo > customNickname: ", customNickname)
            // $("#videoMainCaption").html(feeds.value[mainIndex].rfdisplay)
            $("#videoMainCaption").html(customNickname);

            // main border 생성
            mainVideoBorder(mainIndex);
            // location.reload()
        }
    }, 3000);
}
// canvasSaveVideoInfo -> canvasCreateOffer 까지 한다.
function canvasSaveVideoInfo(boolFlag) {
    // console.log("*** methods: canvasSaveVideoInfo", commonStore.callingLayoutType)
    //

    if (commonStore.callingLayoutType != 3) {
        /* layout type != 3 */
        // mask Show
        commonStore.setVideoLayoutChangeResult(true);

        videoArray.value = [];
        videoStream.value = [];
        // 이전 비디오 저장
        // for 조건 문 중 해당 기업의 최대 인원 수로 for문 조건
        // if (videoremote + i)의 dom이 없을 경우 break <-- break 하게 되면, 중간에 사람이 나가면 break 되므로 구현하지 않음.
        for (let i = 0; i < commonStore.roomNumberCount; i++) {
            if (i == 0) {
                videoArray.value[i] = document.getElementById("myvideo").outerHTML;
                videoStream.value[i] = document.getElementById("myvideo").srcObject;
            } else {
                const remoteElement = document.getElementById("remotevideo" + i);
                if (remoteElement != null && remoteElement.srcObject != null) {
                    videoArray.value[i] = document.getElementById(
                        "panel-inner" + i,
                    ).outerHTML;
                    videoStream.value[i] = document.getElementById(
                        "remotevideo" + i,
                    ).srcObject;
                }
            }
        }

        // console.log("*** methods: saveVideoInfo. Data: ")
        // console.log(videoArray.value)
        // console.log(videoStream.value)

        callStore.setVideoInfoArray({
            videoTag: videoArray.value,
            videoStream: videoStream.value,
        });

        // layout 변경
        commonStore.changeLayoutType(3);

        const beforeMainIndex = callStore.videoMainIndex;
        // 드로잉 show !
        callStore.setDrawingIframe(boolFlag);

        // main Index 변경
        callStore.setVideoMainIndex(0);

        // main 화면 변경
        setTimeout(function () {
            const mainIndex = callStore.videoMainIndex;
            let video = "";
            if (mainIndex == 0) {
                video = document.getElementById("myvideo");

                const mainVideo = document.getElementById("videoMain");
                mainVideo.srcObject = video.srcObject;
                $("#videoMainCaption").html(sessionStorage.getItem("m_nickname"));

                mainVideoBorder(mainIndex);
            } else {
                video = document.getElementById("remotevideo" + mainIndex);

                const mainVideo = document.getElementById("videoMain");
                mainVideo.srcObject = video.srcObject;

                // 사용자의 언어에 따라 닉네임 변경
                const customNickname = customUserNickname(
                    feeds.value[mainIndex].rfdeviceid,
                );
                // console.log("*** methods: canvasSaveVideoInfo > customNickname: ", customNickname)
                // $("#videoMainCaption").html(feeds.value[mainIndex].rfdisplay)
                $("#videoMainCaption").html(customNickname);

                // main border 생성
                mainVideoBorder(mainIndex);
                // location.reload()
            }
            // 1번레이아웃에서 다른사용자가 메인일 때 드로잉을 시작한경우 3번레이아웃으로 바뀌면서
            // 호스트가 메인이되며 기존 메인이였던 사용자의 화면 비율을 원래대로 돌려야한다.
            if (beforeMainIndex == 0) {
                // console.log(document.getElementById("myvideo"))
                document.getElementById("myvideo").style.scale = 1;
            } else {
                // console.log(document.getElementById("remotevideo" + beforeMainIndex))
                document.getElementById("remotevideo" + beforeMainIndex).style.scale = 1;
            }
            // canvas createOffer 넣기.
            canvasCreateOffer(boolFlag);
        }, 3000);
    } else {
        /* layout type == 3 */
        // 드로잉 show
        callStore.setDrawingIframe(boolFlag);
        // main Index 변경
        callStore.setVideoMainIndex(0);

        const mainIndex = callStore.videoMainIndex;
        let video = "";
        if (mainIndex == 0) {
            video = document.getElementById("myvideo");

            const mainVideo = document.getElementById("videoMain");
            mainVideo.srcObject = video.srcObject;
            $("#videoMainCaption").html(sessionStorage.getItem("m_nickname"));

            mainVideoBorder(mainIndex);
        } else {
            video = document.getElementById("remotevideo" + mainIndex);

            const mainVideo = document.getElementById("videoMain");
            mainVideo.srcObject = video.srcObject;

            // 사용자의 언어에 따라 닉네임 변경
            const customNickname = customUserNickname(feeds.value[mainIndex].rfdeviceid);
            console.log(
                "*** methods: canvasSaveVideoInfo > customNickname: ",
                customNickname,
            );
            // $("#videoMainCaption").html(feeds.value[mainIndex].rfdisplay)
            $("#videoMainCaption").html(customNickname);

            // main border 생성
            mainVideoBorder(mainIndex);
            // location.reload()
        }

        // mainVideo Change Duration 보내기
        // hostSelected 호출
        console.log("hostSelectedMainVideo 20");
        hostSelectedMainVideo(myid.value);

        setTimeout(function () {
            // canvas createOffer 넣기.
            canvasCreateOffer(boolFlag);
        }, 2000);
    }
}
function sendMessageBroadCast() {
    const sendMessageInfo =
        chattingStore.sendMessageInfo && chattingStore.sendMessageInfo.length > 0
            ? chattingStore.sendMessageInfo[0]
            : {
                  nickname: "",
                  date: "",
                  message: "",
                  type: 0,
                  level: 0,
                  mainVideoName: "",
              };
    const nickname = sendMessageInfo.nickname;
    const datetime = sendMessageInfo.date;
    const message = sendMessageInfo.message;
    const type = sendMessageInfo.type;
    const level = sendMessageInfo.level;
    const mainVideoName = sendMessageInfo.mainVideoName;

    // console.log("##############" + mainVideoName)
    // mainVideoDeviceid 추가
    let mainVideoDeviceid = "";
    // 바둑판이 아닐 경우에만 설정
    if (callingLayoutType.value != 1 && mainVideoName != undefined) {
        if (mainVideoName == sessionStorage.getItem("m_nickname")) {
            mainVideoDeviceid = loginStore.m_local_deviceid || "";
        } else {
            const mainIndex = callStore.videoMainIndex;

            // main이 자신 일 경우
            if (mainIndex == 0) {
                mainVideoDeviceid = loginStore.m_local_deviceid;
            } else {
                mainVideoDeviceid = feeds.value[mainIndex].rfdeviceid;
            }
        }
    }

    // type:3 = calling일 경우 자기 자신에게만 추가.
    if (type != 3) {
        const obj = {
            localdeviceid: loginStore.m_local_deviceid,
            type,
            level,
            message,
            datetime,
            nickname,
            isroom: true,
            mainVideoName,
            mainVideoDeviceid,
        };

        const sendJson = JSON.stringify(obj);
        signallingSocket.emit("notification", sendJson);
        console.log("*** socket: emit notification. json: ", sendJson);

        chattingStore.setSendMessageFlag(false);
    }
}
// rfid로 feeds Index 구하기
function findFeedsIndexRfid(rfid) {
    let FindFeedsIndex = "";
    // console.log("****** feeds :", feeds)
    console.log("****** feeds length :", feeds.value.length);
    // console.log("****** feeds rfid :", rfid)

    for (let i = 1; i < feeds.value.length; i++) {
        if (feeds.value[i] != null && feeds.value[i].rfid == rfid) {
            FindFeedsIndex = feeds.value[i].rfindex;
            break;
        }
    }

    // feeds를 조회했지만 맞는것이 없을 경우 == 자신
    if (FindFeedsIndex == "" && rfid == myid.value) {
        FindFeedsIndex = 0;
    }

    // console.log("****** feeds.value index :", FindFeedsIndex)
    return FindFeedsIndex;
}
function addSendMessageList(nickname, message, level, type) {
    // console.log("*** methods: addSendMessageList")
    const nowDate = getWorldTime();
    chattingStore.sendMessage({
        nickname,
        message,
        level,
        type,
    });

    chattingStore.setSendMessageFlag(true);
}
function addReceiveMessageList(
    nickname,
    date,
    chattingDate,
    message,
    level,
    type,
    mainVideoName,
) {
    // console.log("*** methods: addReceiveMessageList")

    // 데이터 생성 이전의 스크롤 위치를 담아둔다.
    // const scrollTop1 = document.getElementById("chattingBarMessageBoxScroll").scrollTop;
    // const scrollLocation1 =
    //     document.getElementById("chattingBarMessageBoxScroll").scrollHeight -
    //     document.getElementById("chattingBarMessageBoxScroll").clientHeight;

    const scrollTop1 = 0;
    const scrollLocation1 = 0;

    // 스크롤이 마지막 위치에 있는지 여부
    let onOff = false;

    // 스크롤이 '마지막 - 50px ~ 마지막' 위치에 있을 경우 마지막으로 간주함
    if (scrollTop1 >= scrollLocation1 - 50) {
        onOff = true;
    }

    if (mainVideoName != undefined && mainVideoName != null) {
        chattingStore.receiveMessage({
            nickname,
            date,
            chattingDate,
            message,
            level,
            type,
            mainVideoName,
        });
    } else {
        chattingStore.receiveMessage({
            nickname,
            date,
            chattingDate,
            message,
            level,
            type,
        });
    }

    if (!onOff) {
        // if (scrollLocationCheck) {
        // 신규 메시지 알림 호출
        chattingStore.setNewMessageConfrim(true);

        if (level == 0) {
            // newEmergencyConfirm true
            chattingStore.setNewEmergencyConfirm(true);
        }
    } else {
        // 스크롤이 마지막 위치일 경우, 마지막으로 이동시키는 Flow.
        // 즉시 실행 시 element Heigh가 변경 되지 않아 감지 불가능
        setTimeout(function () {
            // 스크롤을 아래로 이동
            // document.getElementById("chattingBarMessageBoxScroll").scrollTop =
            //     document.getElementById("chattingBarMessageBoxScroll").scrollHeight -
            //     document.getElementById("chattingBarMessageBoxScroll").clientHeight;
        }, 100);
    }

    // level = 0 : emergency, 외 normal
    messageBell(level, "play");
    callStore.setUnderStatus(3);
}
// ========= 통화 중 연락처 화면 관련 function =======
// getRecentList
function recentListAllRequest(localdeviceid) {
    const currentTime = getWorldTime();
    const obj = {
        deviceid: localdeviceid,
        current_time: currentTime,
        language: preferenceStore.lang,
    };
    const json = JSON.stringify(obj);
    signallingSocket.emit("lastCallTime", json);
    console.log("*** socket: emit lastCallTime. json:" + json);
}
// getUserList
function userListAllRequest(localDeviceid, enSeq) {
    const obj = {
        deviceid: localDeviceid,
        en_seq: enSeq,
        language: preferenceStore.lang || "ko",
    };
    const json = JSON.stringify(obj);
    signallingSocket.emit("userListAll", json);
    console.log("*** socket: emit userListAll. json:" + json);
}
// getUserStatus
function userStatusRequest(remotedeviceid) {
    const obj = {
        deviceid: remotedeviceid,
    };

    const json = JSON.stringify(obj);
    signallingSocket.emit("userStatus", json);
    // console.log("*** socket: emit userStatus. json: " + json)
}
// getCanMakeCallRequest
function canMakeCallRequest(remotedeviceid) {
    const obj = {
        localdeviceid: loginStore.m_local_deviceid,
        remotedeviceid,
    };

    const json = JSON.stringify(obj);
    signallingSocket.emit("canMakeCall", json);
    console.log("*** socket: emit canMakeCall. json: " + json);
}
function inviteCancelCallingRequest() {
    const obj = {
        localdeviceid: loginStore.m_local_deviceid,
        remotedeviceid: sessionStorage.getItem("m_remote_deviceid"),
        roomid: sessionStorage.getItem("m_roomid"),
        institution: sessionStorage.getItem("m_institution"),
        nickname: sessionStorage.getItem("m_nickname"),
    };
    const json = JSON.stringify(obj);
    signallingSocket.emit("inviteCancelCalling", json);
    console.log("*** socket: emit inviteCancelCalling. json: ", json);

    // 발신 중 모달 해제
    modalStore.closeModal("call");
    sessionStorage.setItem("m_callWaiting", "false");
}
function videoCallHostCheck(roomid, localdeviceid) {
    const obj = {
        roomid,
        localdeviceid,
    };

    const json = JSON.stringify(obj);
    signallingSocket.emit("videoCallHostCheck", json);
    console.log("*** socket: emit videoCallHostCheck. json: " + json);
}
// callingWindow 왕관표시 제거 및 추가
function setHostIcon(index, hostIcon) {
    // console.log("*** methods: setHostIcon")
    commonStore.userListStatus[index].hostIcon = hostIcon;
}
// deviceid로 feeds의 index 구하기
function findFeedsIndexDeviceid(deviceid) {
    let FindFeedsIndex = "";
    console.log("findFeedsIndexDeviceid", feeds.value);
    for (let i = 1; i < feeds.value.length; i++) {
        if (feeds.value[i] != null && feeds.value[i].rfdeviceid == deviceid) {
            FindFeedsIndex = feeds.value[i].rfindex;
            break;
        }
    }
    return FindFeedsIndex;
}
// nickname으로 feeds의 index 구하기
function findFeedsIndexEndUserCall(nickname) {
    let FindFeedsIndex = "";
    // console.log("findFeedsIndexDeviceid", feeds.value, nickname)
    for (let i = 1; i < feeds.value.length; i++) {
        if (feeds.value[i] == null && commonStore.userListStatus[i].text == nickname) {
            FindFeedsIndex = i;
            break;
        }
    }
    return FindFeedsIndex;
}
// nickname으로 feeds의 index 구하기
function findFeedsIndexNickname(nickname) {
    let FindFeedsIndex = "";
    // console.log("findFeedsIndexNickname", feeds.value)
    for (let i = 1; i < feeds.value.length; i++) {
        if (feeds.value[i] != null && feeds.value[i].nickname == nickname) {
            FindFeedsIndex = feeds.value[i].rfindex;
            break;
        }
    }
    return FindFeedsIndex;
}
// feeds.value 에서 deviceid 로 nickname 가져오기
function findFeedsNicknameByDeviceid(deviceid) {
    let nickname = "";
    for (let i = 1; i < feeds.value.length; i++) {
        if (feeds.value[i] != null && feeds.value[i].rfdeviceid == deviceid) {
            nickname = feeds.value[i].rfdisplay;
            break;
        }
    }
    return nickname;
}
function hostChangeRequest(roomid, localdeviceid) {
    const obj = {
        roomid,
        localdeviceid,
    };

    const json = JSON.stringify(obj);
    signallingSocket.emit("videoCallHostRequest", json);
    console.log("*** socket: emit videoCallHostRequest. json: " + json);
}
function hostChange(result, roomid, localdeviceid, hostRequestDeviceid) {
    const obj = {
        result,
        roomid,
        localdeviceid,
        host_request_deviceid: hostRequestDeviceid,
    };

    const json = JSON.stringify(obj);
    signallingSocket.emit("videoCallHostChange", json);
    console.log("*** socket: emit videoCallHostChange. json: " + json);
}
function hostPermissionRequest(seq, nickname, hostDeviceid) {
    escapeFullScreen();
    // 수락 거절 일 경우, nickname 및 정보 저장
    if (seq == 0) {
        callStore.setHostRequestInfo({
            nickname,
            hostDeviceid,
        });
    }
    callStore.setHostRequestStatus(seq);
    // $modal.show(
    //     hostRequestModal,
    //     {},
    //     {
    //         name: "hostModal",
    //         width: "410",
    //         height: "310",
    //         clickToClose: false,
    //     },
    //     {
    //         "before-close": () => {
    //             modalsContainerStyle.display = "none";
    //         },
    //     },
    // );
}
function noneOverlayModal(seq) {
    escapeFullScreen();

    commonStore.setNoneOverlayAlertStatus(seq);
    // $modal.show(
    //     noneOverlayModal,
    //     {},
    //     {
    //         name: "noneOverlayModal",
    //         width: "350",
    //         height: "270",
    //         clickToClose: false,
    //     },
    //     {
    //         "before-close": () => {
    //             modalsContainerStyle.display = "none";
    //         },
    //     },
    // );
}
function alertModal(seq) {
    escapeFullScreen();
    commonStore.setAlertStatus(seq);
}
// 파일 수신 미리보기 모달창 추가
function previewModal(url) {
    escapeFullScreen();

    commonStore.setPreviewModalFlag({
        modalIndex: commonStore.previewModalInfo.previewModalcnt + 1,
        url: url,
        show: "show",
    });
    // // 파일 수신 자동일 경우
    if (autoPictureAccept.value) {
        autoPictureModal.value = true;
    }

    const { open, close } = useModal({
        component: FilePreviewModal,
        key: `preview-modal-${commonStore.previewModalInfo.previewModalcnt + 1}`,
        attrs: {
            previewImage: url,
            hideOverlay: true,
            clickToClose: false,
            class: 'non-overlay',
            onClose: () => close(),
        },
    });
    open();
}

function previewModalHide(result) {
    previewModalState.value = result.showState;
}
// 회의실 알림창 모달 --- ksy
function meetingAlertModal(seq) {
    escapeFullScreen();

    meetingStore.setMeetingAlertStatus(seq);
    if (seq == 1) {
        meetingStore.setMeetingAlertStatus(seq);
        // $modal.show(
        //     meetingAlertModal,
        //     {},
        //     {
        //         name: "meetingAlertModal",
        //         width: "350",
        //         height: "270",
        //         clickToClose: false,
        //     },
        //     {
        //         "before-close": () => {
        //             modalsContainerStyle.display = "none";
        //         },
        //     },
        // );
    } else {
        meetingStore.setMeetingAlertStatus(seq);
    }
}
// 호스트 요청 취소
function hostRequestCancel(roomid, localdeviceid) {
    const obj = {
        roomid,
        localdeviceid,
    };

    const json = JSON.stringify(obj);
    signallingSocket.emit("videoCallHostCancel", json);
    console.log("*** socket: emit videoCallHostCancel. json: " + json);
}
// 전체 음소거 관리
function setAllMicMute(status, hostDeviceid) {
    const obj = {
        status,
        hostDeviceid,
    };

    const json = JSON.stringify(obj);
    signallingSocket.emit("allMicOnOff", json);
    console.log("*** socket: emit allMicOnOff. json: " + json);

    // 전체 음소거 상태 vuex 저장
    // mic OFF : true
    if (status == 0) {
        callStore.setAllMicMuteFlag(true);
        callStore.setMicOnOffFlag(true);
    } else {
        // mic ON : false
        callStore.setAllMicMuteFlag(false);
        callStore.setMicOnOffFlag(false);
    }
}
// 현재 방이 전체 음소거 인지 아닌지 확인 요청
function requestSettingInRoom(roomid, requestDeviceid) {
    const obj = {
        roomid,
        requestDeviceid,
    };

    const json = JSON.stringify(obj);
    signallingSocket.emit("requestSettingInRoom", json);
    console.log("*** socket: emit requestSettingInRoom. json: " + json);
}
// 현재 방에 대한 설정 (음소거상태, mainVideo, 음소거인 사람, videoOff인 사람)
function resultSettingInRoom(
    requestDeviceid,
    hostDeviceid,
    mainVideoRfid,
    muteRfid,
    videoOffRfid,
    useScreenShare,
    useDrawing,
    zoomLevelObj,
) {
    let status = "";
    if (callStore.allMicMuteFlag == true) {
        status = 0;
    } else {
        status = 1;
    }

    const obj = {
        status,
        requestDeviceid,
        hostDeviceid,
        mainVideoRfid,
        muteRfid,
        videoOffRfid,
        useScreenShare,
        useDrawing,
        sendDurationEnable: sendDurationEnableFlag.value, // false
        zoomLevelObj,
    };

    const json = JSON.stringify(obj);
    signallingSocket.emit("resultSettingInRoom", json);
    console.log("*** socket: emit resultSettingInRoom. json: " + json);
}
// 테스트를 위해서 생성한 함수 (사용하지 않음)
function setZoomLevel(level) {
    console.log(level);
    const showHostMainIndex = callStore.videoMainIndex;
    console.log("호스트가 바라보는 메인화면 인덱스", showHostMainIndex);
    let remoteId = "";

    commonStore.userListStatus[0].zoomLevel = level;
    // 내가 호스트가 아니면 호스트의 아이디를 넣어준다
    // if (videoCallHost && showHostMainIndex !== 0) {
    //  commonStore.userListStatus[0].zoomLevel = level
    //  // feeds.value[0].zoomLevel = level
    //  console.log("*** 현재 내가 호스트이면서 내가 메인이다. setZoomLevel")
    //  remoteId = loginStore.m_local_deviceid
    // } else {
    //  commonStore.userListStatus[0].zoomLevel = level
    //  // feeds.value[0].zoomLevel = level
    //  // 내가 호스트가 아니면 호스트의 아이디를 넣어준다
    //  if (videoCallHost) {
    //  } else {
    //      console.log(feeds.value)
    //      console.log(callStore.hostRequestInfo)
    //  }

    // }
    const obj = {
        localdeviceid: loginStore.m_local_deviceid,
        level,
    };
    const json = JSON.stringify(obj);
    signallingSocket.emit("setZoomLevel", json);
    console.log("*** setZoomLevel emit", json);
    console.log("** zoomLevel", commonStore.userListStatus, feeds.value);
    if (videoCallHost.value && showHostMainIndex == 0) {
        console.log("나는 호스트이고 메인인 사용자가 줌레벨을 변경했다");
        hostSelectedMainVideo(myid.value);
    }
}
// 호스트가 바라보는 화면으로 모두 전환 요청
function hostSelectedMainVideo(rfid) {
    console.log(rfid, myid.value);
    // rfid로 인덱스 찾기
    let mainVideoIndex = "";
    let mainVideoDeviceid = "";
    let mainVideoRfid = "";

    if (rfid != myid.value) {
        mainVideoIndex = findFeedsIndexRfid(rfid);
        mainVideoDeviceid = feeds.value[mainVideoIndex].rfdeviceid;
        mainVideoRfid = feeds.value[mainVideoIndex].rfid;

        // mainVideoDeviceid로 메인 사용자의 deviceType 찾기.
        const mainDeviceType = userListGetDevicetype(mainVideoDeviceid);
        // deviceType 2 또는 1일(모바일, 글라스) 경우 고화질 캡쳐 버튼 보이기 -> 테스트로 3으로 설정
        if (mainDeviceType == 1 || mainDeviceType == 2) {
            callStore.setIsGlassSelected(true);
        } else {
            callStore.setIsGlassSelected(false);
            callStore.setHQCaptureShow(false);
        }

        // 내자신이 메인화면이 아닐 경우 bitrate를 낮춘다.
        if (!commonStore.isShare && !commonStore.isDrawing) {
            changeBitrate(subVideoBitrate.value);
        }
        console.log("findFeedsIndex로 mainVideoIndex찾아오기", mainVideoIndex);
    } else {
        mainVideoIndex = 0;
        mainVideoDeviceid = loginStore.m_local_deviceid;
        mainVideoRfid = myid.value;

        // 고화질 캡쳐 버튼 숨김
        callStore.setHQCaptureShow(false);
        callStore.setIsGlassSelected(false);

        // feeds가 생기기도 전에 bitrate를 바꾸게되면 오류 발생하므로, 상대방이 있을 경우에만 bitrate 변경 실행.
        if (feeds.value != null && feeds.value.length > 0) {
            // 화면공유와 드로잉이 아니고, 메인화면이 내 자신일 경우 bitrate 높힘 설정
            if (!commonStore.isShare && !commonStore.isDrawing) {
                changeBitrate(mainVideoBitrate.value);
            }
        }
    }
    let curMainVideoZoomLevel = commonStore.userListStatus[mainVideoIndex].zoomLevel;
    let targetToChange = "";
    // 호스트가 바라보는 메인비디오 사용자의 줌레벨값으로 화면비율을 설정한다.
    if (commonStore.callingLayoutType !== 1) {
        targetToChange = document.getElementById("videoMain");
    } else {
        if (mainVideoIndex == 0) {
            targetToChange = document.getElementById("myvideo");
        } else {
            targetToChange = document.getElementById("remotevideo" + mainVideoIndex);
        }
        // let curMainVideoZoomLevel = commonStore.userListStatus[mainVideoIndex].zoomLevel
        // document.getElementById("videoMain").style.scale = `${(100 * curMainVideoZoomLevel)}%`
    }
    if (targetToChange) {
        targetToChange.style.scale = `${100 * curMainVideoZoomLevel}%`;
    }
    // console.log(commonStore.userListStatus)
    const obj = {
        rfid,
        localDeviceid: loginStore.m_local_deviceid,
        level: commonStore.userListStatus[mainVideoIndex].zoomLevel, // 2021-07-28 테스트
    };
    commonStore.setMainVideoIndex(findFeedsIndexRfid(rfid));
    const json = JSON.stringify(obj);
    signallingSocket.emit("hostSelectedMainVideo", json);
    console.log("*** socket: emit hostSelectedMainVideo. json: " + json);
    // duration Socket Event 호출
    saveVideoDuration(
        mainVideoRfid,
        mainVideoDeviceid,
        sessionStorage.getItem("m_roomid"),
        uniqueRoomid.value, // 2021-07-21 추가
    );

    /* antenna check start */
    antennaCheck(rfid);
}
// 마이크 상태 변경
function micStatusChange(status, hostDeviceid) {
    console.log("*** methods: micStatusChange", hostDeviceid);
    // 현재 마이크 상태 가져오기
    const currentMicStatus = isSounded.value;

    // console.log("currentMicStatus : " + currentMicStatus)
    // 현재 호스트의 remoteFeed Index 가져오기
    const hostIndex = findFeedsIndexDeviceid(hostDeviceid);

    // mic off
    if (status == 0) {
        // console.log("# mic off !")
        // 현재 마이크 상태 변경 : ON -> OFF
        if (!currentMicStatus) {
            commonStore.setIsSounded();

            // 마이크 음소거
            toggleMute();
        }

        // 전체 음소거 vuex 저장
        callStore.setAllMicMuteFlag(true);

        callStore.setAllMicMuteStatus(0);

        // 전체 음소거 저장 용도
        callStore.setMicOnOffFlag(true);

        // 개인 마이크 상태 변경
        callStore.setMicOnOffClick(true);

        // 호스트 이외의 사람들은 전부 마이크 off 버튼 생성
        for (let i = 0; i < feeds.value.length; i++) {
            // 자신 마이크 off 아이콘 표시
            if (i == 0) {
                // console.log("my mic icon off !")
                setUserListMicMute(i, true);
            }

            if (i != hostIndex) {
                if (feeds.value[i] != null) {
                    setUserListMicMute(i, true);
                }
            }
        }

        // 전체 음소거 메세지
        const chattingNickname = userListGetNickname(hostDeviceid);
        const chattingMessage = chattingNickname + t("allMute text1");
        const chattingLevel = 2;
        const chattingType = 0;
        const nowDate = getWorldTime();

        // 전체 음소거 메세지 보내기
        addReceiveMessageList(
            chattingNickname,
            nowDate,
            getChattingTimeZone(nowDate),
            chattingMessage,
            chattingLevel,
            chattingType,
        );
    } else {
        // mic on
        // console.log("# mic on !")
        if (currentMicStatus) {
            // 현재 마이크 상태 변경 : OFF -> ON
            commonStore.setIsSounded();
            // 마이크 음소거 해제
            toggleMute();
        }

        // 전체 음소거 vuex 저장
        callStore.setAllMicMuteFlag(false);

        callStore.setAllMicMuteStatus(1);

        // 전체 음소거 저장 용도
        callStore.setMicOnOffFlag(false);

        // 개인 마이크 상태 변경
        callStore.setMicOnOffClick(false);

        // 호스트 이외의 사람들은 전부 마이크 off 버튼 제거
        for (let i = 0; i < feeds.value.length; i++) {
            // 자신 마이크 off 아이콘 표시
            if (i == 0) {
                // console.log("my mic off icon remove !")
                setUserListMicMute(i, false);

                // 강제로 음소거 된 상태라면 강제로 음소거 vuex 초기화 한다. (false로 변경한다.)
                if (callStore.forceMicOnOffFlag) {
                    callStore.setForceMicOnOffFlag(false);
                }
            }

            if (i != hostIndex) {
                setUserListMicMute(i, false);
            }
        }

        // 상대방에게 전체 음소거 해제 메세지 전달
        const chattingNickname = userListGetNickname(hostDeviceid);
        const chattingMessage = chattingNickname + t("allMute text2");
        const chattingLevel = 2;
        const chattingType = 0;
        const nowDate = getWorldTime();

        // 전체 음소거 해제 메세지 보내기
        addReceiveMessageList(
            chattingNickname,
            nowDate,
            getChattingTimeZone(nowDate),
            chattingMessage,
            chattingLevel,
            chattingType,
        );
    }
}
// 호스트가 바라보는 메인 비디오로 변경
function hostViewMainVideo(feedsIndex) {
    console.log("*** methods: hostViewMainVideo");
    let selectedMainName = "";
    let selectedRemoteVideo = "";

    // console.log(commonStore.userListStatus.length)
    // console.log(
    //  commonStore.userListStatus[
    //      commonStore.userListStatus.length - 1
    //  ].status
    // )

    // 현재 메인 화면이 VIDEO OFF 상태인지 체크한다.
    // 자신
    console.log("***feedsIndex", feedsIndex);

    if (feedsIndex == 0) {
        // 메인화면에 선택된 사람의 상태로 mainVideo 상태를 변경한다.
        // console.log("@@@@@ 여기는 내가 메인이다.")
        if (!commonStore.isVideo) {
            console.log("여기");
            mainVideoChangeFunc(0, "localstream");
        } else if (
            !(
                typeof commonStore.userListStatus[feedsIndex] == "undefined" ||
                commonStore.userListStatus[feedsIndex] == null
            ) &&
            commonStore.userListStatus[feedsIndex].status == "attach"
        ) {
            mainVideoChangeFunc(1, "localstream");
        } else if (
            typeof commonStore.userListStatus[feedsIndex] != "undefined" &&
            commonStore.userListStatus[feedsIndex] != null &&
            commonStore.userListStatus[feedsIndex].status == "unstable"
        ) {
            mainVideoChangeFunc(4, "localstream");
        }

        // index를 통해 remoteFeed의 데이터를 조회한다.
        selectedMainName = sessionStorage.getItem("m_nickname");
        // index를 통해 remotevideo 태그의 srcObject를 가져온다.
        selectedRemoteVideo = document.getElementById("myvideo");
    } else {
        console.log(
            "다른사용자가 메인화면이다, 그 사용자의 zoomLevel",
            commonStore.userListStatus,
        );
        // index를 통해 remoteFeed의 데이터를 조회한다.
        // 사용자의 언어에 따라 닉네임을 변경해서 보여준다.
        selectedMainName = customUserNickname(feeds.value[feedsIndex].rfdeviceid);
        // selectedMainName = feeds.value[feedsIndex].rfdisplay

        // index를 통해 remotevideo 태그의 srcObject를 가져온다.
        selectedRemoteVideo = document.getElementById("remotevideo" + feedsIndex);

        // console.log("####### 여기는 내가 아닌 다른사람이 메인이다.")
        // console.log(commonStore.userListStatus[feedsIndex].status)
        // 메인화면에 선택된 사람의 상태로 mainVideo 상태를 변경한다.
        if (commonStore.userListStatus[feedsIndex].status == "unpublished") {
            console.log("여기");
            mainVideoChangeFunc(0, selectedMainName);
        } else if (commonStore.userListStatus[feedsIndex].status == "attach") {
            mainVideoChangeFunc(1, selectedMainName);
        } else if (commonStore.userListStatus[feedsIndex].status == "unstable") {
            mainVideoChangeFunc(4, selectedMainName);
        }
    }

    console.log(
        "*** methods: hostViewMainVideo - selectedMainName : " + selectedMainName,
    );
    // console.log("# selectedRemoteVideo : " + feedsIndex)

    // console.log("###############")
    // console.log(feedsIndex)
    // MainVideo Border Change
    mainVideoBorder(feedsIndex);

    // 호스트의 줌레벨을 셋팅한다.
    const beforeMainIndex = callStore.videoMainIndex;
    let curMainVideoZoomLevel = commonStore.userListStatus[feedsIndex].zoomLevel;
    let targetToChange = "";
    if (feedsIndex !== "" && commonStore.callingLayoutType !== 1) {
        targetToChange = document.getElementById("videoMain");
    } else if (feedsIndex !== "" && commonStore.callingLayoutType == 1) {
        // 레이아웃 1번일 경우 이전메인비디오의 화면비율은 1로 되돌린다.
        if (beforeMainIndex == 0) {
            console.log(document.getElementById("myvideo"));
            document.getElementById("myvideo").style.scale = 1;
        } else {
            console.log(document.getElementById("remotevideo" + beforeMainIndex));
            document.getElementById("remotevideo" + beforeMainIndex).style.scale = 1;
        }

        // 선택한 메인비디오의 화면 비율을 셋팅한다.
        if (feedsIndex == 0) {
            console.log(document.getElementById("myvideo"));
            targetToChange = document.getElementById("myvideo");
        } else {
            console.log(document.getElementById("remotevideo" + feedsIndex));
            targetToChange = document.getElementById("remotevideo" + feedsIndex);
        }
    }

    if (targetToChange) {
        targetToChange.style.scale = `${100 * curMainVideoZoomLevel}%`;
    }
    // 바둑판 일 경우도 mainIndex를 관리해야 videoLayoutChange 시 호스트와 동일한 화면을 바라봄.
    // Main Index 관리
    callStore.setVideoMainIndex(feedsIndex);
}
// 마이크 버튼 클릭 (개인 마이크 설정)
function micOnOff(status, rfid) {
    const obj = {
        status,
        rfid,
    };

    const json = JSON.stringify(obj);
    signallingSocket.emit("micOnOff", json);
    console.log("*** socket: emit micOnOff. json: " + json);
}
// 강제 마이크 버튼 클릭 (호스트 -> 일반 사용자)
function forceMicOnOff(status, rfid) {
    const obj = {
        status,
        rfid,
    };

    const json = JSON.stringify(obj);
    signallingSocket.emit("forceMicOnOff", json);
    console.log("*** socket: emit forceMicOnOff. json: " + json);
}
// 마이크 음소거 변경
function setUserListMicMute(index, mute) {
    console.log("*** methods: setUserListMicMute");
    commonStore.setUserListMicMute({
        index,
        mute,
    });
}
function setUserListZoomLevel(index, zoomLevel) {
    console.log("*** methods: setUserListZoomLevel");
    commonStore.setUserListZoomLevel({
        index,
        zoomLevel,
    });
}
// 서브비디오 낙하 아이콘 설정
function setSubVideoMotionFall(index, result) {
    console.log("*** methods: setUserListMotionFall");
    commonStore.setUserListMotionFall({
        index,
        result,
    });
}
// 서브비디오 움직임 없음 아이콘 설정
function setSubVideoMotionNoMove(index, result) {
    console.log("*** methods: setUserListNoMove");
    commonStore.setUserListNoMove({
        index,
        result,
    });
}
function saveVideoDuration(mainRfid, deviceid, roomid, uniqueRoomid) {
    const currentTimeStamp = getWorldTime();

    /* Audio Duration 기능 추가로 인한 소스 */
    /* Start */
    // audio 데이터 생성
    const audiosArray = [];

    // eslint-disable-next-line no-new-object
    const audiosDataObject = new Object();

    // 메인화면이 자신일 경우
    if (mainRfid == myid.value) {
        // 사용자들의 rfid를 audios.user_uid로 설정한다.
        for (let i = 1; i < feeds.value.length; i++) {
            if (feeds.value[i] != null) {
                audiosDataObject.user_uid = feeds.value[i].rfid;
                audiosDataObject.deviceid = feeds.value[i].rfdeviceid;

                const audiosData = JSON.stringify(audiosDataObject);
                audiosArray.push(JSON.parse(audiosData));
            }
        }
    } else {
        // 메인화면이 자신이 아닐 경우 > 자신의 아이디를 포함시켜야 한다.
        audiosDataObject.user_uid = myid.value;
        audiosDataObject.deviceid = loginStore.m_local_deviceid;

        const myAudiosData = JSON.stringify(audiosDataObject);
        audiosArray.push(JSON.parse(myAudiosData));

        // 사용자들의 rfid를 audios.user_uid로 설정한다.
        for (let i = 1; i < feeds.value.length; i++) {
            if (feeds.value[i] != null) {
                // 메인화면을 제외한 사용자들을 데이터에 넣는다.
                if (feeds.value[i].rfid != mainRfid) {
                    audiosDataObject.user_uid = feeds.value[i].rfid;
                    audiosDataObject.deviceid = feeds.value[i].rfdeviceid;

                    const audiosData = JSON.stringify(audiosDataObject);
                    audiosArray.push(JSON.parse(audiosData));
                }
            }
        }
    }

    const audioCount = audiosArray.length;

    // console.log("audios", audiosArray)
    // console.log("audio_cnt", audioCount)
    /* End */

    const obj = {
        deviceid,
        user_uid: mainRfid,
        curr_time: currentTimeStamp,
        roomid,
        unique_roomid: uniqueRoomid, // 2021-07-21 추가
        audio_cnt: audioCount, // test : 2021-09-13 추가 (audioDuration)
        audios: audiosArray, // test : 2021-09-13 추가 (audioDuration)
    };

    // console.log("mainRfid : " + mainRfid)
    // console.log("deviceid : " + deviceid)
    // console.log("curr_time : " + currentTimeStamp)

    const json = JSON.stringify(obj);

    signallingSocket.emit("changeDuration", json);
    console.log("*** socket: emit changeDuration. json: " + json);
}
// 회의실 퇴장
function leaveMeeting() {
    // console.log("*** methods: leaveMeeting")

    const obj = {
        meeting_seq: meetingStore.meetingSeq,
        deviceid: loginStore.m_local_deviceid,
        roomid: sessionStorage.getItem("m_roomid"),
    };

    const json = JSON.stringify(obj);

    signallingSocket.emit("leaveMeeting", json);
    console.log("*** socket: emit leaveMeeting. json: " + json);
}
// =>kyj
// 파일 확장자 추출
function getFileExtension(filetype) {
    // console.log("filetype: " + filetype)
    if (filetype.includes("/") === true) {
        const fileLen = filetype.length;
        const lastDot = filetype.lastIndexOf("/");
        const fileExt = filetype.substring(lastDot + 1, fileLen).toLowerCase();
        return fileExt;
    } else {
        return filetype;
    }
}
// -> kyj
// 파일 송수신 자료 파워매니저로 업로드
function createDateName() {
    const date = new Date();
    const month =
        date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;
    const day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
    const hour = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
    const minute = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
    const second = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
    const dateName =
        date.getFullYear() + "_" + month + day + "_" + hour + minute + second;
    return dateName;
}
// 파일을 Blob 으로 변경
function sendFileServerUploadFileToBlob(sendImage) {
    const byteString = atob(sendImage.split(",")[1]);
    const mimeString = sendImage.split(",")[0].split(":")[1].split(";")[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    const bb = new Blob([ab], { type: mimeString });
    return bb;
}

// 파일 송수신 용 서버 업로드
function sendFileServerUpload(type, file, fname, fsize, fileJoinMembers) {
    const parent = this;
    const chunkSize = 64 * 1024; // 64KB
    let offset = 0;
    const dateName = createDateName();
    const fileExt = fname.split(".").pop();
    const sendFileName = `${dateName}_${loginStore.m_local_deviceid}.${fileExt}`;

    // 업로드 시작 알림
    transferSocket.emit(
        "sendFileServerUploadStart",
        JSON.stringify({
            fname: sendFileName,
            fsize,
        }),
    );

    let sent = 0;
    const updateRate = () => {
        const rate = Math.floor((sent / fsize) * 100);
        signallingSocket.emit(
            "fileSendRate",
            JSON.stringify({
                localdeviceid: loginStore.m_local_deviceid,
                remotedeviceid: commonStore.fileReceiver,
                rate,
            }),
        );
        callStore.setTransmissionRate(rate);
    };

    const sendNext = () => {
        if (offset >= fsize) {
            // 끝
            transferSocket.emit(
                "sendFileServerUploadEnd",
                JSON.stringify({ fname: sendFileName }),
            );

            // DB 저장
            const info = {
                en_seq: loginStore.sessionEnSeq,
                hq_seq: loginStore.sessionHqSeq,
                br_seq: loginStore.sessionBrSeq,
                joined_members: fileJoinMembers,
                file_path: str_stream_picture_file_path.value,
                file_name: sendFileName,
                file_type: type,
                getWorldTime: getWorldTime(),
                localdeviceid: loginStore.m_local_deviceid,
                remotedeviceid: commonStore.fileReceiver,
                roomid: sessionStorage.getItem("m_roomid"),
            };
            signallingSocket.emit("sendFileServerUploadInfo", JSON.stringify(info));
            commonStore.setFileSendStatus(6);
            const nickname = userListGetNickname(commonStore.fileReceiver);
            addChatFileSendMessage(nickname, 5, "");
            fileSendReset();
            return;
        }

        const end = Math.min(offset + chunkSize, fsize);
        const slice = file.slice(offset, end);
        const reader = new FileReader();
        reader.onload = (e) => {
            const chunk = e.target.result; // ArrayBuffer
            transferSocket.emit("sendFileServerUploadChunk", {
                fname: sendFileName,
                chunk,
                isLast: end >= fsize,
            });

            sent += chunk.byteLength;
            updateRate();

            offset += chunkSize;
            sendNext(); // 다음 chunk
        };
        reader.readAsArrayBuffer(slice);
    };

    sendNext();
}

// <- kyj
// socket sendMessage
function sendDirectMessageRequest(sender, receiver, type, message, datetime) {
    const obj = {
        sender,
        receiver,
        type,
        message,
        datetime,
    };

    const json = JSON.stringify(obj);
    signallingSocket.emit("directMessage", json);
    console.log("*** socket: emit directMessage");
    console.log(json);
}
// 읽음처리 socket
function readProcess(sender, receiver, datetime) {
    const obj = {
        sender,
        receiver,
        datetime,
    };

    const json = JSON.stringify(obj);
    signallingSocket.emit("directMessageReadProcess", json);
    console.log("*** socket: emit directMessageReadProcess");
    console.log(json);
}
// contactListInCalling에서 메세지 버튼 클릭 시
function requestMessageFunc(reciverDeviceid) {
    //
    console.log(reciverDeviceid);

    const reciverNickname = userListGetNickname(reciverDeviceid);

    // 모달 생성 vuex
    directMessageStore.addChattingModal({
        deviceid: reciverDeviceid,
        nickname: reciverNickname,
    });

    setTimeout(function () {
        $emit("privateChatDeviceID", reciverDeviceid);
    }, 500);
}
// 회의실통화 중 비회원 초대 이메일 전송 클릭 시 --- ksy
function inviteNonMember(nonMemberEmail) {
    const meetingSeq = meetingStore.currentMeetingSeq;

    let obj;
    if (process.env.renewal == "true") {
        obj = {
            meeting_seq: meetingSeq,
            email: nonMemberEmail,
            domain: "http://localhost:3000/watttalk",
            // 'http://localhost:3000' + "/watttalk",
            PMDomain: "https://hdcardev.watttalk.kr", // 파워매니저 URL - 20210923 추가
            en_seq: loginStore.sessionEnSeq, // 20211014 - 회원인지 존재 여부 확인 시 필요
        };
    } else {
        obj = {
            meeting_seq: meetingSeq,
            email: nonMemberEmail,
            domain: "https://hdcardev.watttalk.kr/watttalk",
            PMDomain: "https://hdcardev.watttalk.kr", // 파워매니저 URL - 20210923 추가
            en_seq: loginStore.sessionEnSeq, // 20211014 - 회원인지 존재 여부 확인 시 필요
        };
    }
    const json = JSON.stringify(obj);
    console.log(json);
    signallingSocket.emit("inviteNoneMember", json);
}
// janus destroyed 시 실행 하는 함수들
function janusAndCallingDestroy() {
    //

    // 자신이 화면 공유 상태라면 화면 공유를 제거한다.
    if (commonStore.isShare) {
        console.log("screen Share Stop !!");
        // 문서공유 종료 알림
        requestScreenSharing();
    }

    // 자신이 드로잉 상태라면 드로잉 종료를 알린다.
    if (commonStore.isDrawing) {
        // 드로잉 종료 알림
        const obj = {
            rfid: myid.value,
            status: 0,
        };

        const sendJson = JSON.stringify(obj);
        signallingSocket.emit("drawing", sendJson);
        console.log("*** socket: emit drawing. json: " + sendJson);
    }
    // 사용자 퇴장 직전에 줌레벨 1로 변경 알림 > 다른사용자들은 해당 사용자 퇴장 시 해당 인덱스배열의 zoomLevel을 1로 초기화(ksy)
    // setZoomLevel(1)

    // ksy Test Code - 파일 송신자 새로고침 시 수신창제거
    // cancelFileTransfer(
    //  loginStore.m_local_deviceid,
    //  commonStore.fileReceiver
    // )

    // discalling
    discallingRequest(
        loginStore.m_local_deviceid,
        sessionStorage.getItem("m_remote_deviceid"),
        sessionStorage.getItem("m_roomid"),
        sessionStorage.getItem("m_institution"),
        sessionStorage.getItem("m_nickname"),
    );

    // -> RoomID 를 사용하지 않는다면 RoomID 를 가용하게 만든다
    const obj2 = {
        roomid: sessionStorage.getItem("m_roomid"),
        curr_time: getWorldTime(),
        meeting_seq: meetingStore.meetingSeq, // 룸에 아무도 존재하지 않는다면 회의를 종료 시키기 위해서.
        sendDurationEnable: sendDurationEnable.value, // flag를 통하여 미디어 서버에 보낼지 안보낼지 체크 (혼자인 경우 미디어서버에 보내지 않음)
        unique_roomid: uniqueRoomid.value, // 2021-07-21 추가
    };

    const json2 = JSON.stringify(obj2);
    signallingSocket.emit("destroyRoomID", json2);
    console.log("*** socket: emit destroyRoomID. json: ", json2);

    setTimeout(function () {
        // -> kyj 통화 종료 시간을 기록한다
        const currentTime = getWorldTime();
        const obj = {
            his_seq: sessionStorage.getItem("m_his_seq"),
            end_time: currentTime,
        };
        const json = JSON.stringify(obj);
        signallingSocket.emit("callStopTime", json);
        console.log("*** socket: emit callStopTime. json: ", json);

        // 통화 종료 시 watch 부분에 빼고 여기 넣음. -> 회의실 종료
        leaveMeeting();
    }, 1000);

    clearInterval(setIntervalStream.value);

    // 화면 공유 관련 intever 제거
    if (myVideoCheckInterval.value != null) {
        // console.log(
        //  "****** 화면공유Interval이 null이 아니다. clear 해준다."
        // )
        clearInterval(myVideoCheckInterval.value); // 자기 자신 인터벌 클리어
    }

    // mainStream 관련 interval.value 제거
    if (setIntervalStream.value != null) {
        // console.log(
        //  "****** 메인화면 체크 interval.value null이 아니다. clear 해준다."
        // )
        clearInterval(setIntervalStream.value);
    }

    // callingTimer 관련 interval.value 제거
    if (callTimerInterval.value != null) {
        setCallingTimer("stop");
    }

    // reload
    setTimeout(function () {
        // 세션 삭제 - 위치 이동 : sessionStorage roomid를 미리 삭제해버려서 회의 종료 시 room id가 null이 되기 때문에 위치 이동.
        sessionStorage.removeItem("m_roomid");
        sessionStorage.removeItem("createRoomFlag");
        sessionStorage.removeItem("otherPartyAccess");

        // guest가 입장 시 윈도우 창 닫기
        if (callingType.value == "joinGuestCall") {
            // 비회원 참가 시 window close
            window.location.href = "https://wattsolution.co.kr/";
        } else if (callingType.value == "meetingCall") {
            commonStore.setChangeViewType(1);
            router.push("/meeting");
        } else {
            commonStore.setChangeViewType(0);
            router.push("/dashboard");
        }

        setTimeout(function () {
            window.location.reload();
        }, 500);
    }, 3000);
}
function setCallingTimer(type) {
    // console.log("*** methods: setCallingTimer Function")
    if (type == "init") {
        callStore.setCallingTimer("00:00:00");
    } else if (type == "start") {
        //
        callTimerInterval.value = setInterval(function () {
            // console.log("*** methods: setCallingTimer - interval.value Timer Start")
            callTime.value++;

            // 시간 계산
            callMin.value = Math.floor(callTime.value / 60);
            callHour.value = Math.floor(callMin.value / 60);
            callSec.value = callTime.value % 60;
            callMin.value = callMin.value % 60;

            let calcHour = callHour.value;
            let calcMin = callMin.value;
            let calcSec = callSec.value;

            // 두자리 수가 아니면 앞에 0 붙여주기
            if (calcHour < 10) {
                calcHour = "0" + callHour.value;
            }
            if (calcMin < 10) {
                calcMin = "0" + callMin.value;
            }
            if (calcSec < 10) {
                calcSec = "0" + callSec.value;
            }

            const calcTimer = calcHour + ":" + calcMin + ":" + calcSec;
            callStore.setCallingTimer(calcTimer);

            // 시간초 interval.value 실행 시 Mobile 전체화면을 체크한다.
            // 모바일일 경우만 실행한다. -> 전체화면이 아니라면 전체화면으로 만든다.
            if (
                accessDeviceCheck.value == "Mobile" &&
                document.fullscreenElement == null &&
                fullScreenApplyCount.value == 0
            ) {
                // $("#videoMainDivWrap").css(
                //  "height",
                //  $("#videoMainDivWrap")[0].clientHeight -
                //      $(".header")[0].clientHeight
                // )

                fullScreenApplyCount.value++;
            }
        }, 1000);
    } else if (type == "stop") {
        clearInterval(callTimerInterval.value);
    }
}
function calcAntennaStep(bitrate, height, deviceType) {
    // console.log("*** bitrateInterval ***")
    // console.log(bitrate)
    // console.log(height)
    // console.log(deviceType)

    let antennaStep = 0;
    let calcGlassAntenna = 0; // 글라스 안테나 계산식

    /* 안테나 정보
				bitrate 600 설정 -> 8/26 bitrate 400 설정  -> 3500 기준 배율증가
				5 Step >= 400 -> 5 Step >= 300                2320
				4 Step >= 350 -> 4 Step >= 250                2030
				3 Step >= 300 -> 3 Step >= 200                1740
				2 Step >= 200 -> 2 Step >= 150                1160
				1 Step else -> 1 Step >= else

				5G -> bitrate 3500 설정 : 3500 기준 배율증가
				5 Step >= 2800
				4 Step >= 2100
				3 Step >= 1400
				2 Step >= 700
				1 Step else -> 1
			*/

    // PC 인 경우 및 비회원인 경우
    if (deviceType == 3 || deviceType == 4) {
        if (bitrate >= 400) {
            antennaStep = 5;
        } else if (bitrate >= 350) {
            antennaStep = 4;
        } else if (bitrate >= 300) {
            antennaStep = 3;
        } else if (bitrate >= 200) {
            antennaStep = 2;
        } else {
            antennaStep = 1;
        }
    } else {
        if (bitrate >= 1500) {
            calcGlassAntenna = 5;
        } else if (bitrate >= 1240) {
            calcGlassAntenna = 4;
        } else if (bitrate >= 860) {
            calcGlassAntenna = 3;
        } else if (bitrate >= 480) {
            calcGlassAntenna = 2;
        } else {
            calcGlassAntenna = 1;
        }

        // 해상도 계산
        const resolutionStep = calcResolution(height);

        // (해상도 단계 + 비트레이트 단계)/2
        antennaStep = (resolutionStep + calcGlassAntenna) / 2;
    }

    // 안테나 스텝 vuex 변경
    // 안테나 소수점 일 경우 버림
    callStore.setAntennaStep(Math.floor(antennaStep));
}
// 글라스만 해상도 계산식이 필요함
function calcResolution(height) {
    let resolutionStep = 0;

    if (height >= 720) {
        resolutionStep = 5;
    } else if (height >= 540) {
        resolutionStep = 4;
    } else if (height >= 480) {
        resolutionStep = 3;
    } else if (height >= 360) {
        resolutionStep = 2;
    } else {
        resolutionStep = 1;
    }

    return resolutionStep;
}
// 안테나 변경 소켓 보내기
function changeAntenna(rfid) {
    const obj = { rfid };

    const json = JSON.stringify(obj);
    signallingSocket.emit("changeAntenna", json);
    console.log("*** socket: emit changeAntenna. json:", json);
}
// 안테나 인터벌
function antennaCheck(rfid) {
    /* antenna check start */
    //

    // 진행중인 interval.value 초기화
    if (bitrateTimerinterval.value != null) {
        clearInterval(bitrateTimerinterval.value);
    }

    // 자신 일 경우에는 interval.value 하지 않는다.
    if (myid.value != rfid) {
        // 안테나 표시
        if (!commonStore.antennaStatus) {
            callStore.setAntennaStatus(true);
        }

        // feedIndex 가져오기
        const feedIndex = findFeedsIndexRfid(rfid);

        /* 비디오 체크 및 마이크 체크 */
        const mediaTrackCheck = remoteFeedMediaTrackCheck("video", feedIndex);
        console.log("mediaDeviceCheck", mediaTrackCheck);

        // 비디오 device가 존재할 경우에만 실행
        if (mediaTrackCheck) {
            /* bitrate 인터벌 시작 */
            bitrateTimerinterval.value = setInterval(function () {
                if (
                    feeds.value[feedIndex] != null &&
                    $("#remotevideo" + feedIndex).length != 0
                ) {
                    const bitrate = feeds.value[feedIndex]
                        .getBitrate()
                        .split("kbits")[0]
                        .trim();
                    const width = $("#remotevideo" + feedIndex).get(0).videoWidth;
                    const height = $("#remotevideo" + feedIndex).get(0).videoHeight;

                    // 드로잉 또는 화면공유 중 videoTracks 없을 경우 frame = 0
                    let frame = 0;
                    if (
                        $("#remotevideo" + feedIndex)[0].srcObject.getVideoTracks()
                            .length != 0
                    ) {
                        frame = Math.round(
                            $("#remotevideo" + feedIndex)[0]
                                .srcObject.getVideoTracks()[0]
                                .getSettings().frameRate,
                        );
                    }

                    const deviceType = userListGetDevicetype(
                        feeds.value[feedIndex].rfdeviceid,
                    );
                    // 안테나 계산
                    calcAntennaStep(bitrate, height, deviceType);

                    const resolution = width + " x " + height;

                    // antennaInfo 등록
                    callStore.setAntennaInfo({
                        bitrate,
                        frame,
                        resolution,
                    });
                }
            }, 3000);
        } else {
            // 카메라가 없을 경우 안테나 숨김
            callStore.setAntennaStatus(false);

            // antennaInfo 초기화
            callStore.setAntennaInfo({
                bitrate: 0,
                frame: 0,
                resolution: 0,
            });
        }
        /* bitrate 인터벌 끝 */
    } else {
        // 안테나 제거
        callStore.setAntennaStatus(false);

        // antennaInfo 초기화
        callStore.setAntennaInfo({
            bitrate: 0,
            frame: 0,
            resolution: 0,
        });
    }

    // 호스트일 경우만 changeAntenna 소켓 보내기
    if (videoCallHost.value) {
        changeAntenna(rfid);
    }
    /* antenna check end */
}
async function moveThumbnail(localDeviceid, remoteDeviceid) {
    drawingStore.setReadyStatus(true);
    drawingStore.addFirstInFiles();
    drawingStore.setBeforeCloseCanvas(false);

    // 현재 썸네일 리스트를 가져온다.
    const myThumbnailList = drawingStore.files.map((b) => Object.assign(b));
    console.log(myThumbnailList, "My thumbnail");
    const thumbnailList = [];

    console.log("canvasHistory: ", drawingStore.canvasHistory);

    for (let i = 0; i < myThumbnailList.length; i++) {
        if (myThumbnailList[i].type == "canvas" || myThumbnailList[i].type == "img") {
            // 기존 코드
            // myThumbnailList[i].history.currentStateIndex = 0
            // myThumbnailList[i].history.state =
            // myThumbnailList[i].history.state.splice(myThumbnailList[i].history.state.length - 1, 1)
            // 신규 코드
            myThumbnailList[i].history = drawingStore.files[i].history;
            thumbnailList.push(myThumbnailList[i]);
        } else if (myThumbnailList[i].type == "pdf") {
            console.log("pdf in");
            for (let j = 0; j < pdfUrlSaveArrays.value.length; j++) {
                if (pdfUrlSaveArrays.value[j].groupIndex == myThumbnailList[i].group) {
                    console.log("same group");
                    for (let k = 0; k < pdfUrlSaveArrays.value[j].pages.length; k++) {
                        if (myThumbnailList[i].pdf[k].history.state.length == 0) {
                            console.log("no length");
                            myThumbnailList[i].pdf[k].img =
                                pdfUrlSaveArrays.value[j].pages[k].url;
                        } else {
                            console.log("yes length");
                            for (
                                let l = 0;
                                l < myThumbnailList[i].pdf[k].history.state.length;
                                l++
                            ) {
                                const changeURL = JSON.parse(
                                    myThumbnailList[i].pdf[k].history.state[l],
                                );
                                if (
                                    changeURL.objects[0].src != pdfUrlSaveArrays.value[j]
                                ) {
                                    changeURL.objects[0].src =
                                        pdfUrlSaveArrays.value[j].pages[k].url;
                                    changeURL.objects[0].crossOrigin = "anonymous";
                                    myThumbnailList[i].pdf[k].history.state[l] =
                                        JSON.stringify(changeURL);
                                }
                            }
                            console.log("PDFPDFPDFPDF", myThumbnailList[i]);
                            // myThumbnailList[i].pdf[k].history.currentStateIndex = 0
                            // myThumbnailList[i].pdf[k].history.state = myThumbnailList[
                            //  i
                            // ].pdf[k].history.state.splice(
                            //  myThumbnailList[i].pdf[k].history.state.length - 1,
                            //  1
                            // )
                        }
                    }
                    thumbnailList.push(myThumbnailList[i]);
                }
            }
        }
    }
    console.log(thumbnailList, "new thumbnail");

    const lastGroup = drawingStore.pdfGroup;
    const lastIndex = drawingStore.index;
    const firstHistory = { ...drawingStore.firstHistory };
    const firstFiles = [...drawingStore.firstFiles];

    // 신규 코드
    const lastCanvasJson = drawingStore.lastCanvasJson;
    // 기존 코드 (호스트 이관 시 이어서 드로잉을 위해 주석 처리)
    // const canvasJson = thumbnailList.length < 1 ? null : thumbnailList[0].history
    // const lastCanvasJson = canvasJson == null ? null : canvasJson.state[canvasJson.currentStateIndex]

    const pdfUrlSaveArrays = [...pdfUrlSaveArrays.value];
    // console.log("lastJson", lastCanvasJson)
    // console.log("pdfUrlSaveArrays", pdfUrlSaveArrays)

    // const canvasHistory = drawingStore.canvasHistory
    const selectedFileIndex = drawingStore.selectedFileIndex;
    const selectedPdfIndex = drawingStore.pdfIndex;
    const isDrawingEnable = commonStore.isDrawing; // 드로잉 중이였는지 상태 확인
    // console.log("selectedFileIndex: ".concat(selectedFileIndex))

    // 썸네일 리스트가 없을 경우는 보내지 않는다.
    if (thumbnailList.length != 0) {
        const obj = {
            localDeviceid,
            remoteDeviceid,
            thumbnailList,
            lastGroup,
            lastIndex,
            firstHistory,
            firstFiles,
            pdfUrlSaveArrays,
            selectedFileIndex,
            selectedPdfIndex,
            isDrawingEnable,
        };

        // lastCanvasJson,
        // canvasHistory,

        const json = JSON.stringify(obj);
        signallingSocket.emit("moveThumbnail", json);
        console.log("*** socket: emit moveThumbnail");
        // console.log(json)

        // 자신의 썸네일 초기화
        drawingStore.setIsThumbnailTransfer(true);
    }
    nextTick(() => {
        videoResize();
    });
}
function getMeetingInfo(meetingSeq) {
    const obj = {
        meeting_seq: meetingSeq,
    };

    const json = JSON.stringify(obj);
    signallingSocket.emit("getMeetingInfo", json);
    console.log("*** socket: emit getMeetingInfo");
    console.log(json);
}

function base64ToBlob(base64) {
    const commaIndex = base64.indexOf(",");
    if (commaIndex === -1) throw new Error("Invalid base64 string");

    const prefix = base64.substring(0, commaIndex);
    const base64Data = base64.substring(commaIndex + 1);

    // 안전하게 MIME 타입 추출
    const colonIndex = prefix.indexOf(":");
    const semicolonIndex = prefix.indexOf(";", colonIndex + 1);
    if (colonIndex === -1 || semicolonIndex === -1)
        throw new Error("Invalid base64 string");

    const mime = prefix.substring(colonIndex + 1, semicolonIndex);

    const byteString = atob(base64Data);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uint8Array = new Uint8Array(arrayBuffer);

    for (let i = 0; i < byteString.length; i++) {
        uint8Array[i] = byteString.charCodeAt(i);
    }

    return new Blob([arrayBuffer], { type: mime });
}

function commonFileServerUpload(fname, fsize, sendImageSrc, type) {
    const dateName = createDateName();
    const fileExtension = fname.split(".").pop();
    const fileType = "picture";

    const sendFileName = `${dateName}_${loginStore.m_local_deviceid}.${fileExtension}`;

    // base64 string을 Blob으로 변환
    const blob = base64ToBlob(sendImageSrc);

    const chunkSize = 64 * 1024; // 64KB
    const totalChunks = Math.ceil(blob.size / chunkSize);
    let chunkIndex = 0;
    let sizeSent = 0;

    const reader = new FileReader();

    function readAndSendChunk() {
        const start = chunkIndex * chunkSize;
        const end = Math.min(start + chunkSize, blob.size);
        const chunkBlob = blob.slice(start, end);
        reader.readAsArrayBuffer(chunkBlob);
    }

    reader.onload = (e) => {
        const buffer = e.target.result;
        sizeSent += buffer.byteLength;

        // 기존 이벤트명 유지, 청크별 바이너리 데이터 전송
        transferSocket.emit("sendFileServerUpload", {
            chunkIndex,
            totalChunks,
            data: new Uint8Array(buffer),
            fname: sendFileName,
            type: fileType,
        });

        chunkIndex++;

        if (chunkIndex < totalChunks) {
            readAndSendChunk();
        } else {
            // 모든 청크 전송 완료 후 DB 저장 요청 등 처리
            let obj2;

            if (type === "drawingImage") {
                obj2 = {
                    en_seq: loginStore.sessionEnSeq,
                    hq_seq: loginStore.sessionHqSeq,
                    br_seq: loginStore.sessionBrSeq,
                    joined_members: sessionStorage.getItem("m_nickname"),
                    file_path: str_stream_picture_file_path.value,
                    file_name: sendFileName,
                    file_type: fileType,
                    getWorldTime: getWorldTime(),
                    localdeviceid: loginStore.m_local_deviceid,
                    remotedeviceid: null,
                    roomid: sessionStorage.getItem("m_roomid"),
                };

                // 초기화
                callStore.setDrawingGetFileSrc("");
                callStore.setDrawingGetFileObject(null);
                callStore.setDrawingGetFileChangeFlag(false);
            } else if (type === "captureImage") {
                const videoMainIndex = callStore.videoMainIndex;

                let joinMembers = "";
                let localdeviceid = "";

                if (feeds.value[videoMainIndex] != null && videoMainIndex !== 0) {
                    joinMembers =
                        sessionStorage.getItem("m_nickname") +
                        ", " +
                        feeds.value[videoMainIndex].rfdisplay;
                    localdeviceid = feeds.value[videoMainIndex].rfdeviceid;
                } else {
                    joinMembers = sessionStorage.getItem("m_nickname");
                    localdeviceid = loginStore.m_local_deviceid;
                }

                obj2 = {
                    en_seq: loginStore.sessionEnSeq,
                    hq_seq: loginStore.sessionHqSeq,
                    br_seq: loginStore.sessionBrSeq,
                    joined_members: joinMembers,
                    file_path: str_stream_picture_file_path.value,
                    file_name: sendFileName,
                    file_type: fileType,
                    getWorldTime: getWorldTime(),
                    localdeviceid,
                    remotedeviceid: loginStore.m_local_deviceid,
                    roomid: sessionStorage.getItem("m_roomid"),
                };
            }

            signallingSocket.emit("sendFileServerUploadInfo", JSON.stringify(obj2));
            console.log("*** socket: sendFileServerUploadInfo request:", obj2);
        }
    };

    // 전송 시작
    readAndSendChunk();

    console.log("*** socket: sendFileServerUpload request: " + sendFileName);
}
// drawingPDFServerUpload
function drawingPDFServerUpload(fname, fsize, pdfSrc) {
    const dateName = createDateName();
    const fileExtension = fname.split(".").pop();
    const fileType = "pdf";

    const sendFileName = `${dateName}_${loginStore.m_local_deviceid}.${fileExtension}`;
    PDFsendFileName.value = sendFileName;

    const chunkSize = 64 * 1024; // 64KB
    const totalChunks = Math.ceil(fsize / chunkSize);

    let chunkIndex = 0;
    let sizeSent = 0;

    const reader = new FileReader();

    function readAndSendChunk() {
        const start = chunkIndex * chunkSize;
        const end = Math.min(start + chunkSize, fsize);
        const blob = pdfSrc.slice(start, end);

        reader.readAsArrayBuffer(blob);
    }

    reader.onload = (e) => {
        const buffer = e.target.result;
        sizeSent += buffer.byteLength;
        let progress = Math.floor((sizeSent / fsize) * 100);

        // 진행률 100보다 크면 100으로 고정
        if (progress > 100) progress = 100;

        // 기존 전송 이벤트 사용 (서버에서 청크 합치기 구현 필요)
        transferSocket.emit("sendPdfFileServerUpload", {
            chunkIndex,
            totalChunks,
            data: new Uint8Array(buffer),
            fname: sendFileName,
            type: fileType,
        });

        callStore.setPDFUploadProgrss(Math.floor(progress / 2));

        chunkIndex++;

        if (chunkIndex < totalChunks) {
            readAndSendChunk();
        } else {
            // 업로드 완료 후 처리

            if (!callStore.PDFcancelUploadFlag) {
                clearInterval(PDFCancelUploadInterval.value);

                const obj2 = {
                    en_seq: loginStore.sessionEnSeq,
                    hq_seq: loginStore.sessionHqSeq,
                    br_seq: loginStore.sessionBrSeq,
                    joined_members: sessionStorage.getItem("m_nickname"),
                    file_path: str_stream_picture_file_path.value,
                    file_name: sendFileName,
                    file_type: fileType,
                    getWorldTime: getWorldTime(),
                    localdeviceid: loginStore.m_local_deviceid,
                    remotedeviceid: null,
                    roomid: sessionStorage.getItem("m_roomid"),
                };
                signallingSocket.emit("sendFileServerUploadInfo", JSON.stringify(obj2));

                const pdfToImageInfo = {
                    file_name: sendFileName,
                    groupIndex: drawingStore.lastPDFGroupIndex,
                };
                transferSocket.emit("pdfToImage", JSON.stringify(pdfToImageInfo));
            } else {
                // 업로드 취소 처리 (기존 로직 유지)
                callStore.removePdfUploadQueArray();
                callStore.setPDFcancelUploadFlag(false);
                console.log(
                    "*** setPDFCancelUploadFlag Change : ",
                    callStore.PDFcancelUploadFlag,
                );

                if (callStore.pdfUploadQueArray.length > 0) {
                    callStore.setPDFUploading(true);
                    const next = callStore.pdfUploadQueArray[0];
                    drawingPDFServerUpload(next.name, next.size, next.src);
                }
            }
        }
    };

    // 취소 감시용 인터벌 (기존 코드 유지)
    PDFCancelUploadInterval.value = setInterval(() => {
        if (callStore.PDFcancelUploadFlag) {
            console.log("*** transfer socket: PDF CancelUpload - abort upload");

            // 취소 플래그 세팅
            callStore.setDrawingGetPDFUploadFlag(false);
            callStore.setPDFUploading(false);
            callStore.setPDFUploadProgrss(0);
            clearInterval(PDFCancelUploadInterval.value);

            // reader가 읽고 있으면 중단 가능 (FileReader는 abort 지원)
            if (reader.readyState === 1) {
                reader.abort();
            }
        }
    }, 1000);

    // 업로드 시작
    readAndSendChunk();

    // 드로잉 관련 UI 상태 초기화 (기존 코드 유지)
    callStore.setDrawingGetPDFUploadSrc("");
    callStore.setDrawingGetPDFUploadObject(null);
}

// 방 인원 초과
function roomFullRequest() {
    const obj = {
        leaveDeviceid: loginStore.m_local_deviceid,
        remoteDeviceid: sessionStorage.getItem("m_remote_deviceid"),
        roomid: sessionStorage.getItem("m_roomid"),
    };
    const json = JSON.stringify(obj);
    signallingSocket.emit("roomFull", json);
    console.log("*** socket: emit roomFull. json: ", json);
}
// 캔버스를 createOffe 한다.
function canvasCreateOffer(type) {
    // console.log("*** method: canvasCreateOffer()")
    //
    // console.log("globalVideoSend.value = ", globalVideoSend.value)
    // console.log("globalAudioSend.value = ", globalAudioSend.value)

    // const useAudio = true
    const useAudio = globalAudioSend.value;

    let videoOrCanvas = "stdres-16:9"; // 영상을 stdres로 보여주는지 hires로 보여주는지 전역 변수로 사용되면 좋을 듯 하다.

    if (type) {
        videoOrCanvas = "canvas";
        // console.log("공유한다.")
    } else {
        // videoOrCanvas = "stdres-16:9"
        // 전역으로 관리되는 카메라 장치 값이 true 라면 카메라 공유를 하겠지만, false라면 video None을 사용
        // eslint-disable-next-line no-lonely-if
        if (globalVideoSend.value) {
            videoOrCanvas = "stdres-16:9";
        } else {
            videoOrCanvas = "videoNone";
        }
    }

    if (canvasDrawInterval.value != null) {
        // console.log("****** Interval이 null이 아니다. clear 해준다.")
        clearInterval(canvasDrawInterval.value); // 자기 자신 인터벌 클리어
    }

    // // 화면 공유 전 나의 상태가 video OFF 였다면 videoOFF 상태로 돌려주기.
    // if (callStore.myVideoStatus == "videoOFF") {
    //  commonStore.isVideo")
    // }

    // mic가 off일 경우 mic 음소거 처리
    let replaceAudioResult = "";
    if (isSounded.value) {
        replaceAudioResult = false;
    } else {
        replaceAudioResult = true;
    }

    sfutest.value.createOffer({
        media: {
            audioRecv: false,
            videoRecv: false,
            audioSend: useAudio,
            // videoSend: true,
            videoSend: globalVideoSend.value,
            replaceAudio: replaceAudioResult,
            replaceVideo: true,
            video: videoOrCanvas, // canvas 공유의 핵심 코드
            selectedMicID: commonStore.selectedMicID,
            selectedCamIndex: commonStore.selectedCamIndex,
        },

        simulcast: doSimulcast.value,
        simulcast2: doSimulcast2.value,
        success(jsep) {
            // console.log("success")
            Janus.debug("Got publisher SDP!", jsep);
            const publish = { request: "configure", audio: useAudio, video: true };
            sfutest.value.send({ message: publish, jsep });

            // drawing이 활성화 되어 있을 때만 실행한다.
            if (type) {
                // // 내 자신이 videoOFF 일 경우 MyVideoStatus를 videoOFF로 저장하고,
                // // 현재 비디오를 attach로 변경한다.
                // // 저장하는 이유는, 드로잉을 종료할 때 MyVideoStatus가 videoOFF이면 자신의 카메라 비디오 오프를 해주기 위해서.
                if (commonStore.isVideo == true) {
                    // callStore.setMyVideoStatus", "videoOFF")
                    commonStore.setIsVideo();
                }

                // // main Index 변경
                // callStore.setVideoMainIndex", 0)

                // // video Layout Type Change
                // if (commonStore.callingLayoutType != 3) {
                //  // videolayout change
                //  saveVideoInfo()
                // } else {
                //  const mainIndex = callStore.videoMainIndex
                //  let video = ""
                //  if (mainIndex == 0) {
                //      video = document.getElementById("myvideo")

                //      const mainVideo = document.getElementById("videoMain")
                //      mainVideo.srcObject = video.srcObject
                //      $("#videoMainCaption").html(
                //          sessionStorage.getItem("m_nickname")
                //      )

                //      mainVideoBorder(mainIndex)
                //  } else {
                //      video = document.getElementById("remotevideo" + mainIndex)

                //      const mainVideo = document.getElementById("videoMain")
                //      mainVideo.srcObject = video.srcObject
                //      $("#videoMainCaption").html(feeds.value[mainIndex].rfdisplay)

                //      // main border 생성
                //      mainVideoBorder(mainIndex)
                //      // location.reload()
                //  }
                // }

                // mainVideo Change Duration 보내기
                // hostSelected 호출
                hostSelectedMainVideo(myid.value);

                // 캔버스에 접근
                // upper-canvas 에 찍는건 mediaStream 이 재생되고 있다는걸 알리지 못함.
                const canvas = document.getElementById("pt2Canvas");
                const context = canvas.getContext("2d");

                // x좌표/y좌표 1, 1 위치에 가로/세로 1, 1의 투명색 점을 1초 마다 찍는 코드
                // 이렇게 함으로 canvas의 mediaStream이 재생되고 있다고 알림
                let aaaaa = 1;
                const flag = true;
                // let flag = true
                canvasDrawInterval.value = setInterval(function () {
                    if (flag) {
                        context.fillStyle = "rgb(255, 255, 255)";
                        context.beginPath();
                        context.fillRect(1, 1, 1, 1);
                        context.closePath();
                        context.fill();
                        // 원본
                        // context.fillStyle = "rgb(0, 0, 0, 0)"
                        // context.fillRect(1, 1, 1, 1)
                    }
                    // 테스트
                    // if (aaaaa == 1) {
                    //  // 지울떄는 흰색으로 지움
                    //  console.log("true....")
                    //  context.fillStyle = "rgb(255,255,255)"
                    //  context.clearRect(0, 0, 100, 100)
                    //  context.beginPath()
                    //  // context.fillStyle = "rgb(1, 1, 1, 100)"
                    //  // context.fillRect(0, 0, 100, 100)
                    // }
                    // else {
                    //  // 찍을떄는 검은색으로 찍음
                    //  console.log("false....")
                    //  context.fillStyle = "rgb(255, 255, 255)"
                    //  context.fillRect(0, 0, 100, 100)
                    //  aaaaa = 0
                    // }
                    // aaaaa++;
                    // 원본
                    // context.fillStyle = "rgb(0, 0, 0, 0)"
                    // context.fillRect(1, 1, 1, 1)
                }, 125);

                // 드로잉 알림
                const obj = {
                    rfid: myid.value,
                    status: 1,
                };

                const sendJson = JSON.stringify(obj);
                signallingSocket.emit("drawing", sendJson);
                console.log("*** socket: emit drawing. json: " + sendJson);
            } else {
                // 드로잉 -> 화면공유로 이동하는 것이라면 화면공유로 이동해라.
                // console.log("drawingMoveToScreen", callStore.drawingMoveToScreen)

                // noneOverlatyAlert에서 드로잉 중 화면공유로 이동한다는 것을 true로 설정헌다.
                if (callStore.drawingMoveToScreen) {
                    // console.log("drawingMoveToScreen이 true이기 때문에  screenShare를 실행합니다.")
                    commonStore.setIsShare();

                    // noneOverlatyAlert에서 드로잉 중 화면공유로 이동한다는 것을 변수에 저장한다.
                    // 드로잉 -> 화면공유 이동 시 화면 공유 호출 후 초기화
                    callStore.setDrawingMoveToScreen(false);
                }

                // 드로잉 종료 후 메인화면이 생성되면서, DOM이 초기화 되므로 이름을 넣어주어야 한다.
                $("#videoMainCaption").html(sessionStorage.getItem("m_nickname"));

                // 드로잉 종료 알림
                const obj = {
                    rfid: myid.value,
                    status: 0,
                };

                const sendJson = JSON.stringify(obj);
                signallingSocket.emit("drawing", sendJson);
                console.log("*** socket: emit drawing. json: " + sendJson);
            }
        },
        error(error) {
            Janus.error("WebRTC error:", error);
            console.log("*** methods: canvasCreateOffer - WebRTC Error. " + error);

            if (commonStore.isDrawing) {
                commonStore.setIsDrawing();
            } else {
                canvasCreateOffer(false);
            }
            // if (useAudio) {
            //  publishOwnFeed(false)
            // } else {
            //  console.log("*** methods: canvasCreateOffer:: error::: else")
            //  // $('#publish').removeAttr('disabled').click(function() { publishOwnFeed(true); });
            // }
        },
    });
}
// laserPointer socket
function laserPointerBroadCast() {
    const obj = {
        xLocation: callStore.laserPointerLaction[0].x,
        yLocation: callStore.laserPointerLaction[0].y,
    };
    const json = JSON.stringify(obj);
    signallingSocket.emit("laserPointer", json);
    console.log("*** socket: emit laserPointer. json: ", json);
}
/* 비디오 체크 및 마이크 체크 */
function remoteFeedMediaTrackCheck(type, feedIndex) {
    if ($("#remotevideo" + feedIndex).length != 0) {
        const mediaTrack = $("#remotevideo" + feedIndex)[0].srcObject.getTracks();

        // 마이크 체크
        if (type == "mic") {
            let userMicTrack = false;

            for (let i = 0; i < mediaTrack.length; i++) {
                if (mediaTrack[i].kind == "audio") {
                    userMicTrack = true;
                    break;
                }
            }

            return userMicTrack;
            // 카메라 체크
        } else if (type == "video") {
            let userCameraTrack = false;

            for (let i = 0; i < mediaTrack.length; i++) {
                if (mediaTrack[i].kind == "video") {
                    userCameraTrack = true;
                    break;
                }
            }

            return userCameraTrack;
        }
    }
}
function changeBitrate(bitrate) {
    if (typeof sfutest.value !== "undefined" && sfutest.value !== null) {
        sfutest.value.send({
            message: {
                request: "configure",
                bitrate,
            },
        });

        // console.log("*** methods: changeBitrate - jauns customBitrate sfutest.value Send. customBitrate = " + bitrate)
    }
}
function requestHQCapture() {
    // console.log("*** methods: requestHQCaptrue")
    // mainIndex 조회
    const mainIndex = callStore.videoMainIndex;

    // mainIndex를 이용하여 feeds의 deviceid 조회하기
    const remotedeviceid = feeds.value[mainIndex].rfdeviceid;

    const obj = {
        localdeviceid: loginStore.m_local_deviceid,
        remotedeviceid,
        enabled: 1, // true
    };

    const json = JSON.stringify(obj);
    signallingSocket.emit("requestHQCapture", json);
    console.log("*** socket: emit requestHQCapture. json: ", json);
}
// 부재중 전화 기록
function setMissedCall(hisSeq, localDeviceid, remoteDeviceid, sendCallTime) {
    const obj = {
        his_seq: hisSeq,
        local_deviceid: localDeviceid,
        remote_deviceid: remoteDeviceid,
        sendCall_time: sendCallTime,
    };

    const json = JSON.stringify(obj);
    signallingSocket.emit("missedCall", json);
    console.log("*** socket: emit missedCall. json: ", json);
}
/* 신규 사용자 Audio Duration Insert */
function insertNewAudioDuration(mainRfid, myRfid, deviceid, uniqueRoomid) {
    const obj = {
        user_uid: mainRfid,
        my_uid: myRfid,
        deviceid,
        unique_roomid: uniqueRoomid.value,
        curr_time: getWorldTime(),
    };

    const json = JSON.stringify(obj);
    signallingSocket.emit("insertNewAudioDuration", json);
    console.log("*** socket: emit insertNewAudioDuration. json: ", json);
}
// 이전 메세지 가져오기
function getPreviousMessage() {
    // 이전 메세지 보기 클릭 시 해당 vuex 저장 (상대방의 deviceid)
    const clickModalDeviceid = directMessageStore.previousMessageInfo;

    // 모달 1개일 경우 > directMessageList 자체가 0일 경우 - 현재 시간으로부터 이전 메세지를 가져온다.
    if (directMessageStore.directMessageList.length == 0) {
        const obj = {
            sender: loginStore.m_local_deviceid,
            receiver: clickModalDeviceid,
            datetime: getWorldTime(), // 현재 시간으로 부터 이전 메세지 가져오기
            count: directMessageStore.previousMessageCount, // 이전 메세지 가져올 갯수
        };

        const json = JSON.stringify(obj);

        signallingSocket.emit("getPreviousMessage", json);
        console.log("*** socket.emit: getPreviousMessage Request: " + json);

        // 이전 메세지 클릭한 모달창 정보 초기화
        directMessageStore.setPreviousMessageInfo("");
    } else {
        // directMessage List를 for문을 수행하여 메세지의 첫번째를 찾음.
        for (let i = 0; i < directMessageStore.directMessageList.length; i++) {
            const directMessageData = directMessageStore.directMessageList[i];

            // directMessageList에서 내 아이디와 상대방의 아이디를 이용하여 index를 찾는다.
            if (
                (directMessageData.sender == clickModalDeviceid &&
                    directMessageData.receiver == loginStore.m_local_deviceid) ||
                (directMessageData.sender == loginStore.m_local_deviceid &&
                    directMessageData.receiver == clickModalDeviceid)
            ) {
                const obj = {
                    sender: directMessageData.sender,
                    receiver: directMessageData.receiver,
                    datetime: directMessageData.datetime,
                    count: directMessageStore.previousMessageCount,
                };

                const json = JSON.stringify(obj);

                signallingSocket.emit("getPreviousMessage", json);
                console.log("*** socket.emit: getPreviousMessage Request: " + json);

                // 이전 메세지 클릭한 모달창 정보 초기화
                directMessageStore.setPreviousMessageInfo("");
                break;
            }

            /* 모달창이 여러개일 경우에 현재 모달창 갯수를 체크하여 0개일 경우 현재 시간으로 이전 메세지를 가져온다 */
            // 마지막까지 수행 했으나, 현재 모달창의 메세지 0개
            if (i == directMessageStore.directMessageList.length - 1) {
                // 현재 시간으로 datetime 설정
                const obj = {
                    sender: loginStore.m_local_deviceid,
                    receiver: clickModalDeviceid,
                    datetime: getWorldTime(), // 현재 시간으로 부터 이전 메세지 가져오기
                    count: directMessageStore.previousMessageCount,
                };

                const json = JSON.stringify(obj);

                signallingSocket.emit("getPreviousMessage", json);
                console.log("*** socket.emit: getPreviousMessage Request: " + json);

                // 이전 메세지 클릭한 모달창 정보 초기화
                directMessageStore.setPreviousMessageInfo("");
                break;
            }
        }
    }
}
// 강제 로그아웃 요청 응답 (calling.vue 에서는 무조건 거절)
function forceLogOutResult(reqSocketId, status) {
    const obj = {
        requestSocketid: reqSocketId,
        status,
    };

    const json = JSON.stringify(obj);
    signallingSocket.emit("forceLogoutResult", json);
    console.log("*** socket: emit forceLogoutResult");
    console.log(json);
}
let loadingModal = null;

function initLoadingModal(type) {
    if (!loadingModal) {
        loadingModal = useModal({
            component: LoadingModal,
            key: `loading-modal`,
            attrs: {
                maskLoadingType: type,
            },
        });
    }
    return loadingModal;
}

function createLoadingMask(type, status = "open") {
    const { open: loadingOpen, close: loadingClose } = initLoadingModal(type);

    if (status === "open") {
        loadingOpen();
    } else if (status === "close") {
        loadingClose();
    }
}
/* resultSettingInRoomResult & onlocalStreamSuccess 일 경우 로딩 마스크 제거 */
function loadingMaskDelete() {
    createLoadingMask("", "close");
    callStore.setOnlocalStreamSuccess(false);
}
function prepareStreamMode(type) {
    // mainIndex 조회
    const mainIndex = callStore.videoMainIndex;

    // mainIndex를 이용하여 feeds의 deviceid 조회하기
    const remotedeviceid = feeds.value[mainIndex].rfdeviceid;

    const obj = {
        localdeviceid: loginStore.m_local_deviceid,
        remotedeviceid,
        stream_type: type,
    };

    const json = JSON.stringify(obj);
    signallingSocket.emit("prepareStreamMode", json);
    console.log("*** socket: emit prepareStreamMode");
    console.log(json);
}
// 파일 송신측 파일 송수신 초기화
function fileSendReset() {
    // 파일 송신 모달 초기화
    // commonStore.fileSendStatus", 0)

    // 파일 송신 진행률 초기화
    callStore.setTransmissionRate(0);

    // 파일 송신 취소 버튼 클릭 초기화
    commonStore.setCancelFileTransferFlag(false);
}
// 파일 수신측 파일 송수신 초기화 (remote deviceid)
function fileReceiveReset(deviceid, rfIndex) {
    // 파일 송신 모달창 초기화
    // commonStore.fileSendStatus", 0)

    // 파일 송수신 중 초기화
    // sessionStorage.setItem("fileSendingFlag", false)

    // 파일 수신 진행률 초기화 (메인만)
    // callStore.setReceptionRate", 0)
    commonStore.setFileReceptionRate({
        index: rfIndex, //  callinWindow 송신자 화면인덱스
        rate: 0, // 수신율
    });
    const rfFeedsIndex = findFeedsIndexDeviceid(deviceid);
    // 고화질 캡쳐가 아닌 경우
    if (!callStore.HQCaptureFlag) {
        // 2초 뒤에 내 화면을 카메라로 변경
        setTimeout(() => {
            // 내 화면을 비디오로 변환
            // callingLayoutChange("attach", sessionStorage.getItem("m_nickname"), 0)
            // $("#myvideo").show()

            // 송신자 화면을 비디오로 변환

            if (rfFeedsIndex) {
                let status =
                    commonStore.userListStatus[rfFeedsIndex].fileReceiveInfo.beforeStatus;
                // 송신자화면 videoOFF상태에서 파일수신 > 수신완료 시 기존 화면 상태값 유지 ksy
                callingLayoutChange(
                    status,
                    commonStore.userListStatus[rfFeedsIndex].text,
                    rfFeedsIndex,
                );
                $("#remotevideo" + rfFeedsIndex).show();
                $("#panel-inner" + rfFeedsIndex).show();
            }

            // if (status == "attach") {
            //  callingLayoutChange(
            //      status,
            //      commonStore.userListStatus[rfFeedsIndex].text,
            //      findFeedsIndexDeviceid(deviceid)
            //  )
            //  $("#remotevideo" + findFeedsIndexDeviceid(deviceid)).show()
            //  $("#panel-inner" + findFeedsIndexDeviceid(deviceid)).show()
            // } else {
            //  callingLayoutChange(
            //      commonStore.userListStatus[rfFeedsIndex].status,
            //      commonStore.userListStatus[rfFeedsIndex].text,
            //      findFeedsIndexDeviceid(deviceid)
            //  )
            // }
            // callingLayoutChange(5, commonStore.userListStatus[rfFeedsIndex].text, findFeedsIndexDeviceid(deviceid))
        }, 2000);
    } else {
        // 고화질 수신완료 시 초기화
        callStore.setHQCaptrueFlag(false);
        if (rfFeedsIndex) {
            $("#remotevideo" + rfFeedsIndex).show();
            $("#panel-inner" + rfFeedsIndex).show();
        }
    }
}
// 하단 정렬 레이아웃 버튼 값 변경 값 변경 감지
function setInitUnderStatus(result) {
    if (result == 0) {
        let cnt = 0;
        for (let i = 0; i < commonStore.userListStatus.length; i++) {
            // console.log(commonStore.userListStatus[i].status)
            if (
                commonStore.userListStatus[i].status == 2 ||
                commonStore.userListStatus[i].status == 3
            ) {
                cnt++;
            }
        }
        // console.log(cnt)
        if (cnt <= 1) {
            callStore.setUnderStatus(0);
        }
        // console.log(commonStore.userListStatus)
        // console.log("하단 정렬 레이아웃 버튼 변경 감지")
    }
}
// 파일 송수신 관련 채팅창 메시지 넣기
// status: 1(파일 송신중), 2(파일 수신중), 3(파일 수신 완료), 4(파일 송신 거절), 5 (파일 전송 완료), 6(파일 수신 거절), 9(송신자 파일 송신 취소), 10(수신자 파일 송신 취소)
function addChatFileSendMessage(nickname, status, rfIndex, fileChatIndex) {
    // 현재시간 UTC 가져오기
    const nowDate = Math.floor(Date.now() / 1000);

    // 메세지 만들기
    let fileSendingMessage = "";
    switch (status) {
        case 1:
            fileSendingMessage = t("fileSending text1");
            break;
        case 2:
            fileSendingMessage = t("fileSending text2");
            break;
        case 3:
            fileSendingMessage = t("fileSending text3");
            break;
        case 4:
            fileSendingMessage = t("fileSending text4");
            break;
        case 5:
            fileSendingMessage = t("fileSending text5");
            break;
        case 6:
            fileSendingMessage = t("fileSending text6");
            break;
        case 9:
            fileSendingMessage = t("fileSending text9");
            break;
        case 10:
            fileSendingMessage = t("fileSending text10");
            break;
        default:
            break;
    }

    // 한/영 조건
    let message = "";
    if (preferenceStore.lang == "ko") {
        message = nickname + fileSendingMessage;
    } else {
        message = fileSendingMessage + nickname;
    }

    let changeChatIndex = "";
    if (rfIndex) {
        changeChatIndex = fileChatIndex;
        // changeChatIndex = commonStore.userListStatus[rfIndex].fileReceiveInfo.fileChatIndex
    } else {
        changeChatIndex = chattingFileSendIndex.value;
    }

    // 채팅창에 파일 송수신 관련 메세지 넣기
    chattingStore.chattingMessageList[changeChatIndex] = {
        type: 0,
        message,
        date: nowDate,
        chattingDate: getChattingTimeZone(nowDate),
        nickname: sessionStorage.getItem("m_nickname"),
        level: 1,
    };
}
function checkAlreadyJoined(id) {
    console.log(`*** method check already joined`);

    if (keepAliveList.length === 0) return false;

    let result = false;

    feeds.value.forEach((ele, index) => {
        console.log(ele);
        if (ele === null || ele === undefined) return;
        if (ele.rfdeviceid === id) {
            result = index;
        }
    });

    if (result != false) {
        console.log(`*** ${id} has alreadyJoinded remove remoteFeed!!!`);
        feeds.value[result] = "";
        const listIndex = keepAliveList.indexOf(id);
        keepAliveList.splice(listIndex, 1);
        chattingStore.setPersonnelInRoom(personnelInRoom.value - 1);
    }
    console.log(keepAliveList);
    return result;
}
function checkRejoined(id) {
    console.log(`check ${id} have rejoined`);

    if (keepAliveList.includes(id)) {
        console.log(`${id} have not joined again remove stream container`);

        feeds.value.forEach((ele, index) => {
            if (ele.rfdeviceid === id) {
                cleanUpDummyFeed(id, index);
                keepAliveList.splice(index, 1);
            }
        });
    }
}
function cleanUpDummyFeed(id, index) {
    const userNickname = userListGetNickname(id);
    const feedsIndex = index;

    // 통화 중에 다른 사용자가 퇴장했을 경우 - 해당 사용자의 줌레벨 값을 1로 초기화 시킨다.(ksy)
    if (
        !(
            typeof commonStore.userListStatus[feedsIndex] == "undefined" ||
            commonStore.userListStatus[feedsIndex] == null
        )
    ) {
        commonStore.userListStatus[feedsIndex].zoomLevel = 1;
    }
    console.log(userNickname, feedsIndex);

    // 파일 수신중 송신자가 퇴장 시 파일수신창 없애기
    if (userNickname == commonStore.fileSendNickname) {
        // fileReceiveAllow = false

        // 파일 송수신 진행 중 초기화
        // sessionStorage.setItem("fileSendingFlag", false)

        // 파일 수락/거절 채팅 인덱스를 가져온다
        const fileChatIndex =
            commonStore.userListStatus[feedsIndex].fileReceiveInfo.fileChatIndex;

        // 송신자가 파일 송신 취소를 메세지에 추가
        addChatFileSendMessage(userNickname, 10, feedsIndex, fileChatIndex);

        // 수신측 파일 송수신 초기화
        fileReceiveReset(json.deviceid, feedsIndex);

        // 퇴장한 사람 파일수신창 없애기
        callingLayoutChange("none", sessionStorage.getItem("m_nickname"), feedsIndex);

        $("#myvideo").show();

        commonStore.fileSend();
        setInitUnderStatus(0);
    }
    console.log(commonStore.fileSendStatus);
    // 파일 송신 중에 수신자가 퇴장 시 거절처리 진행
    if (
        (commonStore.fileSendStatus == 2 || commonStore.fileSendStatus == 3) &&
        userNickname == commonStore.fileReceiver
    ) {
        // 거절 팝업창으로 변경
        commonStore.setFileSendStatus(4);

        console.log(sendFileReader.value, rateStopper.value);
        // 송신할 파일 Reader 중단
        if (
            !(typeof sendFileReader.value == "undefined" || sendFileReader.value == null)
        ) {
            sendFileReader.value.abort();
        }

        // 전송률 전송 재귀함수 정지
        if (!(typeof rateStopper.value == "undefined" || rateStopper.value == null)) {
            rateStopper.value();
            rateStopper.value = null;
        }
        // 사진 전송 중 메세지 -> 사진 수신 거절 메세지로 변경 ksy
        const fileChatIndex =
            commonStore.userListStatus[feedsIndex].fileSendInfo.fileChatIndex;
        addChatFileSendMessage(userNickname, 6, feedsIndex, fileChatIndex);
    }

    console.log("discalling on Event : " + roomFullCheck.value);
    if (!roomFullCheck.value) {
        // 통화 종료 시 t = nuxt 버전에 따라서 충돌이 일어나므로, setTimeout으로 예외처리 하면 된다는 답변을 받았음.
        setTimeout(function () {
            const receiveMessage = userNickname + t("chatting Leave");
            const nowDate = getWorldTime();
            addReceiveMessageList(
                userNickname,
                nowDate,
                getChattingTimeZone(nowDate),
                receiveMessage,
                1,
                0,
            );
            getPersonnelInRoom();
        }, 500);
    } else {
        // 룸 가득 차있다는 flag 초기화
        roomFullCheck.value = false;
    }

    console.log(
        "*** socket: discalling > autoDiscalling.value = " + autoDiscalling.value,
    );
    /* 통화 자동 종료가 설정되어있는지 체크한다. */
    if (autoDiscalling.value) {
        /*
					방 안에 혼자남았을 경우 통화를 자동으로 종료한다.
					사용자가 나가면 feeds를 empty로 바꾸기 때문에 값이 비어있는지 체크해야 한다.
				*/
        const NullFilterFeeds = feeds.value.filter(function (item) {
            return item !== null;
        });

        if (NullFilterFeeds.length == 0) {
            console.log("*** socket: discalling > start AutoDiscalling");

            // 자동종료 팝업창 표시
            noneOverlayModal(19);

            // 자동 통화 종료 설정
            funcAutoDiscalling.value = setTimeout(() => {
                // 자동 통화 종료 진행한다.
                callStore.setAutoDiscallingResult(true);
                commonStore.janus.destroy();
            }, 5000);
        }
    }

    /* glass > 연결이 끊겼을 경우 움직임 없음 알람에 속해있을 경우 제외한다. */
    if (callStore.motionNoMoveInfo.length != 0 && callStore.motionNoMoveFlag) {
        /* 해당 deviceid가 배열에 존재하는지 확인한다. */
        for (let i = 0; i < callStore.motionNoMoveInfo.length; i++) {
            if (callStore.motionNoMoveInfo[i].deviceid == json.deviceid) {
                console.log("*** socket: discalling > motionNoMove Remove !");
                const motionNoMove = callStore.motionNoMoveInfo[i];
                /* deviceid가 움직임 없음 배열에 존재한다 */
                /* 현재 움직임 없음 배열의 길이를 체크한다. > length == 1 일 경우 움직임 없음 Flag를 false 변경 */
                if (callStore.motionNoMoveInfo.length == 1) {
                    /* 움직임 없음 모션 Flag = false 로 변경한다. > 해당 건을 삭제 후에는 length 가 0이기 때문에 */
                    callStore.setMotionNoMoveFlag(false);
                }

                /* 해당 deviceid를 움직임 없음 배열에서 삭제한다. */
                callStore.deleteMotionNoMoveInfo(i);

                /* 움직임 없음 모션 아이콘을 subVideo에서 삭제한다. */
                setSubVideoMotionNoMove(motionNoMove.rfIndex, false);
            }
        }
    }
    // 나간 사람 오디오 제거해줌
    const permanantAuido = document.getElementById(`audioControl${feedsIndex}`);
    permanantAuido.srcObject = null;

    const remoteFeed = feeds.value[index];

    $("#remote" + remoteFeed.rfindex)
        .empty()
        .hide();

    const customNickname = customUserNickname(remoteFeed.rfdeviceid);
    console.log("*** mounted: onmessage > unpublish > customNickname: ", customNickname);

    callingLayoutChange("none", customNickname, feedsIndex);

    // 마이크 음소거
    setUserListMicMute(remoteFeed.rfindex, false);

    // 호스트 권한 삭제
    setHostIcon(remoteFeed.rfindex, false);

    // 모션 관련 아이콘 삭제
    setSubVideoMotionFall(remoteFeed.rfindex, false);
    setSubVideoMotionNoMove(remoteFeed.rfindex, false);

    feeds.value[remoteFeed.rfindex] = null;
    // console.log("****** feeds.value 클리어: ".concat(remoteFeed.rfindex))

    remoteFeed.detach();
}

function sayHello() {
    opaqueId.value = "videoroomtest-" + Janus.randomString(12);
    // console.log("****** videoroomtest.js - opaqueId = " + opaqueId)

    if (getQueryStringValue("room") !== "")
        myroom.value = parseInt(getQueryStringValue("room"));
    myroom.value = parseInt(sessionStorage.getItem("m_roomid"));

    doSimulcast.value =
        getQueryStringValue("simulcast") === "yes" ||
        getQueryStringValue("simulcast") === "true";
    doSimulcast2.value =
        getQueryStringValue("simulcast2") === "yes" ||
        getQueryStringValue("simulcast2") === "true";
    subscriber_mode.value =
        getQueryStringValue("subscriber-mode") === "yes" ||
        getQueryStringValue("subscriber-mode") === "true";

    // -> kyj
    str_stream_picture_file_path.value = `${"https://hdcardev.watttalk.kr"}/storage/watttalk/photos/`;

    console.log("*** mounted: Media module 초기화 ");
    setIntervalStream.value = "";
    Janus.init({
        debug: false,
        currentMicId: commonStore.selectedMicID,
        callback() {
            $(this).attr("disabled", true).unbind("click");

            console.log("*** mounted: Media module attach start. ");

            // Make sure the browser supports WebRTC
            janus.value = new Janus({
                // 지정한 서버
                server: "wss://hdcardev.watttalk.kr:8989",

                // 서버 접속 성공
                success() {
                    // 주요 로직
                    console.log("*** mounted: janus attach success. ");

                    janus.value.attach({
                        plugin: "janus.plugin.videoroom",
                        opaqueId: opaqueId.value,
                        success(pluginHandle) {
                            console.log("여기야", pluginHandle);
                            // console.log(
                            //  "****** janus.init - success: function() - pluginHandle = "
                            // )
                            // console.log(pluginHandle)
                            $("#details").remove();
                            sfutest.value = pluginHandle;
                            // console.log(
                            //  "****** janus.init - success: function() - sfutest.value = "
                            // )
                            // console.log(sfutest.value)
                            Janus.log(
                                "Plugin attached! (" +
                                    sfutest.value.getPlugin() +
                                    ", id=" +
                                    sfutest.value.getId() +
                                    ")",
                            );
                            Janus.log("  -- This is a publisher/manager");
                            // Prepare the username registration
                            // $("#videojoin").removeClass("hide").show();
                            // $("#registernow").removeClass("hide").show();
                            // $("#register").click(registerUsername);
                            // $("#username").focus();
                            // // username input box 이름 변경
                            // $("#username").val(sessionStorage.getItem("m_nickname"));
                            // $("#start")
                            //     .removeAttr("disabled")
                            //     .html("Stop")
                            //     .click(function () {
                            //         $(this).attr("disabled", true);
                            //         janus.value.destroy();
                            //     });
                            registerUsername();

                            // console.log("****** $store.commit 직전")
                            commonStore.setSfutest(pluginHandle);

                            // const userStatus = {
                            //  index: 5,
                            //  status: {
                            //      status: "my"
                            //  }
                            // }

                            // 실시간 반영이 안되는건가??
                            // commonStore.setUserList", userStatus)

                            // callingLayoutCompData.userList[5] = {
                            //  status: "my"
                            // }

                            // console.log(
                            //  " callingLayoutCompData = " + callingLayoutCompData
                            // )
                            // console.log(callingLayoutCompData)
                        },
                        error(error) {
                            console.log("*** mounted: jauns attach Error. ", error);
                            Janus.error("  -- Error attaching plugin...", error);
                            alert("Error attaching plugin... " + error);
                        },
                        consentDialog(on) {
                            Janus.debug(
                                "Consent dialog should be " +
                                    (on ? "on" : "off") +
                                    " now",
                            );
                            if (on) {
                                // // Darken screen and show hint
                                // $.blockUI({
                                //  message: '<div><img src="up_arrow.png"/></div>',
                                //  css: {
                                //      border: 'none',
                                //      padding: '15px',
                                //      backgroundColor: 'transparent',
                                //      color: '#aaa',
                                //      top: '10px',
                                //      left: (navigator.mozGetUserMedia ? '-100px' : '300px')
                                //  } });
                            } else {
                                // // Restore screen
                                // $.unblockUI();
                            }
                        },
                        iceState(state) {
                            console.log(
                                "*** mounted: Media module init - iceState = ",
                                state,
                            );
                            // console.log(
                            //  "****** janus.init - iceState: function() - state = "
                            // )
                            // console.log(state)
                            Janus.log("ICE state changed to " + state);

                            console.log("ICE state change ! : " + state);

                            // ice 끊겼을 경우
                            if (state == "disconnected") {
                                console.log("1. ice state가 disconnect 입니다.");
                                iceStateConnect.value = false;

                                console.log(
                                    "2. iceStateConnect.value 의 상태 변경 : " +
                                        iceStateConnect.value,
                                );

                                // 토스트 메세지 5초간 출력한뒤 사라진다.
                                // visibleToastMessage(t("network down"));
                                console.log("3. 토스트 메세지 출력했습니다.");

                                // 30초 후 다시 한번 체크하여 iceStateConnect가 false 일 경우 통화 종료 처리한다.
                                iceStateCheck.value = setTimeout(function () {
                                    console.log(
                                        "30초 후 iceState : " + iceStateConnect.value,
                                    );

                                    // iceStateConnect.value == false 일 경우
                                    if (!iceStateConnect.value) {
                                        console.log("*** ice state connect fail!!!!!");
                                        // alert(t("iceState Fail"))
                                        // 통화 종료
                                        // janusAndCallingDestroy()
                                    }
                                }, 30000);
                                console.log("4. setTimeout 등록했습니다.");
                            } else if (state == "connected") {
                                iceStateConnect.value = true;
                                console.log(
                                    "6. iceStateConnect.value 의 상태를 변경 : " +
                                        iceStateConnect.value,
                                );
                                // ice State Check != undefined 아닐 경우
                                if (iceStateCheck.value != undefined) {
                                    console.log("7. setTImeout이 걸려있습니다.");
                                    // setTimeout 제거
                                    clearTimeout(iceStateCheck.value);
                                    console.log("8. setTimeout을 제거 했습니다.");

                                    // iceStateCheck.value 초기화
                                    iceStateCheck.value = undefined;
                                    console.log(
                                        "9. iceStateCheck를 초기화 했습니다. iceStateCheck.value : " +
                                            iceStateCheck.value,
                                    );
                                }
                                if (
                                    onlyVoiceID.value.includes(
                                        loginStore.m_local_deviceid,
                                    ) ||
                                    callStore.cameraNotAllowed
                                ) {
                                    const test = setInterval(() => {
                                        commonStore.setIsVideoFalse();
                                        commonStore.setIsVideoTrue();
                                    }, 100);
                                    setTimeout(() => {
                                        clearInterval(test);
                                        commonStore.setIsVideoTrue();
                                    }, 1000);
                                }
                            }
                        },
                        mediaState(medium, on) {
                            Janus.log(
                                "Janus " +
                                    (on ? "started" : "stopped") +
                                    " receiving our " +
                                    medium,
                            );
                        },
                        webrtcState(on) {
                            Janus.log(
                                "Janus says our WebRTC PeerConnection is " +
                                    (on ? "up" : "down") +
                                    " now",
                            );
                            // $("#videolocal").parent().parent().unblock();
                            if (!on) return;
                            $("#publish").remove();
                            // This controls allows us to override the global room bitrate cap
                            $("#bitrate").parent().parent().removeClass("hide").show();
                            $("#bitrate a").click(function () {
                                const id = $(this).attr("id");
                                const bitrate = parseInt(id) * 1000;
                                if (bitrate === 0) {
                                    Janus.log("Not limiting bandwidth via REMB");
                                } else {
                                    Janus.log(
                                        "Capping bandwidth to " + bitrate + " via REMB",
                                    );
                                }
                                $("#bitrateset")
                                    .html($(this).html() + '<span class="caret"></span>')
                                    .parent()
                                    .removeClass("open");
                                sfutest.value.send({
                                    message: { request: "configure", bitrate },
                                });
                                return false;
                            });
                        },
                        onmessage(msg, jsep) {
                            console.log("*** mounted: Media module init - onmessage");
                            console.log(msg);
                            // console.log("****** janus.init - onmessage - msg = ")
                            // console.log(msg)
                            // console.log("****** janus.init - onmessage - jsep = ")
                            // console.log(jsep)

                            // console.log("****** janus.init - onmessage - event = ")
                            // console.log(event)

                            const event = msg.videoroom;

                            if (event) {
                                // 방 참가 시
                                if (event === "joined") {
                                    // Publisher/manager created, negotiate WebRTC and attach to existing feeds.value, if any
                                    myid.value = msg.id;
                                    mypvtid.value = msg.private_id;
                                    Janus.log(
                                        "Successfully joined room " +
                                            msg.room +
                                            " with ID " +
                                            myid.value,
                                    );
                                    Janus.log(
                                        "----- document ready: onmessage ----- Successfully joined room " +
                                            msg.room +
                                            " with ID " +
                                            myid.value,
                                    );

                                    // console.log("@@@@@@@@@@@@@")
                                    // console.log("msg", msg)
                                    // console.log("jsep", jsep)

                                    // console.log(
                                    //  "****** janus.init - onmessage - event = joined / subscriber_mode.value = "
                                    // )
                                    // console.log(subscriber_mode.value)
                                    if (subscriber_mode.value) {
                                        $("#videojoin").hide();
                                        $("#videos").removeClass("hide").show();
                                    } else {
                                        publishOwnFeed(true);
                                    }
                                    // Any new feed to attach to?
                                    if (msg.publishers) {
                                        const list = msg.publishers;
                                        Janus.debug(
                                            "Got a list of available publishers/feeds:",
                                            list,
                                        );
                                        Janus.log(
                                            "Got a list of available publishers/feeds:",
                                            list,
                                        );
                                        for (const f in list) {
                                            const id = list[f].id;
                                            const display = list[f].display;
                                            const audio = list[f].audio_codec;
                                            const video = list[f].video_codec;
                                            Janus.debug(
                                                "  >> [" +
                                                    id +
                                                    "] " +
                                                    display +
                                                    " (audio: " +
                                                    audio +
                                                    ", video: " +
                                                    video +
                                                    ")",
                                            );
                                            newRemoteFeed(id, display, audio, video);
                                        }
                                    }

                                    // -> kyj 통화 시작 시간을 기록한다.
                                    const currentTime = getWorldTime();
                                    const obj = {
                                        localdeviceid: loginStore.m_local_deviceid,
                                        remotedeviceid:
                                            sessionStorage.getItem("m_remote_deviceid"),
                                        start_time: currentTime,
                                        roomid: sessionStorage.getItem("m_roomid"),
                                        unique_roomid: uniqueRoomid.value, // 2021-07-21 추가
                                        localuseruid: String(myid.value), // 2021-10-13 추가
                                    };
                                    const json = JSON.stringify(obj);
                                    signallingSocket.emit("callStartTime", json);
                                    console.log(
                                        "*** socket: emit callStartTime. json: ",
                                        json,
                                    );

                                    nextTick(() => {
                                        setAudioOutput();
                                    });

                                    // 방 삭제 시
                                } else if (event === "destroyed") {
                                    // The room has been destroyed
                                    Janus.warn("The room has been destroyed!");
                                    alert("The room has been destroyed", function () {
                                        window.location.reload();
                                    });
                                    // ???
                                } else if (event === "event") {
                                    // Any new feed to attach to?
                                    if (msg.publishers) {
                                        const list = msg.publishers;
                                        const userName = getFeedsDisplay(list, "");

                                        checkAlreadyJoined(userName);

                                        Janus.debug(
                                            "Got a list of available publishers/feeds:",
                                            list,
                                        );
                                        for (const f in list) {
                                            const id = list[f].id;
                                            const display = list[f].display;
                                            const audio = list[f].audio_codec;
                                            const video = list[f].video_codec;
                                            Janus.debug(
                                                "  >> [" +
                                                    id +
                                                    "] " +
                                                    display +
                                                    " (audio: " +
                                                    audio +
                                                    ", video: " +
                                                    video +
                                                    ")",
                                            );
                                            newRemoteFeed(id, display, audio, video);
                                        }
                                    } else if (msg.leaving) {
                                        // One of the publishers has gone away?
                                        const leaving = msg.leaving;

                                        Janus.log("Publisher left: " + leaving);
                                        Janus.log(
                                            "----- document ready: onmessage:: event === 'event'::: msg['leaving'] -----  Publisher left: " +
                                                leaving,
                                        );

                                        /* 나 혼자 남아있을 경우 otherParthAccess SessionStorage를 false로 변경 */
                                        const NullFilterFeeds = feeds.value.filter(
                                            function (item) {
                                                return item !== null;
                                            },
                                        );

                                        // console.log(
                                        //  "NullFilterFeeds Length : " + NullFilterFeeds.length
                                        // )

                                        /* 통화 종료 시, 이미 unpubilshed 에서 해당 index를 null로 변경
											null 값을 체크 할 때, empty 값도 null로 판단한다.
											==> NullFilterFeeds.length == 0 일 경우 혼자 인 것으로 판단한다. */
                                        if (NullFilterFeeds.length == 0) {
                                            // console.log("alone in room.")
                                            sessionStorage.setItem(
                                                "otherPartyAccess",
                                                false,
                                            );
                                            // console.log(
                                            //  "sessionStorage.setItem(otherPartyAccess : " +
                                            //      sessionStorage.getItem("otherPartyAccess")
                                            // )
                                        }

                                        let remoteFeed = null;
                                        for (
                                            let i = 1;
                                            i < currentRoomNumberCount.value;
                                            i++
                                        ) {
                                            if (
                                                feeds.value[i] &&
                                                feeds.value[i].rfid == leaving
                                            ) {
                                                remoteFeed = feeds.value[i];
                                                Janus.log(
                                                    "---------- feeds.value[i] = " +
                                                        feeds.value[i],
                                                );
                                                break;
                                            } else {
                                                // unpublished 2번 실행시키는 것 방지
                                                return;
                                            }
                                        }
                                        if (remoteFeed != null) {
                                            const floatingMessage = t("network down");
                                            if (
                                                keepAliveList.includes(
                                                    remoteFeed.rfdeviceid,
                                                )
                                            ) {
                                                $(
                                                    `#videoremote${remoteFeed.rfindex}`,
                                                ).append(
                                                    '<div class="no-video-container" style="background-color:black; width: 100%; height: 100%; display: flex; justify-content: center; align-items: center">' +
                                                        '<i class="fa fa-video-camera fa-5 no-video-icon"></i>' +
                                                        `<span class="no-video-text">${floatingMessage}</span>` +
                                                        "</div>",
                                                );
                                                return;
                                            }
                                            Janus.debug(
                                                "Feed " +
                                                    remoteFeed.rfid +
                                                    " (" +
                                                    remoteFeed.rfdisplay +
                                                    ") has left the room, detaching",
                                            );
                                            $("#remote" + remoteFeed.rfindex)
                                                .empty()
                                                .hide();

                                            // $("#videoremote" + remoteFeed.rfindex).empty()
                                            callingLayoutChange(
                                                "none",
                                                "",
                                                remoteFeed.rfindex,
                                            );

                                            // 참여자 계산
                                            getPersonnelInRoom();
                                            sessionStorage.setItem(
                                                "m_callWaiting",
                                                "false",
                                            );

                                            feeds.value[remoteFeed.rfindex] = null;
                                            // console.log("****** feeds.value 클리어: ".concat(remoteFeed.rfindex))

                                            remoteFeed.detach();
                                        } else {
                                            callingLayoutChange("none", "", 1);

                                            // 참여자 계산
                                            getPersonnelInRoom();
                                            sessionStorage.setItem(
                                                "m_callWaiting",
                                                "false",
                                            );
                                        }
                                    } else if (msg.unpublished) {
                                        // One of the publishers has unpublished?
                                        // 여기
                                        const unpublished = msg.unpublished;
                                        Janus.log("Publisher left: " + unpublished);
                                        Janus.log(
                                            "----- document ready: onmessage:: event === 'event'::: msg['unpublished'] -----  Publisher left: " +
                                                unpublished,
                                        );
                                        if (unpublished === "ok") {
                                            // console.log("unpublished === ok")
                                            sfutest.value.hangup();
                                            Janus.log(
                                                "----- document ready: onmessage:: event === 'event'::: msg['unpublished']:::: unpublished === 'ok' ----- ",
                                            );
                                            return;
                                        }
                                        let remoteFeed = null;
                                        // for (let i = 1; i < 15; i++) {
                                        for (
                                            let i = 1;
                                            i < currentRoomNumberCount.value;
                                            i++
                                        ) {
                                            if (
                                                feeds.value[i] &&
                                                feeds.value[i].rfid == unpublished
                                            ) {
                                                remoteFeed = feeds.value[i];
                                                Janus.log(
                                                    "---------- feeds.value[i] = " +
                                                        feeds.value[i],
                                                );
                                                break;
                                            }
                                        }
                                        if (remoteFeed != null) {
                                            if (
                                                keepAliveList.includes(
                                                    remoteFeed.rfdeviceid,
                                                )
                                            )
                                                return;
                                            Janus.debug(
                                                "Feed " +
                                                    remoteFeed.rfid +
                                                    " (" +
                                                    remoteFeed.rfdisplay +
                                                    ") has left the room, detaching",
                                            );
                                            Janus.log(
                                                "----- Feed " +
                                                    remoteFeed.rfid +
                                                    " (" +
                                                    remoteFeed.rfdisplay +
                                                    ") has left the room, detaching",
                                            );
                                            $("#remote" + remoteFeed.rfindex)
                                                .empty()
                                                .hide();
                                            // $("#videoremote" + remoteFeed.rfindex).empty()

                                            // destroy 시 unpublish를 호출한다. 왜 ????

                                            const customNickname = customUserNickname(
                                                remoteFeed.rfdeviceid,
                                            );
                                            console.log(
                                                "*** mounted: onmessage > unpublish > customNickname: ",
                                                customNickname,
                                            );

                                            callingLayoutChange(
                                                "none",
                                                customNickname,
                                                remoteFeed.rfindex,
                                            );

                                            // 마이크 음소거
                                            setUserListMicMute(remoteFeed.rfindex, false);

                                            // 호스트 권한 삭제
                                            setHostIcon(remoteFeed.rfindex, false);

                                            // 모션 관련 아이콘 삭제
                                            setSubVideoMotionFall(
                                                remoteFeed.rfindex,
                                                false,
                                            );
                                            setSubVideoMotionNoMove(
                                                remoteFeed.rfindex,
                                                false,
                                            );

                                            feeds.value[remoteFeed.rfindex] = null;
                                            // console.log("****** feeds.value 클리어: ".concat(remoteFeed.rfindex))

                                            remoteFeed.detach();
                                        }
                                    } else if (msg.error) {
                                        if (msg.error_code === 426) {
                                            // This is a "no such room" error: give a more meaningful description
                                            // 해당 룸 번호 없음. (가용할 수 있는 범위가 아니거나 룸이 null일 경우)

                                            if (preferenceStore.lang == "ko") {
                                                alert(
                                                    `영상통화 방이 존재하지 않습니다. \n다시 통화 해주시기 바랍니다. \n ${sessionStorage.getItem("m_roomid")}`,
                                                );
                                            } else {
                                                alert(
                                                    "The video call room doesn't exist. \nPlease call me back.",
                                                );
                                            }

                                            // alert(
                                            //  "<p>Apparently room <code>" +
                                            //      myroom.value +
                                            //      "</code> (the one demo uses as a test room) " +
                                            //      "does not exist...</p><p>Do you have an updated <code>janus.plugin.videoroom.jcfg</code> " +
                                            //      "configuration file? If not, make sure you copy the details of room <code>" +
                                            //      myroom.value +
                                            //      "</code> " +
                                            //      "from that sample in your current configuration file, then restart Janus and try again."
                                            // )
                                        } else if (msg.error_code == 430) {
                                            // error_code 430 = 사용 할 수 있는 room이 없다.
                                            if (preferenceStore.lang == "ko") {
                                                alert(
                                                    `가용할 수 있는 영상통화 방이 없습니다. \n관리자에게 문의하시기 바랍니다. ${sessionStorage.getItem("m_roomid")}`,
                                                );
                                            } else {
                                                alert(
                                                    "There is no video call room available. \nPlease contact the administrator.",
                                                );
                                            }
                                        } else if (msg.error_code == 432) {
                                            // error_code 432 = 룸 인원 가득 참.
                                            console.log(msg.error);
                                            if (preferenceStore.lang == "ko") {
                                                // 룸 인원 초과 function 호출
                                                roomFullRequest();

                                                setTimeout(function () {
                                                    // commonStore.janus.destroy()

                                                    if (preferenceStore.lang == "ko") {
                                                        alert(
                                                            "설정된 룸 인원이 초과하여 영상통화에 입장할 수 없습니다.",
                                                        );
                                                    } else {
                                                        alert(
                                                            "You cannot enter the video call because the number of people in the set room has exceeded.",
                                                        );
                                                    }
                                                }, 1000);
                                            } else {
                                                alert(
                                                    "You cannot enter the video call because the number of rooms set up is exceeded.",
                                                );
                                            }
                                        } else {
                                            alert(
                                                msg.error +
                                                    "\n error_code = " +
                                                    msg.error_code,
                                            );
                                        }

                                        // 통화 종료 처리
                                        callStore.setHangupCallingConfirmFlag(true);
                                    }
                                }
                            }
                            if (jsep) {
                                Janus.debug("Handling SDP as well...", jsep);
                                sfutest.value.handleRemoteJsep({ jsep });
                                // Check if any of the media we wanted to publish has
                                // been rejected (e.g., wrong or unsupported codec)
                                const audio = msg.audio_codec;
                                if (
                                    mystream.value &&
                                    mystream.value.getAudioTracks() &&
                                    mystream.value.getAudioTracks().length > 0 &&
                                    !audio
                                ) {
                                    // Audio has been rejected
                                    window.toastr.warning(
                                        "Our audio stream has been rejected, viewers won't hear us",
                                    );
                                }
                                const video = msg.video_codec;
                                if (
                                    mystream.value &&
                                    mystream.value.getVideoTracks() &&
                                    mystream.value.getVideoTracks().length > 0 &&
                                    !video
                                ) {
                                    // Video has been rejected
                                    window.toastr.warning(
                                        "Our video stream has been rejected, viewers won't see us",
                                    );
                                    // Hide the webcam video
                                    $("#myvideo").hide();
                                    $("#videolocal").append(
                                        '<div class="no-video-container">' +
                                            '<i class="fa fa-video-camera fa-5 no-video-icon" style="height: 100%;"></i>' +
                                            '<span class="no-video-text" style="font-size: 16px;">Video rejected, no webcam</span>' +
                                            "</div>",
                                    );
                                }
                            }
                        },
                        // 로컬 스트림이 들어 왔을 시
                        onlocalstream(stream) {
                            // console.log("////// stream = ", stream)
                            // console.log("////// stream.getTracks() = ", stream.getTracks())
                            Janus.debug(" ::: Got a local stream :::", stream);
                            Janus.debug(
                                "----- document ready: onlocalstream -----  Got a local stream :::",
                                stream,
                            );
                            console.log(
                                ` ----- document ready: onlocalstream -----  Got a local stream ::: ${stream}`,
                            );
                            mystream.value = stream;

                            $("#videojoin").hide();
                            $("#videos").removeClass("hide").show();
                            if ($("#myvideo").length === 0) {
                                // console.log("!!!!!!!!")
                                // $("#videolocal").empty()
                                callingLayoutChange(
                                    "attach",
                                    sessionStorage.getItem("m_nickname"),
                                    0,
                                );

                                // 참여자 계산
                                getPersonnelInRoom();

                                // video div의 테두리를 없앤다.
                                // $("#videolocal").css('border', 'none')

                                // 방을 만들 경우 localstream 을 먼저 접근하고, 통화 수신을 받는 경우 remotestream 을 먼저 접근하여
                                // 통화 수신 시 remtoe 영상을 큰 비디오에 담을 수 없으므로 아래 구문은 방을 만들 경우만 적용한다
                                if (sessionStorage.getItem("createRoomFlag") === "true") {
                                    $("#videoMainCaption").text(
                                        sessionStorage.getItem("m_nickname"),
                                    );

                                    // 최초 방 입장 시 duration 필수로 하기.
                                    hostSelectedMainVideo(myid.value);
                                }

                                $("#videolocal").css("border", "4px solid red");
                                $("#videolocal").append(
                                    '<video class="rounded centered" id="myvideo"  height="100%" autoplay playsinline muted="muted" />',
                                );

                                // local 화면에서 video_change() EventListener 를 지정
                                const myvideo = document.getElementById("myvideo");

                                myvideo.addEventListener("click", function () {
                                    // 드로잉 할 때는, 메인화면을 변경할 수 없습니다 출력.
                                    if (commonStore.isDrawing) {
                                        commonToastMessage(
                                            t("toastMessage Drawing NoChangeMainVideo"),
                                        );
                                        return;
                                    }

                                    if (videoCallHost.value) {
                                        // 바둑판이 아닐 경우
                                        if (commonStore.callingLayoutType != 1) {
                                            (callStore.setVideoMainIndex(0),
                                                mainVideoChangeFunc(1, "localstream"));

                                            // Main Video Border Change
                                            mainVideoBorder(0);

                                            // host가 바라보는 메인 화면으로 변경
                                            console.log("hostSelectedMainVideo 22");
                                            hostSelectedMainVideo(myid.value);
                                        } else if (commonStore.callingLayoutType == 1) {
                                            const beforeMainIndex =
                                                callStore.videoMainIndex;
                                            if (
                                                beforeMainIndex == 0 &&
                                                feeds.value.length !== 0
                                            ) {
                                                document.getElementById(
                                                    "myvideo",
                                                ).style.scale = 1;
                                            } else if (
                                                beforeMainIndex !== 0 &&
                                                feeds.value.length !== 0
                                            ) {
                                                document.getElementById(
                                                    "remotevideo" + beforeMainIndex,
                                                ).style.scale = 1;
                                            }

                                            // 바둑판 일 경우에도 메인화면을 변경할 수 있도록 수정한다.
                                            // 실제로 메인 비디오가 존재하지 않기 때문에 mainIndex만 변경하도록 한다.
                                            callStore.setVideoMainIndex(0);

                                            // Main Video Border Change
                                            mainVideoBorder(0);

                                            // host가 바라보는 메인 화면으로 변경
                                            console.log("hostSelectedMainVideo 23");
                                            hostSelectedMainVideo(myid.value);
                                        }
                                    }
                                });

                                /* 이 기능으로 인해 상대방이 들어와도 내 화면이 보이는 문제가 발생하여 주석 처리
								try {
									// 메인 화면에 local의 화면을 넣어줌.
									const videoMain = document.getElementById("videoMain")
									videoMain.srcObject = stream
								} catch (error) {
									console.log(error)
								}
								*/

                                // 나의 Stream의 bitrate를 수정한다. - 300
                                // 중요 !!
                                changeBitrate(subVideoBitrate.value);
                                // sfutest.value.send({
                                //  message: {
                                //      request: "configure",
                                //      bitrate: subVideoBitrate.value
                                //  }
                                // })

                                // console.log(
                                //  "*** mounted: jauns customBitrate sfutest.value Send. customBitrate = " +
                                //      subVideoBitrate.value
                                // )

                                // 입장 메세지
                                const chattingNickname =
                                    sessionStorage.getItem("m_nickname");
                                const chattingMessage =
                                    sessionStorage.getItem("m_nickname") +
                                    t("chatting Enter");
                                const chattingLevel = 2; // 공지
                                const chattingType = 0;

                                addSendMessageList(
                                    chattingNickname,
                                    chattingMessage,
                                    chattingLevel,
                                    chattingType,
                                );

                                // videoCallHost Check :: 호스트가 늦게 생성되면 호스트의 index를 찾지 못해서 setTimeout 추가
                                if (sessionStorage.getItem("createRoomFlag") !== "true") {
                                    setTimeout(
                                        function () {
                                            videoCallHostCheck(
                                                sessionStorage.getItem("m_roomid"),
                                                loginStore.m_local_deviceid,
                                            );
                                        },
                                        2000,
                                        // 호스트에게 방의 상태를 확인하여 전체음소거 상태인지 아닌지 확인
                                        requestSettingInRoom(
                                            sessionStorage.getItem("m_roomid"),
                                            loginStore.m_local_deviceid,
                                        )
                                    );
                                }
                            }

                            $("#publisher")
                                .removeClass("hide")
                                .html(myusername.value)
                                .show();
                            Janus.attachMediaStream($("#myvideo").get(0), stream);
                            $("#myvideo").get(0).muted = "muted";
                            if (
                                sfutest.value.webrtcStuff.pc.iceConnectionState !==
                                    "completed" &&
                                sfutest.value.webrtcStuff.pc.iceConnectionState !==
                                    "connected"
                            ) {
                                // $("#videolocal").parent().parent().block({
                                //  message: '<b>Publishing...</b>',
                                //  css: {
                                //      border: 'none',
                                //      backgroundColor: 'transparent',
                                //      color: 'white'
                                //  }
                                // });
                            }
                            const videoTracks = stream.getVideoTracks();
                            // if (stream.getAudioTracks()[0]) {
                            // 	const audioStream = new MediaStream()
                            // 	audioStream.addTrack(stream.getAudioTracks()[0])
                            // 	const permanantAuido = document.getElementById(`audioControl0`)
                            // 	permanantAuido.srcObject = audioStream
                            // 	permanantAudio.volumn = 0
                            // }
                            if (!videoTracks || videoTracks.length === 0) {
                                console.log(
                                    "****** No webcam available ********* onlocalStream",
                                );

                                // No webcam
                                $("#myvideo").hide();
                                if ($("#videolocal .no-video-container").length === 0) {
                                    $("#videolocal").append(
                                        '<div class="no-video-container" style="background-color:black>' +
                                            '<i class="fa fa-video-camera fa-5 no-video-icon"></i>' +
                                            '<span class="no-video-text">No webcam available</span>' +
                                            "</div>",
                                    );
                                }
                            } else {
                                $("#videolocal .no-video-container").remove();
                                $("#myvideo").removeClass("hide").show();

                                // 영상이 재생 중임에도 no webcam 문구가 나타나는 문제 해결 방안으로 remove를 제일 마지막에 둔다.
                                if ($("#videolocal .no-video-container").length != 0) {
                                    console.log(
                                        "local - 영상이 재생 중임에도 no webcam 문구가 나타났기에 해당 문구를 제거해주겠다.",
                                    );
                                    $("#videolocal .no-video-container").remove();
                                }
                            }
                            // main 화면에 넣어줄 video를 찾고 넣어주는 함수
                            setIntervalStream.value = setInterval(function () {
                                main_stream_check();
                            }, 1000);

                            console.log("setOnlocalStreamSuccess");
                            /* onlocalStream 진행 후 onlocalStreamSuccess True 변경 */
                            callStore.setOnlocalStreamSuccess(true);

                            /* 마스크 제거 요청 > onlocalStream & resultSettingInRoom 정상 수신 시 마스크 제거한다. */
                            loadingMaskDelete();

                            // 파일 수신 중 내 비디오 숨김 해제 ksy
                            // if (sessionStorage.getItem("fileSendingFlag") === "true") {
                            //  console.log("********* 파일 송수신 중")
                            //  $("#myvideo").hide()
                            // }
                            nextTick(() => {
                                setAudioOutput();
                            });
                        },
                        onremotestream(stream) {
                            // The publisher stream is sendonly, we don't expect anything here
                            console.log(
                                "----- document ready: onremotestream -----  Got a remote stream :::",
                                stream,
                            );
                        },
                        oncleanup() {
                            Janus.log(
                                " ::: Got a cleanup notification: we are unpublished now :::",
                            );
                            mystream.value = null;

                            // 영상 안 공유 버튼 주석
                            // $("#videolocal").html(
                            //  '<button id="publish" class="btn btn-primary">Publish</button>'
                            // )
                            // $("#publish").click(function() {
                            //  publishOwnFeed(true)
                            // })

                            // $("#videolocal").parent().parent().unblock();
                            $("#bitrate").parent().parent().addClass("hide");
                            $("#bitrate a").unbind("click");

                            // localstream video off Img
                            $("#videolocal").html(
                                '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADQAAAA0CAYAAADFeBvrAAAABHNCSVQICAgIfAhkiAAABntJREFUaEPNWktsW1UQPWM7dR3iWCm1Yuw0aUVbGlRA6qYVRaJsEItKIDaAyqbiv0AVEhJ0wU+qRCs2VCwKiK6gQBESLWLDAonyEVRdgCoQTegnaWInbpomlpM4TmIPHPMcbMf2e/fZrjLSU6K8uTNz7sy998x9ETRRVLULwCMA7gZwm/VErZ/0NAYgYf3k7+cBnBKRqWaFIY0aUtU+AI8CeBjAfQC8hjZzAH4EcBrAVyIybDi+TN01IFW9E8ARAHsbCaDK2G8AHBSRP9zYNQakqr0ADgHYB8DjxqmDMXkAJwC8LiJDDvSXVYwAqeozAI4CCJg4aUA3A+BFETnu1IYjQKp6C4BPrAXv1HYz9b4EsF9EZuyM2gJS1R0AvgBwu52xFr//m5uP3dqqC0hVX7IWfluLg3Vq3rYEawJS1V0AfgCwWsAUQS8CeEBEfq42C1UBqWoMwO8A1judulK9xcVFpNNpTE9PI5vNlpnweDwIBoPLjxv7ACYA7BCR0crxKwCpahDAT9Zpb+SPQCYmJpBKpRyNa2trQzgcRigUcqRfofQbgHtFZL7079UAHQbwiqmH+fl5DA8PI5/nEWImBBSNkiEZyxERebUmIOvQHATgNzHNjCQSpGjuxe/3Y+PGjWBJGgizs62ULpVlSFU/B/CYgUE0kplKPy4zdVJEHi/aWgakqjsB/GoChroXL14E106zhKXnYk1tF5E/GUMpoO8B3G8SGDeA69evmwyx1WXJbdmyxbT0vhWRh5YBqeo2AH/ZeqtQGBgYcLUJ2Pnp7u7GunXr7NQq3/eLyIVChlSVO8XbJhbm5uYKu1orpL29HX19bLOMhC3H4SIgrh2uIcfSinIrdd7f3+84FkvxrIjsElWNWG2xLVEt9TAyMoKZGVvyaxrUsv6mTZuwdu1ak/EKIEZAzwM4ZjKSuiw3ll2rhCXH0jOU/QT0PoDnDAeuVkAfENAp64LDCBOZgVPOZmTYUt68eTPI9QzlNAEZbwh0sgo3BYZ1loB4CWG8R5LyXLlyxXACnal3dHRgw4YNzpTLtQYIiATPiIwWbTSb9hTtuqQ/HJ4ioGkArhqSZrDsyjRw3XD9uJQCoAsA7nBpAJcvX17Rlbq1xXE9PT2FbtalFErOmJSWOiPTJig3jV1l0ORv5HENyBkCMu6BKh02oydy2QtVhnKSgN4FcKCBWSkMZaZIhyovRZzYdcmuq5k+SkDs9j5z4rioMzs7i2QyWbgHqORbPJ9u3LjhqARJbQim0kY8Hi/0Q3xn2JI/QUCdALjTOSKnpQxBRNDb27uCc3E9ETSvspi54lPkZlz0/L0a+RwdHS2Mo3i93sIm4ZDTkZyGHLcPqoqrV6+uIKQExZns6uK3LvdC0JysaoSXhywPWxv5r32gkpMGb2hoCJkMb2KrSyAQKJTgmjVr7ByveM82nqVaTxyAKmvw6rbg165dw+TkpKNAWR4sqc7OTvh8vppj2EuxtPjkcvyIV1+4lnjgsgxryP8tuJWlqucRs8LsuBGWIwPgw4AYePFxY68OxzsjIntos/TWZ7d1BVzm69KlS1hYWHDjvyVjYrFYIfsVwivhX8oAWVkq641YZiy31SQsY5Yes2/JaRHhl/eCVN6cbre+OnhZGmTTzaA0zZ4QXvCvX1/4MMLFd0/xknEFICtLbwJ4w2QjaHbAdva4Hrdu3cosvSUijHdZqn194GH79eDg4N7VmJ1i5NFo9FwoFNopIjxQawPim3Q6HR4bG0ssLS3V3nftprGF730+31JXV1dfOBxe8cmjJt1JJpP7pqamPs7n844oUQvjLzPt8Xi0s7PzyWg0+mk1n3WDjcfjH6VSqaduVrBO/IRCoeOxWOzpWrq2sz8+Pv5sKpU6lsvljL5EOQnORMfr9eZDodALkUjkw3rjbAFxcDKZ3J1Op79bWFhwdZliEng1Xb/fP9fR0fFgd3d31S/ftptCNaMjIyOxXC53bm5ujv82dtOkvb19zOfz3dXT0+OITDrKUGn0iUTiUCaTOZDNZm35fCOo/X7/bCAQeC8ajR40sWMMqGg8kUgQ1GuZTOZWE4d2uoFAYDIQCByKRCK8GjAW14CKnuLxOEnty9lsdk82mw2pqpFNHox+vz/V1tZ2xuPxvBOLxWzXScObgtNp4oHs9Xr3iQj/RTOSz+e7RSSsqmHaEJEJVZ3weDxJAOOqej6Xy50IBoP1uzunAfyr9w+YOZifVwIdWQAAAABJRU5ErkJggg==" />',
                            );
                        },
                        // =>kyj
                        ondataopen(data) {
                            Janus.log("Local The DataChannel is available!");
                        },
                        ondata(data) {
                            Janus.debug("We got data from the DataChannel!", data);
                            console.log("*** mounted: local Ondata json:", data);
                        },
                        // <=kyj
                    });
                },
                error(error) {
                    Janus.error(error);

                    // 서버 연결 안될 시 (서버 다운 시) 예외 처리
                    if (
                        error ==
                        "Error connecting to the Janus WebSockets server: Is the server down?"
                    ) {
                        alert(
                            "미디어 서버에 연결할 수 없습니다. \n관리자에게 문의하시기 바랍니다.",
                        );

                        // 통화 종료 처리
                        callStore.setHangupCallingConfirmFlag(true);
                        // eslint-disable-next-line no-constant-condition
                    } else if ("Lost connection to the server (is it down?)") {
                        // fail 처리
                        // console.log("lost !!!!!! Fail !!!!!!!")
                        alert(t("iceState Fail"));
                        // 통화 종료
                        janusAndCallingDestroy();
                    } else {
                        alert(error, function () {
                            callStore.init();
                            drawingStore.init();
                            meetingStore.init();
                            chattingStore.init();
                        });
                    }
                },
                destroyed() {
                    // 자신이 화면 공유 상태라면 화면 공유를 제거한다.
                    if (commonStore.isShare) {
                        console.log("screen Share Stop !!");
                        // 문서공유 종료 알림
                        requestScreenSharing();
                    }

                    // 자신이 드로잉 상태라면 드로잉 종료를 알린다.
                    if (commonStore.isDrawing) {
                        // 드로잉 종료 알림
                        const obj = {
                            rfid: myid.value,
                            status: 0,
                        };

                        const sendJson = JSON.stringify(obj);
                        signallingSocket.emit("drawing", sendJson);
                        console.log("*** socket: emit drawing. json: " + sendJson);
                    }
                    // ksy Test Code - 파일 송신자 새로고침 시 수신창제거
                    // cancelFileTransfer(
                    //  loginStore.m_local_deviceid,
                    //  commonStore.fileReceiver
                    // )

                    // discalling
                    discallingRequest(
                        loginStore.m_local_deviceid,
                        sessionStorage.getItem("m_remote_deviceid"),
                        sessionStorage.getItem("m_roomid"),
                        sessionStorage.getItem("m_institution"),
                        sessionStorage.getItem("m_nickname"),
                    );

                    // -> RoomID 를 사용하지 않는다면 RoomID 를 가용하게 만든다
                    const obj2 = {
                        roomid: sessionStorage.getItem("m_roomid"),
                        curr_time: getWorldTime(),
                        meeting_seq: meetingStore.meetingSeq, // 룸에 아무도 존재하지 않는다면 회의를 종료 시키기 위해서.
                        sendDurationEnable: sendDurationEnable.value, // flag를 통하여 미디어 서버에 보낼지 안보낼지 체크 (혼자인 경우 미디어서버에 보내지 않음)
                        unique_roomid: uniqueRoomid.value, // 2021-07-21 추가
                    };

                    const json2 = JSON.stringify(obj2);
                    signallingSocket.emit("destroyRoomID", json2);
                    console.log("*** socket: emit destroyRoomID. json: ", json2);

                    setTimeout(function () {
                        // -> kyj 통화 종료 시간을 기록한다
                        const currentTime = getWorldTime();
                        const obj = {
                            his_seq: sessionStorage.getItem("m_his_seq"),
                            end_time: currentTime,
                        };
                        const json = JSON.stringify(obj);
                        signallingSocket.emit("callStopTime", json);
                        console.log("*** socket: emit callStopTime. json: ", json);

                        // 통화 종료 시 watch 부분에 빼고 여기 넣음. -> 회의실 종료
                        leaveMeeting();
                    }, 1000);

                    clearInterval(setIntervalStream.value);

                    // 화면 공유 관련 intever 제거
                    if (myVideoCheckInterval.value != null) {
                        // console.log(
                        //  "****** 화면공유Interval이 null이 아니다. clear 해준다."
                        // )
                        clearInterval(myVideoCheckInterval.value); // 자기 자신 인터벌 클리어
                    }

                    // mainStream 관련 interval.value 제거
                    if (setIntervalStream.value != null) {
                        // console.log(
                        //  "****** 메인화면 체크 interval.value null이 아니다. clear 해준다."
                        // )
                        clearInterval(setIntervalStream.value);
                    }

                    // callingTimer 관련 interval.value 제거
                    if (callTimerInterval.value != null) {
                        setCallingTimer("stop");
                    }

                    // 비디오 없는 사용자들에게 보여주는 투명색 점찍기(검정색 화면 보여주는) 인터벌이 살아있다면 clear 해준다.
                    if (videoNoneCanvasInterval.value != null) {
                        clearInterval(videoNoneCanvasInterval.value);
                    }

                    // reload
                    setTimeout(function () {
                        // 세션 삭제 - 위치 이동 : sessionStorage roomid를 미리 삭제해버려서 회의 종료 시 room id가 null이 되기 때문에 위치 이동.
                        sessionStorage.removeItem("m_roomid");
                        sessionStorage.removeItem("createRoomFlag");
                        sessionStorage.removeItem("otherPartyAccess");

                        // guest가 입장 시 윈도우 창 닫기
                        if (callingType.value == "joinGuestCall") {
                            // 비회원 참가 시 window close
                            window.location.href = "https://wattsolution.co.kr/";
                        } else if (callingType.value == "meetingCall") {
                            commonStore.setChangeViewType(1);
                            router.push("/meeting");
                        } else {
                            commonStore.setChangeViewType(0);
                            router.push("/dashboard");
                        }
                        setTimeout(function () {
                            window.location.reload();
                        }, 500);
                    }, 3000);
                },
            });
        },
    });
    console.log("$$$$%%%%%%%%%%%%%%", janus.value);
    commonStore.setJanus({
        janus: janus.value,
        janusUse: true,
    });

    if (sessionStorage.getItem("createRoomFlag") === "true") {
        // 연락처 -> 통화화면으로 접근시에만 sending 및 통화연결
        if (callingType.value == "videoCall") {
            createRoomRequest(
                loginStore.m_local_deviceid,
                sessionStorage.getItem("m_roomid"),
                uniqueRoomid.value, // 2021-07-21 추가
            );

            // -> kyj 방 생성 후 최초 통화 발신중 메세지 출력
            // 자신의 언어에 따라 닉네임 변경
            const customNickname = customUserNickname(
                sessionStorage.getItem("m_remote_deviceid"),
            );
            console.log("*** mounted: sending customNickname: ", customNickname);
            callingLayoutChange("sending", customNickname, 1);
        }

        // ksh 추가
        // videoCallHost Check
        videoCallHostCheck(
            sessionStorage.getItem("m_roomid"),
            loginStore.m_local_deviceid,
        );
    } else {
        joinRoomRequest(
            loginStore.m_local_deviceid,
            sessionStorage.getItem("m_roomid"),
            uniqueRoomid.value, // 2021-07-21 추가
        );
    }
}

// --- 1. mapState 역할을 하는 computed 속성들 (단순히 스토어 상태를 읽어오는 용도) ---
// 이들은 해당 스토어 상태의 값을 직접적으로 반환하는 역할을 합니다.
const getLanguage = computed(() => loginStore.lang);
const currentRoomNumberCount = computed(() => commonStore.roomNumberCount);
const recentData = computed(() => callStore.recentData);
const recentDataAll = computed(() => callStore.recentDataAll);
const userData = computed(() => callStore.userData);
const userDataAll = computed(() => callStore.userDataAll);
const videoCallHost = computed(() => chattingStore.videoCallHost);
const isSounded = computed(() => commonStore.isSounded);
const personnelInRoom = computed(() => chattingStore.personnelInRoom);
const callingType = computed(() => callStore.callingType);
const saveThumbnailImg = computed(() => drawingStore.saveThumbnailImg);
const pdfUrlSaveArrays = computed(() => drawingStore.pdfUrlSaveArrays);
const uniqueRoomid = computed(() => callStore.uniqueRoomid);
const globalVideoSend = computed(() => callStore.globalVideoSend);
const globalAudioSend = computed(() => callStore.globalAudioSend);
const curBeforeDataModal = computed(() => directMessageStore.previousMessageInfo);
const accessDeviceCheck = computed(() => commonStore.accessDeviceCheck);
const accessDeviceOS = computed(() => commonStore.accessDeviceOS);
const autoCallAcceptTime = computed(() => preferenceStore.autoCallAcceptTime);
const autoPictureAccept = computed(() => preferenceStore.useAutoPictureAccept);
const autoDiscalling = computed(() => preferenceStore.useAutoDiscalling);
const gpsClickInfo = computed(() => callStore.gpsClickInfo);
const gpsListEvent = computed(() => callStore.gpsListEvent);
const sendDurationEnable = computed(() => callStore.sendDurationEnable);
const previewModalInfo = computed(() => commonStore.previewModalInfo);
const receiveFileResFlag = computed(() => commonStore.receiveFileResFlag);
const chattingShow = computed(() => chattingStore.chattingShow);
const onlyVoiceID = computed(() => callStore.onlyVoiceID);
const getisShareResult = computed(() => commonStore.isShare);
const getContectListinCalling = computed(() => callStore.contectListinCalling);
const getInCallingFunction = computed(() => callStore.inCallingFunction);
const getHostChangeRequest = computed(() => callStore.hostChangeRequest);
const getHostRequestResult = computed(() => callStore.hostRequestResult);
const getAllMicMuteStatus = computed(() => callStore.allMicMuteStatus);
const getVideoMainIndex = computed(() => callStore.videoMainIndex);
const getIsDrawing = computed(() => commonStore.isDrawing);
const getFileModalFlag = computed(() => commonStore.fileModalFlag);
const getMeetingLeaveFlag = computed(() => meetingStore.setMeetingLeaveFlag);
const getSendDMFlag = computed(() => directMessageStore.sendDMFlag);
const getReadProcFlag = computed(() => directMessageStore.readProcFlag);
const getCancelFileTransferFlag = computed(() => commonStore.cancelFileTransferFlag);
const getDrawingGetFileChangeFlag = computed(() => callStore.drawingGetFileChangeFlag);
const getDrawingGetPDFUploadFlag = computed(() => callStore.drawingGetPDFUploadFlag);
const getLaserPointerFlag = computed(() => callStore.laserPointerFlag);
const getCaptureSaveFlag = computed(() => callStore.captureSaveFlag);
const getHQCaptureFlag = computed(() => callStore.HQCaptureFlag);
const getPreviousMessageFlag = computed(() => directMessageStore.previousMessageFlag);
const getMotionFallCloseBtnClick = computed(() => callStore.motionFallCloseBtnClick);
const getMotionFallClickIndex = computed(() => callStore.motionFallClickIndex);
const getMotionNoMoveClickIndex = computed(() => callStore.motionNoMoveClickIndex);
const getStreamModeFlag = computed(() => callStore.streamModeFlag);
const getAutoDiscallingCancel = computed(() => callStore.autoDiscallingCancel);
const getFlag = computed(() => callStore.flag);
const getUnderStatus = computed(() => callStore.underStatus);
const calcPersonnelInRoom = computed(() => chattingStore.personnelInRoom); // personnelInRoom과 동일한 값
const getChattingShow = computed(() => chattingStore.chattingShow); // chattingShow와 동일한 값
const getOnlyVoiceIDFileSent = computed(() => callStore.onlyVoiceIDFileSent);
const getMediaDeviceModified = computed(() => commonStore.mediaDeviceModified);
const getCameraAllowedState = computed(() => callStore.cameraNotAllowed);

// --- 2. watch와 함께 사용되는 computed 속성들 (상태 변화 감지 후 특정 로직 실행) ---
// 이들은 특정 'handling' 로직이 필요하다고 주석에 명시된 항목들입니다.
// computed로 값을 추적하고, watch를 통해 해당 값의 변화에 따른 사이드 이펙트를 처리합니다.
const getMultiCallingPopupResult = computed(() => callStore.multiCallingResult);
const getCacncelCallingResult = computed(() => callStore.cancelCallResult);
const getCacncelCallFlag = computed(() => callStore.cancelCallFlag);
const getisVideoResult = computed(() => commonStore.isVideo);
const getFileSendFlag = computed(() => commonStore.fileSendFlag);
const getErrorCloseResult = computed(() => callStore.errorCloseResult);
const getMainVideoImage = computed(() => callStore.mainVideoImage);
const getCallingLayoutType = computed(() => commonStore.callingLayoutType);
const getSendMessageFlag = computed(() => chattingStore.sendMessageFlag);
const getInviteCancelFlag = computed(() => callStore.inviteCancelFlag);
const getHostCancelFlag = computed(() => callStore.hostCancelFlag);
const getMicOnOffClick = computed(() => callStore.micOnOffClick);
const getForceMicMuteBtnClick = computed(() => callStore.forceMicMuteBtnClick);
const getForceLeaveBtnClick = computed(() => callStore.forceLeaveBtnClick);
const getForceLeaveClickResult = computed(() => callStore.forceLeaveClickResult);
const changePersonnelInRoom = computed(() => chattingStore.personnelInRoom); // 이미 위의 mapState 용도와 겹치므로 하나로 통일해도 됩니다.
const getHangupCallingConfirmFlag = computed(() => callStore.hangupCallingConfirmFlag);
// --- watch 로직들 ---
// 위에 정의된 computed 값들이 변경될 때 실행될 함수들입니다.

watch(getMultiCallingPopupResult, (newValue, oldValue) => {
    console.log("MultiCallingPopupResult 변경됨:", newValue, oldValue);
    console.log("*** watch: getMultiCallingPopupResult");

    // 전화 벨 끄기
    callingBell("stop");

    if (newValue === 0 || newValue === 1) {
        // 0 : 거절,  1: 수락
        if (newValue == 1) {
            console.log("*** watch: multicalling Accept");
            requestMultiCalling({
                remoteDeviceId: multiCallingData.remotedeviceid,
                roomID: multiCallingData.roomid,
                currentRoomNumberCount: currentRoomNumberCount.value,
                uniqueRoomID: uniqueRoomid.value,
            });

            // 수락 거절 메시지 변경
            const chattingMessage =
                chattingStore.chattingMessageList[chattingCallingIndex.value].nickname +
                t("님의 통화 요청을 수락하였습니다");

            // 현재 UTC 시간 가져오기
            const nowDate = Math.floor(Date.now() / 1000);

            // vue 배열 감지를 위해 $set 사용
            chattingStore.chattingMessageList[chattingCallingIndex.value] = {
                type: 0,
                message: chattingMessage,
                calling: false,
                nowDate,
                chattingDate: getChattingTimeZone(nowDate),
                nickname: sessionStorage.getItem("m_nickname"),
                level: 1,
                // isReceived: true
            };

            /* 전화 자동 수락 취소 */
            if (autoCallAcceptTime.value > 0) {
                if (funcAutoCallAceept.value != null) {
                    console.log("*** socket: mutiCalling Accept >> AutoCallAccept init");
                    clearTimeout(funcAutoCallAceept.value);
                    funcAutoCallAceept.value = null;
                }
            }
        } else if (newValue == 0) {
            console.log("*** watch: multiCalling Reject");
            requestMultiRefuseCalling({
                remoteDeviceId: multiCallingData.remotedeviceid,
                roomID: multiCallingData.roomid,
            });

            const chattingMessage =
                chattingStore.chattingMessageList[chattingCallingIndex.value].nickname +
                t("님의 통화 요청을 거절하였습니다");

            // 현재 UTC 시간 가져오기
            const nowDate = Math.floor(Date.now() / 1000);

            chattingStore.chattingMessageList[chattingCallingIndex.value] = {
                type: 0,
                message: chattingMessage,
                calling: false,
                nowDate: nowDate,
                chattingDate: getChattingTimeZone(nowDate),
                nickname: sessionStorage.getItem("m_nickname"),
                level: 1,
                // isReceived: true
            };

            /* 전화 자동 수락 취소 */
            if (autoCallAcceptTime.value > 0) {
                if (funcAutoCallAceept.value != null) {
                    console.log(
                        "*** socket: mutiCalling Reject >> AutoCallAccept Cancel",
                    );
                    clearTimeout(funcAutoCallAceept.value);
                    funcAutoCallAceept.value = null;
                }
            }
        }

        // 하단 정렬일 경우에만
        // callingLayout 4 하단 레이아웃 default 버튼 변경
        // callStore.setUnderStatus", 0)
        setInitUnderStatus(0);
    }

    // init
    multiCallingData = [];
    callStore.setMultiCallingResult("");
    // MultiCallingPopupResult 값 변경 시 필요한 로직을 여기에 추가합니다.
});

watch(getCacncelCallingResult, (newValue, oldValue) => {
    console.log("getCacncelCallingResult 변경됨:", newValue, oldValue);
    if (newValue == true) {
        cancelCallingRequest();

        // init
        callStore.setCancelCallResult("");

        // 1:1 일 경우만 실행 됌 !
        // 발신중 전화화면 숨김
        // store useList에서 nickname 조회하여 index 가져오기
        // for (let i = 1; i < 15; i++) {
        for (let i = 1; i < callStore.currentRoomNumberCount; i++) {
            if (!feeds.value[i]) {
                callingLayoutChange("none", "", i);
                sessionStorage.setItem("m_callWaiting", "false");
                break;
            }
        }

        console.log("window x 버튼");
        /* 부재중 전화 등록 */
        setMissedCall(
            sessionStorage.getItem("m_his_seq"),
            loginStore.m_local_deviceid,
            sessionStorage.getItem("m_remote_deviceid"),
            getWorldTime(),
        );

        // 비디오 저장중 팝업 :: 통화 완전 종료 후 새로고침 되므로 vuex 초기화 되어서 팝업 자동 닫기
        noneOverlayModal(2);

        setTimeout(function () {
            commonStore.janus.destroy();
        }, 500); // 500 -> 2000 늘림
    }
    // cacncelCallingResult 값 변경 시 필요한 로직을 여기에 추가합니다.
});

watch(getCacncelCallFlag, (newValue, oldValue) => {
    console.log("getCacncelCallFlag 변경됨:", newValue, oldValue);
    if (result == true) {
        requestCancelCalling({
            remoteDeviceId: sessionStorage.getItem("m_remote_deviceid"),
            roomID: sessionStorage.getItem("m_roomid"),
        });

        console.log("통화 종료 버튼");
        /* 부재중 전화 등록 */
        setMissedCall(
            sessionStorage.getItem("m_his_seq"),
            loginStore.m_local_deviceid,
            sessionStorage.getItem("m_remote_deviceid"),
            getWorldTime(),
        );
    }

    // init
    callStore.setCancelCallFlag("");
    // cacncelCallingFalg 값 변경 시 필요한 로직을 여기에 추가합니다.
});

watch(getisVideoResult, (newValue, oldValue) => {
    console.log("getisVideoResult 변경됨:", newValue, oldValue);

    if (newValue) {
        muteVideoCustom();
        // console.log("보여지지 않는다.")
    } else {
        unmuteVideoCustom();
        // console.log("보여진다.")
    }
    // getisVideoResult 값 변경 시 필요한 로직을 여기에 추가합니다.
});

watch(getFileSendFlag, (newValue, oldValue) => {
    console.log("getFileSendFlag 변경됨:", newValue, oldValue);

    if (newValue) {
        // console.log("파일 송수신 클릭했다.")
        const status = commonStore.fileSendStatus;
        fileSend(status);
        commonStore.setFileSendFlag(false);
    }
    // 파일 송신 버튼 클릭 시 필요한 로직을 여기에 추가합니다.
});

watch(getErrorCloseResult, (newValue, oldValue) => {
    console.log("getErrorCloseResult 변경됨:", newValue, oldValue);

    if (result == true) {
        // for (let i = 1; i < 15; i++) {
        for (let i = 1; i < currentRoomNumberCount.value; i++) {
            if (!feeds.value[i]) {
                callingLayoutChange("none", "", i);
                break;
            }
        }
    }

    // init
    callStore.setErrorClose("");
    // getErrorCloseResult 값 변경 시 필요한 로직을 여기에 추가합니다.
});

watch(getMainVideoImage, (newValue, oldValue) => {
    console.log("getMainVideoImage 변경됨:", newValue, oldValue);

    if (newValue == "OFF") {
        // Main Name 변경
        console.log("*** watch: getMainVideoImage - videoOFF 사용자 클릭");
        // $("#videoMainCaption").html(callStore.mainVideoText)
        mainVideoChangeFunc(0, callStore.mainVideoText);
        console.log(callStore.videoMainIndex);
        // host가 바라보는 화면으로 만들기
        if (callStore.videoMainIndex == 0) {
            console.log("hostSelectedMainVideo 28");
            hostSelectedMainVideo(myid.value);

            // 자신의 화면 main으로 만들기
            mainVideoBorder(0);
        } else {
            const mainRfid = feeds.value[callStore.videoMainIndex].rfid;
            console.log("hostSelectedMainVideo 29");
            hostSelectedMainVideo(mainRfid);

            mainVideoBorder(callStore.videoMainIndex);
        }
    }

    callStore.setMainVideoImage({
        text: "",
        type: "",
    });
    // getMainVideoImage 값 변경 시 필요한 로직을 여기에 추가합니다.
});

watch(getCallingLayoutType, (newValue, oldValue) => {
    console.log("getCallingLayoutType 변경됨:", newValue, oldValue);
    videoLayoutChange();
    // callingLayout Change 시 필요한 로직을 여기에 추가합니다.
});

watch(getisShareResult, (newValue, oldValue) => {
    console.log("getisShareResult.value 변경됨:", newValue, oldValue);

    console.log("*** watch: getisShareResult.value. result = ", newValue);

    screenShare(newValue);

    // 공유 중지 버튼 클릭 시 공유 중지 했다는 것을 방 안에 사용자에게 알린다.
    if (!newValue) {
        // console.log("반짝반짝 효과 끄기")
        // clearInterval(callDivInterval)
        // const callDiv = document.getElementById("callDiv")
        // callDiv.style.border = "none"

        console.log("isShare : screen Share Stop !!");
        // 문서공유 종료 알림
        requestScreenSharing();
        console.log("*** socket: emit screenSharing Stop. json: " + sendJson);

        // 화면 공유 취소, 바로 중지 후에 laser 포인터가 display=block 상태일 때 none으로 변경
        callStoresetLaserPointerShow(false);
        if (
            onlyVoiceID.value.includes(
                loginStore.m_local_deviceid || callStore.cameraNotAllowed,
            )
        ) {
            navigator.mediaDevices.getUserMedia({ video: false, audio: true });
            commonStore.setOnlyVoiceIdInterval(true);
            interval.value = setInterval(() => {
                muteVideoCustom();
            }, 300);
            setTimeout(() => {
                clearInterval(interval.value);
                interval.value = "";
            }, 2000);
        }
    } else {
        commonStore.setOnlyVoiceIdInterval(false);
        if (interval.value) {
            clearInterval(interval.value);
            interval.value = "";
        }
        checkMainVideo();
    } // isShare 결과 변경 시 필요한 로직을 여기에 추가합니다.
});

watch(getSendMessageFlag, (newValue, oldValue) => {
    console.log("getSendMessageFlag 변경됨:", newValue, oldValue);
    if (newValue) {
        sendMessageBroadCast();
    } // 메시지 전송 플래그 변경 시 필요한 로직을 여기에 추가합니다.
});

watch(getContectListinCalling, (newValue, oldValue) => {
    console.log("getContectListinCalling.value 변경됨:", newValue, oldValue);

    if (newValue) {
        // setTimeout(function() {
        // 1. userList & RecentList 가져오기
        requestLastCallTime();
        requestUserListAll();
        // }, 1000)
    } // 통화 중 연락처 화면 관련 로직을 여기에 추가합니다.
});

watch(getInCallingFunction, (newValue, oldValue) => {
    console.log("getInCallingFunction.value 변경됨:", newValue, oldValue);

    if (newValue == "recentAllRequest") {
        requestLastCallTime();
    } else if (newValue == "userListAllRequest") {
        requestUserListAll();
    } else if (newValue == "userStatusRequest") {
        /* 긴급 통화 이면서, 긴급 전화를 받을 사용자가 현재 영상통화 방에 있을 경우 예외처리 > 20220223 ksh */
        if (callStore.urgentCallingFlag) {
            for (let i = 1; i < feeds.value.length; i++) {
                if (feeds.value[i] != null) {
                    if (feeds.value[i].rfdeviceid == callStore.inCallingFunctionParams) {
                        // 토스트 메세지 출력
                        commonToastMessage(
                            t("현재 영상통화에 참여 중인 사용자 입니다")[4],
                        );

                        // 긴급 통화 Flag 초기화
                        callStore.setUrgentCallingFlag(false);

                        // inCalling Function 초기화
                        callStore.setInCallingFunction(init);
                        return;
                    }
                }
            }
        }

        requestUserStatus(callStore.inCallingFunctionParams);
    } else if (newValue == "requestMessageFunc") {
        const receiverDeviceid = callStore.inCallingFunctionParams;
        requestMessageFunc(receiverDeviceid);

        // contactListinCalling 에서 비회원 초대 이메일 전송 버튼 클릭 시 --- ksy
    } else if (newValue == "inviteNonMember") {
        const nonMemberEmail = callStore.inCallingFunctionParams;
        inviteNonMember(nonMemberEmail);
        meetingAlertModal(1);
    }

    callStore.setInCallingFunction("init");
    // 통화 중 기능 변경 시 필요한 로직을 여기에 추가합니다.
});

watch(getInviteCancelFlag, (newValue, oldValue) => {
    console.log("getInviteCancelFlag 변경됨:", newValue, oldValue);
    if (newValue == "cancel") {
        inviteCancelCallingRequest();

        // init
        callStore.setInviteCancelFlag("");
    }
    // 초대 취소 플래그 변경 시 필요한 로직을 여기에 추가합니다.
});

watch(getHostChangeRequest, (newValue, oldValue) => {
    console.log("getHostChangeRequest.value 변경됨:", newValue, oldValue);
    if (newValue == true) {
        // host 요청 대기중 팝업
        hostPermissionRequest(1);

        // hostChange Request
        hostChangeRequest(
            sessionStorage.getItem("m_roomid"),
            loginStore.m_local_deviceid,
        );

        // init
        callStore.setHostChangeRequest(false);
    } // 호스트 변경 요청 감지 시 필요한 로직을 여기에 추가합니다.
});

watch(getHostRequestResult, (newValue, oldValue) => {
    console.log("getHostRequestResult.value 변경됨:", newValue, oldValue);

    if (newValue == "accept") {
        // 수락
        hostChange(
            1,
            sessionStorage.getItem("m_roomid"),
            loginStore.m_local_deviceid,
            callStore.hostRequestInfo,
        );

        // 자신 왕관 제거 및 호스트 버튼 변경
        commonStore.setHostIcon(0, false);

        // 자신의 호스트 버튼 변경
        chattingStore.setVideoCallHost(false);

        // 새로운 호스트의 index 검색 -> 왕관표시 추가
        const hostindex = findFeedsIndexDeviceid(callStore.hostRequestInfo);

        // console.log("@@" + callStore.hostRequestInfo)
        // console.log("##" + hostindex)
        commonStore.setHostIcon(hostindex, true);

        // 현재 방이 전체 음소거인지 체크한다.
        if (callStore.allMicMuteFlag) {
            // 전체 음소거가 맞다면, 나의 마이크 상태가 ON 이라면 OFF로 변경한다. (isSounded = flase (mic on 상태))
            if (!commonStore.isSounded) {
                // 음소거 버튼 변경
                commonStore.setIsSounded();

                // 마이크 음소거
                commonStore.toggleMute();

                // 마이크 on/off socket event 실행
                commonStore.micOnOff(0, myid.value);

                // userListStatus 마이크 등록
                commonStore.setUserListMicMute(0, true);
            }
        }
        // 초기화
        callStore.setHostRequestResult("");

        // 팝업 SessionStorgae 삭제
        sessionStorage.removeItem("hostRequestFlag");

        // 호스트 수락 거절 팝업 닫기
        modalStore.closeModal("host");

        // 썸네일 이관 전 알림
        drawingStore.setBeforeThumbnailTransfer(true);

        // 썸네일 이관 socket 실행
        setTimeout(() => {
            moveThumbnail(loginStore.m_local_deviceid, callStore.hostRequestInfo);
            // 자신이 드로잉 상태라면 드로잉을 종료한다.
            if (commonStore.isDrawing) {
                commonStore.setIsDrawing();
            }

            /* 21-07-26 드로잉 분리 작업 */
            // 자신이 화면 공유 중 일 경우 화면 공유를 종료한다.
            if (commonStore.isShare) {
                commonStore.setIsShare();
            }
        }, 100);
    } else if (newValue == "reject") {
        // 거절
        // console.log("거절")
        hostChange(
            2,
            sessionStorage.getItem("m_roomid"),
            loginStore.m_local_deviceid,
            callStore.hostRequestInfo,
        );

        // 초기화
        callStore.setHostRequestResult("");

        // 팝업 SessionStorgae 삭제
        sessionStorage.removeItem("hostRequestFlag");

        // 호스트 수락 거절 팝업 닫기
        modalStore.closeModal("host");
    }
    // 호스트 팝업창 수락/거절 결과 변경 시 필요한 로직을 여기에 추가합니다.
});

watch(getHostCancelFlag, (newValue, oldValue) => {
    console.log("getHostCancelFlag 변경됨:", newValue, oldValue);

    if (newValue) {
        hostRequestCancel(
            sessionStorage.getItem("m_roomid"),
            loginStore.m_local_deviceid,
        );

        callStore.setHostCancelFlag(false);
    }
    // 호스트 요청 취소 플래그 변경 시 필요한 로직을 여기에 추가합니다.
});

watch(getAllMicMuteStatus, (newValue, oldValue) => {
    console.log("getAllMicMuteStatus.value 변경됨:", newValue, oldValue);

    if (videoCallHost.value) {
        setAllMicMute(newValue, loginStore.m_local_deviceid);

        // 마이크 off 일 경우 true / on 일 경우 false
        let resultBoolean = false; // 기본값 false로

        if (newValue == 0) {
            resultBoolean = true;
        }

        // 자신(호스트) 외의 사람들은 전부 마이크 off 버튼 생성
        // 나 혼자 일 경우 제외
        if (personnelInRoom.value != 1) {
            for (let i = 1; i < feeds.value.length; i++) {
                if (feeds.value[i] != null) {
                    setUserListMicMute(i, resultBoolean);
                }
            }
        }

        // 호스트 자신에게만 전체 마이크 음소거 관련 메세지 출력
        const nickname = sessionStorage.getItem("m_nickname");
        const level = 1;
        const type = 5;
        const nowDate = getWorldTime();

        let message = "";
        if (newValue == 0) {
            message = nickname + t(" 님이 전체 음소거를 하였습니다");
        } else {
            message = nickname + t("님이 전체 음소거를 해제하였습니다");
        }

        chattingStore.sendMessage({
            nickname,
            message,
            level,
            type,
        });
        // 채팅창이 활성화 되어 있는 경우 스크롤바 이동
        if (chattingShow.value == false) {
            setTimeout(function () {
                // scroll 아래로 이동
                const scrollElement = document.getElementById(
                    "chattingBarMessageBoxScroll",
                );
                scrollElement.scrollTop = scrollElement.scrollHeight;
            }, 100);
        }
    } // 전체 마이크 음소거 상태 변경 시 필요한 로직을 여기에 추가합니다.
});

watch(getMicOnOffClick, (newValue, oldValue) => {
    console.log("getMicOnOffClick 변경됨:", newValue, oldValue);

    let status = "";
    // console.log("mic Result : " + result)

    if (newValue == true) {
        status = 0;
    } else {
        status = 1;

        // 강제로 음소거 된 상태라면 강제로 음소거 vuex 초기화 한다. (false로 변경한다.)
        if (callStore.forceMicOnOffFlag) {
            callStore.setForceMicOnOffFlag(false);
        }
    }

    // 마이크 on/off socket event 실행
    micOnOff(status, myid.value);

    // userListStatus 마이크 등록
    setUserListMicMute(0, newValue);
    // 마이크 음소거 클릭 시 필요한 로직을 여기에 추가합니다.
});

watch(getForceMicMuteBtnClick, (newValue, oldValue) => {
    console.log("getForceMicMuteBtnClick 변경됨:", newValue, oldValue);

    if (newValue) {
        let status = "";

        // vuex에 저장된 index의 값을 가져온다.
        const forceMicMuteIndex = callStore.forceMicMuteIndex;
        // console.log("forceMicMuteIndex : " + forceMicMuteIndex)

        // index의 값으로 현재 선택된 사용자의 마이크 상태를 가져온다.
        const forceMicStatus = commonStore.userListStatus[forceMicMuteIndex].mute;
        // console.log("forceMicStatus : " + forceMicStatus)

        // 현재 상태가 음소거 상태 (true) 라면 -> 음소거 해제 상태로 바꾼다. status 1
        if (forceMicStatus == true) {
            status = 1;
        } else {
            // 현재 상태가 음소거 해제 상태 (false) 라면 -> 음소거 상태로 바꾼다. status 0
            status = 0;
        }

        // index의 값으로 rfid를 찾는다.
        const forceMicMuteRfid = feeds.value[forceMicMuteIndex].rfid;
        // console.log("forceMicMuteRfid : " + forceMicMuteRfid)

        // 변경할 mic status와 rfid를 보낸다.
        forceMicOnOff(status, forceMicMuteRfid);

        // 선택된 사용자의 마이크 status 변경
        setUserListMicMute(forceMicMuteIndex, !forceMicStatus);

        // forceMicMuteBtnClick vuex 초기화
        callStore.setForceMicMuteBtnClick(false);
    }
    // 호스트가 일반 사용자의 마이크 음소거 클릭 시 필요한 로직을 여기에 추가합니다.
});

watch(getIsDrawing, (newValue, oldValue) => {
    console.log("getIsDrawing.value 변경됨:", newValue, oldValue);

    if (newValue) {
        commonStore.setVideoState(commonStore.isVideo);
        commonStore.setOnlyVoiceIdInterval(false);
        if (interval.value) {
            clearInterval(interval.value);
            interval.value = "";
        }
        // callingLayoutType.value == 1인 상태에서 drawing 접근 시 mainVideo설정이 되어있지 않아, drawing 종료 시 nickname 표기가 안되는 현상 fix
        checkMainVideo();
        commonStore.setIsVideoTrue();
        commonStore.setIsVideo();
        // 드로잉 클릭 시 열려있던 모달 닫기
        for (let i = 1; i <= previewModalInfo.value.previewModalcnt; i++) {
            commonStore.setPreviewModalFlag({ modalIndex: i, url: "", show: "hide" });
            // document.getElementsByName("previewModal" + i)[0].style.display = "none";
            modalStore.closeModal("preview" + i);
        }

        // 메인이 videoOFF 상태일 경우 예외 처리
        const hostSelectedMainIndex = callStore.videoMainIndex;
        if (hostSelectedMainIndex == 0) {
            // video가 Off일 경우 비디오를 켜준다. - 임시
            if (commonStore.insert_main_video == true) {
                commonStore.setIsVideo();
            }
        } else {
            // 일반사용자가 메인(videoOff)인상태에서 드로잉 > videoOff 화면이 나타나는 현상으로 예외처리 ksy
            mainVideoChangeFunc(
                1,
                commonStore.userListStatus[hostSelectedMainIndex].text,
            );
        }

        console.log("*** watch: drawing Start");

        // videoLayout을 변경하고, canvas createOffer를 한다.
        canvasSaveVideoInfo(newValue);

        // 메인화면 전체화면 버튼 숨김
        callStore.setMainVideoFullScreen(false);

        // 호스트가 드로잉을 활성화 했음을 store 에 저장한다
        commonStore.setIsDrawingEnable({
            result: true,
        });
        // console.log("**** 드로잉 활성화 상태: ", $store.state.isDrawingEnable)
    } else {
        // 드로잉 hide !
        callStore.setDrawingIframe(false);

        // 투명 찍어주는 interval.value 초기화
        canvasCreateOffer(newValue);

        /* 서버 업로드 취소 및 초기화 */
        /* 업로드 예약 된 Que를 취소한다. -> 예약된 Que를 먼저 제거해야 오류에 안전하다. */
        for (let i = 1; i < callStore.pdfUploadQueArray.length; i++) {
            if (callStore.pdfUploading == true) {
                console.log("i = ", i);
                // que에 있고, 첫번째를 제외한 que를 제거해라.
                console.log("*** watch: drawing - upload Que Remove !");
                callStore.pdfUploadQueArray.splice(i, 1);
                i--;

                console.log(callStore.pdfUploadQueArray);
            }
        }

        /* 업로드 중인 것을 취소한다. */
        for (let i = 0; i < callStore.pdfUploadQueArray.length; i++) {
            // que에 있고, 첫번째 이면서, uploading 중이라면 업로드를 삭제해라.
            if (i == 0 && callStore.pdfUploading == true) {
                console.log("i = ", i);
                console.log("*** watch: drawing - upload Cancel !");
                // 업로드 취소
                callStore.setPDFcancelUploadFlag(true);

                console.log(callStore.pdfUploadQueArray);
            } else {
                // que에 있고, 첫번째가 아니라면 que에서 제거해라.
                console.log("*** watch: drawing - upload Que Remove !");
                callStore.pdfUploadQueArray.splice(i, 1);
                i--;

                console.log(callStore.pdfUploadQueArray);
            }
        }

        // 메인화면 전체화면 버튼 표시
        callStore.setMainVideoFullScreen(true);

        // 호스트가 드로잉을 비활성화 했음을 store 에 저장한다
        commonStore.setIsDrawingEnable({
            result: false,
        });
        console.log("**** 드로잉 활성화 상태: ", commonStore.isDrawingEnable);
        if (
            onlyVoiceID.value.includes(
                loginStore.m_local_deviceid || callStore.cameraNotAllowed,
            )
        ) {
            navigator.mediaDevices.getUserMedia({ video: false, audio: true });
            commonStore.setOnlyVoiceIdInterval(true);
            if (interval.value) {
                clearInterval(interval.value);
                interval.value = "";
            }
            interval.value = setInterval(() => {
                muteVideoCustom();
            }, 300);
            setTimeout(() => {
                clearInterval(interval.value);
                interval.value = "";
            }, 2000);
        }
    }
    // leftbar - 드로잉 클릭 시 필요한 로직을 여기에 추가합니다.
});

watch(getForceLeaveBtnClick, (newValue, oldValue) => {
    console.log("getForceLeaveBtnClick 변경됨:", newValue, oldValue);
    if (newValue) {
        // alertModal(4)
        noneOverlayModal(1);
        // forceLeaveBtnClick vuex 초기화
        callStore.setForceLeaveBtnClick(false);
    }
    // 호스트가 일반 사용자의 강제퇴장 버튼 클릭 시 필요한 로직을 여기에 추가합니다.
});

watch(getForceLeaveClickResult, (newValue, oldValue) => {
    console.log("getForceLeaveClickResult 변경됨:", newValue, oldValue);

    if (newValue) {
        // vuex에 저장된 index의 값을 가져온다.
        const forceLeaveIndex = callStore.forceLeaveIndex;
        // console.log("forceLeaveIndex : " + forceLeaveIndex)

        // index의 값으로 현재 선택된 사용자의 deviceid를 시그널링으로 보낸다.
        const forceLeaveDeviceid = feeds.value[forceLeaveIndex].rfdeviceid;
        // console.log("forceLeaveDeviceid : " + forceLeaveDeviceid)

        requestForceLeave(forceLeaveDeviceid);
        console.log("*** socket: emit forceLeave. json: " + json);

        // forceLeaveBtnClick vuex 초기화
        callStore.setForceLeaveClickResult(false);

        // 강제퇴장 팝업 닫기
        modalStore.closeModal("noneOverlayModal");
    }
    // 호스트가 일반 사용자 강제퇴장 버튼 클릭 후 수락/거절 클릭 시 필요한 로직을 여기에 추가합니다.
});

watch(getFileModalFlag, (newValue, oldValue) => {
    console.log("getFileModalFlag.value 변경됨:", newValue, oldValue);

    if (newValue) {
        commonStore.setCallingUser("init");
        for (let i = 1; i < feeds.value.length; i++) {
            // 비회원은 목록에 생성하지 않는다.
            // console.log("@@@" + feeds.value[i].rfdeviceid)
            if (feeds.value[i] != null) {
                if (!feeds.value[i].rfdeviceid.includes("@")) {
                    const userInfo = [];

                    // 사용자의 언어에 따라 닉네임을 변경한다.
                    const customNickname = customUserNickname(feeds.value[i].rfdeviceid);
                    console.log(
                        "*** watch: getFileModalFlag > customNickname: ",
                        customNickname,
                    );

                    // userInfo.push(feeds.value[i].rfdisplay)
                    userInfo.push(customNickname);
                    userInfo.push(feeds.value[i].rfdeviceid);
                    commonStore.setCallingUser(userInfo);
                }
            }
        }
    }
    // 파일 송수신 모달창 open 여부 변경 시 필요한 로직을 여기에 추가합니다.
});

watch(getMeetingLeaveFlag, (newValue, oldValue) => {
    console.log("getMeetingLeaveFlag.value 변경됨:", newValue, oldValue);

    if (newValue) {
        console.log("*** watch: 회의실 퇴장 버튼 클릭 감지");
        // 회의실에서 입장한 경우
        if (callStore.callingType == "meetingCall") {
            // console.log("회의실에서 입장한 사람입니다.")
            leaveMeeting();
            meetingStore.setMeetingLeaveFlag(false);
        } else {
            // console.log("영상통화에서 입장한 사람입니다.")
        }
    }
    // 퇴장 버튼 클릭 시 vuex 변경 감지 로직을 여기에 추가합니다.
});

watch(changePersonnelInRoom, (newValue, oldValue) => {
    console.log("changePersonnelInRoom 변경됨:", newValue, oldValue);

    console.log("*** watch: changePersonnelInRoom");
    resultMaxNum.value = Math.max(newValue, resultMaxNum.value);
    if (resultMaxNum.value > 1) {
        if (sendDurationEnableFlag.value) {
            callStore.setSendDurationEnable(true);
        }
    } else if (sendDurationEnable.value && resultMaxNum.value < 2) {
        sendDurationEnableFlag.value = true;
        callStore.setSendDurationEnable(false);
    }

    let listType = 0;

    // 현재 연락처 화면이 켜져있을 경우에만 list를 호출한다.
    if (callStore.contectListinCalling) {
        // 최근통화목록인지, 조직도 목록인지 체크한다.
        if (sessionStorage.getItem("ListViewType")) {
            listType = sessionStorage.getItem("ListViewType");
        }

        // 최근통화목록
        if (listType == 0) {
            requestLastCallTime();
        } else {
            // 조직도목록
            requestUserListAll();
        }
    }
    // 방 인원수 변경 시 필요한 로직을 여기에 추가합니다.
});

watch(getSendDMFlag, (newValue, oldValue) => {
    console.log("getSendDMFlag.value 변경됨:", newValue, oldValue);

    if (newValue) {
        // 소켓 보내기
        const messageIndex = directMessageStore.directMessageList.length - 1;

        sendDirectMessageRequest(
            directMessageStore.directMessageList[messageIndex].sender,
            directMessageStore.directMessageList[messageIndex].receiver,
            directMessageStore.directMessageList[messageIndex].type,
            directMessageStore.directMessageList[messageIndex].message,
            directMessageStore.directMessageList[messageIndex].datetime,
        );

        // sendDM Flag 초기화
        directMessageStore.setSendDMFlag(false);
    }
    // DM 송신 플래그 변경 시 필요한 로직을 여기에 추가합니다.
});

watch(getReadProcFlag, (newValue, oldValue) => {
    console.log("getReadProcFlag.value 변경됨:", newValue, oldValue);
    if (newValue) {
        // 읽음처리
        console.log(directMessageStore.readMessageInfo[0]);

        readProcess(
            directMessageStore.readMessageInfo[0].sender,
            directMessageStore.readMessageInfo[0].receiver,
            directMessageStore.readMessageInfo[0].datetime,
        );

        // readProcFlag Flag 초기화
        directMessageStore.setReadProcFlag(false);
    }
    // DM 읽음 처리 플래그 변경 시 필요한 로직을 여기에 추가합니다.
});

watch(getCancelFileTransferFlag, (newValue, oldValue) => {
    console.log("getCancelFileTransferFlag.value 변경됨:", newValue, oldValue);

    if (newValue) {
        // 송신할 파일 Reader 중단
        if (
            !(typeof sendFileReader.value == "undefined" || sendFileReader.value == null)
        ) {
            sendFileReader.value.abort();
        }

        // 전송률 전송 재귀함수 정지
        if (!(typeof rateStopper.value == "undefined" || rateStopper.value == null)) {
            rateStopper.value();
            rateStopper.value = null;
        }

        // 파일 송신 취소 모달창 출력
        commonStore.setFileSendStatus(7);

        // 수신측 PC 채팅창에 파일 송신 취소 메시지 추가 (9)
        const remoteInfo = userDataGetInfo(commonStore.fileReceiver);
        const rfIndex = findFeedsIndexDeviceid(commonStore.fileReceiver);
        console.log(remoteInfo.nickName, rfIndex);
        const fileChatIndex =
            commonStore.userListStatus[rfIndex].fileSendInfo.fileChatIndex;
        addChatFileSendMessage(remoteInfo.nickName, 9, rfIndex, fileChatIndex);

        // 파일 송신 초기화
        fileSendReset();

        // 파일 송신 취소 이벤트 전송
        const obj = {
            localdeviceid: loginStore.m_local_deviceid,
            remotedeviceid: commonStore.fileReceiver,
        };
        const json = JSON.stringify(obj);
        signallingSocket.emit("cancelFileTransfer", json);
        console.log("*** socket: emit cancelFileTransfer");
    }
    // 파일 송신 취소 플래그 변경 시 필요한 로직을 여기에 추가합니다.
});

watch(getDrawingGetFileChangeFlag, (newValue, oldValue) => {
    console.log("getDrawingGetFileChangeFlag.value 변경됨:", newValue, oldValue);

    if (newValue) {
        const drawingFileUpload = callStore.drawingGetFileObject[0];

        // 드로잉 이미지 업로드
        commonFileServerUpload(
            drawingFileUpload.name,
            drawingFileUpload.size,
            callStore.drawingGetFileSrc,
            "drawingImage",
        );
    }
    // 드로잉 이미지 불러오기 플래그 변경 시 필요한 로직을 여기에 추가합니다.
});

watch(getDrawingGetPDFUploadFlag, (newValue, oldValue) => {
    console.log("getDrawingGetPDFUploadFlag.value 변경됨:", newValue, oldValue);

    if (newValue) {
        const drawingPDFInfo = callStore.drawingGetPDFUploadObject[0];

        // 파일 정보 Que Push
        callStore.pushPdfUploadQueArray({
            drawingPDFName: drawingPDFInfo.name,
            drawingPDFSize: drawingPDFInfo.size,
            drawingPDFSrc: callStore.drawingGetPDFUploadSrc,
            groupIndex: drawingStore.lastPDFGroupIndex, // groupIndex
        });

        // upload Que 가 1 보다 클 경우 현재 파일 송신 정보들을 Que에 추가하고 업로드를 실행하지 않는다.
        // console.log("Que length : ", callStore.pdfUploadQueArray.length)
        // console.log("Que Info : ", callStore.pdfUploadQueArray)

        if (callStore.pdfUploadQueArray.length > 1) {
            // console.log("Que.length > 1")

            // 드로잉 이미지 불러오기 업로드 flag 초기화 -> 그래야 연속적으로 pdf 불러오기 가능
            callStore.setDrawingGetPDFUploadFlag(false);
        } else {
            // console.log("Que length =< 1")

            // 드로잉 pdf 업로드
            drawingPDFServerUpload(
                drawingPDFInfo.name,
                drawingPDFInfo.size,
                callStore.drawingGetPDFUploadSrc,
            );

            // 드로잉 이미지 불러오기 업로드 flag 초기화 -> 그래야 연속적으로 pdf 불러오기 가능
            callStore.setDrawingGetPDFUploadFlag(false);
        }
    }
    // pdf 업로드 플래그 변경 시 필요한 로직을 여기에 추가합니다.
});

watch(getLaserPointerFlag, (newValue, oldValue) => {
    console.log("getLaserPointerFlag.value 변경됨:", newValue, oldValue);
    if (newValue) {
        laserPointerBroadCast();
        callStore.setLaserPointerFlag(false);
    }
    // 레이저 포인터 플래그 변경 시 필요한 로직을 여기에 추가합니다.
});

watch(getCaptureSaveFlag, (newValue, oldValue) => {
    console.log("getCaptureSaveFlag.value 변경됨:", newValue, oldValue);

    if (newValue) {
        console.log("captrue save true !!");

        const uploadFileInfo = callStore.captureImageInfo;

        // PC에 저장
        const received = sendFileServerUploadFileToBlob(uploadFileInfo.fileSrc);
        const url = window.URL.createObjectURL(received);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;

        const imageFileType = "jpg";
        const fname = getImageFileName(imageFileType);
        // console.log("***** image file name: ".concat(fname))
        a.download = fname;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 100);

        // 서버 업로드 중입니다 모달로 변경
        noneOverlayModal(15);

        // 서버 업로드
        commonFileServerUpload(
            uploadFileInfo.fileName,
            uploadFileInfo.fileSize,
            uploadFileInfo.fileSrc,
            "captureImage",
        );
    }
    // 캡처 저장 플래그 변경 시 필요한 로직을 여기에 추가합니다.
});

watch(getHQCaptureFlag, (newValue, oldValue) => {
    console.log("getHQCaptureFlag.value 변경됨:", newValue, oldValue);
    if (newValue) {
        requestHQCapture();
    }
    // 고화질 캡처 플래그 변경 시 필요한 로직을 여기에 추가합니다.
});

watch(getPreviousMessageFlag, (newValue, oldValue) => {
    console.log("getPreviousMessageFlag.value 변경됨:", newValue, oldValue);
    if (newValue) {
        getPreviousMessage();
        directMessageStore.setPreviousMessageFlag(false);
    }
    // 다이렉트 메시지 - 이전 메시지 버튼 클릭 시 필요한 로직을 여기에 추가합니다.
});

watch(getMotionFallCloseBtnClick, (newValue, oldValue) => {
    console.log("getMotionFallCloseBtnClick.value 변경됨:", newValue, oldValue);

    if (newValue) {
        // 서브 비디오 낙하 모션 아이콘 초기화
        for (let i = 0; i < callStore.motionFallInfo.length; i++) {
            // console.log(
            //  "*** watch: getMotionFallCloseBtnClick.value > 낙하 알람 확인 클릭 > " +
            //      callStore.motionFallInfo[i].rfIndex +
            //      " 번째 사용자 낙하 모션 아이콘 초기화"
            // )
            setSubVideoMotionFall(callStore.motionFallInfo[i].rfIndex, false);
        }

        // 낙하 모션 정보 초기화
        callStore.clearMotionFallInfo();

        // 낙하 모션 Flag 초기화
        callStore.setMotionFallFlag(false);

        /* 사이렌 알람 소리 끄기 */
        emergencyAlarmBell("stop");

        // 낙하 모션 확인 버튼 클릭 초기화
        callStore.setMotionFallCloseBtnClick(false);
    }
    // 모션 낙하 확인 클릭 시 필요한 로직을 여기에 추가합니다.
});

watch(getMotionFallClickIndex, (newValue, oldValue) => {
    console.log("getMotionFallClickIndex.value 변경됨:", newValue, oldValue);

    if (newValue != null) {
        /* Index를 이용해서 motionFallInfo 가져오기 */
        const motionInfo = callStore.motionFallInfo[newValue];
        let videoDOM = "";

        /* motionInfo에 등록된 rfid가 존재하는지 체크한다. */
        if (motionInfo.rfid != myid.value) {
            for (let i = 0; i < feeds.value.length; i++) {
                if (feeds.value[i] != null && feeds.value[i].rfid == motionInfo.rfid) {
                    break;
                }

                /* 마지막까지 수행했으나, feeds를 찾을 수 없음. > 나간 사용자 */
                if (i == feeds.value.length - 1) {
                    // console.log(
                    //  "*** watch: getMotionFallClickIndex > 낙하 배열에 존재하지 않는 id > 이미 나간 사용자"
                    // )
                    commonToastMessage(
                        t("해당 사용자는 영상통화를 종료한 사용자 입니다"),
                    );

                    callStore.setMotionFallClickIndex(null);
                    return;
                }
            }

            /* video DOM 설정 */
            videoDOM = document.getElementById("remotevideo" + motionInfo.rfIndex);

            /* 메인화면 변경하기 */
            if (videoCallHost.value) {
                // eslint-disable-next-line camelcase
                const main_video = document.getElementById("videoMain");

                main_video.srcObject = videoDOM.srcObject;
                $("#videoMainCaption").html(motionInfo.nickname);

                // MainVideo Check
                if (callStore.videoMainIndex != motionInfo.rfIndex) {
                    mainVideoChangeFunc(1, motionInfo.nickname);
                }

                // Main Index 관리
                callStore.setVideoMainIndex(motionInfo.rfIndex);

                // MainVideo Border Change
                mainVideoBorder(motionInfo.rfIndex);

                // host가 바라보는 메인 화면으로 변경
                hostSelectedMainVideo(motionInfo.rfid);
            }
        }

        callStore.setMotionFallClickIndex(null);
    }
    // 모션 사용자 정보 클릭 시 필요한 로직을 여기에 추가합니다.
});

watch(getMotionNoMoveClickIndex, (newValue, oldValue) => {
    console.log("getMotionNoMoveClickIndex.value 변경됨:", newValue, oldValue);

    if (newValue != null) {
        /* Index를 이용해서 motionFallInfo 가져오기 */
        const motionInfo = callStore.motionNoMoveInfo[newValue];
        let videoDOM = "";

        /* motionInfo에 등록된 rfid가 존재하는지 체크한다. */
        if (motionInfo.rfid != myid.value) {
            for (let i = 0; i < feeds.value.length; i++) {
                if (feeds.value[i] != null && feeds.value[i].rfid == motionInfo.rfid) {
                    break;
                }

                /* 마지막까지 수행했으나, feeds를 찾을 수 없음. > 나간 사용자 */
                if (i == feeds.value.length - 1) {
                    // console.log(
                    //  "*** watch: getMotionNoMoveClickIndex.value > 움직임 없음 배열에 존재하지 않는 id > 이미 나간 사용자"
                    // )
                    commonToastMessage(
                        t("해당 사용자는 영상통화를 종료한 사용자 입니다."),
                    );

                    callStore.setMotionNoMoveClickIndex(null);
                    return;
                }
            }

            /* video DOM 설정 */
            videoDOM = document.getElementById("remotevideo" + motionInfo.rfIndex);

            /* 메인화면 변경하기 */
            if (videoCallHost.value) {
                // eslint-disable-next-line camelcase
                const main_video = document.getElementById("videoMain");

                main_video.srcObject = videoDOM.srcObject;
                $("#videoMainCaption").html(motionInfo.nickname);

                // MainVideo Check
                if (callStore.videoMainIndex != motionInfo.rfIndex) {
                    mainVideoChangeFunc(1, motionInfo.nickname);
                }

                // Main Index 관리
                callStore.setVideoMainIndex(motionInfo.rfIndex);

                // MainVideo Border Change
                mainVideoBorder(motionInfo.rfIndex);

                // host가 바라보는 메인 화면으로 변경
                hostSelectedMainVideo(motionInfo.rfid);
            }
        }

        callStore.setMotionNoMoveClickIndex(null);
    }
    // 움직임 없음 사용자 정보 클릭 시 필요한 로직을 여기에 추가합니다.
});

watch(getStreamModeFlag, (newValue, oldValue) => {
    console.log("getStreamModeFlag.value 변경됨:", newValue, oldValue);
    if (newValue) {
        prepareStreamMode(callStore.prepareStreamMode)
        callStore.setStreamModeFlag(false)
    }
});

watch(getAutoDiscallingCancel, (newValue, oldValue) => {
    console.log("getAutoDiscallingCancel.value 변경됨:", newValue, oldValue);
    if (newValue) {
        if (funcAutoDiscalling.value != null) {
            // console.log("*** watch: getAutoDiscallingCancel !")
            // 자동통화 기능 삭제
            clearTimeout(funcAutoDiscalling.value);

            // 자동통화 관련 초기화
            callStore.setAutoDiscallingCancel(false);
            callStore.setAutoDiscallingResult(false);
        }
    }
});

watch(getFlag, (newValue, oldValue) => {
    const level = callStore.changeZoomLevel;
    setZoomLevel(level);
    // 일반 플래그 변경 시 필요한 로직을 여기에 추가합니다.
});

// calcPersonnelInRoom은 personnelInRoom과 동일한 computed이므로,
// personnelInRoom에 대한 watch로 대체 가능합니다.
watch(calcPersonnelInRoom, (newValue, oldValue) => {
    console.log("calcPersonnelInRoom.value 변경됨:", newValue, oldValue);
    if (newValue > 1 && commonStore.isVideo) {
        if (
            callStore.onlyVoiceID.includes(loginStore.m_local_deviceid) ||
            callStore.cameraNotAllowed
        ) {
            muteVideoCustom();
        }
    }
});

// getChattingShow는 chattingShow와 동일한 computed이므로,
// chattingShow에 대한 watch로 대체 가능합니다.
watch(getChattingShow, (newValue, oldValue) => {
    console.log("getChattingShow.value 변경됨:", newValue, oldValue);
    videoResize();
});

watch(getOnlyVoiceIDFileSent, (newValue, oldValue) => {
    console.log("getOnlyVoiceIDFileSent.value 변경됨:", newValue, oldValue);
    if (res) {
        muteVideoCustom();
        commonStore.setFileModalFlag(false);
    } // onlyVoiceIDFileSent 변경 시 필요한 로직을 여기에 추가합니다.
});

watch(getMediaDeviceModified, (newValue, oldValue) => {
    console.log("getMediaDeviceModified.value 변경됨:", newValue, oldValue);
    if (!newValue) return;
    console.log("*** media device modified");
    streamMediaChange();
    // 미디어 장치 수정 플래그 변경 시 필요한 로직을 여기에 추가합니다.
});

watch(getCameraAllowedState, (newValue, oldValue) => {
    console.log("getCameraAllowedState.value 변경됨:", newValue, oldValue);
    if (newValue == true) {
        commonStore.setIsVideoTrue();
    }
    // 카메라 허용 상태 변경 시 필요한 로직을 여기에 추가합니다.
});

watch(getHangupCallingConfirmFlag, (newValue, oldValue) => {
    if (newValue) {
        let receiveRejectFlag = "";
        for (let i = 0; i < commonStore.userListStatus.length; i++) {
            // flag를 설정한다.
            if (commonStore.userListStatus[i].status == "sending") {
                // CallingCancel 존재하므로 전화 거절 처리
                callStore.setCancelCallFlag(true);
            }

            // vuex에 userListStatus 배열의 요소 중 status가 receive가 있는지 체크한다.
            if (commonStore.userListStatus[i].status == "receive") {
                // 멀티통화 거절
                callStore.setMultiCallingResult(0);
                receiveRejectFlag = true;
            }

            // 파일 송수신 수락 대기 중인 것이 있는지 체크한다.
            if (commonStore.userListStatus[i].status == 2) {
                // 파일 송수신 거절 처리
                commonStore.setFileSendStatus(4);
                commonStore.setFileSendFlag(true);
            }
        }

        if (callStore.cancelCallFlag == true || receiveRejectFlag == true) {
            // 바로 이동 시 처리해야할 것들을 처리 하지 못함 :: 수신 팝업 등
            setTimeout(function () {
                commonStore.janus.destroy();
            }, 500);
        } else {
            commonStore.janus.destroy();
        }
        commonStore.setNoneOverlayAlertStatus(2);
        meetingStore.setMeetingLeaveFlag(true);
    }
});

onUnmounted(() => {
    signallingSocket.off("login");
    signallingSocket.off("connect");
    signallingSocket.off("environment");
    signallingSocket.off("callReadyStatus");
    signallingSocket.off("userListAll");
    signallingSocket.off("lastCallTime");
    signallingSocket.off("userStatus");
    signallingSocket.off("canMakeCall");
    signallingSocket.off("groupRoom");
    signallingSocket.off("createRoomID");
    signallingSocket.off("calling");
    signallingSocket.off("loginUserInfo");
    signallingSocket.off("cancelCalling");
    signallingSocket.off("multiRefuseCalling");
    signallingSocket.off("refuseCalling");
    signallingSocket.off("inviteCancelCalling");
    signallingSocket.off("directMessageReadProcess");
    signallingSocket.off("directMessage");
    signallingSocket.off("getPreviousMessage");
    signallingSocket.off("forceLogoutRequest");
    signallingSocket.off("getOverhaul");
});
</script>

<style lang="scss">
.calling {
    width: inherit;
    flex: 1;
}
</style>
