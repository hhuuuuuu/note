
# vue构造函数上的属性

````javascript

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