import { Change } from '@graphql-inspector/core'

export enum FailLevel {
  Any = 'any',
  Dangerous = 'dangerous',
  Breaking = 'breaking',
  Never = 'never',
}

export interface SchemaChanges {
  breaking: Change[]
  dangerous: Change[]
  safe: Change[]
}

export interface ComparisonResult {
  changes: SchemaChanges
  hasChanges: boolean
  config: GqlCompareConfig
}

export interface GqlCompareConfig {
  name: string
  schemas: {
    old: {
      ref: string
      auth?: string
    }
    new: {
      ref: string
      auth: string
    }
  }
  settings: {
    environment: string
    failLevel: FailLevel
  }
  notifications: {
    slack?: {
      url?: string
      mentions: string[]
    }
  }
}
