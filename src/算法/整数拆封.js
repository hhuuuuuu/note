


// 写一个函数，列出一个整数所有的分解类型，比如对于数字4，可以做拆分得到下列字符串
// 1111
// 112
// 121
// 13
// 211
// 22
// 31
// 4
function f(n) {

    if(n === 1){
        return [[1]]
    }

    const result = [];

    for(let i = 1; i <=n ;i ++){
        if(i === n){
            result.push([i]);
        }else {
            f(n - i).forEach(item => {
                item.push(i);
                result.push(item);
            })
        }
    }
    return result;
}