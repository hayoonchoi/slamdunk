$(function(){
// 사진버튼처리
$(".teamphotoBtn").click(function(){
	$(".teamfile").click();
});
$(".teamfile").fileupload({
	url : serverAddr+"/photo/add.json",
	dataType : "json",
	add : function(e,data){
		data.submit();
	},
	done : function(e,data){
		$(".teamoriginFileName").text(data.result.originFilename);
		$(".teamdataFileName").text(data.result.filename);
		$("article img").attr("src","/slamdunk/upload/"+data.result.filename);
	}
});

//팀등록 버튼(빈칸이라면 이렇게 처리.)
$(".resister_btn").click(function(){
	if(document.querySelector(".teamname").value===""){
		alert("팀명을 작성해 주세요.");
		return;
	}else if(document.querySelector("#memo_area").value===""){
		alert("팀소개를 작성해 주세요.");
		return;
	}
	//입력된값 저장해놓기.(서버에 보내기전에.)
	var team = {
		teamName : document.querySelector(".teamname").value,
		teamDesc : document.querySelector("#memo_area").value,
		tphoto_path:document.querySelector(".teamdataFileName").textContent
	}

	ajaxInserTeam(team);

});
$(".teamdefaultBtn").click(function(){
	$("article img").attr("src","/slamdunk/images/teamimg.jpg");
	$(".teamoriginFilename").text(""); //보여주는 사진이름 빈문자열로 만들기.
	$(".teamdataFileName").text("default Image");
});

//서버에 요청하기.
	function ajaxInserTeam(team){
		$.ajax({
			url : serverAddr+"/team/insert.json",
			method : "POST",
			dataType : "json",
			data : team,
			success : function(obj){
				var result = obj.jsonResult;
				//오류 또는 팀명이 중복될때
				if(result.state !== "success"){
					alert("이미 팀명이 존재 합니다.");
					return;
				}
				window.location.reload();
				//함수 호출 후

			}
		})

	}
	function ajaxteamLoginUser(){
		$.ajax({
			url : serverAddr+"/team/myteam.json",
			method : "GET",
			dataType : "json",
			success : function(obj){
				var result = obj.jsonResult;
				if(result.state !== "success"){
					alert("팀 조회를 실패했습니다.");
					return;
				}

				if(result.data === null){
					$(".update_btn").hide();
					$(".delete_btn").hide();
					$(".members1").hide();
					$(".members2").hide();
					ajaxTeamList();
				}else if(result.data.tAuth === true){
					if (result.data.tphoto_path !== null && result.data.tphoto_path !== "") {
	 				$("article img").attr("src","/slamdunk/upload/"+result.data.tphoto_path);
	 				$(".resister_btn").hide();
	 				}
					$(".teamname").css("display","none");
					$(".tname").text(result.data.teamName);
					$("#memo_area").text(result.data.teamDesc);
					$(".team_members1").hide();
					$(".team_members2").hide();
					$(".update_btn").show();
					ajaxTeammemberList(result.data.no);
				}else{
					if (result.data.tphoto_path !== null && result.data.tphoto_path !== "") {
	 				$("article img").attr("src","/slamdunk/upload/"+result.data.tphoto_path);
	 				$(".resister_btn").hide();
	 				}
					$(".teamname").css("display","none");
					$(".tname").text(result.data.teamName);
					$("#memo_area").hide();
					$(".tauth").text(result.data.teamDesc);
					$(".team_members1").hide();
					$(".team_members2").hide();
					$(".teamphotoBtn").hide();
					$(".teamdefaultBtn").hide();
					$(".update_btn").hide();
					ajaxTeammemberList(result.data.no);
				}
			}
		})
	}

	$(".update_btn").click(function(){
		var teaminfo = {
			tphoto_path : document.querySelector('.teamdataFileName').textContent,
			teamDesc : document.querySelector("#memo_area").value
		}
		ajaxTeamUpdate(teaminfo);
	});

	function ajaxTeamUpdate(team){
		$.ajax({
		url : serverAddr+"/team/update.json",
		method : "POST",
		dataType : "json",
		data : team,
		success : function(obj){
			var result = obj.jsonResult;
			if(result.state !== "success"){
				alert("수정이 실패했습니다");
				return;
			}
			window.location.reload();
		}
	})
	}
	
	var currpageno = 1;
	var totalpage = 0;
	
	function ajaxTeamList(){
		$.ajax({
			url : serverAddr+"/team/teamlist.json?pageNo="+currpageno,
			method:"GET",
			dataType:"json",
			success : function(obj){
				var result = obj.jsonResult;
				if(result.state !== "success"){
					alert("팀 리스트 조회 실패입니다.");
					return;
				}
			
				var str = "<h3>Team List</h3>";//문자 초기화
				
				for(var i=0;i<result.data.list.length;i++){
					str+="<div class='team_member'><span class='team_member_p'>Team Name </span><span class='TN'>"+result.data.list[i].teamName+"</span><br><span class='captain'>Captain </span><span class='CP'>"+result.data.list[i].captain+"</span><br><span class='people'>Numbers </span><span class='Nteam'>"+result.data.list[i].count+" / 15</span><p class='teams'>"+result.data.list[i].teamDesc+"</p><button type ='button' class='team_btn'  data-no='"+result.data.list[i].no+"'>Join</button></div>"
				}
				$(".team_members1").html(str);
				
				currpageno = result.data.pageNo;
				totalpage = result.data.totalPage;

				var numPageno = "";
				var numTemp = "";
				
				for(var i =1;i<=totalpage;i++){
					if(currpageno === i){
						numTemp = "<span class='curr_num'>"+i+"</span>"
					}else{
						numTemp = "<span>"+i+"</span>"
					}
					numPageno+=numTemp;
				}
				$(".num").html(numPageno);
				$(".team_btn").click(function(){
					//console.log($(this).attr("data-no")); //자신(버튼)안에 있는 속성(data-no)가져오기.
					ajaxJoinTeam($(this).attr("data-no"));
				});
				$(".pre_btn").click(function(){
					if(currpageno === 1){
						return;
					}
					currpageno--;
					ajaxTeamList();
				});

				$(".next_btn").click(function(){
					if(currpageno === totalpage){
						return;
					}
					currpageno++;
					ajaxTeamList();
				});

			}
		})
	}


	function ajaxTeammemberList(no){
		$.ajax({
			url : serverAddr+"/team/teammemberlist.json?no="+no+"&pageNo="+currpageno,
			method : "GET",
			dataType:"json",
			success : function(obj){
				var result = obj.jsonResult;
				if(result.state !== "success"){
					alert("팀원 조회를 실패했습니다.");
					return;
				}
			
				var str = "<h3>Member's Introduce</h3>";
				for(var i=0;i<result.data.list.length;i++){
					var gender = "Male";
					if(result.data.list[i].gender === false){
						gender = "Female";
					}
					var position = "-"
					if(result.data.list[i].position !== null){
						position = result.data.list[i].position;
					}
					var skill = "-";
					if(result.data.list[i].skill !== null){
						skill = result.data.list[i].skill;
					}
					var photo = "/slamdunk/images/shoot.jpg"
					if(result.data.list[i].photo_path !== null && result.data.list[i].photo_path !== ""){
						photo = "/slamdunk/upload/"+result.data.list[i].photo_path;
					}
					str += "<div class='member1'><img class='member_p' src=' "+photo+" ' ><div class='all'><p class='team_nick'>NickName : "+result.data.list[i].nickname+"</p><p class='member_info'>Gender : "+gender+"</p><p class='Tpo'>Position : "+position+"</p><p class='Thei'>Height : "+result.data.list[i].height+"</p></div></div>"
				}
				$(".members1").html(str);
				currpageno = result.data.pageNo;
				totalpage = result.data.totalPage;

				var numPageno = "";
				var numTemp = "";

				for(var i=1;i<=totalpage;i++){
					if(currpageno === i){
						numTemp="<span class='curr_num'>"+i+"</span>";
					}else{
						numTemp="<span>"+i+"</span>";
					}
					numPageno+=numTemp;
				}
				$(".num").html(numPageno);

				$(".pre_btn").click(function(){
					if(currpageno === 1){
						return;
					}
					currpageno--;
					ajaxTeammemberList(result.data.list[0].tno);
				});

				$(".next_btn").click(function(){
					if(currpageno === totalpage){
						return;
					}
					currpageno++;
					ajaxTeammemberList(result.data.list[0].tno);
				});
			}
		})
	}

	function ajaxJoinTeam(datano){
		$.ajax({
			url : serverAddr+"/jointeam/join.json",
			method : "POST",
			dataType : "json",
			data : {no : datano},
			success : function(obj){
				var result = obj.jsonResult;
				if(result.state !== "success" ){
					alert("신청 중 이거나 인원수가 초과되었습니다.");
					return;
			}
			alert("신청이 완료 되었습니다.");
		}
		})
	}
	$(".delete_btn").click(function(){
		ajaxDeleteTeam();
	});
	function ajaxDeleteTeam(){
		$.ajax({
			url : serverAddr+"/team/delete.json",
			dataType:"json",
			method:"GET",
			success : function(obj){
				var result = obj.jsonResult;
				if(result.state !== "success"){
					alert("팀 탈퇴처리가 실패입니다.");
					return;
				}
				window.location.reload();
			}
		})
	}


ajaxteamLoginUser();

});