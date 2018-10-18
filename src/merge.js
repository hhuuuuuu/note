function Merge(pHead1, pHead2) {
    let l;
    let f;
    if (pHead1.val > pHead2.val) {
        f = l = pHead2;
    } else {
        f = l = pHead1;
    }
    let p1N = pHead1.next;
    let p2N = pHead2.next;
    while (p1N && p2N) {
        if (p1N.val > p2N.val) {
            l.next = p2N;
            p2N = p2N.next;
        } else {
            l.next = p1N;
            p1N = p1N.next;
        }
        l = l.next;
    }
    if (!p1N) {
        l.next = p2N;
    } else {
        l.next = p1N;
    }
    return f;
}

a = {
    val: 1,
    next: {
        val: 9,
        next: {
            val: 9
        }
    }
}

b = {
    val: 1,
    next: {
        val: 3
    }
}
console.log(Merge(a, b))