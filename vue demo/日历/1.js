Vue.component('item',{
	template : '#item',
	props : {
		
	},
	data : function(){
		var date = new Date();
		var year = date.getFullYear();
		var month = date.getMonth();
		var today = date.getDate();
		var first = new Date(year,month,01);
		var firstweek = first.getDay();
		return {
			arrday : [31,28,31,30,31,30,31,31,30,31,30,31],
			arrweek : ['日','一','二','三','四','五','六'],
			today : today,
			todayyear : year,
			todaymonth : month+1,
			firstweek : firstweek,
			year : year,
			month : month+1,
			classstyle : ''
		};
	},
	created : function(){
		if(this.year%4 == 0){
			this.arrday[2] = 29;
		}
	},
	methods : {
		active : function(j,k){	//显示今天的样式
			var v = (j-1)*7+k-this.firstweek;
			if(this.year==this.todayyear){
				if(this.todaymonth==this.month){
					if(v==this.today){
						return 'today';
					}
				}
			};
		},
		choseday : function(j,k){
			var day = (j-1)*7+k-this.firstweek;
			var str = this.year+'-'+this.month+'-'+day;
			this.$emit('choseday',str);
		},
		init : function(){		//更新其他data
			var first = new Date(this.year,this.month-1,01);
			this.firstweek = first.getDay();
			if(this.year%4 == 0){
				this.arrday[2] = 29;
			}
		},
		yearpre : function(){	//year向前切换
			this.year--;
			this.init();
		},
		monthpre : function(){		//month向前切换
			if(this.month==1){
				this.month = 13;
				this.year--;
			};
			this.month--;
			this.init();
		},
		monthnext : function(){		//month向后切换
			if(this.month==12){
				this.month = 0;
				this.year++;
			};
			this.month++;
			this.init();
		},
		yearnext : function(){		//year向后切换
			this.year++;
			this.init();
		}
	},
	filters : {
		filterday : function(v,month,arrday){
			if(v>0&&v<arrday[month-1]+1){
				return v;
			};
		}
	}
});

var demo = new Vue({
	el : '#demo',
	data : {
		date : '',
		show : false
	},
	methods : {
		getday : function(v){
			this.date = v;
		}
	}
});

