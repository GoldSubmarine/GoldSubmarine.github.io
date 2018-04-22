
function Vue(options) {
    this._init(options);
}

Vue.prototype._init = function(options) {
    this.$options = options;
    this.$data = options.data;
    this.$el = document.querySelector(options.el);  //根节点
    this.$methods = options.methods;

    this._binding = {};     //存放watch实例，用于更新dom元素
    this._obverse(this.$data)   //使用Object.defineProperty初始化data
    this._complie(this.$el);    //解析dom中的指令，向this._binding中添加watch实例，生成click事件
}

Vue.prototype._obverse = function(data) {
    let _this = this;
    for(let key in data) {
        if(data.hasOwnProperty(key)) {
            this._binding[key] = {
                _directives: []
            };
            let value = data[key];
            Object.defineProperty(data, key, {
                enumerbale: true,
                configurable: true,
                get() {
                    return value
                },
                set(newVal) {
                    value = newVal;
                    _this._binding[key]._directives.forEach(item => item.update());
                }
            })

            if(typeof value === 'object') {
                this._obverse(value)
            }
        }
    }
}

Vue.prototype._complie = function(root) {
    let _this = this;
    let nodes = root.children;
    for(let i = 0; i < nodes.length; i++) {
        let node = nodes[i];
        if(node.hasAttribute('v-click')) {
            node.onclick = function() {
                let methods = this.getAttribute('v-click');
                _this.$methods[methods].call(_this.$data);
            }
        }

        let regex = /\{\{\s+(\w+)\s+\}\}/g;
        if(regex.test(node.innerText)) {
            let data = node.innerText.replace(regex, '$1');
            this._binding[data]._directives.push(
                new Watch({
                    order: 'text',
                    el: node,
                    vm: this,
                    data: data,
                    attr: 'innerHTML'
                })
            );
        }
        
        if(node.hasAttribute('v-model')) {
            let data = node.getAttribute('v-model');
            this._binding[data]._directives.push(
                new Watch({
                    order: 'text',
                    el: node,
                    vm: this,
                    data: data,
                    attr: 'value'
                })
            );
            node.addEventListener('input', function(ev) {
                _this.$data[data] = ev.target.value;
            }, false)
        }
    }
}

function Watch({order, el, vm, data, attr}) {
    this.order = order; // 指令名称
    this.el = el;   //dom对象
    this.vm = vm;   //实例的vue对象
    this.data = data;   //对应的this.$data中的key
    this.attr = attr;   //要改变的属性
    this.update();  //更新试图
}
// 更新视图
Watch.prototype.update = function() {
    this.el[this.attr] = this.vm.$data[this.data];
}

let vm = new Vue({
    el: '#app',
    data: {
        a: 1
    },
    methods: {
        decrease() {
            if(typeof this.a === 'number') {
                this.a--;
            } else {
                alert('不是数字')
            }
        },
        increase() {
            if(typeof this.a === 'number') {
                this.a++;
            } else {
                alert('不是数字')
            }
        }
    }
})