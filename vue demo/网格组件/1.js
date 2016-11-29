Vue.component('component',{
	template : '#aaa',
	props : {
		tableDatas: Array,
		titles: Array,
		searchData: String
	},
	data : {
		order : ''
	},
	computed : {
		click : function(title){
			this.order = title;
		},
		filterData : function(){
			var tableDatas = this.tableDatas;
			var searchData = this.searchData;
			var titles = this.titles;
			var order = this.order;
			if(searchData){
				tableDatas = tableDatas.filter(function(v){
					return	titles.some(function(s){
						return String(v[s]).toLowerCase().indexOf(searchData) > -1;
					})
				});
			};
			if(order){
				data.sort(function(a,b){
					
				});
			};
			return tableDatas;
		}
	}
})

var demo = new Vue({
	el : '#demo',
	data : {
		tableDatas : [
			{ name: 'Chuck Norris', power: Infinity },
			{ name: 'Bruce Lee', power: 9000 },
			{ name: 'Jackie Chan', power: 7000 },
			{ name: 'Jet Li', power: 8000 }
		],
		searchData : '',
		titles : ['name','power']
	}
});