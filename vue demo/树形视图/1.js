// demo data
var data = {
  name: 'My Tree',
  children: [
    { name: 'hello' },
    { name: 'wat' },
    {
      name: 'child folder',
      children: [
        {
          name: 'child folder',
          children: [
            { name: 'hello' },
            { name: 'wat' }
          ]
        },
        { name: 'hello' },
        { name: 'wat' },
        {
          name: 'child folder',
          children: [
            { name: 'hello' },
            { name: 'wat' }
          ]
        }
      ]
    }
  ]
}

Vue.component('item',{
	template : '#item',
	props : {
		modeldata : Object
	},
	data : function(){		//展开开关
		return {
			open : false
		}
	},
	computed : {
		ifchildren : function(){			//判断是否存在子类
			return this.modeldata.children && this.modeldata.children.length;
		}
	},
	methods : {
		toggle : function(){
			this.open = !this.open;
		},
		db : function(){		//双击创建子类
			if(!this.ifchildren){
				Vue.set(this.modeldata, 'children', [])
				this.append();
				this.open = true;
			}
		},
		append : function(){
			this.modeldata.children.push({
				name: 'new stuff'
			})
		}
	}
});

// boot up the demo
var demo = new Vue({
  el: '#demo',
  data: {
    treeData: data
  }
})