# generator(生成器,异步解决方案)

语法

````javascript
//生成器函数
function* gen1(){
    yield 1;
    yield 2;
    yield 3;
}

//生成器对象，同时也是可迭代对象，迭代器对象(具体解释MDN)
let g1 = gen1();

g1.next(); // {done: false, value: 1}
g1.next(); // {done: false, value 2}
g1.next(); //{done: false, value: 3}
g1.next(); //{done: true, value: undefined}
g1.next(); //{done: true, value: undefined}
````

提前return

````javascript
function* gen2(){
    yield 1;
    yield 2;
    return 0;
    yield 3;
}

let g2 = gen2();

g1.next(); // {done: false, value: 1}
g1.next(); // {done: false, value 2}
g1.next(); //{done: true, value: 0}
g1.next(); //{done: true, value: undefined}
````

yield 和　yield*

````javascript
function* gen1() {
    yield 2;
    yield 3;
    yield 4;
}
function* gen2() {
    yield 1;
    yield* gen1();
    yield 5;
}
for(var i of gen2()) {
    console.log(i); // 12345
}
````

yield* 表示将控制的权利交给后面的generator，和直接写在gen2里面一样。

[还有一些其他用法(例如next传值),推荐]http://www.alloyteam.com/2015/03/es6-generator-introduction/
