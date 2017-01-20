window.onload = function(){
	
	let listdata = [
	/*	{ 'content':'1234' , 'active':false , 'completed':false, 'hover':false},
		{ 'content':'dfsd' , 'active':false , 'completed':false, 'hover':false},
		{ 'content':'bvf' , 'active':false , 'completed':false, 'hover':false}*/
	];
	
	new Vue({
		el : "#app",
		data : {
			listdata : listdata,
			newtodo : '',
			filterlist : []
		},
		methods : {
			deletetodo:function(index){
				this.listdata.splice(index,1);
			},
			addList:function(){
				if(this.newtodo){
					this.listdata.push( { 'content':this.newtodo , 'active':false , 'completed':false, 'hover':false} );
					this.newtodo = '';
				}
			}
			
		},
		computed : {
			left(){
				var leftdata = 0;
				this.listdata.forEach(function(item){
					if(!item.completed){
						return ++leftdata;
					}
				});
				
				if(leftdata == 0||leftdata == 1){
					return leftdata + ' item left';
				}else{
					return leftdata + ' items left';
				}
			}
		},
		directives : {
			focus : {
				update : function(el,binding){
					if(binding.value){
						el.focus();
					}
				
				}
			}
		}
	})
	
}