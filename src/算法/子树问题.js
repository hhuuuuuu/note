function HasSubtree(pRoot1, pRoot2) {
    if (!pRoot1 || !pRoot2) {
        return false;
    }

    if (pRoot1.val === pRoot2.val) {
        return doesTree1HaveTree2(pRoot1, pRoot2)
    }

    if (pRoot1.val !== pRoot2.val) {
        return HasSubtree(pRoot1.left, pRoot2) || HasSubtree(pRoot1.right, pRoot2);
    }
}

function doesTree1HaveTree2(pRoot1, pRoot2) {
    
    if (!pRoot1 && pRoot2) {
        return false;
    } else if (pRoot1 && !pRoot2) {
        return true;
    } else if (!pRoot1 && !pRoot2) {
        return true;
    } else {
        if (pRoot1.val !== pRoot2.val) {
            return false;
        } else {
            return doesTree1HaveTree2(pRoot1.left, pRoot2.left) && doesTree1HaveTree2(pRoot1.right, pRoot2.right);
        }
    }
}

let tree1 = {
    val:2,
    left: {
        val: 1,
        left: {
            val: 2
        },
        right: {
            val: 5
        }
    },
    right: {
        val: 7
    }
};
let tree2 = {
    val: 1,
    left: {
        val: 2
    },
    right: {
        val: 5
    }
};
console.log(HasSubtree(tree1, tree2))