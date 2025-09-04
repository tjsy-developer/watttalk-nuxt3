import { useNuxtApp, useRouter } from "nuxt/app";
import { useLoginStore } from "@/stores/login";
import { useCommonStore } from "@/stores";
import { useModalStore } from "@/stores/modal";
import { useSignallingSocket } from "./useSignallingSocket";
import { tryOnScopeDispose } from "@vueuse/core";
import { jwtDecode } from "jwt-decode";

const statusCode = {
    Unauthorized: 0,
    Success: 1,
    Not_Registered: 2,
    Mqtt_decline: 3,
    Duplicate: 4,
};

export function useLoginEvents() {
    const { signallingSocket } = useSignallingSocket();
    const loginStore = useLoginStore();
    const commonStore = useCommonStore();
    const modalStore = useModalStore();
    const preferenceStore = useUserPreferenceStore();
    const router = useRouter();

    // -------------------------
    // 1) 핸들러 정의
    // -------------------------
    const handleLoginResponse =async (response) => {
        const data = JSON.parse(response);
        console.log("login", data);

        if (data.errcode === statusCode.Unauthorized) {
            alert("loginStatus Unauthorized");
            loginStore.setLoginType(3);
            return;
        }
        if (data.errcode === statusCode.Not_Registered) {
            alert("loginStatus NoneRegister");
            loginStore.setLoginType(3);
            return;
        }
        if (data.errcode === statusCode.Duplicate) {
            alert(loginStore.m_local_deviceid);
            commonStore.setNoneOverlayAlertStatus(20);
            return;
        }

        loginStore.setLoginInfo({
            institution: data.institution,
            headquarters: data.headquarters,
            branch: data.branch,
            nickname: data.nickname,
        });

        requestLoginUserInfo(loginStore.m_local_deviceid);
        requestEnvironment(loginStore.m_local_deviceid);
    };

    const handleLoginUserInfo = (userInfoRes) => {
        const userInfo = JSON.parse(userInfoRes);
        console.log("*** socket: loginUserInfo response", userInfo);

        loginStore.setLoginInfo({
            institution: userInfo.institution,
            headquarters: userInfo.headquarters,
            branch: userInfo.branch,
            nickname: userInfo.nickname,
        });

        sessionStorage.setItem("m_institution", userInfo.institution);
        sessionStorage.setItem("m_headquarters", userInfo.headquarters);
        sessionStorage.setItem("m_branch", userInfo.branch);
        sessionStorage.setItem("m_nickname", userInfo.nickname);

        const isInvited = sessionStorage.getItem("isInvited");
        if (isInvited == "false") {
            router.push("/dashboard");
            modalStore.closeModal("noneOverlayModal");
        } else {
            router.push(
                `/meetingRoom/memberMeetingOnOff?reservId=${loginStore.reservId}`,
            );
        }
    };

    const handleEnvironment = (response) => {
        const json = JSON.parse(response);
        if (json.status == 0) {
            alert("환경설정 정보가 등록되지않았습니다");
            loginStore.setLoginType(3);
            return;
        }

        let appJson = {};
        for (const key in json) {
            appJson = JSON.parse(json[key]);
            break;
        }

        function convertStringBooleansExtended(obj) {
            const result = {};
            for (const key in obj) {
                const val = obj[key];
                if (val === "True" || val === "1") result[key] = true;
                else if (val === "False" || val === "0") result[key] = false;
                else result[key] = val;
            }
            return result;
        }

        const transAppInfo = convertStringBooleansExtended(appJson);
        console.log("*** enviroment", transAppInfo);
        preferenceStore.setEnviroment({
            useAutoPictureAccept: transAppInfo.autoPictureAccept,
            useAutoDiscalling: transAppInfo.autoDiscalling,
            useDirectCall: transAppInfo.directCall,
            autoCallAcceptTime: transAppInfo.autoCallAcceptTime,
            onlyVoiceCallId: transAppInfo.onlyVoiceCallID.split(",") || [],
            videoRecording: transAppInfo.useVideoRecording,
            roomNumber: transAppInfo.roomNumber,
        });
    };

    const handleForceLogoutResult = (response) => {
        const json = JSON.parse(response);
        if (json.status == 1) {
            loginRequest(loginStore.m_local_deviceid);
        } else {
            modalStore.closeModal("noneOverlayModal");
            setTimeout(() => loginStore.setLoginType(3), 3000);
        }
    };

    // -------------------------
    // 2) 이벤트 등록
    // -------------------------
    const listenLoginEvent = () => {
        signallingSocket.on("login", handleLoginResponse);
        signallingSocket.on("loginUserInfo", handleLoginUserInfo);
        signallingSocket.on("environment", handleEnvironment);
        signallingSocket.on("forceLogoutResult", handleForceLogoutResult);

        // onUnmounted 시 이벤트 해제
        tryOnScopeDispose(() => {
            signallingSocket.off("login", handleLoginResponse);
            signallingSocket.off("loginUserInfo", handleLoginUserInfo);
            signallingSocket.off("environment", handleEnvironment);
            signallingSocket.off("forceLogoutResult", handleForceLogoutResult);
        });
    };

    // -------------------------
    // 3) emit 함수
    // -------------------------
    const loginRequest = (deviceId) => {
        if (!deviceId) return;
        const payload = {
            deviceid: deviceId,
            connectStatus: 0,
            language: preferenceStore.lang,
        };
        signallingSocket.emit("login", JSON.stringify(payload));
        console.log("*** socket: emit login", payload);
    };

    const requestLoginUserInfo = (loginId) => {
        const obj = {
            deviceid: loginId,
            language: preferenceStore.lang,
        };
        signallingSocket.emit("loginUserInfo", JSON.stringify(obj));
    };

    const requestEnvironment = (deviceId) => {
        const json = {
            deviceid: deviceId,
            appname: "powertalkweb",
        };
        signallingSocket.emit("environment", JSON.stringify(json));
    };

    return {
        loginRequest,
        listenLoginEvent,
        requestLoginUserInfo,
        requestEnvironment,
    };
}
