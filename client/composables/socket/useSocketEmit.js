import { getWorldTime } from '@/utils/common';
import { useNuxtApp, useRouter } from "nuxt/app";
import { useLoginStore } from "@/stores/login";
import { useUserPreferenceStore } from "@/stores/common";
import { onMounted } from 'vue';
import { useModalStore } from '@/stores/modal';
import { useMeetingStore } from '@/stores/meeting';
import { userDataGetInfo } from '../common';

const statusCode = {
    Unauthorized: 0,
    Success: 1,
    Not_Registered: 2,
    Mqtt_decline: 3,
    Duplicate: 4,
};

export default function useSocketEmitEvents(signallingSocket) {
    const { $signallingSocket } = useNuxtApp();
    const loginStore = useLoginStore();
    const modalStore = useModalStore();
    const preperenceStore = useUserPreferenceStore();
    const meetingStore = useMeetingStore();

    console.log($signallingSocket);

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
        $signallingSocket.emit("lastCallTime", JSON.stringify(json));
    };

    const requestUserStatus = (remoteDeviceId) => {
        const json = {
            deviceid: remoteDeviceId,
        };
        $signallingSocket.emit("userStatus", JSON.stringify(json));
        console.log(json);
    };

    const requestCanMakeCall = (remoteDeviceId) => {
        const json = {
            localdeviceid: loginStore.m_local_deviceid,
            remotedeviceid: remoteDeviceId,
        };
        $signallingSocket.emit("canMakeCall", JSON.stringify(json));
    };

    const requestGroupRoom = (remoteDeviceId) => {
        const json = {
            localdeviceid: loginStore.m_local_deviceid,
            remotedeviceid: remoteDeviceId,
        };
        $signallingSocket.emit("groupRoom", JSON.stringify(json));
    };

    const requestCreateRoomID = () => {
        try {
            const json = {
                deviceid: loginStore.m_local_deviceid,
                sendDurationEnable: preperenceStore.recordingStatus,
            };
            $signallingSocket.emit("createRoomID", JSON.stringify(json));
        } catch(error) {

        }

    };

    const requestCalling = ({
        remoteDeviceId,
        roomID,
        callType,
        institution,
        nickname,
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

    const requestRefuseCalling = ({ remoteDeviceId, roomID, institution, nickname }) => {
        const json = {
            localdeviceid: loginStore.m_local_deviceid,
            remotedeviceid: remoteDeviceId,
            roomid: roomID,
            institution: institution,
            nickname: nickname,
        };
        $signallingSocket.emit("refuseCalling", JSON.stringify(json));
    };

    const requestCancelCalling = ({ remoteDeviceId, roomID }) => {
        const json = {
            localdeviceid: loginStore.m_local_deviceid,
            remotedeviceid: remoteDeviceId,
            roomid: roomID,
            institution: loginStore.institution,
            nickname: loginStore.nickname,
        };
        $signallingSocket.emit("cancelCalling", JSON.stringify(json));
        modalStore.closeModal("call");
        sessionStorage.setItem("m_callWaiting", "false");
    };

    const requestInviteCancelCalling = ({ remoteDeviceId, roomID }) => {
        const json = {
            localdeviceid: loginStore.m_local_deviceid,
            remotedeviceid: remoteDeviceId,
            roomid: roomID,
            institution: loginStore.institution,
            nickname: loginStore.nickname,
        };
        $signallingSocket.emit("inviteCancelCalling", JSON.stringify(json));
    };

    const requestDirectMessage = ({ sender, receiver, type, message, datetime }) => {
        const json = {
            sender,
            receiver,
            type,
            message,
            datetime,
        };
        $signallingSocket.emit("directMessage", JSON.stringify(json));
    };

    const requestDirectMessageReadProcess = ({ sender, receiver, datetime }) => {
        const json = {
            sender,
            receiver,
            datetime,
        };
        $signallingSocket.emit("directMessageReadProcess", JSON.stringify(json));
    };

    const requestJoinMeeting = ({ meetingSeq, roomID, uniqueRoomID }) => {
        const json = {
            meeting_seq: meetingSeq,
            deviceid: loginStore.m_local_deviceid,
            roomid: roomID,
            unique_roomid: uniqueRoomID, //추가
        };

        $signallingSocket.emit("joinMeeting", JSON.stringify(json));
    };

    const requestGetPreviousMessage = ({ receiver, prevMessageCount }) => {
        const json = {
            sender: loginStore.m_local_deviceid,
            receiver: receiver,
            datetime: getWorldTime(), // 현재 시간으로 부터 이전 메세지 가져오기
            count: prevMessageCount, // 이전 메세지 가져올 갯수
        };
        $signallingSocket.emit("getPreviousMessage", JSON.stringify(json));
    };

    const requestOpenMeetingChecking = (meetingSeq) => {
        const json = {
            meeting_seq: meetingSeq
        };
        $signallingSocket.emit("openMeetingChecking", JSON.stringify(json));
    }

    const requestMultiCalling = ({
        remoteDeviceId,
        roomID,
        currentRoomNumberCount,
        uniqueRoomID
    }) => {
        const json = {
            localdeviceid: loginStore.m_local_deviceid,
            remotedeviceid: remoteDeviceId,
            roomid: roomID,
            roomNumberCount: currentRoomNumberCount,
            meeting_seq: meetingStore.meetingSeq,
            unique_roomid: uniqueRoomID,
        };
        $signallingSocket.emit("multiCalling", JSON.stringify(json));
    };

    const requestMultiRefuseCalling = ({
        remoteDeviceId,
        roomID,
    }) => {
        const remoteInfo = userDataGetInfo(remoteDeviceId);
        const json = {
            localdeviceid: loginStore.m_local_deviceid,
            remotedeviceid: remoteDeviceId,
            roomid: roomID,
            institution: remoteInfo.enName,
            nickname: remoteInfo.nickName
        };
        $signallingSocket.emit("multiRefuseCalling", JSON.stringify(json));
    };

    const requestScreenSharing = () => {
        const json = {
            rfid: null,
            status: 0,
        };
        $signallingSocket.emit("screenSharing", JSON.stringify(json));
    }

    const requestForceLeave = (remoteDeviceId) => {
        const json = {
            localdeviceid: loginStore.m_local_deviceid,
            remotedeviceid: remoteDeviceId,
        };
        $signallingSocket.emit("forceLeave", JSON.stringify(json));
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
        requestOpenMeetingChecking,
        requestMultiCalling,
        requestMultiRefuseCalling,
        requestScreenSharing,
        requestForceLeave,
    };
}
