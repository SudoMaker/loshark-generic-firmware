const promisify = method => (...args) => new Promise((resolve, reject) => {
	method(...args, (err, val) => {
		if (err) return reject(err)
		return resolve(val)
	})
})

export default promisify
