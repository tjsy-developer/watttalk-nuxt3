// composables/useSockets.ts
import { onMounted, onUnmounted } from 'vue';
import { useNuxtApp } from 'nuxt/app';

export const useSockets = () => {
  // 플러그인에서 provide된 소켓 인스턴스를 가져옵니다.
  // 이 부분은 컴포저블 내부에서 한 번만 호출하면 됩니다.
	const { $signallingSocket, $transferSocket } = useNuxtApp();
	const {} = useAuth();

	// 이 컴포저블을 사용하는 컴포넌트가 마운트될 때 소켓 연결
	onMounted(() => {
		alert("여기를 타긴탔니?")
		if ($signallingSocket) {
			$signallingSocket.connect();
			// 여기에 필요한 전역 이벤트 리스너를 설정할 수 있습니다.
			// $signallingSocket.on('some-global-event', () => { /* ... */ });
		}
		if ($transferSocket) {
			$transferSocket.connect();
			// $transferSocket.on('another-global-event', () => { /* ... */ });
		}
	});

	// 이 컴포저블을 사용하는 컴포넌트가 언마운트될 때 소켓 연결 해제
	onUnmounted(() => {
		if ($signallingSocket) {
			$signallingSocket.disconnect();
			// 설정했던 전역 이벤트 리스너도 해제해야 합니다.
			// $signallingSocket.off('some-global-event');
		}
		if ($transferSocket) {
			$transferSocket.disconnect();
			// $transferSocket.off('another-global-event');
		}
	});

	// 컴포넌트에서 소켓 인스턴스를 사용할 수 있도록 반환합니다.
	return {
		signallingSocket: $signallingSocket,
		transferSocket: $transferSocket,
	};
};