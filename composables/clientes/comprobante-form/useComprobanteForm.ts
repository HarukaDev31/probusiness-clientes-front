import { ComprobanteFormService } from "~/services/clientes/comprobante-form/comprobanteFormService"

export const useComprobanteForm = () => {
    const clientes = ref<{ label: string; value: string }[]>([])
    const carga = ref<string | null>(null)
    const loading = ref(false)

    const getClientes = async (idContenedor: number) => {
        loading.value = true
        try {
            const response = await ComprobanteFormService.getClientes(idContenedor)
            clientes.value = response.data ?? []
            carga.value = response.carga ?? null
            return response
        } catch (error) {
            console.error('Error al obtener clientes:', error)
        } finally {
            loading.value = false
        }
    }

    const storeForm = async (idContenedor: number, data: any): Promise<any> => {
        loading.value = true
        try {
            return await ComprobanteFormService.storeForm(idContenedor, data)
        } catch (error) {
            throw error
        } finally {
            loading.value = false
        }
    }

    return {
        clientes,
        carga,
        loading,
        getClientes,
        storeForm,
    }
}
