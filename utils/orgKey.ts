/**
 * Header X-Org-Key desde runtimeConfig.public.orgKey.
 * Vacío o ausente → las llamadas fallan en el front (no se envían) y el back responde 403.
 */
export function getOrgKeyHeader(): Record<string, string> {
  const key = getOrgKeyOrEmpty()
  if (!key) {
    return {}
  }
  return { 'X-Org-Key': key }
}

export function getOrgKeyOrEmpty(): string {
  const config = useRuntimeConfig()
  return String(config.public.orgKey || '').trim()
}
