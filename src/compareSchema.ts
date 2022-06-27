import {
  Change,
  CriticalityLevel,
  diff,
  DiffRule,
} from '@graphql-inspector/core'
import { useLoaders } from '@graphql-inspector/loaders'
import { GqlCompareConfig } from './loadConfig'

export function filterChangesByLevel(level: CriticalityLevel) {
  return (change: Change) => change.criticality.level === level
}

export async function compareSchema({ schemas }: GqlCompareConfig) {
  const loaders = useLoaders({
    loaders: ['url', 'graphql'],
    commands: [],
  })

  const changes = await diff(
    await loaders.loadSchema(schemas.oldPointer, {}, false, false),
    await loaders.loadSchema(schemas.newPointer, {}, false, false),
    [DiffRule.ignoreDescriptionChanges]
  )

  const breaking = changes.filter(
    filterChangesByLevel(CriticalityLevel.Breaking)
  )
  const dangerous = changes.filter(
    filterChangesByLevel(CriticalityLevel.Dangerous)
  )
  const safe = changes.filter(
    filterChangesByLevel(CriticalityLevel.NonBreaking)
  )

  return {
    changes: { breaking, safe, dangerous },
    hasChanges: !!changes.length,
  }
}
