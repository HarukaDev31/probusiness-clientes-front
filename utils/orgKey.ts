/**
 * Header X-Org-Key desde runtimeConfig.public.orgKey.
 * Vacío o ausente → las llamadas fallan en el front (no se envían) y el back responde 403.
 */
export function getOrgKeyHeader(): Record<string, string> {
  const config = useRuntimeConfig()
  const key = String(config.public.orgKey || '').trim()
  if (!key) {
    throw new Error('NUXT_PUBLIC_ORG_KEY no configurado: no se puede llamar a la API sin organización')
  }
  return { 'X-Org-Key': key }
}

export function getOrgKeyOrEmpty(): string {
  const config = useRuntimeConfig()
  return String(config.public.orgKey || '').trim()
}
