// Claude-powered "Ask AI about Milind" assistant. Runs entirely in the browser
// using the visitor's own Anthropic API key (BYOK) via the official SDK's
// direct-browser-access mode — no backend, no shared secret. The heavy SDK is
// dynamically imported so it only loads when the chat is actually used.
import type { PortfolioData } from '../types/portfolio'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export const AI_KEY_STORAGE = 'portfolio-ai-key'
export const AI_MODEL = 'claude-opus-4-8'

// Build a grounded system prompt from the live portfolio data so Claude answers
// accurately and only from what's on the site.
export function buildSystemPrompt(d: PortfolioData): string {
  const lines: Array<string | false | undefined> = []
  lines.push(
    `You are a friendly AI assistant embedded on the personal portfolio website of ${d.name}, a ${d.title}.`,
    `Answer visitors' questions about ${d.name}'s professional background, experience, skills, education, and projects, using ONLY the information provided below.`,
    `Speak about ${d.name} in the third person. Be concise, warm, and professional — a few sentences unless asked for more detail. Respond directly without preamble.`,
    `If a question cannot be answered from this information, say you don't have that detail and suggest reaching out via the contact section. Never invent facts.`,
    '',
    '=== PROFILE ===',
    `Name: ${d.name}`,
    `Title: ${d.title}`,
    d.summary && `Summary: ${d.summary}`,
    d.contact.location && `Location: ${d.contact.location}`,
    '',
  )

  if (d.experience.length) {
    lines.push('=== EXPERIENCE ===')
    for (const e of d.experience) {
      lines.push(`${e.title} — ${e.company}${e.location ? `, ${e.location}` : ''} (${e.startDate} to ${e.endDate})`)
      for (const b of e.bullets) lines.push(`  - ${b}`)
      if (e.tech?.length) lines.push(`  Technologies: ${e.tech.join(', ')}`)
    }
    lines.push('')
  }

  if (d.skills.length) {
    lines.push('=== SKILLS ===')
    for (const g of d.skills) lines.push(`${g.category}: ${g.items.join(', ')}`)
    lines.push('')
  }

  if (d.education.length) {
    lines.push('=== EDUCATION ===')
    for (const ed of d.education) {
      lines.push(`${ed.degree} — ${ed.institution}${ed.period ? ` (${ed.period})` : ''}${ed.score ? `, Score: ${ed.score}` : ''}`)
    }
    lines.push('')
  }

  if (d.certifications.length) {
    lines.push('=== CERTIFICATIONS ===', ...d.certifications.map(c => `- ${c}`), '')
  }

  if (d.projects.length) {
    lines.push('=== PROJECTS ===')
    for (const p of d.projects) {
      lines.push(`${p.name}${p.description ? `: ${p.description}` : ''}${p.technologies?.length ? ` [${p.technologies.join(', ')}]` : ''}`)
    }
    lines.push('')
  }

  return lines.filter((l): l is string => typeof l === 'string').join('\n')
}

// Stream a Claude response, calling onText with each delta. Throws on API errors
// (the caller maps status codes to friendly messages).
export async function streamChat(opts: {
  apiKey: string
  system: string
  messages: ChatMessage[]
  onText: (text: string) => void
  signal?: AbortSignal
}): Promise<void> {
  const { default: Anthropic } = await import('@anthropic-ai/sdk')
  const client = new Anthropic({ apiKey: opts.apiKey, dangerouslyAllowBrowser: true })

  const stream = client.messages.stream(
    {
      model: AI_MODEL,
      max_tokens: 1024,
      system: opts.system,
      messages: opts.messages,
    },
    { signal: opts.signal },
  )

  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      opts.onText(event.delta.text)
    }
  }
  await stream.finalMessage()
}

// Map an SDK/network error to a short, user-facing message.
export function describeError(err: unknown): string {
  const status = (err as { status?: number })?.status
  if (status === 401) return 'That API key was rejected. Please check it and try again.'
  if (status === 403) return 'This key lacks permission for the Claude API.'
  if (status === 429) return 'Rate limit reached on your account. Please wait a moment and retry.'
  if (status === 400) return 'The request was rejected by the API. Please try a different question.'
  if (status && status >= 500) return 'Claude is temporarily unavailable. Please try again shortly.'
  const msg = err instanceof Error ? err.message : String(err)
  if (/fetch|network|load failed/i.test(msg)) return 'Network error reaching the Claude API. Check your connection.'
  return msg || 'Something went wrong. Please try again.'
}
