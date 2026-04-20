import { ComprobanteFormService } from "~/services/clientes/comprobante-form/comprobanteFormService"

export type ComprobanteFormRegistroGuardado = {
    id: number
    importador_uuid: string | null
    importador_label?: string | null
    tipo_comprobante: string
    destino_entrega: string | null
    razon_social?: string | null
    ruc?: string | null
    domicilio_fiscal?: string | null
    distrito_id?: number | null
    distrito_nombre?: string | null
    nombre_completo?: string | null
    dni_carnet?: string | null
}

export const useComprobanteForm = () => {
    const clientes = ref<{ label: string; value: string }[]>([])
    const misRegistros = ref<ComprobanteFormRegistroGuardado[]>([])
    const carga = ref<string | null>(null)
    const loading = ref(false)

    const getClientes = async (idContenedor: number) => {
        loading.value = true
        try {
            const response = await ComprobanteFormService.getClientes(idContenedor)
            clientes.value = response.data ?? []
            misRegistros.value = response.mis_registros ?? []
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
        misRegistros,
        carga,
        loading,
        getClientes,
        storeForm,
    }
}
