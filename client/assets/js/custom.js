
// var main_video = document.getElementById("videoMain");
var main_video = null;

console.log("custom.js import");

const custom = {
	test1(){
		console.log("custom.test1 실행되었습니다.");
	},
	//클릭한 영상을 main 화면에 넣어주는 함수
	video_change(_this){
		console.log("----- cunstom.js : function video_change -----");
		
		// this.get
		
		// var remote_div1 = document.getElementById("videoremote1");
		// var remote_div2 = document.getElementById("videoremote2");
		// var remote_div3 = document.getElementById("videoremote3");
		// var remote_div4 = document.getElementById("videoremote4");
		
		// alert(remote_div2.childNodes);
		
		console.log("_this.srcObject = " + _this.srcObject);
		
		main_video = document.getElementById("videoMain");
		
		main_video.srcObject = _this.srcObject;
	},
	// 통화 종료 버튼 클릭 시 
	btn_hangup() {
	
		janus.destroy();
	},
	// 일정 시간 간격으로 main video.srcObject 의 값이 있는지 체크. 
	main_stream_check() {
		// console.log("----- cunstom.js : function main_stream_check2 -----");
		
		main_video = document.getElementById("videoMain");	
		
		if (!main_video) {
			console.log("^^^^^^^^^^^^^^^^^^^^")
			return
		}

		// main 화면이 없는 상태라면 접속해있는 remote가 있는지 체크하여 있다면 넣어주고, 없다면 pass.
		if(main_video.srcObject == null){
			// console.log("----- main 화면에 아무것도 재생되고 있지 않다. (흰 화면)");
			
			custom.insert_main_video(main_video);
			
		} else {
			// console.log("----- main 화면에 무언가 재생되고 있거나, 재생되었었다.");
			
			if(main_video.srcObject.active == false){
				// console.log("----- main 화면의 remote가 나갔다. (검정 화면)");
				
				custom.insert_main_video(main_video);
			} else {
				// console.log("----- main 화면에 무언가 재생되고 있다.");
			}
			
		} 
		
	},
	// main_video에 mediaStream을 넣어주는 과정
	insert_main_video(main_video){
		// console.log("----- insert_main_video(main_video) -----");
		var i = 0;

		// 총 6명 통화이고, remotevideo는 5명이기 때문에 5회 반복
		for(i = 1; i < 6; i++){
			var remote_temp = document.getElementById("remotevideo" + i);
			
			// remotevideo N을 반복하며 해당 엘리먼트가 있다면 해당 video를 넣어준다.
			if(remote_temp != null){
				console.log("remotevideo" + i + "의 영상이 main으로 들어온다.");
				main_video.srcObject = remote_temp.srcObject;
				
				// remote의 이름 받아오고 Main에 넣어주기
				var remoteCaption = $("#remoteCaption" + i).text();
				console.log("remoteCaption = " + remoteCaption);

				$("#videoMainCaption").html(remoteCaption);
				break;
			}
			
			if(i == 5){
				if($('#myvideo').length === 0) {
					console.log("----- main 화면에 넣어줄 remote 가 아무도 없다.");
					$("#videoMainCaption").html("")
				} else{
					main_video.srcObject = $('#myvideo')[0].srcObject;					
					$("#videoMainCaption").html("내 화면");
				}
			}
		}		
	}

}


// //클릭한 영상을 main 화면에 넣어주는 함수
// function video_change(_this){
// 	console.log("----- cunstom.js : function video_change -----");
	
// 	// this.get
	
// 	// var remote_div1 = document.getElementById("videoremote1");
// 	// var remote_div2 = document.getElementById("videoremote2");
// 	// var remote_div3 = document.getElementById("videoremote3");
// 	// var remote_div4 = document.getElementById("videoremote4");
	
// 	// alert(remote_div2.childNodes);
	
// 	console.log("_this.srcObject = " + _this.srcObject);
	
// 	main_video = document.getElementById("videoMain");
	
// 	main_video.srcObject = _this.srcObject;
	
	

// };

// // 통화 종료 버튼 클릭 시 
// function btn_hangup() {
	
// 	janus.destroy();
// }

// // 일정 시간 간격으로 main video.srcObject 의 값이 있는지 체크. 
// function main_stream_check() {
// 	// console.log("----- cunstom.js : function main_stream_check2 -----");
	
// 	main_video = document.getElementById("videoMain");	

// 	// main 화면이 없는 상태라면 접속해있는 remote가 있는지 체크하여 있다면 넣어주고, 없다면 pass.
// 	if(main_video.srcObject == null){
// 		// console.log("----- main 화면에 아무것도 재생되고 있지 않다. (흰 화면)");
		
// 		insert_main_video(main_video);
		
// 	} else {
// 		// console.log("----- main 화면에 무언가 재생되고 있거나, 재생되었었다.");
		
// 		if(main_video.srcObject.active == false){
// 			// console.log("----- main 화면의 remote가 나갔다. (검정 화면)");
			
// 			insert_main_video(main_video);
// 		} else {
// 			// console.log("----- main 화면에 무언가 재생되고 있다.");
// 		}
		
// 	} 
	
// }

// // main_video에 mediaStream을 넣어주는 과정
// function insert_main_video(main_video){
// 	// console.log("----- insert_main_video(main_video) -----");
	
// 	// 총 6명 통화이고, remotevideo는 5명이기 때문에 5회 반복
// 	for(i = 1; i < 6; i++){
// 		var remote_temp = document.getElementById("remotevideo" + i);
		
// 		// remotevideo N을 반복하며 해당 엘리먼트가 있다면 해당 video를 넣어준다.
// 		if(remote_temp != null){
// 			console.log("remotevideo" + i + "의 영상이 main으로 들어온다.");
			
// 			main_video.srcObject = remote_temp.srcObject;
// 			break;
// 		}
		
// 		if(i == 5){
// 			// console.log("----- main 화면에 넣어줄 remote 가 아무도 없다.");
// 		}
// 	}		
// }


// // $("#btn_hangup").mouseover(function(){$(this).css("color", "red");}


// // $('#panel-inner2').on('click', function() {
// // 	alert(this)
// // });

// // $('#panel-inner3').on('click', function() {
// // 	alert(this)
// // });

// // $('.panel').on('click', function() {
// // 	alert(this)
// // });

// // $('#remotevideo2').on('click', function() {
// // 	alert(this)
// // });

// // $('#remotevideo3').on('click', function() {
// // 	alert(this)
// // });

// // $('#videoremote2').on('click', function() {
// // 	alert(this)
// // });

// // $('#videoremote3').on('click', function() {
// // 	alert(this)
// // });


export default custom