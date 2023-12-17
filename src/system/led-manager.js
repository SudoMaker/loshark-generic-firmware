import { fsPromise as fs } from 'utils'

export const LED = class LED {
	constructor(path) {
		this._path = path
		this._brightness = 255
		this._on = false
	}

	get brightness() {
		return this._brightness
	}
	set brightness(value) {
		this._brightness = parseInt(value, 10)
		this.on()
	}

	get isOn() {
		return this._on
	}

	async on(timeout) {
		this._on = true
		await fs.writeFile(this._path, String(this._brightness))

		if (timeout) {
			await new Promise((resolve) => {
				setTimeout(() => {
					this.off()
					.then(resolve)
				}, timeout)
			})
		}
	}

	async off(timeout) {
		this._on = false
		await fs.writeFile(this._path, '0')

		if (timeout) {
			await new Promise((resolve) => {
				setTimeout(() => {
					this.on()
					.then(resolve)
				}, timeout)
			})
		}
	}
}

export const LEDManager = class LEDManager {
	static RED_PATH = '/sys/class/leds/red:indicator/brightness'
	static GREEN_PATH = '/sys/class/leds/green:indicator/brightness'
	static BLUE_PATH = '/sys/class/leds/blue:indicator/brightness'

	get red() {
		Object.defineProperty(this, 'red', {
			value: new LED(LEDManager.RED_PATH)
		})
		return this.red
	}

	get green() {
		Object.defineProperty(this, 'green', {
			value: new LED(LEDManager.GREEN_PATH)
		})
		return this.green
	}

	get blue() {
		Object.defineProperty(this, 'blue', {
			value: new LED(LEDManager.BLUE_PATH)
		})
		return this.blue
	}
}
