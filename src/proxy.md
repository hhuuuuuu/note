#  初探 Vue3.0 中的 Proxy

## 前言

 在今年的 VueConf TO 2018 大会上，尤雨溪发表了 Vue3.0 的主题演讲，对 Vue3.0 的更新计划、方向进行了详细阐述，并且表示在 Vue3.0 中将放弃原来使用的数据拦截方式 Object.defineProperty , 将采用更加完美的原生 Proxy。

使用 Proxy 进行数据拦截将解决原来使用 Object.defineProperty 所存在的诸多限制：无法监听属性的添加和删除、数组索引和长度的变更，并可以支持 Map、Set、WeakMap 和 WeakSet！。以后就可以不使用 Vue.$set和Vue.$delete 了。

我们下面来介绍一下什么是 Proxy 以及如何使用 Proxy 实现一个简单的 Vue 数据绑定。

## 什么是 Proxy

[MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy) 上是这么描述的——Proxy 对象用于定义基本操作的自定义行为（如属性查找，赋值，枚举，函数调用等）。

其实就是在对目标对象的操作之前提供了拦截，可以对外界的操作进行过滤和改写，修改某些操作的默认行为，这样我们可以不直接操作对象本身，而是通过操作对象的代理对象来间接来操作对象，达到预期的目的。

下面我们用写一个小例子来解释一下：

```javascript
const obj = {
    a: 1,
}

const proxyObj = new Proxy(obj, {
    get: function(target, prop) {
        return prop in target ? target[prop] : 0
    },
    set: function(target, prop, value) {
        target[prop] = 888
    },
})


console.log(obj.a) // 1
console.log(obj.b) // undefined

console.log(proxyObj.a) // 1
console.log(proxyObj.b) // 0


proxyObj.a = 666
console.log(proxyObj.a) // 888
console.log(obj.a) // 888
```

上述例子中，我们事先定义了一个对象 obj , 通过 Proxy 构造器生成了一个 proxyObj 对象，并对其的 set 和 get 行为重新做了修改。

当我们没有对代理对象进行操作时，我们对原对象的操作就和没有创建代理对象一样，obj.a 和 obj.b 分别返回 1 和 undefined。但是对于代理对象的读取返回值就和原对象有些不同了， proxyObj.a 和 proxyObj.b 分别返回了 1 和 0。当我们对代理对象进行复制操作后, 虽然我们赋值为 666 , 但是 proxyObj.a 和 obj.a 都返回了 888。 其中的原因就是我们对代理的 get 和 set 方法进行了重写。

### 语法

ES6 原生提供的 Proxy 语法很简单，用法如下：

```javascript
const proxy = new Proxy(target, handler)
```

target： 用 Proxy 包装的目标对象（可以是任何类型的对象，包括原生数组，函数，甚至另一个代理）。
handler： 一个对象，其属性是当执行一个操作时定义代理的行为的函数。

 上面就是 Proxy 的基本用法，但是要想 Proxy 起作用，我们就不能去操作原来对象的对象，也就是目标对象 target，必须针对的是 Proxy 实例进行操作，否则达不到预期的效果，以刚开始的例子来看，我们设置 get 方法后，试图继续从原对象 obj 中读取一个不存在的属性 b，结果依旧返回 undefined。但是我们从代理对象上读取时，不会再返回 undefined，而是返回了 0。

我们还可以创建一个可以撤销的 Proxy 对象，这里就不展开说了，基本上和 new Proxy(target, handler)差不多。[Proxy.revocable](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy/revocable)

```javascript
Proxy.revocable(target, handler)
```

下面我们对其中最重要的 handler 对象进行一下讲解。

### handler （处理器对象用来自定义代理对象的各种可代理操作。）

Proxy 目前提供了 13 种可代理操作，下面我对几个比较常用的 api 做一些归纳和整理，想要了解其他方法的可以自行去[查阅](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy/handler) ：

#### --handler.get(target,property,receiver)

用于拦截对象的读取属性操作，target 是指目标对象，property 是被获取的属性名 ， receiver 是 Proxy 或者继承 Proxy 的对象，一般情况下就是 Proxy 实例。
get 方法可以拦截以下操作：proxy[foo]和 proxy.bar，Object.create(proxy)[foo]，Reflect.get()

```javascript
const proxy = new Proxy(
    {},
    {
        get: function(target, prop) {
            return 10
        },
    }
)

console.log(proxy.a) // 10
```

我们拦截了一个空对象的读取 get 操作，当获取其内部的属性时返回 10；

要注意，如果要访问的目标属性是不可写以及不可配置的，则返回的值必须与该目标属性的值相同，也就是不能对其进行修改，否则会抛出异常。

```javascript
const obj = {}
Object.defineProperty(obj, 'a', {
    configurable: false,
    value: 10,
    writable: false,
})

const proxy1 = new Proxy(obj, {
    get: function(target, prop) {
        return 10
    },
})
console.log(proxy1.a) // 10

const proxy2 = new Proxy(obj, {
    get: function(target, prop) {
        return 20
    },
})

console.log(proxy2.a) // Uncaught TypeError
```

上述 obj 对象中的 a 属性不可写，不可配置，我们通过 Proxy 创建了一个 proxy 的实例，并拦截了它的 get 操作，当我们输出 proxy2.a 时会抛出异常，而 proxy1.a 没有抛出异常。

#### --handler.set(target, property, value, receiver)

用于拦截设置属性值的操作，参数于 get 方法相比，多了一个 value ，即要设置的属性值。

该方法会拦截目标对象的以下操作: proxy[foo] = bar 和 proxy.foo = bar, Object.create(proxy)[foo] = bar ,Reflect.set()

在严格模式下，set 方法需要返回一个布尔值，返回 true 代表此次设置属性成功了，如果返回 false 则会抛出一个 TypeError。

```javascript
const proxy = new Proxy(
    {},
    {
        set: function(target, prop, value) {
            if (prop === 'count') {
                if (typeof value === 'number') {
                    console.log('success')
                    target[prop] = value
                } else {
                    throw new Error('The variable is not an integer')
                }
            }
        },
    }
)

proxy.count = '10' // The variable is not an integer

proxy.count = 10 // success
```

上述我们通过修改 set 方法，对目标对象中的 count 属性赋值做了限制，我们要求 count 属性赋值必须是一个 number 类型的数据，如果不是，就返回一个错误 The variable is not an integer，我们第一次为 count 赋值字符串 '10'，抛出异常，第二次赋值为数字 10，打印成功，因此，我们可以用 set 方法来做一些数据校验！

同样，如果目标属性是不可写及不可配置的，则不能改变它的值，即赋值无效，如下：

```javascript
const obj = {}
Object.defineProperty(obj, 'a', {
    configurable: false,
    value: 10,
    writable: false,
})

const proxy = new Proxy(obj, {
    set: function(target, prop, value) {
        target[prop] = value
    },
})

proxy.count = 20
console.log(proxy.count) // 10
```

上述 obj 对象中的 count 属性，我们设置它不可被修改，并且默认值，我们给定为 10 ，那么即使给其赋值为 20 ，结果仍旧没有变化！

#### --handler.apply(target, thisArg, argumentsList)

用于拦截函数的调用，共有三个参数，分别是目标函数 target，被调用时的上下文对象 thisArg 以及被调用时的参数数组 argumentsList，该方法可以返回任何值。

该方法会拦截目标对象的以下操作: proxy(...args), Function.prototype.apply() 和 Function.prototype.call(), Reflect.apply()

target 必须是是一个函数对象，否则将抛出一个 TypeError。

```javascript
const sum = (a, b) => {
    return a + b
}

const handler = {
    apply: function(target, thisArg, argumentsList) {
        return target(argumentsList[0], argumentsList[1]) * 2
    },
}

const proxy = new Proxy(sum, handler)

console.log(sum(1, 2)) // 3
console.log(proxy(1, 2)) // 6
```

#### --handler.construct(target, argumentsList, newTarget)

handler.construct() 方法用于拦截 new 操作符. 为了使 new 操作符在生成的 Proxy 对象上生效，用于初始化代理的目标对象自身必须具有[[Construct]]内部方法（即 new target 必须是有效的）。

该拦截器可以拦截以下操作 new proxy(...args), Reflect.construct()

```javascript
const p = new Proxy(function() {}, {
    construct: function(target, argumentsList, newTarget) {
        console.log(newTarget === p) // true
        console.log('called: ' + argumentsList.join(', ')) // called：1,2
        return {value: (argumentsList[0] + argumentsList[1]) * 10}
    },
})

console.log(new p(1, 2).value) // 30
```

另外，该方法必须返回一个对象，否则会抛出异常！

```javascript
const p = new Proxy(function() {}, {
    construct: function(target, argumentsList, newTarget) {
        return 2
    },
})

console.log(new p(1, 2)) // Uncaught TypeError
```

#### --handler.has(target,prop)

has 方法可以看作是针对 in 操作的钩子，当我们判断对象是否具有某个属性时，这个方法会生效，典型的操作就是 in,该方法接收两个参数目标对象 target 和 要检查的属性 prop，并返回一个 boolean 值。

这个钩子可以拦截下面这些操作: foo in proxy, foo in Object.create(proxy), with(proxy) { (foo); }, Reflect.has()

```javascript
const p = new Proxy(
    {},
    {
        has: function(target, prop) {
            if (prop[0] === '_') {
                console.log('it is a private property')
                return false
            }
            return true
        },
    }
)

console.log('a' in p) // true
console.log('_a' in p) // it is a private property
// false
```

上述例子中，我们用 has 方法隐藏了属性以下划线\_开头的私有属性，这样在判断时候就会返回 false，从而不会被 in 运算符发现。

要注意，如果目标对象的某一属性本身不可被配置，则该属性不能够被代理隐藏，如果目标对象为不可扩展对象，则该对象的属性不能够被代理隐藏，否则将会抛出 TypeError。

```javascript
const obj = {a: 1}

Object.preventExtensions(obj) // 让一个对象变的不可扩展，也就是永远不能再添加新的属性

const p = new Proxy(obj, {
    has: function(target, prop) {
        return false
    },
})

console.log('a' in p) // Uncaught TypeError
```

上面介绍了这么多，也算是对 Proxy 又来一个初步的了解，我们来看看我们可以用 Proxy 做些什么。

### 解决对象属性为 undefined 的问题

在一些层级比较深的对象属性获取中，如何处理 undefined 一直是一个痛苦的过程，如果我们用 Proxy 可以很好的兼容这种情况。

```javascript
const target = {
    a: 1,
}
const handlers = {
    get: (target, property) => {
        target[property] = property in target ? target[property] : {}
        if (typeof target[property] === 'object') {
            return new Proxy(target[property], handlers)
        }
        return target[property]
    },
}
const proxy = new Proxy(target, handlers)
console.log(proxy.a) // 1
console.log('z' in proxy.x.y) // false
proxy.x.y.z = 'hello'
console.log('z' in proxy.x.y) // true
console.log(target.x.y.z) // hello
```

### 构造函数和普通函数

禁止直接调用构造函数

```javascript
function Test(a, b) {
    console.log('constructor', a, b)
}

const proxyClass = new Proxy(Test, {
    apply(target, thisArg, argumentsList) {
        throw new Error(
            `Function ${target.name} cannot be invoked without 'new'`
        )
    },
})

proxyClass(1, 2)
```

禁止使用 new 调动普通函数

```javascript
function add(a, b) {
    return a + b
}

const proxy = new Proxy(add, {
    construct(target, argumentsList, newTarget) {
        throw new Error(`Function ${target.name} cannot be invoked with 'new'`)
    },
})

new proxy(1, 2)
```

### 实现一个简易的断言工具

```javascript
const assert = new Proxy(
    {},
    {
        set(target, message, value) {
            if (!value) console.error(message)
        },
    }
)

assert["Isn't true"] = false // Error: Isn't true
```

上面对 Proxy 进行了一些简单的应用，我们现在看看如何实现一个简单的 Vue 数据绑定

```javascript
let Target = null

const observe = value => {
    if (!value || typeof value !== 'object') {
        return
    }

    const dep = new Dep()

    return new Proxy(value, {
        get: function(target, key, receiver) {
            if (Target) {
                dep.append()
            }
            return target[key]
        },
        set: function(target, key, value, receiver) {
            target[key] = value
            dep.notify()
            return value
        },
    })
}

const proxyData = vm => {
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
                target.data[key] = value
            } else {
                target[key] = value
            }
        },
    })
}

class Dep {
    constructor() {
        this.arr = []
    }

    append() {
        if (!this.arr.includes(Target)) {
            this.arr.push(Target)
        }
    }

    notify() {
        this.arr.forEach(item => {
            item.render()
        })
    }
}

class Vue {
    constructor(options) {
        this.options = options
        Target = this
        this.data = observe(this.options.data.call(this), this)
        this.proxy = proxyData(this)
        this.render(this.proxy)
        return this.proxy
    }
    render() {
        this.options.render.call(this.proxy)
    }
}

const vm = new Vue({
    data() {
        return {
            a: 1,
        }
    },
    render() {
        document.write(this.a)
    },
})

vm.a = 22
```
