import { ref, computed } from 'vue'
import { ServiceContractService, type ServiceContractResponse, type SignServiceContractResponse } from '~/services/serviceContractService'
import { useSpinner } from '~/composables/commons/useSpinner'
import { useModal } from '~/composables/commons/useModal'
import { normalizeContractStorageUrl } from '~/utils/contracts/contractUrl'

export interface ServiceContractData {
  cotizacion_contrato_url: string
  cotizacion_contrato_firmado_url?: string // URL del contrato firmado si existe
  uuid: string
  filename?: string
  size?: number
  created_at?: string
  updated_at?: string
  cod_contrato?: string
}

export interface SignatureData {
  position: {
    x: number
    y: number
    page: number
  }
  size: {
    width: number
    height: number
  }
  timestamp: string
}

export function useServiceContract() {
  // Composables
  const { showSpinner, hideSpinner, withSpinner } = useSpinner()
  const { showError, showSuccess } = useModal()

  // Función para redirigir a WhatsApp
  const redirectToWhatsApp = (phoneNumber: string = '+51992583703') => {
    try {
      // Limpiar el número de teléfono (remover espacios, guiones, etc.)
      const cleanNumber = phoneNumber.replace(/[\s\-\(\)]/g, '')
      
      // Crear mensaje personalizado para el contexto de firma
      const message = encodeURIComponent(
        '¡Hola! He firmado exitosamente el acuerdo de servicio. ¿Podrían confirmar la recepción del documento firmado?'
      )
      
      // Crear URL de WhatsApp
      const whatsappUrl = `https://wa.me/${cleanNumber}?text=${message}`
      
      console.log('🔧 Redirigiendo a WhatsApp:', whatsappUrl)
      
      // Abrir WhatsApp en nueva ventana
      window.open(whatsappUrl, '_blank')
      
    } catch (error) {
      console.error('❌ Error redirigiendo a WhatsApp:', error)
      showError('Error de redirección', 'No se pudo abrir WhatsApp. Inténtalo manualmente.')
    }
  }

  // Estado reactivo
  const contractData = ref<ServiceContractData | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const isSigning = ref(false)
  const codContrato =computed(() => contractData.value?.cod_contrato || '')
  // Computed
  const hasContract = computed(() => !!contractData.value?.cotizacion_contrato_url)
  const hasSignedContract = computed(() => !!contractData.value?.cotizacion_contrato_firmado_url)
  const contractUrl = computed(() => {
    // Si existe contrato firmado, usar ese; si no, usar el original
    return contractData.value?.cotizacion_contrato_firmado_url || contractData.value?.cotizacion_contrato_url || ''
  })
  const contractUuid = computed(() => contractData.value?.uuid || '')

  /**
   * Obtiene el contrato de servicio por UUID
   * @param uuid - UUID del contrato
   * @param useGlobalSpinner - Si usar el spinner global (default: true)
   */
  const getServiceContract = async (uuid: string, useGlobalSpinner: boolean = true): Promise<void> => {
    try {
      isLoading.value = true
      error.value = null

      const loadContract = async () => {
        console.log('🔧 useServiceContract: Obteniendo contrato para UUID:', uuid)
        
        const response: ServiceContractResponse = await ServiceContractService.getServiceContract(uuid)

        const rawOriginal =
          response.data?.cotizacion_contrato_url ?? response.data?.url ?? null
        const cleanOriginalUrl = normalizeContractStorageUrl(rawOriginal)
        const cleanSignedUrl = normalizeContractStorageUrl(
          response.data?.cotizacion_contrato_firmado_url ?? null
        )

        if (response.success && response.data && cleanOriginalUrl) {
           contractData.value = {
             cotizacion_contrato_url: cleanOriginalUrl,
             cotizacion_contrato_firmado_url: cleanSignedUrl ?? undefined,
             uuid: response.data.uuid,
             filename: response.data.filename,
             size: response.data.size,
             created_at: response.data.created_at,
             updated_at: response.data.updated_at,
             cod_contrato: response.data.cod_contrato
           }
          console.log('✅ useServiceContract: Contrato obtenido exitosamente:', contractData.value)
          console.log('🔧 Contrato firmado disponible:', !!cleanSignedUrl)
        } else {
          throw new Error(response.message || 'No se pudo obtener el contrato')
        }
      }

      if (useGlobalSpinner) {
        await withSpinner(loadContract, 'Obteniendo contrato de servicio...')
      } else {
        await loadContract()
      }

    } catch (err: any) {
      console.error('❌ useServiceContract: Error obteniendo contrato:', err)
      error.value = err.message
      showError(
        'Error al obtener el contrato',
        err.message || 'No se pudo cargar el contrato de servicio. Verifica el UUID o tu conexión.'
      )
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Firma el contrato de servicio
   * @param uuid - UUID del contrato
   * @param signedFile - Archivo firmado (File o base64)
   */
  const signServiceContract = async (
    uuid: string, 
    signedFile: File | string
  ): Promise<SignServiceContractResponse> => {
    try {
      isSigning.value = true
      error.value = null

      const response = await withSpinner(async () => {
        console.log('🔧 useServiceContract: Firmando contrato para UUID:', uuid)
        
        const result = await ServiceContractService.signServiceContract(uuid, signedFile)

        const signedCdnUrl = normalizeContractStorageUrl(
          result.data?.signed_contract_url ?? result.data?.signed_url ?? null
        )
        if (signedCdnUrl && contractData.value) {
          contractData.value = {
            ...contractData.value,
            cotizacion_contrato_firmado_url: signedCdnUrl
          }
        }

        console.log('✅ useServiceContract: Contrato firmado exitosamente:', result)
        return result
      }, 'Firmando contrato de servicio...')

      // Mostrar mensaje de éxito
      showSuccess(
        'Contrato firmado',
        'El contrato se ha firmado y guardado exitosamente.'
      )

      // Redirigir a WhatsApp después de una firma exitosa
      setTimeout(() => {
        redirectToWhatsApp('+51992583703')
      }, 2000) // Esperar 2 segundos para que el usuario vea el mensaje de éxito

      return response

    } catch (err: any) {
      console.error('❌ useServiceContract: Error firmando contrato:', err)
      error.value = err.message
      showError(
        'Error al firmar el contrato',
        err.message || 'No se pudo firmar el contrato. Inténtalo de nuevo.'
      )
      throw err
    } finally {
      isSigning.value = false
    }
  }

  /**
   * Descarga el contrato de servicio
   * @param url - URL del contrato (opcional, usa el contrato actual si no se proporciona)
   * @param filename - Nombre del archivo (opcional)
   */
  const downloadContract = async (url?: string, filename?: string): Promise<void> => {
    try {
      const downloadUrl = url || contractUrl.value
      const downloadFilename = filename || contractData.value?.filename || `contrato-servicio-${contractUuid.value}.pdf`

      if (!downloadUrl) {
        throw new Error('No hay URL de contrato disponible para descargar')
      }

      await withSpinner(async () => {
        console.log('🔧 useServiceContract: Descargando contrato desde:', downloadUrl)
        
        await ServiceContractService.downloadServiceContract(downloadUrl, downloadFilename)
        
        console.log('✅ useServiceContract: Contrato descargado exitosamente')
      }, 'Descargando contrato...')

    } catch (err: any) {
      console.error('❌ useServiceContract: Error descargando contrato:', err)
      showError(
        'Error al descargar',
        err.message || 'No se pudo descargar el contrato.'
      )
      throw err
    }
  }

  /**
   * Limpia el estado del composable
   */
  const clearContract = (): void => {
    contractData.value = null
    error.value = null
    isLoading.value = false
    isSigning.value = false
  }

  /**
   * Reinicia el estado de error
   */
  const clearError = (): void => {
    error.value = null
  }

  return {
    // Estado
    contractData: readonly(contractData),
    isLoading: readonly(isLoading),
    error: readonly(error),
    isSigning: readonly(isSigning),
    
    // Computed
    hasContract,
    hasSignedContract,
    contractUrl,
    contractUuid,
    codContrato,
    // Métodos
    getServiceContract,
    signServiceContract,
    downloadContract,
    clearContract,
    clearError,
    redirectToWhatsApp
  }
}
