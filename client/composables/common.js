import { useRoomStore } from "@/stores/room";
import { useCallStore } from "@/stores/call";

// userData 검색
export function userDataGetIndex(deviceId) {
    console.log(deviceId);
    const callStore = useCallStore();
    console.log("*** script: userDataGetIndex");
    for (let i = 0; i < callStore.userData.length; i++) {
        if (callStore.userData[i].deviceid == deviceId) {
            return i;
        }
    }
    return -1;
}

export function recentDataGetIndex(deviceId) {
    console.log(deviceId);
    const callStore = useCallStore();
    console.log("*** script: recentDataGetIndex");
    for (let i = 0; i < callStore.recentData.length; i++) {
        if (callStore.recentData[i].deviceid == deviceId) {
            return i;
        }
    }
    return -1;
}
export function updateStatusRecentUser(list, targetDeviceId, newStatus) {
    return list.map((node) => {
        if (node.deviceId === targetDeviceId) {
            return { ...node, status: newStatus }; // 상태만 바꿔서 새 객체 반환
        }
        return node;
    });
}

export function updateStatusByDeviceId(treeData, targetDeviceId, newStatus) {
    console.log(treeData, targetDeviceId, newStatus);
    function recursiveUpdate(nodes) {
        return nodes.map((node) => {
            // 자식이 없는 경우
            if (!node.children || node.children.length === 0) {
                if (node.deviceid === targetDeviceId) {
                    console.log("update 확인", node);
                    return { ...node, status: newStatus, checked: false }; // 상태만 바꿔서 새 객체 반환
                }
                return node; // 변경 없는 노드는 그대로 반환
            }
            // 자식이 있는 경우
            else {
                return {
                    ...node, // 부모 노드도 새 객체로 반환
                    children: recursiveUpdate(node.children), // 자식 재귀 업데이트
                    checked: false, // 필요시 체크 초기화
                };
            }
        });
    }

    // 최종 업데이트된 트리 반환
    const updatedTree = recursiveUpdate(treeData);

    return updatedTree;
}

export function updateStatusByChecked(treeData, targetDeviceId, newStatus) {
    console.log(treeData, targetDeviceId, newStatus);
    function recursiveUpdate(nodes) {
        return nodes.map((node) => {
            // 자식이 없는 경우
            if (!node.children || node.children.length === 0) {
                console.log(node.deviceId, targetDeviceId);
                if (node.deviceId === targetDeviceId) {
                    console.log("update 확인", node);
                    return { ...node, checked: newStatus }; // 상태만 바꿔서 새 객체 반환
                }
                return node; // 변경 없는 노드는 그대로 반환
            }
            // 자식이 있는 경우
            else {
                return {
                    ...node, // 부모 노드도 새 객체로 반환
                    children: recursiveUpdate(node.children), // 자식 재귀 업데이트
                    checked: false, // 필요시 체크 초기화
                };
            }
        });
    }

    // 최종 업데이트된 트리 반환
    const updatedTree = recursiveUpdate(treeData);

    return updatedTree;
}

export function userDataGetInfo(deviceId) {
    console.log(deviceId);
    const callStore = useCallStore();
    console.log("*** script: userDataGetInfo");
    for (let i = 0; i < callStore.userData.length; i++) {
        if (callStore.userData[i].deviceid == deviceId) {
            const res = {
                idx: i,
                nickName: callStore.userData[i].nickname,
                deviceId: callStore.userData[i].deviceid,
                deviceType: callStore.userData[i].devicetype,
                status: callStore.userData[i].status,
                connectingStatus: callStore.userData[i].connectingstatus,
                image: callStore.userData[i].image,
                email: callStore.userData[i].email,
                enNickname: callStore.userData[i].en_nickname,
                enName: callStore.userData[i].institution,
                hqName: callStore.userData[i].headquarters,
                brName: callStore.userData[i].branch,
            };
            console.log(res);
            return res;
        }
    }
    return -1;
}

export function customUserNickname(deviceid) {
    const remoteInfo = userDataGetInfo(deviceid);
    return remoteInfo.nickName;
}

export function leadZero(value) {
    const zeroWithValue = String(value).padStart(2, "0");
    return zeroWithValue;
}
// 이미지 파일명 (확장자 미포함) 생성
export function getImageFileName(filetype) {
    const utcDate = new Date();
    const year = utcDate.getFullYear();
    const month = leadZero(utcDate.getMonth() + 1);
    const date = leadZero(utcDate.getDate());
    const hour = leadZero(utcDate.getHours());
    const minutes = leadZero(utcDate.getMinutes());
    const seconds = leadZero(utcDate.getSeconds());
    const formatted = `watttalk_${year}${month}${date}${hour}${minutes}${seconds}.${filetype}`;
    return formatted;
}

let toastCount = 0;
export function commonToastMessage(string) {
    const toast = document.getElementById("toast_common_message");
    // const result = toast.classList.contains("reveal")

    // 이미 팝업이 떠있는 상태일 경우 예외처리
    // 이 함수가 실행될 때 count ++ 한다.
    toastCount++;
    // count ++ 한 값을 변수에 담는다.
    const currentCount = toastCount;

    toast.classList.add("reveal");
    toast.children[1].innerHTML = string;

    setTimeout(function () {
        // 변수에 담았던 수와, 현재 전역변수로 선언되어 있어서 함수 실행될 때마다 증가하는 toastCount가 같을 때만 실행한다.
        // 다르다면 새로운 메세지가 있기 때문이다.
        if (currentCount == toastCount) {
            toast.classList.remove("reveal");
        }
    }, 1000);
}

export function emergencyAlarmBell(type) {
    const audio = document.getElementById("emergency_alarm_bell");

    audio.currentTime = 0;
    if (type == "play") {
        audio.play();
        // console.log("*** script: " + audio.id + " messageBell - Play !!")
    } else {
        audio.pause();
        // console.log("*** script: " + audio.id + "  messageBell - Stop !!")
    }
}

export function getNickname(res) {
    const commonStore = useRoomStore();
    const userList = commonStore.userListStatus;
    let nickname;
    for (let iLoop = 0; iLoop < userList.length - 1; ++iLoop) {
        if (!userList[iLoop] || !userList[iLoop].text) continue;
        if (userList[iLoop].text == res) {
            if (userList[iLoop].nickname) {
                nickname = userList[iLoop].nickname;
            } else {
                nickname = userList[iLoop].text;
            }
            break;
        }
    }
    if (!nickname) {
        nickname = res;
    }
    return nickname;
}
