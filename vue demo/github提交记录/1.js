var apiURL = 'https://api.github.com/repos/vuejs/vue/commits?per_page=3&sha=';

var demo = new Vue({
	el : '#demo',
	data : {
		branches : ['master','dev'],
		currentbranch : 'master',
		commits : null
	},
	methods : {
		fetchData : function(){
			var xhr = new XMLHttpRequest();
			var self = this;
			xhr.open('GET',apiURL+self.currentbranch,true);
			xhr.send();
			xhr.onload = function(){
				self.commits = JSON.parse(xhr.responseText);
				console.log(self.commits[0].html_url);
			};
		}
	},
	filters : {
		truncate : function(v){
			var newline = v.indexOf('\n');
      		return newline > 0 ? v.slice(0, newline) : v;
		},
		formatDate : function(v){
			return v.replace(/T|Z/g, ' ');
		}
	},
	created : function(){
		this.fetchData();
	},
	watch : {
		currentbranch : 'fetchData'
	}
})