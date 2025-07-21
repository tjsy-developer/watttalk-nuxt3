// composables/useUserList.js
import { useUserListStore } from '@/stores/userList';

export function useUserList() {
  const userListStore = useUserListStore();

  // 유저 리스트 초기화
  function userListInit() {
    userListStore.initialize();
  }

  // 유저 리스트 추가
  function userListAdd(userListData) {
    userListStore.addUser(userListData);
  }

  // 이메일로 deviceid 가져오기
  function userListGetEmail(email) {
    const idx = userListStore.userListAll.email.indexOf(email);
    if (idx !== -1) {
      return userListStore.userListAll.deviceid[idx];
    } else {
      return -1;
    }
  }

  // deviceid로 인덱스 가져오기
  function userListGetIndex(identifier) {
    if (typeof identifier === "string") {
      return userListStore.userListAll.deviceid.indexOf(identifier);
    } else if (typeof identifier === "number") {
      return identifier;
    }
  }

  // 기관 이름 가져오기
  function userListGetInstitution(identifier) {
    if (typeof identifier === "number") {
      return userListStore.userListAll.institution[identifier];
    } else if (typeof identifier === "string") {
      const idx = userListGetIndex(identifier);
      return userListStore.userListAll.institution[idx];
    }
  }

  // 본사 이름 가져오기
  function userListGetHeadquarters(identifier) {
    if (typeof identifier === "number") {
      return userListStore.userListAll.headquarters[identifier];
    } else if (typeof identifier === "string") {
      const idx = userListGetIndex(identifier);
      return userListStore.userListAll.headquarters[idx];
    }
  }

  // 지점 이름 가져오기
  function userListGetBranch(identifier) {
    if (typeof identifier === "number") {
      return userListStore.userListAll.branch[identifier];
    } else if (typeof identifier === "string") {
      const idx = userListGetIndex(identifier);
      return userListStore.userListAll.branch[idx];
    }
  }

  // 닉네임 가져오기
  function userListGetNickname(deviceid) {
    const idx = userListGetIndex(deviceid);
    return userListStore.userListAll.nickname[idx];
  }

  // 영어 닉네임 가져오기
  function userListGetNicknameEN(deviceid) {
    const idx = userListGetIndex(deviceid);
    return userListStore.userListAll.en_nickname[idx];
  }

  // 디바이스 타입 가져오기
  function userListGetDevicetype(deviceid) {
    const idx = userListGetIndex(deviceid);
    return userListStore.userListAll.devicetype[idx];
  }

  // 상태 가져오기
  function userListGetStatus(deviceid) {
    const idx = userListGetIndex(deviceid);
    return userListStore.userListAll.status[idx];
  }

  // 새 알림 갯수 가져오기
  function userListGetNewNotificationCount(identifier) {
    if (typeof identifier === "number") {
      return userListStore.userListAll.new_notification_count[identifier];
    } else if (typeof identifier === "string") {
      const idx = userListGetIndex(identifier);
      return userListStore.userListAll.new_notification_count[idx];
    } else {
      return null;
    }
  }

  // 새 알림 갯수 설정하기
  function userListSetNewNotificationCount(identifier, count) {
    const idx = userListGetIndex(identifier);

    if (userListStore.userListAll.new_notification_count[idx] != null) {
      if (count > 0) {
        userListStore.setNotification({ type: 1, index: idx });
      } else if (count < 0) {
        userListStore.setNotification({ type: 2, index: idx });
      } else {
        userListStore.setNotification({ type: 3, index: idx });
      }
    }
  }

  // 메인 비디오 체크
  function checkMainVideo() {
    const userList = userListStore.userListAll;
    if (userList[userList.length - 1].text === "") {
      for (let i = 0; i < userList.length; ++i) {
        if (userList[i].hostIcon === true) {
          const params = {
            type: "",
            text: userList[i].text,
            nickname: userList[i].nickname
          };
          userListStore.setMainVideoStatus(params);
          break;
        }
      }
    }
  }

  // return 메소드들
  return {
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
    checkMainVideo
  };
}
