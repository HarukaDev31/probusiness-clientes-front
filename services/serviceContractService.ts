import { BaseService } from './base/BaseService'

// Interfaces para el contrato de servicio
export interface ServiceContractResponse {
  success: boolean
  data: {
    url: string
    uuid: string
    filename?: string
    size?: number
    created_at?: string
    updated_at?: string
    cotizacion_contrato_url: string
    cotizacion_contrato_firmado_url?: string // URL del contrato firmado si existe
  }
  message?: string
}

export interface SignServiceContractRequest {
  uuid: string
  signed_file: File | string // Puede ser File o base64 string
}

export interface SignServiceContractResponse {
  success: boolean
  data: {
    signed_url: string
    uuid: string
    filename: string
    signed_at: string
  }
  message?: string
}

export class ServiceContractService extends BaseService {
  /**
   * Obtiene el contrato de servicio por UUID
   * @param uuid - UUID del contrato
   * @returns Promise con la respuesta del servidor
   */
  static async getServiceContract(uuid: string): Promise<ServiceContractResponse> {
    try {
      console.log('🔧 ServiceContractService: Obteniendo contrato de servicio para UUID:', uuid)
      
      const endpoint = `api/contenedor/external/cotizacion/get-service-contract/${uuid}`
      
      const response = await this.apiCall<ServiceContractResponse>(endpoint, {
        method: 'GET'
      })
      
      console.log('✅ ServiceContractService: Contrato obtenido exitosamente:', response)
      return response
    } catch (error: any) {
      console.error('❌ ServiceContractService: Error obteniendo contrato:', error)
      throw new Error(`No se pudo obtener el contrato de servicio: ${error.message}`)
    }
  }

  /**
   * Firma el contrato de servicio
   * @param uuid - UUID del contrato
   * @param signedFile - Archivo firmado (File o base64)
   * @returns Promise con la respuesta del servidor
   */
  static async signServiceContract(
    uuid: string, 
    signedFile: File | string
  ): Promise<SignServiceContractResponse> {
    try {
      console.log('🔧 ServiceContractService: Firmando contrato de servicio para UUID:', uuid)
      
      const endpoint = `api/contenedor/external/cotizacion/sign-service-contract/${uuid}`
      
      // Preparar el FormData
      const formData = new FormData()
      
      if (signedFile instanceof File) {
        formData.append('signed_file', signedFile)
      } else {
        // Si es base64, crear un blob y luego un File
        const base64Data = signedFile.replace(/^data:image\/[a-z]+;base64,/, '')
        const byteCharacters = atob(base64Data)
        const byteNumbers = new Array(byteCharacters.length)
        
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i)
        }
        
        const byteArray = new Uint8Array(byteNumbers)
        const blob = new Blob([byteArray], { type: 'image/png' })
        const file = new File([blob], `signed-contract-${uuid}.png`, { type: 'image/png' })
        
        formData.append('signed_file', file)
      }
      
      
      const response = await this.apiCall<SignServiceContractResponse>(endpoint, {
        method: 'POST',
        body: formData
      })
      
      console.log('✅ ServiceContractService: Contrato firmado exitosamente:', response)
      return response
    } catch (error: any) {
      console.error('❌ ServiceContractService: Error firmando contrato:', error)
      throw new Error(`No se pudo firmar el contrato de servicio: ${error.message}`)
    }
  }

  /**
   * Descarga el contrato de servicio
   * @param url - URL del contrato
   * @param filename - Nombre del archivo (opcional)
   * @returns Promise<void>
   */
  static async downloadServiceContract(url: string, filename?: string): Promise<void> {
    try {
      console.log('🔧 ServiceContractService: Descargando contrato desde:', url)
      
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Error descargando archivo: ${response.statusText}`)
      }
      
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename || `contrato-servicio-${Date.now()}.pdf`
      link.target = '_blank'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Limpiar el URL del objeto
      window.URL.revokeObjectURL(downloadUrl)
      
      console.log('✅ ServiceContractService: Contrato descargado exitosamente')
    } catch (error: any) {
      console.error('❌ ServiceContractService: Error descargando contrato:', error)
      throw new Error(`No se pudo descargar el contrato: ${error.message}`)
    }
  }
}
