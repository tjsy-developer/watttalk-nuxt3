import { useNuxtApp, useRouter } from "nuxt/app";
import { useLoginStore } from "@/stores/login";
import { useCommonStore } from "@/stores";
import { useModalStore } from "@/stores/modal";

const statusCode = {
    Unauthorized: 0,
    Success: 1,
    Not_Registered: 2,
    Mqtt_decline: 3,
    Duplicate: 4,
};

export function useLoginEvents() {
    const { $signallingSocket } = useNuxtApp();
    const loginStore = useLoginStore();
    const commonStore = useCommonStore();
    const modalStore = useModalStore();
    const preferenceStore = useUserPreferenceStore();
    const router = useRouter();

    const loginRequest = (deviceId) => {
        if (!deviceId) return;
        const payload = {
            deviceid: deviceId,
            connectStatus: 0,
            language: preferenceStore.lang,
        };
        $signallingSocket.emit("login", JSON.stringify(payload));
        console.log("*** socket: emit login", payload);
    };

    const requestEnvironment = (deviceId) => {
        const json = {
            deviceid: deviceId,
            appname: "powertalkweb",
        };
        $signallingSocket.emit("environment", JSON.stringify(json));
        console.log("여기 로그찍어줘", json);
    };

    const handleLoginResponse = (response) => {
        const data = JSON.parse(response);
        console.log('login', data)
        const status = loginStore.loginStatus;

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

        if (data.errcode === status.Duplicate) {
            commonStore.setNoneOverlayAlertStatus(20);
            return;
        }

        // 정상 로그인 처리
        console.log("*** socket: login response success", data);
        loginStore.setLoginInfo({
            institution: data.institution,
            headquarters: data.headquarters,
            branch: data.branch,
            nickname: data.nickname,
        });

        // 유저 정보 요청
        requestLoginUserInfo(loginStore.m_local_deviceid);
        listenLoginUserInfo();
        requestEnvironment(loginStore.m_local_deviceid);
    };
    const requestLoginUserInfo = (loginId) => {
        const obj = {
            deviceid: loginId,
            language: preferenceStore.lang,
        };
        const json = JSON.stringify(obj);
        $signallingSocket.emit("loginUserInfo", json);
        console.log("*** socket: loginUserInfo request", json);
    }

    const listenLoginUserInfo = () => {
        $signallingSocket.on("loginUserInfo", (userInfoRes) => {
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


            const isInvited = sessionStorage.getItem("isInvited")
            if (isInvited == 'false') {
                router.push("/dashboard");
                modalStore.closeModal("noneOverlayModal");
            } else {
                router.push(
                    `/meetingRoom/memberMeetingOnOff?reservId=${loginStore.reservId}`,
                );
            }
        });
    }
    const listenLoginEvent = () => {
        $signallingSocket.on("login", handleLoginResponse);
    };

    const listenEviroment = () => {
        $signallingSocket.on("environment", (response) => {
            const json = JSON.parse(response);

            if (json.status == 0) {
                alert("환경설정 정보가 등록되지않았습니다")
                loginStore.setLoginType(3);
                return
            }

            let appJson = {}
            for (const key in json) {
                appJson = JSON.parse(json[key]);
                break;
            }

            function toBoolean(value) {
                return value.toLowerCase() === 'true';
            }
            preferenceStore.setEnviroment({
                useAutoPictureAccept: toBoolean(appJson.autoPictureAccept),
                useAutoDiscalling: toBoolean(appJson.autoDiscalling),
                useDirectCall: toBoolean(appJson.directCall),
                autoCallAcceptTime: appJson.autoCallAcceptTime,
                onlyVoiceCallId: appJson.onlyVoiceCallID.split(",") || [],
                videoRecording: appJson.useVideoRecording,
                roomNumber: appJson.roomNumber,
            });
            console.log("environment", json);
        });
    }

    const listenForceLogoutEvent = (localDeviceId) => {
        $signallingSocket.on("forceLogoutResult", function (response) {
            const json = JSON.parse(response);

            /* 1: 성공 - login시도 , 0: 실패 - 다른 기기 통화중 */
            if (json.status == 1) {
                loginRequest(localDeviceId);
            } else {
                // 다른기기 로그아웃 발생하는거 시켜야됨
                self.noneOverlayModal(22);
                setTimeout(() => {
                    loginStore.setLoginType(3);
                }, 3000);
            }
        });
    }


    return {
        loginRequest,
        listenLoginEvent,
        listenEviroment,
        listenForceLogoutEvent,
    };
}
