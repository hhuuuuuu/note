# watcher

````javascript

import {
  warn,
  remove,
  isObject,
  parsePath,
  _Set as Set,
  handleError
} from '../util/index'

import { traverse } from './traverse'
import { queueWatcher } from './scheduler'
import Dep, { pushTarget, popTarget } from './dep'

import type { SimpleSet } from '../util/index'

let uid = 0

/**
 * A watcher parses an expression, collects dependencies,
 * and fires callback when the expression value changes.
 * This is used for both the $watch() api and directives.
 */
export default class Watcher {
  vm: Component; // vue 实例
  expression: string; // expOrFn.toString() 用于开发环境提示
  cb: Function; // watche求值之后的回调，我们常见的就是watch的handle方法
  id: number; // id
  deep: boolean; // 是否为deep watcher
  user: boolean; // watcher是否为用户创建 watch 和 vm.$watch此值为true
  lazy: boolean; // 是否为惰性求值 计算属性此值为true
  sync: boolean; // 是否为同步更新
  dirty: boolean; // 标识依赖项有没有变化，用于computed
  active: boolean; // 如果为false，表明此watcher已经被解除
  deps: Array<Dep>; // 订阅的发布者列表,即依赖列表
  newDeps: Array<Dep>; // 新的订阅的发布者列表
  depIds: SimpleSet; // 订阅的发布者id列表
  newDepIds: SimpleSet; // 新的订阅的发布者id列表
  before: ?Function; // flushSchedulerQueue函数中调用
  getter: Function; // 求值函数
  value: any; // getter的返回值

  constructor (
    vm: Component,
    expOrFn: string | Function,
    cb: Function,
    options?: ?Object,
    isRenderWatcher?: boolean // 是否为render函数watcher
  ) {
    this.vm = vm // 实例
    // 如果是render函数
    if (isRenderWatcher) {
      vm._watcher = this
    }
    vm._watchers.push(this)
    // watch的选项 computed {lazy: true} watch {user: true, deep?: true}
    if (options) {
      this.deep = !!options.deep
      this.user = !!options.user
      this.lazy = !!options.lazy
      this.sync = !!options.sync
      this.before = options.before
    } else {
      this.deep = this.user = this.lazy = this.sync = false
    }
    this.cb = cb
    this.id = ++uid // uid for batching
    this.active = true
    this.dirty = this.lazy // for lazy watchers
    this.deps = []
    this.newDeps = []
    this.depIds = new Set()
    this.newDepIds = new Set()
    this.expression = process.env.NODE_ENV !== 'production'
      ? expOrFn.toString()
      : ''
    // 解析出getter函数, 求值函数
    if (typeof expOrFn === 'function') {
      this.getter = expOrFn
    } else {
      // 例如watch method name可以写成 'a.b.c.' 
      this.getter = parsePath(expOrFn)
      if (!this.getter) {
        this.getter = function () {}
        process.env.NODE_ENV !== 'production' && warn(
          `Failed watching path: "${expOrFn}" ` +
          'Watcher only accepts simple dot-delimited paths. ' +
          'For full control, use a function instead.',
          vm
        )
      }
    }
    // 如果为非惰性求职，立即间接执行getter函数
    this.value = this.lazy
      ? undefined
      : this.get()
  }

  // 求值，收集依赖
  get () {
    // 修改当前wather target  
    pushTarget(this)
    let value
    const vm = this.vm
    try {
      // 这里会触发响应式的get，从而收集依赖 dep.depend->this.addDep-> dep.addSub
      value = this.getter.call(vm, vm)
    } catch (e) {
      // 如果是用户创建的watcher，提示用户  
      if (this.user) {
        handleError(e, vm, `getter for watcher "${this.expression}"`)
      } else {
        throw e
      }
    } finally {
      // 如果是deep watcher，递归调用value的每一个属性，收集这个对象的所有依赖
      if (this.deep) {
        traverse(value)
      }
      // 修改watcher target为栈顶元素
      popTarget()
      this.cleanupDeps()
    }
    return value
  }

  // watcher添加依赖
  // dep添加订阅者
  addDep (dep: Dep) {
    const id = dep.id
    if (!this.newDepIds.has(id)) {
      this.newDepIds.add(id)
      this.newDeps.push(dep)
      if (!this.depIds.has(id)) {
        dep.addSub(this)
      }
    }
  }

  // newDep赋值给oldDep
  // dep清理无用的的watcher
  cleanupDeps () {
    let i = this.deps.length
    while (i--) {
      const dep = this.deps[i]
      if (!this.newDepIds.has(dep.id)) {
        dep.removeSub(this)
      }
    }
    let tmp = this.depIds
    this.depIds = this.newDepIds
    this.newDepIds = tmp
    this.newDepIds.clear()
    tmp = this.deps
    this.deps = this.newDeps
    this.newDeps = tmp
    this.newDeps.length = 0
  }

  
  // 由dep.notify触发
  update () {
    /* istanbul ignore else */
    if (this.lazy) { // 将计算属性的dirty设为ture
      this.dirty = true
    } else if (this.sync) { // 是否同步跟新
      this.run()
    } else {
      // 异步执行watcher队列  
      queueWatcher(this)
    }
  }
  
  run () {
    // 如果watcher没有被解除  
    if (this.active) {
      // 求值  
      const value = this.get()
      // 1.新值不等于旧值
      // 2.是一个object
      // 3.为deep watch
      if (
        value !== this.value ||
        // Deep watchers and watchers on Object/Arrays should fire even
        // when the value is the same, because the value may
        // have mutated.
        isObject(value) ||
        this.deep
      ) {
        // set new value
        const oldValue = this.value
        this.value = value
        // 调用cb函数
        if (this.user) {
          try {
            this.cb.call(this.vm, value, oldValue)
          } catch (e) {
            handleError(e, this.vm, `callback for watcher "${this.expression}"`)
          }
        } else {
          this.cb.call(this.vm, value, oldValue)
        }
      }
    }
  }

  // 计算属性求值  
  evaluate () {
    this.value = this.get()
    this.dirty = false
  }

  // 计算属性的依赖收集watcher（订阅者）
  depend () {
    let i = this.deps.length
    while (i--) {
      this.deps[i].depend()
    }
  }

  // 解除watch
  teardown () {
    if (this.active) {
      // remove self from vm's watcher list
      // this is a somewhat expensive operation so we skip it
      // if the vm is being destroyed.
      if (!this.vm._isBeingDestroyed) {
        remove(this.vm._watchers, this)
      }
      let i = this.deps.length
      while (i--) {
        this.deps[i].removeSub(this)
      }
      this.active = false
    }
  }
}

````