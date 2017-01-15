$(function(){
	
	photo(11);
	
	function photo(num){
		
		for(var i=1;i<num+1;i++){
			var img = $('<img/>')
			img.attr('src','img/'+i+'.jpg');
			$('.photo').append(img);
		}
		
		var mIndex = Math.floor( $('img').length/2 );
		var mLeft = ($(window).width() - $('img').width())/2;
		var current = mIndex;
		
		$('img').eq(mIndex).css('left',mLeft+'px');
		
		$('img').eq(mIndex).css('transform','translateZ(150px)');
		
		$('img').each(function(i){
			if(i<mIndex){
				$(this).css('transform','rotateY(40deg)');
			}else if(i>mIndex){
				$(this).css('transform','rotateY(-40deg)');
			};
			$(this).css('left',mLeft+150*(i-mIndex)+'px');
		});
		
		$('img').click(function(){
			var index = $(this).index();
			if(current != index){
				
				$('img').eq(current).css('transform','translateZ(0px)');
				
				$('img').each(function(i){
					if(i < index){
						$(this).css('transform','rotateY(40deg)');
					}else if(i > index){
						$(this).css('transform','rotateY(-40deg)');
					};
					$(this).css('left',parseInt($(this).css('left'))+(current-index)*150+'px');
				});
				
				$('img').eq(index).css('transform','rotateY(0deg)');
				$('img').eq(index).css('transform','translateZ(150px)');
				
				current = index;
				
			}
			
		});
		
		$(window).resize(function(){
			
			nLeft = ($(window).width() - $('img').width())/2;
			
			$('img').each(function(i){
				$(this).css('left',parseInt($(this).css('left'))+nLeft-mLeft+'px');
			});
			
			mLeft = nLeft;
			
		})
		
	}
	
})