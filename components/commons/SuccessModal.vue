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
          Tu reserva se realizó exitosamente, este es el resumen de tu reserva:
        </p>

        <div class="space-y-4 text-left bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
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

          <div v-if="reservationData.distrito" class="flex items-start gap-3">
            <UIcon name="i-heroicons-map" class="w-5 h-5 text-gray-500 mt-0.5" />
            <div>
              <span class="font-medium text-gray-700 dark:text-gray-300">Distrito:</span>
              <span class="ml-2 text-gray-900 dark:text-white">{{ reservationData.distrito?.label }}</span>
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
  dni?: string
  agencia?: string
  provincia?: string
  distrito?: string
  tipoComprobante?: string
  importador?: string
}

const props = defineProps<{
  modelValue: boolean
  reservationData: ReservationData
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'generate-new-reservation': []
  'go-to-home': []
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
})

const generateNewReservation = () => {
  isOpen.value = false
  emit('generate-new-reservation')
  window.scrollTo({ top: 0, behavior: 'smooth' })
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