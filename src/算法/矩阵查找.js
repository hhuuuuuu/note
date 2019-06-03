//在一个二维数组中， 每一行都按照从左到右递增的顺序排序， 
//每一列都按照从上到下递增的顺序排序。 请完成一个函数， 
//输入这样的一个二维数组和一个整数， 判断数组中是否含有该整数。

//nlogn
function Find(target, array) {
    for (let i = 0; i < array.length; i++) {
        let b = array[i];
        let result = binSearch(0, b.length - 1, target, b);
        if (result !== -1) {
            return false;
        }
    }
}

function binSearch(left, right, target, arr) {
    if (left > right) return -1;
    let mid = Math.floor(((left + right) / 2));
    if (target < arr[mid]) {
        return binSearch(left, mid - 1, target, arr);
    } else if (target > arr[mid]) {
        return binSearch(mid + 1, right, target, arr);
    } else {
        return mid;
    }
}

//n
function Find2(target, array) {
    let i = 0;
    let j = array[i].length - 1;
    while(i < array.length && j > -1){
        if (target < array[i][j]) {       
            j --;
        } else if (target > array[i][j]) {
            i ++;
        }else{
            return true
        }
    }
    return false
}



console.log(Find2(5,[
    [1, 2, 8, 9],
    [2, 4, 9, 12],
    [4, 7, 10, 13],
    [6, 8, 11, 15, 28]
]))