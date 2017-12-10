/*
Inspired by https://stackoverflow.com/questions/39028882/chaining-async-method-calls-javascript/43391095#43391095
 */
import Promise from 'bluebird';

export default class AsyncOpQueue {
	constructor() {
		this.ops = [];
	}

	push(fn) {
		this.ops.push(fn);
	}

	execute() {
		return Promise.reduce(this.ops, AsyncOpQueue._promiseReducer, 0)
			.then(() => {
				this.ops = [];
			});
	}

	static _promiseReducer(val, promiseFuncGenerator) {
		return promiseFuncGenerator();
	}
}