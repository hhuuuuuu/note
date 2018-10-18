
const a = [1,5,6,7,50,8,9,30,1,90];

function quickSort(left, right) {
    if (left >= right) return;
    let i = left;
    let j = right;
    let mid = left;
    let temp = a[mid];
    while(j !== i){
        //未相遇之前找到小于mid的
        while (a[j] >= temp && j > i){
            j--;
        }
        //未相遇之前找到大于mid的
        while (a[i] <= temp && i < j){
            i++;
        }
        if(i < j){
            //交换
            let t = a[j];
            a[j] = a[i]
            a[i] = t;
        }
    }
    a[mid] = a[j];
    a[j] = temp;
    quickSort(left, i - 1);
    quickSort(i + 1, right);
}

quickSort(0, a.length - 1);
console.log(a);