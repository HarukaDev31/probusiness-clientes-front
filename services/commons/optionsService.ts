import { BaseService } from "../base/BaseService"

export class OptionsService extends BaseService {
    private static baseUrl = 'api/options'

    static async getPaises(): Promise<{
    success?: boolean
    data?: Array<{
      value: number
      label: string
      iso2?: string | null
      phone_code?: string | null
      flag_url?: string | null
    }>
    default_pais_id?: number | null
  }> {
    try {
      const response = await this.apiCall<any>(`${this.baseUrl}/paises`, {
        method: 'GET'
      })
      return response
    }
    catch (error) {
      console.error('Error en OptionsService.getPaises:', error)
      throw error
    }
  }

  static async getMediosEncontrado(version: 'v1' | 'v2' = 'v2'): Promise<{
    success?: boolean
    version?: 'v1' | 'v2'
    otros_codes?: number[]
    data?: Array<{ value: number; label: string }>
    labels?: Record<string, string>
  }> {
    try {
      const response = await this.apiCall<any>(`${this.baseUrl}/medios-encontrado`, {
        method: 'GET',
        query: { version }
      })
      return response
    } catch (error) {
      console.error('Error en OptionsService.getMediosEncontrado:', error)
      throw error
    }
  }
}
