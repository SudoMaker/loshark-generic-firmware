import promisify from './promisify.js'
const fs = loadModule('fs')

/* eslint-disable no-inline-comments, spaced-comment */
export const readFile = /*#__PURE__*/promisify(fs.readFile)
export const writeFile = /*#__PURE__*/promisify(fs.writeFile)
export const readdir = /*#__PURE__*/promisify(fs.readdir)
export const mkdir = /*#__PURE__*/promisify(fs.mkdir)
export const access = /*#__PURE__*/promisify(fs.access)
export const rename = /*#__PURE__*/promisify(fs.rename)
export const copyFile = /*#__PURE__*/promisify(fs.copyFile)
export const unlink = /*#__PURE__*/promisify(fs.unlink)
