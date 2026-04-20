import { BaseService } from "../base/BaseService"

export class LocationService extends BaseService {
    private static baseUrl = '/api/clientes/ubicacion'

    static async getDepartamentos() {
        try {
            console.log('📡 LocationService: Llamando a API departamentos...')
            console.log('🔗 URL:', `${this.baseUrl}/departamentos`)
            const response = await this.apiCall<any>(`${this.baseUrl}/departamentos`)
            console.log('✅ LocationService: Respuesta de departamentos:', response)
            return response
        } catch (error) {
            console.error('❌ LocationService: Error al obtener departamentos:', error)
            throw error
        }
    }

    static async getProvincias(departamentoId) {
        try {
            const response = await this.apiCall<any>(`${this.baseUrl}/provincias/${departamentoId}`, {

            })
            return response
        } catch (error) {
            console.error('Error al obtener provincias:', error)
            throw error
        }
    }
    static async getAllProvincias() {
        try {
            const response = await this.apiCall<any>(`${this.baseUrl}/provincias`, {

            })
            return response
        } catch (error) {
            console.error('Error al obtener provincias:', error)
            throw error
        }
    }
    static async getDistritos(provinciaId) {
        try {
            const response = await this.apiCall<any>(`${this.baseUrl}/distritos/${provinciaId}`, {

            })
            return response
        } catch (error) {
            console.error('Error al obtener distritos:', error)
            throw error
        }
    }

    /**
     * Distritos paginados para autocomplete (UInputMenu / async items).
     * GET /api/clientes/ubicacion/distritos/search?q=&page=&per_page=
     */
    static async searchDistritosPaginated (params: {
        q?: string
        page?: number
        per_page?: number
    }) {
        const q = new URLSearchParams()
        if (params.q != null && String(params.q).trim() !== '') {
            q.set('q', String(params.q).trim())
        }
        if (params.page != null) q.set('page', String(params.page))
        if (params.per_page != null) q.set('per_page', String(params.per_page))
        const qs = q.toString()
        const url = `${this.baseUrl}/distritos/search${qs ? `?${qs}` : ''}`
        return await this.apiCall<{
            success: boolean
            data: Array<{
                value: number
                label: string
                nombre_distrito: string
                id_provincia: number | null
            }>
            meta: {
                current_page: number
                last_page: number
                per_page: number
                total: number
                from: number | null
                to: number | null
            }
        }>(url)
    }
}