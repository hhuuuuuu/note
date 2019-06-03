# inject

````javascript
import {
  hasOwn
} from 'shared/util'
import {
  warn,
  hasSymbol
} from '../util/index'
import {
  defineReactive,
  toggleObserving
} from '../observer/index'

export function initProvide (vm: Component) {
  const provide = vm.$options.provide
  if (provide) {
    vm._provided = typeof provide === 'function'
      ? provide.call(vm)
      : provide
  }
}


export function initInjections (vm: Component) {
  const result = resolveInject(vm.$options.inject, vm)
  if (result) {
    toggleObserving(false) // 禁止深度观测
    Object.keys(result).forEach(key => {
      /* istanbul ignore else */
      if (process.env.NODE_ENV !== 'production') {
        defineReactive(vm, key, result[key], () => {
          warn(
            `Avoid mutating an injected value directly since the changes will be ` +
            `overwritten whenever the provided component re-renders. ` +
            `injection being mutated: "${key}"`,
            vm
          )
        })
      } else {
        // 复制到实例上，并且为响应式。 但不是deep toggleObserving(false)
        // ref https://cn.vuejs.org/v2/api/#provide-inject
        // 这就是为什么文档说provide 和 inject 绑定并不是可响应的
        defineReactive(vm, key, result[key])
      }
    })
    toggleObserving(true)
  }
}

// 从父组件获取值
export function resolveInject (inject: any, vm: Component): ? Object {
  if (inject) {
    // inject is :any because flow is not smart enough to figure out cached
    const result = Object.create(null)
    // 这里使用Reflect.ownKeys的原因是Object.keys 不能访问到symbol为key的属性
    const keys = hasSymbol
      ? Reflect.ownKeys(inject).filter(key => {
        /* istanbul ignore next */
        return Object.getOwnPropertyDescriptor(inject, key).enumerable
      })
      : Object.keys(inject)

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      const provideKey = inject[key].from
      let source = vm
      while (source) {
        if (source._provided && hasOwn(source._provided, provideKey)) {
          result[key] = source._provided[provideKey]
          break
        }
        source = source.$parent
      }
      // 处理default
      if (!source) {
        if ('default' in inject[key]) {
          const provideDefault = inject[key].default
          result[key] = typeof provideDefault === 'function'
            ? provideDefault.call(vm)
            : provideDefault
        } else if (process.env.NODE_ENV !== 'production') {
          warn(`Injection "${key}" not found`, vm)
        }
      }
    }
    return result
  }
}

````