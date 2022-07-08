import * as yaml from 'js-yaml'
import * as fs from 'fs'
import { format } from 'path'

export const loadYaml = (dir: string, name: string) =>
  yaml.load(
    fs.readFileSync(format({ dir, name, ext: '.yaml' })).toString('utf8')
  )
