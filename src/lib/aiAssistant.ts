// On-device AI assistant — runs a small open model entirely in the visitor's
// browser via WebLLM (WebGPU). Free for everyone, no API key, no backend, fully
// private (nothing leaves the device). The model weights download once and are
// cached by the browser. The heavy library is dynamically imported.
import type { PortfolioData } from '../types/portfolio'
import type { MLCEngine, InitProgressReport } from '@mlc-ai/web-llm'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export const LOCAL_MODEL = 'Llama-3.2-1B-Instruct-q4f16_1-MLC'
export const MODEL_LABEL = 'Llama 3.2 (1B) · on-device'
export const MODEL_SIZE = '~0.9 GB'

export type { InitProgressReport }

export function webGPUAvailable(): boolean {
  return typeof navigator !== 'undefined' && 'gpu' in navigator
}

// Grounded system prompt built from the live portfolio data. Kept tight — small
// models follow short, explicit instructions best.
export function buildSystemPrompt(d: PortfolioData): string {
  const lines: Array<string | false | undefined> = []
  lines.push(
    `You are a helpful assistant on ${d.name}'s portfolio website. Answer questions about ${d.name} using ONLY the facts below. Speak in the third person, be brief (1-3 sentences), and never invent details. If the answer isn't in the facts, say you don't have that information and suggest using the contact section.`,
    '',
    'FACTS:',
    `Name: ${d.name}. Title: ${d.title}.`,
    d.contact.location && `Location: ${d.contact.location}.`,
    d.summary && `Summary: ${d.summary}`,
    '',
  )
  if (d.experience.length) {
    lines.push('Experience:')
    for (const e of d.experience) {
      lines.push(`- ${e.title} at ${e.company} (${e.startDate}–${e.endDate}): ${e.bullets.join(' ')}${e.tech?.length ? ` Tech: ${e.tech.join(', ')}.` : ''}`)
    }
    lines.push('')
  }
  if (d.skills.length) {
    lines.push('Skills:')
    for (const g of d.skills) lines.push(`- ${g.category}: ${g.items.join(', ')}`)
    lines.push('')
  }
  if (d.education.length) {
    lines.push('Education:', ...d.education.map(ed => `- ${ed.degree}, ${ed.institution}${ed.period ? ` (${ed.period})` : ''}${ed.score ? `, score ${ed.score}` : ''}`), '')
  }
  if (d.certifications.length) {
    lines.push('Certifications: ' + d.certifications.join('; '), '')
  }
  if (d.projects.length) {
    lines.push('Projects: ' + d.projects.map(p => `${p.name}${p.description ? ` (${p.description})` : ''}`).join('; '), '')
  }
  return lines.filter((l): l is string => typeof l === 'string').join('\n')
}

// Lazily create (and reuse) the WebLLM engine. Reports download/compile progress.
let enginePromise: Promise<MLCEngine> | null = null
export function loadEngine(onProgress: (r: InitProgressReport) => void): Promise<MLCEngine> {
  if (!enginePromise) {
    enginePromise = (async () => {
      const webllm = await import('@mlc-ai/web-llm')
      return webllm.CreateMLCEngine(LOCAL_MODEL, { initProgressCallback: onProgress })
    })().catch(err => { enginePromise = null; throw err })
  }
  return enginePromise
}

export async function streamLocalChat(opts: {
  engine: MLCEngine
  system: string
  messages: ChatMessage[]
  onText: (text: string) => void
}): Promise<void> {
  const completion = await opts.engine.chat.completions.create({
    messages: [{ role: 'system', content: opts.system }, ...opts.messages],
    stream: true,
    temperature: 0.3,
    max_tokens: 512,
  })
  for await (const chunk of completion) {
    const delta = chunk.choices[0]?.delta?.content ?? ''
    if (delta) opts.onText(delta)
  }
}
