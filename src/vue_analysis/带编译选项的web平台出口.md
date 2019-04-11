# 带编译的web平台入口 [https://github.com/vuejs/vue/blob/dev/src/platforms/web/entry-runtime-with-compiler.js](https://github.com/vuejs/vue/blob/dev/src/platforms/web/entry-runtime-with-compiler.js)

这个文件是导出web平台带编译模板的入口,我们先看这个文件都做了哪些工作。

```` javascript
// 导入vue的一些配置选项
import config from 'core/config'
// 导入warn和cached函数
import {
  warn,
  cached
} from 'core/util/index'
// 性能统计的函数
import {
  mark,
  measure
} from 'core/util/perf'

// 运行时的vue，就是我们平时webpack打包后在线上运行，去除模板编译函数的。
import Vue from './runtime/index'
// query函数，用来查询挂载的dom节点
import {
  query
} from './util/index'
// 将模板编译成函数
import {
  compileToFunctions
} from './compiler/index'
// 编译模板相关
import {
  shouldDecodeNewlines,
  shouldDecodeNewlinesForHref
} from './util/compat'

// 使这个查询innerHtml的纯函数具有缓存的功能
// 比如两次调用idToTemplate('a'), 第二次直接返回结果， 不会再去执行query。
const idToTemplate = cached(id => {
  const el = query(id)
  return el && el.innerHTML
})

// 缓存原始的Vue.prototype.$mount函数
const mount = Vue.prototype.$mount
// 重新设置Vue.prototype.$mount
// 主要是将template编译为render函数
Vue.prototype.$mount = function (
  el ?: string | Element, // vue挂载的元素
  hydrating ?: boolean // 服务端相关, 暂时不去理解。
): Component {
  // 查询真实的dom节点
  el = el && query(el)

  // el如果是body或者document,在非生产环境warn,之后return当前instance、
  // 所以我们不能将vue挂载到dody或者document上， 主要是vue会把挂载的节点替换掉
  if (el === document.body || el === document.documentElement) {
    process.env.NODE_ENV !== 'production' && warn(
      `Do not mount Vue to <html> or <body> - mount to normal elements instead.`
    )
    return this
  }
  
  // 这个options是vue默认的options和我们传入options合并之后的。
  // 合并发生在vue的init函数里。
  const options = this.$options
  // 如果没有render函数，使用template的写法
  if (!options.render) {
    let template = options.template

    // 对template的多种情况进行不同的处理
    // 我们平常写template都不在在里面的逻辑进行处理
    if (template) {
      if (typeof template === 'string') {
        // 如果template是以#开始, vue认为只是一个id，会去查找真实节点的innerHtml作为模板
        if (template.charAt(0) === '#') {
          template = idToTemplate(template)
          // 如果没有会在开发环境提示用户
          if (process.env.NODE_ENV !== 'production' && !template) {
            warn(
              `Template element not found or is empty: ${options.template}`,
              this
            )
          }
        }
      } else if (template.nodeType) {
        // 如果是真实dom， 直接取innerHtml  
        template = template.innerHTML
      } else {
        if (process.env.NODE_ENV !== 'production') {
          warn('invalid template option:' + template, this)
        }
        return this
      }
    } else if (el) {
      // 获取outerHmlt作为template
      template = getOuterHTML(el)
    }
    if (template) {
       // 性能统计
      if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
        mark('compile')
      }

      // 将template转化为render函数，
      // 我们的线上环境都是在webpack打包过程中转化template为render函数了。
      // 我们直接写render函数是不是build会快些？🤣
      // 具体是如何编译我们暂时不去了解，我们目前分析render函数的。
      const {
        render,
        staticRenderFns
      } = compileToFunctions(template, {
        shouldDecodeNewlines, // 对不同浏览器做兼容
        shouldDecodeNewlinesForHref, // 对不同浏览器做兼容
        delimiters: options.delimiters, // ref: https://cn.vuejs.org/v2/api/#delimiters
        comments: options.comments // ref: https://cn.vuejs.org/v2/api/#comments
      }, this)
      // 将render函数和staticRenderFns放到实例的options上
      options.render = render
      options.staticRenderFns = staticRenderFns

      /* istanbul ignore if */
      // 性能统计结束
      if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
        mark('compile end')
        measure(`vue ${this._name} compile`, 'compile', 'compile end')
      }
    }
  }
  // 执行runTime的vue实例的mount函数
  return mount.call(this, el, hydrating)
}

/**
 * Get outerHTML of elements, taking care
 * of SVG elements in IE as well.
 */
function getOuterHTML (el: Element): string {
  if (el.outerHTML) {
    return el.outerHTML
  } else {
    const container = document.createElement('div')
    container.appendChild(el.cloneNode(true))
    return container.innerHTML
  }
}

// 编译函数挂载到vue上, 估计是供外部工具调用
// 猜测vue-loader使用了这个
Vue.compile = compileToFunctions

// 导出vue
export default Vue
````