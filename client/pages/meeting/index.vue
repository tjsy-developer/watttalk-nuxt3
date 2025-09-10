<template>
    <div id="meetingRoom" :class="{ yHidden: true }">
        <div class="roomMain y">
            <div class="viewChoice">
                <div class="font20" v-if="calendar == false">
                    {{ t("meetingRoom") }}
                </div>
                <div class="font20" v-if="calendar == true"></div>
                <div class="topCheckBoxLabel" v-if="calendar == false">
                    <input
                        type="checkbox"
                        id="all"
                        v-model="allView"
                        class="topCheckBox"
                    />
                    <label for="all"></label>
                    <span>{{ t("viewAll") }}</span>
                    <button @click="makingBtnClick" class="makeMeetingBtn">
                        {{ t("createMeeting") }}
                    </button>
                </div>
                <div
                    class="items-center row justify-end topCheckBoxLabel"
                    v-if="calendar == true"
                >
                    <input
                        type="checkbox"
                        id="all"
                        v-model="allView"
                        class="topCheckBox"
                    />
                    <label for="all"></label>
                    <span>{{ t("viewAll") }}</span>
                    <button @click="makingBtnClick" class="makeMeetingBtn">
                        {{ t("createMeeting") }}
                    </button>
                </div>
            </div>
            <div v-if="calendar == false" class="room-container">
                <template v-if="windowWidth > 1500">
                    <div
                        v-for="(window, windowKey) in meetingList.length + 1"
                        :key="windowKey"
                    >
                        <MeetingRoom
                            :compData="meetingList[windowKey]"
                            :index="windowKey"
                            :allView="true"
                        ></MeetingRoom>
                    </div>
                </template>
                <template v-else-if="windowWidth > 1023 && windowWidth < 1500">
                    <div
                        v-for="(window, windowKey) in meetingList.length + 1"
                        :key="windowKey"
                    >
                        <MeetingRoom
                            :compData="meetingList[windowKey]"
                            :index="windowKey"
                            :allView="true"
                        ></MeetingRoom>
                    </div>
                </template>
                <template v-else>
                    <div
                        v-for="(window, windowKey) in meetingList.length + 1"
                        :key="windowKey"
                    >
                        <MeetingRoom
                            :compData="meetingList[windowKey]"
                            :index="windowKey"
                            :allView="true"
                        ></MeetingRoom>
                    </div>
                </template>
            </div>
        </div>
    </div>
</template>

<script setup>
const { signallingSocket, transferSocket } = useSignallingSocket();
import MeetingModal from "@/components/modal/meeting/MeetingModal.vue";
import MeetingRoom from "@/components/pages/meeting/MeetingRoom.vue";
import { useDirectCallStore } from "@/stores/directCall";
import { useLoginStore } from "@/stores/login";
import { useMeetingStore } from "@/stores/meeting";
import { callingBell, getDirectMessageTimeZone } from "@/utils/common";
import { userListGetNickname } from "@/utils/userList";
import { useNuxtApp, useRoute, useRouter } from "nuxt/app";
import { storeToRefs } from "pinia";
import { ref, onMounted, onUpdated, onBeforeUnmount, computed } from "vue";
const { t } = useI18n();
const router = useRouter();

import { useModal } from "vue-final-modal";
import { useUserPreferenceStore } from "@/stores/common";
import { useSignallingSocket } from "@/composables/socket/useSignallingSocket";
const count = ref(0);

const meetingStore = useMeetingStore();
const commonStore = useCommonStore();
const modalStore = useModalStore();
const callStore = useCallStore();
const directMessageStore = useDirectMessageStore();
const directCallStore = useDirectCallStore();
const loginStore = useLoginStore();
const preferenceStore = useUserPreferenceStore();

// 전체보기 or 내 것만 보기
const allView = ref(0);

// 캘린더보기 or 일반 회의 목록 보기
const calendar = ref(false);

const checkDirectCall = ref(undefined);

// 전화 수신 팝업
let callingPopupResultData = reactive({
    roomid: "",
    m_local_deviceid: "",
    deviceid: "",
    institution: "",
    nickname: "",
    meetingSeq: null, // Initialized as null
    uniqueRoomid: "",
});

const windowWidth = ref(null);
const windowHeight = ref(null);

const funcAutoCallAceept = ref(null);
const checkOptions = ref("");

// 마운트될 때 실행할 작업
onMounted(async () => {
    // Use `signallingSocket` directly. No `this.` prefix needed.
    sessionStorage.setItem("m_callWaiting", false);
    sessionStorage.setItem("inRoomFlag", false);
    sessionStorage.removeItem("m_inviting");
    sessionStorage.removeItem("hostRequestFlag");
    sessionStorage.removeItem("m_remote_nickname");
    sessionStorage.removeItem("m_remote_devicetype");
    sessionStorage.removeItem("m_remote_status");
    sessionStorage.removeItem("m_remote_deviceid");
    commonStore.makeUserListStatus();
    getMeetingList(allView.value)
    // Socket meetingList 받기
    signallingSocket.on("meetingList", (response) => {
        console.log("*** socket.on: meetingList res ");
        const json = JSON.parse(response);
        console.log("*** socket.on: json = ", json);

        // 미팅 룸 비우기
        meetingStore.setMeetingListEmpty();
        for (let i = 0; i < json.meetings.length; i++) {
            // UTC를 GMT로 바꿔주는 구문
            const startTimeSteamp = json.meetings[i].start_time * 1000;
            const endTimeSteamp = json.meetings[i].end_time * 1000;

            const startDate =
                new Date(startTimeSteamp).getFullYear() +
                "." +
                (new Date(startTimeSteamp).getMonth() + 1) +
                "." +
                new Date(startTimeSteamp).getDate();

            const endDate =
                new Date(endTimeSteamp).getFullYear() +
                "." +
                (new Date(endTimeSteamp).getMonth() + 1) +
                "." +
                new Date(endTimeSteamp).getDate();

            // 10보다 작은 수일 경우, 앞에 0을 붙혀서 보내기 위함
            const startH =
                new Date(startTimeSteamp).getHours() >= 10
                    ? new Date(startTimeSteamp).getHours()
                    : "0" + new Date(startTimeSteamp).getHours();
            const startM =
                new Date(startTimeSteamp).getMinutes() >= 10
                    ? new Date(startTimeSteamp).getMinutes()
                    : "0" + new Date(startTimeSteamp).getMinutes();
            const endH =
                new Date(endTimeSteamp).getHours() >= 10
                    ? new Date(endTimeSteamp).getHours()
                    : "0" + new Date(endTimeSteamp).getHours();
            const endM =
                new Date(endTimeSteamp).getMinutes() >= 10
                    ? new Date(endTimeSteamp).getMinutes()
                    : "0" + new Date(endTimeSteamp).getMinutes();

            const startTime = startH + ":" + startM;
            const endTime = endH + ":" + endM;

            let members = "";
            const member_deviceid = [];

            for (let j = 0; j < json.meetings[i].members.length; j++) {
                member_deviceid.push(json.meetings[i].members[j].member);
            }

            const exptext = /^[A-Za-z0-9_\\.\\-]+@[A-Za-z0-9\\-]+\.[A-Za-z0-9\\-]+/;
            for (let j = 0; j < member_deviceid.length; j++) {
                for (let k = 0; k < userList.value.length; k++) {
                    // Use .value for reactive ref
                    if (member_deviceid[j] == loginStore.m_local_deviceid) {
                        if (j == member_deviceid.length - 1) {
                            members += loginStore.nickname;
                            break;
                        } else {
                            members += loginStore.nickname + ", ";
                            break;
                        }
                    } else if (
                        member_deviceid[j] == userList.value[k].deviceid && // Use .value for reactive ref
                        userList.value[k].devicetype != 4 // Use .value for reactive ref
                    ) {
                        if (j == member_deviceid.length - 1) {
                            members += userList.value[k].nickname; // Use .value for reactive ref
                            break;
                        } else {
                            members += userList.value[k].nickname + ", "; // Use .value for reactive ref
                            break;
                        }
                    } else if (exptext.test(member_deviceid[j]) == true) {
                        if (j == member_deviceid.length - 1) {
                            members += member_deviceid[j];
                            break;
                        } else {
                            members += member_deviceid[j] + ", ";
                            break;
                        }
                    }
                }
            }

            const cctvList = [];
            if (json.meetings[i].cctv_list && json.meetings[i].cctv_list.length > 0) {
                for (let iLoop = 0; iLoop < json.meetings[i].cctv_list.length; ++iLoop) {
                    const cctvParams = {
                        name: json.meetings[i].cctv_list[iLoop].name,
                        url: json.meetings[i].cctv_list[iLoop].url,
                    };
                    cctvList.push(cctvParams);
                }
            }

            let directCallYN;
            let everyoneStartYN;
            let entryNotificationYN;
            let optionTxt = "";
            if (json.meetings[i].direct_call_yn) {
                directCallYN = json.meetings[i].direct_call_yn;
            } else {
                directCallYN = 0;
            }
            if (json.meetings[i].everyone_start_yn) {
                everyoneStartYN = json.meetings[i].everyone_start_yn;
            } else {
                everyoneStartYN = 0;
            }
            if (json.meetings[i].entry_notification_yn) {
                entryNotificationYN = json.meetings[i].entry_notification_yn;
            } else {
                entryNotificationYN = 0;
            }

            // Accessing `checkOptions` (a ref) directly
            if (entryNotificationYN == 1 || directCallYN == 1 || everyoneStartYN == 1) {
                checkOptions.value = true;
            } else {
                checkOptions.value = false;
            }

            // Using the `t` function from useI18n
            if (entryNotificationYN == 1) {
                optionTxt = optionTxt + " " + t("회의 초대 알림 발송");
            }
            if (directCallYN == 1) {
                if (entryNotificationYN == 1) {
                    if (sessionStorage.getItem("languageCode") == "ko") {
                        optionTxt =
                            optionTxt +
                            "                     " +
                            t("스마트글라스 다이렉트콜 입장");
                    } else {
                        optionTxt = optionTxt + "   " + t("스마트글라스 다이렉트콜 입장");
                    }
                } else {
                    optionTxt = optionTxt + " " +  t("스마트글라스 다이렉트콜 입장");
                }
            }
            if (everyoneStartYN == 1) {
                if (directCallYN == 1) {
                    if (sessionStorage.getItem("languageCode") == "ko") {
                        optionTxt =
                            optionTxt +
                            "                       " +
                            t("누구나 회의 시작 가능");
                    } else {
                        optionTxt = optionTxt + "         " + t("누구나 회의 시작 가능");
                    }
                } else if (entryNotificationYN == 1) {
                    if (sessionStorage.getItem("languageCode") == "ko") {
                        optionTxt =
                            optionTxt +
                            "                     " +
                            t("누구나 회의 시작 가능");
                    } else {
                        optionTxt = optionTxt + "   " + t("누구나 회의 시작 가능");
                    }
                } else {
                    optionTxt = optionTxt + " " + t("누구나 회의 시작 가능");
                }
            }

            const save = {
                customData: {
                    meeting_seq: json.meetings[i].meeting_seq,
                    title: json.meetings[i].subject,
                    status: json.meetings[i].start_status,
                    time: startTime + "," + endTime,
                    member: members,
                    member_deviceid: member_deviceid,
                    master: json.meetings[i].maker,
                    type: json.meetings[i].type,
                    direct_call_yn: directCallYN,
                    everyone_start_yn: everyoneStartYN,
                    entry_notification_yn: entryNotificationYN,
                    checkOptionTxt: optionTxt,
                    cctv_list: cctvList,
                },
                startDate,
                endDate,
            };
            meetingStore.setMeetingListAdd(save);
        }
    });

    // 소켓 meetingCalendarList 받기
    signallingSocket.on("meetingCalendarList", (response) => {
        console.log("*** socket.on:  meetingCalendarList res ");
        const json = JSON.parse(response);
        console.log("*** socket.on: json = ", json);

        meetingStore.setMeetingListEmpty();

        for (let i = 0; i < json.meetings.length; i++) {
            const startTimeSteamp = json.meetings[i].start_time * 1000;

            const dates =
                new Date(startTimeSteamp).getFullYear() +
                "." +
                (new Date(startTimeSteamp).getMonth() + 1) +
                "." +
                new Date(startTimeSteamp).getDate();

            const save = {
                customData: {
                    meeting_seq: "",
                    title: json.meetings[i].subject,
                    status: json.meetings[i].start_status,
                    time: "",
                    member: "",
                    member_deviceid: [],
                    master: "",
                },
                dates,
            };
            meetingStore.setMeetingListAdd(save);
        }

        meetingStore.setMeetingListMonthFlag(false);
    });

    // 소켓 createMeeting 받기
    signallingSocket.on("createMeeting", (response) => {
        console.log("*** socket.on: createMeeting res ");
        const json = JSON.parse(response);
        console.log("*** socket.on: json = ", json);

        if (json.satus) {
            // Typo `satus` from original code
            console.log("*** socket.on: 회의 생성 성공");
            // Assuming $modal is globally available or imported, replace with your modal library's method
            // For example, if you're using a specific modal library, it would be something like:
            // myModalService.hide("modal")
            // Placeholder for modal hiding:
            // If you have a ref to the modal, you could use: modalRef.value.hide()
            // Or if using a global provide/inject pattern for modals
            // hideModal('modal') // Assuming a function `hideModal` is available
            close();
            meetingStore.setMeetingListEmpty();

            if (calendar.value) {
                // Use .value for reactive ref
                if (allView.value) {
                    // Use .value for reactive ref
                    meetingCalendarList(1);
                } else {
                    meetingCalendarList(0);
                }
            } else {
                if (allView.value) {
                    // Use .value for reactive ref
                    getMeetingList(1);
                } else {
                    getMeetingList(0);
                }
            }
        } else {
            console.log("*** socket.on: 회의 생성 실패");
        }
    });

    // 소켓 modifyMeeting 받기
    signallingSocket.on("modifyMeeting", (response) => {
        console.log("*** socket.on: modifyMeeting res ");
        const json = JSON.parse(response);
        console.log("*** socket.on: json = ", json);

        if (json.satus) {
            // Typo `satus` from original code
            console.log("*** socket.on: 회의 수정 성공");
            // hideModal('modal') // Placeholder for modal hiding

            meetingStore.setMeetingListEmpty();

            if (calendar.value) {
                // Use .value for reactive ref
                if (allView.value) {
                    // Use .value for reactive ref
                    meetingCalendarList(1);
                } else {
                    meetingCalendarList(0);
                }
            } else {
                if (allView.value) {
                    // Use .value for reactive ref
                    getMeetingList(1);
                } else {
                    getMeetingList(0);
                }
            }
        } else {
            console.log("*** socket.on: 회의 수정 실패");
        }
    });

    // 소켓 deleteMeeting 받기
    signallingSocket.on("deleteMeeting", (response) => {
        console.log("*** socket.on: deleteMeeting res = ", response);
        const json = JSON.parse(response);
        console.log("*** socket.on: json = ", json);

        if (json.satus) {
            // Typo `satus` from original code
            console.log("*** socket.on: 회의 삭제 성공");

            // if (allView.value) {
            //     // Use .value for reactive ref
            //     getMeetingList(1);
            // } else {
            //     getMeetingList(0);
            // }
            getMeetingList(allView.value)
        } else {
            console.log("*** socket.on: 회의 삭제 실패");
        }
    });

    // 소켓 createRoomID 받기
    signallingSocket.on("createRoomID", (response) => {
        console.log("*** socket.on: createRoomID res = ", response);
        const json = JSON.parse(response);
        console.log("*** socket.on: json = ", json);

        console.log(
            "*** socket.on: openAndJoin = ",
            meetingStore.openAndJoin, // Use .value for reactive ref
        );

        callStore.setUniqueRoomid(json.unique_roomid);
        console.log("unique_roomid : " + json.unique_roomid);
        console.log("vuex unique_roomid : " + callStore.uniqueRoomid); // Direct access for store state inside function

        if (meetingStore.openAndJoin == "open") {
            // Use .value for reactive ref
            console.log("*** socket.on: openAndJoin = open");
            openMeeting(json);
            meetingStore.setOpenAndJoin("");
            const meetingData = meetingStore.openMeetingData;
            if (meetingData && meetingData.entryNotification == 1) {
                // Check if meetingData exists
                console.log("*** socket.emit: sendEntryNotification >");
                signallingSocket.emit("sendEntryNotification");
                meetingStore.setOpenMeetingData(null); // Assuming '' meant null or empty object
            } else {
                meetingStore.setOpenMeetingData(null); // Assuming '' meant null or empty object
            }
        } else if (meetingStore.openAndJoin == "join") {
            // Use .value for reactive ref
            console.log("*** socket.on: openAndJoin = join");
            joinMeeting(json);
            meetingStore.setOpenAndJoin("");
        }
    });

    // 소켓 openMeeting 받기
    signallingSocket.on("openMeeting", (response) => {
        console.log("*** socket.on: openMeeting res = ", response);
        const json = JSON.parse(response);
        console.log("*** socket.on: json = ", json);

        sessionStorage.setItem("m_roomid", json.roomid);
        sessionStorage.setItem("inRoomFlag", "true");
        sessionStorage.setItem("createRoomFlag", "true");
        commonStore.makeUserListStatus(); // Call action from commonStore

        commonStore.setChangeViewType(2);
        router.push("/call");

        // meetingStore.setMeetingSeq(null) // Uncomment if needed
        meetingStore.setMeetingOpenFlag(false); // Assuming this is an action in meetingStore

        callStore.setCallingType("meetingCall");
    });

    signallingSocket.on("openMeetingChecking", (response) => {
        // Accessing `openMeetingCheck` (a ref) directly
        if (meetingStore.openMeetingCheck == false) {
            // Direct access to state in store instance
            console.log("*** socket.on: openMeetingChecking res = ", response);
            const json = JSON.parse(response);
            console.log("*** socket.on: json = ", json);

            if (json.start_status == 1) {
                console.log("*** socket.on: 회의실이 open 되어있다. 참여하자");
                console.log("*** socket.on: 입장할 room id 는 ", json.roomid, " 입니다.");

                callStore.setUniqueRoomid(json.unique_roomid);
                joinMeeting(json.roomid);
            } else if (
                json.start_status == 0 ||
                json.start_status == 2 ||
                json.start_status == 3
            ) {
                if (json.start_status == 0) {
                    console.log("회의실이 개설전이다.");
                    commonStore.setNoneOverlayAlertStatus(6); // Call action from commonStore
                } else if (json.start_status == 2) {
                    console.log("회의실이 종료되어있다.");
                    commonStore.setNoneOverlayAlertStatus(7); // Call action from commonStore
                } else if (json.start_status == 3) {
                    console.log("회의실이 삭제되어있다.");
                    commonStore.setNoneOverlayAlertStatus(8); // Call action from commonStore
                }

                if (calendar.value) {
                    // Use .value for reactive ref
                    meetingCalendarList(allView.value);
                } else {
                    getMeetingList(allView.value);
                }
            } else {
                console.log("*** socket.on: 알 수 없는 에러 발생.");
            }
            meetingStore.setOpenMeetingCheck(""); // Assuming '' meant resetting to initial state
        }
    });

    // 소켓 joinMeeting 받기
    signallingSocket.on("joinMeeting", (response) => {
        console.log("*** socket.on: joinMeeting res = ", response);
        const json = JSON.parse(response);
        console.log("*** socket.on: json = ", json);

        sessionStorage.setItem("m_roomid", json.roomid);
        sessionStorage.setItem("createRoomFlag", "false");
        sessionStorage.setItem("inRoomFlag", "true");

        if (json.roomNumberCount) {
            if (json.roomNumberCount >= commonStore.roomNumberCount) {
                // Direct access to state in store instance
                commonStore.setRoomNumberCount(json.roomNumberCount); // Call action from commonStore
            }
        }

        commonStore.makeUserListStatus(); // Call action from commonStore

        callStore.setCallingType("meetingCall");

        commonStore.setChangeViewType(2);
        router.push("/call");
    });

    // 소켓 changedMeeting 받기
    signallingSocket.on("changedMeeting", (response) => {
        console.log("****** socket *** socket.on: changedMeeting res = ", response);
        const json = JSON.parse(response);
        console.log("*** socket.on: json = ", json);

        if (json.status) {
            console.log(
                "*** socket.on: 정보가 바뀐 회의가 존재한다. 회의 목록을 다시 불러온다.",
            );

            if (calendar.value) {
                meetingCalendarList(allView.value);
            } else {
                getMeetingList(allView.value);
            }
        } else {
            console.log(
                "*** socket.on: 언제 이 로그가 찍히지? 찍힐 일이 없을 것 같은데?",
            );
        }
    });

    // openMeetingChecking 함수를 타게 됨으로 해당 함수는 타지 않을 것으로 예상
    signallingSocket.on("sendMeetingRoomID", (response) => {
        console.log("*** socket.on: sendMeetingRoomID res = ", response);
        const json = JSON.parse(response);
        console.log("*** socket.on: json = ", json);

        joinMeeting(json.roomid);
        meetingStore.setOpenAndJoin("");
    });

    // 언어 별 헤더 정보 변경 :: ksh 추가
    signallingSocket.on("loginUserInfo", function (response) {
        if (response) {
            const json = JSON.parse(response);
            console.log("*** socket.on: loginUserInfo response success");
            console.log("*** socket.on: json = ", json);

            loginStore.setLoginInfo({
                institution: json.institution,
                headquarters: json.headquarters,
                branch: json.branch,
                nickname: json.nickname,
            });

            sessionStorage.setItem("m_institution", json.institution);
            sessionStorage.setItem("m_headquarters", json.headquarters);
            sessionStorage.setItem("m_branch", json.branch);
            sessionStorage.setItem("m_nickname", json.nickname);
        }
    });

    // 2021-05-06 ksh :: 회의실에서도 통화 수락 거절 받을 수 있도록 기능 추가
    signallingSocket.on("calling", (response) => {
        const json = JSON.parse(response);
        console.log("*** socket.on: calling response, json: " + response);
        if (sessionStorage.getItem("m_callWaiting") === "true") {
            const obj = {
                localdeviceid: sessionStorage.getItem("m_local_deviceid"),
                remotedeviceid: json.deviceid,
                roomid: json.roomid,
                institution: json.institution,
                nickname: json.nickname,
            };
            const json2 = JSON.stringify(obj);
            signallingSocket.emit("refuseCalling", json2);
            console.log("*** socket.on: m_callWaiting > refuseCalling request: ", json2);
            return;
        }

        sessionStorage.setItem("m_callWaiting", "true");

        callingBell("play"); // Call the imported function

        if (json.callstatus == 0) {
            console.log("*** socket.on: calling >> If you are calling at the same time");

            contentsBtnClick(1); // Call the imported function
        } else {
            console.log(
                "*** socket.on: calling >> When not making calls at the same time",
            );

            const remoteInstitution = userListGetInstitution(json.deviceid); // Call the imported function
            const remoteHeadquarters = userListGetHeadquarters(json.deviceid); // Call the imported function
            const remoteBranch = userListGetBranch(json.deviceid); // Call the imported function
            const remoteNickname = userListGetNickname(json.deviceid); // Call the imported function

            callStore.callingPopupInfo({
                institution: remoteInstitution,
                headquarters: remoteHeadquarters,
                branch: remoteBranch,
                nickname: remoteNickname,
            });

            contentsBtnClick(0); // Call the imported function

            console.log("*** socket.on: json.roomNumbercount : " + json.roomNumbercount);
            if (json.roomNumberCount != null) {
                commonStore.setRoomNumberCount(json.roomNumberCount); // Call action from commonStore
                commonStore.makeUserListStatus(); // Call action from commonStore
            } else {
                commonStore.makeUserListStatus(); // Call action from commonStore
            }

            // Update reactive object directly
            callingPopupResultData.roomid = json.roomid;
            callingPopupResultData.m_local_deviceid =
                sessionStorage.getItem("m_local_deviceid");
            callingPopupResultData.deviceid = json.deviceid;
            callingPopupResultData.institution = json.institution;
            callingPopupResultData.nickname = json.nickname;
            callingPopupResultData.meetingSeq = json.meeting_seq;
            callingPopupResultData.uniqueRoomid = json.unique_roomid;

            if (getAutoCallAcceptTime.value > 0) {
                // Use .value for reactive ref
                console.log(
                    "*** socket: calling >> getAutoCallAcceptTime = " +
                        getAutoCallAcceptTime.value, // Use .value for reactive ref
                );
                // Assign to ref's .value
                funcAutoCallAceept.value = setTimeout(() => {
                    if (
                        sessionStorage.getItem("inRoomFlag") !== "true" &&
                        commonStore.contentsViewType == 1 && // Direct access to store state
                        sessionStorage.getItem("m_callWaiting") == "true"
                    ) {
                        console.log("*** socket: calling >> Start AutoCallAccept");
                        callStore.setCallingResult(1); // Assuming setCallingResult exists in callStore
                        // hideModal('modal') // Placeholder for modal hiding
                    }
                }, getAutoCallAcceptTime.value * 1000); // Use .value for reactive ref
            }
        }
    });
    signallingSocket.on("cancelCalling", (response) => {
        console.log("*** socket.on: cancelCalling response, json: " + response);

        callingBell("stop");
        modalStore.closeModal("call");
        sessionStorage.setItem("m_callWaiting", "false");

        if (getAutoCallAcceptTime.value > 0) {
            if (funcAutoCallAceept.value !== null) {
                console.log("*** socket: cancelCalling >> AutoCallAccept Cancel");
                clearTimeout(funcAutoCallAceept.value);
                funcAutoCallAceept.value = null;
            }
        }
    });

    signallingSocket.on("inviteCancelCalling", (response) => {
        try {
            const json = JSON.parse(response);
            console.log("*** socket: inviteCancelcalling response");
            console.log(json);

            // Assuming m_remote_deviceid is a reactive property if it affects the template
            // proxy.m_remote_deviceid = json.deviceid; // If m_remote_deviceid is a property on the component instance

            if (json.multiuser !== undefined && json.multiuser === 1) {
                console.log(
                    "*** socket: inviteCancelcalling >> 1:N 시 방을 나간 해당 대상만 Disconnection 처리",
                );
                modalStore.closeModal("call");
                console.log("callingPopupHide");
                sessionStorage.setItem("m_callWaiting", "false");
            } else {
                console.log(
                    "*** socket: inviteCancelcalling >> 1:1 시 방을 완전히 나가는 걸로 처리",
                );
                modalStore.closeModal("call");
                sessionStorage.setItem("m_callWaiting", "false");
            }

            callingBell("stop");
        } catch (e) {
            console.error(`${e}`);
        }
    });

    // 이전 메세지 보기 이벤트 받기
    signallingSocket.on("getPreviousMessage", (response) => {
        console.log("*** socket.on: getPreviousMessage");
        const json = JSON.parse(response);

        if (json.message.length === 0) {
            directMessageStore.previousMessageNone(false);
        }

        if (json.message.length > 0) {
            for (let i = 0; i < json.message.length; i++) {
                const messageItem = json.message[i];
                const localDeviceId = sessionStorage.getItem("m_local_deviceid");
                const localNickname = sessionStorage.getItem("m_nickname");

                if (messageItem.sender === localDeviceId) {
                    // 발신
                    const receiverNickname = userListGetNickname(messageItem.receiver);
                    directMessageStore.previousSendDM({
                        message: messageItem.message,
                        sender: localDeviceId,
                        receiver: messageItem.receiver,
                        senderNickname: localNickname,
                        receiverNickname: receiverNickname,
                        datetime: messageItem.datetime,
                        chattingDateTime: getDirectMessageTimeZone(messageItem.datetime),
                        readCheck: JSON.parse(messageItem.readCheck),
                    });
                } else {
                    // 수신
                    const senderNickname = userListGetNickname(messageItem.sender);
                    directMessageStore.previousReceiveDM({
                        message: messageItem.message,
                        sender: messageItem.sender,
                        receiver: messageItem.receiver,
                        senderNickname: senderNickname,
                        receiverNickname: localNickname,
                        datetime: messageItem.datetime,
                        chattingDateTime: getDirectMessageTimeZone(messageItem.datetime),
                        readCheck: JSON.parse(messageItem.readCheck),
                    });
                }

                if (json.message.length - 1 === i && json.message.length < 10) {
                    directMessageStore.previousMessageNone(false);
                } else {
                    directMessageStore.previousMessageNone(true);
                }
            }
        }
    });

    signallingSocket.on("sendEntryNotification", (response) => {
        if (preferenceStore.useDirectCall) {
            console.log("socket.on sendEntryNotification::", response);
            const json = JSON.parse(response);
            console.log(json);
            console.log(json.member_name);
            directCallStore.setDirectCallInfo(json);

            if (directCallStore.directcallList.length === 1) {
                contentsBtnClick(8);
            }
        }
    });

    meetingStore.sortArray();

    allView.value = Number(localStorage.getItem("meetingViewType")) || 0
});

// 언마운트되기 전 실행할 작업
onBeforeUnmount(() => {
    if (getAutoCallAcceptTime.value > 0) {
        // Access ref's value
        if (funcAutoCallAceept.value !== null) {
            // Access ref's value
            console.log("*** onUnmounted: AutoCallAccept Cancel");
            clearTimeout(funcAutoCallAceept.value); // Access ref's value
            funcAutoCallAceept.value = null; // Set ref's value
        }
    }

    // Remove window event listener
    window.removeEventListener("resize", onResize);
    console.log("*** onUnmounted: Window resize listener removed.");

    // Remove all specific socket event listeners
    console.log("*** onUnmounted: Socket Event Remove Started !!");
    signallingSocket.off("meetingList");
    signallingSocket.off("meetingCalendarList");
    signallingSocket.off("createMeeting");
    signallingSocket.off("modifyMeeting");
    signallingSocket.off("deleteMeeting");
    signallingSocket.off("openMeetingOnOff");
    signallingSocket.off("openMeeting");
    signallingSocket.off("joinMeeting");
    signallingSocket.off("leaveMeeting");
    signallingSocket.off("changedMeeting");
    signallingSocket.off("sendMeetingRoomID");
    signallingSocket.off("userListAll");
    signallingSocket.off("calling");
    signallingSocket.off("cancelCalling");
    signallingSocket.off("directMessageReadProcess");
    signallingSocket.off("directMessage");
    signallingSocket.off("getPreviousMessage");
    signallingSocket.off("environment");
    signallingSocket.off("forceLogoutRequest");
    signallingSocket.off("sendEntryNotification");
    console.log("*** onUnmounted: All socket event listeners removed.");
});

const getWorldTime = () => {
    const now = new Date();
    const standard = now.getTime() / 1000;
    const returnDate = String(Math.round(standard)); // No need for new String()
    console.log(returnDate);
    return returnDate;
};

// 언어 변경 시 헤더 정보 변경 :: ksh 추가
const loginUserInfoRequest = () => {
    const obj = {
        deviceid: loginStore.m_local_deviceid,
        language: m_lang.value,
    };
    const json = JSON.stringify(obj);
    signallingSocket.emit("loginUserInfo", json);
    console.log("*** socket.emit: loginUserInfo request:" + json);
};

const setupMeetingModal = () => {
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
    return { open, close };
}
const { open, close } = setupMeetingModal();

const makingBtnClick = async () => {
    console.log("*** methods: makingBtnClick");
    open();
};

// 시그널링 회의실 목록 요청 (meetingList 명을 이미 사용 중이므로 getMeeingList 로 지정)
// type = 0: 내 회의실 목록, 1: 전체 회의실 목록
const getMeetingList = (type) => {
    console.log("*** methods: getMeetingList::");

    const date = new Date();
    date.setHours(0, 0, 0, 0);

    const timestampUTC = String(Math.round(date.getTime() / 1000));
    console.log("안녕하세요 timestampUTC = ", timestampUTC);

    const obj = {
        deviceid: loginStore.m_local_deviceid,
        current_date: timestampUTC,
        view_type: type, // 0: 내 회의실 목록, 1: 전체 회의실 목록
        en_seq: loginStore.sessionEnSeq,
    };
    const json = JSON.stringify(obj);
    signallingSocket.emit("meetingList", json);
    console.log("*** socket.emit: meetingList Request: " + json);
};

// 월력 요청
// type = 0: 내 월력, 1: 전체 월력
const meetingCalendarList = (type) => {
    console.log("*** methods: meetingCalendarList::");

    const currentMonth = meetingStore.meetingListMonthInfo;

    const startTimeArr = currentMonth[0].id.split("-");
    const endTimeArr = currentMonth[currentMonth.length - 1].id.split("-");

    const startTime = new Date(
        startTimeArr[0],
        startTimeArr[1] - 1,
        startTimeArr[2],
        0,
        0,
        0,
    );
    const endTime = new Date(endTimeArr[0], endTimeArr[1] - 1, endTimeArr[2], 23, 59, 59);

    const startTimestempUtc = String(Math.round(startTime.getTime() / 1000));
    const endTimestempUtc = String(Math.round(endTime.getTime() / 1000));

    const obj = {
        deviceid: loginStore.m_local_deviceid,
        start_time: startTimestempUtc,
        end_time: endTimestempUtc,
        view_type: type, // 0: 내 회의실 목록, 1: 전체 회의실 목록
        en_seq: loginStore.sessionEnSeq,
    };

    const json = JSON.stringify(obj);
    signallingSocket.emit("meetingCalendarList", json);
    console.log("*** socket.emit: meetingCalendarList Request: " + json);
};

// 시그널링 회의실 생성 요청
const createMeeting = () => {
    console.log("*** methods: createMeeting::");

    const meetingInfo = meetingStore.meetingSaveInfo;

    console.log("*** methods: createMeeting:: meetingInfo = ", meetingInfo);
    const meetingStartDate = meetingInfo.startDate.split("-").map(Number);
    const startTime = meetingInfo.startTime.split(":").map(Number);
    const meetingEndDate = meetingInfo.endDate.split("-").map(Number);
    const endTime = meetingInfo.endTime.split(":").map(Number);

    const startDate = new Date(
        meetingStartDate[0],
        meetingStartDate[1] - 1,
        meetingStartDate[2],
        startTime[0],
        startTime[1],
        0,
    );
    const endDate = new Date(
        meetingEndDate[0],
        meetingEndDate[1] - 1,
        meetingEndDate[2],
        endTime[0],
        endTime[1],
        0,
    );

    const startDateTimeStempUTC = String(Math.round(startDate.getTime() / 1000));
    const endDateTimeStempUTC = String(Math.round(endDate.getTime() / 1000));

    console.log("시작 날짜 객체:", startDate);
    console.log("종료 날짜 객체:", endDate);
    console.log("시작 타임스탬프(초):", startDateTimeStempUTC);
    console.log("종료 타임스탬프(초):", endDateTimeStempUTC);
    const members = [];
    for (let i = 0; i < meetingInfo.memberIDs.length; i++) {
        members.push({ member: meetingInfo.memberIDs[i] });
    }
    for (let i = 0; i < meetingInfo.guestEmails.length; i++) {
        members.push({ member: meetingInfo.guestEmails[i] });
    }

    const meetingMaker = meetingInfo.maker;
    for (let i = 0; i < members.length; i++) {
        if (meetingMaker == members[i].member) {
            members.splice(i, 1);
        }
    }

    let obj;
    if (process.env.renewal == "true") {
        obj = {
            subject: meetingInfo.title,
            start_time: startDateTimeStempUTC,
            end_time: endDateTimeStempUTC,
            type: meetingInfo.type,
            maker: meetingInfo.maker,
            members,
            en_seq: loginStore.sessionEnSeq,
            domain: "https://hdcardev.watttalk.kr/watttalk",
            PMDomain: "https://hdcardev.watttalk.kr",
            entry_notification_yn: meetingInfo.entry_notification_yn,
            direct_call_yn: meetingInfo.direct_call_yn,
            everyone_start_yn: meetingInfo.everyone_start_yn,
            cctv_list: meetingInfo.cctv_list,
        };
    } else {
        obj = {
            subject: meetingInfo.title,
            start_time: startDateTimeStempUTC,
            end_time: endDateTimeStempUTC,
            type: meetingInfo.type,
            maker: meetingInfo.maker,
            members,
            en_seq: loginStore.sessionEnSeq,
            domain: "https://hdcardev.watttalk.kr/watttalk",
            PMDomain: "https://hdcardev.watttalk.kr",
            entry_notification_yn: meetingInfo.entry_notification_yn,
            direct_call_yn: meetingInfo.direct_call_yn,
            everyone_start_yn: meetingInfo.everyone_start_yn,
            cctv_list: meetingInfo.cctv_list,
        };
    }
    const json = JSON.stringify(obj);
    signallingSocket.emit("createMeeting", json);
    console.log("*** socket.emit: createMeeting Request: " + json);
};

// 회의실 수정
const modifyMeeting = () => {
    console.log("*** methods: modifyMeeting::");
    const meetingSeq = meetingStore.meetingSeq;
    const meetingInfo = meetingStore.meetingModifyInfo;

    const meetingStartDate = meetingInfo.startDate.split("-").map(Number);
    const startTime = meetingInfo.startTime.split(":").map(Number);
    const meetingEndDate = meetingInfo.endDate.split("-").map(Number);
    const endTime = meetingInfo.endTime.split(":").map(Number);

    const startDate = new Date(
        meetingStartDate[0],
        meetingStartDate[1] - 1,
        meetingStartDate[2],
        startTime[0],
        startTime[1],
        0,
    );
    const endDate = new Date(
        meetingEndDate[0],
        meetingEndDate[1] - 1,
        meetingEndDate[2],
        endTime[0],
        endTime[1],
        0,
    );

    const startDateTimeStempUTC = String(Math.round(startDate.getTime() / 1000));
    const endDateTimeStempUTC = String(Math.round(endDate.getTime() / 1000));

    const members = [];
    for (let i = 0; i < meetingInfo.memberIDs.length; i++) {
        members.push({ member: meetingInfo.memberIDs[i] });
    }
    for (let i = 0; i < meetingInfo.guestEmails.length; i++) {
        members.push({ member: meetingInfo.guestEmails[i] });
    }

    const meetingMaker = meetingInfo.maker;
    for (let i = 0; i < members.length; i++) {
        if (meetingMaker == members[i].member) {
            members.splice(i, 1);
        }
    }
    let obj;
    if (process.env.renewal == "true") {
        obj = {
            meeting_seq: meetingSeq,
            subject: meetingInfo.title,
            start_time: startDateTimeStempUTC,
            end_time: endDateTimeStempUTC,
            type: meetingInfo.type,
            maker: meetingInfo.maker,
            members,
            domain: "https://hdcardev.watttalk.kr/watttalk",
            PMDomain: "https://hdcardev.watttalk.kr",
            entry_notification_yn: meetingInfo.entry_notification_yn,
            direct_call_yn: meetingInfo.direct_call_yn,
            everyone_start_yn: meetingInfo.everyone_start_yn,
            cctv_list: meetingInfo.cctv_list,
        };
    } else {
        obj = {
            meeting_seq: meetingSeq,
            subject: meetingInfo.title,
            start_time: startDateTimeStempUTC,
            end_time: endDateTimeStempUTC,
            type: meetingInfo.type,
            maker: meetingInfo.maker,
            members,
            domain: "https://hdcardev.watttalk.kr/watttalk",
            PMDomain: "https://hdcardev.watttalk.kr",
            entry_notification_yn: meetingInfo.entry_notification_yn,
            direct_call_yn: meetingInfo.direct_call_yn,
            everyone_start_yn: meetingInfo.everyone_start_yn,
            cctv_list: meetingInfo.cctv_list,
        };
    }

    const json = JSON.stringify(obj);

    signallingSocket.emit("modifyMeeting", json);
    console.log("*** socket.emit: modifyMeeting Request: " + json);
};

// 회의실 삭제
const deleteMeeting = () => {
    console.log("*** methods: deleteMeeting::");

    const meetingSeq = meetingStore.meetingSeq;
    let obj;
    if (process.env.renewal == "true") {
        obj = {
            meeting_seq: meetingSeq,
            domain: "https://hdcardev.watttalk.kr/watttalk",
            PMDomain: "https://hdcardev.watttalk.kr",
        };
    } else {
        obj = {
            meeting_seq: meetingSeq,
            domain: "https://hdcardev.watttalk.kr/watttalk",
            PMDomain: "https://hdcardev.watttalk.kr",
        };
    }
    const json = JSON.stringify(obj);

    signallingSocket.emit("deleteMeeting", json);
    console.log("*** socket.emit: deleteMeeting Request: " + json);
};

// 회의실 개설 확인 요청
const openMeetingOnOff = () => {
    console.log("*** methods: openMeetingOnOff::");

    const obj = {
        meeting_reservation_uid: "",
    };

    const json = JSON.stringify(obj);

    signallingSocket.emit("openMeetingOnOff", json);
    console.log("*** socket.emit: openMeetingOnOff Request: " + json);
};

// Room ID 요청
const createRoomID = () => {
    console.log("*** methods: createRoomID::");

    const obj = {
        deviceid: loginStore.m_local_deviceid,
        sendDurationEnable: getSendDurationEnable.value,
    };
    console.log("getSendDurationEnable:", getSendDurationEnable.value);
    const json = JSON.stringify(obj);

    signallingSocket.emit("createRoomID", json);
    console.log("*** socket.emit: createRoomID Request: " + json);
};

// 회의실 개설
const openMeeting = (res) => {
    console.log("*** methods: openMeeting::");

    const meetingSeq = meetingStore.meetingSeq;

    const obj = {
        meeting_seq: meetingSeq,
        deviceid: loginStore.m_local_deviceid,
        roomid: res.roomid,
        unique_roomid: callStore.uniqueRoomid,
    };
    // `this.meeting_seq = null` -> assuming this was a data property, handle differently or remove if not used elsewhere
    // meeting_seq.value = null; // if meeting_seq is a ref

    const json = JSON.stringify(obj);

    signallingSocket.emit("openMeeting", json);
    console.log("*** socket.emit: openMeeting Request: " + json);
};

// 회의실 참가
const joinMeeting = (res) => {
    console.log("*** methods: joinMeeting::");

    const meetingSeq = meetingStore.meetingSeq;

    const obj = {
        meeting_seq: meetingSeq,
        deviceid: loginStore.m_local_deviceid,
        roomid: res,
        unique_roomid: callStore.uniqueRoomid,
    };

    const json = JSON.stringify(obj);

    signallingSocket.emit("joinMeeting", json);
    console.log("*** socket.emit: joinMeeting Request: " + json);
};

// 회의실 정보 갱신
const changedMeeting = () => {
    console.log("*** methods: changedMeeting::");

    const obj = {
        meeting_seq: "",
        subject: "",
        start_date: "",
        start_time: "",
        end_time: "",
        maker: "",
        start_status: "",
        roomid: "",
        delete_status: "",
        members: "",
        direct_call_yn: "",
        everyone_start_yn: "",
        entry_notification_yn: "",
    };

    const json = JSON.stringify(obj);

    signallingSocket.emit("changedMeeting", json);
    console.log("*** socket.emit: changedMeeting Request: " + json);
};

const changeAlertNum = (seq) => {
    commonStore.setAlert(seq);
};

// 전화 수신 팝업
const contentsBtnClick = (seq) => {
    changeAlertNum(seq);
};

// 전화 수락
const callingAccept = (roomid, remotedeviceid) => {
    const remoteNickname = userListGetNickname(remotedeviceid);
    const remoteDevicetype = userListGetDevicetype(remotedeviceid);
    const remoteStatus = userListGetStatus(remotedeviceid);

    sessionStorage.setItem("m_roomid", roomid);
    sessionStorage.setItem("m_remote_deviceid", remotedeviceid);
    sessionStorage.setItem("m_remote_nickname", remoteNickname);
    sessionStorage.setItem("m_remote_devicetype", remoteDevicetype);
    sessionStorage.setItem("m_remote_status", remoteStatus);

    sessionStorage.setItem("createRoomFlag", "false");
    sessionStorage.setItem("inRoomFlag", "true");

    close("notice"); // Use the close function from useModal, assuming 'notice' is the modal name

    callStore.setCallingType("videoCall");

    sessionStorage.setItem("m_callWaiting", "false");
    commonStore.setChangeViewType(2);

    router.push("/call"); // Nuxt 3 way to navigate
};

const noneOverlayModal = (seq) => {
    commonStore.setNoneOverlayAlertStatus(seq);
};

// 전화 거절
const callingReject = (roomid, localdeviceid, remotedeviceid, institution, nickname) => {
    const obj = {
        localdeviceid,
        remotedeviceid,
        roomid,
        institution,
        nickname,
    };
    const json = JSON.stringify(obj);
    signallingSocket.emit("refuseCalling", json);
    console.log("*** socket.emit: refuseCalling request: ", json);
    sessionStorage.setItem("m_callWaiting", "false");
};

// socket sendMessage
const sendDirectMessageRequest = (sender, receiver, type, message, datetime) => {
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
};

// 읽음처리 socket
const readProcess = (sender, receiver, datetime) => {
    const obj = {
        sender,
        receiver,
        datetime,
    };

    const json = JSON.stringify(obj);
    signallingSocket.emit("directMessageReadProcess", json);
    console.log("*** socket: emit directMessageReadProcess");
    console.log(json);
};

const onResize = () => {
    windowWidth.value = window.innerWidth;
    windowHeight.value = window.innerHeight;
};
const {
    meetingList,
    meetingSaveFlag: getMeetingSaveFlag,
    meetingDeleteFlag: getMeetingDeleteFlag,
    meetingJoinFlag: getMeetingJoinFlag,
    meetingListMonthFlag: getMeetingListMonthFlag,
    meetingModifyFlag: getMeetingModifyFlag,
} = storeToRefs(meetingStore);

const {
    sendDMFlag: getSendDMFlag,
    readProcFlag: getReadProcFlag,
    previousMessageFlag: getPreviousMessageFlag,
} = storeToRefs(directMessageStore);

const {
    userData: userList,
    callingPopupResult: getCallingPopupResult,
    autoCallAcceptTime: getAutoCallAcceptTime,
    sendDurationEnable: getSendDurationEnable,
} = storeToRefs(callStore);

const getMeetingOpenFlag = computed(() =>  meetingStore.meetingOpenFlag)
// Watch for allView checkbox changes
watch(allView, (newVal) => {
    console.log("*** watch: allView():: newVal = ", newVal);
    const meetingViewType = newVal ? 1 : 0
    localStorage.setItem("meetingViewType", meetingViewType); // localStorage stores strings

    if (calendar.value) {
        meetingCalendarList(meetingViewType)
    } else {
        getMeetingList(meetingViewType)
    }
});

// Watch for calendar checkbox changes
watch(calendar, (newVal) => {
    console.log("*** watch: calendar():: newVal = ", newVal);

    if (!newVal) {
        allView.value ? getMeetingList(1) : getMeetingList(0);
    }
});

// Watch for meeting save flag
watch(getMeetingSaveFlag, (newVal) => {
    if (newVal) {
        createMeeting();
        meetingStore.setMeetingSaveInfo(null); // Directly calling action
        meetingStore.setMeetingSaveFlag(false); // Directly calling action
    }
});

// Watch for meeting delete flag
watch(getMeetingDeleteFlag, (newVal) => {
    if (newVal) {
        deleteMeeting();
        meetingStore.setMeetingSeq(null); // Directly calling action
        meetingStore.setMeetingDeleteFlag(false); // Directly calling action
    }
});

// Watch for meeting open flag
watch(getMeetingOpenFlag, (newVal) => {
    if (newVal) {
        createRoomID();
    }
});

// Watch for meeting join flag
watch(getMeetingJoinFlag, (newVal) => {
    if (newVal) {
        const obj = { meeting_seq: meetingSeq.value };
        const json = JSON.stringify(obj);
        signallingSocket.emit("openMeetingChecking", json);
        console.log("*** socket.emit: openMeetingChecking emit : " + json);

        if (calendar.value) {
            newVal ? meetingCalendarList(1) : meetingCalendarList(0);
        } else {
            newVal ? getMeetingList(1) : getMeetingList(0);
        }
    }
});

// Watch for meeting list month flag
watch(getMeetingListMonthFlag, (newVal) => {
    console.log("*** watch: getMeetingListMonthFlag():: newVal = ", newVal);
    if (newVal) {
        meetingCalendarList();
    }
});

// Watch for meeting modify flag
watch(getMeetingModifyFlag, (newVal) => {
    if (newVal === true) {
        modifyMeeting();
        meetingStore.setMeetingSeq(null); // Directly calling action
        meetingStore.setMeetingModifyInfo(null); // Directly calling action
        meetingStore.setMeetingModifyFlag(false); // Directly calling action
    }
});

// Watch for calling popup result
watch(
    () => getCallingPopupResult,
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
                callingAccept(
                    callingPopupResultData.roomid,
                    callingPopupResultData.deviceid,
                );
            }
        } else if (result === 0) {
            callingBell("stop");
            console.log("*** watch: reject");

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
    },
);

// Watch for send direct message flag
watch(getSendDMFlag, (newVal) => {
    if (newVal) {
        const messageIndex = directMessageList.value.length - 1;
        sendDirectMessageRequest(
            directMessageList.value[messageIndex].sender,
            directMessageList.value[messageIndex].receiver,
            directMessageList.value[messageIndex].type,
            directMessageList.value[messageIndex].message,
            directMessageList.value[messageIndex].datetime,
        );
        directMessageStore.setSendDMFlag(false);
    }
});

// Watch for read process flag
watch(getReadProcFlag, (newVal) => {
    if (newVal) {
        console.log(readMessageInfo.value[0]);
        readProcess(
            readMessageInfo.value[0].sender,
            readMessageInfo.value[0].receiver,
            readMessageInfo.value[0].datetime,
        );
        directMessageStore.setReadProcFlag(false);
    }
});
</script>
<style lang="scss">
.empty {
    width: 100%;
    height: 100%;
    font: normal normal bold 18px/21px NanumSquare;
    letter-spacing: 0px;
}
.box {
    padding-right: 15px;
    padding-bottom: 15px;
    @media screen and (max-width: 850px) {
        padding-right: 0px;
    }
}
.window {
    width: 100%;
    border: 1px solid #4d4d4d;
    > button {
        width: 100%;
        height: 100%;

        > img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
    }
}

.room-container {
    display: flex;
    flex-wrap: wrap; // 공간이 부족하면 다음 줄로 넘어감
    gap: 15px; // 요소들 사이의 간격
    @media (min-width: 640px) {
        > div {
            width: calc(50% - 7.5px);
        }
    }
    @media (min-width: 1280px) {
        > div {
            width: calc(33.333% - 10px);
        }
    }
}
.font20 {
    font: normal normal bold 20px/23px NanumSquare;
    padding-left: 20px;
}
.viewChoice {
    display: flex;
    justify-content: space-between;
    width: 100%;
    color: #fff;
    .font20,
    .btm {
        padding-bottom: 15px;
        @media screen and (max-width: 479px) {
            padding-bottom: 7px;
        }
    }
    .font20 {
        font: normal normal bold 18px/23px NanumSquare;
    }
}

.yHidden {
    overflow-y: hidden;
}
.y {
    overflow-y: auto;
    width: 100%;
}

::-webkit-scrollbar {
    width: 13px;
}
::-webkit-scrollbar-track-piece {
    // This property is often empty in SASS, but in SCSS it requires a rule or to be removed if truly empty.
    // If you intend for it to be empty, you can either remove it or add a placeholder rule.
    // For example:
    // background: transparent;
}
::-webkit-scrollbar-thumb {
    border-radius: 7px;
}

#meetingRoom {
    width: 100%;
    height: 100%;
}

.main {
    width: 100%;
}

.roomMain {
    width: 100%;
    height: 100%;
    margin-top: 4.25rem;
    padding-right: 1.5rem;
    padding-left: 1.5rem;
    .makeMeetingBtn {
        border-radius: 9px;
        width: 76px;
        height: 28px;
        font: normal normal bold 14px/16px NanumSquare;
        letter-spacing: 0px;
        margin-right: 1px;
        color: #fff;
        background: #2386d2 0 0 no-repeat padding-box;
    }
    .topSpan {
        font: normal normal normal 14px/16px NanumSquare;
        letter-spacing: 0px;
        margin-left: 10px;
    }
    .topCheckBox {
        margin-left: 30px;
    }
    label {
        cursor: pointer;
    }
}
.topCheckBoxLabel {
    z-index: 1;
    display: flex;
    align-items: center;
    gap: 8px;
    padding-bottom: 10px;
    label + button {
        margin-left: 10px;
    }
}
</style>
