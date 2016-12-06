//图片加载后进行跳转
function imgLoad(){
	var animationTime = new Date().getTime();
	var animation = false;
	var imgLoadTime = 0;
	var arr = ['./img/1.jpg','./img/2.jpg','./img/3.jpg','./img/4.jpg','./img/5.jpg'];
	var timer = setInterval(function(){
		if( new Date().getTime() - animationTime >3000){
			animation = true;
		};
		if( animation && imgLoadTime==arr.length ){
			var wel = document.getElementById('welcome');
		    wel.style.opacity = 0;
			wel.addEventListener('transitionend',function(){
				wel.className = 'page';
			},false);
			clearInterval(timer);
		}
	},500);
	for(let i=0;i<arr.length;i++){
		var oImg = new Image();
		oImg.src = arr[i];
		oImg.onload = function(){
			imgLoadTime++;
		}
	}
	
}
//拖拽和自动播放
function autoPlay(){
	var oPicList = document.getElementById('picList');
	var oPicMask = document.getElementById('picMask');
	var aNav = oPicMask.getElementsByTagName('a');
	var aLi = oPicList.getElementsByTagName('li');
	var iNow = 0;
	var iStart = 0;
	var iStartX = 0;
	var tranX = 0;
	var timer = setInterval(function(){		//自动播放
		iNow++;
		iNow = iNow % aLi.length;
		tranX = -iNow*640;
		oPicList.style.transition = '1s';
		oPicList.style.WebkitTransform = 'translateX('+tranX+'px)';
		for(let i=0;i<aLi.length;i++){
			aNav[i].className = '';
		}
		aNav[iNow].className = 'active';
	},2000);
	oPicList.addEventListener('touchstart',function(ev){		//拖拽
		oPicList.style.transition = 'none';
		clearInterval(timer);
		ev = ev.changedTouches[0];
		iStart = ev.pageX;
		iStartX = tranX;
	},false);
	oPicList.addEventListener('touchmove',function(ev){
		ev = ev.changedTouches[0];
		var dix = ev.pageX - iStart;
		tranX = iStartX+dix;
		oPicList.style.WebkitTransform = 'translateX('+tranX+'px)';
	},false);
	oPicList.addEventListener('touchend',function(ev){
		ev = ev.changedTouches[0];
		var dix = ev.pageX - iStart;
		iNow = iNow - Math.round(dix/640);
		if(iNow==-1){iNow++};
		if(iNow==5){iNow--};
		tranX = -iNow*640;
		oPicList.style.transition = '1s';
		oPicList.style.WebkitTransform = 'translateX('+tranX+'px)';
		
		
		timer = setInterval(function(){		//自动播放
			iNow++;
			iNow = iNow % aLi.length;
			tranX = -iNow*640;
			oPicList.style.transition = '1s';
			oPicList.style.WebkitTransform = 'translateX('+tranX+'px)';
			for(let i=0;i<aLi.length;i++){
				aNav[i].className = '';
			}
			aNav[iNow].className = 'active';
		},2000);
		
		
	},false);
	
	document.addEventListener('touchmove',function(ev){			//阻止默认事件
		ev.preventDefault();
	},false);
}




window.onload = function(){
	imgLoad();
	autoPlay();
}