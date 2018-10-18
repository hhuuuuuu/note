//输入一颗二叉树的跟节点和一个整数，
//打印出二叉树中结点值的和为输入整数的所有路径。
//路径定义为从树的根结点开始往下一直到叶结点所经过的结点形成一条路径。(注意: 在返回值的list中，数组长度大的数组靠前)



function FindPath(root, expectNumber) {
    let result = [];
    a(0 , root , expectNumber, [], result);
    return result;
}

function a(value, node, expectNumber, list, result) {
    if (!node) return;
    list = list.slice(0);
    let newVal = node.val + value;
    if (newVal < expectNumber) {
        list.push(node.val);
        a(newVal, node.left, expectNumber, list, result);
        a(newVal, node.right, expectNumber, list, result);
    } else if (newVal === expectNumber) {
        list.push(node.val);
        result.push(list);
    }
}

console.log(FindPath({
    left: {
        left: {
            val: 1,
        },
        val: 1
    },
    right: {
        val: 1
    },
    val: 1
}, 3))
