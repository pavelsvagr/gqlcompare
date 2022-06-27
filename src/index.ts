#!/usr/bin/env node

import { compareSchema } from './compareSchema'
import { FailLevel, loadConfig } from './loadConfig'
import { notifySlack } from './notifySlack'

void (async () => {
  const config = loadConfig()

  if (config.settings.skip) {
    console.info('GQL_COMPARE_SKIP set. Skipping graphql schema diff.')
    process.exit()
  }

  const { changes, hasChanges } = await compareSchema(config)

  if (changes.breaking.length) {
    const msg = `Found ${changes.breaking.length} breaking changes`
    if (config.settings.failLevel === FailLevel.Breaking) {
      throw new Error(msg)
    }
    console.warn(msg)
  }
  if (changes.dangerous.length) {
    const msg = `Found ${changes.dangerous.length} dangerous changes`
    if (config.settings.failLevel === FailLevel.Dangerous) {
      throw new Error(msg)
    }
    console.log(msg)
  }

  if (config.notifications.slack?.url && hasChanges) {
    await notifySlack({
      changes,
      url: config.notifications.slack.url,
      mentionIds: config.notifications.slack.mentions,
      environment: config.settings.environment,
    })
  }

  process.exit()
})().catch(err => {
  console.error(`Error: ${err.message}`)
  process.exit(1)
})
