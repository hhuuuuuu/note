# mergeOptions

````javascript

import config from '../config'
import {
  warn
} from './debug'
import {
  nativeWatch
} from './env'
import {
  set
} from '../observer/index'

import {
  ASSET_TYPES,
  LIFECYCLE_HOOKS
} from 'shared/constants'

import {
  extend,
  hasOwn,
  camelize,
  toRawType,
  capitalize,
  isBuiltInTag,
  isPlainObject
} from 'shared/util'

/**
 * Option overwriting strategies are functions that handle
 * how to merge a parent option value and a child option
 * value into the final value.
 */
const strats = config.optionMergeStrategies // = Object.create(null)

/**
 * Options with restrictions
 */
 // 开发环境提醒
 // el 和 propsData 不属于new Vue的options
 // 应该是在创建组件的时候才有el和propsData
 // 合并规则为覆盖key
if (process.env.NODE_ENV !== 'production') {
  strats.el = strats.propsData = function (parent, child, vm, key) {
    if (!vm) {
      warn(
        `option "${key}" can only be used during instance ` +
        'creation with the `new` keyword.'
      )
    }
    return defaultStrat(parent, child)
  }
}

/**
 * Helper that recursively merges two data objects together.
 */
 // 递归吧from的值赋值到to
function mergeData (to: Object, from: ? Object): Object {
  if (!from) return to
  let key, toVal, fromVal
  const keys = Object.keys(from)
  for (let i = 0; i < keys.length; i++) {
    key = keys[i]
    toVal = to[key]
    fromVal = from[key]
    if (!hasOwn(to, key)) {
      set(to, key, fromVal)
    } else if (isPlainObject(toVal) && isPlainObject(fromVal)) {
      mergeData(toVal, fromVal)
    }
  }
  return to
}

// data并非一定要是function，
// 但是如果为object会导致不同的vue实例引用同一份data
// 有vm的情况下一定返回function, 但是没有vm的情况下，Object、function
export function mergeDataOrFn (
  parentVal: any,
  childVal: any,
  vm ?: Component
): ? Function {
  // 继承不一定会有vm， 例如Vue.extend
  if (!vm) {
    // in a Vue.extend merge, both should be functions
    if (!childVal) {
      return parentVal
    }
    if (!parentVal) {
      return childVal
    }
    // when parentVal & childVal are both present,
    // we need to return a function that returns the
    // merged result of both functions... no need to
    // check if parentVal is a function here because
    // it has to be a function to pass previous merges.
    return function mergedDataFn () {
      return mergeData(
        typeof childVal === 'function' ? childVal.call(this, this) : childVal,
        typeof parentVal === 'function' ? parentVal.call(this, this) : parentVal
      )
    }
  } else { // 实例化调用
    return function mergedInstanceDataFn () {
      // instance merge
      const instanceData = typeof childVal === 'function'
        ? childVal.call(vm, vm)
        : childVal
      const defaultData = typeof parentVal === 'function'
        ? parentVal.call(vm, vm)
        : parentVal
      if (instanceData) {
        return mergeData(instanceData, defaultData)
      } else {
        return defaultData
      }
    }
  }
}

// data的合并规则
strats.data = function (
  parentVal: any,
  childVal: any,
  vm ?: Component
): ? Function {
  if (!vm) {
    if (childVal && typeof childVal !== 'function') {
      process.env.NODE_ENV !== 'production' && warn(
        'The "data" option should be a function ' +
        'that returns a per-instance value in component ' +
        'definitions.',
        vm
      )

      return parentVal
    }
    return mergeDataOrFn(parentVal, childVal)
  }

  return mergeDataOrFn(parentVal, childVal, vm)
}

/**
 * Hooks and props are merged as arrays.
 */
 // 返回钩子数组
 // 执行顺序 child < parent < extends < mixins, 和优先级相反
function mergeHook (
  parentVal: ? Array<Function>, // vue 默认没有hook，所以parent一定为array
  childVal: ? Function | ? Array<Function>
): ? Array< Function> {
  return childVal
    ? parentVal
      ? parentVal.concat(childVal)
      : Array.isArray(childVal)
        ? childVal
        : [childVal]
    : parentVal
}

// [  'beforeCreate',
//   'created',
//   'beforeMount',
//   'mounted',
//   'beforeUpdate',
//   'updated',
//   'beforeDestroy',
//   'destroyed',
//   'activated',
//   'deactivated',
//   'errorCaptured']
LIFECYCLE_HOOKS.forEach(hook => {
  strats[hook] = mergeHook
})

/**
 * Assets
 *
 * When a vm is present (instance creation), we need to do
 * a three-way merge between constructor options, instance
 * options and parent options.
 */
 // 合并方式继承
function mergeAssets (
  parentVal: ? Object,
  childVal: ? Object,
  vm ?: Component,
  key: string
): Object {
  const res = Object.create(parentVal || null)
  if (childVal) {
    process.env.NODE_ENV !== 'production' && assertObjectType(key, childVal, vm)
    return extend(res, childVal)
  } else {
    return res
  }
}

// [  'component',
//   'directive',
//   'filter']
ASSET_TYPES.forEach(function (type) {
  strats[type + 's'] = mergeAssets
})

/**
 * Watchers.
 *
 * Watchers hashes should not overwrite one
 * another, so we merge them as arrays.
 */
 // watch会合并成{key: function | Array<function>}
strats.watch = function (
  parentVal: ? Object,
  childVal: ? Object,
  vm ?: Component,
  key: string
): ? Object {
  // work around Firefox's Object.prototype.watch...
  // 修复在firefox上的bug
  if (parentVal === nativeWatch) parentVal = undefined
  if (childVal === nativeWatch) childVal = undefined
  /* istanbul ignore if */
  if (!childVal) return Object.create(parentVal || null)
  if (process.env.NODE_ENV !== 'production') {
    assertObjectType(key, childVal, vm)
  }
  if (!parentVal) return childVal
  const ret = {}
  extend(ret, parentVal)
  for (const key in childVal) {
    let parent = ret[key]
    const child = childVal[key]
    if (parent && !Array.isArray(parent)) {
      parent = [parent]
    }
    ret[key] = parent
      ? parent.concat(child)
      : Array.isArray(child) ? child : [child]
  }
  return ret
}

/**
 * Other object hashes.
 */
 // 继承
strats.props =
  strats.methods =
  strats.inject =
  strats.computed = function (
    parentVal: ? Object,
    childVal: ? Object,
    vm ?: Component,
    key: string
  ): ? Object {
    if (childVal && process.env.NODE_ENV !== 'production') {
      assertObjectType(key, childVal, vm)
    }
    if (!parentVal) return childVal
    const ret = Object.create(null)
    extend(ret, parentVal)
    if (childVal) extend(ret, childVal)
    return ret
  }
  // 和data处理方式一样
strats.provide = mergeDataOrFn

/**
 * Default strategy.
 */
const defaultStrat = function (parentVal: any, childVal: any): any {
  return childVal === undefined
    ? parentVal
    : childVal
}

/**
 * Validate component names
 */
function checkComponents (options: Object) {
  for (const key in options.components) {
    validateComponentName(key)
  }
}

export function validateComponentName (name: string) {
  if (!/^[a-zA-Z][\w-]*$/.test(name)) {
    warn(
      'Invalid component name: "' + name + '". Component names ' +
      'can only contain alphanumeric characters and the hyphen, ' +
      'and must start with a letter.'
    )
  }
  if (isBuiltInTag(name) || config.isReservedTag(name)) {
    warn(
      'Do not use built-in or reserved HTML elements as component ' +
      'id: ' + name
    )
  }
}

/**
 * Ensure all props option syntax are normalized into the
 * Object-based format.
 */

// 规范为{a: {},b {}}这种形式
function normalizeProps (options: Object, vm: ? Component) {
  const props = options.props
  if (!props) return
  const res = {}
  let i, val, name
  if (Array.isArray(props)) {
    i = props.length
    while (i--) {
      val = props[i]
      if (typeof val === 'string') {
        name = camelize(val)
        res[name] = {
          type: null
        }
      } else if (process.env.NODE_ENV !== 'production') {
        warn('props must be strings when using array syntax.')
      }
    }
  } else if (isPlainObject(props)) {
    for (const key in props) {
      val = props[key]
      name = camelize(key)
      res[name] = isPlainObject(val)
        ? val : {
          type: val
        }
    }
  } else if (process.env.NODE_ENV !== 'production') {
    warn(
      `Invalid value for option "props": expected an Array or an Object, ` +
      `but got ${toRawType(props)}.`,
      vm
    )
  }
  options.props = res
}

/**
 * Normalize all injections into Object-based format
 */
function normalizeInject (options: Object, vm: ? Component) {
  const inject = options.inject
  if (!inject) return
  const normalized = options.inject = {}
  if (Array.isArray(inject)) {
    for (let i = 0; i < inject.length; i++) {
      normalized[inject[i]] = {
        from: inject[i]
      }
    }
  } else if (isPlainObject(inject)) {
    for (const key in inject) {
      const val = inject[key]
      normalized[key] = isPlainObject(val)
        ? extend({
          from: key
        }, val) : {
          from: val
        }
    }
  } else if (process.env.NODE_ENV !== 'production') {
    warn(
      `Invalid value for option "inject": expected an Array or an Object, ` +
      `but got ${toRawType(inject)}.`,
      vm
    )
  }
}

/**
 * Normalize raw function directives into object format.
 */
function normalizeDirectives (options: Object) {
  const dirs = options.directives
  if (dirs) {
    for (const key in dirs) {
      const def = dirs[key]
      if (typeof def === 'function') {
        dirs[key] = {
          bind: def,
          update: def
        }
      }
    }
  }
}

function assertObjectType (name: string, value: any, vm: ? Component) {
  if (!isPlainObject(value)) {
    warn(
      `Invalid value for option "${name}": expected an Object, ` +
      `but got ${toRawType(value)}.`,
      vm
    )
  }
}

/**
 * Merge two option objects into a new one.
 * Core utility used in both instantiation and inheritance.
 */
 // 合并options
 // 优先级 child > parent > extends > mixins
export function mergeOptions (
  parent: Object, // vue,以及vue子构造函数的options
  child: Object,
  vm ?: Component // vue 实例
): Object {
  // 检查opitons.components里的名字是否合法
  if (process.env.NODE_ENV !== 'production') {
    checkComponents(child)
  }

  // child也可以为一个带有options的函数
  if (typeof child === 'function') {
    child = child.options
  }

  // 规范化props
  // 最终规范为{key: {type, default?, required?}}
  normalizeProps(child, vm)
  // 规范化inject
  // 最终规范为{key: {from, default?}}
  normalizeInject(child, vm)
  // 规范化directives
  // 最终规范为{bind, update, inserted?, componentUpdated?, unbind?}
  normalizeDirectives(child)

  // 从下面来看，extends和mixins并没有多大的区别, 但是可以看出extends的优先级大于mixins  
  // 处理extends，递归调用mergeOptions
  // extends 钩子按照传入顺序依次调用，并在调用组件自身的钩子之前被调用。
  const extendsFrom = child.extends
  if (extendsFrom) {
    parent = mergeOptions(parent, extendsFrom, vm)
  }
  // 处理mixins， 递归调用mergeOptions
  // Mixin 钩子按照传入顺序依次调用，并在调用组件自身的钩子之前被调用。
  if (child.mixins) {
    for (let i = 0, l = child.mixins.length; i < l; i++) {
      parent = mergeOptions(parent, child.mixins[i], vm)
    }
  }
  // 合并parnet和child
  const options = {}
  let key
  for (key in parent) {
    mergeField(key)
  }
  for (key in child) {
    if (!hasOwn(parent, key)) {
      mergeField(key)
    }
  }

  // 因为合并不是简单的key覆盖
  // 这个函数的作用就是根据不同的key实行不同的合并规则  
  function mergeField (key) {
    const strat = strats[key] || defaultStrat
    options[key] = strat(parent[key], child[key], vm, key)
  }
  return options
}
````