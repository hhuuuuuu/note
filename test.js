function* gen1() {
    yield 2;
    yield 3;
    yield 4;
}

function* gen2() {
    yield 1;
    yield* gen1();
    yield 5;
}
for (var i of gen2()) {
    console.log(i); // 12345
}

(async function () {
    let b = await new Promise(function(resolve, reject){
        setTimeout(_ => {
            resolve(4);
        })
    })
    console.log(b)
})()