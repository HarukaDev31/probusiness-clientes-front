/**
 * Datos de resumen / modal para entrega provincia.
 * El mensaje de WhatsApp lo arma el backend (`ProvinciaEntregaNotificacionService`).
 * `buildMensajeWhatsAppEntregaProvincia` se mantiene solo como referencia o pruebas locales.
 */
export interface EntregaProvinciaNotificacionInput {
  primerNombre: string
  consolidadoId: string
  nombreCompleto: string
  /** Etiqueta del documento (DNI persona natural, RUC empresa) */
  documentoLabel?: 'DNI' | 'RUC'
  dni: string
  celular: string
  agenciaNombre: string
  agenciaRuc: string
  destinoLine: string
  entregaEsDomicilio: boolean
  direccionDomicilio?: string
}

export function buildMensajeWhatsAppEntregaProvincia (p: EntregaProvinciaNotificacionInput): string {
  const consolidado = `Consolidado #${p.consolidadoId}`
  const entrega = p.entregaEsDomicilio ? 'Domicilio' : 'Agencia'
  const docLabel = p.documentoLabel || 'DNI'
  const lines = [
    '✅ *Envío registrado*',
    '',
    `Hola, *${p.primerNombre}* 👋`,
    '',
    `Tu solicitud de envío para el *${consolidado}* fue registrada correctamente.`,
    '',
    '📦 *DESTINATARIO*',
    `*Nombre:* ${p.nombreCompleto || '—'}`,
    `*${docLabel}:* ${p.dni || '—'}`,
    `*Celular:* ${p.celular || '—'}`,
    '',
    '🚚 *TRANSPORTE*',
    `*Agencia:* ${p.agenciaNombre || '—'}`,
    `*RUC:* ${p.agenciaRuc || '—'}`,
    `*Destino:* ${p.destinoLine || '—'}`,
    `*Entrega en:* ${entrega}`
  ]
  if (p.entregaEsDomicilio && (p.direccionDomicilio || '').trim()) {
    lines.push(`*Dirección:* ${p.direccionDomicilio!.trim()}`)
  }
  return lines.join('\n')
}
