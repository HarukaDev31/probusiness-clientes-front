import { OptionsService } from '../services/commons/optionsService'

export type PaisOption = {
  value: number
  label: string
  iso2?: string | null
  phone_code?: string | null
  flag_url?: string | null
}

export type MedioEncontradoOption = {
  value: number
  label: string
}

/** Catálogo v2 (org nueva). Fallback si la API no responde. */
const MEDIOS_V2_FALLBACK: MedioEncontradoOption[] = [
  { value: 1, label: 'TikTok' },
  { value: 2, label: 'Facebook' },
  { value: 3, label: 'Instagram' },
  { value: 4, label: 'YouTube' },
  { value: 9, label: 'Recomendado' },
  { value: 7, label: 'Google' },
  { value: 8, label: 'Otros' }
]

export const useOptions = () => {
  const paises = ref<PaisOption[]>([])
  const defaultPaisId = ref<number | null>(null)
  const mediosEncontrado = ref<MedioEncontradoOption[]>([...MEDIOS_V2_FALLBACK])
  const mediosOtrosCodes = ref<number[]>([6, 8])
  const mediosVersion = ref<'v1' | 'v2'>('v2')

  const getPaises = async () => {
    try {
      const response = await OptionsService.getPaises()
      paises.value = Array.isArray(response?.data) ? response.data : []
      defaultPaisId.value = response?.default_pais_id
        ? Number(response.default_pais_id)
        : null
    } catch (error) {
      console.error('Error en useOptions.getPaises:', error)
    }
  }

  /**
   * Este portal usa catálogo v2 (Recomendado + Google).
   * La API también acepta v1 (main/master) en el mismo endpoint de registro.
   */
  const getMediosEncontrado = async () => {
    try {
      const response = await OptionsService.getMediosEncontrado('v2')
      if (Array.isArray(response?.data) && response.data.length) {
        mediosEncontrado.value = response.data.map((item) => ({
          value: Number(item.value),
          label: String(item.label)
        }))
      }
      if (Array.isArray(response?.otros_codes) && response.otros_codes.length) {
        mediosOtrosCodes.value = response.otros_codes.map(Number)
      }
      if (response?.version === 'v1' || response?.version === 'v2') {
        mediosVersion.value = response.version
      }
    } catch (error) {
      console.error('Error en useOptions.getMediosEncontrado:', error)
      mediosEncontrado.value = [...MEDIOS_V2_FALLBACK]
      mediosOtrosCodes.value = [6, 8]
      mediosVersion.value = 'v2'
    }
  }

  return {
    paises,
    defaultPaisId,
    getPaises,
    mediosEncontrado,
    mediosOtrosCodes,
    mediosVersion,
    getMediosEncontrado
  }
}
