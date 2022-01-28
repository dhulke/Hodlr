const { PromiseHodlr, TaskHodlr } = require("./Hodlr");


function job(id, wait) {
    console.log(`Start ${id} in ${wait}s`);
    return new Promise((resolve, reject) =>
        setTimeout(resolve, 1000 * wait)
    ).then(_ => console.log(`Done ${id} in ${wait}s`));
}

(async function main() {

    await runTaskHodlr();
    await runPromiseHodlr();

})();

async function runTaskHodlr() {
    const taskHodlr = new TaskHodlr(3);

    taskHodlr.addTask(_ => job("a", 1));
    taskHodlr.addTask(_ => job("b", 2));
    taskHodlr.addTask(_ => job("c", 3));
    taskHodlr.addTask(_ => job("d", 1));
    taskHodlr.addTask(_ => job("e", 1));

    await taskHodlr.join();
    console.log("Done;");
}

async function runPromiseHodlr() {
    const promiseHodlr = new PromiseHodlr(15);

    await promiseHodlr.hodl(job("a", 1));
    await promiseHodlr.hodl(job("b", 2));
    await promiseHodlr.hodl(job("c", 3));
    await promiseHodlr.hodl(job("d", 1));
    await promiseHodlr.hodl(job("e", 1));
    await promiseHodlr.hodl(job("f", 1));
    await promiseHodlr.hodl(job("g", 1));

    await promiseHodlr.join();
    console.log("Done;")
}