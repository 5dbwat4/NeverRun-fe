export interface SSEEvent {
  type: string
  step: string
  message: string
  data?: unknown
  checks?: unknown
  sportId?: string
}

export function createSSEStream(url: string, body: unknown, onEvent: (event: SSEEvent) => void): AbortController {
  const controller = new AbortController()

  void (async () => {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      })

      if (!response.ok) {
        onEvent({ type: 'error', step: 'http', message: `HTTP ${response.status}` })
        return
      }

      const reader = response.body?.getReader()
      if (!reader) return

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const event = JSON.parse(line.slice(6)) as SSEEvent
              onEvent(event)
            } catch {
              // skip malformed
            }
          }
        }
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        onEvent({ type: 'error', step: 'network', message: (err as Error).message })
      }
    }
  })()

  return controller
}
