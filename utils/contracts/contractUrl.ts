const DEFAULT_CDN_BASE = 'https://cdn.probusiness.pe'

/** Prefijo S3 en bucket (no siempre forma parte de la URL pública del CDN). */
const CDN_OBJECT_PREFIX = 'probusiness'

/** Solo limpia escapes JSON (`\/`) de la respuesta API; no altera rutas válidas del CDN. */
export function sanitizeContractUrlFromApi (
  raw: string | null | undefined
): string | null {
  if (raw == null) return null
  const value = String(raw).trim().replace(/\\\//g, '/')
  return value || null
}

/**
 * Quita /probusiness/ cuando la URL pública real es .../contratos/...
 * Ej. .../probusiness/contratos/foo.pdf → .../contratos/foo.pdf
 */
export function stripRedundantCdnObjectPrefix (url: string): string {
  try {
    const parsed = new URL(url)
    const segments = parsed.pathname.split('/').filter(Boolean)
    if (
      segments.length >= 2
      && segments[0].toLowerCase() === CDN_OBJECT_PREFIX
      && segments[1] === 'contratos'
    ) {
      segments.shift()
      parsed.pathname = `/${segments.join('/')}`
      return parsed.toString()
    }
  } catch {
    // URL relativa u otro formato: fallback por regex
    return url.replace(
      /(https?:\/\/[^/]+)\/probusiness\/(contratos\/)/i,
      '$1/$2'
    )
  }
  return url
}

/**
 * Normaliza rutas de contrato desde la API (URL CDN completa o ruta relativa en BD).
 */
export function normalizeContractStorageUrl (
  raw: string | null | undefined,
  cdnBase = DEFAULT_CDN_BASE
): string | null {
  if (raw == null) return null

  const value = sanitizeContractUrlFromApi(raw)
  if (!value) return null

  if (/^https?:\/\//i.test(value)) {
    return stripRedundantCdnObjectPrefix(value)
  }

  const base = cdnBase.replace(/\/+$/, '')
  let path = value.replace(/^\/+/, '')
  if (!path) return null

  // BD a veces guarda probusiness/contratos/...; en CDN público suele ser solo contratos/...
  if (path.toLowerCase().startsWith(`${CDN_OBJECT_PREFIX}/contratos/`)) {
    path = path.slice(CDN_OBJECT_PREFIX.length + 1)
  }

  return stripRedundantCdnObjectPrefix(`${base}/${path}`)
}

export function isAbsoluteHttpUrl (url: string): boolean {
  return /^https?:\/\//i.test(url.trim())
}

/** URLs a probar si la primera devuelve 403 (prefijo S3 duplicado). */
export function getContractPdfFetchUrls (url: string): string[] {
  const normalized = normalizeContractStorageUrl(url) ?? url.trim()
  const stripped = stripRedundantCdnObjectPrefix(normalized)
  return [...new Set([stripped, normalized].filter(Boolean))]
}

export async function fetchContractPdfArrayBuffer (url: string): Promise<ArrayBuffer> {
  const candidates = getContractPdfFetchUrls(url)
  let lastStatus = 0

  for (const candidate of candidates) {
    try {
      const response = await fetch(candidate, { mode: 'cors', credentials: 'omit' })
      if (response.ok) {
        return await response.arrayBuffer()
      }
      lastStatus = response.status
      console.warn('[contrato] fetch falló:', candidate, response.status)
    } catch (err) {
      console.warn('[contrato] fetch error:', candidate, err)
    }
  }

  throw new Error(
    lastStatus
      ? `No se pudo descargar el contrato (${lastStatus})`
      : 'No se pudo descargar el contrato'
  )
}
