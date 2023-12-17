import { LEDManager } from 'system/led-manager.js'

const { SX126x } = loadModule('loshark/sx126x')
const { GPIOControllerLinux } = loadModule('gpio/linux')
const { SPIControllerLinux } = loadModule('spi/linux')

const gpioa = new GPIOControllerLinux(0)
const pa19 = gpioa.open(19, 'SX126x NRST')
const pa18 = gpioa.open(18, 'SX126x BUSY')
const pa17 = gpioa.open(17, 'SX126x DIO1')
const pa16 = gpioa.open(16, 'SX126x DIO2')

const spi0 = new SPIControllerLinux(0)
const spidev0_0 = spi0.open(0)

const cfg = {
	// eslint-disable-next-line no-undef
	chip: ___CHIP_TYPE___,
	tcxo: { voltage: 0x2, timeout: 32 },
	gpio: { reset: pa19, busy: pa18, dio1: pa17, dio2: pa16 },
	spi: spidev0_0
}

const mdm = new SX126x(cfg)

globalThis.mdm = mdm

const ledManager = new LEDManager()

export { mdm, ledManager }
