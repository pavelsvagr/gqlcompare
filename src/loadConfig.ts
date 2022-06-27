import { readFileSync } from 'fs'

export enum FailLevel {
  Any = 'any',
  Dangerous = 'dangerous',
  Breaking = 'breaking',
  Never = 'never',
}

export interface GqlCompareConfig {
  schemas: {
    oldPointer: string
    newPointer: string
  }
  settings: {
    environment: string
    skip: boolean
    failLevel: FailLevel
  }
  notifications: {
    slack?: {
      url?: string
      mentions: string[]
    }
  }
}

const getConfigFileContent = () => {
  try {
    const configFileContent = readFileSync('./gqlcompare.config.json')
    return JSON.parse(configFileContent.toString())
  } catch (err) {
    throw new Error(
      `Could not read config file for GQLCompare - ${err.message}`
    )
  }
}

const readArray = (value: string) => (value ? value.split(',') : [])

const replaceWithEnv = <T>(value: T, name: string) => process.env[name] ?? value

const remapConfig = (config: Record<string, any>) => {
  return {
    schemas: {
      oldPointer: String(
        replaceWithEnv(config.schemas.oldPointer, 'GQL_COMPARE_OLD_SCHEMA')
      ),
      newPointer: String(
        replaceWithEnv(config.schemas.newPointer, 'GQL_COMPARE_NEW_SCHEMA')
      ),
    },
    settings: {
      environment:
        String(
          replaceWithEnv(config.settings.environment, 'GQL_COMPARE_ENV')
        ) ?? process.env.NODE_ENV,
      skip:
        Boolean(replaceWithEnv(config.settings.skip, 'GQL_COMPARE_SKIP')) ??
        false,
      failLevel: String(
        replaceWithEnv(config.settings.failLevel, 'GQL_COMPARE_FAIL_LEVEL')
      ) as FailLevel,
    },
    notifications: {
      slack: {
        url: replaceWithEnv(config.settings.url, 'GQL_COMPARE_SLACK_URL'),
        mentions: readArray(
          replaceWithEnv(config.settings.mentions, 'GQL_COMPARE_SLACK_MENTIONS')
        ),
      },
    },
  }
}

export const validateConfig = (
  rawConfig: Partial<GqlCompareConfig>
): GqlCompareConfig => {
  if (
    !rawConfig.schemas ||
    !rawConfig.schemas.oldPointer ||
    !rawConfig.schemas.newPointer
  ) {
    throw new Error('Missing old or new schema pointers to compare')
  }

  return {
    schemas: rawConfig.schemas!,
    settings: rawConfig.settings ?? {
      environment: '-',
      skip: false,
      failLevel: FailLevel.Never,
    },
    notifications: rawConfig.notifications ?? {},
  }
}

export const loadConfig = (): GqlCompareConfig =>
  validateConfig(remapConfig(getConfigFileContent()))
