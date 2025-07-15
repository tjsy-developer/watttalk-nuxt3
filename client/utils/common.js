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
        const { headquarters, branch, nickname, en_nickname, devicetype, status, deviceid } = user;

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
function updateLeafNodeStatus(data, targetIndex, newStatus) {
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

export default {
    getWorldTime,
    buildTree,
    updateLeafNodeStatus,
};