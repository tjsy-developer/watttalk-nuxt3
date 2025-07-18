// plugins/commonFuncs.client.js
import { defineNuxtPlugin } from "#app";
// import { axiosRequest } from "@/utils/axiosRequest"; // 경로 맞게 수정
import { useCallStore } from "@/stores/call";
import { useLoginStore } from "@/stores/login";
import { useChattingStore } from "@/stores/chatting";

export default defineNuxtPlugin((nuxtApp) => {
    const callStore = useCallStore();
    const loginStore = useLoginStore();
    const chattingStore = useChattingStore()
    const commonFuncs = {
        decodeToken(jwtToken) {
            loginStore.decodeToken({ jwt_token: jwtToken });
        },
        setLang(lang) {
            sessionStorage.setItem("languageCode", lang);
            loginStore.setLang(lang);
            if (nuxtApp.vueApp.config.globalProperties.$i18n) {
                nuxtApp.vueApp.config.globalProperties.$i18n.locale = lang;
            }
        },
        getWorldTime() {
            const now = new Date();
            const standard = now.getTime() / 1000;
            return Math.round(standard).toString();
        },
        leadingZeros(n, digits) {
            let zero = "";
            let str = n.toString();
            if (str.length < digits) {
                zero = "0".repeat(digits - str.length);
            }
            return zero + str;
        },
        getTimeZone(standard) {
            const now = new Date(Number(standard) * 1000);
            const strDatetime =
                this.leadingZeros(now.getFullYear(), 4) +
                "-" +
                this.leadingZeros(now.getMonth() + 1, 2) +
                "-" +
                this.leadingZeros(now.getDate(), 2) +
                " " +
                this.leadingZeros(now.getHours(), 2) +
                ":" +
                this.leadingZeros(now.getMinutes(), 2) +
                ":" +
                this.leadingZeros(now.getSeconds(), 2);
            return strDatetime;
        },
        getMotionTimeZone(standard) {
            const now = new Date(Number(standard) * 1000);
            const strDatetime =
                this.leadingZeros(now.getFullYear(), 4) +
                "/" +
                this.leadingZeros(now.getMonth() + 1, 2) +
                "/" +
                this.leadingZeros(now.getDate(), 2) +
                " " +
                this.leadingZeros(now.getHours(), 2) +
                ":" +
                this.leadingZeros(now.getMinutes(), 2) +
                ":" +
                this.leadingZeros(now.getSeconds(), 2);
            return strDatetime;
        },
        setPowerManageLink(hostName) {
            if (hostName === "localhost") {
                return "http://localhost:8223/";
            } else {
                const domain = window.location.hostname;
                if (
                    domain === "kepco.watttalk.kr" ||
                    domain === "dlenc.watttalk.kr" ||
                    domain === "seoyoneh.watttalk.kr"
                ) {
                    return (
                        "https://" +
                        window.location.hostname +
                        this.getPortNumber(process.env.loginPage || "")
                    );
                } else {
                    return process.env.loginPage || "";
                }
            }
        },
        setMediaServer(hostName) {
            return hostName === "localhost"
                ? process.env.serverIP_local || ""
                : process.env.serverIP || "";
        },
        getChattingTimeZone(standard) {
            const now = new Date(Number(standard) * 1000);
            const strDatetime =
                this.leadingZeros(now.getHours(), 2) +
                ":" +
                this.leadingZeros(now.getMinutes(), 2) +
                ":" +
                this.leadingZeros(now.getSeconds(), 2);
            return strDatetime;
        },
        getDirectMessageTimeZone(standard) {
            const now = new Date(Number(standard) * 1000);
            const strDatetime =
                this.leadingZeros(now.getMonth() + 1, 2) +
                "/" +
                this.leadingZeros(now.getDate(), 2) +
                "　" +
                this.leadingZeros(now.getHours(), 2) +
                ":" +
                this.leadingZeros(now.getMinutes(), 2);
            return strDatetime;
        },
        setRecentData(pushData) {
            callStore.setRecentData(pushData || []);
        },
        setRecentDataAll(pushData) {
            callStore.setRecentDataAll(pushData || []);
        },
        pushRecentData(pushData) {
            callStore.pushRecentData(pushData);
        },
        setUserData(pushData) {
            callStore.setUserData(pushData || []);
        },
        setUserDataAll(pushData) {
            callStore.setUserDataAll(pushData || []);
        },
        pushUserData(pushData) {
            callStore.pushUserData(pushData);
        },
        getFeedsDisplay(type, content) {
            const feedsDisplay = content.split("#");
            return type === "display" ? feedsDisplay[0] : feedsDisplay[1];
        },
        getPersonnelInRoom() {
            const personnelInRoomCalc = store.state.userListStatus.filter((element) => {
                return ![
                    "none",
                    "main",
                    "sending",
                    "receive",
                    "error",
                    "fail",
                    "connecting",
                ].includes(element.status);
            });
            cahttingStore.setPersonnelInRoom(personnelInRoomCalc.length);
        },
        callingBell(type) {
            const audio = document.getElementById("calling_bell");
            if (!audio) return;
            audio.currentTime = 0;
            if (type === "play") {
                audio.play();
            } else {
                audio.pause();
            }
        },
        messageBell(state, type) {
            let audio = null;
            if (state > 0) {
                audio = document.getElementById("normal_message_bell");
            } else {
                audio = document.getElementById("emergency_message_bell");
            }
            if (!audio) return;
            audio.currentTime = 0;
            if (type === "play") audio.play();
            else audio.pause();
        },
        dircetMessageBell(type) {
            const audio = document.getElementById("direct_message_bell");
            if (!audio) return;
            audio.currentTime = 0;
            if (type === "play") audio.play();
            else audio.pause();
        },
        fileReceiveMessageBell(type) {
            const audio = document.getElementById("fileReceive_message_bell");
            if (!audio) return;
            audio.currentTime = 0;
            if (type === "play") audio.play();
            else audio.pause();
        },
        emergencyAlarmBell(type) {
            const audio = document.getElementById("emergency_alarm_bell");
            if (!audio) return;
            audio.currentTime = 0;
            if (type === "play") audio.play();
            else audio.pause();
        },
        userDataGetIndex(deviceid) {
            const userData = store.state.call.userData;
            for (let i = 0; i < userData.length; i++) {
                if (userData[i].deviceid === deviceid) {
                    return i;
                }
            }
            return -1;
        },
        recentDataGetIndex(deviceid) {
            for (let i = 0; i < store.state.call.recentData.length; i++) {
                if (store.state.call.recentData[i].deviceid == deviceid) {
                    return i;
                }
            }
            return -1;
        },
        visibleToastMessage(string) {
            const toast = document.getElementById("toast");
            toast.classList.add("reveal");
            toast.children[1].innerHTML = string;

            setTimeout(() => {
                toast.classList.remove("reveal");
            }, 10000);
        },
        signallingToastMessage(string) {
            const toast = document.getElementById("toast_signalling");
            toast.classList.add("reveal");
            toast.children[1].innerHTML = string;

            setTimeout(() => {
                toast.classList.remove("reveal");
            }, 10000);
        },
        commonToastMessage(string) {
            if (typeof this.toastCount === "undefined") {
                this.toastCount = 0;
            }
            this.toastCount++;
            const currentCount = this.toastCount;

            const toast = document.getElementById("toast_common_message");
            toast.classList.add("reveal");
            toast.children[1].innerHTML = string;

            setTimeout(() => {
                if (currentCount === this.toastCount) {
                    toast.classList.remove("reveal");
                }
            }, 3000);
        },
        setCookie(name, value, expiredays) {
            const today = new Date();
            today.setDate(today.getDate() + expiredays);
            document.cookie =
                name + "=" + escape(value) + "; expires=" + today.toGMTString();
        },
        getCookie(cookieName) {
            const ARRcookies = document.cookie.split(";");
            for (let i = 0; i < ARRcookies.length; i++) {
                let x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("=")).trim();
                let y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
                if (x === cookieName) {
                    return unescape(y);
                }
            }
            return null;
        },
        deleteCookie(name) {
            const today = new Date(0); // 유효기간을 과거로 설정하여 삭제
            document.cookie = name + "=; expires=" + today.toGMTString();
        },
        customUserNickname(deviceid) {
            const currentLang = sessionStorage.getItem("languageCode");
            let nickname = "";
            if (currentLang === "ko" || currentLang === null) {
                nickname = this.userListGetNickname(deviceid);
            } else if (currentLang === "en") {
                nickname = this.userListGetNicknameEN(deviceid);
            }
            return nickname;
        },
        leadZero(value) {
            return String(value).padStart(2, "0");
        },
        getImageFileName(filetype) {
            const utcDate = new Date();
            const year = utcDate.getFullYear();
            const month = this.leadZero(utcDate.getMonth() + 1);
            const date = this.leadZero(utcDate.getDate());
            const hour = this.leadZero(utcDate.getHours());
            const minutes = this.leadZero(utcDate.getMinutes());
            const seconds = this.leadZero(utcDate.getSeconds());
            return `watttalk_${year}${month}${date}${hour}${minutes}${seconds}.${filetype}`;
        },
        setRemoveDuplicates(objToChange) {
            const parentObjToRender = JSON.parse(JSON.stringify(objToChange));
            const objToRender = parentObjToRender.objects.filter((word, index, arr) => {
                return (
                    parentObjToRender.objects.length - 1 === index ||
                    (arr[index + 1] &&
                        arr[index + 1].type !== "triangle" &&
                        word.type !== "triangle")
                );
            });
            parentObjToRender.objects = objToRender;
            return JSON.stringify(parentObjToRender);
        },
        videoResize() {
            const videoMainDivWrap =
                document.getElementsByClassName("videoMainDivWrap")[0];
            const videoMainDiv = document.getElementById("videoMainDiv");
            const otherBackground = document.getElementsByClassName("otherBackground")[0];

            if (
                videoMainDivWrap &&
                store.state.callingLayoutType !== 1 &&
                store.state.call.drawingIframe === false
            ) {
                videoMainDivWrap.style.width = "100%";
                const testVal = (videoMainDivWrap.clientWidth / 16) * 9;
                if (testVal > videoMainDivWrap.clientHeight) {
                    const calcWidth = (videoMainDivWrap.clientHeight / 9) * 16;
                    videoMainDiv.style.width = `${calcWidth}px`;
                    if (otherBackground) otherBackground.style.width = `${calcWidth}px`;
                } else {
                    videoMainDiv.style.width = `100%`;
                    if (otherBackground) otherBackground.style.width = "100%";
                }
                return;
            } else if (videoMainDiv) {
                videoMainDiv.style.width = `100%`;
                if (otherBackground) otherBackground.style.width = "100%";
            }
        },
        async handleFileDownload(url, filename) {
            if (url.startsWith("blob:")) {
                const anchorElement = document.createElement("a");
                anchorElement.download = filename;
                anchorElement.href = url;
                anchorElement.click();
                setTimeout(() => {
                    window.URL.revokeObjectURL(url);
                }, 100);
            } else {
                const response = await fetch(url);
                const file = await response.blob();
                const downloadUrl = window.URL.createObjectURL(file);

                const anchorElement = document.createElement("a");
                document.body.appendChild(anchorElement);
                anchorElement.download = filename;
                anchorElement.href = downloadUrl;
                anchorElement.click();

                setTimeout(() => {
                    document.body.removeChild(anchorElement);
                    window.URL.revokeObjectURL(downloadUrl);
                }, 100);
            }
        },
        sleep(ms) {
            return new Promise((resolve) => setTimeout(resolve, ms));
        },
        getPortNumber(url) {
            const semiCount = (url.match(/:/g) || []).length;
            if (semiCount > 1) {
                const _port = url.lastIndexOf(":");
                return url.substring(_port);
            }
            return "/";
        },
        getNickname(res) {
            const userList = store.state.userListStatus;
            let nickname;
            for (let i = 0; i < userList.length; i++) {
                if (userList[i].text === res) {
                    nickname = userList[i].nickname || userList[i].text;
                    break;
                }
            }
            return nickname || res;
        },
        setManagerLoginTime() {
            const cookieName = sessionStorage.getItem("id") + "ManagerLoginTime";
            this.deleteCookie(cookieName);
            const managerLoginTime = Math.floor(Date.now() / 1000);
            this.setCookie(cookieName, managerLoginTime, 1);
        },
        checkLoginTime() {
            const currentTime = Math.floor(Date.now() / 1000);
            const cookieName = sessionStorage.getItem("id") + "ManagerLoginTime";
            const loginTime = this.getCookie(cookieName);
            const logOutTime = this.getCookie("forceLogout") || 8;
            const unix24Hour = Number(logOutTime) * 60 * 60;
            if (currentTime > Number(loginTime) + unix24Hour) {
                this.deleteCookie(cookieName);
                this.setCookie(cookieName, "logout", 1);
                loginStore.loginType({ logintype: 3 });
            }
        },
        async convertImageToBlob(src) {
            // if (!src) return "";
            // try {
            //     const params = {
            //         responseType: "blob",
            //         api: src + `?token=${sessionStorage.getItem("jwt")}`,
            //     };
            //     const result = await axiosRequest("get", params);
            //     if (result.status === 200) {
            //         return URL.createObjectURL(result.data);
            //     }
            //     return "";
            // } catch (err) {
            //     return "";
          // }
          return ""
        },
        escapeFullScreen() {
            document.exitFullscreen();
        },
        getSecureRandomValue() {
            const array = new Uint32Array(1);
            window.crypto.getRandomValues(array);
            return array[0] / (0xffffffff + 1);
        },
    };

    // nuxtApp.vueApp.config.globalProperties 에 $commonFuncs 로 등록
    nuxtApp.vueApp.config.globalProperties.$commonFuncs = commonFuncs;
});
