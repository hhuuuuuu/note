### thunk函数(分步骤执行)

传统版本带callBack的异步操作

````javascript
//read file
fs.readFile(fileName, callBack);
````

thunk版

````javascript
//thunk
let readFileThunk = function(fileName){
    return function(callback){
        fs.readFile(fileName, callBack)
    }
};
readFileThunk(fileName)(callBack);
````

简单版thunk转换器

````javascript 
//fn 需要转化的函数
function thunk (fn){
    return function(){
        var args = Object.prototype.slice.call(arguments);
        return function(callBack){
            args.push(callBack);
            fn.apply(null, args);
        }
    }
}
````