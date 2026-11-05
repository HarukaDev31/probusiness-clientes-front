/**
 * Formulario público de datos bancarios (T-T) de pago a proveedor. Se accede por enlace, sin sesión.
 */
import { getOrgKeyHeader } from '~/utils/orgKey'

export interface DatosBancariosTt {
  beneficiario_nombre: string
  beneficiario_cuenta: string
  beneficiario_direccion: string
  beneficiario_pais: string
  beneficiario_ciudad: string
  banco_tipo_codigo: string
  banco_codigo: string
  banco_nombre: string
  banco_direccion: string
  banco_pais: string
  banco_ciudad: string
  usa_intermediario: boolean
  inter_tipo_codigo: string
  inter_codigo: string
  inter_nombre: string
  inter_direccion: string
  inter_pais: string
  inter_ciudad: string
}

export interface FormularioTt {
  proveedor: string | null
  nombre_proveedor: string | null
  producto: string | null
  proforma_nombre: string | null
  proforma_url: string | null
  estado: string
  correccion_solicitada: boolean
  bloqueado: boolean
  puede_editar: boolean
  datos: Partial<Record<keyof DatosBancariosTt, string | boolean | null>>
}

const urlFormulario = (token: string) => {
  const config = useRuntimeConfig()

  return `${config.public.apiBaseUrl}/api/pago-proveedor/publico/formulario-tt/${encodeURIComponent(token)}`
}

export const obtenerFormularioTt = async (token: string) => {
  return $fetch<{ data: FormularioTt }>(urlFormulario(token), {
    headers: { Accept: 'application/json', ...getOrgKeyHeader() },
  })
}

export const enviarFormularioTt = async (token: string, datos: DatosBancariosTt & { autorizo: boolean }) => {
  return $fetch<{ data: { estado: string; mensaje: string } }>(urlFormulario(token), {
    method: 'POST',
    headers: { Accept: 'application/json', ...getOrgKeyHeader() },
    body: datos,
  })
}
