let Target = null;

const observe = (value) => {
    if (!value || typeof value !== 'object') {
        return
    }

    const dep = new Dep();

    return new Proxy(value, {
        get: function (target, key, receiver) {
            if (Target) {
                dep.depend.call(dep);
            }
            return target[key]
        },
        set: function (target, key, value, receiver) {
            target[key] = value;
            dep.notify();
            return value;
        }
    })
}

const proxyData = (vm) => {
    return new Proxy(vm, {
        get(target, key, receiver) {
            if (key in target.data) {
                return target.data[key]
            } else {
                return target[key]
            }
        },

        set(target, key, value, receiver) {
            if (key in target.data) {
                target.data[key] = value;
            } else {
                target[key] = value;
            }
        }
    })
}

class Dep {
    constructor(vm) {
        this.arr = [];
    }

    depend() {
        if (!this.arr.includes(Target)) {
            this.arr.push(Target);
        }
    }

    notify() {
        this.arr.forEach(item => {
            item.render();
        })
    }
}

class Vue {
    constructor(options) {
        this.options = options;
        Target = this;
        this.data = observe(this.options.data.call(this), this);
        this.proxy = proxyData(this);
        this.render(this.proxy);
        return this.proxy;
    }
    render() {
        this.options.render.call(this.proxy)
    }
}

const vm = new Vue({
    data() {
        return {
            a: 1
        }
    },
    render() {
        document.write(this.a);
    }
});

vm.a = 22;