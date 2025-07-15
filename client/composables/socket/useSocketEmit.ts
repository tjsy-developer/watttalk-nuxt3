import { getWorldTime } from '@/utils/common';
import { useNuxtApp, useRouter } from "nuxt/app";
import { useAuthStore } from "@/stores/login";
import type { Socket } from "socket.io-client";
import { useUserPreferenceStore } from "@/stores/common";

const statusCode = {
    Unauthorized: 0,
    Success: 1,
    Not_Registered: 2,
    Mqtt_decline: 3,
    Duplicate: 4,
};

declare module "nuxt/app" {
    interface NuxtApp {
        $signallingSocket: Socket;
        // 필요하면 다른 소켓도 추가
        $transferSocket?: Socket;
    }
}

export default function useSocketEmitEvents() {
    const { $signallingSocket }: { $signallingSocket: Socket } = useNuxtApp();
    const loginStore = useAuthStore();
    const preperenceStore = useUserPreferenceStore();
    const requestCreateFixRoomID = () => {
        const json = {
            deviceid: loginStore.m_local_deviceid,
            roomid: "540",
        };
        $signallingSocket.emit("createFixRoomID", JSON.stringify(json));
    };

    const requestGetOverHaul = () => {
        const json = {
            lang: preperenceStore.lang,
        };
        $signallingSocket.emit("getOverhaul", JSON.stringify(json));
    };

    const requestEnvironment = () => {
        const json = {
            deviceid: loginStore.m_local_deviceid,
            appname: "powertalkweb",
        };
        $signallingSocket.emit("environment", JSON.stringify(json));
    };

    const requestUserListAll = () => {
        const json = {
            deviceid: loginStore.m_local_deviceid,
            en_seq: loginStore.sessionEnSeq,
            language: preperenceStore.lang,
        };
        $signallingSocket.emit("userListAll", JSON.stringify(json));
    };

    const requestLastCallTime = () => {
        const json = {
            deviceid: loginStore.m_local_deviceid,
            current_time: getWorldTime(),
            language: preperenceStore.lang,
        };
        $signallingSocket.emit("userListAll", JSON.stringify(json));
    };

    const requestUserStatus = (remoteDeviceId: string) => {
        const json = {
            deviceid: remoteDeviceId,
        };
        $signallingSocket.emit("userStatus", JSON.stringify(json));
    };

    const requestCanMakeCall = (remoteDeviceId: string) => {
        const json = {
            localdeviceid: loginStore.m_local_deviceid,
            remotedeviceid: remoteDeviceId,
        };
        $signallingSocket.emit("canMakeCall", JSON.stringify(json));
    };

    const requestGroupRoom = (remoteDeviceId: string) => {
        const json = {
            localdeviceid: loginStore.m_local_deviceid,
            remotedeviceid: remoteDeviceId,
        };
        $signallingSocket.emit("groupRoom", JSON.stringify(json));
    };

    const requestCreateRoomID = (remoteDeviceId: string) => {
        const json = {
            deviceid: loginStore.m_local_deviceid,
            sendDurationEnable: preperenceStore.recordingStatus,
        };
        $signallingSocket.emit("createRoomID", JSON.stringify(json));
    };

    const requestCalling = ({
        remoteDeviceId,
        roomID,
        callType,
        institution,
        nickname,
    }: {
        remoteDeviceId: string;
        roomID: string;
        callType: string;
        institution: string;
        nickname: string;
    }) => {
        const json = {
            localdeviceid: loginStore.m_local_deviceid,
            remotedeviceid: remoteDeviceId,
            roomid: roomID,
            calltype: callType,
            institution: institution,
            nickname: nickname,
            roomNumberCount: 16,
        };
        $signallingSocket.emit("calling", JSON.stringify(json));
    };

    const requestRefuseCalling = ({
        remoteDeviceId,
        roomID,
        institution,
        nickname,
    }: {
        remoteDeviceId: string;
        roomID: string;
        callType: string;
        institution: string;
        nickname: string;
    }) => {
        const json = {
            localdeviceid: loginStore.m_local_deviceid,
            remotedeviceid: remoteDeviceId,
            roomid: roomID,
            institution: institution,
            nickname: nickname,
        };
        $signallingSocket.emit("refuseCalling", JSON.stringify(json));
    };

    const requestCancelCalling = ({
        remoteDeviceId,
        roomID,
    }: {
        remoteDeviceId: string;
        roomID: string;
    }) => {
        const json = {
            localdeviceid: loginStore.m_local_deviceid,
            remotedeviceid: remoteDeviceId,
            roomid: roomID,
            institution: loginStore.institution,
            nickname: loginStore.nickname,
        };
        $signallingSocket.emit("refuseCalling", JSON.stringify(json));
    };

    const requestInviteCancelCalling = ({
        remoteDeviceId,
        roomID,
    }: {
        remoteDeviceId: string;
        roomID: string;
    }) => {
        const json = {
            localdeviceid: loginStore.m_local_deviceid,
            remotedeviceid: remoteDeviceId,
            roomid: roomID,
            institution: loginStore.institution,
            nickname: loginStore.nickname,
        };
        $signallingSocket.emit("inviteCancelCalling", JSON.stringify(json));
    };

    const requestDirectMessage = ({
        sender,
        receiver,
        type,
        message,
        datetime,
    }: {
        sender: string;
        receiver: string;
        type: string;
        message: string;
        datetime: string;
    }) => {
        const json = {
            sender,
            receiver,
            type,
            message,
            datetime,
        };
        $signallingSocket.emit("directMessage", JSON.stringify(json));
    };

    const requestDirectMessageReadProcess = ({
        sender,
        receiver,
        datetime,
    }: {
        sender: string;
        receiver: string;
        datetime: string;
    }) => {
        const json = {
            sender,
            receiver,
            datetime,
        };
        $signallingSocket.emit("directMessageReadProcess", JSON.stringify(json));
    };

    const requestJoinMeeting = ({
        meetingSeq,
        roomID,
        uniqueRoomID,
    }: {
        meetingSeq: number;
        roomID: number;
        uniqueRoomID: number;
    }) => {
        const json = {
            meeting_seq: meetingSeq,
            deviceid: loginStore.m_local_deviceid,
            roomid: roomID,
            unique_roomid: uniqueRoomID, //추가
        };

        $signallingSocket.emit("joinMeeting", JSON.stringify(json));
    };

    const requestGetPreviousMessage = ({
        receiver,
        prevMessageCount,
    }: {
        receiver: string
        prevMessageCount: number
    }) => {
        const json = {
            sender: loginStore.m_local_deviceid,
            receiver: receiver,
            datetime: getWorldTime(), // 현재 시간으로 부터 이전 메세지 가져오기
            count: prevMessageCount, // 이전 메세지 가져올 갯수
        };
        $signallingSocket.emit("getPreviousMessage", JSON.stringify(json));
    };

    return {
        requestCreateFixRoomID,
        requestRefuseCalling,
        requestGetOverHaul,
        requestEnvironment,
        requestUserListAll,
        requestLastCallTime,
        requestUserStatus,
        requestCanMakeCall,
        requestGroupRoom,
        requestCreateRoomID,
        requestCalling,
        requestCancelCalling,
        requestInviteCancelCalling,
        requestDirectMessage,
        requestDirectMessageReadProcess,
        requestJoinMeeting,
        requestGetPreviousMessage,
    };
}
