#!/usr/bin/env node

import { compareSchema } from './compareSchema'
import { loadConfig } from './config/loadConfig'
import { notifySlack } from './notifySlack'
import { cli } from './cli'
import {
  ComparisonResult,
  FailLevel,
  GqlCompareConfig,
  SchemaChanges,
} from './types'
import {
  bolderize,
  chalk,
  Logger as logger,
  symbols,
} from '@graphql-inspector/logger'
import { CriticalityLevel } from '@graphql-inspector/core'

const getChangeMessage = (
  changes: number,
  type: CriticalityLevel,
  schema?: string
) => {
  const addition = schema ? ` in "${schema}" schema ` : ''
  return `Found ${changes} ${type.toLowerCase().replace('_', ' ')} ${
    changes > 1 ? 'changes' : 'change'
  }${addition}`
}

const sendNotifications = async (results: ComparisonResult[]) => {
  for (const result of results) {
    const { hasChanges, changes, config } = result
    if (!hasChanges) {
      logger.info('No changes detected')
    } else {
      if (config.notifications.slack?.url) {
        logger.info(`Notifying about ${config.name} in slack`)
        await notifySlack({
          changes,
          name: config.name,
          url: config.notifications.slack.url,
          mentionIds: config.notifications.slack.mentions,
          environment: config.settings.environment,
        })
      }
    }
  }
}

const printResults = (changes: SchemaChanges, failLevel: FailLevel) => {
  if (changes.breaking.length) {
    const logMethod = failLevel === FailLevel.Never ? logger.warn : logger.error
    logMethod(
      getChangeMessage(changes.breaking.length, CriticalityLevel.Breaking)
    )
    changes.breaking.forEach(({ message }) =>
      logMethod(`${symbols.error} ${bolderize(message)}`)
    )
  }
  if (changes.dangerous.length) {
    const logMethod =
      failLevel === FailLevel.Never || failLevel === FailLevel.Breaking
        ? logger.warn
        : logger.error
    logMethod(
      getChangeMessage(changes.dangerous.length, CriticalityLevel.Dangerous)
    )
    changes.dangerous.forEach(({ message }) =>
      logMethod(`${symbols.warning} ${bolderize(message)}`)
    )
  }
  if (changes.safe.length) {
    const logMethod = failLevel === FailLevel.Any ? logger.error : logger.log
    logMethod(
      getChangeMessage(changes.safe.length, CriticalityLevel.NonBreaking)
    )
    changes.safe.forEach(({ message }) =>
      logMethod(`${symbols.info} ${bolderize(message)}`)
    )
  }
}

const loadConfigsAndHandleErrors = (configPath: string) => {
  let hasErrors = false
  const configs = loadConfig(configPath).map(({ config, errors }) => {
    if (errors.length) {
      errors.forEach(error =>
        logger.error(
          `${symbols.error} Invalid config for "${config.name}" schema: ${
            error.message ?? 'Unknown error'
          }`
        )
      )
      hasErrors = true
    }
    return config
  })
  if (hasErrors) throw new Error('Invalid configuration')
  return configs
}

const getErrorsFromChanges = (
  config: GqlCompareConfig,
  changes: SchemaChanges
) => {
  const errors: string[] = []
  if (
    config.settings.failLevel !== FailLevel.Never &&
    changes.breaking.length
  ) {
    errors.push(
      getChangeMessage(
        changes.breaking.length,
        CriticalityLevel.Breaking,
        config.name
      )
    )
  }
  if (
    (config.settings.failLevel === FailLevel.Dangerous ||
      config.settings.failLevel === FailLevel.Any) &&
    changes.dangerous.length
  ) {
    errors.push(
      getChangeMessage(
        changes.dangerous.length,
        CriticalityLevel.Dangerous,
        config.name
      )
    )
  }
  if (config.settings.failLevel === FailLevel.Any && changes.safe.length) {
    errors.push(
      getChangeMessage(
        changes.safe.length,
        CriticalityLevel.NonBreaking,
        config.name
      )
    )
  }
  return errors
}

void (async () => {
  const { configPath } = await cli()
  logger.info(`Loading configuration from ${configPath}`)

  const configs = loadConfigsAndHandleErrors(configPath)

  const errors: string[] = []
  const results: ComparisonResult[] = []

  for (const config of configs) {
    logger.info(`Comparing GraphQL schema: ${config.name}`)

    const { changes, hasChanges } = await compareSchema(config)
    printResults(changes, config.settings.failLevel)
    errors.push(...getErrorsFromChanges(config, changes))

    results.push({ config, hasChanges, changes })
  }

  if (errors.length) {
    errors.forEach(error => logger.error(chalk.bgBlackBright.bold.red(error)))
    process.exit(1)
  }

  await sendNotifications(results)

  logger.success(
    chalk.bold.bgBlackBright.green('GraphQL schemas successfully compared')
  )
  process.exit()
})().catch((err: Error) => {
  logger.error(`${symbols.error} ${chalk.bgBlackBright.bold.red(err.message)}`)
  process.exit(1)
})
