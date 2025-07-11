<template>영상통화 페이지입니다</template>

<script setup>
import $ from 'jquery'
import { useCommonStore } from '@/stores'
import { useCallStore } from '@/stores/call'
import { useChattingStore } from '@/stores/chatting'
import { useDirectMessageStore } from '@/stores/directMessage'
import { useDrawingCanvasStore } from '@/stores/drawing'
import { useAuthStore } from '@/stores/login'
import { useMeetingStore } from '@/stores/meeting'
import { useNuxtApp } from 'nuxt/app'
import { ref, onMounted, onUpdated, onBeforeUnmount, reactive, computed } from 'vue'
const { $Janus, $signallingSocket } = useNuxtApp()

// import $Janus from "@/public/js/janus"
const commonStore = useCommonStore()
const callStore = useCallStore()
const loginStore = useAuthStore()
const chattingStore = useChattingStore()
const drawingStore = useDrawingCanvasStore()
const directMessageStore = useDirectMessageStore()
const meetingStore = useMeetingStore()
// 단순 원시 값 ref
const searchData = ref("")
const jwt_token = ref("")
const tokenCheckResult = ref(false)
const powerManageLink = ref("")

// 객체 reactive
const callingLayoutCompData = reactive({
  // callingLayoutType: 4,
	userList: []
})

let server = ref(null)
let janus = ref(null)
let sfutest = ref(null)

let opaqueId = ref("")
let myroom = ref("")
let myusername = ref(null)
let myid = ref(null)
let mystream = ref(null)
let mypvtid = ref(null)

// 배열 reactive
let feeds = reactive([])
let bitrateTimer = reactive([])

let doSimulcast = ref("")
let doSimulcast2 = ref("")
let subscriber_mode = ref("")

let setIntervalStream = ref("")

// nested 객체 reactive
let multiCallingData = reactive({
	localdeviceid: "",
	remotedeviceid: "",
	roomid: "",
	institution: "",
	nickname: ""
})

// 배열 reactive, require() 함수 그대로 사용
let imageRequireTest = reactive([
	// { src: require('@/assets/images/calling/ic_photo_52.png') },
	// { src: require('@/assets/images/calling/ic_video_send_158.png') },
	// { src: require('@/assets/images/calling/ic_photo_140.png') }
])

let videoOffResult = ref(false)
let callingLayoutType = ref(1)
let myVideoCheckInterval = ref(null)

let videoArray = reactive([])
let videoStream = reactive([])

let chattingCallingIndex = ref("")

let callReadyStuatsDOM = ref("")
let m_remote_deviceid = ref("")
let m_remote_nickname = ref("")
let m_remote_devicetype = ref("")
let m_remote_status = ref("")
let m_roomid = ref("")

let loginStatus = reactive({
//   online: require('@/assets/images/calling/ic_online.png'),
//   offline: require('@/assets/images/calling/ic_offline.png')
})

let oldDurationFlag = ref(false)
let chattingFileSendIndex = ref("")

let fileReceiveBuffer = reactive([])
let fileReceivedSize = ref(0)
let fileReceiveTotalSize = ref(0)
let receiveFileType = ref("")
let sendFileReader = ref(null)

let str_stream_picture_file_path = ref("")

let removeToast = ref(undefined)
let iceStateConnect = ref(undefined)
let iceStateCheck = ref(undefined)

let blobtoUrl = ref("")

let callingTimerStart = ref(false)
let callTimerInterval = ref("")

let callTime = ref(0)
let callHour = ref(0)
let callMin = ref(0)
let callSec = ref(0)

let bitrateTimerinterval = ref(null)
let callDivInterval = ref(null)
let canvasDrawInterval = ref(null)
let videoNoneCanvasInterval = ref(null)

let roomFullCheck = ref(false)
let PDFCancelUploadInterval = ref("")
let PDFsendFileName = ref("")

let testImage = ref("")

let mainVideoBitrate = ref(2000000)
let subVideoBitrate = ref(1500000)
let headerHeight = ref(0)
let fullScreenApplyCount = ref(0)

let maskLoading = ref(false)
let funcAutoCallAceept = ref(null)
let autoPictureModal = ref(false)
let motionFailCheck = ref(false)
let sendDurationEnableFlag = ref(false)
let resultMaxNum = ref(0)
let funcAutoDiscalling = ref(null)
let rateStopper = ref(null)
let previewModalState = ref(false)

let interval = ref("")
let keepAliveList = reactive([])

definePageMeta({
	layout: "video"
})

// 마운트될 때 실행할 작업
onMounted(() => {
	console.log('컴포넌트가 마운트되었습니다.')
	alert($Janus)
	sayHello()
})

// 데이터가 업데이트될 때 실행할 작업
onUpdated(() => {
	// console.log('컴포넌트가 업데이트되었습니다. 현재 count는:', count.value)
})

// 언마운트되기 전 실행할 작업
onBeforeUnmount(() => {
	console.log('컴포넌트가 언마운트됩니다.')
})

function streamMediaChange() {
			console.log("*** media devices modified")
			const videoDefine = "stdres-16:9"
			if (commonStore.isDrawing || commonStore.isShare) {
				setAudioOutput()
				return
			}
			sfutest.createOffer({
				media: {
					audioRecv: false,
					videoRecv: false,
					audioSend: true,
					videoSend: true,
					video: videoDefine,
					replaceAudio: true,
					replaceVideo: true,
					data: true,
					keepVideo: false,
				},
				simulcast: doSimulcast,
				simulcast2: doSimulcast2,
				success(jsep) {
					$Janus.debug("Got publisher SDP!", jsep)

					$nextTick(() => {
						if (callStore.cameraDeviceIndex == -1) {
							muteVideoCustom()
						}
						if (commonStore.selectedMicID == "false" || commonStore.selectedMicID == false) {
							callStore.setMicOnOffClick(true)
							$store.commit("setIsSoundedTrue")
						} else {
							callStore.setMicOnOffClick(false)
							$store.commit("setIsSoundedFalse")
						}
						setAudioOutput()
					})
				},
				error(error) {
					$Janus.error("WebRTC error:", error)
					console.log("WebRTC error:", error)
				}
			})
			$store.commit("setDeviceModifyState", false)
		}
		async function setAudioOutput() {
			console.log("*** audio output device change")
			console.log(`*** audio output device id = ${commonStore.selectedAudioID}`)
			const audioOutID = commonStore.selectedAudioID
			// 
			for (let iLoop = 0; iLoop < 15; ++iLoop) {
				const permanantAuido = document.getElementById(`audioControl${iLoop}`)
				if (document.getElementById(`waitingvideo${iLoop}`)) {
					document.getElementById(`waitingvideo${iLoop}`).remove()
				}
				if (document.getElementById("no-video-container")) {
					document.getElementById("no-video-container").remove()
				}
				if (document.getElementsByClassName("spinner")[iLoop]) {
					document.getElementsByClassName("spinner")[iLoop].remove()
				}
				const audioElement = permanantAuido
				if (audioElement && audioElement.srcObject) {
					let videoElement
					if (iLoop == 0) {
						console.log("change local audio out")
						videoElement = document.getElementById("myvideo")
					} else {
						console.log("change remote audio out")
						videoElement = document.getElementById(`remotevideo${iLoop}`)
					}
					if (typeof videoElement.setSinkId === 'undefined') {
						alert('Browser does not support setSinkId. Please use Chrome or Edge');
						return
					}
					if (audioOutID != false && audioOutID != "false") {
						console.log("set audio")
						videoElement.removeAttribute("muted", false)
						videoElement.muted = false
						try {
							await permanantAuido.setSinkId(audioOutID)
							.then(() => {
								console.log(`Success, audio output device attached: ${audioOutID}`)
								videoElement.setAttribute("muted", "muted")
								videoElement.muted = "muted"
								permanantAuido.setAttribute("muted", false)
								permanantAuido.muted = false
							})
							.catch((err) => {
								if (err.name === "SecurityError") {
									alert(`You need to use https for selecting audio output device: ${err}`)
								} else {
									console.log(`audio output change err: ${err}`)
									navigator.mediaDevices.enumerateDevices()
										.then((devices) => {
											console.log(devices)
											const audioList = devices.filter(device => device.kind === 'audiooutput')
											const params = {
												type: 0,
												id: audioList[0].deviceId
											}
											$store.commit("setMediaDevices", params)
											setAudioOutput()
										})
								}
							})
						} catch(err) {
							console.log(err)
							return
						}
					} else {
						console.log("*** set audio muted")
						videoElement.setAttribute("muted", "muted")
						videoElement.muted = "muted"
						permanantAuido.setAttribute("muted", "muted")
						permanantAuido.muted = "muted"
					}
				}
			}
			const sfutest = commonStore.sfutest
			if (commonStore.isSounded) {
				sfutest.muteAudio()
			} else {
				sfutest.unmuteAudio()
			}
		}
		// Login Request !!
		function loginRequest(localDeviceid) {
			const obj = {
				deviceid: localDeviceid,
				connectStatus: 0,
				language: m_lang
			}

			const json = JSON.stringify(obj)
			$signallingSocket.emit("login", json)
			// console.log("*** socket: emit login. " + json)
		}
		function createRoomRequest(deviceid, roomid, uniqueRoomid) {
			const obj = { deviceid, roomid, unique_roomid: uniqueRoomid }
			const json = JSON.stringify(obj)
			$signallingSocket.emit("createRoom", json)
			// console.log("*** socket: emit createRoom. json: ", json)
		}
		// 상대방 통화 수신 가능한지 체크
		function canReceiveCallRequest(localdeviceid, remotedeviceid) {
			const obj = {
				localdeviceid,
				remotedeviceid
			}
			const json = JSON.stringify(obj)
			$signallingSocket.emit("canReceiveCall", json)
			// console.log("*** socket: emit canReceiveCall. json: ", json)
		}
		function joinRoomRequest(deviceid, roomid, uniqueRoomid) {
			const obj = { deviceid, roomid, unique_roomid: uniqueRoomid }
			const json = JSON.stringify(obj)
			$signallingSocket.emit("joinRoom", json)
			console.log("*** socket: emit joinRoom. json: ", json)
		}
		function callingRequest(
			localdeviceid,
			remotedeviceid,
			roomid,
			calltype,
			institution,
			nickname,
			meetingSeq
		) {
			// console.log("calling > uniqueRoomid : " + uniqueRoomid)
			let obj = {}
			if (feeds.length == 0) {
				obj = {
					localdeviceid,
					remotedeviceid,
					roomid,
					calltype,
					institution,
					nickname,
					meetingSeq,
					unique_roomid: uniqueRoomid // unqiueRoomid 추가
				}
			} else {
				obj = {
					localdeviceid,
					remotedeviceid,
					roomid,
					calltype,
					institution,
					nickname,
					roomNumberCount: currentRoomNumberCount,
					meetingSeq,
					unique_roomid: uniqueRoomid
				}
			}
			const json = JSON.stringify(obj)
			$signallingSocket.emit("calling", json)
			// console.log("*** socket: emit calling. json: ", json)
		}
		function discallingRequest(
			localdeviceid,
			remotedeviceid,
			roomid,
			institution,
			nickname를
		) {

			const obj = {
				localdeviceid,
				remotedeviceid,
				roomid,
				institution,
				nickname
			}
			const json = JSON.stringify(obj)
			$signallingSocket.emit("discalling", json)

			// console.log("*** socket: emit discalling. json: ", json)
		}
		function cancelCallingRequest() {
			const obj = {
				localdeviceid: sessionStorage.getItem("m_local_deviceid"),
				remotedeviceid: sessionStorage.getItem("m_remote_deviceid"),
				roomid: sessionStorage.getItem("m_roomid"),
				institution: sessionStorage.getItem("m_institution"),
				nickname: sessionStorage.getItem("m_nickname")
			}
			const json = JSON.stringify(obj)
			$signallingSocket.emit("cancelCalling", json)
			// console.log("*** socket: emit cancelCalling. json: ", json)
		}
		function callingAccept(roomid, remotedeviceid) {
			// sessionStorage save
			sessionStorage.setItem("m_roomid", roomid)
			// sessionStorage.setItem("m_roomid", "1234")
			sessionStorage.setItem("m_remote_deviceid", remotedeviceid)
			sessionStorage.setItem(
				"m_remote_nickname",
				userListGetNickname(remotedeviceid)
			)
			sessionStorage.setItem(
				"m_remote_devicetype",
				userListGetDevicetype(remotedeviceid)
			)
			sessionStorage.setItem(
				"m_remote_status",
				userListGetStatus(remotedeviceid)
			)
			// $Janus 에서 Answer 역할 수행
		}
		function callingReject(
			roomid,
			localdeviceid,
			remotedeviceid,
			institution,
			nickname
		) {
			const obj = {
				localdeviceid,
				remotedeviceid,
				roomid,
				institution,
				nickname
			}
			const json = JSON.stringify(obj)
			$signallingSocket.emit("refuseCalling", json)
			// console.log("*** socket: emit refuseCalling. json: ", json)
		}
		function getQueryStringValue(name) {
			name = name.replace(/[[]/, "\\[").replace(/[\]]/, "\\]")
			const regex = new RegExp("[\\?&]" + name + "=([^&#]*)")
			const results = regex.exec(location.search)
			return results === null
				? ""
				: decodeURIComponent(results[1].replace(/\+/g, " "))
		}
		// 사용자가 입력한 이름이 규칙에 합당한지 체크
		function registerUsername() {
			// console.log("*** methods: registerUsername")
			if ($("#username").length === 0) {
				// Create fields to register
				$("#register").click(registerUsername)
				$("#username").focus()
			} else {
				// Try a registration
				$("#username").attr("disabled", true)
				$("#register")
					.attr("disabled", true)
					.unbind("click")

				const username = $("#username").val()
				if (username === "") {
					$("#you")
						.removeClass()
						.addClass("label label-warning")
						.html("Insert your display name (e.g., pippo)")
					$("#username").removeAttr("disabled")
					$("#register")
						.removeAttr("disabled")
						.click(registerUsername)
					return
				}

				// m_nickname에 하이푼이 들어가있으면 처리를 못한다. 어떻게 해야하는가?
				// 이메일 같은 경우는 하이푼이 들어가있을수도 있는데..

				if (/[^a-zA-Z0-9가-힣]/.test(username)) {
					$("#you")
						.removeClass()
						.addClass("label label-warning")
						.html("Input is not alphanumeric")
					$("#username")
						.removeAttr("disabled")
						.val("")
					$("#register")
						.removeAttr("disabled")
						.click(registerUsername)
					return
				}

				const register = {
					request: "join",
					room: myroom,
					ptype: "publisher",
					// deviceid를 알아야하므로, #로 문자열 합침.
					display: username + "#" + sessionStorage.getItem("m_local_deviceid")
				}
				myusername = username
				sfutest.send({ message: register })
			}
		}
		function publishOwnFeed(useAudio) {
			// console.log("*** methods: publishOwnFeed")
			// Publish our stream
			$("#publish")
				.attr("disabled", true)
				.unbind("click")

			/// ///////////////////////////////////////////////////////////////////
			let video = true
			let audio = commonStore.selectedMicID == false || commonStore.selectedMicID == "false" ? false : true
			// video on     audio on
			if (onlyVoiceID.includes(sessionStorage.getItem("m_local_deviceid")) || callStore.cameraNotAllowed || callStore.cameraDeviceIndex == -1) {
				video = false
			}
			/* 모바일 체크 - 모바일일 경우 true / true */
			const filter = "win16|win32|win64|mac|linux"
			if (navigator.platform) {
				if (!filter.includes(navigator.platform.toLowerCase())) {
					// alert("Mobile")
					publishOwnFeedCustom(video, audio)
				} else {
					// alert("PC")
					navigator.mediaDevices
						.getUserMedia({ video, audio })
						.then(function(stream) {
							// console.log("stream.getVideoTracks() = ", stream.getVideoTracks())
							// console.log("stream.getAudioTracks() = ", stream.getAudioTracks())

							// 여기까지 도달했다면 video, audio 값을 createOffer에 사용하도록 한다.
							// res = {"video": video, "auido": auido}
							console.log("미디어 장치 체크 중.. 비디오 on 오디오 on 성공")
							publishOwnFeedCustom(video, audio)
						})
						.catch(function(e) {
							// console.log("e.name = ", e.name)
							// console.log("e.message = ", e.message)
							console.log(
								"비디오 on 오디오 on 실패 했습니다. 오디오 on 실행합니다."
							)

							/// ///////////////////////////////////////////////////////////////////
							video = false
							audio = true
							// video off        audio on
							navigator.mediaDevices
								.getUserMedia({ video, audio })
								.then(function(stream) {
									// console.log(
									//  "stream.getVideoTracks() = ",
									//  stream.getVideoTracks()
									// )
									// console.log(
									//  "stream.getAudioTracks() = ",
									//  stream.getAudioTracks()
									// )

									// 여기까지 도달했다면 video, audio 값을 createOffer에 사용하도록 한다.
									// res = {"video": video, "auido": auido}
									console.log("미디어 장치 체크 중.. 비디오 off 오디오 on 성공")
									publishOwnFeedCustom(video, audio)
								})
								.catch(function(e) {
									// console.log("e.name = ", e.name)
									// console.log("e.message = ", e.message)
									console.log(
										"비디오 off 오디오 on 실패 했습니다. 비디오 on  실행합니다."
									)

									/// ///////////////////////////////////////////////////////////////////
									video = true
									audio = false
									// video on     audio off
									navigator.mediaDevices
										.getUserMedia({ video, audio })
										.then(function(stream) {
											// console.log(
											//  "stream.getVideoTracks() = ",
											//  stream.getVideoTracks()
											// )
											// console.log(
											//  "stream.getAudioTracks() = ",
											//  stream.getAudioTracks()
											// )

											// 여기까지 도달했다면 video, audio 값을 createOffer에 사용하도록 한다.
											// res = {"video": video, "auido": auido}
											console.log(
												"미디어 장치 체크 중.. 비디오 on 오디오 off 성공"
											)
											publishOwnFeedCustom(video, audio)
										})
										.catch(function(e) {
											// console.log("e.name = ", e.name)
											// console.log("e.message = ", e.message)
											// console.log(
											//  "비디오 on 오디오 off 실패 했습니다. 비디오 오디오 없이 영상통화를 실행합니다."
											// )

											/// ///////////////////////////////////////////////////////////////////
											video = false
											audio = false
											// res = {"video": video, "auido": auido}
											publishOwnFeedCustom(video, audio)
										})
								})
						})
				}
			}

			// // 디바이스 체크 TEST !!!
			// if (sessionStorage.getItem("m_local_deviceid") == "admin") {
			//  // callStore.setCameraDevice", false)
			//  useAudio = false
			// }
		}
		function publishOwnFeedCustom(videoSend, audioSend) {
			// console.log("*** methods: publishOwnFeedCustom")
			// console.log("videoSend = ", videoSend)
			// console.log("audioSend = ", audioSend)

			// const parent = this

			// globalAudioSend = audioSend
			// globalVideoSend = videoSend
			let audioSendParams = audioSend != false ? true : false
			callStore.setGlobalAudioSend(audioSendParams)
			callStore.setGlobalVideoSend(videoSend)

			// 한계에 다다랐을 때 시도한 방법. 안된다고 판단하기엔 섣부르다.
			$Janus.deviceAudioState = audioSend
			$Janus.deviceVideoState = videoSend

			// console.log("$Janus.deviceAudioState = ", $Janus.deviceAudioState)
			// console.log("$Janus.deviceVideoState = ", $Janus.deviceVideoState)

			// videoType: true 의 경우 어떤 해상도를 이용할지, videoType: false의 경우 #videoNone canvas 공유
			let videoType = ""
			if (videoSend) {
				videoType = "stdres-16:9"
			} else {
				videoType = "videoNone"
				// 캔버스에 접근
				const canvas = document.getElementById("videoNone")
				const context = canvas.getContext("2d")
				// console.log("canvas = ", canvas)
				// console.log("context = ", context)

				// 인터벌이 살아있다면 clear
				if (videoNoneCanvasInterval != null) {
					clearInterval(videoNoneCanvasInterval)
				}

				// x좌표/y좌표 1, 1 위치에 가로/세로 1, 1의 투명색 점을 1초 마다 찍는 코드
				// 이렇게 함으로 canvas의 mediaStream이 재생되고 있다고 알림
				videoNoneCanvasInterval = setInterval(function() {
					context.fillStyle = "rgb(0, 0, 0, 0)"
					context.fillRect(1, 1, 1, 1)
				}, 125)
			}

			// 화면 공유를 할 때 audio 값을 전달하기 위함
			// globalAudioSend = audioSend
			callStore.setGlobalAudioSend(audioSendParams)

			sfutest.createOffer({
				// Add data:true here if you want to publish datachannels as well
				// video: "hires-16:9" 추가함. 1280 720 해상도
				// cameraDevice
				media: {
					audioRecv: false,
					videoRecv: false,
					// audioSend: true,
					audioSend,
					// videoSend: true,
					videoSend, // 카메라가 없을 경우 보내지 않도록 한다.
					// video: "hires"
					video: videoType,
					// =>kyj
					data: true
					// <=kyj
				}, // Publishers are sendonly
				// If you want to test simulcasting (Chrome and Firefox only), then
				// pass a ?simulcast=true when opening demo page: it will turn
				// the following 'simulcast' property to pass to janus.js to true
				simulcast: doSimulcast,
				simulcast2: doSimulcast2,
				success(jsep) {
					// console.log("createOffer 성공")
					// console.log("^^^^^^^^^")
					$Janus.debug("Got publisher SDP!", jsep)
					const publish = { request: "configure", audioSend, video: true }
					// You can force a specific codec to use when publishing by using the
					// audiocodec and videocodec properties, for instance:
					//      publish["audiocodec"] = "opus"
					// to force Opus as the audio codec to use, or:
					//      publish["videocodec"] = "vp9"
					// to force VP9 as the videocodec to use. In both case, though, forcing
					// a codec will only work if: (1) the codec is actually in the SDP (and
					// so the browser supports it), and (2) the codec is in the list of
					// allowed codecs in a room. With respect to the point (2) above,
					// refer to the text in janus.plugin.videoroom.jcfg for more details
					sfutest.send({ message: publish, jsep })
				},
				error(error) {
					$Janus.error("WebRTC error:", error)
					console.log("WebRTC error:", error)
					if (audioSend) {
						publishOwnFeed(false)
					} else {
						$Janus.log("****** function publishOwnFeed")

						// if 문으로 Permission dismissed 일 경우 마이크 또는 비디오가 허용되지 않았습니다.
						if (
							error.message == "Permission dismissed" ||
							error.message == "Permission denied"
						) {
							alert(
								"마이크 또는 비디오가 허용되지 않았습니다. \n마이크 또는 비디오를 허용 후에 다시 통화 하시기 바랍니다."
							)

							// 통화 종료 처리
							callStore.setHangupCallingConfirmFlag(true)
							return
						}

						alert("WebRTC error... " + error.message)

						$("#publish")
							.removeAttr("disabled")
							.click(function() {
								publishOwnFeed(true)
							})
					}
				}
			})
		}
		// 오디오 mute on/off 함수
		function toggleMute() {
			let muted = sfutest.isAudioMuted()
			$Janus.log((muted ? "Unmuting" : "Muting") + " local stream...")
			if (muted) sfutest.unmuteAudio()
			else sfutest.muteAudio()
			muted = sfutest.isAudioMuted()
			$("#mute").html(muted ? "Unmute" : "Mute")
		}
		// 파일 송신
		function fileSend(result) {
			// 

			// 송신자가 파일을 받을지 물어볼 때
			if (result == 2) {
				const remoteDeviceId = commonStore.fileReceiver
				console.log("fileSend 시", remoteDeviceId)

				const file = commonStore.sendFileData[0]
				console.log(
					`*** methods: fileSend - file is ${[
						file.name,
						file.size,
						file.type,
						file.lastModified
					].join(" ")}`
				)

				const obj = {
					localdeviceid: sessionStorage.getItem("m_local_deviceid"),
					remotedeviceid: commonStore.fileReceiver,
					filename: file.name,
					filetype: file.type,
					filelength: file.size,
					HQCapture: 0 // 2021-08-30 추가 0 - false
				}
				const json = JSON.stringify(obj)
				$signallingSocket.emit("fileTransfer", json)
				console.log("*** socket: emit fileTransfer. json: " + json)

				//- 송신중 메세지 index 설정 - addChatFileSendMessage()에서 chattingFileSendIndex 값 사용
				chattingFileSendIndex = chattingStore.chattingMessageList.length

				// 채팅창에 파일 송신중 메세지 추가 (1)
				addChatFileSendMessage(userListGetNickname(remoteDeviceId), 1, "")

				// 송신 중 채팅 인덱스 저장 -ksy
				chattingFileSendIndex = chattingStore.chattingMessageList.length - 1

				// 송신자 측 채팅인덱스 및 파일 정보 저장
				const rfidIndex = findFeedsIndexDeviceid(commonStore.fileReceiver)
				const status = commonStore.userListStatus[rfidIndex].status
				const name = commonStore.userListStatus[rfidIndex].text

				callingLayoutChange(
					status,
					name,
					rfidIndex
				)

				/* 송신자측 PC 파일 관련 정보 저장-ksy
					index: 수신자 index
					fileSendInfo: {
						fileChatIndex: 송신중 메세지 index 저장
						fileReceiveNickname: 수신자 이름 저장
					}*/
				$store.commit("setFileSendInfo", {
					index: rfidIndex,
					fileSendInfo: {
						fileChatIndex: chattingFileSendIndex,
						fileReceiveNickname: commonStore.fileReceiver
					}
				})
			}
			// 수락했을 때
			else if (result == 3) {
				// 송신자가 보낸 파일을 수락 클릭했을 경우 송신자이름으로 index 조회- ksy
				const rfidIndex = findFeedsIndexNickname(receiveFileResFlag.selectedUserName)
				let rfdeviceid = feeds[rfidIndex].rfdeviceid;
				// console.log("*** methods: fileSend - 수락했을 때, remote deviceid = " + rfdeviceid)
				// console.log("*** methods: fileSend - fileReceiver handleId = " + feeds[rfidIndex].rfid)
				// console.log("*** methods: fileSend - fileReceiver handleId = " + myid)
				// status : 0 Decline, 1 Access

				const obj = {
					localdeviceid: sessionStorage.getItem("m_local_deviceid"),
					remotedeviceid: rfdeviceid, //-ksy
					status: 1,
					// handleId: myid
					handleId: feeds[rfidIndex].rfid
				}
				const sendJson = JSON.stringify(obj)
				$signallingSocket.emit("fileReceiver", sendJson)
				console.log("*** socket: emit fileReceiver. json: " + sendJson)

				// 송신 진행률 -ksy 주석
				// 내 화면 수신중으로 변환하기.
				// callingLayoutChange(result, sessionStorage.getItem("m_nickname"), 0)
				// 보낸 사용자 화면을 수신중으로 변환하기.
				callingLayoutChange(result, commonStore.userListStatus[rfidIndex].text, rfidIndex)

				/* HQ Capture 중이 아닐 경우에만 메세지 출력 - 분기처리 */
				if (!callStore.HQCaptureFlag) {
					// 채팅창에 파일 수신중 메세지 추가 (2) -ksy 주석
					// const sendFileNickname =
					//  chattingStore.chattingMessageList[
					//      chattingFileSendIndex
					//  ].nickname

					// 수신중 채팅 인덱스 저장 addChatFileSendMessage(송신자 이름, 2, 송신자 인덱스, 파일 채팅인덱스) - ksy
					const fileChatIndex = commonStore.userListStatus[rfidIndex].fileReceiveInfo.fileChatIndex
					addChatFileSendMessage(commonStore.userListStatus[rfidIndex].text, 2, rfidIndex, fileChatIndex)

					// 하단 정렬일 경우에만
					// callingLayout 4 하단 레이아웃 default 버튼 변경
					// callStore.setUnderStatus", 0)
					setInitUnderStatus(0)
				}
			} else if (result == 4) { // 거절했을 때
				// 송신자가 보낸 파일을 거절 클릭했을 경우 송신자이름으로 index 조회- ksy
				const rfidIndex = findFeedsIndexNickname(receiveFileResFlag.selectedUserName)
				let rfdeviceid = feeds[rfidIndex].rfdeviceid;

				if (
					commonStore.fileSendStatus == 2 ||
					commonStore.fileSendStatus == 3 ||
					commonStore.fileSendStatus == 6
				) {
					// 내 callingWIndow 상태가 파일 송수신 진행중이면 return
					// 내 callingWindow 상태가 파일 송수신 진행중이 아닐 경우만.
					if (
						commonStore.userListStatus[0].status == 2 ||
						commonStore.userListStatus[0].status == 3
					) {
						return
					} else {
						// 내 화면을 비디오로 변경
						// callingLayoutChange("attach", sessionStorage.getItem("m_nickname"), 0)
						// $("#myvideo").show()
						// 송신자 화면을 비디오로 변환
						callingLayoutChange("attach", commonStore.userListStatus[rfidIndex].text, rfidIndex)
						$("#remotevideo" + rfidIndex).show()
						$("#panel-inner" + rfidIndex).show()
						return
					}
				}

				// 거절했을 때 파일 수신 거절 전송
				console.log("*** methods: fileSend - 거절했을 경우")
				// console.log(
				//  "*** methods: fileSend - fileReceiver handleId = " +
				//      feeds[rfidIndex].rfid
				// )
				console.log(
					"*** methods: fileSend - fileReceiver handleId = " + myid
				)

				// status : 0 Decline, 1 Access
				const obj = {
					localdeviceid: sessionStorage.getItem("m_local_deviceid"),
					remotedeviceid: rfdeviceid, //ksy
					status: 0,
					// handleId: myid
					handleId: feeds[rfidIndex].rfid
				}
				const sendJson = JSON.stringify(obj)
				$signallingSocket.emit("fileReceiver", sendJson)
				console.log("*** socket: emit fileReceiver. json: " + sendJson)

				// 채팅창에 파일 수신 거절 메세지 추가 (4)
				// fileChatIndex - 수락/거절 채팅 index
				const fileChatIndex = commonStore.userListStatus[rfidIndex].fileReceiveInfo.fileChatIndex
				const sendFileNickname =
					chattingStore.chattingMessageList[
						fileChatIndex
					].nickname
				// 수락/거절창 -> 거절 메시지로 변경- ksy
				addChatFileSendMessage(sendFileNickname, 4, rfidIndex, fileChatIndex)

				// 파일 송수신 초기화
				fileReceiveReset(feeds[rfidIndex].rfdeviceid , rfidIndex)

				// 하단 정렬일 경우에만
				// callingLayout 4 하단 레이아웃 default 버튼 변경
				// callStore.setUnderStatus", 0)
				setInitUnderStatus(0)
			}
			// 수신측 PC에서 파일수신 flow 끝나고 초기화 - ksy
			$store.commit("setReceiveFileResFlag", { flag: false, selectedUserName: "" })
		}
		// 비디오 mute 함수
		function muteVideoCustom() {
			console.log("*** methods: muteVideoCustom", commonStore.fileSendStatus)

			sfutest.muteVideo()

			// $("#videolocal").html(
			//  '<div class="row justify-center items-center" style="background-color: #151515; width: 100%; height: 100%; padding-bottom: 30px; "><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADQAAAA0CAYAAADFeBvrAAAABHNCSVQICAgIfAhkiAAABntJREFUaEPNWktsW1UQPWM7dR3iWCm1Yuw0aUVbGlRA6qYVRaJsEItKIDaAyqbiv0AVEhJ0wU+qRCs2VCwKiK6gQBESLWLDAonyEVRdgCoQTegnaWInbpomlpM4TmIPHPMcbMf2e/fZrjLSU6K8uTNz7sy998x9ETRRVLULwCMA7gZwm/VErZ/0NAYgYf3k7+cBnBKRqWaFIY0aUtU+AI8CeBjAfQC8hjZzAH4EcBrAVyIybDi+TN01IFW9E8ARAHsbCaDK2G8AHBSRP9zYNQakqr0ADgHYB8DjxqmDMXkAJwC8LiJDDvSXVYwAqeozAI4CCJg4aUA3A+BFETnu1IYjQKp6C4BPrAXv1HYz9b4EsF9EZuyM2gJS1R0AvgBwu52xFr//m5uP3dqqC0hVX7IWfluLg3Vq3rYEawJS1V0AfgCwWsAUQS8CeEBEfq42C1UBqWoMwO8A1judulK9xcVFpNNpTE9PI5vNlpnweDwIBoPLjxv7ACYA7BCR0crxKwCpahDAT9Zpb+SPQCYmJpBKpRyNa2trQzgcRigUcqRfofQbgHtFZL7079UAHQbwiqmH+fl5DA8PI5/nEWImBBSNkiEZyxERebUmIOvQHATgNzHNjCQSpGjuxe/3Y+PGjWBJGgizs62ULpVlSFU/B/CYgUE0kplKPy4zdVJEHi/aWgakqjsB/GoChroXL14E106zhKXnYk1tF5E/GUMpoO8B3G8SGDeA69evmwyx1WXJbdmyxbT0vhWRh5YBqeo2AH/ZeqtQGBgYcLUJ2Pnp7u7GunXr7NQq3/eLyIVChlSVO8XbJhbm5uYKu1orpL29HX19bLOMhC3H4SIgrh2uIcfSinIrdd7f3+84FkvxrIjsElWNWG2xLVEt9TAyMoKZGVvyaxrUsv6mTZuwdu1ak/EKIEZAzwM4ZjKSuiw3ll2rhCXH0jOU/QT0PoDnDAeuVkAfENAp64LDCBOZgVPOZmTYUt68eTPI9QzlNAEZbwh0sgo3BYZ1loB4CWG8R5LyXLlyxXACnal3dHRgw4YNzpTLtQYIiATPiIwWbTSb9hTtuqQ/HJ4ioGkArhqSZrDsyjRw3XD9uJQCoAsA7nBpAJcvX17Rlbq1xXE9PT2FbtalFErOmJSWOiPTJig3jV1l0ORv5HENyBkCMu6BKh02oydy2QtVhnKSgN4FcKCBWSkMZaZIhyovRZzYdcmuq5k+SkDs9j5z4rioMzs7i2QyWbgHqORbPJ9u3LjhqARJbQim0kY8Hi/0Q3xn2JI/QUCdALjTOSKnpQxBRNDb27uCc3E9ETSvspi54lPkZlz0/L0a+RwdHS2Mo3i93sIm4ZDTkZyGHLcPqoqrV6+uIKQExZns6uK3LvdC0JysaoSXhywPWxv5r32gkpMGb2hoCJkMb2KrSyAQKJTgmjVr7ByveM82nqVaTxyAKmvw6rbg165dw+TkpKNAWR4sqc7OTvh8vppj2EuxtPjkcvyIV1+4lnjgsgxryP8tuJWlqucRs8LsuBGWIwPgw4AYePFxY68OxzsjIntos/TWZ7d1BVzm69KlS1hYWHDjvyVjYrFYIfsVwivhX8oAWVkq641YZiy31SQsY5Yes2/JaRHhl/eCVN6cbre+OnhZGmTTzaA0zZ4QXvCvX1/4MMLFd0/xknEFICtLbwJ4w2QjaHbAdva4Hrdu3cosvSUijHdZqn194GH79eDg4N7VmJ1i5NFo9FwoFNopIjxQawPim3Q6HR4bG0ssLS3V3nftprGF730+31JXV1dfOBxe8cmjJt1JJpP7pqamPs7n844oUQvjLzPt8Xi0s7PzyWg0+mk1n3WDjcfjH6VSqaduVrBO/IRCoeOxWOzpWrq2sz8+Pv5sKpU6lsvljL5EOQnORMfr9eZDodALkUjkw3rjbAFxcDKZ3J1Op79bWFhwdZliEng1Xb/fP9fR0fFgd3d31S/ftptCNaMjIyOxXC53bm5ujv82dtOkvb19zOfz3dXT0+OITDrKUGn0iUTiUCaTOZDNZm35fCOo/X7/bCAQeC8ajR40sWMMqGg8kUgQ1GuZTOZWE4d2uoFAYDIQCByKRCK8GjAW14CKnuLxOEnty9lsdk82mw2pqpFNHox+vz/V1tZ2xuPxvBOLxWzXScObgtNp4oHs9Xr3iQj/RTOSz+e7RSSsqmHaEJEJVZ3weDxJAOOqej6Xy50IBoP1uzunAfyr9w+YOZifVwIdWQAAAABJRU5ErkJggg=="></div>'
			// )
			// 내 화면을 비디오 Mute 로 변경
			callingLayoutChange("unpublished", sessionStorage.getItem("m_nickname"), 0)

			// if(commonStore.userListStatus[0].status == 2 || commonStore.userListStatus[0].status == 3) {
			//  callStore.setPreviousWorking", "fileReceiving")
			// }
			// 파일 수신 중인 경우 수신창화면을 끄지않는다. -ksy(임시코드)
			// if(commonStore.fileSendStatus !== 3) {
			//  callingLayoutChange("unpublished", sessionStorage.getItem("m_nickname"), 0)
			//  callStore.setPreviousWorking", "unpublished")
			// }


			// 화면 공유 중지 후 video OFF 일 경우 myvideo가 생성 전에 실행되므로 setTimeout 실행 (1초여야만 숨김 가능,, 그전 까지 돔 생성 안됌)
			if (callStore.myVideoStatus == "videoOFF") {
				// 
				setTimeout(function() {
					$("#myvideo").hide()

					// 나의 비디오 상태 초기화
					callStore.setMyVideoStatus("")
				}, 1500)
			} else {
				$("#myvideo").hide()
			}

			if (callStore.videoMainIndex == 0) {
				mainVideoChangeFunc(0, "localstream", commonStore.userListStatus[0].nickname)
			}

			// signalling socket video off emit
			const obj = {
				rfid: myid,
				status: 0
			}
			const json = JSON.stringify(obj)
			$signallingSocket.emit("videoOnOff", json)
			console.log("*** socket: emit videoOnOff. json: " + json)
		}
		// 비디오 unmute 함수
		function unmuteVideoCustom() {
			console.log("*** methods: unmuteVideoCustom", commonStore.userListStatus[0].status)
			// if(commonStore.userListStatus[0].status !== 2 && commonStore.userListStatus[0].status !== 3) {
			//  console.log("타면안됨")
			//  callingLayoutChange("attach", sessionStorage.getItem("m_nickname"), 0)
			//  $("#myvideo").show()
			//  // callStore.setPreviousWorking", "attach")
			// }

			// if (callStore.previousWorkingStatus !== "") {

			// }
			// 내 화면을 비디오로 변경
			callingLayoutChange("attach", sessionStorage.getItem("m_nickname"), 0)
			$("#myvideo").show()

			if (callStore.videoMainIndex == 0) {
				mainVideoChangeFunc(1, "localstream")
				$("#videoMainCaption").html(sessionStorage.getItem("m_nickname"))
			}

			sfutest.unmuteVideo()

			// signalling socket video on emit
			const obj = {
				rfid: myid,
				status: 1
			}

			const json = JSON.stringify(obj)
			$signallingSocket.emit("videoOnOff", json)
			console.log("*** socket: emit videoOnOff. json: " + json)
		}
		// 일정 시간 간격으로 main video.srcObject 의 값이 있는지 체크.
		function main_stream_check() {
			// console.log("----- cunstom.js : function main_stream_check2 -----");
			const mainVideo = document.getElementById("videoMain")

			if (!mainVideo) {
				if (callStoreingLayoutType != 1) {
				} else if (callStoreingLayoutType == 1) {
					// 바둑판일 경우에 메인으로 선택된 사용자가 나갔는지 체크한다.
					// 나갔을 경우 다른 사용자로 메인을 변경한다.

					// mainIndex를 가져온다.
					const mainIndex = callStore.videoMainIndex
					let mainRemoteDom = ""

					// mainIndex가 자신일 경우
					if (mainIndex == 0) {
						// console.log("mainIndex가 자신이다.")
						mainRemoteDom = document.getElementById("myvideo")
					} else {
						// mainIndex가 다른사용자일 경우
						// console.log("mainIndex가 다른사용자이다.")
						mainRemoteDom = document.getElementById("remotevideo" + mainIndex)
					}

					if (mainRemoteDom != null) {
						// console.log("mainRemotedom이 존재한다.")
						if (mainRemoteDom.srcObject == null) {
							// console.log("mainRemotedom의 srcObject가 없다. 즉 사용자가 나갔다.")
							setting_main_video()
						} else {
							// eslint-disable-next-line no-lonely-if
							if (mainRemoteDom.srcObject.active == false) {
								// console.log("----- remote 화면의 사용자가 나갔다. (검정 화면)")
								setting_main_video()
							} else {
								// console.log("----- main 화면에 정상적으로 나온다")
							}
						}
					} else {
						// mainDom이 없을 경우에 메인 사용자가 나간 것으로 간주한다.
						setting_main_video()
					}
				}
				return
			}

			// main 화면이 없는 상태라면 접속해있는 remote가 있는지 체크하여 있다면 넣어주고, 없다면 pass.
			if (mainVideo.srcObject == null) {
				// console.log("----- main 화면에 아무것도 재생되고 있지 않다. (흰 화면)");
				insert_main_video(mainVideo)
			} else {
				// console.log("----- main 화면에 무언가 재생되고 있거나, 재생되었었다.")
				// eslint-disable-next-line no-lonely-if
				if (mainVideo.srcObject.active == false) {
					// console.log("----- main 화면의 remote가 나갔다. (검정 화면)")
					insert_main_video(mainVideo)
				} else {
					// console.log("----- main 화면에 무언가 재생되고 있다.");
				}
			}
		}
		// main_video에 mediaStream을 넣어주는 과정
		function insert_main_video(mainVideo) {
			// console.log("*** methods: insert_main_video")
			// 화면 공유 또는 드로잉일 경우 자신이 메인이다.
			if (
				commonStore.isShare == true ||
				commonStore.isDrawing == true
			) {
				if (mainVideo != null && $("#myvideo")[0] != null) {
					mainVideo.srcObject = $("#myvideo")[0].srcObject
					$("#videoMainCaption").html(sessionStorage.getItem("m_nickname"))
					// Main Index 관리
					callStore.setVideoMainIndex(0)
					return
				}
			}

			let i = 0

			// currentRoomCount = 방안의 사용자 수
			for (i = 1; i < currentRoomNumberCount; i++) {
				const remoteTemp = document.getElementById("remotevideo" + i)

				// remotevideo N을 반복하며 해당 엘리먼트가 있다면 해당 video를 넣어준다.
				if (remoteTemp != null) {
					// videoMain Index가 자신일 경우
					if (callStore.videoMainIndex == 0) {
						console.log("*** methods: insert_main_video - mainIndex = 자신")

						const localVideo = document.getElementById("myvideo")
						mainVideo.srcObject = localVideo.srcObject

						// 자신의 이름 받아오고 Main에 넣어주기
						$("#videoMainCaption").html(sessionStorage.getItem("m_nickname"))

						// Main Index 관리
						$store.commit(
							"call/setVideoMainIndex",
							callStore.videoMainIndex
						)

						// 다른 사용자에게 호스트가 바라보는 비디오가 바뀌었음을 알림.
						console.log("hostSelectedMainVideo 1")
						if (videoCallHost) {
							hostSelectedMainVideo(myid)
						}

						// border Color Change
						mainVideoBorder(callStore.videoMainIndex)

						// videoOFF 일 경우 예외처리 mainVideo Change
						mainVideoChangeFunc("localstream", 1)
					} else if (
						// LayoutChange 시 MainIndex가 없다면 Main Index = 1 설정 (ex: 바둑판 -> 하단정렬 이동 시 예외처리)
						// MainIndex 존재, Feeds 존재 한다면 VideoMain으로 보여준다.
						callStore.videoMainIndex != "" &&
						feeds[callStore.videoMainIndex] != null &&
						callStore.videoMainIndex == i
					) {
						// LayoutChange 시 MainIndex가 있다면, Main Image를 변경하고 for문을 멈춘다.
						console.log("*** methods: insert_main_video - MainIndex exist.")
						// console.log("MainIndex 존재한다.")
						// console.log(
						//  "remotevideo" +
						//      callStore.videoMainIndex +
						//      "의 영상이 main으로 들어온다."
						// )
						mainVideo.srcObject = remoteTemp.srcObject

						// remote의 이름 받아오고 Main에 넣어주기
						const remoteCaption = $(
							"#remoteCaption" + callStore.videoMainIndex
						).text()
						// console.log("remoteCaption = " + remoteCaption)

						$("#videoMainCaption").html(remoteCaption)

						// Main Index 관리
						$store.commit(
							"call/setVideoMainIndex",
							callStore.videoMainIndex
						)

						// border Color Change
						mainVideoBorder(i)

						// videoOFF 일 경우 예외처리
						if (
							commonStore.userListStatus[
								callStore.videoMainIndex
							].status == "unpublished"
						) {
							// videoOFF 일 경우 예외처리 mainVideo Change
							mainVideoChangeFunc(0, remoteCaption)
						} else {
							// videoON 일 경우 예외처리 mainVideo Change
							mainVideoChangeFunc(1, remoteCaption)
						}

						// 다른 사용자에게 호스트가 바라보는 비디오가 바뀌었음을 알림.
						console.log("hostSelectedMainVideo 2")
						if (videoCallHost) {
							hostSelectedMainVideo(feeds[i].rfid)
						} else {
							let curMainVideoZoomLevel = commonStore.userListStatus[callStore.videoMainIndex].zoomLevel
							document.getElementById("videoMain").style.scale = `${(100 * curMainVideoZoomLevel)}%`
						}

						break
						// VideoMainIndex 가 null일 경우 처음 사용자를 보여준다.
					} else if (callStore.videoMainIndex == "") {
						console.log("*** methods: insert_main_video - videoMainIndex Null ")
						// console.log("remotevideo" + i + "의 영상이 main으로 들어온다.")
						mainVideo.srcObject = remoteTemp.srcObject

						// remote의 이름 받아오고 Main에 넣어주기
						const remoteCaption = $("#remoteCaption" + i).text()
						// console.log("remoteCaption = " + remoteCaption)

						$("#videoMainCaption").html(remoteCaption)

						// Main Index 관리
						callStore.setVideoMainIndex(i)

						// border Color Change
						mainVideoBorder(i)

						// 다른 사용자에게 호스트가 바라보는 비디오가 바뀌었음을 알림.
						console.log("hostSelectedMainVideo 3")
						if (videoCallHost) {
							hostSelectedMainVideo(feeds[i].rfid)
						}

						break
						// VideoMainIndex는 존재하지만, Feeds가 Null (현재 나간상태)일 경우 처음 들어온 사람을 보여준다.
					} else if (
						callStore.videoMainIndex != "" &&
						feeds[callStore.videoMainIndex] == null
					) {
						console.log(
							"*** methods: insert_main_video - videoMainIndex 존재하지만 현재 나간 상태."
						)
						// console.log("remotevideo" + i + "의 영상이 main으로 들어온다.")
						mainVideo.srcObject = remoteTemp.srcObject

						// remote의 이름 받아오고 Main에 넣어주기
						const remoteCaption = $("#remoteCaption" + i).text()
						// console.log("remoteCaption = " + remoteCaption)

						$("#videoMainCaption").html(remoteCaption)

						// Main Index 관리
						callStore.setVideoMainIndex(i)

						// border Color Change
						mainVideoBorder(i)

						// videoOFF 일 경우 예외처리 mainVideo Change
						mainVideoChangeFunc(1, remoteCaption)

						// 다른 사용자에게 호스트가 바라보는 비디오가 바뀌었음을 알림.
						console.log("hostSelectedMainVideo 4")
						if (videoCallHost) {
							hostSelectedMainVideo(feeds[i].rfid)
						}

						break
					}
				}

				// 상대방이 없을 경우 자신의 화면을 보여준다.
				if (i == currentRoomNumberCount - 1) {
					if ($("#myvideo").length === 0) {
						// console.log("----- main 화면에 넣어줄 remote 가 아무도 없다.")
						$("#videoMainCaption").html("")
					} else {
						if (commonStore.isVideo) {
							// videoOFF 일 경우 예외처리 mainVideo Change
							mainVideoChangeFunc(0, "localstream")
						} else {
							mainVideoChangeFunc(1, "localstream")
						}
						// 파일 송신중에 퇴장했을 경우

						// 파일 수신중에 퇴장했을 경우

						// 다른 사용자에게 호스트가 바라보는 비디오가 바뀌었음을 알림.
						console.log("hostSelectedMainVideo 5")
						if (videoCallHost) {
							hostSelectedMainVideo(myid)
						}

						mainVideo.srcObject = $("#myvideo")[0].srcObject
						$("#videoMainCaption").html(sessionStorage.getItem("m_nickname"))
						// Main Index 관리
						callStore.setVideoMainIndex(0)
					}
				}
			}
		}
		// 바둑판 레이아웃에서 이전 메인 사람이 나갔으므로 다른 사용자로 메인을 변경해주는 함수
		function setting_main_video() {
			// currentRoomCount = 방안의 사용자 수
			for (let i = 1; i < currentRoomNumberCount; i++) {
				const remoteTemp = document.getElementById("remotevideo" + i)

				// remotevideo N을 반복하며 해당 엘리먼트가 있다면 해당 video를 넣어준다.
				if (remoteTemp != null) {
					// videoMain Index가 자신일 경우
					if (callStore.videoMainIndex == 0) {
						console.log("*** methods: setting_main_video - mainIndex = 자신")

						// Main Index 관리
						$store.commit(
							"call/setVideoMainIndex",
							callStore.videoMainIndex
						)

						// 다른 사용자에게 호스트가 바라보는 비디오가 바뀌었음을 알림.
						console.log("hostSelectedMainVideo 6")
						if (videoCallHost) {
							hostSelectedMainVideo(myid)
						}

						// border Color Change
						mainVideoBorder(callStore.videoMainIndex)
					} else if (
						// LayoutChange 시 MainIndex가 없다면 Main Index = 1 설정 (ex: 바둑판 -> 하단정렬 이동 시 예외처리)
						// MainIndex 존재, Feeds 존재 한다면 VideoMain으로 보여준다.
						callStore.videoMainIndex != "" &&
						feeds[callStore.videoMainIndex] != null &&
						callStore.videoMainIndex == i
					) {
						// LayoutChange 시 MainIndex가 있다면, Main Image를 변경하고 for문을 멈춘다.
						console.log("*** methods: setting_main_video - MainIndex exist.")

						// Main Index 관리
						$store.commit(
							"call/setVideoMainIndex",
							callStore.videoMainIndex
						)

						// border Color Change
						mainVideoBorder(i)

						// 다른 사용자에게 호스트가 바라보는 비디오가 바뀌었음을 알림.
						console.log("hostSelectedMainVideo 7")
						if (videoCallHost) {
							hostSelectedMainVideo(feeds[i].rfid)
						}

						break
						// VideoMainIndex 가 null일 경우 처음 사용자를 보여준다.
					} else if (callStore.videoMainIndex == "") {
						console.log(
							"*** methods: setting_main_video - videoMainIndex Null "
						)

						// Main Index 관리
						callStore.setVideoMainIndex(i)

						// border Color Change
						mainVideoBorder(i)

						// 다른 사용자에게 호스트가 바라보는 비디오가 바뀌었음을 알림.
						console.log("hostSelectedMainVideo 8")
						if (videoCallHost) {
							hostSelectedMainVideo(feeds[i].rfid)
						}

						break
						// VideoMainIndex는 존재하지만, Feeds가 Null (현재 나간상태)일 경우 처음 들어온 사람을 보여준다.
					} else if (
						callStore.videoMainIndex != "" &&
						feeds[callStore.videoMainIndex] == null
					) {
						console.log(
							"*** methods: setting_main_video - videoMainIndex 존재하지만 현재 나간 상태."
						)

						// Main Index 관리
						callStore.setVideoMainIndex(i)

						// border Color Change
						mainVideoBorder(i)

						// 다른 사용자에게 호스트가 바라보는 비디오가 바뀌었음을 알림.
						console.log("hostSelectedMainVideo 9")
						if (videoCallHost) {
							hostSelectedMainVideo(feeds[i].rfid)
						}

						break
					}
				}

				// 상대방이 없을 경우 자신의 화면을 보여준다.
				if (i == currentRoomNumberCount - 1) {
					if ($("#myvideo").length === 0) {
						// console.log("----- main 화면에 넣어줄 remote 가 아무도 없다.")
						// $("#videoMainCaption").html("")
					} else {
						console.log(
							"*** methods: setting_main_video - 방에 아무도 없으므로 자신이 메인"
						)
						// 다른 사용자에게 호스트가 바라보는 비디오가 바뀌었음을 알림.
						console.log("hostSelectedMainVideo 10")
						if (videoCallHost) {
							hostSelectedMainVideo(myid)
						}

						// Main Index 관리
						callStore.setVideoMainIndex(0)
					}
				}
			}
		}
		// 자신의 모니터 화면을 공유하는 기능 type = true 모니터 화면 공유, type = false 카메라 영상 공유
		function screenShare(type) {
			console.log("*** methods: screenShare")
			// console.log("****** 화면 공유 플래그 type = ", type)
			// 
			console.log("globalVideoSend = ", globalVideoSend)
			console.log("globalAudioSend = ", globalAudioSend)

			// const useAudio = true
			const useAudio = globalAudioSend
			let videoOrScreen = "stdres-16:9" // 영상을 stdres로 보여주는지 hires로 보여주는지 전역 변수로 사용되면 좋을 듯 하다.

			if (type) {
				videoOrScreen = "screen"
				// console.log("공유한다.")
			} else {
				// 전역으로 관리되는 카메라 장치 값이 true 라면 카메라 공유를 하겠지만, false라면 video None을 사용
				if (globalVideoSend) {
					videoOrScreen = "stdres-16:9"
				} else {
					videoOrScreen = "videoNone"
				}
				// console.log("공유하지 않는다.")

				if (myVideoCheckInterval != null) {
					// console.log("****** Interval이 null이 아니다. clear 해준다.")
					clearInterval(myVideoCheckInterval) // 자기 자신 인터벌 클리어
				}

				/* 21-07-26 드로잉 관련 기능 분리 */
				// // drawing 일 경우 공유 중지 클릭 시
				// // 드로잉 숨김 및 드로잉 버튼 변경
				// if (commonStore.isDrawing) {
				//  $store.commit("isDrawing")
				// }

				// 화면 공유 전 나의 상태가 video OFF 였다면 videoOFF 상태로 돌려주기.
				if (callStore.myVideoStatus == "videoOFF") {
					$store.commit("isVideo")
				}
			}

			// mic가 off일 경우 mic 음소거 처리
			let replaceAudioResult = ""
			if (commonStore.isSounded) {
				replaceAudioResult = false
			} else {
				replaceAudioResult = true
			}
			console.log(
				"createOffer 전 globalVideoSend = ",
				globalVideoSend
			)
			sfutest.createOffer({
				media: {
					audioRecv: false,
					videoRecv: false,
					audioSend: useAudio,
					// videoSend: true,
					videoSend: globalVideoSend,
					replaceAudio: replaceAudioResult, // peer 재협상 시 true 필요 -> 원래는 true였으나 현재내 마이크 상태에 따라 true false 설정 으로 변경  20210426 : ksh
					replaceVideo: true, // peer 재협상 시 true 필요
					video: videoOrScreen, // screen 공유 시 "screen"
					// =>kyj
					data: true
					// <=kyj
				},
				success(jsep) {
					$Janus.debug("Got publisher SDP!", jsep)
					const publish = {
						request: "configure",
						audio: useAudio,
						video: true
					}

					sfutest.send({ message: publish, jsep })

					if (type) {
						console.log(" type == true !!")
						// 내 자신이 videoOFf 일 경우 MyVideoStatus를 videoOFF로 저장하고,
						// 현재 비디오를 attach로 변경한다.
						// 저장하는 이유는, 화면공유를 종료할 때 MyVideoStatus가 videoOFF이면 자신의 카메라 비디오 오프를 해주기 위해서.
						const hostSelectedMainIndex = callStore.videoMainIndex
						if (hostSelectedMainIndex == 0) {
							// video가 Off일 경우 비디오를 켜준다. - 임시
							if (commonStore.isVideo == true) {
								callStore.setMyVideoStatus("videoOFF")
								$store.commit("isVideo")
							}
						} else {
							// 다른사용자(videoOFF상태)가 메인인 경우 - 호스트가 화면 공유를 시작할 때 videoOFF화면이 사라지지않는 버그 처리 ksy
							mainVideoChangeFunc(1, commonStore.userListStatus[hostSelectedMainIndex].text)
						}

						const beforeMainIndex = callStore.videoMainIndex
						// main Index 변경
						callStore.setVideoMainIndex(0)

						// video Layout Type Change
						if (callStoreingLayoutType != 3) {
							// videolayout change
							saveVideoInfo()
						} else {
							const mainIndex = callStore.videoMainIndex
							let video = ""
							if (mainIndex == 0) {
								video = document.getElementById("myvideo")

								const mainVideo = document.getElementById("videoMain")
								mainVideo.srcObject = video.srcObject
								$("#videoMainCaption").html(
									sessionStorage.getItem("m_nickname")
								)

								mainVideoBorder(mainIndex)
							} else {
								video = document.getElementById("remotevideo" + mainIndex)

								const mainVideo = document.getElementById("videoMain")
								mainVideo.srcObject = video.srcObject
								$("#videoMainCaption").html(feeds[mainIndex].rfdisplay)

								// main border 생성
								mainVideoBorder(mainIndex)
								// location.reload()
							}
						}

						// mainVideo Change Duration 보내기
						// hostSelected 호출
						console.log("hostSelectedMainVideo 10")
						hostSelectedMainVideo(myid)

						// 모니터 공유 시에만 interval 생성
						myVideoCheckInterval = setInterval(function() {
							// console.log("*** methods: screenShare - make Interval")
							// if ($("#myvideo")[0].srcObject.getTracks()[1] != undefined) {
							if ($("#myvideo")[0] != null) {
								// console.log(
								//  "readyState = ",
								//  $("#myvideo")[0].srcObject.getTracks()[1].readyState
								// )

								// 영상 공유 시 생성되는 창에서 '공유 중지' 클릭 시 ~~readyState = ended가 된다.
								// 마이크 장치 없이 모니터 공유하는 경우도 발생
								// 오디오미디어스트림이 없으니 [1]를 찾을 수 없다는 error 발생
								// srcObject.getTracks()[1]이 아니라 srcObject.getVideoTracks() 로 바꾼다.
								if (
									// $("#myvideo")[0].srcObject.getTracks()[1].readyState ==
									$("#myvideo")[0].srcObject.getVideoTracks()[0].readyState ==
									"ended"
								) {
									$store.commit("isShare") // side bar 영상공유 버튼 값 변경
									// screenShare(false);             // 모니터 공유 -> 내 카메라 영상 공유

									/* 21-07-26 드로잉 관련 기능 분리 */
									// // drawing 일 경우 공유 중지 클릭 시
									// // 드로잉 숨김 및 드로잉 버튼 변경
									// if (commonStore.isDrawing) {
									//  $store.commit("isDrawing")
									// }
								}
							} else {
								console.log(" type == false !!")
							}
						}, 1000)

						// console.log("반짝반짝 효과 끄기")
						// clearInterval(callDivInterval)
						// const callDiv = document.getElementById("callDiv")
						// callDiv.style.border = "none"

						// 문서공유 알림
						const obj = {
							rfid: myid,
							status: 1
						}

						const sendJson = JSON.stringify(obj)
						$signallingSocket.emit("screenSharing", sendJson)
						console.log("*** socket: emit screenSharing. json: " + sendJson)

						// 1번레이아웃에서 다른사용자가 메인일 때 드로잉을 시작한경우 3번레이아웃으로 바뀌면서
						// 호스트가 메인이되며 기존 메인이였던 사용자의 화면 비율을 원래대로 돌려야한다.
						if (beforeMainIndex == 0) {
							// console.log(document.getElementById("myvideo"))
							document.getElementById("myvideo").style.scale = 1
						} else if (beforeMainIndex !== 0 && feeds.length !== 0) {
							// console.log(document.getElementById("remotevideo" + beforeMainIndex))
							document.getElementById("remotevideo" + beforeMainIndex).style.scale = 1
						}
					} else {
						// console.log("type == false !! ")
						// if (commonStore.isVideo == true) {
						//  $store.commit("isVideo")
						// }

						// 화면공유 -> 드로잉으로 이동하는 것이라면 드로잉을 시작해라.
						console.log("screenMoveToDrawing", callStore.screenMoveToDrawing)

						// noneOverlatyAlert에서 화면공유 중 드로잉으로 이동한다는 것을 true로 설정헌다.
						if (callStore.screenMoveToDrawing) {
							console.log("screenMoveToDrawing true이기 때문에 drawing을 실행합니다.")
							$store.commit("isDrawing")

							// noneOverlatyAlert에서 화면공유 중 드로잉으로 이동한다는 것을 변수에 저장한다.
							// 화면공유 -> 드로잉 이동 시 드로잉 호출 후 초기화
							callStore.setScreenMoveToDrawing(false)
						}
					}
				},
				error(error) {
					$Janus.error("WebRTC error:", error)
					console.log("*** methods: screenShare - WebRTC Error. ", error)
					if (commonStore.isShare) {
						// console.log("어디로 들어오는지 보자. 1")
						// console.log(
						//  "vuex의 값을 수정한다. ",
						//  commonStore.isShare,
						//  " >>> ",
						//  !commonStore.isShare
						// )
						$store.commit("isShare")
					} else {
						// console.log("어디로 들어오는지 보자. 2")
						screenShare(false)
					}
					// 화면 공유 error 발생 시 내 카메라 영상 공유하는 예외처리
					// publishOwnFeed(true);
				}
			})
		}
		function unpublishOwnFeed() {
			// Unpublish our stream
			console.log("*** methods: unpublishOwnFeed")
			const unpublish = { request: "unpublish" }
			sfutest.send({ message: unpublish })
		}
		function newRemoteFeed(id, display, audio, video) {
			console.log("*** methods: newRemoteFeed")
			// console.log("****** function newRemoteFeed - id = ")
			// console.log(id)
			// console.log("****** function newRemoteFeed - display = ")
			// console.log(display)
			// console.log("****** function newRemoteFeed - audio = ")
			// console.log(audio)
			// console.log("****** function newRemoteFeed - video = ")
			// console.log(video)

			// A new feed has been published, create a new plugin handle and attach to it as a subscriber
			let remoteFeed = null

			// 주요 로직
			janus.attach({
				plugin: "janus.plugin.videoroom",
				opaqueId: opaqueId,
				success(pluginHandle) {
					console.log("*** methods: newRemoteFeed success")
					// console.log(
					//  "****** function newRemoteFeed() - success: function() - pluginHandle = "
					// )
					// console.log(pluginHandle)

					remoteFeed = pluginHandle
					remoteFeed.simulcastStarted = false
					$Janus.log(
						"Plugin attached! (" +
							remoteFeed.getPlugin() +
							", id=" +
							remoteFeed.getId() +
							")"
					)
					$Janus.log("  -- This is a subscriber")
					// We wait for the plugin to send us an offer
					// 입장 요청을 하기 위한 정보를 담아둠.
					const subscribe = {
						request: "join",
						room: myroom,
						ptype: "subscriber",
						feed: id,
						private_id: mypvtid
					}
					// In case you don't want to receive audio, video or data, even if the
					// publisher is sending them, set the 'offer_audio', 'offer_video' or
					// 'offer_data' properties to false (they're true by default), e.g.:
					//      subscribe["offer_video"] = false;
					// For example, if the publisher is VP8 and is Safari, let's avoid video
					if (
						$Janus.webRTCAdapter.browserDetails.browser === "safari" &&
						(video === "vp9" || (video === "vp8" && !$Janus.safariVp8))
					) {
						if (video) video = video.toUpperCase()
						toastr.warning(
							"Publisher is using " +
								video +
								", but Safari doesn't support it: disabling video"
						)
						subscribe.offer_video = false
					}
					remoteFeed.videoCodec = video

					// 방 인원수를 체크하여 동적으로 CallingWindow 생성
					checkRoomNumberCount()

					// 초대 중일 경우 사용자가 들어왔으니 팝업 hide
					if (sessionStorage.getItem("m_inviting") === "true") {
						/* 기존에는 닉네임이였으나, 상대방이 영문일 경우 nickname을 비교할 수 있는 방법이 없으므로, deviceid로 비교 */

						// 기존에는 display 하나 있었으나, display 안에 #구분자로 deviceid를 넣게 되어 getFeedsDisplay function 호출
						const newDeviceid = getFeedsDisplay("deviceid", display)
						// 내가 갖고 있는 통화 상대의 id와 야누스가 갖고 있는 통화 상대의 id가 같을 경우 팝업 hide
						if (sessionStorage.getItem("m_remote_deviceid") == newDeviceid) {
							sessionStorage.removeItem("m_inviting")

							// 연락처 목록이 열려있을 경우 연락처 목록 닫기
							if (callStore.isContactListShow) {
								callStore.setContactListShow()
							}

							// 팝업 닫기
							$modal.hide("modal")
						}
					}
					// 입장 요청
					remoteFeed.send({ message: subscribe })
				},
				error(error) {
					$Janus.error("  -- Error attaching plugin...", error)
					alert("Error attaching plugin... " + error)
				},
				// 서버로부터 메세지 수신
				onmessage(msg, jsep) {
					console.log("*** methods: newRemoteFeed - onmessage")
					// console.log("****** function newRemoteFeed() - onmessage - msg = ")
					// console.log(msg)
					// console.log("****** function newRemoteFeed() - onmessage - jsep = ")
					// console.log(jsep)

					const event = msg.videoroom
					console.log(
						"*** methods: newRemoteFeed - onmessage. event = " + event
					)
					// console.log("****** function newRemoteFeed() - onmessage - event = ")
					// console.log(event)

					if (msg.error) {
						alert(msg.error)
					} else if (event) {
						if (event === "attached") {
							// Subscriber created and attached
							for (let i = 1; i < currentRoomNumberCount - 1; i++) {
								if (!feeds[i]) {
									feeds[i] = remoteFeed
									console.log("remoteFeeds", remoteFeed)
									// console.log("****** feeds 할당: ", feeds)

									remoteFeed.rfindex = i

									// feeds Length 관리
									// setUserListLength()
									// 사용자 추가
									// addUserListStatus()
									break
								}
							}

							remoteFeed.rfid = msg.id

							remoteFeed.rfdisplay = getFeedsDisplay(
								"display",
								msg.display
							)

							// rfdeviceid 추가 : 상대방의 deviceid를 알아야 하므로 추가.
							remoteFeed.rfdeviceid = getFeedsDisplay(
								"deviceid",
								msg.display
							)

							// nickname 추가 : 상대방의 nickname를 알아야 하므로 추가.
							remoteFeed.nickname = customUserNickname(remoteFeed.rfdeviceid)

							// 참여자 계산
							getPersonnelInRoom()

							if (!remoteFeed.spinner) {
								const target = document.getElementById(
									"videoremote" + remoteFeed.rfindex
								)
								remoteFeed.spinner = new Spinner({ top: 100 }).spin(target)
							} else {
								remoteFeed.spinner.spin()
							}
							$Janus.log(
								"Successfully attached to feed " +
									remoteFeed.rfid +
									" (" +
									// remoteFeed.rfdisplay +
									getFeedsDisplay("display", remoteFeed.rfdisplay) +
									") in room " +
									msg.room
							)
							$Janus.log(
								"----- function newRemoteFeed: onmessage ----- Successfully attached to feed " +
									remoteFeed.rfid +
									" (" +
									remoteFeed.rfdisplay +
									") in room " +
									msg.room
							)
							$("#remote" + remoteFeed.rfindex)
								.removeClass("hide")
								.html(remoteFeed.rfdisplay)
								.show()

							$nextTick(() => {
								setAudioOutput()
							})
						} else if (event === "event") {
							// Check if we got a simulcast-related event from publisher
							const substream = msg.substream
							const temporal = msg.temporal
							if (
								(substream !== null && substream !== undefined) ||
								(temporal !== null && temporal !== undefined)
							) {
								if (!remoteFeed.simulcastStarted) {
									remoteFeed.simulcastStarted = true
									// Add some new buttons
									addSimulcastButtons(
										remoteFeed.rfindex,
										remoteFeed.videoCodec === "vp8" ||
											remoteFeed.videoCodec === "h264"
									)
								}
								// We just received notice that there's been a switch, update the buttons
								updateSimulcastButtons(
									remoteFeed.rfindex,
									substream,
									temporal
								)
							}
						} else if (event === 'slow_link') {
							console.log("slow_link")
							if (document.getElementsByClassName(`no-video-text${remoteFeed.rfindex}`)[0]) document.getElementsByClassName(`no-video-text${remoteFeed.rfindex}`)[0].innerHTML = $t('network down')
						} else {
							// What has just happened?
						}
					}
					if (jsep) {
						console.log("*** methods: onmessage - Handling SDP")
						$Janus.debug("Handling SDP as well...", jsep)
						// Answer and attach
						remoteFeed.createAnswer({
							jsep,
							// Add data:true here if you want to subscribe to datachannels as well
							// (obviously only works if the publisher offered them in the first place)
							media: {
								audioSend: false,
								videoSend: false,
								// =>kyj
								data: true
								// <=kyj
							}, // We want recvonly audio/video
							success(jsep) {
								console.log("*** methods: createAnswer - Got SDP. " + jsep)
								// $Janus.debug("Got SDP!", jsep)
								const body = { request: "start", room: myroom }
								remoteFeed.send({ message: body, jsep })
							},
							error(error) {
								console.log("*** methods: createAnswer WebRTC error. " + error)
								// $Janus.error("WebRTC error:", error)
								// $Janus.log("****** function newRemoteFeed - onmessage")
								alert("WebRTC error... " + error.message)
							}
						})
					}
				},
				iceState(state) {
					// console.log("*** methods: newRemoteFeed - iceState. state = " + state)
					console.log(
						"ICE state of WebRTC PeerConnection newRemoteFeed (feed #" +
							remoteFeed.rfindex +
							") changed to state = " +
							state
					)
					// console.log(
					//  "****** function newRemoteFeed() - iceState: function() - state = "
					// )
					// console.log(state)
					$Janus.log(
						"ICE state of WebRTC PeerConnection (feed #" +
							remoteFeed.rfindex +
							") changed to " +
							state
					)
				},
				webrtcState(on) {
					$Janus.log(
						"$Janus says WebRTC PeerConnection (feed #" +
							remoteFeed.rfindex +
							") is " +
							(on ? "up" : "down") +
							" now"
					)
				},
				onlocalstream(stream) {
					// The subscriber stream is recvonly, we don't expect anything here
					$Janus.log(
						"----- function newRemoteFeed: onlocalstream ----- stream:",
						stream
					)
				},
				onremotestream(stream) {
					console.log("*** methods: onremoteStream")
					// console.log("######## ON REMOTE STREAM 한다 ##########")
					$Janus.debug(
						"Remote feed #" + remoteFeed.rfindex + ", stream:",
						stream
					)
					$Janus.log(
						"----- function newRemoteFeed: onremotestream ----- Remote feed #" +
							remoteFeed.rfindex +
							", stream:",
						stream
					)
					let addButtons = false
					if ($("#remotevideo" + remoteFeed.rfindex).length === 0) {
						addButtons = true

						// video div의 자식 요소를 모두 제거한다.
						// $("#videoremote" + remoteFeed.rfindex).empty()

						// 자신의 언어에 따라 사용자의 닉네임을 바꾸어준다.
						const customNickname = customUserNickname(
							remoteFeed.rfdeviceid
						)

						console.log(
							"*** mounted: newRemoteFeed > customNickname",
							customNickname
						)

						// 상대방 화면을 비디오로 변경
						callingLayoutChange("attach", customNickname, remoteFeed.rfindex)

						// if(videoCallHost) {
						//  hostSelectedMainVideo(remoteFeed.rfid)
						// }
						sessionStorage.setItem("m_callWaiting", "false")

						// 참여자 계산
						getPersonnelInRoom()

						// video div의 테두리를 없앤다.
						// $("#videoremote" + remoteFeed.rfindex).css("border", "none")

						$("#videoremote" + remoteFeed.rfindex).append(
							'<div class="panel-inner" id="panel-inner' +
								remoteFeed.rfindex +
								'" style="width:100%; height:100%;"/>'
						)

						// No remote video yet
						// video를 보여주기 위한 DOM을 생성. But, 재생은 아님. 스피너가 보이는 상태.
						$("#panel-inner" + remoteFeed.rfindex).append(
							'<video class="rounded centered" id="waitingvideo' +
								remoteFeed.rfindex +
								'" width="100%" height="100%" />'
						)

						$("#panel-inner" + remoteFeed.rfindex).append(
							'<video class="rounded centered relative hide" id="remotevideo' + remoteFeed.rfindex + '" width="100%" height="100%" style="object-fit: fill" autoplay playsinline muted="muted" />'
						)

						// 동적으로 생성된 video 태그에 vue가 인식할 수 있도록 onClick 이벤트를 설정하는 부분.
						const video = document.getElementById(
							"remotevideo" + remoteFeed.rfindex
						)

						// 최초로 사용자가 연결되었을 때 부터 Timer 시작
						// callingTimer가 시작했는지 체크
						if (!callingTimerStart) {
							setCallingTimer("start")

							// 사용자가 입장하여 callingTimer을 시작한다.
							callingTimerStart = true
						}

						// 최초 연결된 사용자를 큰 비디오에 표시
						if (sessionStorage.getItem("otherPartyAccess") === "false") {
							sessionStorage.setItem("otherPartyAccess", "true")

							// 통화 수락으로 방에 입장한 경우
							// onlocalstream 보다 on remotestream 을 먼저 접근하므로
							// videoMain 쪽 객체 정의
							if (sessionStorage.getItem("createRoomFlag") === "false") {
							}

							try {
								// 바둑판이 아닐 경우에만 메인화면 교체
								if (callStoreingLayoutType != 1) {
									// 큰 비디오에 적용
									const videoMain = document.getElementById("videoMain")
									videoMain.srcObject = video.srcObject
									// $("#videoMainCaption").html(remoteFeed.rfdisplay)
									$("#videoMainCaption").html(customNickname) // 사용자가 선택한 언어에 따라 닉네임 변경
									// console.log(
									//  "videoMainCaption - 최초 연결: " + remoteFeed.rfdisplay
									// )

									// Main Index 관리
									callStore.
										setVideoMainIndex(
										remoteFeed.rfindex
									)
								}

								// oldDuration 등록을 위한 Flag 설정
								if (videoCallHost) {
									oldDurationFlag = true

									// 바둑판일 경우에 border를 생성한다. -> 바둑판외에는 main_stream_check에서 생성한다.
									if (callStoreingLayoutType == 1) {
										// Main Index 관리
										callStore.setVideoMainIndex(
											remoteFeed.rfindex
										)

										// MainVideo Border Change
										mainVideoBorder(remoteFeed.rfindex)

										// 바로 실행 시 상대방의 remoteStream을 찾지 못하여 오류 발생하므로 시간차 실행
										setTimeout(() => {
											// host가 바라보는 메인 화면으로 변경
											console.log("hostSelectedMainVideo 11")
											hostSelectedMainVideo(remoteFeed.rfid)
										}, 500)
									}
								}

								// Main Index 관리
								callStore.setVideoMainIndex(
									remoteFeed.rfindex
								)
							} catch (error) {
								console.log("*** methods: onremoteStream. try error" + error)
							}
						}

						// 새로운 사용자가 입장 시 방이 전체 음소거 일 경우 음소거 버튼 생성
						if (callStore.allMicMuteFlag == true) {
							setUserListMicMute(remoteFeed.rfindex, true)
						}

						// janus destroy 시 이전 사용자들은 남겨야 하기 때문에 다시 한번 remoteStream을 호출한다.
						video.addEventListener("click", function() {
							// video_change(
							// console.log("상대방 Viedo 클릭")

							// 드로잉 할 때는, 메인화면을 변경할 수 없습니다 출력.
							if (commonStore.isDrawing) {
								commonToastMessage(
									$t("toastMessage Drawing NoChangeMainVideo")
								)
								return
							}

							if (videoCallHost) {
								// 바둑판이 아닐 경우
								if (callStoreingLayoutType != 1) {
									// eslint-disable-next-line camelcase
									const main_video = document.getElementById("videoMain")

									// // mainVideo가 videoOff가 아닐 경우 && mainVideo와 현재 클릭한 video가 같다면 변경하지 않도록 하기. (중복클릭 방지)
									// if (
									//  !commonStore.isVideo &&
									//  main_video.srcObject == srcObject
									// ) {
									//  return
									// }

									main_video.srcObject = srcObject
									// $("#videoMainCaption").html(remoteFeed.rfdisplay)
									$("#videoMainCaption").html(customNickname) // 사용자의 언어에 따라 닉네임 변경

									// MainVideo Check
									if (
										callStore.videoMainIndex !=
										remoteFeed.rfindex
									) {
										// $("#videoMainOff").remove()
										// $("#videoMain").show()
										mainVideoChangeFunc(1, customNickname)
									}

									// Main Index 관리
									callStore.setVideoMainIndex(
										remoteFeed.rfindex
									)

									// MainVideo Border Change
									mainVideoBorder(remoteFeed.rfindex)

									// host가 바라보는 메인 화면으로 변경
									console.log("hostSelectedMainVideo 13")
									hostSelectedMainVideo(remoteFeed.rfid)
								} else if (callStoreingLayoutType == 1) {
									// 바둑판 일 경우에도 메인화면을 변경할 수 있도록 수정한다.
									// 실제로 메인 비디오가 존재하지 않기 때문에 mainIndex만 변경하도록 한다.

									// Main Index 관리
									callStore.setVideoMainIndex(
										remoteFeed.rfindex
									)

									// MainVideo Border Change
									mainVideoBorder(remoteFeed.rfindex)

									// host가 바라보는 메인 화면으로 변경
									console.log("hostSelectedMainVideo 14")
									hostSelectedMainVideo(remoteFeed.rfid)
								}
							}
						})

						// remote의 이름을 보여주는 div
						$("#panel-inner" + remoteFeed.rfindex).append(
							'<div class="row items-center" style="position: absolute; bottom: 0px; width: 100%; height: 30px; color: white; background-color: rgba(0, 0, 0, 0.5); padding: 0 7px; z-index: -999;"><span id="remoteCaption' +
								remoteFeed.rfindex +
								'" class="col text-left remoteCaptionName" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 18px;">' +
								customNickname +
								"</span></div>"
						)

						$("#panel-inner" + remoteFeed.rfindex).append(
							'<span class="label label-primary hide" id="curres' +
								remoteFeed.rfindex +
								'" style="position: absolute; bottom: 0px; left: 0px; margin: 15px;"></span>' +
								'<span class="label label-info hide" id="curbitrate' +
								remoteFeed.rfindex +
								'" style="position: absolute; bottom: 0px; right: 0px; margin: 15px;"></span>'
						)

						// Show the video, hide the spinner and show the resolution when we get a playing event
						// 스피너를 없애고, 생성한 비디오 태그에 playing 속성(?)을 바인드. (영상이 재생되도록 하는 것인가? 아니면, 영상이 재생되는 동안 계속 실행되는 것인가? why? curresN.text(해상도) 가 있기 때문에.)
						// 기존
						$("#remotevideo" + remoteFeed.rfindex).bind("playing", function() {
							console.log("*** methods: onremoteStream bind Playing")
							if (remoteFeed.spinner) remoteFeed.spinner.stop()
							remoteFeed.spinner = null
							$("#waitingvideo" + remoteFeed.rfindex).remove()
							if (videoWidth)
								$("#remotevideo" + remoteFeed.rfindex)
									.removeClass("hide")
									.show()
							$Janus.log(
								"----- function newRemoteFeed: onremotestream ----- resolution show "
							)

							// 작은 비디오 화면 오디오 뮤트(영상통화 레이아웃 변경 시 오디오 일시적 안들림 오류)
							// start
							$("#remotevideo" + remoteFeed.rfindex).prop(
								"muted",
								!$("#remotevideo" + remoteFeed.rfindex).prop("muted")
							)
							const audioControl = document.getElementById(
								"audioControl" + remoteFeed.rfindex
							)
							// 레이아웃 변경 해도 안 끊기는 오디오 등록
							audioControl.srcObject = video.srcObject
							// end

							if ($Janus.webRTCAdapter.browserDetails.browser === "firefox") {
								// Firefox Stable has a bug: width and height are not immediately available after a playing
								setTimeout(function() {
									const width = $("#remotevideo" + remoteFeed.rfindex).get(0)
										.videoWidth
									const height = $("#remotevideo" + remoteFeed.rfindex).get(0)
										.videoHeight
									$("#curres" + remoteFeed.rfindex)
										.removeClass("hide")
										.text(width + "x" + height)
										.show()
								}, 2000)
							}
						})
					}

					console.log(
						"*** methods: newRemoteFeed > onremoteStream > user: " +
							remoteFeed.rfdisplay
					)
					console.log(
						"*** methods: newRemoteFeed > onremoteStream > index: " +
							remoteFeed.rfindex
					)

					// video에 넣어주는 스트림을 객체에 저장
					$Janus.attachMediaStream(
						$("#remotevideo" + remoteFeed.rfindex).get(0),
						stream
					)

					console.log(
						"*** methods: newRemoteFeed > onremoteStream > attacheMediaStream"
					)
					// console.log(stream)
					// console.log(stream.getVideoTracks())
					// console.log($("#remotevideo" + remoteFeed.rfindex).get(0))

					const videoTracks = stream.getVideoTracks()
					if (stream.getAudioTracks()[0]) {
						const audioStream = new MediaStream()
						audioStream.addTrack(stream.getAudioTracks()[0])
						const permanantAuido = document.getElementById(`audioControl${remoteFeed.rfindex}`)
						permanantAuido.srcObject = audioStream
					}
					// 스트림이 없을 경우 'No remote video available' 문구 생성
					if (!videoTracks || videoTracks.length === 0) {
						// No remote video
						// 비디오가 없을 경우, hide
						// $("#panel-inner" + remoteFeed.rfindex).hide()
						if (
							$("#videoremote" + remoteFeed.rfindex + " .no-video-container")
								.length === 0
						) {
							$Janus.log(
								"----- function newRemoteFeed: onremotestream ----- no remote video "
							)

							console.log("******** No webcam available ********* onremoteStream")

							$("#panel-inner" + remoteFeed.rfindex).append(
								'<div class="no-video-container" style="position:absolute; top: 20%; left: 10%; font-size:16px;>' +
									'<i class="fa fa-video-camera fa-5 no-video-icon"></i>' +
									`<span class="no-video-text${remoteFeed.rfindex}">No webcam available</span>` +
									"</div>"
							)
						}
					} else {
						// 비디오가 없는 상태에서 벗어난다면, 네모 박스를 없애고 다시 비디오 show()
						console.log(
							"----- function newRemoteFeed: onremotestream ----- on remote video!!!!!!!!!! "
						)

						setTimeout(() => {
							$("#videoremote" + remoteFeed.rfindex + " .no-video-container").remove()
							$("#remotevideo" + remoteFeed.rfindex).removeClass("hide").show()
						}, 3000);


						// $("#panel-inner" + remoteFeed.rfindex).show()
						// // 현재 통신 연결이 불안정에서 안정으로 변경될 때
						// if (
						//  commonStore.userListStatus[remoteFeed.rfindex].status ==
						//  "unstable"
						// ) {
						//  // // 삭제했던 비디오 태그 생성
						//  // $("#videoMainDiv").empty()
						//  // $("#videoMainDiv").css("justify-content", "center")
						//  // $("#videoMainDiv").append(
						//  //  "<div class='panel-inner' id='panel-inner-main' />"
						//  // )
						//  // $("#panel-inner-main").append(
						//  //  '<video id="videoMain" style="height: 100%;" autoplay></video>'
						//  // )
						//  // $("#panel-inner-main").append(
						//  //  "<div class='row items-center' style='position: absolute; bottom: 0px; width: 100%; height: 30px; color: white; background-color: rgba(0, 0, 0, 0.5); padding: 0 15px;'>" +
						//  //      "<span id='videoMainCaption' class='col text-left' style='overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 18px;'>" +
						//  //      remoteFeed.rfdisplay +
						//  //      "</span>" +
						//  //      "</div>"
						//  // )
						//  // $("#panel-inner-main").append(
						//  //  "<span class='label label-primary hide' id='curres-main' style='position: absolute; bottom: 0px; left: 0px; margin: 15px;'></span>" +
						//  //      "<span class='label label-info hide' id='curbitrate-main' style='position: absolute; bottom: 0px; right: 0px; margin: 15px;'></span>"
						//  // )
						//  mainVideoChangeFunc(5, remoteFeed.rfdisplay)

						//  // 불안정 이미지 삭제
						//  callingLayoutChange("attach", remoteFeed.rfdisplay, remoteFeed.rfindex )
						// }
					}
					if (!addButtons) return
					if (
						$Janus.webRTCAdapter.browserDetails.browser === "chrome" ||
						$Janus.webRTCAdapter.browserDetails.browser === "firefox" ||
						$Janus.webRTCAdapter.browserDetails.browser === "safari"
					) {
						$("#curbitrate" + remoteFeed.rfindex)
							.removeClass("hide")
							.show()

						// console.log("@@@@@@@@@@@@@@@@@@@@@")
						// const bitrate = remoteFeed.getBitrate()
						// const height = $("#remotevideo" + remoteFeed.rfindex).get(0)
						//  .videoHeight
						// const deviceType = userListGetDevicetype(
						//  remoteFeed.rfdisplay
						// )

						// bitrateInterval(bitrate, height, deviceType)

						// 실시간으로 bit, 해상도 변경 해주는 interval function
						// bitrateTimer[remoteFeed.rfindex] = setInterval(function() {
						//  // $Janus.log("----- function newRemoteFeed: onremotestream ----- resolution and bitrate Update ");
						//  // Display updated bitrate, if supported
						//  const bitrate = remoteFeed.getBitrate()
						//  $("#curbitrate" + remoteFeed.rfindex).text(bitrate)
						//  // Check if the resolution changed too
						//  const width = $("#remotevideo" + remoteFeed.rfindex).get(0)
						//      .videoWidth
						//  const height = $("#remotevideo" + remoteFeed.rfindex).get(0)
						//      .videoHeight
						//  if (width > 0 && height > 0)
						//      $("#curres" + remoteFeed.rfindex)
						//          .removeClass("hide")
						//          .text(width + "x" + height)
						//          .show()
						// }, 1000)
					}

					// 영상이 재생 중임에도 no webcam 문구가 나타나는 문제 해결 방안으로 remove를 제일 마지막에 둔다.
					if (
						$("#videoremote" + remoteFeed.rfindex + " .no-video-container")
							.length != 0
					) {
						console.log(
							"영상이 재생 중임에도 no webcam 문구가 나타났기에 해당 문구를 제거해주겠다."
						)
						$(
							"#videoremote" + remoteFeed.rfindex + " .no-video-container"
						).remove()
					}
					$nextTick(() => {
						setAudioOutput()
					})
				},
				// 해당 비디오의 모든 정보를 제거 (공유하지 않거나 퇴장할 때 호출?)
				oncleanup() {
					$Janus.log(
						" ::: Got a cleanup notification (remote feed " + id + ") :::"
					)
					$Janus.log(
						"----- function newRemoteFeed: oncleanup ----- ::: Got a cleanup notification (remote feed " +
							id +
							") :::"
					)
					if (remoteFeed.spinner) remoteFeed.spinner.stop()
					remoteFeed.spinner = null
					$("#panel-inner" + remoteFeed.rfindex).remove()
					$("#remotevideo" + remoteFeed.rfindex).remove()
					$("#waitingvideo" + remoteFeed.rfindex).remove()
					$("#novideo" + remoteFeed.rfindex).remove()
					$("#curbitrate" + remoteFeed.rfindex).remove()
					$("#curres" + remoteFeed.rfindex).remove()
					// if (bitrateTimer[remoteFeed.rfindex])
					//  clearInterval(bitrateTimer[remoteFeed.rfindex])

					bitrateTimer[remoteFeed.rfindex] = null
					remoteFeed.simulcastStarted = false
					$("#simulcast" + remoteFeed.rfindex).remove()
					// #simulcast 는 뭐지??

					// $("#videoremote" + remoteFeed.rfindex).css(
					//  "border",
					//  "2px dashed rgb(55, 55, 55)"
					// )
					// $("#videoremote" + remoteFeed.rfindex).append(
					//  '<div class="col-12 row justify-center">' +
					//      '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAABHNCSVQICAgIfAhkiAAAAYtJREFUOE/NVbFOAkEQfbMVVlpoY4O2NmIltxujfoEaP0A6W6ysDBA6K3/BHyCWlhizgxYk+AsmdhY06DXcmDEBzwtcFmOUTTa53Z19825m9g1Za0sAakR0iNQQkTtm3kvvpb+ttXUiqmXO2yJyxsw9stbeENFBFuCHwArTHwwG6+ScE12JyJZ6msYwZN85p/c3h8Ph/hjYe08hl/NsrLVtItr9f2Dn3I6INAHcM/NFTkK/GCt9NcyrgCiKjowxLQAt7/1xDvAVAK2yalBcQ4HTDv8WWGOaJMnyiIGIbBtjzgE8iMhlJhS3nU7nPRueiYxHZRNYfkXv/XMocJOINlLGqwDKAF4APKZB4jg+7Xa7r0HAWaP5Sp6qlEoFMzemxTSUsbW2AqCYJMl1kFbMADybVkRRtGCMWYnj+G1SokZ/Oj8iFFjP+MZ4tBCRHhH1U6/tiZmrOYJTIaKTzLkK0JI2DW1NutCgL/5Cz9NO1GDm+ueTLpVKS4VCQR2MhzGmn9eqyuXyGgCdE+98AFoG93t04PIwAAAAAElFTkSuQmCC" />' +
					//      "</div>"
					// )
				},
				// =>kyj
				ondataopen(data) {
					$Janus.log("Other's The DataChannel is available!")
				},
				ondata(data) {
					// DataChannel 기능 제거
					// $Janus.debug("We got data from the DataChannel!", data)
					// // console.log("*** methods: onData json: " + data)
					// // console.log("Other's Ondata json:", data)

					// fileReceiveBuffer.push(data)

					// fileReceivedSize += data.byteLength

					// // console.log("*** methods: onData fileReceivedSize: " + fileReceivedSize)
					// // console.log("*** methods: onData fileReceiveTotalSize: " + fileReceiveTotalSize)

					// // 파일 수신 진행률
					// const rate = Math.round(
					//  (fileReceivedSize / fileReceiveTotalSize) * 100
					// )
					// callStore.setReceptionRate", rate)
					// // console.log("*** methods: onData - file reception rate: " + rate)

					// // 파일 수신 완료
					// if (fileReceivedSize === fileReceiveTotalSize) {
					//  console.log("*** methods: onData - Received File Save Start")

					//  const received = new Blob(fileReceiveBuffer)

					//  const url = window.URL.createObjectURL(received)
					//  const a = document.createElement("a")
					//  a.style.display = "none"
					//  a.href = url

					//  // PC에 저장
					//  const fname = getImageFileName(receiveFileType)
					//  // console.log("***** image file name: ".concat(fname))
					//  a.download = fname
					//  document.body.appendChild(a)
					//  a.click()
					//  setTimeout(() => {
					//      document.body.removeChild(a)
					//      window.URL.revokeObjectURL(url)
					//  }, 100)

					//  // $("#panel-inner" + 0).hide()

					//  // 로컬 일 경우에는 썸네일에 추가 되지 않음 - url알 수 없음.
					//  // 로컬 일 경우에는 미리보기만 출력
					//  // if (window.location.hostname == "localhost") {
					//  //  previewModal(url)
					//  // }

					//  // 파일을 다 전송 받았을때의 처리
					//  // const remoteDeviceId = commonStore.fileReceiver
					//  // const obj = {
					//  //  localdeviceid: sessionStorage.getItem("m_local_deviceid"),
					//  //  remoteDeviceId: remoteDeviceId,
					//  //  status: 1
					//  // }

					//  // const sendJson = JSON.stringify(obj)
					//  // $signallingSocket.emit("fileTransferFinish", sendJson)

					//  /* 고화질 캡쳐와 분기처리 */
					//  if (callStore.HQCaptureFlag) {
					//      // 파일 송수신 중 초기화
					//      sessionStorage.setItem("fileSendingFlag", false)

					//      // 파일 송수신 flag 초기화
					//      $store.commit("fileSendStatus", 0)

					//      // 파일 송수신 진행률 초기화
					//      callStore.setReceptionRate", 0)

					//      callingLayoutChange("attach", sessionStorage.getItem("m_nickname"), 0)

					//      // leftSidebar 고화질 캡쳐 버튼 초기화
					//      callStore.setHQCaptrueFlag", false)
					//      $("#myvideo").show()
					//  } else {
					//      callingLayoutChange(5, sessionStorage.getItem("m_nickname"), 0)

					//      setTimeout(() => {
					//          let message = ""
					//          if (loginStore.lang == "ko") {
					//              message =
					//                  commonStore.fileSendNickname +
					//                  $t("fileSending text3")
					//          } else {
					//              message =
					//                  $t("fileSending text3") +
					//                  commonStore.fileSendNickname
					//          }

					//          // 현재시간 UTC 가져오기
					//          const nowDate = getWorldTime()

					//          $set(
					//              chattingStore.chattingMessageList,
					//              chattingFileSendIndex,
					//              {
					//                  type: 0,
					//                  message,
					//                  date: nowDate,
					//                  chattingDate: getChattingTimeZone(nowDate),
					//                  nickname: sessionStorage.getItem("m_nickname"),
					//                  level: 1
					//                  // isReceived: true
					//              }
					//          )

					//          // 파일 송수신 중 초기화
					//          sessionStorage.setItem("fileSendingFlag", false)

					//          // 파일 송수신 flag 초기화
					//          $store.commit("fileSendStatus", 0)

					//          // 파일 송수신 진행률 초기화
					//          callStore.setReceptionRate", 0)

					//          callingLayoutChange("attach", sessionStorage.getItem("m_nickname"), 0)
					//          $("#myvideo").show()
					//          // let previousWork = callStore.previousWorkingStatus
					//          // console.log("파일 수신 완료 후", previousWork)
					//          // if (previousWork != "" && previousWork !== "attach") {
					//          //  callingLayoutChange(previousWork, sessionStorage.getItem("m_nickname"), 0)
					//          // } else {
					//          //  callingLayoutChange("attach", sessionStorage.getItem("m_nickname"), 0)
					//          //  $("#myvideo").show()
					//          // }
					//          // 파일 수신중 이전작업상태값 초기화
					//          // callStore.setPreviousWorking", "")
					//          // $("#panel-inner" + 0).show()

					//      }, 2000)
					//  }
					// }
					// // else {
					// //   console.log("*** methods: onData - Received File Save ing")
					// //   // 파일을 다 전송 받았을때의 처리
					// //   const remoteDeviceId = commonStore.fileReceiver
					// //   const obj = {
					// //       localdeviceid: sessionStorage.getItem("m_local_deviceid"),
					// //       remoteDeviceId: remoteDeviceId,
					// //       status: 0
					// //   }

					// //   const sendJson = JSON.stringify(obj)
					// //   $signallingSocket.emit("fileTransferFinish", sendJson)
					// // }
				}
				// <=kyj
			})
		}
		function addSimulcastButtons(feed, temporal) {
			const index = feed
			$("#remote" + index)
				.parent()
				.append(
					'<div id="simulcast' +
						index +
						'" class="btn-group-vertical btn-group-vertical-xs pull-right">' +
						'   <div class"row">' +
						'       <div class="btn-group btn-group-xs" style="width: 100%">' +
						'           <button id="sl' +
						index +
						'-2" type="button" class="btn btn-primary" data-toggle="tooltip" title="Switch to higher quality" style="width: 33%">SL 2</button>' +
						'           <button id="sl' +
						index +
						'-1" type="button" class="btn btn-primary" data-toggle="tooltip" title="Switch to normal quality" style="width: 33%">SL 1</button>' +
						'           <button id="sl' +
						index +
						'-0" type="button" class="btn btn-primary" data-toggle="tooltip" title="Switch to lower quality" style="width: 34%">SL 0</button>' +
						"       </div>" +
						"   </div>" +
						'   <div class"row">' +
						'       <div class="btn-group btn-group-xs hide" style="width: 100%">' +
						'           <button id="tl' +
						index +
						'-2" type="button" class="btn btn-primary" data-toggle="tooltip" title="Cap to temporal layer 2" style="width: 34%">TL 2</button>' +
						'           <button id="tl' +
						index +
						'-1" type="button" class="btn btn-primary" data-toggle="tooltip" title="Cap to temporal layer 1" style="width: 33%">TL 1</button>' +
						'           <button id="tl' +
						index +
						'-0" type="button" class="btn btn-primary" data-toggle="tooltip" title="Cap to temporal layer 0" style="width: 33%">TL 0</button>' +
						"       </div>" +
						"   </div>" +
						"</div>"
				)
			// Enable the simulcast selection buttons
			$("#sl" + index + "-0")
				.removeClass("btn-primary btn-success")
				.addClass("btn-primary")
				.unbind("click")
				.click(function() {
					toastr.info(
						"Switching simulcast substream, wait for it... (lower quality)",
						null,
						{ timeOut: 2000 }
					)
					if (!$("#sl" + index + "-2").hasClass("btn-success"))
						$("#sl" + index + "-2")
							.removeClass("btn-primary btn-info")
							.addClass("btn-primary")
					if (!$("#sl" + index + "-1").hasClass("btn-success"))
						$("#sl" + index + "-1")
							.removeClass("btn-primary btn-info")
							.addClass("btn-primary")
					$("#sl" + index + "-0")
						.removeClass("btn-primary btn-info btn-success")
						.addClass("btn-info")
					feeds[index].send({
						message: { request: "configure", substream: 0 }
					})
				})
			$("#sl" + index + "-1")
				.removeClass("btn-primary btn-success")
				.addClass("btn-primary")
				.unbind("click")
				.click(function() {
					toastr.info(
						"Switching simulcast substream, wait for it... (normal quality)",
						null,
						{ timeOut: 2000 }
					)
					if (!$("#sl" + index + "-2").hasClass("btn-success"))
						$("#sl" + index + "-2")
							.removeClass("btn-primary btn-info")
							.addClass("btn-primary")
					$("#sl" + index + "-1")
						.removeClass("btn-primary btn-info btn-success")
						.addClass("btn-info")
					if (!$("#sl" + index + "-0").hasClass("btn-success"))
						$("#sl" + index + "-0")
							.removeClass("btn-primary btn-info")
							.addClass("btn-primary")
					feeds[index].send({
						message: { request: "configure", substream: 1 }
					})
				})
			$("#sl" + index + "-2")
				.removeClass("btn-primary btn-success")
				.addClass("btn-primary")
				.unbind("click")
				.click(function() {
					toastr.info(
						"Switching simulcast substream, wait for it... (higher quality)",
						null,
						{ timeOut: 2000 }
					)
					$("#sl" + index + "-2")
						.removeClass("btn-primary btn-info btn-success")
						.addClass("btn-info")
					if (!$("#sl" + index + "-1").hasClass("btn-success"))
						$("#sl" + index + "-1")
							.removeClass("btn-primary btn-info")
							.addClass("btn-primary")
					if (!$("#sl" + index + "-0").hasClass("btn-success"))
						$("#sl" + index + "-0")
							.removeClass("btn-primary btn-info")
							.addClass("btn-primary")
					feeds[index].send({
						message: { request: "configure", substream: 2 }
					})
				})
			if (!temporal)
				// No temporal layer support
				return
			$("#tl" + index + "-0")
				.parent()
				.removeClass("hide")
			$("#tl" + index + "-0")
				.removeClass("btn-primary btn-success")
				.addClass("btn-primary")
				.unbind("click")
				.click(function() {
					toastr.info(
						"Capping simulcast temporal layer, wait for it... (lowest FPS)",
						null,
						{ timeOut: 2000 }
					)
					if (!$("#tl" + index + "-2").hasClass("btn-success"))
						$("#tl" + index + "-2")
							.removeClass("btn-primary btn-info")
							.addClass("btn-primary")
					if (!$("#tl" + index + "-1").hasClass("btn-success"))
						$("#tl" + index + "-1")
							.removeClass("btn-primary btn-info")
							.addClass("btn-primary")
					$("#tl" + index + "-0")
						.removeClass("btn-primary btn-info btn-success")
						.addClass("btn-info")
					feeds[index].send({
						message: { request: "configure", temporal: 0 }
					})
				})
			$("#tl" + index + "-1")
				.removeClass("btn-primary btn-success")
				.addClass("btn-primary")
				.unbind("click")
				.click(function() {
					toastr.info(
						"Capping simulcast temporal layer, wait for it... (medium FPS)",
						null,
						{ timeOut: 2000 }
					)
					if (!$("#tl" + index + "-2").hasClass("btn-success"))
						$("#tl" + index + "-2")
							.removeClass("btn-primary btn-info")
							.addClass("btn-primary")
					$("#tl" + index + "-1")
						.removeClass("btn-primary btn-info")
						.addClass("btn-info")
					if (!$("#tl" + index + "-0").hasClass("btn-success"))
						$("#tl" + index + "-0")
							.removeClass("btn-primary btn-info")
							.addClass("btn-primary")
					feeds[index].send({
						message: { request: "configure", temporal: 1 }
					})
				})
			$("#tl" + index + "-2")
				.removeClass("btn-primary btn-success")
				.addClass("btn-primary")
				.unbind("click")
				.click(function() {
					toastr.info(
						"Capping simulcast temporal layer, wait for it... (highest FPS)",
						null,
						{ timeOut: 2000 }
					)
					$("#tl" + index + "-2")
						.removeClass("btn-primary btn-info btn-success")
						.addClass("btn-info")
					if (!$("#tl" + index + "-1").hasClass("btn-success"))
						$("#tl" + index + "-1")
							.removeClass("btn-primary btn-info")
							.addClass("btn-primary")
					if (!$("#tl" + index + "-0").hasClass("btn-success"))
						$("#tl" + index + "-0")
							.removeClass("btn-primary btn-info")
							.addClass("btn-primary")
					feeds[index].send({
						message: { request: "configure", temporal: 2 }
					})
				})
		}
		function updateSimulcastButtons(feed, substream, temporal) {
			// Check the substream
			const index = feed
			if (substream === 0) {
				toastr.success("Switched simulcast substream! (lower quality)", null, {
					timeOut: 2000
				})
				$("#sl" + index + "-2")
					.removeClass("btn-primary btn-success")
					.addClass("btn-primary")
				$("#sl" + index + "-1")
					.removeClass("btn-primary btn-success")
					.addClass("btn-primary")
				$("#sl" + index + "-0")
					.removeClass("btn-primary btn-info btn-success")
					.addClass("btn-success")
			} else if (substream === 1) {
				toastr.success("Switched simulcast substream! (normal quality)", null, {
					timeOut: 2000
				})
				$("#sl" + index + "-2")
					.removeClass("btn-primary btn-success")
					.addClass("btn-primary")
				$("#sl" + index + "-1")
					.removeClass("btn-primary btn-info btn-success")
					.addClass("btn-success")
				$("#sl" + index + "-0")
					.removeClass("btn-primary btn-success")
					.addClass("btn-primary")
			} else if (substream === 2) {
				toastr.success("Switched simulcast substream! (higher quality)", null, {
					timeOut: 2000
				})
				$("#sl" + index + "-2")
					.removeClass("btn-primary btn-info btn-success")
					.addClass("btn-success")
				$("#sl" + index + "-1")
					.removeClass("btn-primary btn-success")
					.addClass("btn-primary")
				$("#sl" + index + "-0")
					.removeClass("btn-primary btn-success")
					.addClass("btn-primary")
			}
			// Check the temporal layer
			if (temporal === 0) {
				toastr.success("Capped simulcast temporal layer! (lowest FPS)", null, {
					timeOut: 2000
				})
				$("#tl" + index + "-2")
					.removeClass("btn-primary btn-success")
					.addClass("btn-primary")
				$("#tl" + index + "-1")
					.removeClass("btn-primary btn-success")
					.addClass("btn-primary")
				$("#tl" + index + "-0")
					.removeClass("btn-primary btn-info btn-success")
					.addClass("btn-success")
			} else if (temporal === 1) {
				toastr.success("Capped simulcast temporal layer! (medium FPS)", null, {
					timeOut: 2000
				})
				$("#tl" + index + "-2")
					.removeClass("btn-primary btn-success")
					.addClass("btn-primary")
				$("#tl" + index + "-1")
					.removeClass("btn-primary btn-info btn-success")
					.addClass("btn-success")
				$("#tl" + index + "-0")
					.removeClass("btn-primary btn-success")
					.addClass("btn-primary")
			} else if (temporal === 2) {
				toastr.success("Capped simulcast temporal layer! (highest FPS)", null, {
					timeOut: 2000
				})
				$("#tl" + index + "-2")
					.removeClass("btn-primary btn-info btn-success")
					.addClass("btn-success")
				$("#tl" + index + "-1")
					.removeClass("btn-primary btn-success")
					.addClass("btn-primary")
				$("#tl" + index + "-0")
					.removeClass("btn-primary btn-success")
					.addClass("btn-primary")
			}
		}
		// 영상 클릭 시 화면 전환
		function video_change(_this) {
			console.log("*** methods: video_change")
			// console.log("----- calling.vue : methods video_change() -----");
			// console.log("_this.srcObject = " + _this.srcObject);
			// eslint-disable-next-line camelcase
			const main_video = document.getElementById("videoMain")
			main_video.srcObject = _this.srcObject
			$("#videoMainCaption").html(sessionStorage.getItem("m_nickname"))
		}
		// loginUserInfo 요청
		// loginUserInfoRequest() {
		//  const obj = {
		//      deviceid: loginStore.m_local_deviceid,
		//      language: sessionStorage.getItem("languageCode")
		//  }
		//  const json = JSON.stringify(obj)
		//  $signallingSocket.emit("loginUserInfo", json)
		//  console.log("loginUserInfo request:" + json)
		// },
		// Calling Popup
		function changeAlertNum(seq) {
			$store.commit("alert", seq)
		}
		function contentsBtnClick(seq) {
			escapeFullScreen();

			changeAlertNum(seq)
			const modalsContainerStyle = document.getElementById("modalsContainer")
				.style
			modalsContainerStyle.display = "block"
			$modal.show(
				mainModal,
				{},
				{
					name: "modal",
					width:
						accessDeviceCheck !== "Mobile"
							? 700
							: innerWidth - 30 > 700
							? 700
							: "90%",
					height:
						accessDeviceCheck !== "Mobile"
							? 480
							: innerHeight - 30 > 480
							? 480
							: "90%",
					maxWidth: 700,
					maxHeight: 480,
					clickToClose: false
				},
				{
					"before-close": () => {
						modalsContainerStyle.display = "none"
					}
				}
			)
		}
		// -> kyj 통화 화면에서 발신중, 수신중 메세지 표시
		function callingLayoutChange(status, text, col) {
			const nickname = getNickname(text)
			// console.log("*** methods: callingLayoutChange")
			$store.commit("setUserListStatus", {
				text,
				col,
				status,
				nickname
			})
			videoResize()
			// console.log(
			//  "callingLayoutChange: " + commonStore.userListStatus[col].text
			// )
			// console.log(
			//  "callingLayoutChange: " + commonStore.userListStatus[col].status
			// )
		}
		// 멀티통화 거절
		function multiCallingReject(
			localdeviceid,
			remotedeviceid,
			roomid,
			institution,
			nickname
		) {
			const obj = {
				localdeviceid,
				remotedeviceid,
				roomid,
				institution,
				nickname
			}

			const sendJson = JSON.stringify(obj)
			$signallingSocket.emit("multiRefuseCalling", sendJson)
			console.log("*** socket: emit multiRefuseCalling. json: ", sendJson)

			// 멀티통화 수락 거절 화면 숨김
			// 아직 아무도 안들어온 경우
			// 맨 뒤의 숫자를 Feeds Index 번호 부여해야 함
			// for (let i = 1; i < 15; i++) {
			for (let i = 1; i < currentRoomNumberCount; i++) {
				if (!feeds[i]) {
					callingLayoutChange("none", "", i)
					sessionStorage.setItem("m_callWaiting", "false")
					break
				}
			}
		}
		// 멀티통화 수락
		function multiCallingAccept(localdeviceid, remotedeviceid, roomid) {
			const obj = {
				localdeviceid,
				remotedeviceid,
				roomid,
				// 새로운 사용자에게 현재 방에 몇명 있는지 보내준다.
				roomNumberCount: currentRoomNumberCount,
				// 새로운 사용자 입장 시 회의실이라면 meeting_seq를 보내어서 meeting에 접속할 수 있게 한다.
				meeting_seq: commonStore.meeting.meetingSeq,
				unique_roomid: uniqueRoomid // 2021-07-21 추가
			}

			const sendJson = JSON.stringify(obj)
			$signallingSocket.emit("multiCalling", sendJson)

			console.log("*** socket: emit multiCalling. json: ", sendJson)

			// 
			// 멀티통화 수락 클릭 시 통화 연결 중 이미지 전환
			// for (let i = 1; i < 15; i++) {
			for (let i = 1; i < currentRoomNumberCount; i++) {
				if (!feeds[i]) {
					callingLayoutChange("connecting", "", i)

					// 10초 뒤에도 연결 중일 경우 "통신 에러"로 이미지 변경
					setTimeout(function() {
						callingConnectingCheck(i)
					}, 10000)
					break
				}
			}
		}
		// 통화 연결 상태 체크
		function callingConnectingCheck(index) {
			console.log("*** methods: callingConnectingCheck")
			// 연결 중일 경우 error로 이미지 변경
			if (commonStore.userListStatus[index].status == "connecting") {
				// console.log("callingConnectingCheck Result : Fail")
				callingLayoutChange("error", "", index)
				// m_callWaiting false 변경
				sessionStorage.setItem("m_callWaiting", false)
			}
		}
		// mainVideo Show & Hide
		function mainVideoChangeFunc(type, req) {
			// console.log("*** methods: mainVideoChangeFunc", type)
			let name = ""
			if (req == "localstream") {
				name = sessionStorage.getItem("m_nickname")
			} else {
				name = req
			}
			const setNickname = getNickname(name)
			// console.log("name : " + name)
			// type 0 :: videoOFFShow
			// type 1 :: videoOFFHide
			// type 2: mainVideo만 hide
			// type 3 :: videoOFF Vuex init & unstable Vuex init
			// type 4 :: unstable Show
			// type 5 :: unstable OFF
			if (callStoreingLayoutType == 1) {
				// console.log("@@@@@@ Main Video Change :: callingLayout 1")
				return
			}

			if (type == 0) {
				// console.log("mainVideoChange Video OFF")
				const width = $("#videoMainDivWrap").width()
				$("#videoMainDivWrap").css("width", width)

				$("#videoMainDiv").hide()

				$store.commit("setMainVideoStatus", {
					type: "videoOFF",
					text: name,
					nickname: setNickname
				})

				videoOffResult = true
			} else if (type == 1) {
				// console.log("type 1 !!!")
				// width값 수정 한 것 초기화
				$("#videoMainDivWrap").css("width", "")

				// video Show
				$("#videoMainDiv").show()

				// 초기화
				$store.commit("setMainVideoStatus", {
					type: "",
					text: name,
					nickname: setNickname
				})

				videoOffResult = false
			} else if (type == 2) {
				// video Hide
				$("#videoMainDiv").hide()
			} else if (type == 3) {
				$store.commit("setMainVideoStatus", {
					type: "",
					text: name,
					nickname: setNickname
				})
			} else if (type == 4) {
				const width = $("#videoMainDivWrap").width()
				$("#videoMainDivWrap").css("width", width)

				$("#videoMainDiv").hide()

				$store.commit("setMainVideoStatus", {
					type: "unstable",
					text: name,
					nickname: setNickname
				})
			} else if (type == 5) {
				if (videoOffResult == true) {
					$store.commit("setMainVideoStatus", {
						type: "videoOFF",
						text: name,
						nickname: setNickname
					})
				} else {
					// width값 수정 한 것 초기화
					$("#videoMainDivWrap").css("width", "")

					// video Show
					$("#videoMainDiv").show()

					$store.commit("setMainVideoStatus", {
						type: "",
						text: name,
						nickname: setNickname
					})
				}
			}
		}
		function videoLayoutChange() {
			// console.log("*** methods: videoLayoutChange")
			// 
			let newLocalElement = ""
			let videoElement = ""
			setTimeout(function() {
				for (let i = 0; i < currentRoomNumberCount; i++) {
					if (i == 0) {
						newLocalElement = document.getElementById("videolocal")
						newLocalElement.insertAdjacentHTML(
							"beforeend",
							callStore.videoTagArray[0]
						)
						videoElement = document.getElementById("myvideo")
						videoElement.srcObject = callStore.videoStreamArray[0]

						// mainVideo Change click event 생성
						const myvideo = document.getElementById("myvideo")

						myvideo.addEventListener("click", function() {
							// 드로잉 할 때는, 메인화면을 변경할 수 없습니다 출력.
							if (commonStore.isDrawing) {
								commonToastMessage(
									$t("toastMessage Drawing NoChangeMainVideo")
								)
								return
							}

							if (videoCallHost) {
								// 바둑판 형식이 아닐 경우
								if (callStoreingLayoutType != 1) {
									// 메인화면 변경
									video_change(this)

									// 메인화면 Index 관리
									callStore.setVideoMainIndex(0)

									mainVideoChangeFunc(1, "localstream")

									// Main Video Border Change
									mainVideoBorder(0)

									// host가 바라보는 메인 화면으로 변경
									console.log("hostSelectedMainVideo 15")
									hostSelectedMainVideo(myid)
								} else if (callStoreingLayoutType == 1) {
									const beforeMainIndex = callStore.videoMainIndex
									if (beforeMainIndex == 0 && feeds.length !== 0) {
										document.getElementById("myvideo").style.scale = 1
									} else if (beforeMainIndex !== 0 && feeds.length !== 0) {
										document.getElementById("remotevideo" + beforeMainIndex).style.scale = 1
									}

									// 바둑판 일 경우에도 메인화면을 변경할 수 있도록 수정한다.
									// 실제로 메인 비디오가 존재하지 않기 때문에 mainIndex만 변경하도록 한다.

									// 메인화면 Index 관리
									callStore.setVideoMainIndex(0)

									// Main Video Border Change
									mainVideoBorder(0)

									// host가 바라보는 메인 화면으로 변경
									console.log("hostSelectedMainVideo 16")
									hostSelectedMainVideo(myid)
								}
							}
						})
					} else {
						// 해당 예외처리 하게 되면, 중간에 사람이 나가면 그 자리에서 break가 발생하여 주석처리
						// if (feeds[i] == null) {
						//  break
						// }
						// eslint-disable-next-line no-lonely-if
						if (feeds[i] != null) {
							// 중복 생성으로 인한 예외처리 : 이미 paneel inner + i가 존재하지 않을 경우만 만들기
							if (!document.getElementById("panel-inner" + i)) {
								// console.log("panel-inner 존재하지 않음. : panel-inner" + i)
								newLocalElement = document.getElementById("videoremote" + i)
								newLocalElement.insertAdjacentHTML(
									"beforeend",
									callStore.videoTagArray[i]
								)
								videoElement = document.getElementById("remotevideo" + i)
								videoElement.srcObject =
									callStore.videoStreamArray[i]
							}

							/* 바둑판 일 경우에도 메인화면을 클릭할 수 있도록 기능을 변경하므로 주석처리 */
							// 바둑판 형식일 경우 mainVideoBorder 색상 제거
							// if (callStoreingLayoutType == 1) {
							//  const initFindClass = document.getElementsByClassName(
							//      "mainVideoBorder"
							//  )
							//  // console.log(initFindClass[0])

							//  // init
							//  if (initFindClass[0] !== undefined) {
							//      // console.log(initFindClass[0].id)
							//      const initFindElement = document.getElementById(
							//          initFindClass[0].id
							//      )
							//      initFindElement.classList.remove("mainVideoBorder")
							//      initFindElement.style.border = "none"
							//  }
							// }

							// mainVideo Change click event 생성
							const video = document.getElementById("remotevideo" + i)

							video.addEventListener("click", function() {
								// 드로잉 할 때는, 메인화면을 변경할 수 없습니다 출력.
								if (commonStore.isDrawing) {
									commonToastMessage(
										$t("toastMessage Drawing NoChangeMainVideo")
									)
									return
								}

								// video_change(
								if (videoCallHost) {
									// 바둑판 형식일 경우
									if (callStoreingLayoutType != 1) {
										// eslint-disable-next-line camelcase
										const main_video = document.getElementById("videoMain")

										// // mainVideo가 videoOff가 아닐 경우(video가 off이면 해당 영상이 숨겨져있으므로 return 처리만 하게 됨) && mainVideo와 현재 클릭한 video가 같다면 변경하지 않도록 하기. (중복클릭 방지)
										// if (
										//  !commonStore.isVideo &&
										//  main_video.srcObject == srcObject
										// ) {
										//  return
										// }

										main_video.srcObject = srcObject
										// 사용자의 언어에 따라 닉네임 변경
										const customNickname = customUserNickname(
											feeds[i].rfdeviceid
										)
										console.log(
											"*** methods: videoLayoutChange > customNickname: ",
											customNickname
										)
										// $("#videoMainCaption").html(feeds[i].rfdisplay)
										$("#videoMainCaption").html(customNickname)

										// MainVideo Check
										if (
											callStore.videoMainIndex !=
											feeds[i].rfindex
										) {
											// $("#videoMainOff").remove()
											// $("#videoMain").show()
											// mainVideoChangeFunc(1, feeds[i].rfdisplay)
											mainVideoChangeFunc(1, customNickname)
										}
										// const beforeMainIndex = callStore.videoMainIndex
										// if (beforeMainIndex == 0 && feeds.length !== 0) {
										//  document.getElementById("myvideo").style.scale = 1
										// } else if (beforeMainIndex !== 0 && feeds.length !== 0) {
										//  document.getElementById("remotevideo" + beforeMainIndex).style.scale = 1
										// }

										// Main Index 관리
										callStore.setVideoMainIndex(feeds[i].rfindex)

										// MainVideo border Change
										mainVideoBorder(feeds[i].rfindex)

										// host가 바라보는 메인 화면으로 변경
										console.log("hostSelectedMainVideo 17")
										hostSelectedMainVideo(feeds[i].rfid)
									} else if (callStoreingLayoutType == 1) {
										const beforeMainIndex = callStore.videoMainIndex
										if (beforeMainIndex == 0 && feeds.length !== 0) {
											document.getElementById("myvideo").style.scale = 1
										} else if (beforeMainIndex !== 0 && feeds.length !== 0) {
											document.getElementById("remotevideo" + beforeMainIndex).style.scale = 1
										}
										// 바둑판 일 경우에도 메인화면을 변경할 수 있도록 수정한다.
										// 실제로 메인 비디오가 존재하지 않기 때문에 mainIndex만 변경하도록 한다.

										// Main Index 관리
										callStore.setVideoMainIndex(feeds[i].rfindex)

										// MainVideo border Change
										mainVideoBorder(feeds[i].rfindex)

										// host가 바라보는 메인 화면으로 변경
										console.log("hostSelectedMainVideo 18")
										hostSelectedMainVideo(feeds[i].rfid)
									}
								}
							})

							if (i == callStore.videoMainIndex) {
								// console.log("main")
								// console.log(i)
								const width = $("#videoMainDivWrap").width()
								$("#videoMainDivWrap").css("width", width)
								const mainType = commonStore.userListStatus[i].status
								const mainText = commonStore.userListStatus[i].text
								// console.log(mainType)
								// console.log(mainText)
								if (mainType == "unpublished") {
									// Main Video 태그를 jauns에서 만들어주기 때문에, 생성 전 일 수도 있으므로 1초뒤 실행
									mainVideoChangeFunc(0, mainText)
								} else {
									mainVideoChangeFunc(1, mainText)
								}
								mainVideoBorder(i)
							}
						}
					}

					if (i == currentRoomNumberCount - 1) {
						$store.commit("setVideoLayoutChangeResult", false)

						/* motionFailCheck == ture 일 경우 videoLayoutchange를 다시 한다. */
						if (motionFailCheck) {
							setTimeout(() => {
								/* 좌측 정렬이 아닐 경우에만 화면 전환 */
								if (callStoreingLayoutType != 3) {
									saveVideoInfo()
								}

								/* 모션 fail 초기화 */
								motionFailCheck = false
								console.log("motionFailCheck False로 초기화")
							}, 1000)
						}
					}
				}

				// 해당 DOM 이 null 일 경우 재귀함수
				if (newLocalElement == null || videoElement == null) {
					videoLayoutChange()
				}
			}, 2000)
		}
		// 방에 있는 인원수 체크하여 CallingWindow 동적 생성
		function checkRoomNumberCount() {
			console.log("*** methods: checkRoomNumberCount")
			const NullFilterFeeds = feeds.filter(function(item) {
				return item !== null
			})
			// NullFilterFeeds >> 0 (local = empty) 도 Null 값으로 처리하기 때문에 + 1
			if (
				feeds.length == currentRoomNumberCount - 1 &&
				NullFilterFeeds.length + 1 == currentRoomNumberCount - 1
			) {
				// console.log("Feeds의 length가 같다. callinWindow 추가해야 한다.")
				// addUserListStatus
				addUserListStatus()
				// 현재 roomCount 변화
				$store.commit(
					"setRoomNumberCount",
					currentRoomNumberCount + 1
				)
			}
			// feeds length 관리
			$store.commit("setFeedsNumberCount", feeds.length + 1)
		}
		function addUserListStatus() {
			console.log("*** methods: addUserListStatus")
			$store.commit("addUserListStatus")
		}
		function mainVideoBorder(index) {
			/* index :: callinwindow index
				만들어진 태그에 class를 추가하면 vue + nuxt는 알아 듣지 못함.
				class를 init 구분자로 사용
				로컬 일 경우 반응 X
			*/

			// console.log("*** methods: mainVideoBorder")
			// mainVideoBorder Class를 사용하고 있는 Element가 있는지 확인
			const initFindClass = document.getElementsByClassName("mainVideoBorder")

			// console.log("mainVideoBorder index: ".concat(index))
			// console.log("initFindClass: ", initFindClass)

			// local Click 시 mainVideoBorder 숨김
			if (index == 0) {

				if (initFindClass.length == 0) {
					// console.log("index 0 인 경우 initFindClass empty")
					return
				}

				// console.log("index 0 인 경우 initFindClass[0]: ".concat(initFindClass[0]))
				const initFindElement = document.getElementById(initFindClass[0].id)
				initFindElement.classList.remove("mainVideoBorder")
				// initFindElement.style.border = "none"
			} else {
				// if (initFindClass.length == 0) {
				//  console.log("index 0 이 아닌 경우 initFindClass empty")
				//  return
				// }

				// console.log("index 0 이 아닌 경우 initFindClass[0]: ".concat(initFindClass[0]))

				// init (기존 테두리 클리어)
				if (initFindClass.length > 0) {
					console.log("initFindClass[0].id: ".concat(initFindClass[0].id))
					const initFindElement = document.getElementById(initFindClass[0].id)
					initFindElement.classList.remove("mainVideoBorder")
					// initFindElement.style.border = "none"
				}

				// else {
				// border Make
				// const mainVideoElement = document.getElementById("remotevideo" + index)
				// const mainVideoElement = document.getElementById("videoremote" + index)

				// console.log(mainVideoElement)


				// }
				let mainVideoElement = ""
				if (callStoreingLayoutType == 1) {
					mainVideoElement = document.getElementById("videoremote" + index)
					mainVideoElement.classList.add("mainVideoBorder")
					// mainVideoElement.style.border = "4px solid white"
					// mainVideoElement.style.overflow = "hidden"
				} else {
					mainVideoElement = document.getElementById("videoremote" + index)
					mainVideoElement.classList.add("mainVideoBorder")
					// mainVideoElement.style.border = "4px solid white"
				}
			}
		}
		function saveVideoInfo() {
			// console.log("*** methods: saveVideoInfo - changeLayoutType")
			// mask Show
			$store.commit("setVideoLayoutChangeResult", true)

			// 
			videoArray = []
			videoStream = []
			// 이전 비디오 저장
			// for 조건 문 중 해당 기업의 최대 인원 수로 for문 조건
			// if (videoremote + i)의 dom이 없을 경우 break <-- break 하게 되면, 중간에 사람이 나가면 break 되므로 구현하지 않음.
			for (let i = 0; i < commonStore.roomNumberCount; i++) {
				if (i == 0) {
					videoArray[i] = document.getElementById("myvideo").outerHTML
					videoStream[i] = document.getElementById("myvideo").srcObject
				} else {
					const remoteElement = document.getElementById("remotevideo" + i)
					if (remoteElement != null && remoteElement.srcObject != null) {
						videoArray[i] = document.getElementById(
							"panel-inner" + i
						).outerHTML
						videoStream[i] = document.getElementById(
							"remotevideo" + i
						).srcObject
					}
				}
			}

			// console.log("*** methods: saveVideoInfo. Data: ")
			// console.log(videoArray)
			// console.log(videoStream)

			callStore.setVideoInfoArray({
				videoTag: videoArray,
				videoStream: videoStream
			})

			$store.commit("changeLayoutType", 3)

			// main 화면 변경
			setTimeout(function() {
				const mainIndex = callStore.videoMainIndex
				let video = ""
				if (mainIndex == 0) {
					video = document.getElementById("myvideo")

					const mainVideo = document.getElementById("videoMain")
					mainVideo.srcObject = video.srcObject
					$("#videoMainCaption").html(sessionStorage.getItem("m_nickname"))

					mainVideoBorder(mainIndex)
				} else {
					video = document.getElementById("remotevideo" + mainIndex)

					const mainVideo = document.getElementById("videoMain")
					mainVideo.srcObject = video.srcObject

					// 사용자의 언어에 따라 닉네임 변경
					const customNickname = customUserNickname(
						feeds[mainIndex].rfdeviceid
					)
					// console.log("*** methods: saveVideoInfo > customNickname: ", customNickname)
					// $("#videoMainCaption").html(feeds[mainIndex].rfdisplay)
					$("#videoMainCaption").html(customNickname)

					// main border 생성
					mainVideoBorder(mainIndex)
					// location.reload()
				}
			}, 3000)
		}
		// canvasSaveVideoInfo -> canvasCreateOffer 까지 한다.
		function canvasSaveVideoInfo(boolFlag) {
			// console.log("*** methods: canvasSaveVideoInfo", callStoreingLayoutType)
			// 

			if (callStoreingLayoutType != 3) {
				/* layout type != 3 */
				// mask Show
				$store.commit("setVideoLayoutChangeResult", true)

				videoArray = []
				videoStream = []
				// 이전 비디오 저장
				// for 조건 문 중 해당 기업의 최대 인원 수로 for문 조건
				// if (videoremote + i)의 dom이 없을 경우 break <-- break 하게 되면, 중간에 사람이 나가면 break 되므로 구현하지 않음.
				for (let i = 0; i < commonStore.roomNumberCount; i++) {
					if (i == 0) {
						videoArray[i] = document.getElementById("myvideo").outerHTML
						videoStream[i] = document.getElementById("myvideo").srcObject
					} else {
						const remoteElement = document.getElementById("remotevideo" + i)
						if (remoteElement != null && remoteElement.srcObject != null) {
							videoArray[i] = document.getElementById(
								"panel-inner" + i
							).outerHTML
							videoStream[i] = document.getElementById(
								"remotevideo" + i
							).srcObject
						}
					}
				}

				// console.log("*** methods: saveVideoInfo. Data: ")
				// console.log(videoArray)
				// console.log(videoStream)

				callStore.setVideoInfoArray({
					videoTag: videoArray,
					videoStream: videoStream
				})

				// layout 변경
				$store.commit("changeLayoutType", 3)

				const beforeMainIndex = callStore.videoMainIndex
				setTimeout(function() {
					// 드로잉 show !
					callStore.setDrawingIframe(boolFlag)

					// main Index 변경
					callStore.setVideoMainIndex(0)
				}, 1000)

				// main 화면 변경
				setTimeout(function() {
					const mainIndex = callStore.videoMainIndex
					let video = ""
					if (mainIndex == 0) {
						video = document.getElementById("myvideo")

						const mainVideo = document.getElementById("videoMain")
						mainVideo.srcObject = video.srcObject
						$("#videoMainCaption").html(sessionStorage.getItem("m_nickname"))

						mainVideoBorder(mainIndex)
					} else {
						video = document.getElementById("remotevideo" + mainIndex)

						const mainVideo = document.getElementById("videoMain")
						mainVideo.srcObject = video.srcObject

						// 사용자의 언어에 따라 닉네임 변경
						const customNickname = customUserNickname(
							feeds[mainIndex].rfdeviceid
						)
						// console.log("*** methods: canvasSaveVideoInfo > customNickname: ", customNickname)
						// $("#videoMainCaption").html(feeds[mainIndex].rfdisplay)
						$("#videoMainCaption").html(customNickname)

						// main border 생성
						mainVideoBorder(mainIndex)
						// location.reload()
					}
						// 1번레이아웃에서 다른사용자가 메인일 때 드로잉을 시작한경우 3번레이아웃으로 바뀌면서
						// 호스트가 메인이되며 기존 메인이였던 사용자의 화면 비율을 원래대로 돌려야한다.
						if (beforeMainIndex == 0) {
							// console.log(document.getElementById("myvideo"))
							document.getElementById("myvideo").style.scale = 1
						} else {
							// console.log(document.getElementById("remotevideo" + beforeMainIndex))
							document.getElementById("remotevideo" + beforeMainIndex).style.scale = 1
						}
					// canvas createOffer 넣기.
					canvasCreateOffer(boolFlag)
				}, 3000)
			} else {
				/* layout type == 3 */
				// 드로잉 show
				callStore.setDrawingIframe(boolFlag)
				// main Index 변경
				callStore.setVideoMainIndex(0)

				const mainIndex = callStore.videoMainIndex
				let video = ""
				if (mainIndex == 0) {
					video = document.getElementById("myvideo")

					const mainVideo = document.getElementById("videoMain")
					mainVideo.srcObject = video.srcObject
					$("#videoMainCaption").html(sessionStorage.getItem("m_nickname"))

					mainVideoBorder(mainIndex)
				} else {
					video = document.getElementById("remotevideo" + mainIndex)

					const mainVideo = document.getElementById("videoMain")
					mainVideo.srcObject = video.srcObject

					// 사용자의 언어에 따라 닉네임 변경
					const customNickname = customUserNickname(
						feeds[mainIndex].rfdeviceid
					)
					console.log(
						"*** methods: canvasSaveVideoInfo > customNickname: ",
						customNickname
					)
					// $("#videoMainCaption").html(feeds[mainIndex].rfdisplay)
					$("#videoMainCaption").html(customNickname)

					// main border 생성
					mainVideoBorder(mainIndex)
					// location.reload()
				}

				// mainVideo Change Duration 보내기
				// hostSelected 호출
				console.log("hostSelectedMainVideo 20")
				hostSelectedMainVideo(myid)

				setTimeout(function() {
					// canvas createOffer 넣기.
					canvasCreateOffer(boolFlag)
				}, 2000)
			}
		}
		function sendMessageBroadCast() {
			const sendMessageInfo = (chattingStore.sendMessageInfo && chattingStore.sendMessageInfo.length > 0)
				? chattingStore.sendMessageInfo[0]
				: { nickname: '', date: '', message: '', type: 0, level: 0, mainVideoName: '' }
			const nickname = sendMessageInfo.nickname
			const datetime = sendMessageInfo.date
			const message = sendMessageInfo.message
			const type = sendMessageInfo.type
			const level = sendMessageInfo.level
			const mainVideoName = sendMessageInfo.mainVideoName

			// console.log("##############" + mainVideoName)
			// mainVideoDeviceid 추가
			let mainVideoDeviceid = ""
			// 바둑판이 아닐 경우에만 설정
			if (callingLayoutType != 1 && mainVideoName != undefined) {
				if (mainVideoName == sessionStorage.getItem("m_nickname")) {
					mainVideoDeviceid = sessionStorage.getItem("m_local_deviceid") || ""
				} else {
					const mainIndex = callStore.videoMainIndex

					// main이 자신 일 경우
					if (mainIndex == 0) {
						mainVideoDeviceid = sessionStorage.getItem("m_local_deviceid")
					} else {
						mainVideoDeviceid = feeds[mainIndex].rfdeviceid
					}
				}
			}

			// type:3 = calling일 경우 자기 자신에게만 추가.
			if (type != 3) {
				const obj = {
					localdeviceid: sessionStorage.getItem("m_local_deviceid"),
					type,
					level,
					message,
					datetime,
					nickname,
					isroom: true,
					mainVideoName,
					mainVideoDeviceid
				}

				const sendJson = JSON.stringify(obj)
				$signallingSocket.emit("notification", sendJson)
				console.log("*** socket: emit notification. json: ", sendJson)

				chattingStore.sendMessageFlag = false
			}
		}
		// rfid로 feeds Index 구하기
		function findFeedsIndexRfid(rfid) {
			let FindFeedsIndex = ""
			// console.log("****** feeds :", feeds)
			// console.log("****** feeds length :", feeds.length)
			// console.log("****** feeds rfid :", rfid)

			for (let i = 1; i < feeds.length; i++) {
				if (feeds[i] != null && feeds[i].rfid == rfid) {
					FindFeedsIndex = feeds[i].rfindex
					break
				}
			}

			// feeds를 조회했지만 맞는것이 없을 경우 == 자신
			if (FindFeedsIndex == "" && rfid == myid) {
				FindFeedsIndex = 0
			}

			// console.log("****** feeds index :", FindFeedsIndex)
			return FindFeedsIndex
		}
		function addSendMessageList(nickname, message, level, type) {
			// console.log("*** methods: addSendMessageList")
			const nowDate = getWorldTime()
			chattingStore.sendMessage({
				nickname,
				date: nowDate,
				chattingDate: getChattingTimeZone(nowDate),
				message,
				level,
				type
			})

			chattingStore.sendMessageFlag(true)
		}
		function addReceiveMessageList(
			nickname,
			date,
			chattingDate,
			message,
			level,
			type,
			mainVideoName
		) {
			// console.log("*** methods: addReceiveMessageList")

			// 데이터 생성 이전의 스크롤 위치를 담아둔다.
			const scrollTop1 = document.getElementById("chattingBarMessageBoxScroll")
				.scrollTop
			const scrollLocation1 =
				document.getElementById("chattingBarMessageBoxScroll").scrollHeight -
				document.getElementById("chattingBarMessageBoxScroll").clientHeight

			// 스크롤이 마지막 위치에 있는지 여부
			let onOff = false

			// 스크롤이 '마지막 - 50px ~ 마지막' 위치에 있을 경우 마지막으로 간주함
			if (scrollTop1 >= scrollLocation1 - 50) {
				onOff = true
			}

			if (mainVideoName != undefined && mainVideoName != null) {
				chattingStore.receiveMessage({
					nickname,
					date,
					chattingDate,
					message,
					level,
					type,
					mainVideoName
				})
			} else {
				chattingStore.receiveMessage({
					nickname,
					date,
					chattingDate,
					message,
					level,
					type
				})
			}

			if (!onOff) {
				// if (scrollLocationCheck) {
				// 신규 메시지 알림 호출
				chattingStore.newMessageConfrim(true)

				if (level == 0) {
					// newEmergencyConfirm true
					chattingStore.newEmergencyConfirm(true)
				}
			} else {
				// 스크롤이 마지막 위치일 경우, 마지막으로 이동시키는 Flow.
				// 즉시 실행 시 element Heigh가 변경 되지 않아 감지 불가능
				setTimeout(function() {
					// 스크롤을 아래로 이동
					document.getElementById("chattingBarMessageBoxScroll").scrollTop =
						document.getElementById("chattingBarMessageBoxScroll")
							.scrollHeight -
						document.getElementById("chattingBarMessageBoxScroll").clientHeight
				}, 100)
			}

			// level = 0 : emergency, 외 normal
			messageBell(level, "play")
			callStore.setUnderStatus(3)
		}
		// ========= 통화 중 연락처 화면 관련 function =======
		// getRecentList
		function recentListAllRequest(localdeviceid) {
			const currentTime = getWorldTime()
			const obj = {
				deviceid: localdeviceid,
				current_time: currentTime,
				language: m_lang
			}
			const json = JSON.stringify(obj)
			$signallingSocket.emit("lastCallTime", json)
			console.log("*** socket: emit lastCallTime. json:" + json)
		}
		// getUserList
		function userListAllRequest(localDeviceid, enSeq) {
			const obj = {
				deviceid: localDeviceid,
				en_seq: enSeq,
				language: m_lang
			}
			const json = JSON.stringify(obj)
			$signallingSocket.emit("userListAll", json)
			console.log("*** socket: emit userListAll. json:" + json)
		}
		// getUserStatus
		function userStatusRequest(remotedeviceid) {
			const obj = {
				deviceid: remotedeviceid
			}

			const json = JSON.stringify(obj)
			$signallingSocket.emit("userStatus", json)
			// console.log("*** socket: emit userStatus. json: " + json)
		}
		// getCanMakeCallRequest
		function canMakeCallRequest(remotedeviceid) {
			const obj = {
				localdeviceid: sessionStorage.getItem("m_local_deviceid"),
				remotedeviceid
			}

			const json = JSON.stringify(obj)
			$signallingSocket.emit("canMakeCall", json)
			console.log("*** socket: emit canMakeCall. json: " + json)
		}
		function inviteCancelCallingRequest() {
			const obj = {
				localdeviceid: sessionStorage.getItem("m_local_deviceid"),
				remotedeviceid: sessionStorage.getItem("m_remote_deviceid"),
				roomid: sessionStorage.getItem("m_roomid"),
				institution: sessionStorage.getItem("m_institution"),
				nickname: sessionStorage.getItem("m_nickname")
			}
			const json = JSON.stringify(obj)
			$signallingSocket.emit("inviteCancelCalling", json)
			console.log("*** socket: emit inviteCancelCalling. json: ", json)

			// 발신 중 모달 해제
			$modal.hide("modal")
			sessionStorage.setItem("m_callWaiting", "false")
		}
		function videoCallHostCheck(roomid, localdeviceid) {
			const obj = {
				roomid,
				localdeviceid
			}

			const json = JSON.stringify(obj)
			$signallingSocket.emit("videoCallHostCheck", json)
			console.log("*** socket: emit videoCallHostCheck. json: " + json)
		}
		// callingWindow 왕관표시 제거 및 추가
		function setHostIcon(index, hostIcon) {
			// console.log("*** methods: setHostIcon")
			$set(commonStore.userListStatus[index], "hostIcon", hostIcon)
		}
		// deviceid로 feeds의 index 구하기
		function findFeedsIndexDeviceid(deviceid) {
			let FindFeedsIndex = ""
			// console.log("findFeedsIndexDeviceid", feeds)
			for (let i = 1; i < feeds.length; i++) {
				if (feeds[i] != null && feeds[i].rfdeviceid == deviceid) {
					FindFeedsIndex = feeds[i].rfindex
					break
				}
			}
			return FindFeedsIndex
		}
		// nickname으로 feeds의 index 구하기
		function findFeedsIndexEndUserCall(nickname) {
			let FindFeedsIndex = ""
			// console.log("findFeedsIndexDeviceid", feeds, nickname)
			for (let i = 1; i < feeds.length; i++) {
				if (feeds[i] == null && commonStore.userListStatus[i].text == nickname) {
					FindFeedsIndex = i
					break
				}
			}
			return FindFeedsIndex
		}
		// nickname으로 feeds의 index 구하기
		function findFeedsIndexNickname(nickname) {
			let FindFeedsIndex = ""
			// console.log("findFeedsIndexNickname", feeds)
			for (let i = 1; i < feeds.length; i++) {
				if (feeds[i] != null && feeds[i].nickname == nickname) {
					FindFeedsIndex = feeds[i].rfindex
					break
				}
			}
			return FindFeedsIndex
		}
		// feeds 에서 deviceid 로 nickname 가져오기
		function findFeedsNicknameByDeviceid(deviceid) {
			let nickname = ""
			for (let i = 1; i < feeds.length; i++) {
				if (feeds[i] != null && feeds[i].rfdeviceid == deviceid) {
					nickname = feeds[i].rfdisplay
					break
				}
			}
			return nickname
		}
		function hostChangeRequest(roomid, localdeviceid) {
			const obj = {
				roomid,
				localdeviceid
			}

			const json = JSON.stringify(obj)
			$signallingSocket.emit("videoCallHostRequest", json)
			console.log("*** socket: emit videoCallHostRequest. json: " + json)
		}
		function hostChange(result, roomid, localdeviceid, hostRequestDeviceid) {
			const obj = {
				result,
				roomid,
				localdeviceid,
				host_request_deviceid: hostRequestDeviceid
			}

			const json = JSON.stringify(obj)
			$signallingSocket.emit("videoCallHostChange", json)
			console.log("*** socket: emit videoCallHostChange. json: " + json)
		}
		function hostPermissionRequest(seq, nickname, hostDeviceid) {
			escapeFullScreen();
			// 수락 거절 일 경우, nickname 및 정보 저장
			if (seq == 0) {
				callStore.setHostRequestInfo({
					nickname,
					hostDeviceid
				})
			}
			callStore.setHostRequestStatus(seq)
			const modalsContainerStyle = document.getElementById("modalsContainer")
				.style
			modalsContainerStyle.display = "block"
			modalsContainerStyle.backgroundColor = "rgba(0, 0, 0, 0.3)"
			$modal.show(
				hostRequestModal,
				{},
				{
					name: "hostModal",
					width: "410",
					height: "310",
					clickToClose: false
				},
				{
					"before-close": () => {
						modalsContainerStyle.display = "none"
					}
				}
			)
		}
		function noneOverlayModal(seq) {
			escapeFullScreen();

			$store.commit("setNoneOverlayAlertStatus", seq)
			const modalsContainerStyle = document.getElementById("modalsContainer")
				.style
			modalsContainerStyle.display = "block"
			modalsContainerStyle.backgroundColor = "rgba(0, 0, 0, 0.4)"
			$modal.show(
				noneOverlayModal,
				{},
				{
					name: "noneOverlayModal",
					width: "350",
					height: "270",
					clickToClose: false
				},
				{
					"before-close": () => {
						modalsContainerStyle.display = "none"
					}
				}
			)
		}
		function alertModal(seq) {
			escapeFullScreen();
			$store.commit("setAlertStatus", seq)
			const modalsContainerStyle = document.getElementById("modalsContainer")
				.style
			modalsContainerStyle.display = "block"
			modalsContainerStyle.backgroundColor = "rgba(0, 0, 0, 0.4)"
			$modal.show(
				alertModal,
				{},
				{
					name: "alertModal",
					width: "350",
					height: "270"
				},
				{
					"before-close": () => {
						modalsContainerStyle.display = "none"
					}
				}
			)
		}
		// 파일 수신 미리보기 모달창 추가
		function previewModal(url, showState) {
			escapeFullScreen();

			$store.commit("setPreviewModalFlag",
				{
					modalIndex: commonStore.previewModalInfo.previewModalcnt + 1,
					url: url,
					show: showState
				}
			)
			// blobtoUrl = url
			// $modal.show("previewModal" + commonStore.previewModalInfo.previewModalcnt, { blobToUrl: url, index: commonStore.previewModalInfo.previewModalcnt })

			// blobtoUrl = obj.blobURL
			// previewModalState = obj.showState
			// $modal.show("previewModal", {blobToUrl: blobtoUrl})
			// const modalsContainerStyle = document.getElementById("modalsContainer")
			//  .style
			// modalsContainerStyle.display = "block"
			// modalsContainerStyle.backgroundColor = "rgba(0, 0, 0, 0.4)"

			// // 파일 수신 자동일 경우
			// if (autoPictureAccept) {
			//  // autoPictureModal = true 변경
			//  autoPictureModal = true
			// }

			// $modal.show(
			//  previewModal,
			//  {
			//      blobToUrl: blobtoUrl
			//  },
			//  {
			//      name: "previewModal",
			//      width: 415,
			//      height: 265,
			//      adaptive: true,
			//      clickToClose: false,
			//      pivotX: 0,
			//      pivotY: 0.99,
			//      styles: {
			//          minHeight: "220px"
			//      },
			//      classes: "test"
			//  },
			//  {
			//      "opened": (e) => {
			//          e.ref.style.left = "70px"
			//      },
			//      "before-close": () => {
			//          modalsContainerStyle.display = "none"
			//      }
			//  }
			// )
		}
		function previewModalHide(result) {
			previewModalState = result.showState
		}
		// 회의실 알림창 모달 --- ksy
		function meetingAlertModal(seq) {
			escapeFullScreen();

			meetingStore.setMeetingAlertStatus(seq)
			if (seq == 1) {
				meetingStore.setMeetingAlertStatus(seq)
				const modalsContainerStyle = document.getElementById("modalsContainer")
					.style
				modalsContainerStyle.display = "block"
				modalsContainerStyle.backgroundColor = "rgba(0, 0, 0, 0.4)"
				$modal.show(
					meetingAlertModal,
					{},
					{
						name: "meetingAlertModal",
						width: "350",
						height: "270",
						clickToClose: false
					},
					{
						"before-close": () => {
							modalsContainerStyle.display = "none"
						}
					}
				)
			} else {
				meetingStore.setMeetingAlertStatus(seq)
			}
		}
		// 호스트 요청 취소
		function hostRequestCancel(roomid, localdeviceid) {
			const obj = {
				roomid,
				localdeviceid
			}

			const json = JSON.stringify(obj)
			$signallingSocket.emit("videoCallHostCancel", json)
			console.log("*** socket: emit videoCallHostCancel. json: " + json)
		}
		// 전체 음소거 관리
		function setAllMicMute(status, hostDeviceid) {
			const obj = {
				status,
				hostDeviceid
			}

			const json = JSON.stringify(obj)
			$signallingSocket.emit("allMicOnOff", json)
			console.log("*** socket: emit allMicOnOff. json: " + json)

			// 전체 음소거 상태 vuex 저장
			// mic OFF : true
			if (status == 0) {
				callStore.setAllMicMuteFlag(true)
				callStore.setMicOnOffFlag(true)
			} else {
				// mic ON : false
				callStore.setAllMicMuteFlag(false)
				callStore.setMicOnOffFlag(false)
			}
		}
		// 현재 방이 전체 음소거 인지 아닌지 확인 요청
		function requestSettingInRoom(roomid, requestDeviceid) {
			const obj = {
				roomid,
				requestDeviceid
			}

			const json = JSON.stringify(obj)
			$signallingSocket.emit("requestSettingInRoom", json)
			console.log("*** socket: emit requestSettingInRoom. json: " + json)
		}
		// 현재 방에 대한 설정 (음소거상태, mainVideo, 음소거인 사람, videoOff인 사람)
		function resultSettingInRoom(
			requestDeviceid,
			hostDeviceid,
			mainVideoRfid,
			muteRfid,
			videoOffRfid,
			useScreenShare,
			useDrawing,
			zoomLevelObj
		) {
			let status = ""
			if (callStore.allMicMuteFlag == true) {
				status = 0
			} else {
				status = 1
			}

			const obj = {
				status,
				requestDeviceid,
				hostDeviceid,
				mainVideoRfid,
				muteRfid,
				videoOffRfid,
				useScreenShare,
				useDrawing,
				sendDurationEnable: sendDurationEnableFlag, // false
				zoomLevelObj
			}

			const json = JSON.stringify(obj)
			$signallingSocket.emit("resultSettingInRoom", json)
			console.log("*** socket: emit resultSettingInRoom. json: " + json)
		}
		// 테스트를 위해서 생성한 함수 (사용하지 않음)
		function setZoomLevel(level) {
			console.log(level)
			const showHostMainIndex = callStore.videoMainIndex
			console.log("호스트가 바라보는 메인화면 인덱스", showHostMainIndex)
			let remoteId = ""

			commonStore.userListStatus[0].zoomLevel = level
			// 내가 호스트가 아니면 호스트의 아이디를 넣어준다
			// if (videoCallHost && showHostMainIndex !== 0) {
			//  commonStore.userListStatus[0].zoomLevel = level
			//  // feeds[0].zoomLevel = level
			//  console.log("*** 현재 내가 호스트이면서 내가 메인이다. setZoomLevel")
			//  remoteId = sessionStorage.getItem("m_local_deviceid")
			// } else {
			//  commonStore.userListStatus[0].zoomLevel = level
			//  // feeds[0].zoomLevel = level
			//  // 내가 호스트가 아니면 호스트의 아이디를 넣어준다
			//  if (videoCallHost) {
			//  } else {
			//      console.log(feeds)
			//      console.log(callStore.hostRequestInfo)
			//  }

			// }
			const obj = {
				localdeviceid: sessionStorage.getItem("m_local_deviceid"),
				level
			}
			const json = JSON.stringify(obj)
			$signallingSocket.emit("setZoomLevel", json)
			console.log("*** setZoomLevel emit", json)
			console.log("** zoomLevel", commonStore.userListStatus, feeds)
			if (videoCallHost && showHostMainIndex == 0) {
				console.log("나는 호스트이고 메인인 사용자가 줌레벨을 변경했다")
				hostSelectedMainVideo(myid)
			}
		}
		// 호스트가 바라보는 화면으로 모두 전환 요청
		function hostSelectedMainVideo(rfid) {
			// rfid로 인덱스 찾기
			let mainVideoIndex = ""
			let mainVideoDeviceid = ""
			let mainVideoRfid = ""

			if (rfid != myid) {
				mainVideoIndex = findFeedsIndexRfid(rfid)
				mainVideoDeviceid = feeds[mainVideoIndex].rfdeviceid
				mainVideoRfid = feeds[mainVideoIndex].rfid

				// mainVideoDeviceid로 메인 사용자의 deviceType 찾기.
				const mainDeviceType = userListGetDevicetype(mainVideoDeviceid)
				// deviceType 2 또는 1일(모바일, 글라스) 경우 고화질 캡쳐 버튼 보이기 -> 테스트로 3으로 설정
				if (mainDeviceType == 1 || mainDeviceType == 2) {
					callStore.setIsGlassSelected(true)
				} else {
					callStore.setIsGlassSelected(false)
					callStore.setHQCaptureShow(false)
				}

				// 내자신이 메인화면이 아닐 경우 bitrate를 낮춘다.
				if (!isShare && !isDrawing) {
					changeBitrate(subVideoBitrate)
				}
				console.log("findFeedsIndex로 mainVideoIndex찾아오기", mainVideoIndex)
			} else {
				mainVideoIndex = 0
				mainVideoDeviceid = sessionStorage.getItem("m_local_deviceid")
				mainVideoRfid = myid

				// 고화질 캡쳐 버튼 숨김
				callStore.setHQCaptureShow(false)
				callStore.setIsGlassSelected(false)

				// feeds가 생기기도 전에 bitrate를 바꾸게되면 오류 발생하므로, 상대방이 있을 경우에만 bitrate 변경 실행.
				if (feeds != null && feeds.length > 0) {
					// 화면공유와 드로잉이 아니고, 메인화면이 내 자신일 경우 bitrate 높힘 설정
					if (!isShare && !isDrawing) {
						changeBitrate(mainVideoBitrate)
					}
				}
			}
			let curMainVideoZoomLevel = commonStore.userListStatus[mainVideoIndex].zoomLevel
			let targetToChange = ""
			// 호스트가 바라보는 메인비디오 사용자의 줌레벨값으로 화면비율을 설정한다.
			if (callStoreingLayoutType !== 1) {
				targetToChange = document.getElementById("videoMain")
			} else {
				if (mainVideoIndex == 0) {
					targetToChange = document.getElementById("myvideo")
				} else {
					targetToChange = document.getElementById("remotevideo" + mainVideoIndex)
				}
				// let curMainVideoZoomLevel = commonStore.userListStatus[mainVideoIndex].zoomLevel
				// document.getElementById("videoMain").style.scale = `${(100 * curMainVideoZoomLevel)}%`
			}
			if (targetToChange) {
				targetToChange.style.scale = `${(100 * curMainVideoZoomLevel)}%`
			}
			// console.log(commonStore.userListStatus)
			const obj = {
				rfid,
				localDeviceid: sessionStorage.getItem("m_local_deviceid"),
				level: commonStore.userListStatus[mainVideoIndex].zoomLevel  // 2021-07-28 테스트
			}
			commonStore.setMainVideoIndex(findFeedsIndexRfid(rfid))
			const json = JSON.stringify(obj)
			$signallingSocket.emit("hostSelectedMainVideo", json)
			console.log("*** socket: emit hostSelectedMainVideo. json: " + json)
			// duration Socket Event 호출
			saveVideoDuration(
				mainVideoRfid,
				mainVideoDeviceid,
				sessionStorage.getItem("m_roomid"),
				uniqueRoomid // 2021-07-21 추가
			)

			/* antenna check start */
			antennaCheck(rfid)
		}
		// 마이크 상태 변경
		function micStatusChange(status, hostDeviceid) {
			console.log("*** methods: micStatusChange")
			// 현재 마이크 상태 가져오기
			const currentMicStatus = isSounded

			// console.log("currentMicStatus : " + currentMicStatus)
			// 현재 호스트의 remoteFeed Index 가져오기
			const hostIndex = findFeedsIndexDeviceid(hostDeviceid)

			// mic off
			if (status == 0) {
				// console.log("# mic off !")
				// 현재 마이크 상태 변경 : ON -> OFF
				if (!currentMicStatus) {
					commonStore.isSounded()

					// 마이크 음소거
					toggleMute()
				}

				// 전체 음소거 vuex 저장
				callStore.setAllMicMuteFlag(true)

				callStore.setAllMicMuteStatus(0)

				// 전체 음소거 저장 용도
				callStore.setMicOnOffFlag(true)

				// 개인 마이크 상태 변경
				callStore.setMicOnOffClick(true)

				// 호스트 이외의 사람들은 전부 마이크 off 버튼 생성
				for (let i = 0; i < feeds.length; i++) {
					// 자신 마이크 off 아이콘 표시
					if (i == 0) {
						// console.log("my mic icon off !")
						setUserListMicMute(i, true)
					}

					if (i != hostIndex) {
						if (feeds[i] != null) {
							setUserListMicMute(i, true)
						}
					}
				}

				// 전체 음소거 메세지
				const chattingNickname = userListGetNickname(hostDeviceid)
				const chattingMessage = chattingNickname + $t("allMute text1")
				const chattingLevel = 2
				const chattingType = 0
				const nowDate = getWorldTime()

				// 전체 음소거 메세지 보내기
				addReceiveMessageList(
					chattingNickname,
					nowDate,
					getChattingTimeZone(nowDate),
					chattingMessage,
					chattingLevel,
					chattingType
				)
			} else {
				// mic on
				// console.log("# mic on !")
				if (currentMicStatus) {
					// 현재 마이크 상태 변경 : OFF -> ON
					commonStore.isSounded()
					// 마이크 음소거 해제
					toggleMute()
				}

				// 전체 음소거 vuex 저장
				callStore.setAllMicMuteFlag(false)

				callStore.setAllMicMuteStatus(1)

				// 전체 음소거 저장 용도
				callStore.setMicOnOffFlag(false)

				// 개인 마이크 상태 변경
				callStore.setMicOnOffClick(false)

				// 호스트 이외의 사람들은 전부 마이크 off 버튼 제거
				for (let i = 0; i < feeds.length; i++) {
					// 자신 마이크 off 아이콘 표시
					if (i == 0) {
						// console.log("my mic off icon remove !")
						setUserListMicMute(i, false)

						// 강제로 음소거 된 상태라면 강제로 음소거 vuex 초기화 한다. (false로 변경한다.)
						if (callStore.forceMicOnOffFlag) {
							callStore.setForceMicOnOffFlag(false)
						}
					}

					if (i != hostIndex) {
						setUserListMicMute(i, false)
					}
				}

				// 상대방에게 전체 음소거 해제 메세지 전달
				const chattingNickname = userListGetNickname(hostDeviceid)
				const chattingMessage = chattingNickname + $t("allMute text2")
				const chattingLevel = 2
				const chattingType = 0
				const nowDate = getWorldTime()

				// 전체 음소거 해제 메세지 보내기
				addReceiveMessageList(
					chattingNickname,
					nowDate,
					getChattingTimeZone(nowDate),
					chattingMessage,
					chattingLevel,
					chattingType
				)
			}
		}
		// 호스트가 바라보는 메인 비디오로 변경
		function hostViewMainVideo(feedsIndex) {
			console.log("*** methods: hostViewMainVideo")
			let selectedMainName = ""
			let selectedRemoteVideo = ""

			// console.log(commonStore.userListStatus.length)
			// console.log(
			//  commonStore.userListStatus[
			//      commonStore.userListStatus.length - 1
			//  ].status
			// )

			// 현재 메인 화면이 VIDEO OFF 상태인지 체크한다.
			// 자신
			console.log("***feedsIndex", feedsIndex)

			if (feedsIndex == 0) {
				// 메인화면에 선택된 사람의 상태로 mainVideo 상태를 변경한다.
				// console.log("@@@@@ 여기는 내가 메인이다.")
				if (commonStore.isVideo) {
					mainVideoChangeFunc(0, "localstream")
				}
				else if (
					!(typeof commonStore.userListStatus[feedsIndex] == "undefined" ||
					commonStore.userListStatus[feedsIndex] == null) &&
					commonStore.userListStatus[feedsIndex].status == "attach"
				) {
					mainVideoChangeFunc(1, "localstream")
				} else if (
					typeof commonStore.userListStatus[feedsIndex] != 'undefined' &&
					commonStore.userListStatus[feedsIndex] != null &&
					commonStore.userListStatus[feedsIndex].status == "unstable"
				) {
					mainVideoChangeFunc(4, "localstream")
				}

				// index를 통해 remoteFeed의 데이터를 조회한다.
				selectedMainName = sessionStorage.getItem("m_nickname")
				// index를 통해 remotevideo 태그의 srcObject를 가져온다.
				selectedRemoteVideo = document.getElementById("myvideo")
			} else {
				console.log("다른사용자가 메인화면이다, 그 사용자의 zoomLevel", commonStore.userListStatus)
				// index를 통해 remoteFeed의 데이터를 조회한다.
				// 사용자의 언어에 따라 닉네임을 변경해서 보여준다.
				selectedMainName = customUserNickname(
					feeds[feedsIndex].rfdeviceid
				)
				// selectedMainName = feeds[feedsIndex].rfdisplay

				// index를 통해 remotevideo 태그의 srcObject를 가져온다.
				selectedRemoteVideo = document.getElementById(
					"remotevideo" + feedsIndex
				)

				// console.log("####### 여기는 내가 아닌 다른사람이 메인이다.")
				// console.log(commonStore.userListStatus[feedsIndex].status)
				// 메인화면에 선택된 사람의 상태로 mainVideo 상태를 변경한다.
				if (
					commonStore.userListStatus[feedsIndex].status == "unpublished"
				) {
					mainVideoChangeFunc(0, selectedMainName)
				} else if (
					commonStore.userListStatus[feedsIndex].status == "attach"
				) {
					mainVideoChangeFunc(1, selectedMainName)
				} else if (
					commonStore.userListStatus[feedsIndex].status == "unstable"
				) {
					mainVideoChangeFunc(4, selectedMainName)
				}
			}

			console.log(
				"*** methods: hostViewMainVideo - selectedMainName : " +
					selectedMainName
			)
			// console.log("# selectedRemoteVideo : " + feedsIndex)

			// 현재 나의 레이아웃이 바둑판이 아니라면
			if (callStoreingLayoutType != 1) {
				// mainVideo의 돔을 가져오고, mainVideo의 srcObject를 변경한다.
				// eslint-disable-next-line camelcase
				const main_video = document.getElementById("videoMain")
				main_video.srcObject = selectedRemoteVideo.srcObject
				$("#videoMainCaption").html(selectedMainName)
			}

			// console.log("###############")
			// console.log(feedsIndex)
			// MainVideo Border Change
			mainVideoBorder(feedsIndex)

			// 호스트의 줌레벨을 셋팅한다.
			const beforeMainIndex = callStore.videoMainIndex
			let curMainVideoZoomLevel = commonStore.userListStatus[feedsIndex].zoomLevel
			let targetToChange = ""
			if (feedsIndex !== "" && callStoreingLayoutType !== 1) {
				targetToChange = document.getElementById("videoMain")
			} else if (feedsIndex !== "" &&  callStoreingLayoutType == 1 ) {
				// 레이아웃 1번일 경우 이전메인비디오의 화면비율은 1로 되돌린다.
				if (beforeMainIndex == 0) {
					console.log(document.getElementById("myvideo"))
					document.getElementById("myvideo").style.scale = 1
				} else {
					console.log(document.getElementById("remotevideo" + beforeMainIndex))
					document.getElementById("remotevideo" + beforeMainIndex).style.scale = 1
				}

				// 선택한 메인비디오의 화면 비율을 셋팅한다.
				if (feedsIndex == 0) {
					console.log(document.getElementById("myvideo"))
					targetToChange = document.getElementById("myvideo")
				} else {
					console.log(document.getElementById("remotevideo" + feedsIndex))
					targetToChange = document.getElementById("remotevideo" + feedsIndex)
				}
			}

			if (targetToChange) {
				targetToChange.style.scale = `${(100 * curMainVideoZoomLevel)}%`
			}
			// 바둑판 일 경우도 mainIndex를 관리해야 videoLayoutChange 시 호스트와 동일한 화면을 바라봄.
			// Main Index 관리
			callStore.setVideoMainIndex(feedsIndex)
		}
		// 마이크 버튼 클릭 (개인 마이크 설정)
		function micOnOff(status, rfid) {
			const obj = {
				status,
				rfid
			}

			const json = JSON.stringify(obj)
			$signallingSocket.emit("micOnOff", json)
			console.log("*** socket: emit micOnOff. json: " + json)
		}
		// 강제 마이크 버튼 클릭 (호스트 -> 일반 사용자)
		function forceMicOnOff(status, rfid) {
			const obj = {
				status,
				rfid
			}

			const json = JSON.stringify(obj)
			$signallingSocket.emit("forceMicOnOff", json)
			console.log("*** socket: emit forceMicOnOff. json: " + json)
		}
		// 마이크 음소거 변경
		function setUserListMicMute(index, mute) {
			console.log("*** methods: setUserListMicMute")
			commonStore.setUserListMicMute({
				index,
				mute
			})
		}
		function setUserListZoomLevel(index, zoomLevel) {
			console.log("*** methods: setUserListZoomLevel")
			commonStore.setUserListZoomLevel({
				index,
				zoomLevel
			})
		}
		// 서브비디오 낙하 아이콘 설정
		function setSubVideoMotionFall(index, result) {
			console.log("*** methods: setUserListMotionFall")
			commonStore.setUserListMotionFall({
				index,
				result
			})
		}
		// 서브비디오 움직임 없음 아이콘 설정
		function setSubVideoMotionNoMove(index, result) {
			console.log("*** methods: setUserListNoMove")
			commonStore.setUserListNoMove({
				index,
				result
			})
		}
		function saveVideoDuration(mainRfid, deviceid, roomid, uniqueRoomid) {
			const currentTimeStamp = getWorldTime()

			/* Audio Duration 기능 추가로 인한 소스 */
			/* Start */
			// audio 데이터 생성
			const audiosArray = []

			// eslint-disable-next-line no-new-object
			const audiosDataObject = new Object()

			// 메인화면이 자신일 경우
			if (mainRfid == myid) {
				// 사용자들의 rfid를 audios.user_uid로 설정한다.
				for (let i = 1; i < feeds.length; i++) {
					if (feeds[i] != null) {
						audiosDataObject.user_uid = feeds[i].rfid
						audiosDataObject.deviceid = feeds[i].rfdeviceid

						const audiosData = JSON.stringify(audiosDataObject)
						audiosArray.push(JSON.parse(audiosData))
					}
				}
			} else {
				// 메인화면이 자신이 아닐 경우 > 자신의 아이디를 포함시켜야 한다.
				audiosDataObject.user_uid = myid
				audiosDataObject.deviceid = sessionStorage.getItem("m_local_deviceid")

				const myAudiosData = JSON.stringify(audiosDataObject)
				audiosArray.push(JSON.parse(myAudiosData))

				// 사용자들의 rfid를 audios.user_uid로 설정한다.
				for (let i = 1; i < feeds.length; i++) {
					if (feeds[i] != null) {
						// 메인화면을 제외한 사용자들을 데이터에 넣는다.
						if (feeds[i].rfid != mainRfid) {
							audiosDataObject.user_uid = feeds[i].rfid
							audiosDataObject.deviceid = feeds[i].rfdeviceid

							const audiosData = JSON.stringify(audiosDataObject)
							audiosArray.push(JSON.parse(audiosData))
						}
					}
				}
			}

			const audioCount = audiosArray.length

			// console.log("audios", audiosArray)
			// console.log("audio_cnt", audioCount)
			/* End */

			const obj = {
				deviceid,
				user_uid: mainRfid,
				curr_time: currentTimeStamp,
				roomid,
				unique_roomid: uniqueRoomid, // 2021-07-21 추가
				audio_cnt: audioCount, // test : 2021-09-13 추가 (audioDuration)
				audios: audiosArray // test : 2021-09-13 추가 (audioDuration)
			}

			// console.log("mainRfid : " + mainRfid)
			// console.log("deviceid : " + deviceid)
			// console.log("curr_time : " + currentTimeStamp)

			const json = JSON.stringify(obj)

			$signallingSocket.emit("changeDuration", json)
			console.log("*** socket: emit changeDuration. json: " + json)
		}
		// 회의실 퇴장
		function leaveMeeting() {
			// console.log("*** methods: leaveMeeting")

			const obj = {
				meeting_seq: commonStore.meeting.meetingSeq,
				deviceid: sessionStorage.getItem("m_local_deviceid"),
				roomid: sessionStorage.getItem("m_roomid")
			}

			const json = JSON.stringify(obj)

			$signallingSocket.emit("leaveMeeting", json)
			console.log("*** socket: emit leaveMeeting. json: " + json)
		}
		// =>kyj
		// 파일 확장자 추출
		function getFileExtension(filetype) {
			// console.log("filetype: " + filetype)
			if (filetype.includes("/") === true) {
				const fileLen = filetype.length
				const lastDot = filetype.lastIndexOf("/")
				const fileExt = filetype.substring(lastDot + 1, fileLen).toLowerCase()
				return fileExt
			} else {
				return filetype
			}
		}
		// -> kyj
		// 파일 송수신 자료 파워매니저로 업로드
		function createDateName() {
			const date = new Date()
			const month =
				date.getMonth() + 1 < 10
					? "0" + (date.getMonth() + 1)
					: date.getMonth() + 1
			const day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate()
			const hour =
				date.getHours() < 10 ? "0" + date.getHours() : date.getHours()
			const minute =
				date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()
			const second =
				date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds()
			const dateName =
				date.getFullYear() + "_" + month + day + "_" + hour + minute + second
			return dateName
		}
		// 파일을 Blob 으로 변경
		function sendFileServerUploadFileToBlob(sendImage) {
			const byteString = atob(sendImage.split(",")[1])
			const mimeString = sendImage
				.split(",")[0]
				.split(":")[1]
				.split(";")[0]
			const ab = new ArrayBuffer(byteString.length)
			const ia = new Uint8Array(ab)
			for (let i = 0; i < byteString.length; i++) {
				ia[i] = byteString.charCodeAt(i)
			}
			const bb = new Blob([ab], { type: mimeString })
			return bb
		}
		// 파일 송수신 용 서버 업로드
		function sendFileServerUpload(type, file, fname, fsize, fileJoinMembers) {
			const reader = new FileReader()

			const parent = this

			reader.onload = function(event) {
				const sendImageSrc = event.target.result

				const dateName = createDateName()

				const fileExtentionSplit = fname.split(".")
				const fileExtention = fileExtentionSplit[fileExtentionSplit.length - 1]

				// 파일 이름이 유니크한 값으로 만들기 위해 deviceid를 뒤에 추가한다.
				const sendFileName =
					dateName +
					"_" +
					sessionStorage.getItem("m_local_deviceid") +
					"." +
					fileExtention

				const stream = ss.createStream()
				const obj = {
					en_seq: loginStore.sessionEnSeq,
					fname: sendFileName,
					fsize
				}
				const json = JSON.stringify(obj)
				console.log("server upload Info json", json)
				const fn = sendFileServerUploadFileToBlob(sendImageSrc)
				console.log("server upload Info fn", fn)
				ss(transfer_socket).emit("sendFileServerUpload", stream, json)
				console.log("*** transfer socket: sendFileServerUpload")
				const blobstream = ss.createBlobReadStream(fn)

				// 전송률 측정
				let size = 0
				let rate = 0

				// 전송률 전송 재귀함수
				const rateInterval = (callback, interval) => {
					let flag = true
					const tick = () => {
						setTimeout(() => {
							if (!flag) return;
							const obj = {
								localdeviceid: sessionStorage.getItem("m_local_deviceid"), // 송신자
								remotedeviceid : commonStore.fileReceiver, // 수신자
								rate
							}
							const json = JSON.stringify(obj)
							$signallingSocket.emit("fileSendRate", json)
							console.log("*** socket emit fileSendRate", json)

							// 파일 송신 모달창에 전송률 입력
							callStore.setTransmissionRate(rate)
							// console.log("rate: " + rate + "%")
							callback()
							tick()
						}, interval)
					}
					tick()
					return () => { flag = false }
				}
				rateStopper = rateInterval(() => {
				}, 500)

				// io stream 데이터 전송
				blobstream.on('data', function(chunk) {
					size += chunk.length;
					rate = Math.floor(size / file.size * 100)
				})

				// io stream 전송 완료
				blobstream.on("end", function() {
					if (typeof rateStopper == "undefined" || rateStopper == null) {
						return
					}

					// 전송률 전송 정지
					rateStopper()
					rateStopper = null

					// 전송률 100% 전송
					const obj = {
						localdeviceid : sessionStorage.getItem("m_local_deviceid"), // 송신자
						remotedeviceid : commonStore.fileReceiver, // 수신자
						rate : 100
					}
					const json = JSON.stringify(obj)
					$signallingSocket.emit("fileSendRate", json)

					// 파일 송신 모달창에 전송률 입력
					callStore.setTransmissionRate(rate)
					// console.log("rate: " + 100 + "%")

					// 파일 정보 DB 에 저장
					const obj2 = {
						en_seq: loginStore.sessionEnSeq,
						hq_seq: loginStore.sessionHqSeq,
						br_seq: loginStore.sessionBrSeq,
						// joined_members: "joined_members", // 보내는 사람과 받는사람 (ex. 김승하, 곽선영)
						joined_members: fileJoinMembers,
						file_path: str_stream_picture_file_path,
						file_name: sendFileName,
						// file_type: "picture",
						file_type: type,
						getWorldTime: getWorldTime(),
						localdeviceid: sessionStorage.getItem("m_local_deviceid"),
						remotedeviceid: commonStore.fileReceiver,
						roomid: sessionStorage.getItem("m_roomid")
					}
					const json2 = JSON.stringify(obj2)
					$signallingSocket.emit("sendFileServerUploadInfo", json2)
					console.log("*** socket: sendFileServerUploadInfo request:", json2)

					// 파일 송신 완료 모달창 출력
					commonStore.fileSendStatus(6)

					// 채팅창에 메세지 파일 전송 완료 메세지 추가 (5)
					const nickname = userListGetNickname(commonStore.fileReceiver)
					addChatFileSendMessage(nickname, 5, "")

					// 파일 송신 초기화
					fileSendReset()
				})

				blobstream.pipe(stream)

				console.log("*** socket: sendFileServerUpload request: " + json)
			}
			reader.readAsDataURL(file)
		}
		// <- kyj
		// socket sendMessage
		function sendDirectMessageRequest(sender, receiver, type, message, datetime) {
			const obj = {
				sender,
				receiver,
				type,
				message,
				datetime
			}

			const json = JSON.stringify(obj)
			$signallingSocket.emit("directMessage", json)
			console.log("*** socket: emit directMessage")
			console.log(json)
		}
		// 읽음처리 socket
		function readProcess(sender, receiver, datetime) {
			const obj = {
				sender,
				receiver,
				datetime
			}

			const json = JSON.stringify(obj)
			$signallingSocket.emit("directMessageReadProcess", json)
			console.log("*** socket: emit directMessageReadProcess")
			console.log(json)
		}
		// contactListInCalling에서 메세지 버튼 클릭 시
		function requestMessageFunc(reciverDeviceid) {
			// 
			console.log(reciverDeviceid)

			const reciverNickname = userListGetNickname(reciverDeviceid)

			// 모달 생성 vuex
			directMessageStore.addChattingModal({
				deviceid: reciverDeviceid,
				nickname: reciverNickname
			})

			setTimeout(function() {
				$emit("privateChatDeviceID", reciverDeviceid)
			}, 500)
		}
		// 회의실통화 중 비회원 초대 이메일 전송 클릭 시 --- ksy
		function inviteNonMember(nonMemberEmail) {
			const meetingSeq = commonStore.meeting.currentMeetingSeq

			let obj
			if (process.env.renewal == "true") {
				obj = {
					meeting_seq: meetingSeq,
					email: nonMemberEmail,
					domain: window.location.href.replace(window.location.pathname, "") + "/watttalk",
					PMDomain: setPowerManageLink(window.location.hostname) + "/wattalk", // 파워매니저 URL - 20210923 추가
					en_seq: loginStore.sessionEnSeq // 20211014 - 회원인지 존재 여부 확인 시 필요
				}
			} else {
				obj = {
					meeting_seq: meetingSeq,
					email: nonMemberEmail,
					domain: window.location.href.replace(window.location.pathname, ""),
					PMDomain: setPowerManageLink(window.location.hostname), // 파워매니저 URL - 20210923 추가
					en_seq: loginStore.sessionEnSeq // 20211014 - 회원인지 존재 여부 확인 시 필요
				}
			}
			const json = JSON.stringify(obj)
			console.log(json)
			$signallingSocket.emit("inviteNoneMember", json)
		}
		// janus destroyed 시 실행 하는 함수들
		function janusAndCallingDestroy() {
			// 

			// 자신이 화면 공유 상태라면 화면 공유를 제거한다.
			if (commonStore.isShare) {
				console.log("screen Share Stop !!")
				// 문서공유 종료 알림
				const obj = {
					rfid: null,
					status: 0
				}

				const sendJson = JSON.stringify(obj)
				$signallingSocket.emit("screenSharing", sendJson)
				console.log("*** socket: emit screenSharing Stop. json: " + sendJson)
			}

			// 자신이 드로잉 상태라면 드로잉 종료를 알린다.
			if (commonStore.isDrawing) {
				// 드로잉 종료 알림
				const obj = {
					rfid: myid,
					status: 0
				}

				const sendJson = JSON.stringify(obj)
				$signallingSocket.emit("drawing", sendJson)
				console.log("*** socket: emit drawing. json: " + sendJson)
			}
			// 사용자 퇴장 직전에 줌레벨 1로 변경 알림 > 다른사용자들은 해당 사용자 퇴장 시 해당 인덱스배열의 zoomLevel을 1로 초기화(ksy)
			// setZoomLevel(1)

			// ksy Test Code - 파일 송신자 새로고침 시 수신창제거
			// cancelFileTransfer(
			//  sessionStorage.getItem("m_local_deviceid"),
			//  commonStore.fileReceiver
			// )

			// discalling
			discallingRequest(
				sessionStorage.getItem("m_local_deviceid"),
				sessionStorage.getItem("m_remote_deviceid"),
				sessionStorage.getItem("m_roomid"),
				sessionStorage.getItem("m_institution"),
				sessionStorage.getItem("m_nickname")
			)

			// -> RoomID 를 사용하지 않는다면 RoomID 를 가용하게 만든다
			const obj2 = {
				roomid: sessionStorage.getItem("m_roomid"),
				curr_time: getWorldTime(),
				meeting_seq: commonStore.meeting.meetingSeq, // 룸에 아무도 존재하지 않는다면 회의를 종료 시키기 위해서.
				sendDurationEnable: sendDurationEnable, // flag를 통하여 미디어 서버에 보낼지 안보낼지 체크 (혼자인 경우 미디어서버에 보내지 않음)
				unique_roomid: uniqueRoomid // 2021-07-21 추가
			}

			const json2 = JSON.stringify(obj2)
			$signallingSocket.emit("destroyRoomID", json2)
			console.log("*** socket: emit destroyRoomID. json: ", json2)

			setTimeout(function() {
				// -> kyj 통화 종료 시간을 기록한다
				const currentTime = getWorldTime()
				const obj = {
					his_seq: sessionStorage.getItem("m_his_seq"),
					end_time: currentTime
				}
				const json = JSON.stringify(obj)
				$signallingSocket.emit("callStopTime", json)
				console.log("*** socket: emit callStopTime. json: ", json)

				// 통화 종료 시 watch 부분에 빼고 여기 넣음. -> 회의실 종료
				leaveMeeting()
			}, 1000)

			clearInterval(setIntervalStream)

			// 화면 공유 관련 intever 제거
			if (myVideoCheckInterval != null) {
				// console.log(
				//  "****** 화면공유Interval이 null이 아니다. clear 해준다."
				// )
				clearInterval(myVideoCheckInterval) // 자기 자신 인터벌 클리어
			}

			// mainStream 관련 interval 제거
			if (setIntervalStream != null) {
				// console.log(
				//  "****** 메인화면 체크 interval null이 아니다. clear 해준다."
				// )
				clearInterval(setIntervalStream)
			}

			// callingTimer 관련 interval 제거
			if (callTimerInterval != null) {
				setCallingTimer("stop")
			}

			// reload
			setTimeout(function() {
				// 세션 삭제 - 위치 이동 : sessionStorage roomid를 미리 삭제해버려서 회의 종료 시 room id가 null이 되기 때문에 위치 이동.
				sessionStorage.removeItem("m_roomid")
				sessionStorage.removeItem("createRoomFlag")
				sessionStorage.removeItem("otherPartyAccess")

				// guest가 입장 시 윈도우 창 닫기
				if (callingType == "joinGuestCall") {
					// 비회원 참가 시 window close
					window.location.href = "https://wattsolution.co.kr/"
				} else if (callingType == "meetingCall") {
					$router.push("/meetingRoom")
					commonStore.changeViewType(1)
				} else {
					commonStore.changeViewType(0)
				}

				setTimeout(function() {
					window.location.reload()
				}, 500)
			}, 3000)
		}
		function setCallingTimer(type) {
			// console.log("*** methods: setCallingTimer Function")
			if (type == "init") {
				callStore.setCallingTimer("00:00:00")
			} else if (type == "start") {
				// 
				callTimerInterval = setInterval(function() {
					// console.log("*** methods: setCallingTimer - interval Timer Start")
					callTime++

					// 시간 계산
					callMin = Math.floor(callTime / 60)
					callHour = Math.floor(callMin / 60)
					callSec = callTime % 60
					callMin = callMin % 60

					let calcHour = callHour
					let calcMin = callMin
					let calcSec = callSec

					// 두자리 수가 아니면 앞에 0 붙여주기
					if (calcHour < 10) {
						calcHour = "0" + callHour
					}
					if (calcMin < 10) {
						calcMin = "0" + callMin
					}
					if (calcSec < 10) {
						calcSec = "0" + callSec
					}

					const calcTimer = calcHour + ":" + calcMin + ":" + calcSec
					callStore.setCallingTimer(calcTimer)

					// 시간초 interval 실행 시 Mobile 전체화면을 체크한다.
					// 모바일일 경우만 실행한다. -> 전체화면이 아니라면 전체화면으로 만든다.
					if (
						accessDeviceCheck == "Mobile" &&
						document.fullscreenElement == null &&
						fullScreenApplyCount == 0
					) {
						// $("#videoMainDivWrap").css(
						//  "height",
						//  $("#videoMainDivWrap")[0].clientHeight -
						//      $(".header")[0].clientHeight
						// )

						fullScreenApplyCount++
					}
				}, 1000)
			} else if (type == "stop") {
				clearInterval(callTimerInterval)
			}
		}
		function calcAntennaStep(bitrate, height, deviceType) {
			// console.log("*** bitrateInterval ***")
			// console.log(bitrate)
			// console.log(height)
			// console.log(deviceType)

			let antennaStep = 0
			let calcGlassAntenna = 0 // 글라스 안테나 계산식

			/* 안테나 정보
				bitrate 600 설정 -> 8/26 bitrate 400 설정  -> 3500 기준 배율증가
				5 Step >= 400 -> 5 Step >= 300                2320
				4 Step >= 350 -> 4 Step >= 250                2030
				3 Step >= 300 -> 3 Step >= 200                1740
				2 Step >= 200 -> 2 Step >= 150                1160
				1 Step else -> 1 Step >= else

				5G -> bitrate 3500 설정 : 3500 기준 배율증가
				5 Step >= 2800
				4 Step >= 2100
				3 Step >= 1400
				2 Step >= 700
				1 Step else -> 1
			*/

			// PC 인 경우 및 비회원인 경우
			if (deviceType == 3 || deviceType == 4) {
				if (bitrate >= 400) {
					antennaStep = 5
				} else if (bitrate >= 350) {
					antennaStep = 4
				} else if (bitrate >= 300) {
					antennaStep = 3
				} else if (bitrate >= 200) {
					antennaStep = 2
				} else {
					antennaStep = 1
				}
			} else {
				if (bitrate >= 1500) {
					calcGlassAntenna = 5
				} else if (bitrate >= 1240) {
					calcGlassAntenna = 4
				} else if (bitrate >= 860) {
					calcGlassAntenna = 3
				} else if (bitrate >= 480) {
					calcGlassAntenna = 2
				} else {
					calcGlassAntenna = 1
				}

				// 해상도 계산
				const resolutionStep = calcResolution(height)

				// (해상도 단계 + 비트레이트 단계)/2
				antennaStep = (resolutionStep + calcGlassAntenna) / 2
			}

			// 안테나 스텝 vuex 변경
			// 안테나 소수점 일 경우 버림
			callStore.setAntennaStep(Math.floor(antennaStep))
		}
		// 글라스만 해상도 계산식이 필요함
		function calcResolution(height) {
			let resolutionStep = 0

			if (height >= 720) {
				resolutionStep = 5
			} else if (height >= 540) {
				resolutionStep = 4
			} else if (height >= 480) {
				resolutionStep = 3
			} else if (height >= 360) {
				resolutionStep = 2
			} else {
				resolutionStep = 1
			}

			return resolutionStep
		}
		// 안테나 변경 소켓 보내기
		function changeAntenna(rfid) {
			const obj = { rfid }

			const json = JSON.stringify(obj)
			$signallingSocket.emit("changeAntenna", json)
			console.log("*** socket: emit changeAntenna. json:", json)
		}
		// 안테나 인터벌
		function antennaCheck(rfid) {
			/* antenna check start */
			// 

			// 진행중인 interval 초기화
			if (bitrateTimerinterval != null) {
				clearInterval(bitrateTimerinterval)
			}

			// 자신 일 경우에는 interval 하지 않는다.
			if (myid != rfid) {
				// 안테나 표시
				if (!commonStore.antennaStatus) {
					callStore.setAntennaStatus(true)
				}

				// feedIndex 가져오기
				const feedIndex = findFeedsIndexRfid(rfid)

				/* 비디오 체크 및 마이크 체크 */
				const mediaTrackCheck = remoteFeedMediaTrackCheck(
					"video",
					feedIndex
				)
				console.log("mediaDeviceCheck", mediaTrackCheck)

				// 비디오 device가 존재할 경우에만 실행
				if (mediaTrackCheck) {
					/* bitrate 인터벌 시작 */
					bitrateTimerinterval = setInterval(function() {
						if (
							feeds[feedIndex] != null &&
							$("#remotevideo" + feedIndex).length != 0
						) {
							const bitrate = feeds[feedIndex]
								.getBitrate()
								.split("kbits")[0]
								.trim()
							const width = $("#remotevideo" + feedIndex).get(0).videoWidth
							const height = $("#remotevideo" + feedIndex).get(0).videoHeight

							// 드로잉 또는 화면공유 중 videoTracks 없을 경우 frame = 0
							let frame = 0
							if (
								$("#remotevideo" + feedIndex)[0].srcObject.getVideoTracks()
									.length != 0
							) {
								frame = Math.round(
									$("#remotevideo" + feedIndex)[0]
										.srcObject.getVideoTracks()[0]
										.getSettings().frameRate
								)
							}

							const deviceType = userListGetDevicetype(
								feeds[feedIndex].rfdeviceid
							)
							// 안테나 계산
							calcAntennaStep(bitrate, height, deviceType)

							const resolution = width + " x " + height

							// antennaInfo 등록
							callStore.setAntennaInfo({
								bitrate,
								frame,
								resolution
							})
						}
					}, 3000)
				} else {
					// 카메라가 없을 경우 안테나 숨김
					callStore.setAntennaStatus(false)

					// antennaInfo 초기화
					callStore.setAntennaInfo({
						bitrate: 0,
						frame: 0,
						resolution: 0
					})
				}
				/* bitrate 인터벌 끝 */
			} else {
				// 안테나 제거
				callStore.setAntennaStatus(false)

				// antennaInfo 초기화
				callStore.setAntennaInfo({
					bitrate: 0,
					frame: 0,
					resolution: 0
				})
			}

			// 호스트일 경우만 changeAntenna 소켓 보내기
			if (videoCallHost) {
				changeAntenna(rfid)
			}
			/* antenna check end */
		}
		async function moveThumbnail(localDeviceid, remoteDeviceid) {
			drawingStore.setReadyStatus(true)
			drawingStore.addFirstInFiles()
			drawingStore.setBeforeCloseCanvas(false)

			// 현재 썸네일 리스트를 가져온다.
			const myThumbnailList = drawingStore.files.map((b) =>
				Object.assign(b)
			)
			console.log(myThumbnailList, "My thumbnail")
			const thumbnailList = []

			console.log("canvasHistory: ", drawingStore.canvasHistory)

			for (let i = 0; i < myThumbnailList.length; i++) {
				if (myThumbnailList[i].type == "canvas" || myThumbnailList[i].type == "img") {
					// 기존 코드
					// myThumbnailList[i].history.currentStateIndex = 0
					// myThumbnailList[i].history.state =
					// myThumbnailList[i].history.state.splice(myThumbnailList[i].history.state.length - 1, 1)
					// 신규 코드
					myThumbnailList[i].history = drawingStore.files[i].history
					thumbnailList.push(myThumbnailList[i])
				} else if (myThumbnailList[i].type == "pdf") {
					console.log("pdf in")
					for (let j = 0; j < pdfUrlSaveArrays.length; j++) {
						if (
							pdfUrlSaveArrays[j].groupIndex == myThumbnailList[i].group
						) {
							console.log("same group")
							for (let k = 0; k < pdfUrlSaveArrays[j].pages.length; k++) {
								if (myThumbnailList[i].pdf[k].history.state.length == 0) {
									console.log("no length")
									myThumbnailList[i].pdf[k].img = pdfUrlSaveArrays[
										j
									].pages[k].url
								} else {
									console.log("yes length")
									for (
										let l = 0;
										l < myThumbnailList[i].pdf[k].history.state.length;
										l++
									) {
										const changeURL = JSON.parse(
											myThumbnailList[i].pdf[k].history.state[l]
										)
										if (changeURL.objects[0].src != pdfUrlSaveArrays[j]) {
											changeURL.objects[0].src = pdfUrlSaveArrays[j].pages[
												k
											].url
											changeURL.objects[0].crossOrigin = "anonymous"
											myThumbnailList[i].pdf[k].history.state[
												l
											] = JSON.stringify(changeURL)
										}
									}
									console.log("PDFPDFPDFPDF", myThumbnailList[i])
									// myThumbnailList[i].pdf[k].history.currentStateIndex = 0
									// myThumbnailList[i].pdf[k].history.state = myThumbnailList[
									//  i
									// ].pdf[k].history.state.splice(
									//  myThumbnailList[i].pdf[k].history.state.length - 1,
									//  1
									// )
								}
							}
							thumbnailList.push(myThumbnailList[i])
						}
					}
				}
			}
			console.log(thumbnailList, "new thumbnail")

			const lastGroup = drawingStore.pdfGroup
			const lastIndex = drawingStore.index
			const firstHistory = { ...drawingStore.firstHistory }
			const firstFiles = [...drawingStore.firstFiles]

			// 신규 코드
			const lastCanvasJson = drawingStore.lastCanvasJson
			// 기존 코드 (호스트 이관 시 이어서 드로잉을 위해 주석 처리)
			// const canvasJson = thumbnailList.length < 1 ? null : thumbnailList[0].history
			// const lastCanvasJson = canvasJson == null ? null : canvasJson.state[canvasJson.currentStateIndex]

			const pdfUrlSaveArrays = [...pdfUrlSaveArrays]
			// console.log("lastJson", lastCanvasJson)
			// console.log("pdfUrlSaveArrays", pdfUrlSaveArrays)

			// const canvasHistory = drawingStore.canvasHistory
			const selectedFileIndex = drawingStore.selectedFileIndex
			const selectedPdfIndex = drawingStore.pdfIndex
			const isDrawingEnable = commonStore.isDrawing // 드로잉 중이였는지 상태 확인
			// console.log("selectedFileIndex: ".concat(selectedFileIndex))

			// 썸네일 리스트가 없을 경우는 보내지 않는다.
			if (thumbnailList.length != 0) {
				const obj = {
					localDeviceid,
					remoteDeviceid,
					thumbnailList,
					lastGroup,
					lastIndex,
					firstHistory,
					firstFiles,
					pdfUrlSaveArrays,
					selectedFileIndex,
					selectedPdfIndex,
					isDrawingEnable
				}

				// lastCanvasJson,
				// canvasHistory,

				const json = JSON.stringify(obj)
				$signallingSocket.emit("moveThumbnail", json)
				console.log("*** socket: emit moveThumbnail")
				// console.log(json)

				// 자신의 썸네일 초기화
				drawingStore.setIsThumbnailTransfer(true)
			}
			$nextTick(() => {
				videoResize()
			})
		}
		function getMeetingInfo(meetingSeq) {
			const obj = {
				meeting_seq: meetingSeq
			}

			const json = JSON.stringify(obj)
			$signallingSocket.emit("getMeetingInfo", json)
			console.log("*** socket: emit getMeetingInfo")
			console.log(json)
		}
		// 드로잉에서 불러온 이미지 업로드 및 캡쳐 이미지 업로드
		function commonFileServerUpload(fname, fsize, sendImageSrc, type) {
			// type == "drawingImage" -> 드로잉 이미지 불러오기
			// type == "captureImage" -> 메인화면 캡쳐
			// 
			const dateName = createDateName()

			const fileExtentionSplit = fname.split(".")
			const fileExtention = fileExtentionSplit[fileExtentionSplit.length - 1]
			const fileType = "picture"

			// 파일 이름이 유니크한 값으로 만들기 위해 deviceid를 뒤에 추가한다.
			const sendFileName =
				dateName +
				"_" +
				sessionStorage.getItem("m_local_deviceid") +
				"." +
				fileExtention

			const stream = ss.createStream()
			const obj = {
				en_seq: loginStore.sessionEnSeq,
				fname: sendFileName,
				fsize
			}
			const json = JSON.stringify(obj)
			const fn = sendFileServerUploadFileToBlob(sendImageSrc)
			ss(transfer_socket).emit("sendFileServerUpload", stream, json)
			console.log("*** transfer socket: sendFileServerUpload")
			const blobstream = ss.createBlobReadStream(fn)
			blobstream.on("end", function() {
				// DB Save
				let obj2 = ""
				if (type == "drawingImage") {
					obj2 = {
						en_seq: loginStore.sessionEnSeq,
						hq_seq: loginStore.sessionHqSeq,
						br_seq: loginStore.sessionBrSeq,
						// joined_members: "joined_members", // 보내는 사람과 받는사람 (ex. 김승하, 곽선영)
						joined_members: sessionStorage.getItem("m_nickname"),
						file_path: str_stream_picture_file_path,
						file_name: sendFileName,
						// file_type: "picture",
						file_type: fileType,
						getWorldTime: getWorldTime(),
						localdeviceid: sessionStorage.getItem("m_local_deviceid"),
						remotedeviceid: null,
						roomid: sessionStorage.getItem("m_roomid")
					}
				} else if (type == "captureImage") {
					const videoMainIndex = callStore.videoMainIndex

					/* joinMembers 만들기 - mainVideoIndex를 이용하여 닉네임 가져오기 */
					let joinMembers = ""

					// 내 자신이 메인일 경우 내 자신을 찍을 경우 예외처리
					let localdeviceid = ""
					if (feeds[videoMainIndex] != null && videoMainIndex != 0) {
						joinMembers =
							sessionStorage.getItem("m_nickname") +
							", " +
							feeds[videoMainIndex].rfdisplay

						localdeviceid = feeds[videoMainIndex].rfdeviceid
					} else {
						joinMembers = sessionStorage.getItem("m_nickname")
						localdeviceid = sessionStorage.getItem("m_local_deviceid")
					}

					obj2 = {
						en_seq: loginStore.sessionEnSeq,
						hq_seq: loginStore.sessionHqSeq,
						br_seq: loginStore.sessionBrSeq,
						// joined_members: "joined_members", // 보내는 사람과 받는사람 (ex. 김승하, 곽선영)
						joined_members: joinMembers,
						file_path: str_stream_picture_file_path,
						file_name: sendFileName,
						// file_type: "picture",
						file_type: fileType,
						getWorldTime: getWorldTime(),
						localdeviceid,
						remotedeviceid: sessionStorage.getItem("m_local_deviceid"),
						roomid: sessionStorage.getItem("m_roomid")
					}
				}

				// const obj2 = {
				//  en_seq: loginStore.sessionEnSeq,
				//  hq_seq: loginStore.sessionHqSeq,
				//  br_seq: loginStore.sessionBrSeq,
				//  // joined_members: "joined_members", // 보내는 사람과 받는사람 (ex. 김승하, 곽선영)
				//  joined_members: sessionStorage.getItem("m_nickname"),
				//  file_path: str_stream_picture_file_path,
				//  file_name: sendFileName,
				//  // file_type: "picture",
				//  file_type: fileType,
				//  getWorldTime: getWorldTime(),
				//  localdeviceid: sessionStorage.getItem("m_local_deviceid"),
				//  remotedeviceid: null,
				//  roomid: sessionStorage.getItem("m_roomid")
				// }
				const json2 = JSON.stringify(obj2)
				$signallingSocket.emit("sendFileServerUploadInfo", json2)
				console.log("*** socket: sendFileServerUploadInfo request:", json2)
			})
			blobstream.pipe(stream)
			console.log("*** socket: sendFileServerUpload request: " + json)

			if (type == "drawingImage") {
				// 드로잉 이미지 불러오기 파일 경로 초기화
				callStore.setDrawingGetFileSrc("")

				// 드로잉 이미지 불러오기 파일 초기화
				callStore.setDrawingGetFileObject(null)

				// 드로잉 이미지 불러오기 업로드 flag 초기화
				callStore.setDrawingGetFileChangeFlag(false)
			}
		}
		// drawingPDFServerUpload
		function drawingPDFServerUpload(fname, fsize, pdfSrc) {
			// 
			const dateName = createDateName()

			const fileExtentionSplit = fname.split(".")
			const fileExtention = fileExtentionSplit[fileExtentionSplit.length - 1]
			const fileType = "pdf"

			// 파일 이름이 유니크한 값으로 만들기 위해 deviceid를 뒤에 추가한다.
			const sendFileName =
				dateName +
				"_" +
				sessionStorage.getItem("m_local_deviceid") +
				"." +
				fileExtention

			// sendFileName 저장 -> pdfToImageRate에서 cancel할 때 파라미터로 필요하기 때문에 저장함.
			PDFsendFileName = sendFileName

			// console.log("PDFsendFileName", PDFsendFileName)
			const stream = ss.createStream()
			const obj = {
				en_seq: loginStore.sessionEnSeq,
				fname: sendFileName,
				fsize
			}
			const json = JSON.stringify(obj)
			// node에서 이미지와 다르게 pdf는 buffer로 돌려주기 때문에, buffer -> blob처리 한다.
			// 업로드 호출 할 때 blob 처리해서 보내줌.
			// const fn = new Blob([pdfSrc], {
			//  type: "application/pdf"
			// })
			const fn = pdfSrc
			// const fn = sendFileServerUploadFileToBlob(pdfSrc)

			ss(transfer_socket).emit("sendPdfFileServerUpload", stream, json)
			// console.log("*** transfer socket: sendFileServerUpload")
			const blobstream = ss.createBlobReadStream(fn)
			// 업로드 진행률 받아오기
			let uploadSize = 0
			blobstream.on("data", function(chunk) {
				uploadSize += chunk.length
				// console.log("uploadSize", uploadSize)
				let progress = Math.floor((uploadSize / fsize) * 100)

				// 진행률이 100보다 클 경우 100으로 설정
				if (progress > 100) {
					progress = 50
				}

				// pdf 서버 업로드 진행률 증가
				// console.log("progress(progress)
				callStore.setPDFUploadProgrss(Math.floor(progress / 2))
			})
			blobstream.on("end", function() {
				// 업로드 취소 버튼을 클릭 안했을 경우에만 실행한다.
				if (callStore.PDFcancelUploadFlag == false) {
					// upload Cancel Interval 초기화
					clearInterval(PDFCancelUploadInterval)

					// DB Save
					const obj2 = {
						en_seq: loginStore.sessionEnSeq,
						hq_seq: loginStore.sessionHqSeq,
						br_seq: loginStore.sessionBrSeq,
						// joined_members: "joined_members", // 보내는 사람과 받는사람 (ex. 김승하, 곽선영)
						joined_members: sessionStorage.getItem("m_nickname"),
						file_path: str_stream_picture_file_path,
						file_name: sendFileName,
						// file_type: "picture",
						file_type: fileType,
						getWorldTime: getWorldTime(),
						localdeviceid: sessionStorage.getItem("m_local_deviceid"),
						remotedeviceid: null,
						roomid: sessionStorage.getItem("m_roomid")
					}
					const json2 = JSON.stringify(obj2)
					$signallingSocket.emit("sendFileServerUploadInfo", json2)
					// console.log("*** socket: sendFileServerUploadInfo request:", json2)

					// pdf 업로드 후, DB에 등록 한 후에 stream transfer PDF to Image 호출
					const pdfToImageInfo = {
						file_name: sendFileName,
						groupIndex: drawingStore.lastPDFGroupIndex
					}
					const pdfToImageJson = JSON.stringify(pdfToImageInfo)
					transfer_socket.emit("pdfToImage", pdfToImageJson)
					// console.log("*** transfer socket: pdfToImage request:", pdfToImageInfo)
				} else {
					// /* 업로드 취소 FLOW Start */

					// 쌓인 Que 중 가장 앞쪽에 있는 Que 제거
					callStore.removePdfUploadQueArray()

					// PDF CancelUpload Flag 초기화를 interval 에서 초기화하면 pdfToImage를 무조건 false로 타기 때문에
					// 여기서 초기화를 진행한다.
					callStore.setPDFcancelUploadFlag(false)
					console.log(
						"*** setPDFCancelUploadFlag Change : ",
						callStore.PDFcancelUploadFlag
					)

					// 이번 업로드 건은 취소하였고, 쌓인 Que가 있는지 확인한다.
					// queArray의 length가 남아있으면, 쌓여있던 Que를 실행시켜라.
					if (callStore.pdfUploadQueArray.length > 0) {
						console.log("QueArray가 0보다 크며, 남은 Que가 있다.")

						// upload 시작
						callStore.setPDFUploading(true)
						drawingPDFServerUpload(
							callStore.pdfUploadQueArray[0].name,
							callStore.pdfUploadQueArray[0].size,
							callStore.pdfUploadQueArray[0].src
						)
					}

					/* 업로드 취소 FLOW End */
				}
			})
			blobstream.pipe(stream)

			PDFCancelUploadInterval = setInterval(function() {
				// 업로드 전송 취소가 true 일 경우 unpipe !
				// console.log(
				//  "cancelUploadFlag",
				//  callStore.PDFcancelUploadFlag
				// )
				if (callStore.PDFcancelUploadFlag == true) {
					console.log(
						"*** transfer socket: PDF CancelUpload - blobStream unpipe Start"
					)

					// pipe 연결 끊기
					blobstream.unpipe()

					/* 업로드 취소 FLOW Start */
					// 드로잉 pdf 업로드 flag로 변경
					callStore.setDrawingGetPDFUploadFlag(false)

					// 드로잉 pdf 업로드 중임을 저장 Flag 초기화
					// -> 이것이 true일 경우 호스트 변경 요청을 막기 때문에 false로 변경
					callStore.setPDFUploading(false)

					// 진행률 0 만들기
					callStore.setPDFUploadProgrss(0)

					// Interval 초기화
					clearInterval(PDFCancelUploadInterval)
				}
			}, 1000)
			// console.log("*** socket: sendFileServerUpload request: " + json)

			// 드로잉 이미지 불러오기 파일 경로 초기화
			callStore.setDrawingGetPDFUploadSrc("")

			// 드로잉 이미지 불러오기 파일 초기화
			callStore.setDrawingGetPDFUploadObject(null)

			// // 드로잉 이미지 불러오기 업로드 flag 초기화 -> serverUpload 실행 후 바로 false 처리 -> 그래야 바로 불러오기 가능
			// callStore.setDrawingGetPDFUploadFlag", false)
		}
		// 방 인원 초과
		function roomFullRequest() {
			const obj = {
				leaveDeviceid: sessionStorage.getItem("m_local_deviceid"),
				remoteDeviceid: sessionStorage.getItem("m_remote_deviceid"),
				roomid: sessionStorage.getItem("m_roomid")
			}
			const json = JSON.stringify(obj)
			$signallingSocket.emit("roomFull", json)
			console.log("*** socket: emit roomFull. json: ", json)
		}
		// 캔버스를 createOffe 한다.
		function canvasCreateOffer(type) {
			// console.log("*** method: canvasCreateOffer()")
			// 
			// console.log("globalVideoSend = ", globalVideoSend)
			// console.log("globalAudioSend = ", globalAudioSend)

			// const useAudio = true
			const useAudio = globalAudioSend

			let videoOrCanvas = "stdres-16:9" // 영상을 stdres로 보여주는지 hires로 보여주는지 전역 변수로 사용되면 좋을 듯 하다.

			if (type) {
				videoOrCanvas = "canvas"
				// console.log("공유한다.")
			} else {
				// videoOrCanvas = "stdres-16:9"
				// 전역으로 관리되는 카메라 장치 값이 true 라면 카메라 공유를 하겠지만, false라면 video None을 사용
				// eslint-disable-next-line no-lonely-if
				if (globalVideoSend) {
					videoOrCanvas = "stdres-16:9"
				} else {
					videoOrCanvas = "videoNone"
				}
			}

			if (canvasDrawInterval != null) {
				// console.log("****** Interval이 null이 아니다. clear 해준다.")
				clearInterval(canvasDrawInterval) // 자기 자신 인터벌 클리어
			}

			// // 화면 공유 전 나의 상태가 video OFF 였다면 videoOFF 상태로 돌려주기.
			// if (callStore.myVideoStatus == "videoOFF") {
			//  $store.commit("isVideo")
			// }

			// mic가 off일 경우 mic 음소거 처리
			let replaceAudioResult = ""
			if (isSounded) {
				replaceAudioResult = false
			} else {
				replaceAudioResult = true
			}

			sfutest.createOffer({
				media: {
					audioRecv: false,
					videoRecv: false,
					audioSend: useAudio,
					// videoSend: true,
					videoSend: globalVideoSend,
					replaceAudio: replaceAudioResult,
					replaceVideo: true,
					video: videoOrCanvas // canvas 공유의 핵심 코드
				},

				simulcast: doSimulcast,
				simulcast2: doSimulcast2,
				success(jsep) {
					// console.log("success")
					$Janus.debug("Got publisher SDP!", jsep)
					const publish = { request: "configure", audio: useAudio, video: true }
					sfutest.send({ message: publish, jsep })

					// drawing이 활성화 되어 있을 때만 실행한다.
					if (type) {
						// // 내 자신이 videoOFF 일 경우 MyVideoStatus를 videoOFF로 저장하고,
						// // 현재 비디오를 attach로 변경한다.
						// // 저장하는 이유는, 드로잉을 종료할 때 MyVideoStatus가 videoOFF이면 자신의 카메라 비디오 오프를 해주기 위해서.
						if (commonStore.isVideo == true) {
							// callStore.setMyVideoStatus", "videoOFF")
							commonStore.isVideo()
						}

						// // main Index 변경
						// callStore.setVideoMainIndex", 0)

						// // video Layout Type Change
						// if (callStoreingLayoutType != 3) {
						//  // videolayout change
						//  saveVideoInfo()
						// } else {
						//  const mainIndex = callStore.videoMainIndex
						//  let video = ""
						//  if (mainIndex == 0) {
						//      video = document.getElementById("myvideo")

						//      const mainVideo = document.getElementById("videoMain")
						//      mainVideo.srcObject = video.srcObject
						//      $("#videoMainCaption").html(
						//          sessionStorage.getItem("m_nickname")
						//      )

						//      mainVideoBorder(mainIndex)
						//  } else {
						//      video = document.getElementById("remotevideo" + mainIndex)

						//      const mainVideo = document.getElementById("videoMain")
						//      mainVideo.srcObject = video.srcObject
						//      $("#videoMainCaption").html(feeds[mainIndex].rfdisplay)

						//      // main border 생성
						//      mainVideoBorder(mainIndex)
						//      // location.reload()
						//  }
						// }

						// mainVideo Change Duration 보내기
						// hostSelected 호출
						hostSelectedMainVideo(myid)

						// 캔버스에 접근
						// upper-canvas 에 찍는건 mediaStream 이 재생되고 있다는걸 알리지 못함.
						const canvas = document.getElementById("pt2Canvas")
						const context = canvas.getContext("2d")

						// x좌표/y좌표 1, 1 위치에 가로/세로 1, 1의 투명색 점을 1초 마다 찍는 코드
						// 이렇게 함으로 canvas의 mediaStream이 재생되고 있다고 알림
						let aaaaa = 1
						const flag = true
						// let flag = true
						canvasDrawInterval = setInterval(function() {
							if(flag) {
								context.fillStyle = "rgb(255, 255, 255)"
								context.beginPath()
								context.fillRect(1, 1, 1, 1)
								context.closePath()
								context.fill()
								// 원본
								// context.fillStyle = "rgb(0, 0, 0, 0)"
								// context.fillRect(1, 1, 1, 1)
							}
							// 테스트
							// if (aaaaa == 1) {
							//  // 지울떄는 흰색으로 지움
							//  console.log("true....")
							//  context.fillStyle = "rgb(255,255,255)"
							//  context.clearRect(0, 0, 100, 100)
							//  context.beginPath()
							//  // context.fillStyle = "rgb(1, 1, 1, 100)"
							//  // context.fillRect(0, 0, 100, 100)
							// }
							// else {
							//  // 찍을떄는 검은색으로 찍음
							//  console.log("false....")
							//  context.fillStyle = "rgb(255, 255, 255)"
							//  context.fillRect(0, 0, 100, 100)
							//  aaaaa = 0
							// }
							// aaaaa++;
							// 원본
							// context.fillStyle = "rgb(0, 0, 0, 0)"
							// context.fillRect(1, 1, 1, 1)
						}, 125);

						// 드로잉 알림
						const obj = {
							rfid: myid,
							status: 1
						}

						const sendJson = JSON.stringify(obj)
						$signallingSocket.emit("drawing", sendJson)
						console.log("*** socket: emit drawing. json: " + sendJson)
					} else {
						// 드로잉 -> 화면공유로 이동하는 것이라면 화면공유로 이동해라.
						// console.log("drawingMoveToScreen", callStore.drawingMoveToScreen)

						// noneOverlatyAlert에서 드로잉 중 화면공유로 이동한다는 것을 true로 설정헌다.
						if (callStore.drawingMoveToScreen) {
							// console.log("drawingMoveToScreen이 true이기 때문에  screenShare를 실행합니다.")
							commonStore.isShare()

							// noneOverlatyAlert에서 드로잉 중 화면공유로 이동한다는 것을 변수에 저장한다.
							// 드로잉 -> 화면공유 이동 시 화면 공유 호출 후 초기화
							callStore.setDrawingMoveToScreen(false)
						}

						// 드로잉 종료 후 메인화면이 생성되면서, DOM이 초기화 되므로 이름을 넣어주어야 한다.
						$("#videoMainCaption").html(sessionStorage.getItem("m_nickname"))

						// 드로잉 종료 알림
						const obj = {
							rfid: myid,
							status: 0
						}

						const sendJson = JSON.stringify(obj)
						$signallingSocket.emit("drawing", sendJson)
						console.log("*** socket: emit drawing. json: " + sendJson)
					}
				},
				error(error) {
					$Janus.error("WebRTC error:", error)
					console.log("*** methods: canvasCreateOffer - WebRTC Error. " + error)

					if (commonStore.isDrawing) {
						commonStore.isDrawing()
					} else {
						canvasCreateOffer(false)
					}
					// if (useAudio) {
					//  publishOwnFeed(false)
					// } else {
					//  console.log("*** methods: canvasCreateOffer:: error::: else")
					//  // $('#publish').removeAttr('disabled').click(function() { publishOwnFeed(true); });
					// }
				}
			})
		}
		// laserPointer socket
		function laserPointerBroadCast() {
			const obj = {
				xLocation: callStore.laserPointerLaction[0].x,
				yLocation: callStore.laserPointerLaction[0].y
			}
			const json = JSON.stringify(obj)
			$signallingSocket.emit("laserPointer", json)
			console.log("*** socket: emit laserPointer. json: ", json)
		}
		/* 비디오 체크 및 마이크 체크 */
		function remoteFeedMediaTrackCheck(type, feedIndex) {
			if ($("#remotevideo" + feedIndex).length != 0) {
				const mediaTrack = $(
					"#remotevideo" + feedIndex
				)[0].srcObject.getTracks()

				// 마이크 체크
				if (type == "mic") {
					let userMicTrack = false

					for (let i = 0; i < mediaTrack.length; i++) {
						if (mediaTrack[i].kind == "audio") {
							userMicTrack = true
							break
						}
					}

					return userMicTrack
					// 카메라 체크
				} else if (type == "video") {
					let userCameraTrack = false

					for (let i = 0; i < mediaTrack.length; i++) {
						if (mediaTrack[i].kind == "video") {
							userCameraTrack = true
							break
						}
					}

					return userCameraTrack
				}
			}
		}
		function changeBitrate(bitrate) {
			if (typeof sfutest !== "undefined" && sfutest !== null) {
				sfutest.send({
					message: {
						request: "configure",
						bitrate
					}
				})

				// console.log("*** methods: changeBitrate - jauns customBitrate sfutest Send. customBitrate = " + bitrate)
			}
		}
		function requestHQCapture() {
			// console.log("*** methods: requestHQCaptrue")
			// mainIndex 조회
			const mainIndex = callStore.videoMainIndex

			// mainIndex를 이용하여 feeds의 deviceid 조회하기
			const remotedeviceid = feeds[mainIndex].rfdeviceid

			const obj = {
				localdeviceid: sessionStorage.getItem("m_local_deviceid"),
				remotedeviceid,
				enabled: 1 // true
			}

			const json = JSON.stringify(obj)
			$signallingSocket.emit("requestHQCapture", json)
			console.log("*** socket: emit requestHQCapture. json: ", json)
		}
		// 부재중 전화 기록
		function setMissedCall(hisSeq, localDeviceid, remoteDeviceid, sendCallTime) {
			const obj = {
				his_seq: hisSeq,
				local_deviceid: localDeviceid,
				remote_deviceid: remoteDeviceid,
				sendCall_time: sendCallTime
			}

			const json = JSON.stringify(obj)
			$signallingSocket.emit("missedCall", json)
			console.log("*** socket: emit missedCall. json: ", json)
		}
		/* 신규 사용자 Audio Duration Insert */
		function insertNewAudioDuration(mainRfid, myRfid, deviceid, uniqueRoomid) {
			const obj = {
				user_uid: mainRfid,
				my_uid: myRfid,
				deviceid,
				unique_roomid: uniqueRoomid,
				curr_time: getWorldTime()
			}

			const json = JSON.stringify(obj)
			$signallingSocket.emit("insertNewAudioDuration", json)
			console.log("*** socket: emit insertNewAudioDuration. json: ", json)
		}
		// 이전 메세지 가져오기
		function getPreviousMessage() {
			// 이전 메세지 보기 클릭 시 해당 vuex 저장 (상대방의 deviceid)
			const clickModalDeviceid = commonStore.directMessage
				.previousMessageInfo

			// 모달 1개일 경우 > directMessageList 자체가 0일 경우 - 현재 시간으로부터 이전 메세지를 가져온다.
			if (commonStore.directMessage.directMessageList.length == 0) {
				const obj = {
					sender: sessionStorage.getItem("m_local_deviceid"),
					receiver: clickModalDeviceid,
					datetime: getWorldTime(), // 현재 시간으로 부터 이전 메세지 가져오기
					count: commonStore.directMessage.previousMessageCount // 이전 메세지 가져올 갯수
				}

				const json = JSON.stringify(obj)

				$signallingSocket.emit("getPreviousMessage", json)
				console.log("*** socket.emit: getPreviousMessage Request: " + json)

				// 이전 메세지 클릭한 모달창 정보 초기화
				directMessageStore.setPreviousMessageInfo("")
			} else {
				// directMessage List를 for문을 수행하여 메세지의 첫번째를 찾음.
				for (
					let i = 0;
					i < commonStore.directMessage.directMessageList.length;
					i++
				) {
					const directMessageData = commonStore.directMessage
						.directMessageList[i]

					// directMessageList에서 내 아이디와 상대방의 아이디를 이용하여 index를 찾는다.
					if (
						(directMessageData.sender == clickModalDeviceid &&
							directMessageData.receiver ==
								sessionStorage.getItem("m_local_deviceid")) ||
						(directMessageData.sender ==
							sessionStorage.getItem("m_local_deviceid") &&
							directMessageData.receiver == clickModalDeviceid)
					) {
						const obj = {
							sender: directMessageData.sender,
							receiver: directMessageData.receiver,
							datetime: directMessageData.datetime,
							count: commonStore.directMessage.previousMessageCount
						}

						const json = JSON.stringify(obj)

						$signallingSocket.emit("getPreviousMessage", json)
						console.log("*** socket.emit: getPreviousMessage Request: " + json)

						// 이전 메세지 클릭한 모달창 정보 초기화
						directMessageStore.setPreviousMessageInfo("")
						break
					}

					/* 모달창이 여러개일 경우에 현재 모달창 갯수를 체크하여 0개일 경우 현재 시간으로 이전 메세지를 가져온다 */
					// 마지막까지 수행 했으나, 현재 모달창의 메세지 0개
					if (
						i ==
						commonStore.directMessage.directMessageList.length - 1
					) {
						// 현재 시간으로 datetime 설정
						const obj = {
							sender: sessionStorage.getItem("m_local_deviceid"),
							receiver: clickModalDeviceid,
							datetime: getWorldTime(), // 현재 시간으로 부터 이전 메세지 가져오기
							count: commonStore.directMessage.previousMessageCount
						}

						const json = JSON.stringify(obj)

						$signallingSocket.emit("getPreviousMessage", json)
						console.log("*** socket.emit: getPreviousMessage Request: " + json)

						// 이전 메세지 클릭한 모달창 정보 초기화
						directMessageStore.setPreviousMessageInfo("")
						break
					}
				}
			}
		}
		// 강제 로그아웃 요청 응답 (calling.vue 에서는 무조건 거절)
		function forceLogOutResult(reqSocketId, status) {
			const obj = {
				requestSocketid: reqSocketId,
				status
			}

			const json = JSON.stringify(obj)
			$signallingSocket.emit("forceLogoutResult", json)
			console.log("*** socket: emit forceLogoutResult")
			console.log(json)
		}
		function createLoadingMask(type) {
			document.getElementById("loader").classList.add("loader")
			document.getElementById("maskOverlay").classList.add("maskOverlay")
			document.getElementById("main").style.pointerEvents = "none"
			maskLoading = true
			maskLoadingType = type
		}
		/* resultSettingInRoomResult & onlocalStreamSuccess 일 경우 로딩 마스크 제거 */
		function loadingMaskDelete() {
			if (callStore.onlocalStreamSuccess) {
				// console.log("*** methods: loadingMaskDelete")
				/* 최초 입장 시 로딩 지우는 소스 */
				document.getElementById("loader").classList.remove("loader")
				if (accessDeviceCheck == "Mobile") {
					if (window.matchMedia("(orientation: landscape)").matches) {
						document
							.getElementById("maskOverlay")
							.classList.remove("maskOverlay")
					}
				} else {
					document.getElementById("maskOverlay").classList.remove("maskOverlay")
				}
				document.getElementById("main").style.pointerEvents = "auto"
				maskLoading = false

				/* vuex 초기화 */
				callStore.setOnlocalStreamSuccess(false)
			}
		}
		function prepareStreamMode(type) {
			// mainIndex 조회
			const mainIndex = callStore.videoMainIndex

			// mainIndex를 이용하여 feeds의 deviceid 조회하기
			const remotedeviceid = feeds[mainIndex].rfdeviceid

			const obj = {
				localdeviceid: sessionStorage.getItem("m_local_deviceid"),
				remotedeviceid,
				stream_type: type
			}

			const json = JSON.stringify(obj)
			$signallingSocket.emit("prepareStreamMode", json)
			console.log("*** socket: emit prepareStreamMode")
			console.log(json)
		}
		// 파일 송신측 파일 송수신 초기화
		function fileSendReset() {
			// 파일 송신 모달 초기화
			// $store.commit("fileSendStatus", 0)

			// 파일 송신 진행률 초기화
			callStore.setTransmissionRate(0)

			// 파일 송신 취소 버튼 클릭 초기화
			commonStore.setCancelFileTransferFlag(false)
		}
		// 파일 수신측 파일 송수신 초기화 (remote deviceid)
		function fileReceiveReset(deviceid, rfIndex) {
			// 파일 송신 모달창 초기화
			// commonStore.fileSendStatus", 0)

			// 파일 송수신 중 초기화
			// sessionStorage.setItem("fileSendingFlag", false)

			// 파일 수신 진행률 초기화 (메인만)
			// callStore.setReceptionRate", 0)
			commonStore.setFileReceptionRate({
				index: rfIndex, //  callinWindow 송신자 화면인덱스
				rate: 0 // 수신율
			})
			const rfFeedsIndex = findFeedsIndexDeviceid(deviceid)
			// 고화질 캡쳐가 아닌 경우
			if (!callStore.HQCaptureFlag) {
				// 2초 뒤에 내 화면을 카메라로 변경
				setTimeout(() => {
					// 내 화면을 비디오로 변환
					// callingLayoutChange("attach", sessionStorage.getItem("m_nickname"), 0)
					// $("#myvideo").show()

					// 송신자 화면을 비디오로 변환

					if (rfFeedsIndex) {
						let status = commonStore.userListStatus[rfFeedsIndex].fileReceiveInfo.beforeStatus
						// 송신자화면 videoOFF상태에서 파일수신 > 수신완료 시 기존 화면 상태값 유지 ksy
						callingLayoutChange(
							status,
							commonStore.userListStatus[rfFeedsIndex].text,
							rfFeedsIndex
						)
						$("#remotevideo" + rfFeedsIndex).show()
						$("#panel-inner" + rfFeedsIndex).show()
					}

					// if (status == "attach") {
					//  callingLayoutChange(
					//      status,
					//      commonStore.userListStatus[rfFeedsIndex].text,
					//      findFeedsIndexDeviceid(deviceid)
					//  )
					//  $("#remotevideo" + findFeedsIndexDeviceid(deviceid)).show()
					//  $("#panel-inner" + findFeedsIndexDeviceid(deviceid)).show()
					// } else {
					//  callingLayoutChange(
					//      commonStore.userListStatus[rfFeedsIndex].status,
					//      commonStore.userListStatus[rfFeedsIndex].text,
					//      findFeedsIndexDeviceid(deviceid)
					//  )
					// }
					// callingLayoutChange(5, commonStore.userListStatus[rfFeedsIndex].text, findFeedsIndexDeviceid(deviceid))
				}, 2000)
			} else {
				// 고화질 수신완료 시 초기화
				callStore.setHQCaptrueFlag(false)
				if (rfFeedsIndex) {
					$("#remotevideo" + rfFeedsIndex).show()
					$("#panel-inner" + rfFeedsIndex).show()
				}
			}
		}
		// 하단 정렬 레이아웃 버튼 값 변경 값 변경 감지
		function setInitUnderStatus(result) {
			if(result == 0) {
				let cnt = 0
				for(let i = 0; i < commonStore.userListStatus.length; i++) {
					// console.log(commonStore.userListStatus[i].status)
					if (commonStore.userListStatus[i].status == 2 || commonStore.userListStatus[i].status == 3) {
						cnt ++
					}
				}
				// console.log(cnt)
				if (cnt <= 1) {
					callStore.setUnderStatus(0)
				}
				// console.log(commonStore.userListStatus)
				// console.log("하단 정렬 레이아웃 버튼 변경 감지")
			}
		}
		// 파일 송수신 관련 채팅창 메시지 넣기
		// status: 1(파일 송신중), 2(파일 수신중), 3(파일 수신 완료), 4(파일 송신 거절), 5 (파일 전송 완료), 6(파일 수신 거절), 9(송신자 파일 송신 취소), 10(수신자 파일 송신 취소)
		function addChatFileSendMessage(nickname, status, rfIndex, fileChatIndex) {
			// 현재시간 UTC 가져오기
			const nowDate = getWorldTime()

			// 메세지 만들기
			let fileSendingMessage = ""
			switch (status) {
				case 1:
					fileSendingMessage = $t("fileSending text1")
					break;
				case 2:
					fileSendingMessage = $t("fileSending text2")
					break;
				case 3:
					fileSendingMessage = $t("fileSending text3")
					break;
				case 4:
					fileSendingMessage = $t("fileSending text4")
					break;
				case 5:
					fileSendingMessage = $t("fileSending text5")
					break;
				case 6:
					fileSendingMessage = $t("fileSending text6")
					break;
				case 9:
					fileSendingMessage = $t("fileSending text9")
					break;
				case 10:
					fileSendingMessage = $t("fileSending text10")
					break;
				default:
					break;
			}

			// 한/영 조건
			let message = ""
			if (loginStore.lang == "ko") {
				message = nickname + fileSendingMessage
			} else {
				message = fileSendingMessage + nickname
			}

			let changeChatIndex = ""
			if(rfIndex) {
				changeChatIndex = fileChatIndex
				// changeChatIndex = commonStore.userListStatus[rfIndex].fileReceiveInfo.fileChatIndex
			} else {
				changeChatIndex = chattingFileSendIndex
			}

			// 채팅창에 파일 송수신 관련 메세지 넣기
			$set(
				chattingStore.chattingMessageList,
				changeChatIndex,
				{
					type: 0,
					message,
					date: nowDate,
					chattingDate: getChattingTimeZone(nowDate),
					nickname: sessionStorage.getItem("m_nickname"),
					level: 1
				}
			)
		}
		function checkAlreadyJoined(id) {
			console.log(`*** method check already joined`)

			if (keepAliveList.length === 0) return false;

			let result = false;

			feeds.forEach((ele, index) => {
				console.log(ele)
				if (ele === null || ele === undefined) return;
				if (ele.rfdeviceid === id) {
					result = index;
				}
			})

			if (result != false){
				console.log(`*** ${id} has alreadyJoinded remove remoteFeed!!!`)
				feeds[result] = "";
				const listIndex = keepAliveList.indexOf(id);
				keepAliveList.splice(listIndex, 1)
				$store.commit('chatting/setPersonnelInRoom', personnelInRoom -1);
			}
			console.log(keepAliveList)
			return result;
		}
		function checkRejoined(id) {
			console.log(`check ${id} have rejoined`);

			if (keepAliveList.includes(id)) {
				console.log(`${id} have not joined again remove stream container`);

				feeds.forEach((ele,  index) => {
					if (ele.rfdeviceid === id) {
						cleanUpDummyFeed(id, index);
						keepAliveList.splice(index, 1);
					}
				})
			}
		}
		function cleanUpDummyFeed(id, index) {
			const userNickname = userListGetNickname(id)
			const feedsIndex = index

			// 통화 중에 다른 사용자가 퇴장했을 경우 - 해당 사용자의 줌레벨 값을 1로 초기화 시킨다.(ksy)
			if (!(typeof commonStore.userListStatus[feedsIndex] == 'undefined' ||
				commonStore.userListStatus[feedsIndex] == null)) {
				commonStore.userListStatus[feedsIndex].zoomLevel = 1
			}
			console.log(userNickname, feedsIndex)

			// 파일 수신중 송신자가 퇴장 시 파일수신창 없애기
			if(userNickname == commonStore.fileSendNickname) {
				// fileReceiveAllow = false

				// 파일 송수신 진행 중 초기화
				// sessionStorage.setItem("fileSendingFlag", false)

				// 파일 수락/거절 채팅 인덱스를 가져온다
				const fileChatIndex = commonStore.userListStatus[feedsIndex].fileReceiveInfo.fileChatIndex

				// 송신자가 파일 송신 취소를 메세지에 추가
				addChatFileSendMessage(userNickname, 10, feedsIndex, fileChatIndex)

				// 수신측 파일 송수신 초기화
				fileReceiveReset(json.deviceid, feedsIndex);

				// 퇴장한 사람 파일수신창 없애기
				callingLayoutChange(
					"none",
					sessionStorage.getItem("m_nickname"),
					feedsIndex
				)

				$("#myvideo").show()

				commonStore.fileSend()
				setInitUnderStatus(0)
			}
			console.log(commonStore.fileSendStatus)
			// 파일 송신 중에 수신자가 퇴장 시 거절처리 진행
			if ((commonStore.fileSendStatus == 2 || commonStore.fileSendStatus == 3) &&
				(userNickname == commonStore.fileReceiver)) {

				// 거절 팝업창으로 변경
				commonStore.fileSendStatus(4)

				console.log(sendFileReader, rateStopper)
				// 송신할 파일 Reader 중단
				if (!(typeof sendFileReader == "undefined" || sendFileReader == null)) {
					sendFileReader.abort()
				}

				// 전송률 전송 재귀함수 정지
				if (!(typeof rateStopper == "undefined" || rateStopper == null)) {
					rateStopper()
					rateStopper = null
				}
				// 사진 전송 중 메세지 -> 사진 수신 거절 메세지로 변경 ksy
				const fileChatIndex = commonStore.userListStatus[feedsIndex].fileSendInfo.fileChatIndex
				addChatFileSendMessage(userNickname, 6, feedsIndex, fileChatIndex)
			}

			console.log("discalling on Event : " + roomFullCheck)
			if (!roomFullCheck) {
				// 통화 종료 시 $t = nuxt 버전에 따라서 충돌이 일어나므로, setTimeout으로 예외처리 하면 된다는 답변을 받았음.
				setTimeout(function() {
					const receiveMessage = userNickname + $t("chatting Leave")
					const nowDate = getWorldTime()
					addReceiveMessageList(
						userNickname,
						nowDate,
						getChattingTimeZone(nowDate),
						receiveMessage,
						1,
						0
					)
					getPersonnelInRoom()
				}, 500)
			} else {
				// 룸 가득 차있다는 flag 초기화
				roomFullCheck = false
			}

			console.log(
				"*** socket: discalling > autoDiscalling = " + autoDiscalling
			)
			/* 통화 자동 종료가 설정되어있는지 체크한다. */
			if (autoDiscalling) {
				/*
					방 안에 혼자남았을 경우 통화를 자동으로 종료한다.
					사용자가 나가면 feeds를 empty로 바꾸기 때문에 값이 비어있는지 체크해야 한다.
				*/
				const NullFilterFeeds = feeds.filter(function(item) {
					return item !== null
				})

				if (NullFilterFeeds.length == 0) {
					console.log("*** socket: discalling > start AutoDiscalling")

					// 자동종료 팝업창 표시
					noneOverlayModal(19)

					// 자동 통화 종료 설정
					funcAutoDiscalling = setTimeout(() => {
						// 자동 통화 종료 진행한다.
						callStore.setAutoDiscallingResult(true)
						commonStore.janus.destroy()
					}, 5000)
				}
			}

			/* glass > 연결이 끊겼을 경우 움직임 없음 알람에 속해있을 경우 제외한다. */
			if (
				callStore.motionNoMoveInfo.length != 0 &&
				callStore.motionNoMoveFlag
			) {
				/* 해당 deviceid가 배열에 존재하는지 확인한다. */
				for (
					let i = 0;
					i < callStore.motionNoMoveInfo.length;
					i++
				) {
					if (
						callStore.motionNoMoveInfo[i].deviceid ==
						json.deviceid
					) {
						console.log("*** socket: discalling > motionNoMove Remove !")
						const motionNoMove = callStore.motionNoMoveInfo[i]
						/* deviceid가 움직임 없음 배열에 존재한다 */
						/* 현재 움직임 없음 배열의 길이를 체크한다. > length == 1 일 경우 움직임 없음 Flag를 false 변경 */
						if (callStore.motionNoMoveInfo.length == 1) {
							/* 움직임 없음 모션 Flag = false 로 변경한다. > 해당 건을 삭제 후에는 length 가 0이기 때문에 */
							callStore.setMotionNoMoveFlag(false)
						}

						/* 해당 deviceid를 움직임 없음 배열에서 삭제한다. */
						callStore.deleteMotionNoMoveInfo(i)

						/* 움직임 없음 모션 아이콘을 subVideo에서 삭제한다. */
						setSubVideoMotionNoMove(motionNoMove.rfIndex, false)
					}
				}
			}
			// 나간 사람 오디오 제거해줌
			const permanantAuido = document.getElementById(`audioControl${feedsIndex}`)
			permanantAuido.srcObject = null

			const remoteFeed = feeds[index];

			$("#remote" + remoteFeed.rfindex)
			.empty()
			.hide()

			const customNickname = customUserNickname(
				remoteFeed.rfdeviceid
			)
			console.log(
				"*** mounted: onmessage > unpublish > customNickname: ",
				customNickname
			)

			callingLayoutChange("none", customNickname, feedsIndex)

			// 마이크 음소거
			setUserListMicMute(remoteFeed.rfindex, false)

			// 호스트 권한 삭제
			setHostIcon(remoteFeed.rfindex, false)

			// 모션 관련 아이콘 삭제
			setSubVideoMotionFall(remoteFeed.rfindex, false)
			setSubVideoMotionNoMove(remoteFeed.rfindex, false)

			feeds[remoteFeed.rfindex] = null
			// console.log("****** feeds 클리어: ".concat(remoteFeed.rfindex))

			remoteFeed.detach()
		}


function sayHello() {
	opaqueId = "videoroomtest-" + $Janus.randomString(12)
	// console.log("****** videoroomtest.js - opaqueId = " + this.opaqueId)

	if (getQueryStringValue("room") !== "")
		myroom = parseInt(getQueryStringValue("room"))
	myroom = parseInt(sessionStorage.getItem("m_roomid"))

	doSimulcast =
		getQueryStringValue("simulcast") === "yes" ||
		getQueryStringValue("simulcast") === "true"
	doSimulcast2 =
		getQueryStringValue("simulcast2") === "yes" ||
		getQueryStringValue("simulcast2") === "true"
	subscriber_mode =
		getQueryStringValue("subscriber-mode") === "yes" ||
		getQueryStringValue("subscriber-mode") === "true"

	// -> kyj
	str_stream_picture_file_path = process.env.fileSavePath

	console.log("*** mounted: Media module 초기화 ")
	setIntervalStream = ""
	$Janus.init({
		debug: "false",
		callback() {
			$(this)
				.attr("disabled", true)
				.unbind("click")

			console.log("*** mounted: Media module attach start. ")

			// Make sure the browser supports WebRTC
			janus = new $Janus({
				// 지정한 서버
				server: "wss://hdcardev.watttalk.kr:8989",

				// 서버 접속 성공
				success() {
					// 주요 로직
					console.log("*** mounted: janus attach success. ")

					janus.attach({
						plugin: "janus.plugin.videoroom",
						opaqueId: opaqueId,
						success(pluginHandle) {
							// console.log(
							//  "****** janus.init - success: function() - pluginHandle = "
							// )
							// console.log(pluginHandle)
							$("#details").remove()
							sfutest = pluginHandle
							// console.log(
							//  "****** janus.init - success: function() - sfutest = "
							// )
							// console.log(sfutest)
							$Janus.log(
								"Plugin attached! (" +
								sfutest.getPlugin() +
								", id=" +
								sfutest.getId() +
								")"
							)
							$Janus.log("  -- This is a publisher/manager")
							// Prepare the username registration
							$("#videojoin")
								.removeClass("hide")
								.show()
							$("#registernow")
								.removeClass("hide")
								.show()
							$("#register").click(registerUsername)
							$("#username").focus()
							// username input box 이름 변경
							$("#username").val(sessionStorage.getItem("m_nickname"))
							$("#start")
								.removeAttr("disabled")
								.html("Stop")
								.click(function () {
									$(this).attr("disabled", true)
									janus.destroy()
								})
							registerUsername()

							// console.log("****** $store.commit 직전")
							commonStore.setSfutest(pluginHandle)

							// const userStatus = {
							//  index: 5,
							//  status: {
							//      status: "my"
							//  }
							// }

							// 실시간 반영이 안되는건가??
							// $store.commit("setUserList", userStatus)

							// callingLayoutCompData.userList[5] = {
							//  status: "my"
							// }

							// console.log(
							//  " callingLayoutCompData = " + callingLayoutCompData
							// )
							// console.log(callingLayoutCompData)
						},
						error(error) {
							console.log("*** mounted: jauns attach Error. ", error)
							$Janus.error("  -- Error attaching plugin...", error)
							alert("Error attaching plugin... " + error)
						},
						consentDialog(on) {
							$Janus.debug(
								"Consent dialog should be " + (on ? "on" : "off") + " now"
							)
							if (on) {
								// // Darken screen and show hint
								// $.blockUI({
								//  message: '<div><img src="up_arrow.png"/></div>',
								//  css: {
								//      border: 'none',
								//      padding: '15px',
								//      backgroundColor: 'transparent',
								//      color: '#aaa',
								//      top: '10px',
								//      left: (navigator.mozGetUserMedia ? '-100px' : '300px')
								//  } });
							} else {
								// // Restore screen
								// $.unblockUI();
							}
						},
						iceState(state) {
							console.log("*** mounted: Media module init - iceState = ", state)
							// console.log(
							//  "****** janus.init - iceState: function() - state = "
							// )
							// console.log(state)
							$Janus.log("ICE state changed to " + state)

							console.log("ICE state change ! : " + state)

							// ice 끊겼을 경우
							if (state == "disconnected") {
								console.log("1. ice state가 disconnect 입니다.")
								iceStateConnect = false

								console.log(
									"2. iceStateConnect 의 상태 변경 : " + iceStateConnect
								)

								// 토스트 메세지 5초간 출력한뒤 사라진다.
								visibleToastMessage($t("network down"))
								console.log("3. 토스트 메세지 출력했습니다.")

								// 30초 후 다시 한번 체크하여 iceStateConnect가 false 일 경우 통화 종료 처리한다.
								iceStateCheck = setTimeout(function () {
									console.log("30초 후 iceState : " + iceStateConnect)

									// iceStateConnect == false 일 경우
									if (!iceStateConnect) {
										console.log('*** ice state connect fail!!!!!');
										// alert($t("iceState Fail"))
										// 통화 종료
										// janusAndCallingDestroy()
									}
								}, 30000)
								console.log("4. setTimeout 등록했습니다.")
							} else if (state == "connected") {
								iceStateConnect = true
								console.log(
									"6. iceStateConnect 의 상태를 변경 : " +
									iceStateConnect
								)
								// ice State Check != undefined 아닐 경우
								if (iceStateCheck != undefined) {
									console.log("7. setTImeout이 걸려있습니다.")
									// setTimeout 제거
									clearTimeout(iceStateCheck)
									console.log("8. setTimeout을 제거 했습니다.")

									// iceStateCheck 초기화
									iceStateCheck = undefined
									console.log(
										"9. iceStateCheck를 초기화 했습니다. iceStateCheck : " +
										iceStateCheck
									)
								}
								if (onlyVoiceID.includes(sessionStorage.getItem("m_local_deviceid")) || callStore.cameraNotAllowed) {
									const test = setInterval(() => {
										commonStore.setIsVideoFalse()
										commonStore.setIsVideoTrue()
									}, 100)
									setTimeout(() => {
										clearInterval(test)
										commonStore.setIsVideoTrue()
									}, 1000)
								}
							}
						},
						mediaState(medium, on) {
							$Janus.log(
								"$Janus " +
								(on ? "started" : "stopped") +
								" receiving our " +
								medium
							)
						},
						webrtcState(on) {
							$Janus.log(
								"$Janus says our WebRTC PeerConnection is " +
								(on ? "up" : "down") +
								" now"
							)
							// $("#videolocal").parent().parent().unblock();
							if (!on) return
							$("#publish").remove()
							// This controls allows us to override the global room bitrate cap
							$("#bitrate")
								.parent()
								.parent()
								.removeClass("hide")
								.show()
							$("#bitrate a").click(function () {
								const id = $(this).attr("id")
								const bitrate = parseInt(id) * 1000
								if (bitrate === 0) {
									$Janus.log("Not limiting bandwidth via REMB")
								} else {
									$Janus.log("Capping bandwidth to " + bitrate + " via REMB")
								}
								$("#bitrateset")
									.html($(this).html() + '<span class="caret"></span>')
									.parent()
									.removeClass("open")
								sfutest.send({
									message: { request: "configure", bitrate }
								})
								return false
							})
						},
						onmessage(msg, jsep) {
							console.log("*** mounted: Media module init - onmessage")
							console.log(msg)
							// console.log("****** janus.init - onmessage - msg = ")
							// console.log(msg)
							// console.log("****** janus.init - onmessage - jsep = ")
							// console.log(jsep)

							// console.log("****** janus.init - onmessage - event = ")
							// console.log(event)

							const event = msg.videoroom

							if (event) {
								// 방 참가 시
								if (event === "joined") {
									// Publisher/manager created, negotiate WebRTC and attach to existing feeds, if any
									myid = msg.id
									mypvtid = msg.private_id
									$Janus.log(
										"Successfully joined room " +
										msg.room +
										" with ID " +
										myid
									)
									$Janus.log(
										"----- document ready: onmessage ----- Successfully joined room " +
										msg.room +
										" with ID " +
										myid
									)

									// console.log("@@@@@@@@@@@@@")
									// console.log("msg", msg)
									// console.log("jsep", jsep)

									// console.log(
									//  "****** janus.init - onmessage - event = joined / subscriber_mode = "
									// )
									// console.log(subscriber_mode)
									if (subscriber_mode) {
										$("#videojoin").hide()
										$("#videos")
											.removeClass("hide")
											.show()
									} else {
										publishOwnFeed(true)
									}
									// Any new feed to attach to?
									if (msg.publishers) {
										const list = msg.publishers
										$Janus.debug(
											"Got a list of available publishers/feeds:",
											list
										)
										$Janus.log(
											"Got a list of available publishers/feeds:",
											list
										)
										for (const f in list) {
											const id = list[f].id
											const display = list[f].display
											const audio = list[f].audio_codec
											const video = list[f].video_codec
											$Janus.debug(
												"  >> [" +
												id +
												"] " +
												display +
												" (audio: " +
												audio +
												", video: " +
												video +
												")"
											)
											newRemoteFeed(id, display, audio, video)
										}
									}

									// -> kyj 통화 시작 시간을 기록한다.
									const currentTime = getWorldTime()
									const obj = {
										localdeviceid: sessionStorage.getItem("m_local_deviceid"),
										remotedeviceid: sessionStorage.getItem(
											"m_remote_deviceid"
										),
										start_time: currentTime,
										roomid: sessionStorage.getItem("m_roomid"),
										unique_roomid: uniqueRoomid, // 2021-07-21 추가
										localuseruid: String(myid) // 2021-10-13 추가
									}
									const json = JSON.stringify(obj)
									$signallingSocket.emit("callStartTime", json)
									console.log("*** socket: emit callStartTime. json: ", json)

									$nextTick(() => {
										setAudioOutput()
									})

									// 방 삭제 시
								} else if (event === "destroyed") {
									// The room has been destroyed
									$Janus.warn("The room has been destroyed!")
									alert("The room has been destroyed", function () {
										window.location.reload()
									})
									// ???
								} else if (event === "event") {
									// Any new feed to attach to?
									if (msg.publishers) {
										const list = msg.publishers
										const userName = getFeedsDisplay(list, '');

										checkAlreadyJoined(userName);

										$Janus.debug(
											"Got a list of available publishers/feeds:",
											list
										)
										for (const f in list) {
											const id = list[f].id
											const display = list[f].display
											const audio = list[f].audio_codec
											const video = list[f].video_codec
											$Janus.debug(
												"  >> [" +
												id +
												"] " +
												display +
												" (audio: " +
												audio +
												", video: " +
												video +
												")"
											)
											newRemoteFeed(id, display, audio, video)
										}
									} else if (msg.leaving) {
										// One of the publishers has gone away?
										const leaving = msg.leaving

										$Janus.log("Publisher left: " + leaving)
										$Janus.log(
											"----- document ready: onmessage:: event === 'event'::: msg['leaving'] -----  Publisher left: " +
											leaving
										)

										/* 나 혼자 남아있을 경우 otherParthAccess SessionStorage를 false로 변경 */
										const NullFilterFeeds = feeds.filter(function (item) {
											return item !== null
										})

										// console.log(
										//  "NullFilterFeeds Length : " + NullFilterFeeds.length
										// )

										/* 통화 종료 시, 이미 unpubilshed 에서 해당 index를 null로 변경
											null 값을 체크 할 때, empty 값도 null로 판단한다.
											==> NullFilterFeeds.length == 0 일 경우 혼자 인 것으로 판단한다. */
										if (NullFilterFeeds.length == 0) {
											// console.log("alone in room.")
											sessionStorage.setItem("otherPartyAccess", false)
											// console.log(
											//  "sessionStorage.setItem(otherPartyAccess : " +
											//      sessionStorage.getItem("otherPartyAccess")
											// )
										}

										let remoteFeed = null
										for (let i = 1; i < currentRoomNumberCount; i++) {
											if (feeds[i] && feeds[i].rfid == leaving) {
												remoteFeed = feeds[i]
												$Janus.log("---------- feeds[i] = " + feeds[i])
												break
											} else {
												// unpublished 2번 실행시키는 것 방지
												return
											}
										}
										if (remoteFeed != null) {
											const floatingMessage = $t('network down')
											if (keepAliveList.includes(remoteFeed.rfdeviceid)) {
												$(`#videoremote${remoteFeed.rfindex}`).append(
													'<div class="no-video-container" style="background-color:black; width: 100%; height: 100%; display: flex; justify-content: center; align-items: center">' +
													'<i class="fa fa-video-camera fa-5 no-video-icon"></i>' +
													`<span class="no-video-text">${floatingMessage}</span>` +
													"</div>"
												)
												return;
											}
											$Janus.debug(
												"Feed " +
												remoteFeed.rfid +
												" (" +
												remoteFeed.rfdisplay +
												") has left the room, detaching"
											)
											$("#remote" + remoteFeed.rfindex)
												.empty()
												.hide()

											// $("#videoremote" + remoteFeed.rfindex).empty()
											callingLayoutChange("none", "", remoteFeed.rfindex)

											// 참여자 계산
											getPersonnelInRoom()
											sessionStorage.setItem("m_callWaiting", "false")

											feeds[remoteFeed.rfindex] = null
											// console.log("****** feeds 클리어: ".concat(remoteFeed.rfindex))

											remoteFeed.detach()
										} else {
											callingLayoutChange("none", "", 1)

											// 참여자 계산
											getPersonnelInRoom()
											sessionStorage.setItem("m_callWaiting", "false")
										}
									} else if (msg.unpublished) {
										// One of the publishers has unpublished?
										// 여기
										const unpublished = msg.unpublished
										$Janus.log("Publisher left: " + unpublished)
										$Janus.log(
											"----- document ready: onmessage:: event === 'event'::: msg['unpublished'] -----  Publisher left: " +
											unpublished
										)
										if (unpublished === "ok") {
											// console.log("unpublished === ok")
											sfutest.hangup()
											$Janus.log(
												"----- document ready: onmessage:: event === 'event'::: msg['unpublished']:::: unpublished === 'ok' ----- "
											)
											return
										}
										let remoteFeed = null
										// for (let i = 1; i < 15; i++) {
										for (let i = 1; i < currentRoomNumberCount; i++) {
											if (
												feeds[i] &&
												feeds[i].rfid == unpublished
											) {
												remoteFeed = feeds[i]
												$Janus.log("---------- feeds[i] = " + feeds[i])
												break
											}
										}
										if (remoteFeed != null) {
											if (keepAliveList.includes(remoteFeed.rfdeviceid)) return;
											$Janus.debug(
												"Feed " +
												remoteFeed.rfid +
												" (" +
												remoteFeed.rfdisplay +
												") has left the room, detaching"
											)
											$Janus.log(
												"----- Feed " +
												remoteFeed.rfid +
												" (" +
												remoteFeed.rfdisplay +
												") has left the room, detaching"
											)
											$("#remote" + remoteFeed.rfindex)
												.empty()
												.hide()
											// $("#videoremote" + remoteFeed.rfindex).empty()

											// destroy 시 unpublish를 호출한다. 왜 ????

											const customNickname = customUserNickname(
												remoteFeed.rfdeviceid
											)
											console.log(
												"*** mounted: onmessage > unpublish > customNickname: ",
												customNickname
											)

											callingLayoutChange("none", customNickname, remoteFeed.rfindex)

											// 마이크 음소거
											setUserListMicMute(remoteFeed.rfindex, false)

											// 호스트 권한 삭제
											setHostIcon(remoteFeed.rfindex, false)

											// 모션 관련 아이콘 삭제
											setSubVideoMotionFall(remoteFeed.rfindex, false)
											setSubVideoMotionNoMove(remoteFeed.rfindex, false)

											feeds[remoteFeed.rfindex] = null
											// console.log("****** feeds 클리어: ".concat(remoteFeed.rfindex))

											remoteFeed.detach()
										}
									} else if (msg.error) {
										if (msg.error_code === 426) {
											// This is a "no such room" error: give a more meaningful description
											// 해당 룸 번호 없음. (가용할 수 있는 범위가 아니거나 룸이 null일 경우)

											if (loginStore.lang == "ko") {
												alert(
													`영상통화 방이 존재하지 않습니다. \n다시 통화 해주시기 바랍니다. \n ${sessionStorage.getItem("m_roomid")}`
												)
											} else {
												alert(
													"The video call room doesn't exist. \nPlease call me back."
												)
											}

											// alert(
											//  "<p>Apparently room <code>" +
											//      myroom +
											//      "</code> (the one demo uses as a test room) " +
											//      "does not exist...</p><p>Do you have an updated <code>janus.plugin.videoroom.jcfg</code> " +
											//      "configuration file? If not, make sure you copy the details of room <code>" +
											//      myroom +
											//      "</code> " +
											//      "from that sample in your current configuration file, then restart $Janus and try again."
											// )
										} else if (msg.error_code == 430) {
											// error_code 430 = 사용 할 수 있는 room이 없다.
											if (loginStore.lang == "ko") {
												alert(
													`가용할 수 있는 영상통화 방이 없습니다. \n관리자에게 문의하시기 바랍니다. ${sessionStorage.getItem("m_roomid")}`
												)
											} else {
												alert(
													"There is no video call room available. \nPlease contact the administrator."
												)
											}
										} else if (msg.error_code == 432) {
											// error_code 432 = 룸 인원 가득 참.
											console.log(msg.error)
											if (loginStore.lang == "ko") {
												// 룸 인원 초과 function 호출
												roomFullRequest()

												setTimeout(function () {
													// commonStore.janus.destroy()

													if (loginStore.lang == "ko") {
														alert(
															"설정된 룸 인원이 초과하여 영상통화에 입장할 수 없습니다."
														)
													} else {
														alert(
															"You cannot enter the video call because the number of people in the set room has exceeded."
														)
													}
												}, 1000)
											} else {
												alert(
													"You cannot enter the video call because the number of rooms set up is exceeded."
												)
											}
										} else {
											alert(msg.error + "\n error_code = " + msg.error_code)
										}

										// 통화 종료 처리
										$store.commit(
											"call/setHangupCallingConfirmFlag",
											true
										)
									}
								}
							}
							if (jsep) {
								$Janus.debug("Handling SDP as well...", jsep)
								sfutest.handleRemoteJsep({ jsep })
								// Check if any of the media we wanted to publish has
								// been rejected (e.g., wrong or unsupported codec)
								const audio = msg.audio_codec
								if (
									mystream &&
									mystream.getAudioTracks() &&
									mystream.getAudioTracks().length > 0 &&
									!audio
								) {
									// Audio has been rejected
									toastr.warning(
										"Our audio stream has been rejected, viewers won't hear us"
									)
								}
								const video = msg.video_codec
								if (
									mystream &&
									mystream.getVideoTracks() &&
									mystream.getVideoTracks().length > 0 &&
									!video
								) {
									// Video has been rejected
									toastr.warning(
										"Our video stream has been rejected, viewers won't see us"
									)
									// Hide the webcam video
									$("#myvideo").hide()
									$("#videolocal").append(
										'<div class="no-video-container">' +
										'<i class="fa fa-video-camera fa-5 no-video-icon" style="height: 100%;"></i>' +
										'<span class="no-video-text" style="font-size: 16px;">Video rejected, no webcam</span>' +
										"</div>"
									)
								}
							}
						},
						// 로컬 스트림이 들어 왔을 시
						onlocalstream(stream) {
							// console.log("////// stream = ", stream)
							// console.log("////// stream.getTracks() = ", stream.getTracks())
							$Janus.debug(" ::: Got a local stream :::", stream)
							$Janus.debug(
								"----- document ready: onlocalstream -----  Got a local stream :::",
								stream
							)
							console.log(` ----- document ready: onlocalstream -----  Got a local stream ::: ${stream}`)
							mystream = stream

							$("#videojoin").hide()
							$("#videos")
								.removeClass("hide")
								.show()
							if ($("#myvideo").length === 0) {
								// console.log("!!!!!!!!")
								// $("#videolocal").empty()
								callingLayoutChange("attach", sessionStorage.getItem("m_nickname"), 0)

								// 참여자 계산
								getPersonnelInRoom()

								// video div의 테두리를 없앤다.
								// $("#videolocal").css('border', 'none')

								// 방을 만들 경우 localstream 을 먼저 접근하고, 통화 수신을 받는 경우 remotestream 을 먼저 접근하여
								// 통화 수신 시 remtoe 영상을 큰 비디오에 담을 수 없으므로 아래 구문은 방을 만들 경우만 적용한다
								if (sessionStorage.getItem("createRoomFlag") === "true") {
									$("#videoMainCaption").text(
										sessionStorage.getItem("m_nickname")
									)

									// 최초 방 입장 시 duration 필수로 하기.
									hostSelectedMainVideo(myid)
								}

								$("#videolocal").css("border", "4px solid red");
								$("#videolocal").append(
									'<video class="rounded centered" id="myvideo" width="100%" height="100%" style="position:absolute; object-fit: fill;" autoplay playsinline muted="muted" />'
								)

								// local 화면에서 video_change() EventListener 를 지정
								const myvideo = document.getElementById("myvideo")

								myvideo.addEventListener("click", function () {
									// 드로잉 할 때는, 메인화면을 변경할 수 없습니다 출력.
									if (commonStore.isDrawing) {
										commonToastMessage(
											$t("toastMessage Drawing NoChangeMainVideo")
										)
										return
									}

									if (videoCallHost) {
										// eslint-disable-next-line camelcase
										// const main_video = document.getElementById("videoMain")

										// // mainVideo가 videoOff가 아닐 경우(video가 off이면 해당 영상이 숨겨져있으므로 return 처리만 하게 됨) && mainVideo와 현재 클릭한 video가 같다면 변경하지 않도록 하기. (중복클릭 방지)
										// if (
										//  !commonStore.isVideo &&
										//  main_video.srcObject == srcObject
										// ) {
										//  return
										// }

										// 바둑판이 아닐 경우
										if (callStoreingLayoutType != 1) {
											video_change(this)
											callStore.setVideoMainIndex(0),
											mainVideoChangeFunc(1, "localstream")
											
											// Main Video Border Change
											mainVideoBorder(0)

											// host가 바라보는 메인 화면으로 변경
											console.log("hostSelectedMainVideo 22")
											hostSelectedMainVideo(myid)
										} else if (callStoreingLayoutType == 1) {
											const beforeMainIndex = callStore.videoMainIndex
											console.log(beforeMainIndex)
											if (beforeMainIndex == 0 && feeds.length !== 0) {
												document.getElementById("myvideo").style.scale = 1
											} else if (beforeMainIndex !== 0 && feeds.length !== 0) {
												document.getElementById("remotevideo" + beforeMainIndex).style.scale = 1
											}

											// 바둑판 일 경우에도 메인화면을 변경할 수 있도록 수정한다.
											// 실제로 메인 비디오가 존재하지 않기 때문에 mainIndex만 변경하도록 한다.
											callStore.setVideoMainIndex(0)

											// Main Video Border Change
											mainVideoBorder(0)

											// host가 바라보는 메인 화면으로 변경
											console.log("hostSelectedMainVideo 23")
											hostSelectedMainVideo(myid)
										}
									}
								})

								/* 이 기능으로 인해 상대방이 들어와도 내 화면이 보이는 문제가 발생하여 주석 처리
								try {
									// 메인 화면에 local의 화면을 넣어줌.
									const videoMain = document.getElementById("videoMain")
									videoMain.srcObject = stream
								} catch (error) {
									console.log(error)
								}
								*/

								// 나의 Stream의 bitrate를 수정한다. - 300
								// 중요 !!
								changeBitrate(subVideoBitrate)
								// sfutest.send({
								//  message: {
								//      request: "configure",
								//      bitrate: subVideoBitrate
								//  }
								// })

								// console.log(
								//  "*** mounted: jauns customBitrate sfutest Send. customBitrate = " +
								//      subVideoBitrate
								// )

								// 입장 메세지
								const chattingNickname = sessionStorage.getItem("m_nickname")
								const chattingMessage =
									sessionStorage.getItem("m_nickname") +
									$t("chatting Enter")
								const chattingLevel = 2 // 공지
								const chattingType = 0

								addSendMessageList(
									chattingNickname,
									chattingMessage,
									chattingLevel,
									chattingType
								)

								// videoCallHost Check :: 호스트가 늦게 생성되면 호스트의 index를 찾지 못해서 setTimeout 추가
								if (sessionStorage.getItem("createRoomFlag") !== "true") {
									setTimeout(
										function () {
											videoCallHostCheck(
												sessionStorage.getItem("m_roomid"),
												sessionStorage.getItem("m_local_deviceid")
											)
										},
										2000,
										// 호스트에게 방의 상태를 확인하여 전체음소거 상태인지 아닌지 확인
										requestSettingInRoom(
											sessionStorage.getItem("m_roomid"),
											sessionStorage.getItem("m_local_deviceid")
										)
									)
								}
							}

							$("#publisher")
								.removeClass("hide")
								.html(myusername)
								.show()
							$Janus.attachMediaStream($("#myvideo").get(0), stream)
							$("#myvideo").get(0).muted = "muted"
							if (
								sfutest.webrtcStuff.pc.iceConnectionState !==
								"completed" &&
								sfutest.webrtcStuff.pc.iceConnectionState !== "connected"
							) {
								// $("#videolocal").parent().parent().block({
								//  message: '<b>Publishing...</b>',
								//  css: {
								//      border: 'none',
								//      backgroundColor: 'transparent',
								//      color: 'white'
								//  }
								// });
							}
							const videoTracks = stream.getVideoTracks()
							// if (stream.getAudioTracks()[0]) {
							// 	const audioStream = new MediaStream()
							// 	audioStream.addTrack(stream.getAudioTracks()[0])
							// 	const permanantAuido = document.getElementById(`audioControl0`)
							// 	permanantAuido.srcObject = audioStream
							// 	permanantAudio.volumn = 0
							// }
							if (!videoTracks || videoTracks.length === 0) {
								console.log("****** No webcam available ********* onlocalStream")

								// No webcam
								$("#myvideo").hide()
								if ($("#videolocal .no-video-container").length === 0) {
									$("#videolocal").append(
										'<div class="no-video-container" style="background-color:black>' +
										'<i class="fa fa-video-camera fa-5 no-video-icon"></i>' +
										'<span class="no-video-text">No webcam available</span>' +
										"</div>"
									)
								}
							} else {
								$("#videolocal .no-video-container").remove()
								$("#myvideo")
									.removeClass("hide")
									.show()

								// 영상이 재생 중임에도 no webcam 문구가 나타나는 문제 해결 방안으로 remove를 제일 마지막에 둔다.
								if ($("#videolocal .no-video-container").length != 0) {
									console.log(
										"local - 영상이 재생 중임에도 no webcam 문구가 나타났기에 해당 문구를 제거해주겠다."
									)
									$("#videolocal .no-video-container").remove()
								}
							}
							// main 화면에 넣어줄 video를 찾고 넣어주는 함수
							setIntervalStream = setInterval(function () {
								main_stream_check()
							}, 1000)

							/* onlocalStream 진행 후 onlocalStreamSuccess True 변경 */
							callStore.setOnlocalStreamSuccess(true)

							/* 마스크 제거 요청 > onlocalStream & resultSettingInRoom 정상 수신 시 마스크 제거한다. */
							loadingMaskDelete()

							// 파일 수신 중 내 비디오 숨김 해제 ksy
							// if (sessionStorage.getItem("fileSendingFlag") === "true") {
							//  console.log("********* 파일 송수신 중")
							//  $("#myvideo").hide()
							// }
							$nextTick(() => {
								setAudioOutput()
							})
						},
						onremotestream(stream) {
							// The publisher stream is sendonly, we don't expect anything here
							console.log(
								"----- document ready: onremotestream -----  Got a remote stream :::",
								stream
							)
						},
						oncleanup() {
							$Janus.log(
								" ::: Got a cleanup notification: we are unpublished now :::"
							)
							mystream = null

							// 영상 안 공유 버튼 주석
							// $("#videolocal").html(
							//  '<button id="publish" class="btn btn-primary">Publish</button>'
							// )
							// $("#publish").click(function() {
							//  publishOwnFeed(true)
							// })

							// $("#videolocal").parent().parent().unblock();
							$("#bitrate")
								.parent()
								.parent()
								.addClass("hide")
							$("#bitrate a").unbind("click")

							// localstream video off Img
							$("#videolocal").html(
								'<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADQAAAA0CAYAAADFeBvrAAAABHNCSVQICAgIfAhkiAAABntJREFUaEPNWktsW1UQPWM7dR3iWCm1Yuw0aUVbGlRA6qYVRaJsEItKIDaAyqbiv0AVEhJ0wU+qRCs2VCwKiK6gQBESLWLDAonyEVRdgCoQTegnaWInbpomlpM4TmIPHPMcbMf2e/fZrjLSU6K8uTNz7sy998x9ETRRVLULwCMA7gZwm/VErZ/0NAYgYf3k7+cBnBKRqWaFIY0aUtU+AI8CeBjAfQC8hjZzAH4EcBrAVyIybDi+TN01IFW9E8ARAHsbCaDK2G8AHBSRP9zYNQakqr0ADgHYB8DjxqmDMXkAJwC8LiJDDvSXVYwAqeozAI4CCJg4aUA3A+BFETnu1IYjQKp6C4BPrAXv1HYz9b4EsF9EZuyM2gJS1R0AvgBwu52xFr//m5uP3dqqC0hVX7IWfluLg3Vq3rYEawJS1V0AfgCwWsAUQS8CeEBEfq42C1UBqWoMwO8A1judulK9xcVFpNNpTE9PI5vNlpnweDwIBoPLjxv7ACYA7BCR0crxKwCpahDAT9Zpb+SPQCYmJpBKpRyNa2trQzgcRigUcqRfofQbgHtFZL7079UAHQbwiqmH+fl5DA8PI5/nEWImBBSNkiEZyxERebUmIOvQHATgNzHNjCQSpGjuxe/3Y+PGjWBJGgizs62ULpVlSFU/B/CYgUE0kplKPy4zdVJEHi/aWgakqjsB/GoChroXL14E106zhKXnYk1tF5E/GUMpoO8B3G8SGDeA69evmwyx1WXJbdmyxbT0vhWRh5YBqeo2AH/ZeqtQGBgYcLUJ2Pnp7u7GunXr7NQq3/eLyIVChlSVO8XbJhbm5uYKu1orpL29HX19bLOMhC3H4SIgrh2uIcfSinIrdd7f3+84FkvxrIjsElWNWG2xLVEt9TAyMoKZGVvyaxrUsv6mTZuwdu1ak/EKIEZAzwM4ZjKSuiw3ll2rhCXH0jOU/QT0PoDnDAeuVkAfENAp64LDCBOZgVPOZmTYUt68eTPI9QzlNAEZbwh0sgo3BYZ1loB4CWG8R5LyXLlyxXACnal3dHRgw4YNzpTLtQYIiATPiIwWbTSb9hTtuqQ/HJ4ioGkArhqSZrDsyjRw3XD9uJQCoAsA7nBpAJcvX17Rlbq1xXE9PT2FbtalFErOmJSWOiPTJig3jV1l0ORv5HENyBkCMu6BKh02oydy2QtVhnKSgN4FcKCBWSkMZaZIhyovRZzYdcmuq5k+SkDs9j5z4rioMzs7i2QyWbgHqORbPJ9u3LjhqARJbQim0kY8Hi/0Q3xn2JI/QUCdALjTOSKnpQxBRNDb27uCc3E9ETSvspi54lPkZlz0/L0a+RwdHS2Mo3i93sIm4ZDTkZyGHLcPqoqrV6+uIKQExZns6uK3LvdC0JysaoSXhywPWxv5r32gkpMGb2hoCJkMb2KrSyAQKJTgmjVr7ByveM82nqVaTxyAKmvw6rbg165dw+TkpKNAWR4sqc7OTvh8vppj2EuxtPjkcvyIV1+4lnjgsgxryP8tuJWlqucRs8LsuBGWIwPgw4AYePFxY68OxzsjIntos/TWZ7d1BVzm69KlS1hYWHDjvyVjYrFYIfsVwivhX8oAWVkq641YZiy31SQsY5Yes2/JaRHhl/eCVN6cbre+OnhZGmTTzaA0zZ4QXvCvX1/4MMLFd0/xknEFICtLbwJ4w2QjaHbAdva4Hrdu3cosvSUijHdZqn194GH79eDg4N7VmJ1i5NFo9FwoFNopIjxQawPim3Q6HR4bG0ssLS3V3nftprGF730+31JXV1dfOBxe8cmjJt1JJpP7pqamPs7n844oUQvjLzPt8Xi0s7PzyWg0+mk1n3WDjcfjH6VSqaduVrBO/IRCoeOxWOzpWrq2sz8+Pv5sKpU6lsvljL5EOQnORMfr9eZDodALkUjkw3rjbAFxcDKZ3J1Op79bWFhwdZliEng1Xb/fP9fR0fFgd3d31S/ftptCNaMjIyOxXC53bm5ujv82dtOkvb19zOfz3dXT0+OITDrKUGn0iUTiUCaTOZDNZm35fCOo/X7/bCAQeC8ajR40sWMMqGg8kUgQ1GuZTOZWE4d2uoFAYDIQCByKRCK8GjAW14CKnuLxOEnty9lsdk82mw2pqpFNHox+vz/V1tZ2xuPxvBOLxWzXScObgtNp4oHs9Xr3iQj/RTOSz+e7RSSsqmHaEJEJVZ3weDxJAOOqej6Xy50IBoP1uzunAfyr9w+YOZifVwIdWQAAAABJRU5ErkJggg==" />'
							)
						},
						// =>kyj
						ondataopen(data) {
							$Janus.log("Local The DataChannel is available!")
						},
						ondata(data) {
							$Janus.debug("We got data from the DataChannel!", data)
							console.log("*** mounted: local Ondata json:", data)
						}
						// <=kyj
					})
				},
				error(error) {
					$Janus.error(error)

					// 서버 연결 안될 시 (서버 다운 시) 예외 처리
					if (
						error ==
						"Error connecting to the $Janus WebSockets server: Is the server down?"
					) {
						alert(
							"미디어 서버에 연결할 수 없습니다. \n관리자에게 문의하시기 바랍니다."
						)

						// 통화 종료 처리
						callStore.setHangupCallingConfirmFlag(true)
						// eslint-disable-next-line no-constant-condition
					} else if ("Lost connection to the server (is it down?)") {
						// fail 처리
						// console.log("lost !!!!!! Fail !!!!!!!")
						alert($t("iceState Fail"))
						// 통화 종료
						janusAndCallingDestroy()
					} else {
						alert(error, function () {
							window.location.reload()
						})
					}
				},
				destroyed() {
					// 자신이 화면 공유 상태라면 화면 공유를 제거한다.
					if (commonStore.isShare) {
						console.log("screen Share Stop !!")
						// 문서공유 종료 알림
						const obj = {
							rfid: null,
							status: 0
						}

						const sendJson = JSON.stringify(obj)
						$signallingSocket.emit("screenSharing", sendJson)
						console.log(
							"*** socket: emit screenSharing Stop. json: " + sendJson
						)
					}

					// 자신이 드로잉 상태라면 드로잉 종료를 알린다.
					if (commonStore.isDrawing) {
						// 드로잉 종료 알림
						const obj = {
							rfid: myid,
							status: 0
						}

						const sendJson = JSON.stringify(obj)
						$signallingSocket.emit("drawing", sendJson)
						console.log("*** socket: emit drawing. json: " + sendJson)
					}
					// ksy Test Code - 파일 송신자 새로고침 시 수신창제거
					// cancelFileTransfer(
					//  sessionStorage.getItem("m_local_deviceid"),
					//  commonStore.fileReceiver
					// )

					// discalling
					discallingRequest(
						sessionStorage.getItem("m_local_deviceid"),
						sessionStorage.getItem("m_remote_deviceid"),
						sessionStorage.getItem("m_roomid"),
						sessionStorage.getItem("m_institution"),
						sessionStorage.getItem("m_nickname")
					)

					// -> RoomID 를 사용하지 않는다면 RoomID 를 가용하게 만든다
					const obj2 = {
						roomid: sessionStorage.getItem("m_roomid"),
						curr_time: getWorldTime(),
						meeting_seq: commonStore.meeting.meetingSeq, // 룸에 아무도 존재하지 않는다면 회의를 종료 시키기 위해서.
						sendDurationEnable: sendDurationEnable, // flag를 통하여 미디어 서버에 보낼지 안보낼지 체크 (혼자인 경우 미디어서버에 보내지 않음)
						unique_roomid: uniqueRoomid // 2021-07-21 추가
					}

					const json2 = JSON.stringify(obj2)
					$signallingSocket.emit("destroyRoomID", json2)
					console.log("*** socket: emit destroyRoomID. json: ", json2)

					setTimeout(function () {
						// -> kyj 통화 종료 시간을 기록한다
						const currentTime = getWorldTime()
						const obj = {
							his_seq: sessionStorage.getItem("m_his_seq"),
							end_time: currentTime
						}
						const json = JSON.stringify(obj)
						$signallingSocket.emit("callStopTime", json)
						console.log("*** socket: emit callStopTime. json: ", json)

						// 통화 종료 시 watch 부분에 빼고 여기 넣음. -> 회의실 종료
						leaveMeeting()
					}, 1000)

					clearInterval(setIntervalStream)

					// 화면 공유 관련 intever 제거
					if (myVideoCheckInterval != null) {
						// console.log(
						//  "****** 화면공유Interval이 null이 아니다. clear 해준다."
						// )
						clearInterval(myVideoCheckInterval) // 자기 자신 인터벌 클리어
					}

					// mainStream 관련 interval 제거
					if (setIntervalStream != null) {
						// console.log(
						//  "****** 메인화면 체크 interval null이 아니다. clear 해준다."
						// )
						clearInterval(setIntervalStream)
					}

					// callingTimer 관련 interval 제거
					if (callTimerInterval != null) {
						setCallingTimer("stop")
					}

					// 비디오 없는 사용자들에게 보여주는 투명색 점찍기(검정색 화면 보여주는) 인터벌이 살아있다면 clear 해준다.
					if (videoNoneCanvasInterval != null) {
						clearInterval(videoNoneCanvasInterval)
					}

					// reload
					setTimeout(function () {
						// 세션 삭제 - 위치 이동 : sessionStorage roomid를 미리 삭제해버려서 회의 종료 시 room id가 null이 되기 때문에 위치 이동.
						sessionStorage.removeItem("m_roomid")
						sessionStorage.removeItem("createRoomFlag")
						sessionStorage.removeItem("otherPartyAccess")

						// guest가 입장 시 윈도우 창 닫기
						if (callingType == "joinGuestCall") {
							// 비회원 참가 시 window close
							window.location.href = "https://wattsolution.co.kr/"
						} else if (callingType == "meetingCall") {
							$router.push("/meetingRoom")
							commonStore.changeViewType(1)
						} else {
							commonStore.changeViewType(0)
						}

						setTimeout(function () {
							window.location.reload()
						}, 500)
					}, 3000)
				}
			})
		}
	})
	// $store.commit("setJanus", {
	// 	janus: janus,
	// 	janusUse: true
	// })

}




		// loginStore
const getLanguage = computed(() => loginStore.lang)

// callStore
const getMultiCallingPopupResult = computed(() => callStore.multiCallingResult)
const getCancelCallingResult = computed(() => callStore.cancelCallResult)
const getCancelCallFlag = computed(() => callStore.cancelCallFlag)
const getIsVideoResult = computed(() => commonStore.isVideo)
const getFileSendFlag = computed(() => commonStore.fileSendFlag)
const getErrorCloseResult = computed(() => callStore.errorCloseResult)
const getMainVideoImage = computed(() => callStore.mainVideoImage)
const getCallingLayoutType = computed(() => commonStore.callingLayoutType)

const currentRoomNumberCount = computed(() => commonStore.roomNumberCount)
const recentData = computed(() => callStore.recentData)
const recentDataAll = computed(() => callStore.recentDataAll)
const userData = computed(() => callStore.userData)
const userDataAll = computed(() => callStore.userDataAll)
const isSounded = computed(() => commonStore.isSounded)
const callingType = computed(() => callStore.callingType)
const uniqueRoomid = computed(() => callStore.uniqueRoomid)
const globalVideoSend = computed(() => callStore.globalVideoSend)
const globalAudioSend = computed(() => callStore.globalAudioSend)
const accessDeviceCheck = computed(() => commonStore.accessDeviceCheck)
const accessDeviceOS = computed(() => commonStore.accessDeviceOS)
const autoCallAcceptTime = computed(() => callStore.autoCallAcceptTime)
const autoPictureAccept = computed(() => callStore.autoPictureAccept)
const autoDiscalling = computed(() => callStore.autoDiscalling)
const gpsClickInfo = computed(() => callStore.gpsClickInfo)
const gpsListEvent = computed(() => callStore.gpsListEvent)
const sendDurationEnable = computed(() => callStore.sendDurationEnable)
const previewModalInfo = computed(() => commonStore.previewModalInfo)
const receiveFileResFlag = computed(() => commonStore.receiveFileResFlag)
const getIsShareResult = computed(() => commonStore.isShare)
const getContectListinCalling = computed(() => callStore.contectListinCalling)
const getInCallingFunction = computed(() => callStore.inCallingFunction)
const getInviteCancelFlag = computed(() => callStore.inviteCancelFlag)
const getHostChangeRequest = computed(() => callStore.hostChangeRequest)
const getHostRequestResult = computed(() => callStore.hostRequestResult)
const getHostCancelFlag = computed(() => callStore.hostCancelFlag)
const getAllMicMuteStatus = computed(() => callStore.allMicMuteStatus)
const getMicOnOffClick = computed(() => callStore.micOnOffClick)
const getForceMicMuteBtnClick = computed(() => callStore.forceMicMuteBtnClick)
const getVideoMainIndex = computed(() => callStore.videoMainIndex)
const getIsDrawing = computed(() => commonStore.isDrawing)
const getForceLeaveBtnClick = computed(() => callStore.forceLeaveBtnClick)
const getForceLeaveClickResult = computed(() => callStore.forceLeaveClickResult)
const getFileModalFlag = computed(() => commonStore.fileModalFlag)
const getMeetingLeaveFlag = computed(() => meetingStore.meetingLeaveFlag)
const getCancelFileTransferFlag = computed(() => commonStore.cancelFileTransferFlag)
const getDrawingGetFileChangeFlag = computed(() => callStore.drawingGetFileChangeFlag)
const getDrawingGetPDFUploadFlag = computed(() => callStore.drawingGetPDFUploadFlag)
const getLaserPointerFlag = computed(() => callStore.laserPointerFlag)
const getCaptureSaveFlag = computed(() => callStore.captureSaveFlag)
const getHQCaptureFlag = computed(() => callStore.HQCaptureFlag)
const getMotionFallCloseBtnClick = computed(() => callStore.motionFallCloseBtnClick)
const getMotionFallClickIndex = computed(() => callStore.motionFallClickIndex)
const getMotionNoMoveClickIndex = computed(() => callStore.motionNoMoveClickIndex)
const getStreamModeFlag = computed(() => callStore.streamModeFlag)
const getAutoDiscallingCancel = computed(() => callStore.autoDiscallingCancel)
const getFlag = computed(() => callStore.flag)
const getUnderStatus = computed(() => callStore.underStatus)
const getOnlyVoiceIDFileSent = computed(() => callStore.onlyVoiceIDFileSent)
const getMediaDeviceModified = computed(() => commonStore.mediaDeviceModified)
const getCameraAllowedState = computed(() => callStore.cameraNotAllowed)

// chattingStore
const videoCallHost = computed(() => chattingStore.videoCallHost)
const personnelInRoom = computed(() => chattingStore.personnelInRoom)
const chattingShow = computed(() => chattingStore.chattingShow)
const getSendMessageFlag = computed(() => chattingStore.sendMessageFlag)
const changePersonnelInRoom = computed(() => chattingStore.personnelInRoom)
const calcPersonnelInRoom = computed(() => chattingStore.personnelInRoom)
const getChattingShow = computed(() => chattingStore.chattingShow)

// drawingStore
const saveThumbnailImg = computed(() => drawingStore.saveThumbnailImg)
const pdfUrlSaveArrays = computed(() => drawingStore.pdfUrlSaveArrays)

// directMessageStore
const curBeforeDataModal = computed(() => directMessageStore.previousMessageInfo)
const getSendDMFlag = computed(() => directMessageStore.sendDMFlag)
const getReadProcFlag = computed(() => directMessageStore.readProcFlag)
const getPreviousMessageFlag = computed(() => directMessageStore.previousMessageFlag)
</script>

