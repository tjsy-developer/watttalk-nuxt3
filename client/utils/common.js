import { useCommonStore } from "@/stores";
import { useCallStore } from "@/stores/call";
import { useChattingStore } from "@/stores/chatting";
import { useTokenStore } from "@/stores/token";
import { useNuxtApp } from "nuxt/app";
import _ from "lodash";
// 세계표준시간 UTC 값 계산
export function getWorldTime() {
    // 1. Get the current local date and time.
    const date = new Date();

    // 2. Get the timezone offset in minutes. (e.g., -540 for Korea)
    const timezoneOffsetMinutes = date.getTimezoneOffset();

    // 3. Convert the offset to milliseconds.
    const timezoneOffsetMilliseconds = timezoneOffsetMinutes * 60 * 1000;

    // 4. Subtract the offset to get the correct UTC time in milliseconds.
    //    date.getTime() - (-540 * 60 * 1000) = date.getTime() + (540 * 60 * 1000)
    const timestampUTC = (date.getTime() - timezoneOffsetMilliseconds) / 1000;

    // 5. Return the rounded UTC timestamp.
    return Math.round(timestampUTC);
}

export function buildTree(users) {
    const treeMap = new Map();
    users.forEach((user) => {
        const {
            headquarters,
            branch,
            nickname,
            en_nickname,
            devicetype,
            status,
            deviceid,
        } = user;

        // 1. Headquarters 노드 만들기
        if (!treeMap.has(headquarters)) {
            treeMap.set(headquarters, {
                name: headquarters,
                children: new Map(), // branch 저장용
            });
        }

        const headNode = treeMap.get(headquarters);

        // 2. Branch 노드 만들기
        if (!headNode.children.has(branch)) {
            headNode.children.set(branch, []);
        }

        const branchChildren = headNode.children.get(branch);

        // 3. 사용자 노드 추가
        if (devicetype !== 4)
            branchChildren.push({
                name: nickname,
                enName: en_nickname,
                children: [],
                deviceType: devicetype,
                status: status,
                deviceId: deviceid,
            });
    });

    // 4. 최종 트리 구조로 변환
    const result = [];
    for (const [headName, headNode] of treeMap.entries()) {
        const branchList = [];

        for (const [branchName, users] of headNode.children.entries()) {
            branchList.push({
                name: branchName,
                children: users,
            });
        }

        result.push({
            name: headName,
            children: branchList,
        });
    }

    return result;
}

export function updateLeafNodeStatus(data, targetIndex, newStatus) {
    let flatLeaves = [];

    // 재귀적으로 모든 리프 노드를 수집
    function collectLeaves(node) {
        if (node.children && node.children.length > 0) {
            node.children.forEach((child) => collectLeaves(child));
        } else {
            flatLeaves.push(node);
        }
    }

    // 루트 배열 순회
    data.forEach((root) => collectLeaves(root));

    // 인덱스에 해당하는 리프 노드의 status 변경
    if (flatLeaves[targetIndex]) {
        flatLeaves[targetIndex].status = newStatus;
    }
}

export function setCookie(name, value, expiredays) {
    const today = new Date();
    today.setDate(today.getDate() + expiredays);
    document.cookie = name + "=" + escape(value) + "; expires=" + today.toGMTString();
}

export function getCookie(cookieName) {
    let i;
    let x;
    let y;
    const ARRcookies = document.cookie.split(";");
    for (i = 0; i < ARRcookies.length; i++) {
        x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
        y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
        x = x.trim();

        if (x === cookieName) {
            return unescape(y);
        }
    }
}

export function deleteCookie(name, value, expiredays) {
    const today = new Date();
    document.cookie = name + "=" + escape(value) + "; expires=" + today.toGMTString();
}

export function callingBell(type) {
    const audio = document.getElementById("calling_bell");
    audio.currentTime = 0;
    if (type == "play") {
        console.log("*** script: calling Bell Play");
        audio.play();
    } else {
        console.log("*** script: calling Bell Stop");
        audio.pause();
    }
}
export function messageBell(state, type) {
    let audio = "";
    if (state > 0) {
        audio = document.getElementById("normal_message_bell");
    } else {
        audio = document.getElementById("emergency_message_bell");
    }

    audio.currentTime = 0;
    if (type == "play") {
        audio.play();
    } else {
        audio.pause();
    }
}

export function dircetMessageBell(type) {
    const audio = document.getElementById("direct_message_bell");

    audio.currentTime = 0;
    if (type == "play") {
        audio.play();
    } else {
        audio.pause();
    }
}

export function fileReceiveMessageBell(type) {
    const audio = document.getElementById("fileReceive_message_bell");

    audio.currentTime = 0;
    if (type == "play") {
        audio.play();
    } else {
        audio.pause();
    }
}

export function emergencyAlarmBell(type) {
    const audio = document.getElementById("emergency_alarm_bell");

    audio.currentTime = 0;
    if (type == "play") {
        audio.play();
    } else {
        audio.pause();
    }
}

export function leadingZeros(n, digits) {
    let zero = "";
    let str = n.toString();
    if (str.length < digits) {
        zero = "0".repeat(digits - str.length);
    }
    return zero + str;
}

// 통화 중 채팅창 관련 - 타임존 출력하기 (type string)
export function getChattingTimeZone(standard) {
    const now = new Date(Number(standard) * 1000);

    const strDatetime =
        leadingZeros(now.getHours(), 2) +
        ":" +
        leadingZeros(now.getMinutes(), 2) +
        ":" +
        leadingZeros(now.getSeconds(), 2);
    console.log(strDatetime);
    return strDatetime;
}
// 모션 알람 전용 Timezon 생성
export function getMotionTimeZone(standard, country) {
    // const tz = standard + country * 3600
    // const now = new Date(tz * 1000)

    // let x = new Date().getTimezoneOffset() / 60 // UTC - GMT = x (대한민국 기준 x = -9)		주어가 UTC 이기 때문에 -9 라고 나옴
    // x = x * 60 * 60 * -1 // (시 * 분 * 초)	음수는 양수로, 양수는 음수로
    const now = new Date(Number(standard) * 1000);
    // const now = new Date((standard + x) * 1000)

    const strDatetime =
        leadingZeros(now.getFullYear(), 4) +
        "/" +
        leadingZeros(now.getMonth() + 1, 2) +
        "/" +
        leadingZeros(now.getDate(), 2) +
        " " +
        leadingZeros(now.getHours(), 2) +
        ":" +
        leadingZeros(now.getMinutes(), 2) +
        ":" +
        leadingZeros(now.getSeconds(), 2);
    return strDatetime;
}

export function videoResize() {
    const commonStore = useCommonStore();
    const callStore = useCallStore();

    const videoMainDivWrap = document.getElementsByClassName("videoMainDivWrap")[0];
    const videoMainDiv = document.getElementById("videoMainDiv");
    const otherBackground = document.getElementsByClassName("otherBackground")[0];

    // if (
    //     videoMainDivWrap &&
    //     commonStore.callingLayoutType !== 1 &&
    //     callStore.drawingIframe === false
    // ) {
    //     videoMainDivWrap.style.width = "100%";
    //     const testVal = (videoMainDivWrap.clientWidth / 16) * 9;
    //     if (testVal > videoMainDivWrap.clientHeight) {
    //         const calcWidth = (videoMainDivWrap.clientHeight / 9) * 16;
    //         videoMainDiv.style.width = `${calcWidth}px`;
    //         if (otherBackground) otherBackground.style.width = `${calcWidth}px`;
    //     } else {
    //         videoMainDiv.style.width = `100%`;
    //         if (otherBackground) otherBackground.style.width = "100%";
    //     }
    //     return;
    // } else if (videoMainDiv) {
    //     videoMainDiv.style.width = `100%`;
    //     if (otherBackground) otherBackground.style.width = "100%";
    // }
}

export async function handleFileDownload(url, filename) {
    if (url.startsWith("blob:")) {
        const anchorElement = document.createElement("a");
        anchorElement.download = filename;
        anchorElement.href = url;
        anchorElement.click();
        setTimeout(() => {
            document.body.removeChild(anchorElement);
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
}

export function escapeFullScreen() {
    // document.exitFullscreen();
}

export function getPersonnelInRoom() {
    const commonStore = useCommonStore();
    const chattingStore = useChattingStore();
    const personnelInRoomCalc = commonStore.userListStatus.filter((element) => {
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
    chattingStore.setPersonnelInRoom(personnelInRoomCalc.length);
}

export function setRemoveDuplicates(objToChange) {
    let parentObjToRender = _.cloneDeep(JSON.parse(objToChange));
    // console.log(parentObjToRender)
    const objToRender = parentObjToRender.objects.filter((word, index, arr) => {
        return (
            parentObjToRender.objects.length - 1 == index ||
            (arr[index + 1] &&
                arr[index + 1].type !== "triangle" &&
                word.type !== "triangle")
        );
    });
    parentObjToRender.objects = objToRender;
    // console.log(JSON.stringify(parentObjToRender))
    return JSON.stringify(parentObjToRender);
}

export async function convertImageToBlob(src) {
    const tokenStore = useTokenStore();
    if (!src) return "";
    try {
        // fetch-plugin.js에서 이미 jwt 토큰을 헤더에 추가하므로 URL에 토큰을 추가할 필요가 없습니다.
        const response = await $fetch.raw(src + "?token=" + tokenStore.accessToken, {
            // .raw()를 사용하여 response 객체 전체를 받습니다.
            method: "GET",
            responseType: "blob", // ✅ 바이너리 데이터를 Blob으로 받도록 설정
            timeout: 4000,
        });
        console.log(response);
        if (response.status === 200) {
            const blob = response._data; // ✅ `ofetch`는 바이너리 데이터를 `_data` 속성에 담습니다.
            return URL.createObjectURL(blob);
        }

        return "";
    } catch (err) {
        console.error("이미지 변환 중 오류 발생:", err);
        return "";
    }
}

export function getDirectMessageTimeZone(standard) {
    // let x = new Date().getTimezoneOffset() / 60 // UTC - GMT = x (대한민국 기준 x = -9)		주어가 UTC 이기 때문에 -9 라고 나옴
    // x = x * 60 * 60 * -1 // (시 * 분 * 초)	음수는 양수로, 양수는 음수로

    // const now = new Date((standard + x) * 1000)
    const now = new Date(Number(standard) * 1000);

    const strDatetime =
        leadingZeros(now.getMonth() + 1, 2) +
        "/" +
        leadingZeros(now.getDate(), 2) +
        "　" +
        leadingZeros(now.getHours(), 2) +
        ":" +
        leadingZeros(now.getMinutes(), 2);
    return strDatetime;
}

export function getFeedsDisplay(type, content) {
    const feedsDisplay = content.split("#");
    if (type == "display") {
        return feedsDisplay[0];
    } else {
        return feedsDisplay[1];
    }
}

export const getFormattedDate = (timestamp, format = "yyyy-mm-dd") => {
    if (String(timestamp).length === 10) {
        timestamp *= 1000;
    }
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hour = String(date.getHours()).padStart(2, "0");
    const minute = String(date.getMinutes()).padStart(2, "0");
    const second = String(date.getSeconds()).padStart(2, "0");

    return format
        .replace(/yyyy/, String(year))
        .replace(/mm/, month)
        .replace(/dd/, day)
        .replace(/hh/, hour)
        .replace(/MM/, minute)
        .replace(/ss/, second);
};

export const getManagerDomain = () => {
    return useRuntimeConfig()?.public.NUXT_PUBLIC_MANAGER_DOMAIN || window.location.origin
}

export default {
    getWorldTime,
    buildTree,
    updateLeafNodeStatus,
    setCookie,
    getCookie,
    deleteCookie,
    getChattingTimeZone,
    videoResize,
    getDirectMessageTimeZone,
    dircetMessageBell,
    getFeedsDisplay,
    fileReceiveMessageBell,
    emergencyAlarmBell,
    getFormattedDate,
    getManagerDomain,
};
