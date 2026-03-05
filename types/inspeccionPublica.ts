export interface ProviderInspeccion {
  code_supplier: string
  id: number
  volumen_doc?: number
  valor_doc?: number
  factura_comercial?: string
  excel_confirmacion?: string
  packing_list?: string
}

export interface FileAlmacenInspectionItem {
  id: number
  file_name: string
  file_url: string
  file_ext: string
  id_proveedor: number
}

export interface InspeccionPublicaData {
  id: number
  uuid: string
  nombre: string
  estado_cotizador: string
  providers: ProviderInspeccion[]
  files_almacen_inspection: FileAlmacenInspectionItem[]
}

export interface InspeccionPublicaResponse {
  success: boolean
  message?: string
  data: InspeccionPublicaData | null
}
