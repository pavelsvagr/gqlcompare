import { getEnvVar } from './utils'

const addEnvVar = (config: Record<any, any>, key: string, name: string) => {
  const envVar = getEnvVar(name)
  if (envVar) config[key] = envVar
}

export const loadEnv = () => {
  const config = {
    schemas: {
      old: {},
      new: {},
    },
    settings: {},
    notifications: { slack: {} },
  }
  addEnvVar(config.schemas.old, 'ref', 'OLD_SCHEMA')
  addEnvVar(config.schemas.old, 'auth', 'OLD_SCHEMA_AUTH')
  addEnvVar(config.schemas.new, 'ref', 'NEW_SCHEMA')
  addEnvVar(config.schemas.new, 'auth', 'NEW_SCHEMA_AUTH')
  addEnvVar(config.settings, 'environment', 'ENV')
  addEnvVar(config.settings, 'failLevel', 'FAIL_LEVEL')
  addEnvVar(config.notifications.slack, 'url', 'SLACK_URL')
  addEnvVar(config.notifications.slack, 'mentions', 'SLACK_MENTIONS')

  return config
}
