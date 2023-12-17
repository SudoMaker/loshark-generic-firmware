import promisify from './promisify.js'
import * as fsPromise from './fs-promise.js'

const dummyHandler = (e) => {
	console.log('Previous operation has error, ignore')
	console.log(e)
}

const promiseHandleError = (future, handler = dummyHandler) => future.catch(handler)

export {
	promisify,
	fsPromise,
	promiseHandleError
}
