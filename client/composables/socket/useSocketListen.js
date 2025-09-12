// socketManager.js
import { useCallStore } from "@/stores/call";
import { useUserListStore } from "@/stores/userList";
import { buildTree, dircetMessageBell, getFormattedDate } from "@/utils/common";
import {
    recentDataGetIndex,
    updateStatusByDeviceId,
    userDataGetIndex,
    userDataGetInfo,
} from "@/composables/common";
import { useModalStore } from "@/stores/modal";
import { useUserPreferenceStore } from "@/stores/common";
import { useLoginStore } from "@/stores/login";
import useSocketEmitEvents from "./useSocketEmit";
import { useCommonStore } from "@/stores";
import { emitter } from "@/utils/eventBus";
import { useRouter } from "nuxt/app";
import { useMeetingStore } from "@/stores/meeting";
import { useDirectCallStore } from "@/stores/directCall";
import { findUserInfo, userListAdd } from "@/utils/userList";
import { useLoginEvents } from "./useLoginEvents";
import { useSignallingSocket } from "./useSignallingSocket";
import { useDirectMessageStore } from "@/stores/directMessage";
import { useModal, useModalSlot, useVfm, VueFinalModal } from "vue-final-modal";
import ChatModal from "@/components/modal/ChatModal.vue";

export function bindSocketEvents() {
    const { signallingSocket } = useSignallingSocket();
    const router = useRouter();
    const vfm = useVfm();
    const loginStore = useLoginStore();
    const preperenceStore = useUserPreferenceStore();
    const modalStore = useModalStore();
    const callStore = useCallStore();
    const userListStore = useUserListStore();
    const commonStore = useCommonStore();
    const meetingStore = useMeetingStore();
    const directCallStore = useDirectCallStore();
    const directMessageStore = useDirectMessageStore();

    const {
        requestCanMakeCall,
        requestGroupRoom,
        reeuqestCreateFixRoomID,
        requestCreateRoomID,
        requestJoinMeeting,
        requestForceLogoutResult,
    } = useSocketEmitEvents();

    const { loginRequest } = useLoginEvents();

    // ---------- Handlers ----------
    function handleUserListAll(response) {
        const json = JSON.parse(response);
        console.log("왜 안들어와", json.users);
        userListStore.init();
        userListAdd(json.users);
        callStore.setUserData([]);
        callStore.setUserDataAll([]);
        const sortOrgList = json.users.sort((a, b) => b.status - a.status);
        callStore.setUserData(sortOrgList);
        callStore.setUserDataAll(json.users);
        const result = buildTree(sortOrgList);
        userListStore.setOrganizationList(result);
    }

    function handleLastCallTime(response) {
        const json = JSON.parse(response);
        console.log(response);
        userListStore.init();
        callStore.setRecentData([]);
        callStore.setRecentDataAll([]);
        const sortOrgList = json.users.sort((a, b) => b.status - a.status);
        callStore.setRecentData(sortOrgList);
        callStore.setRecentDataAll(json.users);
        userListStore.setRecentCallList(sortOrgList);
    }

    function handleCallReadyStatus(response) {
        const json = JSON.parse(response);
        console.log("callReadyStatus", json);
        const userIdx = userDataGetIndex(json.deviceid);
        callStore.setUserDataStatusAtIndex({
            index: userIdx,
            status: json.status,
        });
        const recentIdx = recentDataGetIndex(json.deviceid);
        callStore.setUserDataStatusAtIndex({
            index: recentIdx,
            status: json.status,
        });

        const updateRecentCallList = updateStatusByDeviceId(
            userListStore.recentCallList,
            json.deviceid,
            json.status,
        );
        const updateOrgCallList = updateStatusByDeviceId(
            userListStore.organizationList,
            json.deviceid,
            json.status,
        );
        console.log(updateRecentCallList);
        userListStore.setRecentCallList(updateRecentCallList);
        userListStore.setOrganizationList(updateOrgCallList);
    }

    function handleUserStatus(response) {
        const json = JSON.parse(response);
        console.log(json);
        const remoteInfo = userDataGetInfo(json.deviceid);

        sessionStorage.setItem("m_remote_deviceid", remoteInfo.deviceId);
        sessionStorage.setItem("m_remote_nickname", remoteInfo.nickName);
        sessionStorage.setItem("m_remote_devicetype", remoteInfo.deviceType);
        sessionStorage.setItem("m_remote_status", remoteInfo.status);

        if (sessionStorage.getItem("inRoomFlag") === "true") {
            requestCanMakeCall(remoteInfo.deviceId);
            sessionStorage.setItem("m_callWaiting", "true");
        } else {
            if (json.status == 2) {
                requestGroupRoom(remoteInfo.deviceId);
                callStore.callingPopupInfo({
                    institution: remoteInfo.enName,
                    headquarters: remoteInfo.hqName,
                    branch: remoteInfo.brName,
                    nickname: remoteInfo.nickName,
                });
                commonStore.setAlert(5);
                sessionStorage.setItem("m_callWaiting", "true");
            } else {
                if (json.status == 1) {
                    if (preperenceStore.roomNumber) {
                        sessionStorage.setItem("m_roomid", preperenceStore.roomNumber);
                        sessionStorage.setItem("inRoomFlag", "true");
                        sessionStorage.setItem("createRoomFlag", "true");
                        commonStore.setChangeViewType(2);
                        router.push("/call");
                        reeuqestCreateFixRoomID();
                    } else {
                        requestCreateRoomID();
                    }
                }
            }
        }
    }

    function handleForceLogoutResult(response) {
        console.log("*** socket: on forceLogoutResult");
        const json = JSON.parse(response);
        console.log(json);

        if (json.status == 1) {
            loginRequest(loginStore.m_local_deviceid);
        } else {
            setTimeout(() => {
                commonStore.setNoneOverlayAlertStatus(22);
            }, 500);
            setTimeout(() => {
                loginStore.setLoginType({ logintype: 3 });
            }, 3000);
        }
    }

    function handleForceLogoutRequest(response) {
        const json = JSON.parse(response);
        loginStore.setForceLogoutUserId(json.requestSocketid);

        if (commonStore.contentsViewType === 2) {
            requestForceLogoutResult(json.requestSocketid, 0);
        } else {
            commonStore.setNoneOverlayAlertStatus(21);
            sessionStorage.setItem("forcedLogout", true);
            setTimeout(() => {
                requestForceLogoutResult(json.requestSocketid, 1);
                loginStore.setLoginType({ logintype: 3 });
            }, 5000);
        }
    }

    function handleDirectMessage(response) {
        console.log("*** socket: directMessage response", response);
        const json = JSON.parse(response);
        directMessageStore.setRemoteMessageList({ remoteDeviceId: json.sender });
        directMessageStore.setAddReceiveMessage({
            sender: json.sender,
            receiver: json.receiver,
            timestamp: json.datetime,
            dateTime: getFormattedDate(json.datetime, "mm/dd hh:MM"),
            message: json.message,
            read: false,
        });

        dircetMessageBell("play");
        const remoteUser = findUserInfo(json.sender);
        const modalId = "chat-modal-" + remoteUser.deviceid;
        if (vfm.get(modalId)) {
            vfm.open(modalId);
            return;
        }

        // 최초 등록
        const { open } = useModal({
            component: VueFinalModal,
            keepAlive: true,
            attrs: {
                modalId,
                displayDirective: "show",
                background: "interactive",
                contentTransition: "vfm-fade",
                hideOverlay: true,
                class: "modal-container chat-modal non-overlay",
                "onUpdate:modelValue": (val) => {
                    console.log("chat modal open state changed:", val);
                },
            },
            slots: {
                default: useModalSlot({
                    component: ChatModal,
                    attrs: {
                        remoteDeviceId: remoteUser.deviceid,
                        remoteNickName: remoteUser.nickname,
                        profile: remoteUser.image,
                    },
                }),
            },
        });
        open();
    }

    function handleDirectMessageReadProcess(response) {
        console.log("*** socket: directMessageReadProcess response", response);
        const json = JSON.parse(response);
        directMessageStore.setReadMessage({ remoteDeviceId: json.receiver });
    }

    function handlePreviousMessage(response) {
        console.log("*** socket: getPreviousMessage response", response);
        const json = JSON.parse(response);
        const messageList = json.message;
        if (messageList.length == 0) {
            directMessageStore.setIsLastMessage();
            return
        }
        for (let i = 0; i < messageList.length; i++) {
            console.log(messageList[i].sender);
            directMessageStore.setAddPrevMessage({
                sender: messageList[i].sender,
                receiver: messageList[i].receiver,
                timestamp: messageList[i].datetime,
                dateTime: getFormattedDate(messageList[i].datetime, "mm/dd hh:MM"),
                message: messageList[i].message,
                read: messageList[i].readCheck,
            });
        }
    }

    function handleSendEntryNotification(response) {
        console.log("socket.on sendEntryNotification::", response);
        const json = JSON.parse(response);
        console.log(json);
        directCallStore.setDirectCallInfo(json);

        if (directCallStore.directcallList.length === 1) {
            commonStore.setAlert(8);
        }
    }

    // ---------- Binding ----------
    signallingSocket.on("userListAll", handleUserListAll);
    signallingSocket.on("lastCallTime", handleLastCallTime);
    signallingSocket.on("callReadyStatus", handleCallReadyStatus);
    signallingSocket.on("userStatus", handleUserStatus);
    signallingSocket.on("forceLogoutResult", handleForceLogoutResult);
    signallingSocket.on("forceLogoutRequest", handleForceLogoutRequest);
    signallingSocket.on("directMessage", handleDirectMessage);
    signallingSocket.on("directMessageReadProcess", handleDirectMessageReadProcess);
    signallingSocket.on("getPreviousMessage", handlePreviousMessage);
    signallingSocket.on("sendEntryNotification", handleSendEntryNotification);

    // ---------- Unbinder ----------
    return () => {
        signallingSocket.off("userListAll", handleUserListAll);
        signallingSocket.off("lastCallTime", handleLastCallTime);
        signallingSocket.off("callReadyStatus", handleCallReadyStatus);
        signallingSocket.off("userStatus", handleUserStatus);
        signallingSocket.off("forceLogoutResult", handleForceLogoutResult);
        signallingSocket.off("forceLogoutRequest", handleForceLogoutRequest);
        signallingSocket.off("directMessage", handleDirectMessage);
        signallingSocket.off("directMessageReadProcess", handleDirectMessageReadProcess);
        signallingSocket.off("getPreviousMessage", handlePreviousMessage);
        signallingSocket.off("sendEntryNotification", handleSendEntryNotification);
    };
}
