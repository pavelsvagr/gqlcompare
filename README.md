<div align="center">

# GQL Compare
Graphql comparison tool with slack notifications based on [graphql-inspector](https://github.com/kamilkisiela/graphql-inspector)

</div>

## ✨ Features

- Simple configuration
  - yaml, json, jsonc support
  - overloading with environment variables
- Schema comparison from url, graphql files or git
- Configurable Slack notifications
  - webhook url
  - possibility to define mentions

## 🚀 Quick setup

1. Create `gqlcompare.json` configuration file in root folder of project
2. Use `gqlcompare` command to compare your schemas

## ⚙️ Configuration
- To use different config file name or `.yaml`, or `.jsonc` extensions, specify path to the file with `--config` option
- Each configuration needs to start with key that defines name of the configuration (schema)
- Every key can be replaced with `&&<ENV_VARIABLE_NAME>` string to load the value from env
- All ENV variables will overwrite all configurations, all needs to be prefixed with `GQL_COMPARE_`, e.g. `GQL_COMPARE_OLD_SCHEMA='./schema.gql`

### Options
| Key                            | Type                                             | ENV               | Description                                                                                                     |
|--------------------------------|--------------------------------------------------|-------------------|-----------------------------------------------------------------------------------------------------------------|
| `schemas.old.ref`              | `string` (url, git ref or file path)             | `OLD_SCHEMA`      | Pointer to old schema                                                                                           |
| `schemas.old.auth`             | `string`                                         | `OLD_SCHEMA_AUTH` | Authorization header for url loader                                                                             |
| `schemas.new.ref`              | `string` (url, git ref or file path)             | `NEW_SCHEMA`      | Pointer to new                                                                                                  |
| `settings.environment`         | `string`                                         | `NEW_SCHEMA_AUTH` | Environment (mentioned in notificaitons)                                                                        |
| `settings.failLevel`           | `"breaking"`, `"dangerous"`, `"any"` or `"never"` | `FAIL_LEVEL`      | Which changes in schema will cause that script fails                                                            |
| `notifications.slack.url`      | `string`                                         | `SLACK_URL`       | [Webhook url to publish messages](https://slack.com/help/articles/115005265703-Create-a-bot-for-your-workspace) |
| `notifications.slack.mentions` | `string` (values separated with `,`)               | `SLACK_MENTIONS`  | id of users or groups to mention in the slack message (for groups use `group:` prefix)                          |


### Example config
`graphql.yml`

```yaml
client:
  schemas:
    old:
      ref: https://test-client-schema/graphql
    new:
      ref: ./graphql/schema.client.graphql
  settings:
      failLevel: breaking
  notifications:
    slack:
      mentions: 'group:STAMZNREY,group:S015S9JNJ1M' # Android, iOS
admin:
  schemas:
    old:
      ref: https://test-admin-schema/graphql
      auth: 'AUTHORIZATION_TOKEN'
    new:
      ref: ./graphql/schema.admin.graphql
  settings:
      failLevel: never
      environment: $$NODE_ENV # Loaded by NODE_ENV env variable
  notifications:
    slack:
      url: https://test-slack-webhook/
      mentions: 'group:S01TESTID,U123' # Group S01TESTID, user U123

```
