function Fibonacci(n)
{
    // write code here
    return f(n);
}
   
function f(n){
    if(n === 1 || n === 2){
        return 1;
    }else{
        return f(n - 1) + f(n - 2);
    }
}

console.log(Fibonacci(3))