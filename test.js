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