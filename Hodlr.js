class PromiseHodlr {

    #concurrency;
    #concurrent;
    #hodlrResolve;
    #joinResolve;
    #joinPromise;

    constructor(concurrency) {
        this.#concurrency = concurrency;
        this.#concurrent = 0;
        this.#hodlrResolve = null;
        this.#joinResolve = null;
        this.#joinPromise = null;
    }

    async hodl(promise) {
        this.#registerJoinPromiseAndCallback();
        this.#concurrent++;
        this.#registerPromiseCompletionHandler(promise);
        if(this.#shouldHodl()) {
            return this.#getHodlerPromiseAndRegisterCallback();
        }
        return Promise.resolve();
    }

    #registerJoinPromiseAndCallback() {
        if(this.#concurrent === 0) {
            [this.#joinPromise, this.#joinResolve] = this.#newHodlrPromiseCallback();
        }
    }

    #newHodlrPromiseCallback() {
        let resolveCb;
        return [
            new Promise((resolve, reject) =>  { resolveCb = resolve; }),
            resolveCb
        ];
    }

    #registerPromiseCompletionHandler(promise) {
        promise.then(_ => {
            this.#concurrent--;
            this.#resolveJoin();
            this.#resolveHodlr();
        })
    }

    #resolveJoin() {
        if(this.#concurrent === 0) {
            if (this.#joinResolve) {
                this.#joinResolve();
            }
        }
    }

    #resolveHodlr() {
        if(this.#hodlrResolve) {
            this.#hodlrResolve();
        }
    }

    #shouldHodl() {
        return this.#concurrency === this.#concurrent;
    }

    #getHodlerPromiseAndRegisterCallback() {
        const [hodlrPromise, hodlrResolve] = this.#newHodlrPromiseCallback();
        this.#hodlrResolve = hodlrResolve;
        return hodlrPromise;
    }

    join() {
        return this.#joinPromise;
    }

}


class TaskHodlr {

    #promiseHodlr;
    #promiseHodlrChain;

    constructor(concurrency) {
        this.#promiseHodlr = new PromiseHodlr(concurrency);
        this.#promiseHodlrChain = Promise.resolve();
    }

    addTask(task) {
        this.#promiseHodlrChain = this.#promiseHodlrChain.then(_ => this.#promiseHodlr.hodl(task()));
    }

    async join() {
        await this.#promiseHodlrChain;
        return this.#promiseHodlr.join();
    }
}


module.exports = { PromiseHodlr, TaskHodlr }
