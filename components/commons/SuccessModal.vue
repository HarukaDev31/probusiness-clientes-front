<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
    style="background-color: rgba(0, 0, 0, 0.4);"
    @click="closeModal"
  >
    <div
      class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-screen overflow-y-auto"
      @click.stop
    >
      <div class="flex flex-col items-center justify-center text-center pt-6 px-6">
        <div class="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
          <UIcon name="i-heroicons-check" class="w-8 h-8 text-white" />
        </div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
          ¡Registro exitoso!
        </h2>
      </div>

      <div class="px-6 pb-6 text-center space-y-6">
        <p class="text-gray-600 dark:text-gray-300">
          {{ layout === 'entrega-provincia'
            ? 'Tu solicitud de envío fue registrada correctamente. Recibirás la confirmación por correo y WhatsApp con los mismos datos que ves a continuación.'
            : 'Tu reserva se realizó exitosamente, este es el resumen de tu reserva:' }}
        </p>

        <!-- Provincia / entrega agencia: mismo criterio de campos que el correo -->
        <div v-if="layout === 'entrega-provincia'" class="space-y-4 text-left">
          <div class="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
            <div class="flex items-center gap-2 bg-orange-500 px-4 py-2.5 text-white">
              <UIcon name="i-heroicons-user" class="h-5 w-5 shrink-0" />
              <span class="text-sm font-semibold uppercase tracking-wide">Destinatario confirmado</span>
            </div>
            <div class="space-y-2.5 bg-white p-4 text-sm text-gray-900 dark:bg-gray-950 dark:text-gray-100">
              <p>
                <span class="font-medium text-gray-600 dark:text-gray-400">Nombre:</span>
                <span class="ml-1">{{ reservationData.persona || '—' }}</span>
              </p>
              <p>
                <span class="font-medium text-gray-600 dark:text-gray-400">{{ reservationData.documentoLabel || 'DNI' }}:</span>
                <span class="ml-1">{{ reservationData.dni || '—' }}</span>
              </p>
              <p>
                <span class="font-medium text-gray-600 dark:text-gray-400">Celular:</span>
                <span class="ml-1">{{ reservationData.celular || '—' }}</span>
              </p>
            </div>
          </div>

          <div class="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
            <div class="flex items-center gap-2 bg-orange-500 px-4 py-2.5 text-white">
              <UIcon name="i-heroicons-truck" class="h-5 w-5 shrink-0" />
              <span class="text-sm font-semibold uppercase tracking-wide">Agencia de transporte</span>
            </div>
            <div class="space-y-2.5 bg-white p-4 text-sm text-gray-900 dark:bg-gray-950 dark:text-gray-100">
              <p>
                <span class="font-medium text-gray-600 dark:text-gray-400">Agencia:</span>
                <span class="ml-1">{{ reservationData.agencia || '—' }}</span>
              </p>
              <p>
                <span class="font-medium text-gray-600 dark:text-gray-400">RUC:</span>
                <span class="ml-1">{{ reservationData.agenciaRuc || '—' }}</span>
              </p>
              <p>
                <span class="font-medium text-gray-600 dark:text-gray-400">Destino:</span>
                <span class="ml-1">{{ reservationData.destinoLine || '—' }}</span>
              </p>
              <p class="flex flex-wrap items-center gap-2">
                <span class="font-medium text-gray-600 dark:text-gray-400">Entrega en:</span>
                <span
                  class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                  :class="reservationData.entregaEn === 'Domicilio'
                    ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-100'
                    : 'bg-orange-100 text-orange-900 dark:bg-orange-900/40 dark:text-orange-100'"
                >
                  {{ reservationData.entregaEn || 'Agencia' }}
                </span>
              </p>
              <p v-if="reservationData.entregaEn === 'Domicilio' && reservationData.direccionDomicilio">
                <span class="font-medium text-gray-600 dark:text-gray-400">Dirección:</span>
                <span class="ml-1">{{ reservationData.direccionDomicilio }}</span>
              </p>
            </div>
          </div>

          <UButton
            v-if="whatsapp"
            color="success"
            size="lg"
            block
            icon="i-heroicons-chat-bubble-left-right"
            class="justify-center"
            @click="openWhatsApp"
          >
            Abrir WhatsApp con el mensaje
          </UButton>
        </div>

        <!-- Resumen clásico (Lima / otros) -->
        <div v-else class="space-y-4 text-left bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div v-if="reservationData.fecha" class="flex items-center gap-3">
            <UIcon name="i-heroicons-calendar-days" class="w-5 h-5 text-gray-500" />
            <div>
              <span class="font-medium text-gray-700 dark:text-gray-300">Fecha:</span>
              <span class="ml-2 text-gray-900 dark:text-white">{{ reservationData.fecha }}</span>
            </div>
          </div>

          <div v-if="reservationData.hora" class="flex items-center gap-3">
            <UIcon name="i-heroicons-clock" class="w-5 h-5 text-gray-500" />
            <div>
              <span class="font-medium text-gray-700 dark:text-gray-300">Hora:</span>
              <span class="ml-2 text-gray-900 dark:text-white">{{ reservationData.hora }}</span>
            </div>
          </div>

          <div v-if="reservationData.persona" class="flex items-start gap-3">
            <UIcon name="i-heroicons-user" class="w-5 h-5 text-gray-500 mt-0.5" />
            <div>
              <span class="font-medium text-gray-700 dark:text-gray-300">Persona:</span>
              <span class="ml-2 text-gray-900 dark:text-white">{{ reservationData.persona }}</span>
            </div>
          </div>

          <div v-if="reservationData.dni" class="flex items-start gap-3">
            <UIcon name="i-heroicons-identification" class="w-5 h-5 text-gray-500 mt-0.5" />
            <div>
              <span class="font-medium text-gray-700 dark:text-gray-300">DNI:</span>
              <span class="ml-2 text-gray-900 dark:text-white">{{ reservationData.dni }}</span>
            </div>
          </div>

          <div v-if="reservationData.agencia" class="flex items-start gap-3">
            <UIcon name="i-heroicons-building-office" class="w-5 h-5 text-gray-500 mt-0.5" />
            <div>
              <span class="font-medium text-gray-700 dark:text-gray-300">Agencia:</span>
              <span class="ml-2 text-gray-900 dark:text-white">{{ reservationData.agencia }}</span>
            </div>
          </div>

          <div v-if="reservationData.provincia" class="flex items-start gap-3">
            <UIcon name="i-heroicons-map-pin" class="w-5 h-5 text-gray-500 mt-0.5" />
            <div>
              <span class="font-medium text-gray-700 dark:text-gray-300">Provincia:</span>
              <span class="ml-2 text-gray-900 dark:text-white">{{ reservationData.provincia }}</span>
            </div>
          </div>

          <div v-if="distritoResumen" class="flex items-start gap-3">
            <UIcon name="i-heroicons-map" class="w-5 h-5 text-gray-500 mt-0.5" />
            <div>
              <span class="font-medium text-gray-700 dark:text-gray-300">Distrito:</span>
              <span class="ml-2 text-gray-900 dark:text-white">{{ distritoResumen }}</span>
            </div>
          </div>

          <div v-if="reservationData.tipoComprobante" class="flex items-start gap-3">
            <UIcon name="i-heroicons-document-text" class="w-5 h-5 text-gray-500 mt-0.5" />
            <div>
              <span class="font-medium text-gray-700 dark:text-gray-300">Tipo de comprobante:</span>
              <span class="ml-2 text-gray-900 dark:text-white">{{ reservationData.tipoComprobante }}</span>
            </div>
          </div>

          <div v-if="reservationData.importador" class="flex items-start gap-3">
            <UIcon name="i-heroicons-building-office-2" class="w-5 h-5 text-gray-500 mt-0.5" />
            <div>
              <span class="font-medium text-gray-700 dark:text-gray-300">Importador:</span>
              <span class="ml-2 text-gray-900 dark:text-white">{{ reservationData.importador }}</span>
            </div>
          </div>
        </div>

        <div class="flex flex-col md:flex-row gap-3 mt-6">
          <UButton @click="goToHome" variant="outline" size="lg" block class="order-2 md:order-1">
            Volver al home
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface ReservationData {
  fecha?: string
  hora?: string
  persona?: string
  /** Etiqueta del documento del destinatario (p. ej. DNI / RUC) */
  documentoLabel?: string
  dni?: string
  /** Celular destinatario (entrega provincia) */
  celular?: string
  agencia?: string
  agenciaRuc?: string
  /** Depto — Prov — Dist */
  destinoLine?: string
  entregaEn?: 'Agencia' | 'Domicilio'
  direccionDomicilio?: string
  consolidadoNumero?: string
  provincia?: string
  /** Texto plano o ítem de select `{ label }` (formularios de entrega) */
  distrito?: string | { label?: string }
  tipoComprobante?: string
  importador?: string
}

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    reservationData: ReservationData
    /** Vista tipo correo "MSJ entrega agencia" */
    layout?: 'default' | 'entrega-provincia'
    whatsapp?: { phone: string; text: string } | null
  }>(),
  {
    layout: 'default',
    whatsapp: null
  }
)

const distritoResumen = computed(() => {
  const d = props.reservationData.distrito
  if (d == null) return ''
  return typeof d === 'string' ? d : (d.label ?? '')
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  /** Reservado para flujos como Lima que reabren reserva */
  'generate-new-reservation': []
  'go-to-home': []
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
})

function openWhatsApp () {
  const w = props.whatsapp
  if (!w?.phone) return
  const num = String(w.phone).replace(/\D/g, '')
  if (!num) return
  const url = `https://wa.me/${num}?text=${encodeURIComponent(w.text)}`
  window.open(url, '_blank')
}

const goToHome = () => {
  isOpen.value = false
  emit('go-to-home')
}

const closeModal = () => {
  isOpen.value = false
  emit('go-to-home')
}
</script>
