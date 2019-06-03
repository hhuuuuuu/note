# observer

````javascript
// observer
{
  value: any,
  dep: Dep,
  vmCount: number; // number of vms that has this object as root $data
}

// dep
{
  static target: Watcher | null,
  id: number,
  subs: Array<Watcher>,
  addSub: function,
  removeSub: function,
  depend: function,
  notify: function,
  
}
````