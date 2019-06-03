function Clone(pHead) {
    let head = {};
    c(head, pHead);
    return head;
}

function c(node, pNode) {
    if (!pNode) return;
    node.label = pNode.label;
    if (pNode.next){
        node.next = {};
        c(node.next, pNode.next);
    }
    if(pNode.random){
        node.random = {};
        c(node.random, pNode.random);
    }
}

console.log(Clone({label: 1, next: {
    label: 5
}}))