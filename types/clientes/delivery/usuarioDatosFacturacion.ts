/** Respuesta de GET clientes/delivery/usuario-datos-facturacion */
export interface UsuarioDatosFacturacionDto {
  nombre_completo: string | null
  dni: string | null
  ruc: string | null
  razon_social: string | null
  domicilio_fiscal: string | null
  destino: string | null
}

export interface UsuarioDatosFacturacionResponse {
  success: boolean
  data: UsuarioDatosFacturacionDto | null
  message?: string
}
