// stores/auth.ts (or login.ts, token.ts)
// eslint-disable-next-line camelcase
import { getManagerDomain } from "@/utils/common";
import { jwtDecode } from "jwt-decode";
import { defineStore } from "pinia";

export const useLoginStore = defineStore("login", {
    state: () => ({
        rfreshToken: "",
        loginType: 1,
        userSeq: null,
        sessionAuth: "",
        sessionID: "",
        sessionDeviceType: "",
        sessionEnSeq: "",
        sessionHqSeq: "",
        sessionBrSeq: "",
        sessionEmail: "",
        tokenResult: "", // 0: valid, 1: decode error, 2: invalid token from backend
        tokenDecodeResult: "", // 0: success, 1: decode error
        m_local_deviceid: "",
        lang: "ko",
        institution: "",
        headquarters: "",
        branch: "",
        nickname: "",
        userInfo: null, // Initialized as null or an empty object, not `this.UserInfo`
        langChange: "",
        powerManageLink: "",
        forcedLogout: "",
        forceLogoutUserId: "",
        // 로그인 결과 전역변수
        loginStatus: {
            Unauthorized: 0,
            Success: 1,
            Not_Registered: 2,
            Mqtt_decline: 3,
            Duplicate: 4,
            0: "Unauthorized",
            1: "Success",
            2: "Not_Registered",
            3: "Mqtt_decline",
            4: "Duplicate",
        },
    }),
    actions: {
        // JWT 토큰 유효한지 체크 (이전 mutation이었으나 Pinia에서 actions로 통합)
        setTokenResult(payload) {
            this.tokenResult = payload;
        },
        // 토큰 복호화 (이전 mutation이었으나 Pinia에서 actions로 통합)
        setTokenInfo(payload) {
            console.log("*** Pinia: decodeToken");
            try {
                // `this.UserInfo`는 state에 없으므로, `this.userInfo`로 변경하거나
                // 임시 변수로 사용 후 state.userInfo에 할당합니다.
                // const decodedUserInfo = jwtDecode(payload);
                console.log(payload);
                this.userInfo = payload; // Assuming userInfo in state stores the decoded object
                this.sessionAuth = payload.auth;
                this.sessionID = payload.id;
                this.sessionDeviceType = payload.device_type;
                this.sessionEnSeq = payload.en_seq;
                this.sessionHqSeq = payload.hq_seq;
                this.sessionBrSeq = payload.br_seq;
                this.sessionEmail = payload.email;
                this.userSeq = payload.user_seq;
                this.tokenDecodeResult = 0;
            } catch (e) {
                console.error("Failed to decode JWT token:", e);
                this.tokenDecodeResult = 1;
            }
        },
        setLoginType(payload) {
            this.loginType = payload;
            // console.log(payload);
            // // Renamed from `loginType` mutation for clarity in actions
            // let lang = this.lang;
            // if (!lang) {
            //     lang = "ko";
            // }

            // if (window.location.hostname === "localhost") {
            //     this.powerManageLink = process.env.loginPageLocal;
            // } else {
            //     const domain = window.location.hostname;
            //     if (domain === "kepco.watttalk.kr") {
            //         this.powerManageLink = process.env.kepcoLoginPage;
            //     } else if (
            //         domain === "dlenc.watttalk.kr" ||
            //         domain === "seoyoneh.watttalk.kr"
            //     ) {
            //         this.powerManageLink = "https://" + window.location.hostname + "/";
            //     } else {
            //         this.powerManageLink = process.env.loginPage;
            //     }
            // }

            // 로그인 시 UserInfo 등록
            if (payload.logintype == 1) {
                this.loginType = payload.logintype;
            } else if (payload.logintype == 2) {
                this.loginType = payload.logintype;
            } else if (payload.logintype == 3) {
                this.loginType = payload.logintype;
                sessionStorage.clear();
                location.href = getManagerDomain();
            }
        },
        setLang(payload) {
            this.lang = payload;
        },
        // Header UserInfo Save
        setLoginInfo(payload) {
            this.institution = payload.institution;
            this.headquarters = payload.headquarters;
            this.branch = payload.branch;
            this.nickname = payload.nickname;
            this.userInfo =
                payload.headquarters + " " + payload.branch + " " + payload.nickname;
        },
        setLangChange(payload) {
            // Renamed from `langChange` mutation for clarity
            this.langChange = payload;
        },
        setForcedLogout(payload) {
            // Renamed from `forcedLogout` mutation for clarity
            this.forcedLogout = payload;
        },
        setForceLogoutUserId(payload) {
            // Renamed from `forceLogoutUserId` mutation for clarity
            this.forceLogoutUserId = payload;
        },
        // async checkToken(payload) {
        //   const { axios } = useNuxtApp(); // ✅ 액션 내부에서 선언해야 작동함

        //   try {
        //     const result = await nuxtApp.$axios.post("/homeRest/tokenCheck", payload); // ✅ payload로 보낼 데이터 넘김

        //     if (result.data === false) {
        //       this.tokenResult = 2;
        //     } else {
        //       this.tokenResult = 0;
        //     }
        //   } catch (error) {
        //     console.error("토큰 체크 실패", error);
        //     this.tokenResult = 2;
        //     if (!process.env.renewal) {
        //       alert("PowerManage Backend Fail >> Token Valid Check Fail !");
        //     } else {
        //       location.href = "/empty";
        //     }
        //   }
        // },
    },
    persist: {
        storage: process.client ? sessionStorage : undefined,
    },
});
