const DEFAULT_CDN_BASE = 'https://cdn.probusiness.pe'

/**
 * Normaliza rutas de contrato desde la API (URL CDN completa o ruta relativa en BD).
 * Ej: https://cdn.probusiness.pe/contratos/contrato_cotizacion_9544_....pdf
 */
export function normalizeContractStorageUrl (
  raw: string | null | undefined,
  cdnBase = DEFAULT_CDN_BASE
): string | null {
  if (raw == null) return null

  let value = String(raw).trim()
  if (!value) return null

  value = value.replace(/\\\//g, '/')

  if (/^https?:\/\//i.test(value)) {
    return value
  }

  const base = cdnBase.replace(/\/+$/, '')
  const path = value.replace(/^\/+/, '')
  if (!path) return null

  return `${base}/${path}`
}

export function isAbsoluteHttpUrl (url: string): boolean {
  return /^https?:\/\//i.test(url.trim())
}
