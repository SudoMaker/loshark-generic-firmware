import path from 'path'

import eslint from '@rollup/plugin-eslint'
import alias from '@rollup/plugin-alias'

const buildTarget = 'loshark'
const chipType = process.env.CHIP_TYPE || 'sx1268'

const inputs = {
	loshark: 'src/loshark/index.js'
}

const input = {
	[`${buildTarget}-${chipType}`]: inputs[buildTarget]
}

export default {
	input,
	del: false,
	format: 'iife',
	target: 'es2015',
	devPath: 'dev',
	proPath: 'dist',
	copyOptions: [[]],
	external: [],
	globals: {},
	esbuild: {
		supported: {
			bigint: true,
			'async-await': true
		}
	},
	define: {
		'___CHIP_TYPE___': JSON.stringify(chipType)
	},
	plugins: [
		eslint({
			exclude: ['src/static/**.*', '../../../**/**.*']
		}),
		alias({
			entries: {
				'utils': path.resolve('./src/utils'),
				'system': path.resolve('./src/system')
			}
		})
	],
	execCommands: [
		// 'killall resonance',
		// 'adb push ./dev/app.js /app/app.js'
	]
}
