# state

````javascript

import config from '../config'
import Watcher from '../observer/watcher'
import Dep, {
  pushTarget,
  popTarget
} from '../observer/dep'
import {
  isUpdatingChildComponent
} from './lifecycle'

import {
  set,
  del,
  observe,
  defineReactive,
  toggleObserving
} from '../observer/index'

import {
  warn,
  bind,
  noop,
  hasOwn,
  hyphenate,
  isReserved,
  handleError,
  nativeWatch,
  validateProp,
  isPlainObject,
  isServerRendering,
  isReservedAttribute
} from '../util/index'

const sharedPropertyDefinition = {
  enumerable: true,
  configurable: true,
  get: noop,
  set: noop
}

export function proxy (target: Object, sourceKey: string, key: string) {
  sharedPropertyDefinition.get = function proxyGetter () {
    return this[sourceKey][key]
  }
  sharedPropertyDefinition.set = function proxySetter (val) {
    this[sourceKey][key] = val
  }
  Object.defineProperty(target, key, sharedPropertyDefinition)
}

export function initState (vm: Component) {
  vm._watchers = []
  const opts = vm.$options
  // 处理porps，赋值、校验
  if (opts.props) initProps(vm, opts.props)
  // 处理methods
  if (opts.methods) initMethods(vm, opts.methods)
  // 处理data
  if (opts.data) {
    initData(vm)
  } else {
    observe(vm._data = {}, true /* asRootData */)
  }
  // 处理computed
  if (opts.computed) initComputed(vm, opts.computed)
  // 处理watche（nativeWatche 是火狐浏览器实现的原生watch）
  if (opts.watch && opts.watch !== nativeWatch) {
    initWatch(vm, opts.watch)
  }
}

// propsOptions props的检验对象
function initProps (vm: Component, propsOptions: Object) {
  // 获取传递进来的props =vnode.data.props
  const propsData = vm.$options.propsData || {}
  // 创建私有的_props
  const props = vm._props = {}
  // cache prop keys so that future props updates can iterate using Array
  // instead of dynamic object key enumeration.
  // 创建私有的_propsKeys
  const keys = vm.$options._propKeys = []
  // 判断是不是root组件
  const isRoot = !vm.$parent
  // root instance props should be converted
  // 如果不是根组件，关闭deep观测
  //  这里为什么没有进行深度观测呢？其实是因为props是从父组件传递而来，val下面的属性已经被深度观测了。
  if (!isRoot) {
    toggleObserving(false)
  }

  for (const key in propsOptions) {
    keys.push(key)
    // 校验并取值
    const value = validateProp(key, propsOptions, propsData, vm)

    /* istanbul ignore else */
    if (process.env.NODE_ENV !== 'production') {
      const hyphenatedKey = hyphenate(key)
      if (isReservedAttribute(hyphenatedKey) ||
        config.isReservedAttr(hyphenatedKey)) {
        warn(
          `"${hyphenatedKey}" is a reserved attribute and cannot be used as component prop.`,
          vm
        )
      }
      defineReactive(props, key, value, () => {
        if (vm.$parent && !isUpdatingChildComponent) {
          warn(
            `Avoid mutating a prop directly since the value will be ` +
            `overwritten whenever the parent component re-renders. ` +
            `Instead, use a data or computed property based on the prop's ` +
            `value. Prop being mutated: "${key}"`,
            vm
          )
        }
      })
    } else {
      // 响应式，是否为deep取决于是不是root  
      defineReactive(props, key, value)
    }
    // static props are already proxied on the component's prototype
    // during Vue.extend(). We only need to proxy props defined at
    // instantiation here.
    if (!(key in vm)) { // 属性代理
      proxy(vm, `_props`, key)
    }
  }
  toggleObserving(true)
}

function initData (vm: Component) {
  let data = vm.$options.data
  data = vm._data = typeof data === 'function'
    ? getData(data, vm)
    : data || {}
  // data 里面必须return的是object
  if (!isPlainObject(data)) {
    data = {}
    process.env.NODE_ENV !== 'production' && warn(
      'data functions should return an object:\n' +
      'https://vuejs.org/v2/guide/components.html#data-Must-Be-a-Function',
      vm
    )
  }
  // proxy data on instance
  const keys = Object.keys(data)
  const props = vm.$options.props
  const methods = vm.$options.methods
  let i = keys.length
  // 从这来看优先级 prop>data>method
  while (i--) {
    const key = keys[i]
    if (process.env.NODE_ENV !== 'production') {
      if (methods && hasOwn(methods, key)) {
        warn(
          `Method "${key}" has already been defined as a data property.`,
          vm
        )
      }
    }
    if (props && hasOwn(props, key)) {
      process.env.NODE_ENV !== 'production' && warn(
        `The data property "${key}" is already declared as a prop. ` +
        `Use prop default value instead.`,
        vm
      )
    } else if (!isReserved(key)) {
      proxy(vm, `_data`, key) // 属性代理
    }
  }
  // observe data 观测数据
  observe(data, true /* asRootData */)
}

export function getData (data: Function, vm: Component): any {
  // #7573 disable dep collection when invoking data getters
  pushTarget()
  try {
    return data.call(vm, vm)
  } catch (e) {
    handleError(e, vm, `data()`)
    return {}
  } finally {
    popTarget()
  }
}

const computedWatcherOptions = {
  lazy: true
}

function initComputed (vm: Component, computed: Object) {
  // $flow-disable-line
  const watchers = vm._computedWatchers = Object.create(null)
  // computed properties are just getters during SSR
  const isSSR = isServerRendering()

  for (const key in computed) {
    // 获取getter函数
    const userDef = computed[key] // function | {get: function}
    const getter = typeof userDef === 'function' ? userDef : userDef.get
    if (process.env.NODE_ENV !== 'production' && getter == null) {
      warn(
        `Getter is missing for computed property "${key}".`,
        vm
      )
    }
    if (!isSSR) {
      // create internal watcher for the computed property.
      // 创建一个惰性求职的watcher
      watchers[key] = new Watcher(
        vm,
        getter || noop,
        noop,
        computedWatcherOptions
      )
    }

    // component-defined computed properties are already defined on the
    // component prototype. We only need to define computed properties defined
    // at instantiation here.
    // 设置computed
    if (!(key in vm)) {
      defineComputed(vm, key, userDef)
    } else if (process.env.NODE_ENV !== 'production') {
      if (key in vm.$data) {
        warn(`The computed property "${key}" is already defined in data.`, vm)
      } else if (vm.$options.props && key in vm.$options.props) {
        warn(`The computed property "${key}" is already defined as a prop.`, vm)
      }
    }
  }
}

export function defineComputed (
  target: any,
  key: string,
  userDef: Object | Function
) {
  // 是否调用createComputedGetter函数
  const shouldCache = !isServerRendering()
  if (typeof userDef === 'function') {
    sharedPropertyDefinition.get = shouldCache
      ? createComputedGetter(key)
      : userDef
    sharedPropertyDefinition.set = noop
  } else {
    sharedPropertyDefinition.get = userDef.get
      ? shouldCache && userDef.cache !== false
      ? createComputedGetter(key)
      : userDef.get
      : noop
    sharedPropertyDefinition.set = userDef.set
      ? userDef.set
      : noop
  }
  if (process.env.NODE_ENV !== 'production' &&
    sharedPropertyDefinition.set === noop) {
    sharedPropertyDefinition.set = function () {
      warn(
        `Computed property "${key}" was assigned to but it has no setter.`,
        this
      )
    }
  }
  // 上面主要是构建出sharedPropertyDefinition
  // 将computed赋值到vm上
  Object.defineProperty(target, key, sharedPropertyDefinition)
}


// 构建计算属性的getter
function createComputedGetter (key) {
  return function computedGetter () {
    const watcher = this._computedWatchers && this._computedWatchers[key]
    if (watcher) {
      // 若果依赖项改变了，重新求值
      if (watcher.dirty) {
        watcher.evaluate()
      }
      // 让Dep.target收集此计算属性的所有依赖
      // 一般来说Dep.target此时就是render watcher（当然也可能是其他的计算属性）
      // 如果是render watcher， 就是让render watcher收集此计算属性的依赖
      if (Dep.target) {
        watcher.depend()
      }
      // 返回值
      return watcher.value
    }
  }
}

// value不能为null或者undefined, key不能存在porps上，不能是保留字
// 将每一个method赋值给vm，并且绑定this为vm
function initMethods (vm: Component, methods: Object) {
  const props = vm.$options.props
  for (const key in methods) {
    if (process.env.NODE_ENV !== 'production') {
      if (methods[key] == null) {
        warn(
          `Method "${key}" has an undefined value in the component definition. ` +
          `Did you reference the function correctly?`,
          vm
        )
      }
      if (props && hasOwn(props, key)) {
        warn(
          `Method "${key}" has already been defined as a prop.`,
          vm
        )
      }
      if ((key in vm) && isReserved(key)) {
        warn(
          `Method "${key}" conflicts with an existing Vue instance method. ` +
          `Avoid defining component methods that start with _ or $.`
        )
      }
    }
    vm[key] = methods[key] == null ? noop : bind(methods[key], vm)
  }
}

function initWatch (vm: Component, watch: Object) {
  for (const key in watch) {
    // 获取watch的函数，可能为数组  
    // 就是说watch可以这么写{key: [function, function]}
    const handler = watch[key]
    if (Array.isArray(handler)) {
      for (let i = 0; i < handler.length; i++) {
        createWatcher(vm, key, handler[i])
      }
    } else {
      createWatcher(vm, key, handler)
    }
  }
}

function createWatcher (
  vm: Component,
  expOrFn: string | Function,
  handler: any,
  options ?: Object
) {
  if (isPlainObject(handler)) {
    options = handler
    handler = handler.handler
  }
  if (typeof handler === 'string') {
    handler = vm[handler]
  }
  return vm.$watch(expOrFn, handler, options)
}

export function stateMixin (Vue: Class< Component>) {
  // flow somehow has problems with directly declared definition object
  // when using Object.defineProperty, so we have to procedurally build up
  // the object here.
  const dataDef = {}
  dataDef.get = function () {
    return this._data
  }
  const propsDef = {}
  propsDef.get = function () {
    return this._props
  }
  if (process.env.NODE_ENV !== 'production') {
    dataDef.set = function (newData: Object) {
      warn(
        'Avoid replacing instance root $data. ' +
        'Use nested data properties instead.',
        this
      )
    }
    propsDef.set = function () {
      warn(`$props is readonly.`, this)
    }
  }
  Object.defineProperty(Vue.prototype, '$data', dataDef)
  Object.defineProperty(Vue.prototype, '$props', propsDef)

  Vue.prototype.$set = set
  Vue.prototype.$delete = del

  Vue.prototype.$watch = function (
    expOrFn: string | Function, // 一般来说是字符串，即watch的key
    cb: any, // 一般来说是funcion
    options ?: Object // watch的选项
  ): Function {
    const vm: Component = this
    // 发过cd是对象，调用createWatcher
    if (isPlainObject(cb)) {
      return createWatcher(vm, expOrFn, cb, options)
    }
    options = options || {}
    // 标识这是用户写的watch
    options.user = true
    // 创建watcher
    const watcher = new Watcher(vm, expOrFn, cb, options)
    // 如果是立即求值，直接调用cb
    if (options.immediate) {
      cb.call(vm, watcher.value)
    }
    // 返回一个解除watch的函数
    return function unwatchFn () {
      watcher.teardown()
    }
  }
}

````