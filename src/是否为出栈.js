function IsPopOrder(pushV, popV) {
    let i = 0;
    let j = -1;
    let arr = [];
    let l = popV.length - 1;

    for (let item of pushV) {
        if (item !== popV[i]) {
            arr.push(item);
            j++;
        } else {
            i++;
        }
    }
    if (i - 1 < l) {
        for (i; i <= l; i++) {
            if (popV[i] !== arr[j]) {
                return false
            } else {
                j--;
            }
        }
        return true
    } else {
        return !arr.length
    }
}
console.log(IsPopOrder([1,2], [2,1]))