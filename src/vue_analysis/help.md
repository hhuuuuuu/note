
# vue构造函数上的属性

````javascript
// _ 为私有属性
// $ 为共有属性

{
    // ref https://github.com/vuejs/vue/blob/dev/src/core/index.js
    version: '__VERSION__'
    FunctionalRenderContext: FunctionalRenderContext
    compile: compileToFunctions,
    prototype: {
        // ref https://github.com/vuejs/vue/blob/dev/src/platforms/web/runtime/index.js
        $mount,
        __patch__,
        // ref https://github.com/vuejs/vue/blob/dev/src/core/index.js
        $isServer: {
            get: isServerRendering
        },
        $ssrContext: {
                get () {
                /* istanbul ignore next */
                return this.$vnode && this.$vnode.ssrContext
            }
        },
        // ref https://github.com/vuejs/vue/blob/dev/src/core/instance/init.js
        _init,
        _isVue,
        _uid,
        _renderProxy: this,
        _self: this,
        $children: [vm]
        $parent: vm// from options parent
        $root: parent ? parent.$root : vm,
        $refs: {},
        _watcher: null,
        _watchers: [],
        _inactive: null,
        _directInactive: false,
        _isMounted: false,
        _isDestroyed: false,
        _isBeingDestroyed: false,
        _events: {
            key: [fn]
        },
        _hasHookEvent: hookRE.test(event),
        _vnode: null, // the root of the child tree
        _staticTrees: null, // v-once cached trees
        $vnode: this.options._parentVnode, // the placeholder node in parent tree
        $slots: {
            key: [vnode]
        },
        $scopedSlots: emptyObject,
        _c, // 用于模板
        $createElement, // 用于render 函数,
        $attrs: this.$vnode.data.attrs, // 响应式 非deep
        $listeners: this.options._parentListeners, // 响应式 非deep
        _computedWatchers: [watcher],
        _provided: $options.provide.call(this) || $options.provide
        $options: {
           render: (vm._renderProxy, vm.$createElement) => vnode, // render函数  
           _praentVnode: {
               data: {
                   scopedSlots
               }
           },
           props: {
                key: {
                    type,
                    default?,
                    required?
                }
           },
           inject: {
               key: {
                   from,
                   default?
               }
           }, // 最终将每一个key赋值到实例上，并且为响应式, 但不是deep。
           direactives: {
               key: {
                    bind,
                    update,
                    inserted?,
                    componentUpdated?,
                    unbind?
                }
           },
           el, // 子组件
           propsData // 子组件,
           data: () => {} || {},
           hook: []  // [  'beforeCreate','created', 'beforeMount','mounted','beforeUpdate', 'updated','beforeDestroy','destroyed','activated','deactivated','errorCaptured']
            components,
            filter,
            watch: {key: function | Array<function>},
            methods,
            computed,
            parent,
            _parentVnode,
            propsData, // vnodeComponentOptions.propsData
            _parentListeners, // vnodeComponentOptions.listeners
            _renderChildren, // vnodeComponentOptions.children
            _componentTag // vnodeComponentOptions.tag
            _base: vue,
            ...rest,
        },

        // ref https://github.com/vuejs/vue/blob/dev/src/core/instance/state.js
        $data: {
            get() {
                return this._data
            },
            set() {
                warn(
                'Avoid replacing instance root $data. ' +
                'Use nested data properties instead.',
                this
                )
            }
        },
        _data: {
            ___ob__: observer,
            key: {
                __ob__: observer
            } || simapleValue || [{__ob__: observer}]
        }, // 响应式deep 属性代理
        _props: {
            key: {
                __ob__: observer
            } || simapleValue || [{__ob__: observer}]
        }, // 响应式deep 属性代理
        _propKeys: [],
        $props: {
            get() {
                return this._props
            },
            set() {
                warn(`$props is readonly.`, this)
            }
        }，
        $set: set,
        $delete: del,
        $watch,
        // ref https://github.com/vuejs/vue/blob/dev/src/core/instance/event.js
        $on,
        $once,
        $off,
        $emit,
        // ref https://github.com/vuejs/vue/blob/dev/src/core/instance/lifecycle.js
        _update,
        $forceUpdate,
        $destory,
        // ref https://github.com/vuejs/vue/blob/dev/src/core/instance/render.js
        $nextTick,
        _render,
    },
    config: {
        // ref https://github.com/vuejs/vue/blob/dev/src/platforms/web/runtime/index.js
        mustUseProp,
        isReservedTag,
        isReservedAttr,
        getTagNamespace,
        isUnknownElement,
        // from initGlobalAPI
        // ref https://github.com/vuejs/vue/blob/dev/src/core/config.js
        /**
        * Option merge strategies (used in core/util/options)
        */
        optionMergeStrategies: Object.create(null),
        /**
        * Whether to suppress warnings.
        */
        silent: false,
        /**
        * Show production mode tip message on boot?
        */
        productionTip: process.env.NODE_ENV !== 'production',
        /**
        * Whether to enable devtools
        */
        devtools: process.env.NODE_ENV !== 'production',
        /**
        * Whether to record perf
        */
        performance: false,
        /**
        * Error handler for watcher errors
        */
        errorHandler: null,
        /**
        * Warn handler for watcher warns
        */
        warnHandler: null,
        /**
        * Ignore certain custom elements
        */
        ignoredElements: [],
        /**
        * Custom user key aliases for v-on
        */
        keyCodes: Object.create(null),
        /**
        * Check if a tag is reserved so that it cannot be registered as a
        * component. This is platform-dependent and may be overwritten.
        */
        isReservedTag: no,
        /**
        * Check if an attribute is reserved so that it cannot be used as a component
        * prop. This is platform-dependent and may be overwritten.
        */
        isReservedAttr: no,
        /**
        * Check if a tag is an unknown element.
        * Platform-dependent.
        */
        isUnknownElement: no,
        /**
        * Get the namespace of an element
        */
        getTagNamespace: noop,
        /**
        * Parse the real tag name for the specific platform.
        */
        parsePlatformTagName: identity,
        /**
        * Check if an attribute must be bound using property, e.g. value
        * Platform-dependent.
        */
        mustUseProp: no,
        /**
        * Perform updates asynchronously. Intended to be used by Vue Test Utils
        * This will significantly reduce performance if set to false.
        */
        async: true,
        /**
        * Exposed for legacy reasons
        */
        _lifecycleHooks: LIFECYCLE_HOOKS
    },
    // 参考实例$options
    options: {
        directives: {
            model, show
        },
        components: {
            // ref https://github.com/vuejs/vue/blob/dev/src/platforms/web/runtime/index.js
            Transition,
            TransitionGroup
        }
    }
}
````