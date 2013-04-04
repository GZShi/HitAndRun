function createSmallBalls(total, mass, radius, right, bottom, rv) {
	var balls = [];
	if (total <= 0) {
		total = Math.random()*300 + 1;
	}
	for (var i = 0; i < total; ++i) {
		var b = new ball();
		b.init("small",								// 类型
			right*Math.random(),					// x坐标
			bottom*Math.random(),					// y坐标
			radius <= 0 ? Math.random()*30+5 : radius,		// 半径
			3,										// 速度
			Math.random()*2*Math.PI, 				// 弧度方向
			rgba(Math.floor(30+190*Math.random()),	// 红色
				Math.floor(90+130*Math.random()),	// 蓝色
				Math.floor(100+120*Math.random()),	// 绿色
				0.3+Math.random()* 0.6),			// 透明度
			rv, mass);
		balls.push(b);	
	}
	return balls;
}

// 用于受力测试
function create3balls(height) {
	var balls = [];
	var i = 0;
	for (i = 0; i < 13; ++i) {
		var b = new ball();
		b.init("small", 50+100*i, height-50, 50, 0, 0, rgba(123, 33, 99, 0.5), 3);
		balls.push(b);
	}
	var e = new ball();
	e.init("small", 300, height-50*(1+Math.sqrt(3)), 50, 0, 0, "black", 3);
	balls.push(e);
	return balls;
}

function NewtonBalls(right) {
	var balls = [];
	var i = 0;
	for (var i = 0; i < 100; ++i) {
		var b = new ball();
		b.init("small", 100*(i+1), 200, 50, 0, 0, rgba(123, 33, 99, 0.5), 0);
		balls.push(b);
		if (i*100 + 100 > right-350) 
			break;
	}
	var e = new ball();
	e.init("small", 100*(i+2), 200, 50, 3, 0, 0, 0);
	balls.push(e);
	return balls;
}

function snooker() {
	var balls = [];
	for (var i = 5; i > 0; --i) {
		var x = 600 + 50*Math.sqrt(3)*i;
		for (var j = 0; j < i; ++j) {
			var b = new ball();
			b.init("small", x, 400+j*100-i*50, 50, 0, 0, rgba(123, 33, 99, 0.5), 0);
			balls.push(b);
		}
	}
	var e = new ball();
	e.init("small", 100, 350, 50, 15, 0, rgba(123, 33, 99, 0.5), 0);
	balls.push(e);
	return balls;
}

function createPositiveBall(x, y) {
	var big = new ball();
	big.init("big", x, y, 5, 0, 0, 
				rgba(Math.floor(30+190*Math.random()),	// 红色
				Math.floor(90+130*Math.random()),	// 蓝色
				Math.floor(100+120*Math.random()),	// 绿色
				0.3),
				0, 10, 400);
	return big;
}

function createNegativeBall(x, y) {
	var big = new ball();
	big.init("big", x, y, 3, 0, 0, rgba(Math.floor(30+190*Math.random()),	// 红色
				Math.floor(90+130*Math.random()),	// 蓝色
				Math.floor(100+120*Math.random()),	// 绿色
				0.3), 0, -10, 400);
	return big;
}

function newCanvas(width, height, id) {
	return "<canvas width='" + width + "px' height='" + height + "px' id='" + id + "'></canvas>";
}

function rgba(r, g, b, a) {
	return "rgba("+r+","+g+","+b+","+a+")";
}

$(document).ready(function () {
	var game = new animate();
	var balls = [];
	var force = [];
	var total = 0;
	var mass = 0;
	var radius = 0;
	var mode = "small";
	var collCheckMode = "auto";
	var width = $(window).width();
	var height = $(window).height();
	var ax = 0; 	// 横向加速度
	var ay = 0;		// 纵向加速度
	var rv = 0;		// 碰撞动量损失系数
	var clickTimes = 0;

	$("canvas#zone").replaceWith(newCanvas(width, height, 'zone'));
	restart();

	// 画布点击事件
	var listenClick = function (event) {
		if (game.pauseFlag == true || event.which == 3)
			return ;
		if (clickTimes++ == 0) {
			game.setBegin((new Date()).getTime());
		}
		game.setClickTimes(clickTimes);
		message('x:' + event.pageX + ', y:' + event.pageY);

		if (event.which == 2) {
			force.push(createNegativeBall(event.pageX, event.pageY));
			clickTimes+=2;
		}
		else if(event.which == 1)
			force.push(createPositiveBall(event.pageX, event.pageY));
		game.play();
	}
	//注册点击事件
	$("canvas#zone").mousedown(listenClick);

	// restart
	function restart () {
		adjust();
		game.pause();
		game = null;
		game = new animate();
		balls = null;
		balls = [];
		force = null;
		force = [];
		switch (mode) {
			case "small": 	balls = createSmallBalls(total, mass, radius, width, height, rv); break;
			case "newton": 	balls = NewtonBalls(width);	break;
			case "3balls": 	balls = create3balls(height); break;
			case "snooker": balls = snooker(); break;
			default: alert("wrong");
		}
		clickTimes = 0;
		$("div#infoBoard").animate({
			fontSize: '12px',
			top: '3px',
			left: '100px'
		}, 300);
		game.init($("canvas#zone")[0].getContext('2d'), balls, force, 0, width, 0, height, ax, ay, collCheckMode);
		game.play();
	}

	// 适应窗口大小
	function adjust() {
		width = $(window).width();
		height = $(window).height();
		message('width:' + width + ', height:' + height);
		$("canvas#zone").replaceWith(newCanvas(width, height, 'zone'));
		game.init($("canvas#zone")[0].getContext('2d'), balls, force, 0, width, 0, height, ax, ay, collCheckMode);
		// 重新注册点击事件
		$("canvas#zone").mousedown(listenClick);
	}

	// 调整窗口时
	$(window).resize(function () {
		var shouldPlay = false;
		if(game.pauseFlag == false) {
			game.pause();
			shouldPlay = true;
		}
		adjust();
		if(shouldPlay)
			game.play();
	});

	$("button#configButton").click(function () {
		$("button#configButton")[0].display = "none";
		if(game.pauseFlag == false)
			 game.pause();
		$("div#config").animate({
			width: '400px',
			height: '500px',
			left: Math.max(Math.floor(($(window).width() - 400)/2), 0) + 'px',
			top: Math.max(Math.floor(($(window).height() - 500)/2), 0) + 'px'
		}, 600);
		$("div#config")[0].style.webkitAnimation = "flip 0.6s";
		$("div.configItem").css("display", "");
	});

	// 确定重新开始
	$("button#confirm").click(function() {
		$("button#configButton")[0].display = "";
		var tmp = onConfirm();
		mode = tmp.mode;
		radius = tmp.radius;
		mass = tmp.mass;
		ax = tmp.ax;
		ay = tmp.ay;
		rv = tmp.rv;
		total = tmp.total;
		collCheckMode = tmp.cm;
		$("div.configItem").css("display", "none");
		$("div#config").animate({
			width: '0px',
			height: '0px',
			left: '0px',
			top: '0px'
		}, 400);
		restart();
		var i = 0;
	});

	$("button#cancel").click(function () {
		$("button#configButton")[0].display = "";
		game.play();
		$("div.configItem").css("display", "none");
		$("div#config").animate({
			width: '0px',
			height: '0px',
			left: '0px',
			top: '0px'
		}, 400);
	})
});

