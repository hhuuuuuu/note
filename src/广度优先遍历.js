function PrintFromTopToBottom(root) {
    let queue = [];
    let result = [];
    if (!root) {
        result = [];
    }else{
        queue.push(root);
        while (queue.length) {
            let node = queue.shift();
            result.push(node.val);
            node.left && queue.push(node.left);
            node.right && queue.push(node.right);
        }
    }
    return result
}

console.log(PrintFromTopToBottom({
    val: 1,
    left: {
        val: 2,
        left: {
            val: 3
        }
    },
    right:{
        val: 4,
        left: {
            val: 5
        }
    }
}))


// var x = 2;

// {
//     console.log(x);
//     let x = 1;
// }