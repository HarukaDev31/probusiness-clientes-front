import { DeliveryService } from "~/services/clientes/delivery/deliveryService"
import type { AgenciesOptions, AgenciesResponse, ClientesOptions, ClientesResponse } from "~/types/clientes/delivery/common"
import type { Horario, HorarioResponse } from "~/types/clientes/delivery/horario"

export const useDelivery = () => {
    const clientes = ref<ClientesOptions[]>([])
    const loading = ref(false)
    const loadingHorarios = ref(false)
    const carga = ref<string | null>(null)
    const agencies = ref<AgenciesOptions[]>([])
    const horarios = ref<Horario[]>([])
    const getDeliveryByConsolidadoId = async (id: number): Promise<ClientesResponse> => {
        loading.value = true
        try {
            const response = await DeliveryService.getDeliveryByConsolidadoId(id)
            clientes.value = response.data
            carga.value = response.carga
            loading.value = false
            return response
        } catch (error) {
            console.error('Error al obtener el delivery por consolidado id:', error)
        } finally {
            loading.value = false
        }
    }
    const getDeliveryAgency = async (): Promise<AgenciesResponse> => {
        loading.value = true
        try {
            const response = await DeliveryService.getDeliveryAgency()
            agencies.value = response.data
            loading.value = false
            return response
        } catch (error) {
            console.error('Error al obtener el delivery por agency:', error)
        } finally {
            loading.value = false
        }
    }
    const saveDeliveryProvincia = async (data: any): Promise<any> => {
        loading.value = true
        try {
            const response = await DeliveryService.saveDeliveryProvincia(data)
            loading.value = false
            return response
        } catch (error) {
            throw error
        } finally {
            loading.value = false
        }
    }
    const saveDeliveryLima = async (data: any): Promise<any> => {
        loading.value = true
        try {
            const response = await DeliveryService.saveDeliveryLima(data)
            loading.value = false
            return response
        } catch (error) {
            throw error
        } finally {
            loading.value = false
        }
    }
    const getHorariosDisponibles = async (idConsolidado: number): Promise<HorarioResponse> => {
        loadingHorarios.value = true
        try {
            const response = await DeliveryService.getHorariosDisponibles(idConsolidado)
            horarios.value = response.data
            return response
        } catch (error) {
            throw error
        } finally {
            loadingHorarios.value = false
        }
    }
    const loadingFormulario = ref(false)
    const getFormularioLimaByCotizacion = async (cotizacionUuid: string): Promise<any> => {
        loadingFormulario.value = true
        try {
            const response = await DeliveryService.getFormularioLimaByCotizacion(cotizacionUuid)
            return response
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
        loadingFormulario
    }
}