// socketManager.js
import { useCallStore } from "@/stores/call";
import { useUserListStore } from "@/stores/userList";
import { buildTree } from "@/utils/common"
import { recentDataGetIndex, updateStatusByDeviceId, userDataGetIndex, userDataGetInfo } from "@/composables/common";
import { useModalStore } from "@/stores/modal";
import { useUserPreferenceStore } from "@/stores/common";
import { useLoginStore } from "@/stores/login";
import useSocketEmitEvents from "./useSocketEmit";
import { useCommonStore } from "@/stores";
import { emitter } from "@/utils/eventBus";
import { useRouter } from "nuxt/app";
import { useMeetingStore } from "@/stores/meeting";
import { useDirectCallStore } from "@/stores/directCall";
import { userListAdd } from "@/utils/userList";


// environment, joinMeeting  > 연락처, 회의실, 회원대기실
// openMeetingOnOff > onpenMeetingOnOff
// userStatus, callReadyStatus, canMakeCall  > 연락처 컴포넌트
// createRoomID > 회의실, 영상통화
// canMakeCall > 영상통화, 연락처
// groupRoom > 연락처
// calling > 연락처, 영상통화, 회의실
// calling , cancelCalling, inviteCancelCalling, directMessage, directMessageReadProcess, getPreviousMessage > 연락처, 영상통화, 회의실
// multiRefuseCalling > 연락처
// openMeetingChecking, sendEntryNotification > 연락처, 회의실


export function bindSocketEvents(socket) {
    const router = useRouter();
    const loginStore = useLoginStore();
    const preperenceStore = useUserPreferenceStore();
    const modalStore = useModalStore();
    const callStore = useCallStore();
    const userListStore = useUserListStore();
    const commonStore = useCommonStore();
    const meetingStore = useMeetingStore();
    const directCallStore = useDirectCallStore();

    const {
        requestCanMakeCall,
        requestGroupRoom,
        reeuqestCreateFixRoomID,
        requestCreateRoomID,
        requestJoinMeeting
    } = useSocketEmitEvents();

    socket.off("userListAll");
    socket.on("userListAll", (response) => {
        const json = JSON.parse(response);
        
        console.log("왜 안들어와", json.users)
        userListStore.init();
        userListAdd(json.users);
        callStore.setUserData([]);
        callStore.setUserDataAll([]);

        const sortOrgList = json.users.sort((a, b) => b.status - a.status);
        callStore.setUserData(sortOrgList);
        callStore.setUserDataAll(json.users);
        const result = buildTree(sortOrgList);
        userListStore.setOrganizationList(result);
    });

    socket.off("lastCallTime");
    socket.on("lastCallTime", (response) => {
        const json = JSON.parse(response);
        console.log
        userListStore.init();
        callStore.setRecentData([]);
        callStore.setRecentDataAll([]);

        const sortOrgList = json.users.sort((a, b) => b.status - a.status);
        callStore.setRecentData(sortOrgList);
        callStore.setRecentDataAll(json.users);
        const result = buildTree(sortOrgList);
        userListStore.setRecentCallList(result);
    });

    socket.off("callReadyStatus");
    socket.on("callReadyStatus", (response) => {
        const json = JSON.parse(response);
        console.log(json)
        const userIdx = userDataGetIndex(json.deviceid)
        callStore.setUserDataStatusAtIndex({
            index: userIdx,
            status: json.status
        })
        const recentIdx = recentDataGetIndex(json.deviceid)
        callStore.setUserDataStatusAtIndex({
            index: recentIdx,
            status: json.status
        })

        const updateRecentCallList = updateStatusByDeviceId(userListStore.recentCallList, json.deviceid, json.status);
        const updateOrgCallList = updateStatusByDeviceId(
            userListStore.organizationList,
            json.deviceid,
            json.status,
        );
        console.log(updateOrgCallList)
        userListStore.setRecentCallList(updateRecentCallList);
        userListStore.setOrganizationList(updateOrgCallList);
    });

    socket.off("userStatus");
    socket.on("userStatus", (response) => {
        const json = JSON.parse(response);
        const remoteInfo = userDataGetInfo(json.deviceid);
        
        sessionStorage.setItem("m_remote_deviceid", remoteInfo.deviceId);
        sessionStorage.setItem("m_remote_nickname", remoteInfo.nickName);
        sessionStorage.setItem("m_remote_devicetype", remoteInfo.deviceType);
        sessionStorage.setItem("m_remote_status", remoteInfo.status);

        // console.log("*** socket: userStatus sessionStorage.setItem(inRoomFlag):", sessionStorage.getItem("inRoomFlag"))

        // 자신이 통화중인 경우 상대방 초대하기
        alert(sessionStorage.getItem("inRoomFlag"));
        if (sessionStorage.getItem("inRoomFlag") === "true") {
            requestCanMakeCall(remoteInfo.deviceId);
            sessionStorage.setItem("m_callWaiting", "true");
        }

        // 상대방이 대기실에 있는경우
        if (json.status == 1) {
            if (preperenceStore.roomNumber) {
                // 새로 생성한 roomid sessionStorage 등록
                sessionStorage.setItem("m_roomid", preperenceStore.roomNumber);
                sessionStorage.setItem("inRoomFlag", "true");
                sessionStorage.setItem("createRoomFlag", "true");

                // 페이지 이동 (방입장)
                commonStore.changeViewType(2);
                router.push("/call")
                reeuqestCreateFixRoomID();
            } else {
                requestCreateRoomID();
            }
            // 상대방이 방에 입장한 상태
        } else if (json.status == 2) {
            requestGroupRoom(remoteInfo.deviceId);
            callStore.callingPopupInfo({
                institution: remoteInfo.enName,
                headquarters: remoteInfo.hqName,
                branch: remoteInfo.brName,
                nickname: remoteInfo.nickName,
            });

        }
    });


    // // 분기
    // socket.on("createRoomID", function (response) {
    //     console.log("*** socket on createRoomID:", JSON.parse(response));
    //     emitter.emit("createRoomID", JSON.parse(response));
    // });

    // socket.on("calling", (response) => {
    //     console.log("*** socket on calling:", JSON.parse(response));
    //     emitter.emit("calling", JSON.parse(response));
    // });

    // socket.on("canMakeCall", (response) => {
    //     console.log("*** socket on canMakeCall:", JSON.parse(response));
    //     emitter.emit("canMakeCall", JSON.parse(response));
    // });

    // socket.on("groupRoom", (response) => {
    //     console.log("*** socket on groupRoom:", JSON.parse(response));
    //     emitter.emit("groupRoom", JSON.parse(response));
    // })

    // socket.on("multiRefuseCalling", (response) => {
    //     console.log("*** socket on multiRefuseCalling:", JSON.parse(response));
    //     emitter.emit("multiRefuseCalling", JSON.parse(response));
    // });

    // socket.on("cancelCalling", (response) => {
    //     console.log("*** socket on cancelCalling:", JSON.parse(response));
    //     emitter.emit("cancelCalling", JSON.parse(response));
    // });

    // socket.on("inviteCancelCalling", (response) => {
    //     console.log("*** socket on inviteCancelCalling:", JSON.parse(response));
    //     emitter.emit("inviteCancelCalling", JSON.parse(response));
    // });

    // socket.on("joinMeeting", (response) => {
    //     console.log("*** socket on joinMeeting:", JSON.parse(response));
    //     emitter.emit("joinMeeting", JSON.parse(response));
    // });

    // socket.on("directMessage", (response) => {
    //     console.log("*** socket on directMessage:", JSON.parse(response));
    //     emitter.emit("directMessage", JSON.parse(response));
    // });

    // socket.on("directMessageReadProcess", (response) => {
    //     console.log("*** socket on directMessageReadProcess:", JSON.parse(response));
    //     emitter.emit("directMessageReadProcess", JSON.parse(response));
    // });

    // socket.on("getPreviousMessage", (response) => {
    //     console.log("*** socket on getPreviousMessage:", JSON.parse(response));
    //     emitter.emit("getPreviousMessage", JSON.parse(response));
    // });

    // socket.on("getOverhaul", (response) => {
    //     console.log("*** socket on getOverhaul:", JSON.parse(response));
    //     emitter.emit("getOverhaul", JSON.parse(response));
    // });

    // // 분기
    // socket.on("openMeetingChecking", (response) => {
    //     console.log("*** socket on openMeetingChecking:", JSON.parse(response));
    //     emitter.emit("openMeetingChecking", JSON.parse(response));
    //     // console.log("*** socket.on: openMeetingChecking res = ", response);
    //     // const json = JSON.parse(response);
    //     // console.log("*** socket.on: json = ", json);
    //     // if (json.start_status == 0) {
    //     //     if (json.everyone_start_yn == 1) {

    //     //         const openMeetingData = {
    //     //             entryNotification: json.unique_roomid,
    //     //         };

    //     //         meetingStore.setOpenMeetingData(openMeetingData);
    //     //         callStore.setUniqueRoomid(json.unique_roomid)
    //     //         directCallStore.clearDirectCallInfo();

    //     //         requestCreateRoomID()
    //     //         meetingStore.setOpenAndJoin("open");
    //     //         meetingStore.setMeetingSeq(json.unique_roomid);
    //     //         meetingStore.meetingOpenFlag(true);
    //     //     } else {
    //     //         noneOverlayModal(6);
    //     //     }
    //     // } else if (json.start_status == 1) {
    //     //     if (!json.roomid) {
    //     //         meetingStore.setOpenMeetingCheck(false);
    //     //     }
    //     //     console.log("*** methods: joinMeeting::");
    //     //     console.log("*** methods: joinMeeting:: meetingSeq = ", (json.unique_roomid));
            
    //     //     meetingStore.setOpenAndJoin("join");
    //     //     meetingStore.setMeetingSeq(json.unique_roomid);
    //     //     meetingStore.meetingJoinFlag(true);
    //     // } else if (json.start_status == 3) {
    //     //     console.log("회의실이 삭제되어있다.");
    //     //     commonStore.setNoneOverlayAlertStatus(8);
    //     //     noneOverlayModal(8);
    //     // }
    // });

    // socket.on("sendEntryNotification", (response) => {
    //     console.log("*** socket on sendEntryNotification:", JSON.parse(response));
    //     const json = JSON.parse(response);
    //     console.log("sendEntryNotification", json);
    //     console.log(json)
    //     directCallStore.setDirectCallInfo(json);
    //     // callingPopup Show
    //     if (directCallStore.directcallList.length == 1) {
    //         commonStore.setAlert(8);
    //     }
    // })
}

