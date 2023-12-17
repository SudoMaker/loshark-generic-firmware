import { pack as mpPack, unpack as mpUnpack } from 'msgpackr'
import { mdm, ledManager } from './hardware.js'
import { fsPromise as fs } from 'utils'

const COBS = loadModule('cobs')
const { SerialPortPOSIX } = loadModule('serialport/posix')
const os = loadModule('os')

const propDir = '/data/loshark-props'

let cobsDecOut = []

let cobsDec = new COBS.decoder()
let cobsEnc = new COBS.encoder()

let localPacketCounter = 0

const loadProps = async () => {
	try {
		await fs.mkdir(propDir, { recursive: true })
		const aKeys = await fs.readdir(propDir)
		await Promise.all(
			aKeys.map((key) =>
				fs.readFile(`${propDir}/${key}`).then((buf) => {
					console.log('load prop:', key, buf)
					return mdm.setProp(key, JSON.parse(buf))
				})
			)
		)
	} catch (e) {
		console.log('Loading prop error:', e.message)
	}
}

const packetCounterFetchAdd = () => {
	localPacketCounter = (localPacketCounter % 4294967295) + 1
	return localPacketCounter
}

const sendRPC = (tty, body) => {
	body.id = packetCounterFetchAdd()
	console.log('sendRPC', body)
	let mpEncoded = mpPack(body)
	cobsEnc.encode(mpEncoded)
	tty.write(cobsEnc.finalize())
	gc()
}

// eslint-disable-next-line max-params
const sendRPCResult = (tty, idReplyTo, err, data) => {
	sendRPC(tty, {
		op: 'result',
		result: {
			rid: idReplyTo,
			success: !err,
			// eslint-disable-next-line no-undefined
			message: err ? err.message : undefined
		},
		data: data
	})
}

const processRPC = (tty, req) => {
	console.log('processRPC', req)
	try {
		switch (req.op) {
			case 'opened':
				sendRPCResult(tty, req.id, null, mdm.opened)
				break
			case 'open':
				mdm
					.open()
					.then(loadProps)
					.then(() => {
						ledManager.red.off()
						ledManager.green.on()
						sendRPCResult(tty, req.id)
					})
					.catch((err) => {
						ledManager.red.on()
						ledManager.green.off()
						sendRPCResult(tty, req.id, err)
					})
				break
			case 'close':
				mdm
					.close()
					.then(() => {
						ledManager.red.on()
						ledManager.green.on()
						sendRPCResult(tty, req.id)
					})
					.catch((err) => {
						ledManager.red.on()
						ledManager.green.off()
						sendRPCResult(tty, req.id, err)
					})
				break
			case 'transmit':
				ledManager.blue.on()
				mdm
					.transmit(req.data.buffer)
					.then(() => {
						ledManager.blue.off()
						sendRPCResult(tty, req.id)
					})
					.catch((err) => {
						ledManager.blue.off()
						ledManager.red.on(200)
						ledManager.green.off(200)
						sendRPCResult(tty, req.id, err)
					})
				break
			case 'setprop':
				mdm
					.setProp(req.data.key, req.data.value)
					.then(() => {
						sendRPCResult(tty, req.id)
						return fs.writeFile(`${propDir}/${req.data.key}`, JSON.stringify(req.data.value))
					})
					.catch((err) => {
						sendRPCResult(tty, req.id, err)
					})
				break
			case 'getprop':
				mdm
					.getProp(req.data.key)
					.then((value) => {
						sendRPCResult(tty, req.id, null, { value: value })
					})
					.catch((err) => {
						sendRPCResult(tty, req.id, err)
					})
				break
			case 'listprop':
				mdm
					.listProp()
					.then((value) => {
						sendRPCResult(tty, req.id, null, { props: value })
					})
					.catch((err) => {
						sendRPCResult(tty, req.id, err)
					})
				break
			case 'info':
				sendRPCResult(tty, req.id, null, mdm.info())
				break
			case 'ping':
				sendRPCResult(tty, req.id, null)
				break
			case 'settime':
				os.clockSetTime(req.data)
				os.writeRTC()
				sendRPCResult(tty, req.id, null)
				break
			case 'gettime':
				sendRPCResult(tty, req.id, null, os.clockGetTime())
				break
			default:
				sendRPCResult(tty, req.id, new Error('ENOSYS'))
				break
		}
	} catch (e) {
		sendRPCResult(tty, req.id, e)
	}
}

const startServer = (path) => {
	const tty = new SerialPortPOSIX()
	tty.setConfig({ baudRate: 115200, hardwareFlowControl: false })
	tty.open(path)

	tty.on('data', (buf) => {
		console.log('rx raw', buf)
		const rcDec = cobsDec.decode(cobsDecOut, buf)
		if (rcDec) {
			for (let pkt of cobsDecOut) {
				let rpcData = null

				console.log('rx pkt', pkt)

				try {
					rpcData = mpUnpack(pkt.buffer)
				} catch (e) {
					console.log('mp dec err', e, pkt)
				}

				if (rpcData) {
					processRPC(tty, rpcData)
				}
			}
			cobsDecOut = []
		}
	})

	let reopenPending = false

	const handleErr = (err) => {
		console.log(err)
		tty.destroy()

		const redOn = ledManager.red.isOn
		const greenOn = ledManager.green.isOn

		if (!reopenPending) {
			ledManager.red.on()
			ledManager.green.off()
			ledManager.blue.off()
			reopenPending = true
			setTimeout(() => {
				tty.open(path)
				reopenPending = false
				if (greenOn) ledManager.green.on()
				if (!redOn) ledManager.red.off()
			}, 1000)
		}
	}

	tty.on('error', handleErr)
	tty.on('end', handleErr)
	tty.on('close', handleErr)

	const onReceive = (data, signal) => sendRPC(tty, { op: 'receive', data, signal })
	const onSignal = (signal) => sendRPC(tty, { op: 'signal', signal })
	const onEvent = (ev) => sendRPC(tty, { op: 'event', data: ev })

	mdm.on('receive', onReceive)
	mdm.on('signal', onSignal)
	mdm.on('event', onEvent)
}

export { startServer }
