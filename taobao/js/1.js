

$(function(){
	banner();
	message();
	footer();
	guess();
	
	function guess(){
		
		var oScript = document.createElement('script');
		oScript.src = 'http://api.douban.com/v2/movie/top250?count=100&callback=fn';
		$('html').append(oScript);
	}
	
	function footer(){
		$('footer').find('div').on('touchend',function(ev){
			$('footer').find('div').removeClass('active');
			$(this).addClass('active');
		});
	}
	function message(){
		var i = 0;
		var timer = setInterval(function(){
			$('.message').find('ul').css('top',-i*$('.message').find('li').outerHeight()+'px');
			i++;
			if(i == $('.message').find('li').get().length+1){
				$('.message').find('ul').css('top','0px');
				i = 0;
			}
		},3000);
		
	}
	
	function banner(){
		var i = 0;
		var iStart = 0;
		var iNowLeft = 0;
		var iLeft = 0;
		var timer = setInterval(function(){
			autoPlay();
			i++;
		},3000);
		
		$('.banner').on('touchstart',function(ev){		//手指触碰开始
			$('.banner').css('transition','0');
			$('.banner').css('webkitTransition','0');
			ev.preventDefault();
			clearInterval(timer);
			var ev = ev.changedTouches[0];
			iStart = ev.pageX;
			iLeft = $('.banner').position().left;
		});
		
		$('.banner').on('touchmove',function(ev){		//手指移动
			var ev = ev.changedTouches[0];
			iNowLeft = iLeft + ev.pageX - iStart + 'px';
			$('.banner').css('left',iNowLeft);
		});
		
		$('.banner').on('touchend',function(ev){		//手指离开
			$('.banner').css('transition','0.4s');
			var ev = ev.changedTouches[0];
			var onoff = Math.abs(ev.pageX - iStart) > $('.banner').find('li').eq(1).outerWidth()/5;
			if(onoff){
				if( (ev.pageX - iStart)>0 ){
					i--;
				}else{
					i++;
				};
				autoPlay();
				timer = setInterval(function(){
					autoPlay();
					i++
				},3000);
			}else{
				autoPlay();
				timer = setInterval(function(){
					autoPlay();
					i++
				},3000);
			};
		})
		
		function autoPlay(){			//自动播放
			if(i == 8){
				i = 0;
			};
			if(i == -1){
				i = 7;
			};
			$('.banner').css( 'left' , $('.banner').find('li').eq(1).outerWidth()*-i );
			$('.img-circle').find('span').removeClass('active');
			$('.img-circle').find('span').eq(i).addClass('active');
		}
	}
	
	window.fn = function(data){
					
					for(var i=0;i<data.count;i++){
						var oLi = document.createElement('li');
						oLi.innerHTML = '<a href=""><img src="'+data.subjects[i].images.large+'" alt=""><p>'+data.subjects[i].title+'</p><div class="guess-info"><span>'+data.subjects[i].genres[0]+'</span><ul><li></li><li></li><li></li></ul><span>'+data.subjects[i].year+'拍摄'+'</span></div></a>';
						$('.guess>ul').append(oLi);
					}
					
				}
	
});

