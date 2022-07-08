import * as fs from 'fs'
import { parse } from 'path'
import { GqlCompareConfig } from '../types'
import { loadYaml } from './loadYaml'
import { loadJson } from './loaderJson'
import { loadJsonc } from './loadJsonc'
import { remap } from './remap'
import { validate } from './validate'
import { loadEnv } from './loadEnv'
import { DefinedError } from 'ajv'

const getConfigFileContent = (path: string) => {
  if (!fs.statSync(path).isFile()) {
    throw new Error(`Configuration file ${path} not found or is not file`)
  }

  const { dir, name, ext } = parse(path)

  switch (ext) {
    case '.yaml':
      return loadYaml(dir, name)
    case '.jsonc':
      return loadJsonc(dir, name)
    default:
      return loadJson(dir, name)
  }
}

export const loadConfig = (
  path: string
): Array<{ config: GqlCompareConfig; errors: DefinedError[] }> =>
  validate(remap(getConfigFileContent(path), loadEnv()))
