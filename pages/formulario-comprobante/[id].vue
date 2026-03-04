<template>
  <div class="h-auto bg-gray-50 dark:bg-gray-900 py-8">
    <div class="max-w-7xl mx-auto px-4">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Consolidado #{{ carga }}
        </h1>
        <p class="text-gray-600 dark:text-gray-300">
          Completa los datos para tu comprobante de pago.
        </p>
      </div>

      <!-- Form -->
      <UCard class="max-w-4xl mx-auto">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Importador -->
          <UFormField label="Selecciona el nombre del importador:" required>
            <USelectMenu
              v-model="formData.importador"
              :items="clientes"
              placeholder="Selecciona el importador"
              :disabled="loading || loadingForm"
              class="w-full"
            />
          </UFormField>
          <UFormField label="Destino de entrega:">
            <USelectMenu
              v-model="formData.destinoEntrega"
              :items="destinosEntrega"
              placeholder="Selecciona destino de entrega"
              :disabled="loading || loadingForm"
              class="w-full"
            />
          </UFormField>
          <!-- Tipo de comprobante -->
          <UFormField label="Escoge el tipo de comprobante:" required>
            <USelectMenu
              v-model="formData.tipoComprobante"
              :items="tiposComprobante"
              placeholder="Selecciona tipo de comprobante"
              :disabled="loading || loadingForm"
              class="w-full"
            />
          </UFormField>

          <!-- Destino de entrega -->
         

          <!-- Datos para FACTURA -->
          <div v-if="formData.tipoComprobante?.value === 'FACTURA'" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UFormField label="RUC:" required>
                <UInput
                  v-model="formData.ruc"
                  placeholder="Ingrese RUC (11 dígitos)"
                  :disabled="loading || loadingForm"
                  class="w-full"
                />
              </UFormField>

              <UFormField label="Razón social:" required>
                <UInput
                  v-model="formData.razonSocial"
                  placeholder="Ingrese razón social"
                  :disabled="loading || loadingForm"
                  class="w-full"
                />
              </UFormField>
            </div>
          </div>

          <!-- Datos para BOLETA -->
          <div v-else-if="formData.tipoComprobante?.value === 'BOLETA'" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UFormField label="Nombre completo:" required>
                <UInput
                  v-model="formData.nombreCompleto"
                  placeholder="Ingrese nombre completo"
                  :disabled="loading || loadingForm"
                  class="w-full"
                />
              </UFormField>

              <UFormField label="DNI / Carnet de extranjería:" required>
                <UInput
                  v-model="formData.dniCarnet"
                  placeholder="Ingrese DNI o carnet"
                  :disabled="loading || loadingForm"
                  class="w-full"
                />
              </UFormField>
            </div>
          </div>

          <!-- Submit -->
          <div class="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
            <UButton
              type="submit"
              color="primary"
              size="lg"
              :disabled="!canSubmit || loading || loadingForm"
              :loading="loading"
            >
              Enviar formulario
            </UButton>
          </div>
        </form>
      </UCard>
    </div>

    <!-- Modal de éxito -->
    <div
      v-if="showSuccessModal"
      class="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
      style="background-color: rgba(0,0,0,0.45);"
    >
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-sm w-full mx-4 p-8 text-center space-y-5">
        <div class="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
          <UIcon name="i-heroicons-check" class="w-8 h-8 text-white" />
        </div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">¡Registro exitoso!</h2>
        <p class="text-gray-600 dark:text-gray-300 text-sm">
          Tu formulario de comprobante fue enviado correctamente.<br>
          Recibirás una confirmación por correo y WhatsApp.
        </p>
        <UButton color="primary" size="lg" class="w-full justify-center" @click="navigateTo('/')">
          Ir a mi Perfil
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import { useComprobanteForm } from '~/composables/clientes/comprobante-form/useComprobanteForm'
import { useModal } from '~/composables/commons/useModal'

definePageMeta({
  title: 'Formulario de Comprobante',
  layout: 'default',
  middleware: 'auth'
})

const route = useRoute()
const contenedorId = Number(route.params.id)
const { showError } = useModal()

const { clientes, carga, loading: loadingForm, getClientes, storeForm } = useComprobanteForm()

const loading = ref(false)
const showSuccessModal = ref(false)

const tiposComprobante = [
  { label: 'BOLETA', value: 'BOLETA' },
  { label: 'FACTURA', value: 'FACTURA' }
]

const destinosEntrega = [
  { label: 'Lima', value: 'Lima' },
  { label: 'Provincia', value: 'Provincia' }
]

const formData = reactive({
  importador: null as { label: string; value: string } | null,
  tipoComprobante: null as { label: string; value: string } | null,
  destinoEntrega: null as { label: string; value: string } | null,
  // FACTURA
  ruc: '',
  razonSocial: '',
  // BOLETA
  nombreCompleto: '',
  dniCarnet: ''
})

const canSubmit = computed(() => {
  if (!formData.importador?.value) return false
  if (!formData.tipoComprobante?.value) return false

  if (formData.tipoComprobante.value === 'FACTURA') {
    return !!(formData.ruc && formData.razonSocial)
  }
  if (formData.tipoComprobante.value === 'BOLETA') {
    return !!(formData.nombreCompleto && formData.dniCarnet)
  }
  return false
})

const handleSubmit = async () => {
  if (!canSubmit.value) return
  loading.value = true
  try {
    const payload: Record<string, any> = {
      importador: formData.importador!.value,
      tipo_comprobante: formData.tipoComprobante.value,
      destino_entrega: formData.destinoEntrega || null,
    }

    if (formData.tipoComprobante.value === 'FACTURA') {
      payload.ruc = formData.ruc
      payload.razon_social = formData.razonSocial
    } else {
      payload.nombre_completo = formData.nombreCompleto
      payload.dni_carnet = formData.dniCarnet
    }

    const response = await storeForm(contenedorId, payload)
    if (response?.success) {
      showSuccessModal.value = true
    } else {
      showError('Error al enviar', response?.error || 'No se pudo guardar el formulario')
    }
  } catch (err: any) {
    showError('Error al enviar', err?.message || 'Error inesperado')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await getClientes(contenedorId)
})
</script>
