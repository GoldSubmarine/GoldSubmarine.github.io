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
			var oIndex = document.getElementById('index');
		    wel.style.opacity = 0;
			wel.addEventListener('transitionend',function(){
				wel.className = 'page';
				oIndex.className = 'page pageShow';
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
		for(let i=0;i<aLi.length;i++){
			aNav[i].className = '';
		}
		aNav[iNow].className = 'active';
		
		
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
	
	document.addEventListener('touchmove',function(ev){
		ev.preventDefault();
	},false);
	
}

function star(){											//选择star
	var oScoreList = document.getElementById('scoreList');
	var aLi = oScoreList.getElementsByTagName('li');
	var arr = ['很差','不好','一般','不错','很好'];
	for(let i=0;i<aLi.length;i++){
		let aNav = aLi[i].getElementsByTagName('a');
		let oInput = aLi[i].getElementsByTagName('input')[0];
		for(let j=0;j<aNav.length;j++){
			aNav[j].addEventListener('touchstart',function(){
				for(let k=0;k<aNav.length;k++){
					if(k<=j){
						aNav[k].className = 'active';
					}else{
						aNav[k].className = '';
					}
				}
				oInput.value = arr[j];
			},false);
		};
		
	}
}

function tagChose(){										//选择标签
	var oTagList = document.getElementById('tagList');
	var aLi = oTagList.getElementsByTagName('li');
	for(let i=0;i<aLi.length;i++){
		aLi[i].addEventListener('touchstart',function(){
			if(this.className){
				this.className = '';
			}else{
				this.className = 'active';
			}
		},false);
	}
}

function submit(){
	var oScoreList = document.getElementById('scoreList');
	var oSubmit = document.getElementById('submit');
	var oSubmitBtn = oSubmit.getElementsByTagName('input')[0];
	var aInput = oScoreList.getElementsByTagName('input');
	var time = 0;
	
	oSubmitBtn.addEventListener('touchend',function(){
		var a = formChecked();
		var b = tagChecked();
		if(a && b){
			mask();
		}else{
			var oInfo = oSubmit.getElementsByTagName('span')[0];		//提示动画info
			if(a){
				oInfo.innerHTML = '给景区添加标签';
			}else{
				oInfo.innerHTML = '给景区评分';
			};
			oInfo.className = 'info active';
			setTimeout(function(){
				oInfo.className = 'info';
			},1000);
		}
	},false);
	
	function formChecked(){										//验证star的信息
		time = 0;
		for(let i=0;i<aInput.length;i++){
			if(aInput[i].value){
				time++;
			};
		};
		if(time==3){
			return true;
		}else{
			return false;
		};
	}
	
	function tagChecked(){										//验证标签的信息
		var oTagList = document.getElementById('tagList');
		var aLi = oTagList.getElementsByClassName('active');
		if(aLi.length==0){
			return false;
		}else{
			return true;
		}
	}
	
}


function mask(){										//提交后的遮罩
	var oMask = document.getElementById('mask');
	var oIndex = document.getElementById('index');
	var oNews = document.getElementById('news');
	oMask.className = 'page pageShow';
	oNews.className = 'page pageShow';
	setTimeout(function(){
		oMask.style.opacity = 1;
		oIndex.style.filter = 'blur(10px)';
	},14);
	setTimeout(function(){
		oMask.style.transition = '0.5s';
		oIndex.style.transition = '0.5s';
		oMask.style.opacity = 0;
		oNews.style.opacity = 1;
		oIndex.style.filter = 'blur(0px)'
		oMask.addEventListener('transitionend',function(){
			oMask.className = 'page';
			oIndex.className = 'page';
		},false);
	},3000);
}

function news(){
	
	var oNews = document.getElementById('news');
	var aInput = oNews.getElementsByTagName('input');
	
	aInput[0].onchange = function(){
		if(this.files[0].type.split('/')[0]=='video'){
			
		}else{
			var oInfo = oNews.getElementsByClassName('info')[0];		//提示动画info
			oInfo.innerHTML = '请选择视频';
			oInfo.className = 'info active';
			setTimeout(function(){
				oInfo.className = 'info';
			},1000);
		}
	}
	
	aInput[1].onchange = function(){
		if(this.files[0].type.split('/')[0]=='image'){
			
		}else{
			var oInfo = oNews.getElementsByClassName('info')[0];		//提示动画info
			oInfo.innerHTML = '请选择图片';
			oInfo.className = 'info active';
			setTimeout(function(){
				oInfo.className = 'info';
			},1000);
		}
	}
	
	function info(){
		var aInput = oNews.getElementsByTagName('input');
	}
	
}

window.onload = function(){
	imgLoad();
	autoPlay();
	star();
	tagChose();
	submit();
	news();
}