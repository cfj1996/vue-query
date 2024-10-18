// @ts-check

import { defineConfig } from 'tsup'
import {
  esbuildPluginFilePathExtensions
} from 'esbuild-plugin-file-path-extensions'

/**
 * @param {Object} opts - Options for building configurations.
 * @param {string[]} opts.entry - The entry array.
 * @returns {import('tsup').Options}
 */
export function config(opts) {
  return {
    entry: opts.entry,
    format: ['cjs', 'esm'],
    target: ['es6', 'node16'],
    outDir: 'build',
    dts: true,
    sourcemap: true,
    clean: true,
    esbuildPlugins: [esbuildPluginFilePathExtensions({ esmExtension: 'js' })]
  }
}

export default defineConfig([
  config({ entry: ['src/**/*.ts'] })
])
