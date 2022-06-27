import { Change } from '@graphql-inspector/core'
import got from 'got'

interface Text {
  type: 'plain_text' | 'mrkdwn'
  text: string
}

interface Section {
  type: 'section'
  text: Text
}

interface Context {
  type: 'context'
  elements: Text[]
}

interface Divider {
  type: 'divider'
}

interface Attachment {
  fallback: string
  color: string
  mrkdwn_in: string[]
  author_name: string
  text: string
}

type Block = Section | Divider | Context

const pluralize = (word: string, num: number): string => {
  return word + (num > 1 ? 's' : '')
}

export function quotesTransformer(msg: string, symbols = '**') {
  const findSingleQuotes = /'([^']+)'/gim
  const findDoubleQuotes = /"([^"]+)"/gim

  function transformm(_: string, value: string) {
    return `${symbols}${value}${symbols}`
  }

  return msg
    .replace(findSingleQuotes, transformm)
    .replace(findDoubleQuotes, transformm)
}

export function slackCoderize(msg: string): string {
  return quotesTransformer(msg, '`')
}

function renderAttachments({
  changes,
  title,
  color,
}: {
  color: string
  title: string
  changes: Change[]
}): Attachment {
  const text = changes.map(change => slackCoderize(change.message)).join('\n')

  return {
    mrkdwn_in: ['text', 'fallback'],
    color,
    author_name: title,
    text,
    fallback: text,
  }
}

function createAttachments(changes: {
  breaking: Change[]
  dangerous: Change[]
  safe: Change[]
}) {
  const { breaking, dangerous, safe } = changes
  const blocks: Attachment[] = []

  if (breaking.length) {
    blocks.push(
      renderAttachments({
        color: '#E74C3B',
        title: 'Breaking changes',
        changes: breaking,
      })
    )
  }

  if (dangerous.length) {
    blocks.push(
      renderAttachments({
        color: '#F0C418',
        title: 'Dangerous changes',
        changes: dangerous,
      })
    )
  }

  if (safe.length) {
    blocks.push(
      renderAttachments({
        color: '#23B99A',
        title: 'Safe changes',
        changes: safe,
      })
    )
  }

  return blocks
}

export async function notifySlack({
  url,
  changes,
  environment,
  mentionIds,
  detailUrl,
}: {
  changes: {
    breaking: Change[]
    dangerous: Change[]
    safe: Change[]
  }
  url: string
  environment?: string
  mentionIds?: string[]
  detailUrl?: {
    text: string
    url: string
  }
}) {
  const totalChanges =
    changes.breaking.length + changes.dangerous.length + changes.safe.length
  const schemaName = environment ? `${environment} schema` : 'schema'

  const mentions = (mentionIds ?? []).map(m =>
    m.startsWith('group:') ? `<!subteam^${m.substr(6)}>` : `<@${m}>`
  )

  const header = [
    `:graphql: Detected *${totalChanges} ${pluralize(
      'change',
      totalChanges
    )}* in ${schemaName}`,
  ]

  if (mentions.length) {
    header.push(mentions.join(' '))
  }

  const blocks: Block[] = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: header.join('\n'),
      },
    },
  ]

  if (detailUrl) {
    blocks.push({
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `See details at <${detailUrl.url}|${detailUrl.text}>`,
        },
      ],
    })
  }

  const event: { blocks: Block[]; attachments: Attachment[] } = {
    blocks,
    attachments: createAttachments(changes),
  }

  await got.post(url, {
    json: event,
    headers: {
      'content-type': 'application/json',
    },
  })
}
