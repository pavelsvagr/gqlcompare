import * as fs from 'fs'
import { format } from 'path'
import * as JSONc from 'jsonc-parser'

export const loadJsonc = (dir: string, name: string) =>
  JSONc.parse(
    fs.readFileSync(format({ dir, name, ext: '.jsonc' })).toString('utf8')
  )
