# dep

````javascript
// 引入Watcher类型
import type Watcher from './watcher'
// 移除数组中的某一项
import { remove } from '../util/index'
// 引入基础的配置
import config from '../config'

// 每一个Dep实例的id
let uid = 0  

// 用来管理订阅者的一个类(这里的订阅者都是watcher对象)
export default class Dep {
  static target: ?Watcher; // 当前的订阅者
  id: number; // id
  subs: Array<Watcher>; // 订阅者集合

  // 初始化id和订阅者集合  
  constructor () {
    this.id = uid++
    this.subs = []
  }

  // 添加订阅者  
  addSub (sub: Watcher) {  
    this.subs.push(sub)
  }

  // 移除订阅者  
  removeSub (sub: Watcher) {
    remove(this.subs, sub)
  }

  // 间接调用addSub  
  depend () {
    if (Dep.target) {
      Dep.target.addDep(this)
    }
  }

  // 发布消息，订阅者update  
  notify () {
    // stabilize the subscriber list first
    const subs = this.subs.slice()
    if (process.env.NODE_ENV !== 'production' && !config.async) {
      // subs aren't sorted in scheduler if not running async
      // we need to sort them now to make sure they fire in correct
      // order
      subs.sort((a, b) => a.id - b.id)
    }
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update()
    }
  }
}

// 初始化 current target
Dep.target = null
// 初始化target stack
const targetStack = []

// 进栈
export function pushTarget (_target: ?Watcher) {
  if (Dep.target) targetStack.push(Dep.target)
  Dep.target = _target
}

// 出栈
export function popTarget () {
  Dep.target = targetStack.pop()
}

````