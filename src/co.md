# co

回调地狱

````javascript
fs.readdir(source, function (err, files) {
  if (err) {
    console.log('Error finding files: ' + err)
  } else {
    files.forEach(function (filename, fileIndex) {
      console.log(filename)
      gm(source + filename).size(function (err, values) {
        if (err) {
          console.log('Error identifying file size: ' + err)
        } else {
          console.log(filename + ' : ' + values)
          aspect = (values.width / values.height)
          widths.forEach(function (width, widthIndex) {
            height = Math.round(width / aspect)
            console.log('resizing ' + filename + 'to ' + height + 'x' + height)
            this.resize(width, height).write(dest + 'w' + width + '_' + filename, function(err) {
              if (err) console.log('Error writing file: ' + err)
            })
          }.bind(this))
        }
      })
    })
  }
})
````

promise

````javascript
ajax().then(res=>{

}).then(res=>{

}).catch(err){

}
````

co

````javascript
co(function*(){
    let a = yield g1();
    //do something with a
    let b = yield g2();
    //do something with b
}).catch(e =>{
    //error handle
})
````

co实现

````javascript
//thunk版(yield后面返回是thunk函数)

function co(gen){
    var g = gen();
    return new Promise (function(resolve, reject){
        try{
            //next就是异步操作的callback
            next();
        }catch(e){
            reject(e);
        }
        function next(err, res){
            if(err){
                reject(err);
            }else{
                //next传值给上个yield
                let ret = g.next(res);
                if(ret.done){
                    resolve(res);
                }else{
                    ret.value(next);
                }
            }
        }
    })
}

//promise版(yield后面返回的是promise)

function co(gen){
    var g = gen();
    return new Promise (function(resolve, reject){
        try{
            next();
        }catch(e){
            reject(e);
        }
        function next(value){
           let ret = g.next(value);
           if(ret.done){
               resolve(ret.value)
           }else{
               ret.value.then(res =>{
                   next(res);
               }).catch(e =>{
                   reject(e);
               })
           }
        }
    })
}
````

# 异步终极解决方案(async await)

````javascript
(async function () {
    let b = await new Promise(function(resolve, reject){
        setTimeout(_ => {
            console.log(2);
            resolve(4);
        })
    })
    console.log(b)
})()
````