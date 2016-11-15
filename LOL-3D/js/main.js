//获取元素
var oList = document.getElementById('list');
var picBody = document.getElementById('pic_body');
var aLi = oList.getElementsByTagName('li');
var next = document.getElementById('next');
var prev = document.getElementById('prev');
//初始化页面
var arrImg = [];
var imgLen = 25;


for(var i = 0;i<imgLen;i++){
	arrImg.push('img/'+i+'.jpg');
}
//2d找图全局变量
window.view = null;

init();
function init(){
	var W = document.documentElement.clientWidth;
	var H = document.documentElement.clientHeight;
	document.body.style.width = W +'px';
	document.body.style.height = H +'px'; 
	
	
	for(var i = 0;i<imgLen;i++){
			createEles(i);
	}

}

function createEles(n){
		//控制是否在屏幕变化时候执行positionRandom;
		window.cancelRandom = false;			
		if(window.mod3D){				//3d创建
			
			var oLi = document.createElement('li');
			var div1 = document.createElement('div');
			var div2 = document.createElement('div');
			var div3 = document.createElement('div');
			var div4 = document.createElement('div');
			var div5 = document.createElement('div');
			var div6 = document.createElement('div');
			oLi.onmouseover = function(){
				toOver3D(this)
			};
			oLi.onmouseout =function(){
				toOut3D(this);
			}
			div1.style.backgroundImage=div2.style.backgroundImage=div3.style.backgroundImage=div4.style.backgroundImage=div5.style.backgroundImage=div6.style.backgroundImage = 'url('+arrImg[n]+')';
			div1.index=div2.index=div3.index=div4.index=div5.index=div6.index = 'url('+arrImg[n]+')';
			oLi.index = n;
			div1.style.backgroundSize =  "100% 100%";
			oLi.appendChild(div1);
			oLi.appendChild(div2);
			oLi.appendChild(div3);
			oLi.appendChild(div4);
			oLi.appendChild(div5);
			oLi.appendChild(div6);
				
		}else{							//2d创建
			
			var oLi = document.createElement('li');
			var span = document.createElement('span');
			var a = document.createElement('a');
			var img = document.createElement('img');
			var strong = document.createElement('strong');
			oLi.index = n;
			a.href = "javascript:";
			img.src = arrImg[n]
			span.appendChild(a);
			span.appendChild(img);
			span.appendChild(strong);
			oLi.appendChild(span);
			oLi.onmouseover = function(){
				this.style.zIndex = '20';
				this.style.webkitTransform = 'rotate('+0+'deg) scale(1.2)';
			}
			oLi.onmouseout = function(){
				this.style.zIndex = '';
				var rotate = Math.floor(Math.random()*30)*Math.pow(-1,Math.floor(Math.random()*1000));
				this.style.webkitTransform = 'rotate('+rotate+'deg)';
			}
		}
	
		var yImg = new Image();
		yImg.src = arrImg[n] ;
		yImg.onload = function(){
			
			oList.appendChild(oLi);
			drag(oLi);
			
			if(n == imgLen-1){			//生成最后一个li;
				setTimeout(function(){
					for(var i = 0;i<aLi.length;i++){
						aLi[i].ondblclick = function(){
							if(window.cancelRandom){
								toSplit();
								oRange.style.display = '';
							}else{
								window.view = this.index;
								toJoin();
								this.style.zIndex = '';
								oRange.style.display = 'none';
							}
						}
					}
				positionRandom();
				},80);
				
			}
			
			
		}
		
	
}


function positionRandom(){
	
	var maxL = oList.offsetWidth - aLi[0].offsetWidth;
	var maxT = oList.offsetHeight - aLi[0].offsetHeight;
	if(window.mod3D){						//3d随机
		for(var i = 0;i<aLi.length;i++){
			var L = Math.floor(maxL*Math.random());		
			var T = Math.floor(maxT*Math.random());
			var rotate1 =Math.floor(Math.random()*36)*Math.pow(-1,Math.round(Math.random()*1000));
			var rotate2 =Math.floor(Math.random()*36)*Math.pow(-1,Math.round(Math.random()*1000));
			var rotate3 =Math.floor(Math.random()*36)*Math.pow(-1,Math.round(Math.random()*1000));
			myMove(aLi[i],{'left':L,'top':T });
			aLi[i].style.webkitTransform = 'rotateX('+rotate1+'deg)'+'rotateY('+rotate2+'deg)'+'rotateZ('+rotate3+'deg)';
		}
		
	}else{		
		for(var i = 0;i<aLi.length;i++){
			var L = Math.floor( Math.random()*maxL);
			var T = Math.floor(Math.random()*maxT);
			var rotate = Math.floor(Math.random()*36)*Math.pow(-1,Math.floor(Math.random()*1000));
			myMove(aLi[i],{left:L,top:T});
			aLi[i].style.webkitTransform = 'rotate('+rotate+'deg)';
		}
	}
	oList.onclick = null;
}


function drag(obj){
	
	var disX = 0;
	var disY = 0;
	
	var prevX = 0;
	var prevY = 0;
	var iSpeedX = 0;
	var iSpeedY = 0;
	
	obj.onmousedown = function(e){
		var e = e || window.event;
		disX = e.clientX - obj.offsetLeft;
		disY = e.clientY - obj.offsetTop;
		
		prevX = e.clientX;
		prevY = e.clientY;
		
		document.onmousemove = function(e){
			var e = e || window.event;
			obj.style.left = e.clientX - disX +'px';
			obj.style.top = e.clientY - disY +'px';
			
			iSpeedX = e.clientX - prevX;
			iSpeedY = e.clientY - prevY;
			
			prevX = e.clientX;
			prevY = e.clientY;
		}
		document.onmouseup = function(){
			document.onmousemove = document.onmouseup = null;
			objMove();
		}
		return false;
	}
	

	
	function objMove(){
		clearInterval(obj.dragTimer);
		clearInterval(obj.timer)
		obj.dragTimer = setInterval(function(){
			
			var L = obj.offsetLeft + iSpeedX;
			var T = obj.offsetTop + iSpeedY;
			var maxL = oList.offsetWidth - obj.offsetWidth;
			var maxT = oList.offsetHeight - obj.offsetHeight
			iSpeedX *= 0.97;
			iSpeedY *= 0.97;
			if(L > maxL ){
				L = maxL ;
				iSpeedX *= -1;
				iSpeedX *= 0.75;
				iSpeedY *= 0.85;
			}else if(L<0){
				L = 0
				iSpeedX *= -1;
				iSpeedX *= 0.75;
				iSpeedY *= 0.90;
			}
			
			if(T>maxT){
				T = maxT;
				iSpeedY *= -1;
				iSpeedY *= 0.75
				iSpeedX *= 0.90;
			}else if(T<0){
				T = 0;
				iSpeedY *= -1;
				iSpeedY *= 0.75;
				iSpeedX *= 0.90;
			}
			
			if(Math.abs(iSpeedX)<1&&Math.abs(iSpeedY)<1){
				clearInterval(obj.dragTimer);
			}
			obj.style.left =  L +'px';
			obj.style.top = T +'px';
		},20);
	}
}


window.onresize = function(){
	var W = document.documentElement.clientWidth;
	var H = document.documentElement.clientHeight;
	document.body.style.width = W +'px';
	document.body.style.height = H +'px'; 
	if(window.cancelRandom || oRange.onOff == true){			//oRange.onOff == true表示，平铺状态；
		var aLiWidth = aLi[0].offsetWidth;
		var aLiHeight = aLi[0].offsetHeight;
		var moveL = (oList.offsetWidth - aLiWidth*5)/2;
		var moveT = (oList.offsetHeight - aLiHeight*5)/2;
		for(var i = 0;i<aLi.length;i++){
			myMove(aLi[i],{'left':moveL+i%5*aLiWidth,'top':moveT+Math.floor(i/5)*aLiHeight});
		}
	}else{
		positionRandom();
	}
	
}
function clearBugTab(obj,aLiWidth,aLiHeight,i){				//除bug，加载src;
	var yImg =  new Image();
	yImg.src = 'img/'+window.view+'.jpg';
	yImg.onload = function(){
		for(var j = 0;j<aLi[0].children.length;j++){
			obj.children[j].style.backgroundImage = 'url('+yImg.src+')';
			obj.children[0].style.backgroundPosition = -i%5*aLiWidth +'px '+ -Math.floor(i/5)*aLiHeight+'px';
		}
		
	
	}
	
}
//小图拼接大图
function toJoin(){
	window.cancelRandom = true;
	var aLiWidth = aLi[0].offsetWidth;
	var aLiHeight = aLi[0].offsetHeight;
	var moveL = (oList.offsetWidth - aLiWidth*5)/2;
	var moveT = (oList.offsetHeight - aLiHeight*5)/2;
	if(window.mod3D){
		css3d();
		aLi[aLi.length-1].addEventListener('webkitTransitionEnd',end3d,false);
		for(var i=0; i<aLi.length; i++){
			clearInterval(aLi[i].dragTimer);
			clearInterval(aLi[i].timer);
			aLi[i].onmouseover = aLi[i].onmousedown= aLi[i].onmouseout = null;
			var valRotate = Math.floor(Math.random()*360)*Math.pow(-1,Math.round(Math.random()*1000));
			var valRotate1 = Math.floor(Math.random()*360)*Math.pow(-1,Math.round(Math.random()*1000));
			var valRotate2 = Math.floor(Math.random()*360)*Math.pow(-1,Math.round(Math.random()*1000));
			aLi[i].style.transform = 'rotateX('+valRotate+'deg)' + 'rotateY('+valRotate1+'deg)' +'rotateZ('+valRotate2+'deg)';
			aLi[i].children[0].style.backgroundSize = '';
			clearBugTab(aLi[i],aLiWidth,aLiHeight,i);
			
		}
		next3d.style.display=prev3d.style.display = 'block';
		
		function end3d(){
			aLi[aLi.length-1].removeEventListener('webkitTransitionEnd',end3d,false);
			for(var i=0; i<aLi.length; i++){
				aLi[i].style.transform = 'rotateY(0deg)'+ 'rotateX(0deg)';
				myMove(aLi[i],{left:(i % 5) * 160+moveL ,top: Math.floor(i / 5)*100 + moveT});
				

			}
		}
	}else{
		
		var aA = oList.getElementsByTagName('a');
		aA[aA.length-1].addEventListener('webkitTransitionEnd',end,false);
		for(var i = 0;i<aA.length;i++){
			clearInterval(aLi[i].dragTimer);
			clearInterval(aLi[i].timer);
			aA[i].style.backgroundImage = 'url(img/'+ window.view +'.jpg)';
			aA[i].style.backgroundPosition = (-i%5*aLiWidth)+'px '+(-Math.floor(i/5)*aLiHeight)+'px';
			aA[i].style.opacity = '1';
			aLi[i].style.transform = 'rotate(0)';
			aLi[i].onmouseover = null;
			aLi[i].onmouseout = null;
			aLi[i].onmousedown= null;
		}
		function end(){
			this.removeEventListener('webkitTransitionEnd',end,false);
			for(var i = 0;i<aLi.length;i++){
				myMove(aLi[i],{'left':moveL+i%5*aLiWidth,'top':moveT+Math.floor(i/5)*aLiHeight});
			}
			next.style.display = prev.style.display = 'block';
			
		}
	}
		
}
//大图散成小图
function toSplit(){
	oList.onclick = null;
	window.cancelRandom = false;
	if(window.mod3D){							//3d拆散
		for(var i=0; i<aLi.length; i++){				
			clearInterval(aLi[i].timer1);
			for(var j = 0;j<aLi[i].children.length;j++){			//给所有面都加上当前图片
				aLi[i].children[j].style.backgroundImage = 'url('+arrImg[i]+')';
			}	
			aLi[i].style.transform = 'scale(1)';					//取消各种旋转，大小归原始大小
			aLi[i].onmouseover = function(){
				toOver3D(this);
			} 
			aLi[i].onmouseout = function(){
				toOut3D(this);
			} 
			aLi[i].children[0].style.backgroundSize = '100% 100%';		//主图
			aLi[i].children[0].style.backgroundPosition = '';			//取消定位
			drag(aLi[i]);
		};
		prev3d.style.display = '';
		next3d.style.display = ''
		
	}else{									//2d拆散
		
			var aA = oList.getElementsByTagName('a');
			var aStrong = oList.getElementsByTagName('strong');
			for(var i = 0;i<aA.length;i++){
			aA[i].style.opacity = '';
			aStrong[i].style.opacity = 0;
			drag(aLi[i]);
			aLi[i].onmouseover = function(){
				this.style.webkitTransform = 'rotate('+0+'deg) scale(1.2)';
				this.style.zIndex = '20';
			}
			aLi[i].onmouseout = function(){
				var rotate = Math.floor(Math.random()*30)*Math.pow(-1,Math.floor(Math.random()*1000));
				this.style.webkitTransform = 'rotate('+rotate+'deg)';
				this.style.zIndex = '';
			}
		}
		next.style.display = prev.style.display = '';
	}
	positionRandom();
}
//2d下左右切换
picTab();
function picTab(){
	
		next.onclick = function(){
			next.addEventListener('webkitTransitionEnd',btnChange,false);	
			this.style.opacity = '0.2';
			this.style.webkitTransform = 'scale(1.3)';
			if(!oList.off){
				picTab2D(1);
			}
		}
		prev.onclick = function(){
			prev.addEventListener('webkitTransitionEnd',btnChange,false);
			this.style.opacity = '0.2';
			this.style.webkitTransform = 'scale(1.3)';
			if(!oList.off){
				picTab2D(-1);
			}
			
		}
		prev.onmousedown = next.onmousedown = function(ev){
			var ev = ev || window.event;
			ev.preventDefault();
		}
		function btnChange(){
			this.removeEventListener('webkitTransitionEnd',btnChange,false);
			this.style.opacity = '1';
			this.style.webkitTransform = 'scale(1)';
		}
}
	


function picTab2D(num){
	oList.off = true;
	var aA = oList.getElementsByTagName('a');
	var aStrong = oList.getElementsByTagName('strong');
	var aLiWidth = aLi[0].offsetWidth;
	var aLiHeight = aLi[0].offsetHeight;
	
	for(var i =0;i<aStrong.length;i++){			//strong记录当前
		aStrong[i].style.opacity = 1;
		aStrong[i].style.backgroundImage = 'url(img/'+ window.view +'.jpg)';
		aStrong[i].style.backgroundPosition = (-i%5*aLiWidth)+'px '+(-Math.floor(i/5)*aLiHeight)+'px';
	}
	window.view += num;
	if(window.view == arrImg.length){
		window.view = 0;
	}else if(window.view == -1){
		window.view = arrImg.length - 1;
	}
	
	
	for(var i =0;i<aA.length;i++){			//a标签变下一张
		aA[i].style.backgroundImage = 'url(img/'+window.view+'.jpg)';
		aA[i].style.backgroundPosition = (-i%5*aLiWidth)+'px '+(-Math.floor(i/5)*aLiHeight)+'px';
	}
	
	//随机选择切换模式
	if(Math.random()>0.7){
		var randomArr = getChildArr();			//两层随机数组
		for(var i = 0;i<randomArr.length;i++){
			(function(n){
				var delay = n*100;
				setTimeout(function(){
					for(var i = 0;i<randomArr[n].length;i++){
						moveFn(aStrong[randomArr[n][i]],{'left':aLiWidth*num},250,'easeOut');
					}
				},delay);
			})(i);
		}
		//还原strong，允许再次点击
		setTimeout(function(){
			for(var i =0;i<aStrong.length;i++){
				aStrong[i].style.backgroundImage = 'url(img/'+ window.view +'.jpg)';
				aStrong[i].style.left = 0;
			}
			oList.off = false;
		},700);
		
		
	}else if(Math.random()>0.3){
		
		for(var i =0;i<aStrong.length;i++){
			moveFn(aStrong[i],{'left':aLiWidth*num},250,'easeOut');
		}
		//还原strong，允许再次点击
		setTimeout(function(){
			for(var i =0;i<aStrong.length;i++){
				aStrong[i].style.backgroundImage = 'url(img/'+ window.view +'.jpg)';
				aStrong[i].style.left = 0;
			}
			oList.off = false;
		},300);
		
	}else{
		for(var i = 0;i<5;i++){
			(function(n){
				var delay = n*100;
				setTimeout(function(){
					for(var i = n*5;i<n*5+5;i++){
						moveFn(aStrong[i],{'left':aLiWidth*num},250,'easeOut');
					}
				},delay);
			})(i);
		}
		//还原strong，允许再次点击
		setTimeout(function(){
			for(var i =0;i<aStrong.length;i++){
				aStrong[i].style.backgroundImage = 'url(img/'+ window.view +'.jpg)';
				aStrong[i].style.left = 0;
			}
			oList.off = false;
		},700);
	}

}

function getChildArr(){
	var allArr = [];
	var newArr = [];
	for(var i = 0;i<imgLen;i++){
		allArr.push(i);
	}
	for(var j = 0;j<5;j++){
		var oldArr = []
		for(var i = 0;i<5;i++){
			var val = Math.floor( Math.random()*allArr.length );
			oldArr.push(allArr.splice(val,1));
		}
		newArr.push(oldArr);
	}
	return newArr;
	
}


lightMove();									//标题灯光
function lightMove(){
	var oLight = document.getElementById('light')
	var num = -60;
	setInterval(function(){
		num+=5;
		oLight.style.backgroundPosition = num+'px 0';
		
		if(num == 350){
			num = -60;
		}
	},40);
}



//平铺效果
var oRange = document.getElementById('range');
oRange.onclick = function(){
	if(this.onOff){
		positionRandom();
		oRange.innerHTML = '平铺排列';
	}else{
		var aLiWidth = aLi[0].offsetWidth + 40;
		var aLiHeight = aLi[0].offsetHeight;
		var moveL = (oList.offsetWidth - aLiWidth*5)/2;
		var moveT = (oList.offsetHeight - aLiHeight*5)/2;
		for(var i = 0;i<aLi.length;i++){
			myMove(aLi[i],{'left':moveL+i%5*aLiWidth,'top':moveT+Math.floor(i/5)*aLiHeight});
		}
		oRange.innerHTML = '随机排列';
	}
	this.onOff = !this.onOff;
}

//--------------------------3d----------------------------------
var module3d = document.getElementById('module3d');
var linkCSS = document.getElementById('lickCSS');

//是否是3d模式--false表示2d，true表示3d;
window.mod3D = false;

module3d.onclick = function(){
		
	if(window.mod3D){				//2d参数
		window.mod3D = false;
		linkCSS.href = "css/main.css" ;
		for(var i = 0;i<aLi.length;i++){
			clearInterval(aLi[i].timer);
			clearInterval(aLi[i].dragTimer)
		}
		oList.innerHTML = '';
		next3d.style.display = prev3d.style.display = '';
		this.innerHTML = 'view3D';
		init();
		box3D.onclick = box3Dgpl;
		oList.onclick = null;
		box3D.style.display = 'none';
	}else{							//3d参数
		window.mod3D = true;
		linkCSS.href = "css/module3d.css";
		for(var i = 0;i<aLi.length;i++){
			clearInterval(aLi[i].timer);
			clearInterval(aLi[i].dragTimer)
		}
		next.style.display = prev.style.display = '';
		oList.innerHTML = '';
		this.innerHTML = 'view2D';
		init();
	}
	oRange.onOff = false;
   	oRange.innerHTML = '平铺排列';
   	oRange.style.display = '';
}

function toOver3D(obj){
	var rotate =Math.floor(Math.random()*40)*Math.pow(-1,Math.round(Math.random()*1000));
	obj.style.webkitTransform = 'rotate('+rotate+'deg) scale(1.2)';
	obj.style.zIndex = 999;
}

function toOut3D(obj){
	var rotate1 =Math.floor(Math.random()*36)*Math.pow(-1,Math.round(Math.random()*1000));
	var rotate2 =Math.floor(Math.random()*36)*Math.pow(-1,Math.round(Math.random()*1000));
	var rotate3 =Math.floor(Math.random()*36)*Math.pow(-1,Math.round(Math.random()*1000));
	var translate =Math.floor(Math.random()*50)*Math.pow(-1,Math.round(Math.random()*1000));
	obj.style.webkitTransform = 'rotateX('+rotate1+'deg)'+'rotateY('+rotate2+'deg)'+'rotateZ('+rotate3+'deg)'+'translateZ('+translate+'px)';
	obj.style.zIndex = '';
}
//-------------------------3d切换----------------
tab3d();
function tab3d(){
	next3d.onclick = function(){
		window.view +=1;
		if(window.view == imgLen){
			window.view = 0;
		}
//		toBtn(this);
		box3D.onclick = box3Dgpl;
		
		positionRandom();
		clearTimeout(this.tabTimer);
		this.tabTimer = setTimeout(function(){
			aLi[aLi.length-1].addEventListener('webkitTransitionEnd',end,false);
			function end(){
				this.removeEventListener('webkitTransitionEnd',end,false);
				
				toJoin();
			}
		},400);
	
	}
	next3d.onmousedown = prev3d.onmousedown = function(){
		return false;
	}
	
	prev3d.onclick = function(){
		window.view -=1;
		if(window.view== -1){
			window.view = imgLen - 1 ;
		}
//		toBtn(this);
		box3D.onclick = box3Dgpl;
		positionRandom();
		clearTimeout(this.tabTimer);
		this.tabTimer = setTimeout(function(){
			aLi[aLi.length-1].addEventListener('webkitTransitionEnd',end,false);
			function end(){
				this.removeEventListener('webkitTransitionEnd',end,false);
				toJoin()
			}
		},400)
		
		
		
	}
}




// 大图切换3d版盒子状态
var box = document.getElementById('box');
var box3D = document.getElementById('box3D');
function css3d(){
	
	// 利用事件委托点击大图时生成3d盒子
	oList.onclick = function(e){
		if (e.ctrlKey && e.target !== oList) {
			next3d.style.display = prev3d.style.display = 'none';
		    var lis = oList.getElementsByTagName('li');
		    var divs = box.getElementsByTagName('div');
		    var lens = divs.length;
		    var leg = lis.length;
			box3D.style.display = 'block';
			while (lens--){
				divs[lens].style.backgroundImage = e.target.style.backgroundImage;
			}
			while (leg--){
				lis[leg].style.display = 'none';
			}

		}
	}
	
}
// 点击3d盒子变成原来的大图
function box3Dgpl(e){
	if(e.ctrlKey){
		next3d.style.display = prev3d.style.display = 'block';
	    var lis = oList.getElementsByTagName('li');
	    var leg = lis.length;
		box3D.style.display = 'none';
		while (leg--){
			lis[leg].style.display = 'block';
		}
	}
}
	
box3D.onclick = box3Dgpl;