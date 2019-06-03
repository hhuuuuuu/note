function reConstructBinaryTree(pre, vin) {
    // write code here
    let tree = re(0, vin.length, vin, pre);
    tree.val = pre[0];
}


function re(left, right, vin, pre) {
    let pNode;
    for (let i = 0; i < pre.length; i++) {
        for (let j = left; j <= right; j++) {
            if (pre[i] === vin[j] && !pNode) {
                pNode = pre[i];
            }
        }
    }
    if (left === right) {
        return {val: pNode};
    }

    for (let i = left; i <= right; i++) {
        if (vin[i] === pNode) {
            let leftTree = re(left, i - 1, vin, pre);
            let rightTree = re(i + 1, right, vin, pre);
            return {left: leftTree, right: rightTree, val: pNode};
        }
    }
}

reConstructBinaryTree([1, 2, 3, 4, 5, 6, 7], [3, 2, 4, 1, 6, 5, 7])