# core vue [https://github.com/vuejs/vue/blob/dev/src/core/index.js](https://github.com/vuejs/vue/blob/dev/src/core/index.js)

```` javascript
import Vue from './instance/index'
// 引入初始化全局api函数
import {
  initGlobalAPI
} from './global-api/index'
// 引入服务端端判断变量
import {
  isServerRendering
} from 'core/util/env'
// 引入函数组件context构造函数
import {
  FunctionalRenderContext
} from 'core/vdom/create-functional-component'

// 添加静态方法
initGlobalAPI(Vue)

// 添加$isServer属性get方法
Object.defineProperty(Vue.prototype, '$isServer', {
  get: isServerRendering
})

// 添加$ssrContext属性get方法
Object.defineProperty(Vue.prototype, '$ssrContext', {
  get () {
    /* istanbul ignore next */
    return this.$vnode && this.$vnode.ssrContext
  }
})

// 添加FunctionalRenderContext属性的value
Object.defineProperty(Vue, 'FunctionalRenderContext', {
  value: FunctionalRenderContext
})

// rollup打包时替换为vue的版本号
Vue.version = '__VERSION__'

export default Vue

````