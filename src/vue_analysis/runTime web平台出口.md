# runtime vue [https://github.com/vuejs/vue/blob/dev/src/platforms/web/runtime/index.js](https://github.com/vuejs/vue/blob/dev/src/platforms/web/runtime/index.js)

此文件导出运行时的vue,就是可以处理render函数，但是不能处理tmeplate的vue

```` javascript
// 引入核心的vue
import Vue from 'core/index'
// 引入相关配置
import config from 'core/config'
// 引入工具函数
import { extend, noop } from 'shared/util'
// 引入mountComponent函数
import { mountComponent } from 'core/instance/lifecycle'
// 引入工具函数
import { devtools, inBrowser, isChrome } from 'core/util/index'
// 引入web平台工具函数
import {
  query, // 查询节点
  mustUseProp, // 判断属性是不是必须绑定
  isReservedTag, // 是否是保留tag
  isReservedAttr, // 是否为保留属性
  getTagNamespace, // 获取tag的namespace
  isUnknownElement // 是否是未知的element
} from 'web/util/index'

// 引入用来对比虚拟node的patch函数
import { patch } from './patch'
// 引入平台相关的指令 {model, show}
import platformDirectives from './directives/index'
// 引入平台相关组件 {Transition, TransitionGroup}
import platformComponents from './components/index'

// 在vue.config添加各种工具函数
Vue.config.mustUseProp = mustUseProp
Vue.config.isReservedTag = isReservedTag
Vue.config.isReservedAttr = isReservedAttr
Vue.config.getTagNamespace = getTagNamespace
Vue.config.isUnknownElement = isUnknownElement

// install platform runtime directives & components
// 在vue.options上添加平台相关指令和组件
extend(Vue.options.directives, platformDirectives)
extend(Vue.options.components, platformComponents)

// 如果不是在浏览器的环境下vue原型上的patch函数为空
Vue.prototype.__patch__ = inBrowser ? patch : noop

// public mount method
// 添加runtime mount函数
Vue.prototype.$mount = function (
  el?: string | Element, // 节点
  hydrating?: boolean // 服务端相关
): Component {
  el = el && inBrowser ? query(el) : undefined
  // 执行mountComponent函数并返回
  return mountComponent(this, el, hydrating)
}

// devtools global hook
/* istanbul ignore next */
// 开发工具
if (inBrowser) {
  setTimeout(() => {
    if (config.devtools) {
      if (devtools) {
        devtools.emit('init', Vue)
      } else if (
        process.env.NODE_ENV !== 'production' &&
        process.env.NODE_ENV !== 'test' &&
        isChrome
      ) {
        console[console.info ? 'info' : 'log'](
          'Download the Vue Devtools extension for a better development experience:\n' +
          'https://github.com/vuejs/vue-devtools'
        )
      }
    }
    if (process.env.NODE_ENV !== 'production' &&
      process.env.NODE_ENV !== 'test' &&
      config.productionTip !== false &&
      typeof console !== 'undefined'
    ) {
      console[console.info ? 'info' : 'log'](
        `You are running Vue in development mode.\n` +
        `Make sure to turn on production mode when deploying for production.\n` +
        `See more tips at https://vuejs.org/guide/deployment.html`
      )
    }
  }, 0)
}
// 导出vue
export default Vue

````