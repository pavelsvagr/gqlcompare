import * as fs from 'fs'
import { format } from 'path'

export const loadJson = (dir: string, name: string) =>
  JSON.parse(
    fs.readFileSync(format({ dir, name, ext: '.json' })).toString('utf8')
  )
