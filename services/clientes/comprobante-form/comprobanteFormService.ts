import { BaseService } from "~/services/base/BaseService"

export class ComprobanteFormService extends BaseService {
    private static baseUrl = 'api/clientes/comprobante-form'

    static async getClientes(idContenedor: number): Promise<any> {
        try {
            return await this.apiCall<any>(`${this.baseUrl}/${idContenedor}`)
        } catch (error) {
            console.error('Error al obtener clientes del comprobante form:', error)
            throw error
        }
    }

    static async storeForm(idContenedor: number, data: any): Promise<any> {
        try {
            return await this.apiCall<any>(`${this.baseUrl}/${idContenedor}`, {
                method: 'POST',
                body: data
            })
        } catch (error: any) {
            console.error('Error al guardar el formulario de comprobante:', error)
            return {
                success: false,
                error: error?.response?.data?.message || error?.data?.message || error?.message || 'Error al guardar los datos',
                statusCode: error?.status || error?.statusCode || 500
            }
        }
    }
}
