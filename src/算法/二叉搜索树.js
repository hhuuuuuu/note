//输入一个整数数组， 判断该数组是不是某二叉搜索树的后序遍历的结果。 如果是则输出Yes, 否则输出No。 假设输入的数组的任意两个数字都互不相同。


function VerifySquenceOfBST(sequence) {
    if (!sequence.length) {
        return false;
    }
    return a(sequence);
}


function a(sequence) {
    if (!sequence.length) {
        return true;
    }
    let root = sequence.pop();
    let right = [];
    let left = [];
    let handleRight = true;
    while (sequence.length) {
        let last = sequence.pop();
        if (handleRight) {
            if (last > root) {
                right.unshift(last);
            } else {
                sequence.push(last)
                handleRight = false;
            }
        } else {
            if (last < root) {
                left.unshift(last);
            } else {
                return false;
            }
        }
    }
    return (a(right) && a(left));
}

console.log(VerifySquenceOfBST([4, 8, 6, 12, 16, 14, 10]));