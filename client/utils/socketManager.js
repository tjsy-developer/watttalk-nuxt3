// socketManager.js
import { useCallStore } from "@/stores/call";
import { useUserListStore } from "@/stores/userList";
import { buildTree } from "@/utils/common"
import { recentDataGetIndex, updateStatusByDeviceId, userDataGetIndex } from "@/composables/common";


// environment, joinMeeting  > 연락처, 회의실, 회원대기실
// openMeetingOnOff > onpenMeetingOnOff
// userStatus, callReadyStatus, canMakeCall  > 연락처 컴포넌트
// createRoomID > 회의실, 영상통화
// canMakeCall > 영상통화, 연락처
// groupRoom > 연락처
// calling > 연락처, 영상통화, 회의실
// calling , cancelCalling, inviteCancelCalling, directMessage, directMessageReadProcess, getPreviousMessage > 연락처, 영상통화, 회의실
// multiRefuseCalling > 연락처
// openMeetingChecking, sendEntryNotification > 연락처, 회의실


export function bindSocketEvents(socket) {
    const callStore = useCallStore();
    const userListStore = useUserListStore();

    socket.off("userListAll");
    socket.on("userListAll", (response) => {
        const json = JSON.parse(response);
        
        userListStore.init();
        callStore.setUserData([]);
        callStore.setUserDataAll([]);

        const sortOrgList = json.users.sort((a, b) => b.status - a.status);
        callStore.setUserData(sortOrgList);
        callStore.setUserDataAll(json.users);
        const result = buildTree(sortOrgList);
        userListStore.setOrganizationList(result);
    });

    socket.off("lastCallTime");
    socket.on("lastCallTime", (response) => {
        const json = JSON.parse(response);
        userListStore.init();
        callStore.setRecentData([]);
        callStore.setRecentDataAll([]);

        const sortOrgList = json.users.sort((a, b) => b.status - a.status);
        callStore.setRecentData(sortOrgList);
        callStore.setRecentDataAll(json.users);
        const result = buildTree(sortOrgList);
        userListStore.setRecentCallList(result);
    });

    socket.off("callReadyStatus");
    socket.on("callReadyStatus", (response) => {
        const json = JSON.parse(response);
        console.log(json)
        const userIdx = userDataGetIndex(json.deviceid)
        callStore.setUserDataStatusAtIndex({
            index: userIdx,
            status: json.status
        })
        const recentIdx = recentDataGetIndex(json.deviceid)
        callStore.setUserDataStatusAtIndex({
            index: recentIdx,
            status: json.status
        })

        const updateRecentCallList = updateStatusByDeviceId(userListStore.recentCallList, json.deviceid, json.status);
        const updateOrgCallList = updateStatusByDeviceId(
            userListStore.organizationList,
            json.deviceid,
            json.status,
        );
        console.log(updateOrgCallList)
        userListStore.setRecentCallList(updateRecentCallList);
        userListStore.setOrganizationList(updateOrgCallList);
    });

    socket.off("userStatus");
    socket.on("userStatus", (response) => {
        const json = JSON.parse(response);
        console.log(json)

        // 상대방이 대기실에 있는경우
        if (json.status == 1) {
            
            // 상대방이 방에 입장한 상태
        } else if (json.status == 2) {

            requestGroupRoom(json.deviceid);
            this.$store.commit("call/callingPopupInfo", {
                institution: remoteInstitution,
                headquarters: remoteHeadquarters,
                branch: remoteBranch,
                nickname: remoteNickname,
            });
            this.contentsBtnClick(5);
        }
    });
}

