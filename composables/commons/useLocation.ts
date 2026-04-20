import { LocationService } from "~/services/commons/locationService"

export const useLocation = () => {
    const departamentos = ref<any[]>([])
    const provincias = ref<any[]>([])
    const distritos = ref<any[]>([])
    const loadingDepartamentos = ref(false)
    const loadingProvincias = ref(false)
    const loadingDistritos = ref(false)
    const getDepartamentos = async () => {
        try {
            console.log('🚀 Iniciando carga de departamentos...')
            loadingDepartamentos.value = true
            
            // Datos de prueba para ver si el problema es el backend
            const testData = [
                { id: '1', nombre: 'Lima' },
                { id: '2', nombre: 'Arequipa' },
                { id: '3', nombre: 'Cusco' },
                { id: '4', nombre: 'La Libertad' },
                { id: '5', nombre: 'Piura' }
            ]
            
            try {
                const response = await LocationService.getDepartamentos()
                console.log('✅ Respuesta de departamentos recibida:', response)
                departamentos.value = response.data.map((departamento: any) => ({
                    label: departamento.nombre,
                    value: departamento.id
                }))
                console.log('🎯 Departamentos procesados:', departamentos.value)
                return response
            } catch (apiError) {
                console.warn('⚠️ Error en API, usando datos de prueba:', apiError)
                // Usar datos de prueba si falla la API
                departamentos.value = testData.map((departamento: any) => ({
                    label: departamento.nombre,
                    value: departamento.id
                }))
                console.log('🎯 Usando departamentos de prueba:', departamentos.value)
                return { data: testData }
            }
        } catch (error) {
            console.error('❌ Error en getDepartamentos:', error)
        } finally {
            loadingDepartamentos.value = false
            console.log('🏁 Carga de departamentos finalizada. Loading:', loadingDepartamentos.value)
        }
    }
    const getProvincias = async (departamentoId: string) => {
        try {
            loadingProvincias.value = true
            const response = await LocationService.getProvincias(departamentoId)
            provincias.value = response.data.map((provincia: any) => ({
                label: provincia.nombre,
                value: provincia.id
            }))
            return response
        } catch (error) {
            console.error('Error en getProvincias:', error)
        } finally {
            loadingProvincias.value = false
        }
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
        try {
            loadingDistritos.value = true
            const response = await LocationService.getDistritos(provinciaId)
            distritos.value = response.data.map((distrito: any) => ({
                label: distrito.nombre,
                value: distrito.id
            }))
            return response
        } catch (error) {
            console.error('Error en getDistritos:', error)
        } finally {
            loadingDistritos.value = false
        }
    }

    /**
     * Distritos para autocomplete con paginación (Nuxt UI: cargar `page` al filtrar o al scroll).
     */
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