import { useNuxtApp, useRouter } from "nuxt/app";
import { useAuthStore } from "@/stores/login";

const statusCode = {
    Unauthorized: 0,
    Success: 1,
    Not_Registered: 2,
    Mqtt_decline: 3,
    Duplicate: 4,
};

export function useLoginEvents() {
    const { $signallingSocket } = useNuxtApp();
    const loginStore = useAuthStore();
    const preferenceStore = useUserPreferenceStore();
    const router = useRouter();

    const loginRequest = (deviceId) => {
        const payload = {
            deviceid: deviceId,
            connectStatus: 0,
            language: preferenceStore.lang,
        };
        $signallingSocket.emit("login", JSON.stringify(payload));
        console.log("*** socket: emit login", payload);
    };

    const handleLoginResponse = (response) => {
        const data = JSON.parse(response);

        const status = loginStore.loginStatus;

        if (data.errcode === statusCode.Unauthorized) {
            alert("loginStatus Unauthorized");
            loginStore.loginType(3);
            return;
        }

        if (data.errcode === statusCode.Not_Registered) {
            alert("loginStatus NoneRegister");
            loginStore.loginType(3);
            return;
        }

        if (data.errcode === status.Duplicate) {
            // noneOverlayModal(20);
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

            if (!loginStore.isInvited) {
                router.push("/dashboard");
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
                    loginStore.loginType(3);
                }, 3000);
            }
        });
    }


    return {
        loginRequest,
        listenLoginEvent,
        listenForceLogoutEvent,
    };
}
