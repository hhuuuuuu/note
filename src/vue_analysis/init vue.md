# init Vue

```` javascript
// 这里引入的配置和开发环境有关
import config from '../config'
// 初始化代理
import {
  initProxy
} from './proxy'
// 初始化state
import {
  initState
} from './state'
// 初始化render
import {
  initRender
} from './render'
// 初始化events
import {
  initEvents
} from './events'
// 性能统计
import {
  mark,
  measure
} from '../util/perf'
// 初始化生命周期以及调用钩子函数的函数
import {
  initLifecycle,
  callHook
} from './lifecycle'
// 初始化provide injection
import {
  initProvide,
  initInjections
} from './inject'
// 继承，合并，规范函数
import {
  extend,
  mergeOptions,
  formatComponentName
} from '../util/index'

// 每一个vue实例的id
let uid = 0

export function initMixin(Vue: Class < Component > ) {
  // options 就是我们平时写的vue配置  
  Vue.prototype._init = function (options ? : Object) {
    const vm: Component = this
    // a uid
    vm._uid = uid++

    let startTag, endTag
    // 性能统计
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
      startTag = `vue-perf-start:${vm._uid}`
      endTag = `vue-perf-end:${vm._uid}`
      mark(startTag)
    }

    // a flag to avoid this being observed
    // 如果有_isVue的标识，不能被观测
    vm._isVue = true
    // 创建内部组件
    if (options && options._isComponent) {
      // optimize internal component instantiation
      // since dynamic options merging is pretty slow, and none of the
      // internal component options needs special treatment.
      initInternalComponent(vm, options)
    } else {
      // 1.合并Vue.options和用户写的options
      // 2.校验用户options写的是否合法
      // 3.规范为最终使用的$options
      // ref ./mergeOptions.md
      vm.$options = mergeOptions(
        // 获取实例构造函数上的options  
        resolveConstructorOptions(vm.constructor), // vm.constructor 为Vue和vue的子构造函数
        options || {},
        vm
      )
    }
    // 添加vm._renderProxy = vm;
    // 这个代理对象有关，在开发环境利用一些高版本浏览器的特性。
    if (process.env.NODE_ENV !== 'production') {
      initProxy(vm)
    } else {
      vm._renderProxy = vm
    }
    // expose real self
    vm._self = vm
    // ref ./lifeCycle.md
    initLifecycle(vm)
    // ref ./events.md
    initEvents(vm)
    // ref ./render.md
    initRender(vm)
    // 执行钩子函数
    callHook(vm, 'beforeCreate')
    // ref ./inject.md
    initInjections(vm) // resolve injections before data/props
    // ref ./state.md
    initState(vm)
    // .ref ./inject.md
    initProvide(vm) // resolve provide after data/props
    // 执行钩子函数
    callHook(vm, 'created')

    // 性能相关
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
      vm._name = formatComponentName(vm, false)
      mark(endTag)
      measure(`vue ${vm._name} init`, startTag, endTag)
    }

    // mount vue
    if (vm.$options.el) {
      vm.$mount(vm.$options.el)
    }
  }
}

// 处理子组件的options
export function initInternalComponent(vm: Component, options: InternalComponentOptions) {
  const opts = vm.$options = Object.create(vm.constructor.options)
  // doing this because it's faster than dynamic enumeration.
  const parentVnode = options._parentVnode // 当前实例的$vnode
  opts.parent = options.parent // 当前实例
  opts._parentVnode = parentVnode

  const vnodeComponentOptions = parentVnode.componentOptions
  opts.propsData = vnodeComponentOptions.propsData
  opts._parentListeners = vnodeComponentOptions.listeners
  opts._renderChildren = vnodeComponentOptions.children
  opts._componentTag = vnodeComponentOptions.tag

  if (options.render) {
    opts.render = options.render
    opts.staticRenderFns = options.staticRenderFns
  }
}

// Ctor为Vue和其子构造函数
// 更新自身的option以及返回
export function resolveConstructorOptions(Ctor: Class < Component > ) {
  let options = Ctor.options
  if (Ctor.super) { // 可以确定此构造函数为vue子构造函数
    // 递归调用，返回其父构造的的options
    const superOptions = resolveConstructorOptions(Ctor.super)
    const cachedSuperOptions = Ctor.superOptions // 在Vue.extends是会给Ctor添加superOptions Ctor.superOptions = Super.options
    if (superOptions !== cachedSuperOptions) { // 如果父组件执行了Vue.mixin, 在创建组件的时候用到了此方法
      // super option changed,
      // need to resolve new options.
      Ctor.superOptions = superOptions // 改变就重新赋值喽
      // check if there are any late-modified/attached options (#4976)
      const modifiedOptions = resolveModifiedOptions(Ctor)
      // update base extend options
      if (modifiedOptions) {
        extend(Ctor.extendOptions, modifiedOptions)
      }
      options = Ctor.options = mergeOptions(superOptions, Ctor.extendOptions)
      if (options.name) {
        options.components[options.name] = Ctor
      }
    }
  }
  return options
}

function resolveModifiedOptions(Ctor: Class < Component > ): ? Object {
  let modified
  const latest = Ctor.options
  const extended = Ctor.extendOptions
  const sealed = Ctor.sealedOptions
  for (const key in latest) {
    if (latest[key] !== sealed[key]) {
      if (!modified) modified = {}
      modified[key] = dedupe(latest[key], extended[key], sealed[key])
    }
  }
  return modified
}

function dedupe(latest, extended, sealed) {
  // compare latest and sealed to ensure lifecycle hooks won't be duplicated
  // between merges
  if (Array.isArray(latest)) {
    const res = []
    sealed = Array.isArray(sealed) ? sealed : [sealed]
    extended = Array.isArray(extended) ? extended : [extended]
    for (let i = 0; i < latest.length; i++) {
      // push original options and not sealed options to exclude duplicated options
      if (extended.indexOf(latest[i]) >= 0 || sealed.indexOf(latest[i]) < 0) {
        res.push(latest[i])
      }
    }
    return res
  } else {
    return latest
  }
}

````