export const readArray = (value: string) => (value ? value.split(',') : [])

export const combine = (obj1: any, obj2: any) => ({
  ...(obj1 ?? {}),
  ...(obj2 ?? {}),
})

export const getEnvVar = (name: string) => process.env[`GQL_COMPARE_${name}`]

export const replaceEnvVar = (val: any) =>
  typeof val === 'string' && val.length > 2 && val.startsWith('$$')
    ? process.env[val.substring(2)]
    : val
