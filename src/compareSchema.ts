import {
  Change,
  CriticalityLevel,
  diff,
  DiffRule,
} from '@graphql-inspector/core'
import { useLoaders } from '@graphql-inspector/loaders'
import { ComparisonResult, GqlCompareConfig } from './types'

export function filterChangesByLevel(level: CriticalityLevel) {
  return (change: Change) => change.criticality.level === level
}

export async function compareSchema({
  schemas,
}: GqlCompareConfig): Promise<Omit<ComparisonResult, 'config'>> {
  const loaders = useLoaders({
    loaders: ['url', 'graphql', 'git'],
    commands: [],
  })

  const changes = await diff(
    await loaders.loadSchema(
      schemas.old.ref,
      schemas.old.auth ? { headers: { authorization: schemas.old.auth } } : {},
      false,
      false
    ),
    await loaders.loadSchema(
      schemas.new.ref,
      schemas.new.auth ? { headers: { authorization: schemas.new.auth } } : {},
      false,
      false
    ),
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
