function Mirror(root) {
    if (!root) {
        return null;
    }
    if (root.left || root.right) {
        let temp = root.left;
        root.left = root.right;
        root.right = temp;
        root.left && Mirror(root.left);
        root.right && Mirror(root.right);
    }
    return root;
}

console.log(Mirror({
    val: 1,
    left: {
        val: 3
    },
    right: {
        val: 2
    }
}));