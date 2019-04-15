# instance vue [https://github.com/vuejs/vue/blob/dev/src/core/instance/index.js](https://github.com/vuejs/vue/blob/dev/src/core/instance/index.js)

````javascript
import {
  initMixin
} from './init'
import {
  stateMixin
} from './state'
import {
  renderMixin
} from './render'
import {
  eventsMixin
} from './events'
import {
  lifecycleMixin
} from './lifecycle'
import {
  warn
} from '../util/index'

function Vue (options) {
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  this._init(options)
}

// 添加init方法
initMixin(Vue)

// 添加$props $data $watch $set $del属性
stateMixin(Vue)

// $on $once $emit $off
eventsMixin(Vue)

// _update $forceUpdate $destroy
lifecycleMixin(Vue)

// $nextTick _render
renderMixin(Vue)

export default Vue
````