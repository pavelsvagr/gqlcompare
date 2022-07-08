import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

const DEFAULT_CONFIG_PATH = './gqlcompare.json'

export const cli = async () => {
  const { config: configPath } = await yargs(hideBin(process.argv)).options({
    config: { type: 'string', alias: 'c', default: DEFAULT_CONFIG_PATH },
  }).argv

  return {
    configPath,
  }
}
