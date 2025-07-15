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

export function updateStatusByDeviceId(treeData, targetDeviceId, newStatus) {
	console.log(treeData, targetDeviceId, newStatus)
    function recursiveUpdate(nodes) {
        return nodes.map((node) => {
            if (!node.children || node.children.length === 0) {
				if (node.deviceId === targetDeviceId) {
                    return { ...node, status: newStatus }; // 상태만 바꿔서 새 객체 반환
                }
                return node;
            } else {
                // 자식 노드가 있을 경우 재귀 처리
                return {
                    ...node,
                    children: recursiveUpdate(node.children),
                };
            }
        });
    }

    return recursiveUpdate(treeData);
}

