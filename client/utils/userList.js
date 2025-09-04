import { useCommonStore } from "@/stores";
import { useCallStore } from "@/stores/call";
import { useUserListStore } from "@/stores/userList";

// userListStore를 전역으로 선언하지 않고, 각 함수 내부에서 호출
// const userListStore = useUserListStore(); // 👈 이 줄을 제거

export const userListInit = () => {
    const userListStore = useUserListStore(); // ✨ 함수 호출 시점에 스토어 인스턴스 가져옴
    userListStore.init();
};

export const userListAdd = (userListData) => {
    const userListStore = useUserListStore(); // ✨
    userListData.forEach((user, i) => {
        userListStore.add({ idx: i, json: user });
    });
};

export const userListGetEmail = (email) => {
    const userListStore = useUserListStore(); // ✨
    const idx = userListStore.userListAll.email.indexOf(email);
    return idx !== -1 ? userListStore.userListAll.deviceid[idx] : -1;
};

export const userListGetIndex = (arg) => {
    const userListStore = useUserListStore(); // ✨
    if (typeof arg === "string") {
        return userListStore.userListAll.deviceid.indexOf(arg);
    }
    return arg;
};

export const userListGetInstitution = (arg) => {
    const userListStore = useUserListStore(); // ✨
    const idx = typeof arg === "number" ? arg : userListGetIndex(arg);
    return userListStore.userListAll.institution[idx];
};

export const userListGetHeadquarters = (arg) => {
    const userListStore = useUserListStore(); // ✨
    const idx = typeof arg === "number" ? arg : userListGetIndex(arg);
    return userListStore.userListAll.headquarters[idx];
};

export const userListGetBranch = (arg) => {
    const userListStore = useUserListStore(); // ✨
    const idx = typeof arg === "number" ? arg : userListGetIndex(arg);
    return userListStore.userListAll.branch[idx];
};

export const userListGetNickname = (deviceid) => {
    const userListStore = useUserListStore(); // ✨
    const idx = userListGetIndex(deviceid);
    return userListStore.userListAll.nickname[idx];
};

export const userListGetNicknameEN = (deviceid) => {
    const userListStore = useUserListStore(); // ✨
    const idx = userListGetIndex(deviceid);
    return userListStore.userListAll.en_nickname[idx];
};

export const userListGetDevicetype = (deviceid) => {
    const userListStore = useUserListStore(); // ✨
    const idx = userListGetIndex(deviceid);
    return userListStore.userListAll.devicetype[idx];
};

export const userListGetStatus = (deviceid) => {
    const userListStore = useUserListStore(); // ✨
    const idx = userListGetIndex(deviceid);
    return userListStore.userListAll.status[idx];
};

export const userListGetNewNotificationCount = (arg) => {
    const userListStore = useUserListStore(); // ✨
    const idx = typeof arg === "number" ? arg : userListGetIndex(arg);
    return userListStore.userListAll.new_notification_count[idx] ?? null;
};

export const userListSetNewNotificationCount = (deviceid, value) => {
    const userListStore = useUserListStore(); // ✨
    const idx = userListGetIndex(deviceid);
    if (userListStore.userListAll.new_notification_count[idx] != null) {
        if (value > 0) {
            userListStore.setNotification({ type: 1, index: idx });
        } else if (value < 0) {
            userListStore.setNotification({ type: 2, index: idx });
        } else {
            userListStore.setNotification({ type: 3, index: idx });
        }
    }
};

export const checkMainVideo = () => {
    const commonStore = useCommonStore(); // ✨
    const userListStatus = commonStore.userListStatus;
    if (userListStatus[userListStatus.length - 1]?.text === "") {
        for (const user of userListStatus) {
            if (user.hostIcon === true) {
                commonStore.setMainVideoStatus({
                    type: "",
                    text: user.text,
                    nickname: user.nickname,
                });
                break;
            }
        }
    }
};

export const findUserInfo = (deviceId) => {
    const callStore = useCallStore(); // ✨
    return callStore.userData.find((value) => value.deviceid === deviceId) || {};
};

// default export는 그대로 둠 (이 파일의 목적에 따라)
export default {
    userListInit,
    userListAdd,
    userListGetEmail,
    userListGetIndex,
    userListGetInstitution,
    userListGetHeadquarters,
    userListGetBranch,
    userListGetNickname,
    userListGetNicknameEN,
    userListGetDevicetype,
    userListGetStatus,
    userListGetNewNotificationCount,
    userListSetNewNotificationCount,
    checkMainVideo,
    findUserInfo,
};
