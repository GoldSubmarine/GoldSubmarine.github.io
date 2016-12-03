Vue.component('item',{
	template : '#item',
	props : {
		options : Array
	},
	data : function(){
		return {
			value : ''
		};
	}
});


var demo = new Vue({
	el : '#demo',
	data : {
		selected : 'default',
		options : ['apple','pear','peach','banana']
	},
	methods : {
		chose : function(v){
			this.selected = v;
		}
	}
});