import Ajv, { DefinedError, JSONSchemaType } from 'ajv'
import { FailLevel, GqlCompareConfig } from '../types'

const ajv = new Ajv({ useDefaults: true })

const configSchema: JSONSchemaType<GqlCompareConfig> = {
  type: 'object',
  required: ['name', 'schemas', 'settings', 'notifications'],
  properties: {
    name: { type: 'string' },
    schemas: {
      type: 'object',
      required: ['old', 'new'],
      properties: {
        old: {
          type: 'object',
          required: ['ref'],
          properties: {
            ref: { type: 'string' },
            auth: { type: 'string', nullable: true },
          },
        },
        new: {
          type: 'object',
          required: ['ref'],
          properties: {
            ref: { type: 'string' },
            auth: { type: 'string', nullable: true },
          },
        },
      },
    },
    settings: {
      type: 'object',
      required: [],
      properties: {
        environment: { type: 'string', nullable: true },
        failLevel: {
          type: 'string',
          enum: Object.values(FailLevel) as FailLevel[],
          default: FailLevel.Breaking,
        },
      },
    },
    notifications: {
      type: 'object',
      required: [],
      properties: {
        slack: {
          type: 'object',
          nullable: true,
          required: [],
          properties: {
            url: { type: 'string', nullable: true },
            mentions: {
              type: 'array',
              items: { type: 'string' },
              nullable: true,
            },
          },
        },
      },
    },
  },
}

export const validate = (configs: Array<Record<any, any>>) => {
  const validateSchema = ajv.compile(configSchema)
  return configs.map(data => {
    validateSchema(data)
    return {
      config: data as GqlCompareConfig,
      errors: (validateSchema.errors as DefinedError[]) ?? [],
    }
  })
}
