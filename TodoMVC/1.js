window.onload = function(){
	
	let listdata = [
		/*{ 'content':'1234' , 'active':false , 'completed':false, 'hover':false}*/
	];
	
	let toStorage = {
		save : function(value){
			localStorage.setItem('key1',JSON.stringify(value));
		},
		read : function(){
			return JSON.parse(localStorage.getItem('key1'));
		}
	}
	
	new Vue({
		el : "#app",
		data : {
			listdata : toStorage.read(),
			newtodo : '',
			filterlist : [],
			showData : 'all' 
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
			},
			clear(){
				var list = this.listdata.filter(function(item){
					if(!item.completed){
						return item;
					};
				});
				this.listdata = list;
			},
			show : function(item){
				switch(this.showData){
					case 'all':
						return true;
						break;
					case 'active':
						if(!item.completed){
							return true;
						}else{
							return false;
						}
						break;
					case 'completed':
						if(item.completed){
							return true;
						}else{
							return false;
						}
						break;
				};
			},
			choseAll : function(){
				this.listdata.forEach(function(item){
					item.completed = !item.completed;
				})
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
		watch : {
			listdata : {
				handler : function(){
					toStorage.save(this.listdata);
				},
				deep : true
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