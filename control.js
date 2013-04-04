function message(msg) {
	$("p#message").text(msg);
}

function displayScore(score) {
	message("Your Score: " + score);
	$("div#infoBoard").animate({
		fontSize: '30px',
		left: Math.floor($(window).width*0.33-10) + 'px',
		top: Math.floor($(window).height()*0.33 - 20) + 'px'
	}, 300);
}

function onConfirm() {
	var m = 0;
	if($("#smallMode")[0].checked)
		m = "small";
	else if($("#newtonMode")[0].checked)
		m = "newton";
	else if($("#threeball")[0].checked)
		m = "3balls";
	else if($("#snooker")[0].checked)
		m = "snooker";
	var cm = "auto";
	if ($("#pro")[0].checked) 
		cm = "pro";
	else if($("#normal")[0].checked)
		cm = "normal";
	else if($("#auto")[0].checked)
		cm = "auto";
	return {
		mode: m,		// 游戏模式
		total: parseInt($("#amount")[0].value),	// 小球总数
		mass: parseFloat($("#mass")[0].value),		// 小球质量
		radius: parseInt($("#radius")[0].value),		// 小球半径
		ax: parseInt($("#directx")[0].value),
		ay: parseInt($("#directy")[0].value),
		rv: Math.max(Math.min(parseInt($("#rv")[0].value), 100), 0),
		collision: cm	// 碰撞检测精度
	}
}