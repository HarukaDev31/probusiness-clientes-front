import { BaseService } from "~/services/base/BaseService"
import type { ClientesResponse, AgenciesResponse } from "~/types/clientes/delivery/common"
import type { HorarioResponse } from "~/types/clientes/delivery/horario"

export class DeliveryService extends BaseService {
    private static baseUrl = 'api/clientes/delivery'

    static async getDeliveryByConsolidadoId(id: number): Promise<ClientesResponse> {
        try {
            const response = await this.apiCall<any>(`${this.baseUrl}/${id}`)
            return response
        } catch (error) {
            console.error('Error al obtener el delivery por consolidado id:', error)
            throw error
        }
    }
    static async getDeliveryAgency(): Promise<AgenciesResponse> {
        try {
            const response = await this.apiCall<AgenciesResponse>(`${this.baseUrl}/agencies`)
            return response
        } catch (error) {
            console.error('Error al obtener el delivery por agency:', error)
            throw error
        }
    }
    static async saveDeliveryProvincia(data: any): Promise<any> {
        try {
            const response = await this.apiCall<any>(`${this.baseUrl}/provincia`, {
                method: 'POST',
                body: data
            })
            return response
        } catch (error) {
            console.error('Error al guardar el delivery por provincia:', error)
            throw error
        }

    }
    static async saveDeliveryLima(data: any): Promise<any> {
        try {
            const response = await this.apiCall<any>(`${this.baseUrl}/lima`, {
                method: 'POST',
                body: data
            })
            return response
        } catch (error: any) {
            console.error('Error al guardar el delivery por lima:', error)
            // Retornar un objeto con información del error en lugar de lanzar la excepción
            return {
                success: false,
                error: error?.response?.data?.message ||
                       error?.data?.message ||
                       error?.message ||
                       'Error al guardar los datos',
                statusCode: error?.status || error?.statusCode || 500
            }
        }
    }
    static async getHorariosDisponibles(idConsolidado: number): Promise<HorarioResponse> {
        try {
            const response = await this.apiCall<HorarioResponse>(`${this.baseUrl}/horarios-disponibles/${idConsolidado}`)
            return response
        }
        catch (error) {
            console.error('Error al obtener los horarios disponibles:', error)
            throw error
        }
    }
    static async getFormularioLimaByCotizacion(cotizacionUuid: string): Promise<any> {
        try {
            const response = await this.apiCall<any>(`${this.baseUrl}/formulario-lima/${cotizacionUuid}`)
            return response
        } catch (error) {
            console.error('Error al obtener el formulario de Lima por cotización:', error)
            throw error
        }
    }
}