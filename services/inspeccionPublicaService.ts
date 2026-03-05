/**
 * Servicio para obtener inspección por UUID sin autenticación (acceso público).
 * Llama a GET /api/contenedor/external/inspeccion/{uuid}
 */
import type { InspeccionPublicaResponse } from '~/types/inspeccionPublica'

export const getInspeccionByUuid = async (uuid: string): Promise<InspeccionPublicaResponse> => {
  const config = useRuntimeConfig()
  const baseUrl = config.public.apiBaseUrl
  const url = `${baseUrl}/api/contenedor/external/inspeccion/${uuid}`

  const response = await $fetch<InspeccionPublicaResponse>(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  })

  return response
}
