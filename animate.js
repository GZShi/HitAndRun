function animate () {
	var gameId = "1";
	this.pauseFlag = false;
	var ballsArray;
	var forceArray;		// 力场数组
	var total;
	var forceTotal;
	var boundary = {left: 0, right: 1000, top:0, bottom: 500};
	var minWidth = 10000;
	var minHeight = 10000;
	var maxTotal = 0;
	var intervalId = -1;
	var ctx;
	var lastColor;
	var begin = -1;
	var clickTimes = -1;
	var gameOver = false;
	var outsideForce = {x:0, y:0};
	var precision = 10000;	// 一次检测碰撞次数最大值
	var autoMode = true;	// pro normal auto
	var lastFrameTime = 0;		// 用于计算帧数
	var thisFrameTime = 0;

	// 计算某个点pos相对于力场中心center的受力强度
	function forceField(center, pos, strength) {
		var dx = pos.x - center.x;
		var dy = pos.y - center.y;
		var d2 = dx*dx + dy*dy;
		var d  = Math.sqrt(d2);
		var rd3 = 1/(d2*d);
		// 距离过小忽略力的作用
		if(d2 < 0.001) {
			return {
				x: 0,
				y:0
			}
		}
		return {
			x: strength*dx*rd3,
			y: strength*dy*rd3
		}
	}

	function calculateScore (minWidth, minHeight, clickTimes, startTime, pauseTime, endTime, smallTotal) {
		var score = (minWidth*minHeight);
		score = score * score / 10000;
		score = score/(clickTimes*1000+(endTime-startTime-pauseTime)*smallTotal/100);
		score = Math.floor(score);
		return score;
	}

	function frame () {
		// 根据帧数自动调节检测精度
		thisFrameTime = Date.now();
		if (autoMode == true) {
			if (thisFrameTime - lastFrameTime < 100 || thisFrameTime - lastFrameTime > 100000) {
				precision = precision > 10000 ? precision : Math.floor(precision*1.1);
			} else {
				precision = Math.floor(precision*0.7);
			}
		}
		message("FPS: " + Math.floor(1000/(thisFrameTime- lastFrameTime)));
		lastFrameTime = thisFrameTime;
		
		forceTotal = forceArray.length;

		if (total <= 0) {
			ctx.fillStyle = lastColor;
			ctx.clearRect(0, 0, boundary.right, boundary.bottom);
			ctx.fillRect(0, 0, boundary.right, boundary.bottom);
			clearInterval(intervalId);
			intervalId = -1;
			if (gameOver == false)
				score = calculateScore(minWidth, minHeight, clickTimes, begin, 0, (new Date()).getTime(), maxTotal);
			displayScore(score);
			gameOver = true;
			return ;
		}
		
		ctx.clearRect(0, 0, boundary.right, boundary.bottom);
		// 绘制一帧
		for (var i = 0; i < total; ++i) {
			ballsArray[i].drawMyself(ctx);
		}
		for (var i = 0; i <forceTotal; ++i) {
			forceArray[i].drawMyself(ctx);
		}

		// 更新数据
		for (var i = 0; i < total; ++i) {
			if (total == 1 && ballsArray[0].type == "big") {
				if (false == ballsArray[0].expand()) {
					--total;
					ballsArray.shift();
					lastColor = ctx.fillStyle;
				}
				message('last');
				break;
			}
			if(false == ballsArray[i].update()) {
				ballsArray.splice(i, 1);
				--total;
			}
		}
		// 更新力场的生命时间
		for (var i = 0; i< forceTotal; ++i) {
			if (false == forceArray[i].update()) {
				forceArray.splice(i, 1);
				--forceTotal;
			}
		}

		// 力场作用
		for (var i = 0; i < forceTotal; ++i) {
			for (var j = 0; j < total; ++j) {
				if(ballsArray[j].type == "big")
					continue;
				ballsArray[j].checkForceEffect(forceArray[i]);
			}
		}

		// 重力场、风向模拟
		for (var i = 0; i < total; ++i) {
			if(ballsArray[i].type == "big")
				continue;
			ballsArray[i].gravityAndWind(outsideForce);
		}

		// 精确碰撞检测，牺牲性能
		if (total > 0) {
			var bstack = [];
			var tocheck = -1;
			var checkTimes = 0;
			for (var i = 0; i < total; ++i) {
				if(ballsArray[i].type == "small")
					bstack.push(i);
			}

			while(bstack.length > 0) {
				tocheck = bstack.pop();
				for (var i = 0; i < total; ++i) {
					if (i == tocheck)
						continue;
					if (ballsArray[tocheck].checkCollision(ballsArray[i]) && checkTimes < precision) {
						bstack.push(i);
						checkTimes++;
					}
				}
				if(true == ballsArray[tocheck].checkBoundary(boundary) && checkTimes < precision) {
					bstack.push(tocheck);
					checkTimes++;
				}
			}
			bstack = null;
			/*
			for (var i = 0; i < total; ++i) {
				if (ballsArray[i].type == "big")
					continue;
				for (var j = 0; j < total; ++j) {
					if (i == j)
						continue;
					if(ballsArray[i].checkCollision(ballsArray[j])) {
						i = 0; j = 0;
					}
				}
				// 检测是否与力场碰撞（即点出的大球）
				for (var k = 0; k < forceTotal; ++k) {
					ballsArray[i].checkCollision(forceArray[k]);
				}
				// 检测与墙壁碰撞
				ballsArray[i].checkBoundary(boundary);
			}*/
		}
	}

	this.play = function () {
		if (intervalId != -1) {
			return ;
		}
		this.pauseFlag = false;
		intervalId = setInterval(frame, 20);
		message("play");
	}

	this.pause = function () {
		this.pauseFlag = true;
		clearInterval(intervalId);
		intervalId = -1;
		message("stop");
	}

	this.init = function (context, balls, force, left, right, top, bottom, ax, ay, collMode) {
		gameId = Math.random();
		ctx = context;
		boundary.left = left;
		boundary.right = right;
		boundary.top = top;
		boundary.bottom = bottom;
		ballsArray = balls;
		forceArray = force;
		total = balls.length;
		forceTotal = force.length;
		outsideForce.x = (ax<-100?-100:(ax>100?100:ax))/100;
		outsideForce.y = (ay<-100?-100:(ay>100?100:ay))/100;
		if ((boundary.right - boundary.left) * (boundary.bottom - boundary.top) < minHeight*minWidth) {
			minHeight = boundary.bottom - boundary.top;
			minWidth = boundary.right - boundary.left;
		}
		if (ballsArray.length > maxTotal) {
			maxTotal = ballsArray.length;
		}
		autoMode = collMode == "auto" ? true : false;
		if(collMode == "normal")
			precision = 10000;
		else if(collMode == "pro")
			precision = 100000000;
	}

	this.setBegin = function (n) {
		begin = n;
	}

	this.setClickTimes = function (n) {
		clickTimes = n;
	}
}
