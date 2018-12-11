#  初探 Vue3.0 中的 Proxy

## 前言

 在今年的 VueConf TO 2018 大会上，尤雨溪发表了 Vue3.0 的主题演讲，对 Vue3.0 的更新计划、方向进行了详细阐述，并且表示在 Vue3.0 中  将放弃原来使用的 Object.defineProperty, 将采用更加完美的  原生 Proxy。

这将会消除了之前 Vue2.x 中基于 Object.defineProperty 的实现所存在的很多限制：无法监听 属性的添加和删除、数组索引和长度的变更，并可以支持 Map、Set、WeakMap 和 WeakSet！。

## 什么是 Proxy

[MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy) 上是这么描述的——Proxy 对象用于定义基本操作的自定义行为（如属性查找，赋值，枚举，函数调用等）。

其实就是在对目标对象的操作之前提供了拦截，可以对外界的操作进行过滤和改写，修改某些操作的默认行为，这样我们可以不直接操作对象本身，而是通过操作对象的代理对象来间接来操作对象，达到预期的目的。

下面我们用几个例子来解释一下：

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

上述例子中，我们事先定义了一个对象 obj , 通过 Proxy 构造器生成了一个 proxyObj 对象，并对其的 set(写入) 和 get (读取) 行为重新做了修改。

当我们访问对象内原本存在的属性时，会返回原有属性内对应的值，如果试图访问一个不存在的属性时，会返回 0 ，即我们访问 proxyObj.a 时，原本对象中有 a 属性，因此会返回 1 ，当我们试图访问对象中不存在的 b 属性时，不会再返回 undefined ，而是返回了 0 ，当我们试图去设置新的属性值的时候，总是会返回 888 ，因此，即便我们对 proxyObj.a 赋值为 666 ，但是并不会生效，依旧会返回 888!

### 语法

ES6 原生提供的 Proxy 语法很简单，用法如下：

```javascript
const proxy = new Proxy(target, handler)
```

target 是用 Proxy 包装的目标对象（可以是任何类型的对象，包括原生数组，函数，甚至另一个代理）。handler 也是一个对象，其属性是当执行一个操作时定义代理的行为的函数。handle 可以是一个空对象，此时操作代理对象相当于直接操作目标对象。

 上面就是 Proxy 的基本  用法，但是对于 target 和 handler 有一些  类型的限制, 经过  测试，handle 和 target 只能为 Object、Array、Function。当设置为其他类型是, 会抛出 Cannot create proxy with a non-object as target or handler！

要想 Proxy 起作用，我们就不能去操作原来对象的对象，也就是目标对象 target，必须针对的是 Proxy 实例进行操作，否则达不到预期的效果，以刚开始的例子来看，我们设置 get 方法后，试图继续从原对象 obj 中读取一个不存在的属性 b，结果依旧返回 undefined。但是我们从代理对象上  读取时，不会再返回 undefined ，而是返回了 0。

### API

ES6 中 Proxy 目前提供了 13 种可代理操作，下面我对几个比较常用的 api 做一些归纳和整理，想要了解其他方法的同学可自行去[查阅](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy/handler) ：

#### --handler.get(target,property,receiver)

用于拦截对象的读取属性操作，target 是指目标对象，property 是被获取的属性名 ， receiver 是 Proxy 或者继承 Proxy 的对象，一般情况下就是 Proxy 实例。

```javascript
const proxy = new Proxy(
    {},
    {
        get: function(target, prop) {
            console.log(`get ${prop}`)
            return 10
        },
    }
)

console.log(proxy.a) // get a
// 10
```

我们拦截了一个空对象的 读取 get 操作， 当获取其内部的属性是，会输出 get \${prop} ， 并返回 10 ；

```javascript
const proxy = new Proxy(
    {},
    {
        get: function(target, prop, receiver) {
            return receiver
        },
    }
)

console.log(proxy.a) // Proxy{}
console.log(proxy.a === proxy) //true
```

上述 proxy 对象的 a 属性是由 proxy 对象提供的，所以 receiver 指向 proxy 对象，因此 proxy.a === proxy 返回的是 true。

要注意，如果要访问的目标属性是不可写以及不可配置的，则返回的值必须与该目标属性的值相同，也就是不能对其进行修改，否则会抛出异常~

```javascript
const obj = {}
Object.defineProperty(obj, 'a', {
    configurable: false,
    enumerable: false,
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

上述 obj 对象中的 a 属性不可写，不可配置，我们通过 Proxy 创建了一个 proxy 的实例，并拦截了它的 get 操作，当我们输出 proxy.a 时会抛出异常，此时，如果我们将 get 方法的返回值修改跟目标属性的值相同时，也就是 10 ，就可以消除异常。

#### --handler.set(target, property, value, receiver)

用于拦截设置属性值的操作，参数于 get 方法相比，多了一个 value ，即要设置的属性值。

在严格模式下，set 方法需要返回一个布尔值，返回 true 代表此次设置属性成功了，如果返回 false 且设置属性操作失败，并且会抛出一个 TypeError。

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

上述我们通过修改 set 方法，对 目标对象中的 count 属性赋值做了限制，我们要求 count 属性赋值必须是一个 number 类型的数据，如果不是，就返回一个错误 The variable is not an integer，我们第一次为 count 赋值字符串 '10' ， 抛出异常，第二次赋值为数字 10 ， 打印成功，因此，我们可以用 set 方法来做一些数据校验！

同样，如果目标属性是不可写及不可配置的，则不能改变它的值，即赋值无效，如下：

```javascript
const obj = {}
Object.defineProperty(obj, 'count', {
    configurable: false,
    enumerable: false,
    value: 10,
    writable: false,
})

const proxy = new Proxy(obj, {
    set: function(target, prop, value) {
        target[prop] = 20
    },
})

proxy.count = 20
console.log(proxy.count) // 10
```

上述 obj 对象中的 count 属性，我们设置它不可被修改，并且默认值，我们给定为 10 ，那么即使给其赋值为 20 ，结果仍旧没有变化！

#### --handler.apply(target, thisArg, argumentsList)

用于拦截函数的调用，共有三个参数，分别是目标对象（函数）target，被调用时的上下文对象 thisArg 以及被调用时的参数数组 argumentsList，该方法可以返回任何值。

target 必须是是一个函数对象，否则将抛出一个 TypeError。

```javascript
function sum(a, b) {
    return a + b
}

const handler = {
    apply: function(target, thisArg, argumentsList) {
        console.log(`Calculate sum: ${argumentsList}`)
        return target(argumentsList[0], argumentsList[1]) * 2
    },
}

const proxy = new Proxy(sum, handler)

console.log(sum(1, 2)) // 3
console.log(proxy(1, 2)) // Calculate sum：1,2
```

实际上，apply 还会拦截目标对象的 Function.prototype.apply() 和 Function.prototype.call()，以及 Reflect.apply() 操作，如下：

```javascript
console.log(proxy.call(null, 3, 4)) // Calculate sum：3,4
// 14

console.log(Reflect.apply(proxy, null, [5, 6])) // Calculate sum: 5,6
// 22
```

#### --handler.construct(target, argumentsList, newTarget)

construct 用于拦截 new 操作符，为了使 new 操作符在生成的 Proxy 对象上生效，用于初始化代理的目标对象自身必须具有[[Construct]]内部方法；它接收三个参数，目标对象 target ，构造函数参数列表 argumentsList 以及最初实例对象时，new 命令作用的构造函数，即下面例子中的 p。

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

has 方法可以看作是针对 in 操作的钩子，当我们判断对象是否具有某个属性时，这个方法会生效，典型的操作就是 in ,改方法接收两个参数 目标对象 target 和 要检查的属性 prop，并返回一个 boolean 值。

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

console.log('a' in p) // TypeError is thrown

// false
```

上面介绍了这么多，也算是对 Proxy 又来一个初步的了解，我们来看看我们可以用 Proxy 做些什么。

### 解决对象属性为 undefined 的问题

在一些层级比较深的对象属性获取中，如何处理 undefined 一直是一个痛苦的过程，如果我们用 Proxy 可以很好的兼容这种情况。

```javascript
;(() => {
    const target = {}
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
    console.log('z' in proxy.x.y) // false (其实这一步已经针对`target`创建了一个x.y的属性)
    proxy.x.y.z = 'hello'
    console.log('z' in proxy.x.y) // true
    console.log(target.x.y.z) // hello
})()
```

### 普通函数与构造函数的兼容处理

我们使用了 apply 来代理一些行为，在函数调用时会被触发，因为我们明确的知道，代理的是一个 Class 或构造函数，所以我们直接在 apply 中使用 new 关键字来调用被代理的函数。

```javascript
class Test {
    constructor(a, b) {
        console.log('constructor', a, b)
    }
}

// Test(1, 2) // throw an error
const proxyClass = new Proxy(Test, {
    apply(target, thisArg, argumentsList) {
        // 如果想要禁止使用非new的方式来调用函数，直接抛出异常即可
        // throw new Error(`Function ${target.name} cannot be invoked without 'new'`)
        return new (target.bind(thisArg, ...argumentsList))()
    },
})

proxyClass(1, 2) // constructor 1 2
```

以及如果我们想要对函数进行限制，禁止使用 new 关键字来调用，可以用另一个 trap:construct

```javascript
function add(a, b) {
    return a + b
}

const proxy = new Proxy(add, {
    construct(target, argumentsList, newTarget) {
        throw new Error(`Function ${target.name} cannot be invoked with 'new'`)
    },
})

proxy(1, 2) // 3
new proxy(1, 2) // throw an error
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
assert['Less than 18'] = 18 >= 19 // Error: Less than 18
```

上面对 Proxy 进行了一些简单的应用，我们现在看看如何实现一个简单的 Vue 数据绑定

```javascript
const proxyVue = (vm)=> {
    return new Proxy(vm, {
        get(target, ) {}
    })
}

const observe = (value, vm) => {
  if (!value || typeof value !== 'object') {
    return
  }

  return new Proxy(value, {
    get: function (target, key, receiver) {
      return traget[key]
    },
    set: function (target, key, value, receiver) {
      target[key] = value;
      vm.render();
      return value
    }
  })
}

class Vue {
    construct(options) {
        this.options = options;
        this.data = this.options.data.call(this);
        this.proxy = this.observe(this.data, this);
    },
    render() {
        console.log('render')
    }
}
```
