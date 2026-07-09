const LS_DEBUG_KEY = 'client_events_debug'
const MAX_TRACES = 300

export type ClientEventTraceEntry = {
  t: number
  iso: string
  event: string
  page?: string
  level: 'log' | 'warn' | 'error'
  metadata?: Record<string, unknown>
}

function traceBuffer(): ClientEventTraceEntry[] {
  if (!import.meta.client) return []
  const w = globalThis as typeof globalThis & { __clientEventTraces?: ClientEventTraceEntry[] }
  if (!w.__clientEventTraces) w.__clientEventTraces = []
  return w.__clientEventTraces
}

function shouldLogToConsole(): boolean {
  if (!import.meta.client) return false
  if (import.meta.dev) return true
  try {
    return localStorage.getItem(LS_DEBUG_KEY) === '1'
  } catch {
    return false
  }
}

export function getClientEventTraces(limit = 80): ClientEventTraceEntry[] {
  return traceBuffer().slice(-limit)
}

export function clearClientEventTraces() {
  const w = globalThis as typeof globalThis & { __clientEventTraces?: ClientEventTraceEntry[] }
  w.__clientEventTraces = []
}

export function isClientEventDebug(): boolean {
  return shouldLogToConsole()
}

export function enableClientEventDebug() {
  if (!import.meta.client) return
  localStorage.setItem(LS_DEBUG_KEY, '1')
  clientEventTrace('debug.enabled', { page: window.location.pathname })
  window.alert('[ClientEvents] Debug activado. Recarga la página (F5).')
}

export function disableClientEventDebug() {
  if (!import.meta.client) return
  localStorage.removeItem(LS_DEBUG_KEY)
  window.alert('[ClientEvents] Debug desactivado. Recarga la página.')
}

export function clientEventTrace(
  event: string,
  options: {
    page?: string
    metadata?: Record<string, unknown>
    level?: 'log' | 'warn' | 'error'
  } = {}
) {
  if (!import.meta.client) return

  const level = options.level ?? 'log'
  const entry: ClientEventTraceEntry = {
    t: Date.now(),
    iso: new Date().toISOString(),
    event,
    level,
    ...(options.page ? { page: options.page } : {}),
    ...(options.metadata && Object.keys(options.metadata).length > 0 ? { metadata: options.metadata } : {})
  }

  const buf = traceBuffer()
  buf.push(entry)
  if (buf.length > MAX_TRACES) buf.splice(0, buf.length - MAX_TRACES)

  if (!shouldLogToConsole()) return

  const label = `[ClientEvent] ${event}`
  try {
    if (level === 'error') {
      if (entry.metadata) console.error(label, entry.metadata)
      else console.error(label)
    } else if (level === 'warn') {
      if (entry.metadata) console.warn(label, entry.metadata)
      else console.warn(label)
    } else if (entry.metadata) {
      console.info(label, entry.metadata)
    } else {
      console.info(label)
    }
  } catch {
    /* drop_console en prod puede dejar stubs rotos */
  }
}

export function exposeClientEventDiagnostics(getState?: () => Record<string, unknown>) {
  if (!import.meta.client) return

  const w = globalThis as typeof globalThis & {
    __clientEventTraces?: ClientEventTraceEntry[]
    __clientEventDiag?: () => Record<string, unknown>
    clearClientEventTraces?: () => void
    enableClientEventDebug?: () => void
    disableClientEventDebug?: () => void
    getClientEventTraces?: (limit?: number) => ClientEventTraceEntry[]
  }

  w.__clientEventTraces = w.__clientEventTraces ?? []
  w.clearClientEventTraces = clearClientEventTraces
  w.getClientEventTraces = getClientEventTraces
  w.enableClientEventDebug = enableClientEventDebug
  w.disableClientEventDebug = disableClientEventDebug

  w.__clientEventDiag = () => ({
    ...(getState?.() ?? {}),
    traces: getClientEventTraces(100),
    debug: shouldLogToConsole(),
    hint: 'Historial en memoria: __clientEventTraces'
  })

  clientEventTrace('diag.exposed', {
    metadata: { traces: traceBuffer().length, prod: !import.meta.dev }
  })
}
