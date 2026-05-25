import { useLocation } from '~/composables/commons/useLocation'
import { DeliveryService } from '~/services/clientes/delivery/deliveryService'
import type { AgenciesOptions, AgenciesResponse, ClientesOptions, ClientesResponse } from '~/types/clientes/delivery/common'
import type { Horario, HorarioResponse } from '~/types/clientes/delivery/horario'
import type { UsuarioDatosFacturacionDto, UsuarioDatosFacturacionResponse } from '~/types/clientes/delivery/usuarioDatosFacturacion'

type DestinoFacturacion = 'Lima' | 'Provincia'

/** Promesas en vuelo compartidas entre todas las instancias de useDelivery() */
let fetchConsolidadoInflight: Promise<ClientesResponse | undefined> | null = null
let fetchAgenciesInflight: Promise<AgenciesResponse | undefined> | null = null
const fetchHorariosInflight = new Map<number, Promise<HorarioResponse | undefined>>()
const fetchUsuarioDatosInflight = new Map<DestinoFacturacion, Promise<UsuarioDatosFacturacionResponse>>()
let fetchHasDatosFacturacionInflight: Promise<boolean> | null = null

/**
 * Estado compartido (useState) para formularios de entrega Lima/Provincia.
 */
export const useDelivery = () => {
  const clientes = useState<ClientesOptions[]>('delivery:clientes', () => [])
  const carga = useState<string | null>('delivery:carga', () => null)
  const loading = useState('delivery:loading', () => false)
  const loadingHorarios = useState('delivery:loadingHorarios', () => false)
  const agencies = useState<AgenciesOptions[]>('delivery:agencies', () => [])
  const horarios = useState<Horario[]>('delivery:horarios', () => [])
  const loadingFormulario = useState('delivery:loadingFormulario', () => false)

  const consolidadoIdLoaded = useState<number | null>('delivery:consolidadoIdLoaded', () => null)
  const agenciesLoaded = useState('delivery:agenciesLoaded', () => false)
  const horariosConsolidadoId = useState<number | null>('delivery:horariosConsolidadoId', () => null)

  const provinciaCatalogsReady = useState('delivery:provinciaCatalogsReady', () => false)
  const limaCatalogsReady = useState('delivery:limaCatalogsReady', () => false)
  const provinciaFormBootstrapped = useState('delivery:provinciaFormBootstrapped', () => false)
  const limaFormBootstrapped = useState('delivery:limaFormBootstrapped', () => false)

  const usuarioDatosByDestino = useState<Partial<Record<DestinoFacturacion, UsuarioDatosFacturacionDto | null>>>(
    'delivery:usuarioDatosByDestino',
    () => ({})
  )
  const usuarioDatosFetched = useState<Partial<Record<DestinoFacturacion, boolean>>>(
    'delivery:usuarioDatosFetched',
    () => ({})
  )
  const ultimoDestinoUsuario = useState<string | null>('delivery:ultimoDestinoUsuario', () => null)
  const limaNotifyModalHandled = useState('delivery:limaNotifyModalHandled', () => false)
  const loadingUsuarioDatos = useState('delivery:loadingUsuarioDatos', () => false)
  const hasDatosFacturacion = useState<boolean | null>('delivery:hasDatosFacturacion', () => null)

  function resetConsolidadoCache () {
    clientes.value = []
    carga.value = null
    consolidadoIdLoaded.value = null
    horarios.value = []
    horariosConsolidadoId.value = null
    provinciaCatalogsReady.value = false
    limaCatalogsReady.value = false
    provinciaFormBootstrapped.value = false
    limaFormBootstrapped.value = false
    limaNotifyModalHandled.value = false
    usuarioDatosFetched.value = {}
    usuarioDatosByDestino.value = {}
    ultimoDestinoUsuario.value = null
    hasDatosFacturacion.value = null
    fetchConsolidadoInflight = null
    fetchHorariosInflight.clear()
    fetchUsuarioDatosInflight.clear()
    fetchHasDatosFacturacionInflight = null
  }

  function invalidateDatosFacturacionCache () {
    hasDatosFacturacion.value = null
    usuarioDatosFetched.value = {}
    usuarioDatosByDestino.value = {}
    ultimoDestinoUsuario.value = null
    fetchUsuarioDatosInflight.clear()
    fetchHasDatosFacturacionInflight = null
  }

  /** ¿El usuario ya tiene filas en usuario_datos_facturacion? */
  const checkHasDatosFacturacion = async (): Promise<boolean> => {
    if (hasDatosFacturacion.value !== null) {
      return hasDatosFacturacion.value
    }

    if (fetchHasDatosFacturacionInflight) {
      return fetchHasDatosFacturacionInflight
    }

    loadingUsuarioDatos.value = true
    fetchHasDatosFacturacionInflight = (async () => {
      try {
        const response = await DeliveryService.getUsuarioDatosFacturacion()
        syncUltimoDestinoFromResponse(response)
        const has = !!(response.data || response.ultimo_destino)
        hasDatosFacturacion.value = has
        return has
      } catch (error) {
        console.error('Error al verificar datos de facturación:', error)
        hasDatosFacturacion.value = false
        return false
      } finally {
        loadingUsuarioDatos.value = false
        fetchHasDatosFacturacionInflight = null
      }
    })()

    return fetchHasDatosFacturacionInflight
  }

  const getDeliveryByConsolidadoId = async (id: number): Promise<ClientesResponse | undefined> => {
    if (consolidadoIdLoaded.value !== null && consolidadoIdLoaded.value !== id) {
      resetConsolidadoCache()
    }

    if (consolidadoIdLoaded.value === id) {
      return {
        success: true,
        data: clientes.value,
        carga: carga.value ?? ''
      }
    }

    if (fetchConsolidadoInflight) {
      return fetchConsolidadoInflight
    }

    loading.value = true
    fetchConsolidadoInflight = (async () => {
      try {
        const response = await DeliveryService.getDeliveryByConsolidadoId(id)
        clientes.value = response.data
        carga.value = response.carga
        consolidadoIdLoaded.value = id
        return response
      } catch (error) {
        console.error('Error al obtener el delivery por consolidado id:', error)
        clientes.value = []
        carga.value = null
        consolidadoIdLoaded.value = null
        return undefined
      } finally {
        loading.value = false
        fetchConsolidadoInflight = null
      }
    })()

    return fetchConsolidadoInflight
  }

  const getDeliveryAgency = async (): Promise<AgenciesResponse | undefined> => {
    if (agenciesLoaded.value) {
      return { success: true, data: agencies.value }
    }

    if (fetchAgenciesInflight) {
      return fetchAgenciesInflight
    }

    loading.value = true
    fetchAgenciesInflight = (async () => {
      try {
        const response = await DeliveryService.getDeliveryAgency()
        agencies.value = response.data
        agenciesLoaded.value = true
        return response
      } catch (error) {
        console.error('Error al obtener el delivery por agency:', error)
        return undefined
      } finally {
        loading.value = false
        fetchAgenciesInflight = null
      }
    })()

    return fetchAgenciesInflight
  }

  const syncUltimoDestinoFromResponse = (response: UsuarioDatosFacturacionResponse) => {
    if (response.ultimo_destino != null && String(response.ultimo_destino).trim() !== '') {
      ultimoDestinoUsuario.value = response.ultimo_destino
      return
    }
    const fromData = response.data?.destino
    if (fromData != null && String(fromData).trim() !== '') {
      ultimoDestinoUsuario.value = fromData
    }
  }

  const getUsuarioDatosFacturacion = async (
    destino: DestinoFacturacion
  ): Promise<UsuarioDatosFacturacionResponse> => {
    if (usuarioDatosFetched.value[destino] && ultimoDestinoUsuario.value != null) {
      return {
        success: true,
        data: usuarioDatosByDestino.value[destino] ?? null,
        ultimo_destino: ultimoDestinoUsuario.value
      }
    }

    const inflight = fetchUsuarioDatosInflight.get(destino)
    if (inflight) {
      return inflight
    }

    loadingUsuarioDatos.value = true
    const promise = (async () => {
      try {
        const response = await DeliveryService.getUsuarioDatosFacturacion(destino)
        usuarioDatosByDestino.value = { ...usuarioDatosByDestino.value, [destino]: response.data ?? null }
        usuarioDatosFetched.value = { ...usuarioDatosFetched.value, [destino]: true }
        syncUltimoDestinoFromResponse(response)
        return response
      } catch (error) {
        console.error('Error al obtener usuario_datos_facturacion:', error)
        usuarioDatosByDestino.value = { ...usuarioDatosByDestino.value, [destino]: null }
        usuarioDatosFetched.value = { ...usuarioDatosFetched.value, [destino]: true }
        return { success: false, data: null, message: 'Error al cargar datos de facturación' }
      } finally {
        loadingUsuarioDatos.value = false
        fetchUsuarioDatosInflight.delete(destino)
      }
    })()

    fetchUsuarioDatosInflight.set(destino, promise)
    return promise
  }

  /** Catálogos de Provincia (consolidado + agencias + ubicación). Sin red si ya están listos. */
  const ensureProvinciaCatalogs = async (consolidadoId: number) => {
    const { getDepartamentos, getProvincias, getDistritos } = useLocation()

    await getDeliveryByConsolidadoId(consolidadoId)
    if (provinciaCatalogsReady.value) {
      return
    }

    await Promise.all([
      getDeliveryAgency(),
      getDepartamentos(),
      getProvincias('1'),
      getDistritos('1')
    ])
    provinciaCatalogsReady.value = true
  }

  /** Catálogos de Lima (consolidado + distritos). Sin red si ya están listos. */
  const ensureLimaCatalogs = async (consolidadoId: number) => {
    const { getDistritos } = useLocation()

    await getDeliveryByConsolidadoId(consolidadoId)
    if (limaCatalogsReady.value) {
      return
    }

    await getDistritos('1')
    limaCatalogsReady.value = true
  }

  /** Catálogos Lima + horarios + último destino (al entrar al formulario). */
  const ensureLimaFormReady = async (consolidadoId: number) => {
    await ensureLimaCatalogs(consolidadoId)
    await Promise.all([
      getHorariosDisponibles(consolidadoId),
      getUsuarioDatosFacturacion('Lima')
    ])
  }

  const horariosLoadedFor = (consolidadoId: number) =>
    horariosConsolidadoId.value === consolidadoId && !loadingHorarios.value

  /** Falta algo en store para Lima (hay que ir a red). */
  const needsLimaInitialLoad = (consolidadoId: number) => {
    if (!Number.isFinite(consolidadoId) || consolidadoId <= 0) return false
    if (consolidadoIdLoaded.value !== consolidadoId) return true
    if (!limaCatalogsReady.value) return true
    if (!horariosLoadedFor(consolidadoId)) return true
    return false
  }

  /** Carga en curso o datos aún no listos en store para mostrar el formulario Lima. */
  const isLimaFormLoading = (consolidadoId: number) => {
    if (!Number.isFinite(consolidadoId) || consolidadoId <= 0) return false
    const { loadingDistritos } = useLocation()
    if (loading.value) return true
    if (loadingHorarios.value) return true
    if (loadingUsuarioDatos.value) return true
    if (loadingDistritos.value && !limaCatalogsReady.value) return true
    if (consolidadoIdLoaded.value !== consolidadoId) return true
    if (!horariosLoadedFor(consolidadoId)) return true
    if (!limaCatalogsReady.value) return true
    return false
  }

  const solicitarNotificacionHorariosLima = async () => {
    const response = await DeliveryService.solicitarNotificacionHorariosLima()
    if (response.success) {
      ultimoDestinoUsuario.value = 'Lima'
    }
    return response
  }

  const saveDeliveryProvincia = async (data: any): Promise<any> => {
    loading.value = true
    try {
      return await DeliveryService.saveDeliveryProvincia(data)
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  const saveDeliveryLima = async (data: any): Promise<any> => {
    loading.value = true
    try {
      return await DeliveryService.saveDeliveryLima(data)
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  const getHorariosDisponibles = async (idConsolidado: number): Promise<HorarioResponse | undefined> => {
    if (horariosConsolidadoId.value === idConsolidado) {
      return { success: true, data: horarios.value }
    }

    const inflight = fetchHorariosInflight.get(idConsolidado)
    if (inflight) {
      return inflight
    }

    loadingHorarios.value = true
    const promise = (async () => {
      try {
        const response = await DeliveryService.getHorariosDisponibles(idConsolidado)
        horarios.value = response.data
        horariosConsolidadoId.value = idConsolidado
        return response
      } catch (error) {
        throw error
      } finally {
        loadingHorarios.value = false
        fetchHorariosInflight.delete(idConsolidado)
      }
    })()

    fetchHorariosInflight.set(idConsolidado, promise)
    return promise
  }

  const getFormularioLimaByCotizacion = async (cotizacionUuid: string): Promise<any> => {
    loadingFormulario.value = true
    try {
      return await DeliveryService.getFormularioLimaByCotizacion(cotizacionUuid)
    } catch (error) {
      throw error
    } finally {
      loadingFormulario.value = false
    }
  }

  return {
    getDeliveryByConsolidadoId,
    clientes,
    carga,
    loading,
    loadingHorarios,
    getDeliveryAgency,
    agencies,
    saveDeliveryProvincia,
    getHorariosDisponibles,
    horarios,
    saveDeliveryLima,
    getFormularioLimaByCotizacion,
    loadingFormulario,
    consolidadoIdLoaded,
    getUsuarioDatosFacturacion,
    ensureProvinciaCatalogs,
    ensureLimaCatalogs,
    ensureLimaFormReady,
    solicitarNotificacionHorariosLima,
    ultimoDestinoUsuario,
    horariosConsolidadoId,
    horariosLoadedFor,
    needsLimaInitialLoad,
    isLimaFormLoading,
    loadingUsuarioDatos,
    limaNotifyModalHandled,
    provinciaCatalogsReady,
    limaCatalogsReady,
    provinciaFormBootstrapped,
    limaFormBootstrapped,
    checkHasDatosFacturacion,
    invalidateDatosFacturacionCache,
    hasDatosFacturacion
  }
}
