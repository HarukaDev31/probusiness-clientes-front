import { LocationService } from '~/services/commons/locationService'

type LocationOption = { label: string; value: string | number }

let fetchDepartamentosInflight: Promise<unknown> | null = null
const fetchProvinciasInflight = new Map<string, Promise<unknown>>()
const fetchDistritosInflight = new Map<string, Promise<unknown>>()

/**
 * Catálogos de ubicación compartidos entre formularios (Lima / Provincia).
 */
export const useLocation = () => {
  const departamentos = useState<LocationOption[]>('location:departamentos', () => [])
  const provincias = useState<LocationOption[]>('location:provincias', () => [])
  const distritos = useState<LocationOption[]>('location:distritos', () => [])
  const loadingDepartamentos = useState('location:loadingDepartamentos', () => false)
  const loadingProvincias = useState('location:loadingProvincias', () => false)
  const loadingDistritos = useState('location:loadingDistritos', () => false)

  const departamentosLoaded = useState('location:departamentosLoaded', () => false)
  const provinciasLoadedByDepto = useState<Record<string, boolean>>('location:provinciasLoadedByDepto', () => ({}))
  const distritosLoadedByProvincia = useState<Record<string, boolean>>('location:distritosLoadedByProvincia', () => ({}))
  const provinciasByDepto = useState<Record<string, LocationOption[]>>('location:provinciasByDepto', () => ({}))
  const distritosByProvincia = useState<Record<string, LocationOption[]>>('location:distritosByProvincia', () => ({}))

  const getDepartamentos = async () => {
    if (departamentosLoaded.value) {
      return { data: departamentos.value.map(d => ({ id: d.value, nombre: d.label })) }
    }

    if (fetchDepartamentosInflight) {
      return fetchDepartamentosInflight
    }

    loadingDepartamentos.value = true
    fetchDepartamentosInflight = (async () => {
      const testData = [
        { id: '1', nombre: 'Lima' },
        { id: '2', nombre: 'Arequipa' },
        { id: '3', nombre: 'Cusco' },
        { id: '4', nombre: 'La Libertad' },
        { id: '5', nombre: 'Piura' }
      ]

      try {
        try {
          const response = await LocationService.getDepartamentos()
          departamentos.value = response.data.map((departamento: any) => ({
            label: departamento.nombre,
            value: departamento.id
          }))
          departamentosLoaded.value = true
          return response
        } catch (apiError) {
          console.warn('Error en API departamentos, usando datos de prueba:', apiError)
          departamentos.value = testData.map((departamento: any) => ({
            label: departamento.nombre,
            value: departamento.id
          }))
          departamentosLoaded.value = true
          return { data: testData }
        }
      } catch (error) {
        console.error('Error en getDepartamentos:', error)
      } finally {
        loadingDepartamentos.value = false
        fetchDepartamentosInflight = null
      }
    })()

    return fetchDepartamentosInflight
  }

  const getProvincias = async (departamentoId: string) => {
    if (provinciasLoadedByDepto.value[departamentoId]) {
      provincias.value = provinciasByDepto.value[departamentoId] ?? []
      return { data: provincias.value.map(p => ({ id: p.value, nombre: p.label })) }
    }

    const inflight = fetchProvinciasInflight.get(departamentoId)
    if (inflight) {
      return inflight
    }

    loadingProvincias.value = true
    const promise = (async () => {
      try {
        const response = await LocationService.getProvincias(departamentoId)
        const mapped = response.data.map((provincia: any) => ({
          label: provincia.nombre,
          value: provincia.id
        }))
        provinciasByDepto.value = { ...provinciasByDepto.value, [departamentoId]: mapped }
        provinciasLoadedByDepto.value = { ...provinciasLoadedByDepto.value, [departamentoId]: true }
        provincias.value = mapped
        return response
      } catch (error) {
        console.error('Error en getProvincias:', error)
      } finally {
        loadingProvincias.value = false
        fetchProvinciasInflight.delete(departamentoId)
      }
    })()

    fetchProvinciasInflight.set(departamentoId, promise)
    return promise
  }

  const getAllProvincias = async () => {
    try {
      const response = await LocationService.getAllProvincias()
      provincias.value = response.data
      return response
    } catch (error) {
      console.error('Error en getAllProvincias:', error)
    }
  }

  const getDistritos = async (provinciaId: string) => {
    if (distritosLoadedByProvincia.value[provinciaId]) {
      distritos.value = distritosByProvincia.value[provinciaId] ?? []
      return { data: distritos.value.map(d => ({ id: d.value, nombre: d.label })) }
    }

    const inflight = fetchDistritosInflight.get(provinciaId)
    if (inflight) {
      return inflight
    }

    loadingDistritos.value = true
    const promise = (async () => {
      try {
        const response = await LocationService.getDistritos(provinciaId)
        const mapped = response.data.map((distrito: any) => ({
          label: distrito.nombre,
          value: distrito.id
        }))
        distritosByProvincia.value = { ...distritosByProvincia.value, [provinciaId]: mapped }
        distritosLoadedByProvincia.value = { ...distritosLoadedByProvincia.value, [provinciaId]: true }
        distritos.value = mapped
        return response
      } catch (error) {
        console.error('Error en getDistritos:', error)
      } finally {
        loadingDistritos.value = false
        fetchDistritosInflight.delete(provinciaId)
      }
    })()

    fetchDistritosInflight.set(provinciaId, promise)
    return promise
  }

  const searchDistritosPaginated = async (opts: { q?: string; page?: number; per_page?: number }) => {
    const res = await LocationService.searchDistritosPaginated(opts)
    if (!res?.success) {
      return { items: [] as { label: string; value: number }[], meta: null as typeof res.meta | null }
    }
    const items = (res.data || []).map((row) => ({
      label: row.label,
      value: row.value
    }))
    return { items, meta: res.meta }
  }

  return {
    getDepartamentos,
    getProvincias,
    getAllProvincias,
    getDistritos,
    searchDistritosPaginated,
    departamentos,
    provincias,
    distritos,
    loadingDepartamentos,
    loadingProvincias,
    loadingDistritos
  }
}
