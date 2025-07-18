// 세계표준시간 UTC 값 계산
export function getWorldTime() {
    const date = new Date();
    // 거주 지역이 UTC와 어느 정도 차이 나는지 알아낸다.
    let x = date.getTimezoneOffset() / 60; // UTC - GMT = x (대한민국 기준 x = -9)		주어가 UTC 이기 때문에 -9 라고 나옴
    x = x * 60 * 60 * 1000; // (시 * 분 * 초 * 밀리초)

    // UTC 값을 timestemp 로 만든다.
    const timestampUTC = (date.getTime() + x) / 1000; // 밀리초를 초 형식으로 변환

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
        x = x.replace(/^\s+|\s+$/g, "");

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
};
