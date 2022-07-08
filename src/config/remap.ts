import { combine, readArray, replaceEnvVar } from './utils'

export const remap = (
  configurations: Record<string, Record<string, any>>,
  defaults: Record<string, any>
): Array<Record<string, any>> =>
  Object.entries(configurations).map(([name, config]) => {
    const conf = {
      name,
      schemas: {
        old: combine(config.schemas?.old, defaults.schemas?.old),
        new: combine(config.schemas?.new, defaults.schemas?.new),
      },
      settings: combine(config.settings, defaults.schemas),
      notifications: {
        slack: combine(
          config.notifications?.slack,
          defaults.notifications?.slack
        ),
      },
    }

    return {
      name: replaceEnvVar(conf.name),
      schemas: {
        old: {
          auth: replaceEnvVar(conf.schemas.old?.auth),
          ref: replaceEnvVar(conf.schemas.old?.ref),
        },
        new: {
          auth: replaceEnvVar(conf.schemas.new?.auth),
          ref: replaceEnvVar(conf.schemas.new?.ref),
        },
      },
      settings: {
        environment: replaceEnvVar(conf.settings.environment),
        failLevel: replaceEnvVar(conf.settings.failLevel),
      },
      notifications: {
        slack: {
          url: replaceEnvVar(conf.notifications.slack.url),
          mentions: readArray(replaceEnvVar(conf.notifications.slack.mentions)),
        },
      },
    }
  })
