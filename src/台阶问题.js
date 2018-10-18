function jumpFloor(number) {
    if (number === 1) {
        return 1
    } else if (number === 2) {
        return 2
    } else {
        return jumpFloor(number - 1) + jumpFloor(number - 2);
    }

    // let i = 3;
    // let result = 0;
    // let m = 1;
    // let n = 2;
    // if (number === 1) {
    //     return 1
    // } else if (number === 2) {
    //     return 2
    // }
    // while(i <= number){
    //     result  = m + n;
    //     m = n;
    //     n = result;
    //     i ++;
    // }
    // return result;
}

console.log(jumpFloor(5))