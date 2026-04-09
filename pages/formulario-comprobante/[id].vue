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
          <UFormField label="Selecciona el nombre del importador:" required :error="fieldErrors.importador">
            <USelectMenu
              v-model="formData.importador"
              :items="clientes"
              placeholder="Selecciona el importador"
              :disabled="loading || loadingForm"
              class="w-full"
            />
          </UFormField>
          <h3 class="text-base font-semibold text-gray-900 dark:text-white">Datos de facturación</h3>

          <!-- Datos para FACTURA -->
          <div v-if="formData.tipoComprobante?.value === 'FACTURA'" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <UFormField label="Tipo de comprobante:" required :error="fieldErrors.tipoComprobante">
                <USelectMenu
                  v-model="formData.tipoComprobante"
                  :items="tiposComprobante"
                  placeholder="Selecciona tipo de comprobante"
                  :disabled="loading || loadingForm"
                  class="w-full"
                />
              </UFormField>

              <UFormField label="RUC:" required :error="fieldErrors.ruc">
                <UInput
                  v-model="formData.ruc"
                  placeholder="Ingrese RUC (11 dígitos)"
                  maxlength="15"
                  :disabled="loading || loadingForm"
                  class="w-full"
                />
              </UFormField>

              <UFormField label="Razón social:" required :error="fieldErrors.razonSocial">
                <UInput
                  v-model="formData.razonSocial"
                  placeholder="Ingrese razón social"
                  :disabled="loading || loadingForm"
                  class="w-full"
                />
              </UFormField>
            </div>
            <UFormField label="Domicilio fiscal:" required :error="fieldErrors.domicilioFiscal">
              <UInput
                v-model="formData.domicilioFiscal"
                placeholder="Ingrese domicilio fiscal"
                :disabled="loading || loadingForm"
                class="w-full"
              />
            </UFormField>
          </div>

          <!-- Datos para BOLETA -->
          <div v-else-if="formData.tipoComprobante?.value === 'BOLETA'" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <UFormField label="Tipo de comprobante:" required :error="fieldErrors.tipoComprobante">
                <USelectMenu
                  v-model="formData.tipoComprobante"
                  :items="tiposComprobante"
                  placeholder="Selecciona tipo de comprobante"
                  :disabled="loading || loadingForm"
                  class="w-full"
                />
              </UFormField>

              <UFormField label="DNI / Carnet de extranjería:" required :error="fieldErrors.dniCarnet">
                <UInput
                  v-model="formData.dniCarnet"
                  placeholder="DNI: 8 dígitos. Carné: 9–20 caracteres"
                  maxlength="20"
                  :disabled="loading || loadingForm"
                  class="w-full"
                />
              </UFormField>

              <UFormField label="Nombre completo:" required :error="fieldErrors.nombreCompleto">
                <UInput
                  v-model="formData.nombreCompleto"
                  placeholder="Ingrese nombre completo"
                  :disabled="loading || loadingForm"
                  class="w-full"
                />
              </UFormField>
            </div>
          </div>

          <div v-else>
            <UFormField label="Tipo de comprobante:" required :error="fieldErrors.tipoComprobante">
              <USelectMenu
                v-model="formData.tipoComprobante"
                :items="tiposComprobante"
                placeholder="Selecciona tipo de comprobante"
                :disabled="loading || loadingForm"
                class="w-full"
              />
            </UFormField>
          </div>

          <h3 class="text-base font-semibold text-gray-900 dark:text-white">Datos logísticos</h3>
          <UFormField label="Selecciona el destino de entrega:" required :error="fieldErrors.destinoEntrega">
            <USelectMenu
              v-model="formData.destinoEntrega"
              :items="destinosEntrega"
              placeholder="Selecciona destino de entrega"
              :disabled="loading || loadingForm"
              class="w-full"
            />
          </UFormField>

          <!-- Submit -->
          <div class="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
            <UButton
              type="submit"
              color="primary"
              size="lg"
              :disabled="!canSubmit || loading || loadingForm"
              :loading="loading"
            >
              {{ isEditing ? 'Actualizar formulario' : 'Enviar formulario' }}
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
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ successWasUpdate ? '¡Cambios guardados!' : '¡Registro exitoso!' }}
        </h2>
        <p class="text-gray-600 dark:text-gray-300 text-sm">
          <template v-if="successWasUpdate">
            Los datos de tu comprobante se actualizaron correctamente.
          </template>
          <template v-else>
            Tu formulario de comprobante fue enviado correctamente.<br>
            Recibirás una confirmación por correo y WhatsApp.
          </template>
        </p>
        <UButton color="primary" size="lg" class="w-full justify-center" @click="navigateTo('/')">
          Ir a mi Perfil
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted, watch } from 'vue'
import { useComprobanteForm, type ComprobanteFormRegistroGuardado } from '~/composables/clientes/comprobante-form/useComprobanteForm'
import { useModal } from '~/composables/commons/useModal'

definePageMeta({
  title: 'Formulario de Comprobante',
  layout: 'default',
  middleware: 'auth'
})

const route = useRoute()
const contenedorId = Number(route.params.id)
const { showError } = useModal()

const { clientes, misRegistros, carga, loading: loadingForm, getClientes, storeForm } = useComprobanteForm()

const loading = ref(false)
const showSuccessModal = ref(false)
const successWasUpdate = ref(false)

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
  domicilioFiscal: '',
  // BOLETA
  nombreCompleto: '',
  dniCarnet: ''
})

type FieldKey =
  | 'importador'
  | 'tipoComprobante'
  | 'destinoEntrega'
  | 'ruc'
  | 'razonSocial'
  | 'domicilioFiscal'
  | 'nombreCompleto'
  | 'dniCarnet'

const fieldErrors = reactive<Partial<Record<FieldKey, string>>>({})

const DNI_CARNET_RE = /^(?:\d{8}|[A-Za-z0-9-]{9,20})$/

function onlyDigits(s: string): string {
  return s.replace(/\D/g, '')
}

function clearFieldError(key: FieldKey) {
  delete fieldErrors[key]
}

function clearAllFieldErrors() {
  ;(Object.keys(fieldErrors) as FieldKey[]).forEach((k) => delete fieldErrors[k])
}

function validateClient(): boolean {
  clearAllFieldErrors()
  const tipo = formData.tipoComprobante?.value

  if (!formData.importador?.value) {
    fieldErrors.importador = 'Selecciona el importador.'
  }
  if (!tipo) {
    fieldErrors.tipoComprobante = 'Selecciona el tipo de comprobante.'
  }
  if (!formData.destinoEntrega?.value) {
    fieldErrors.destinoEntrega = 'Selecciona el destino de entrega (Lima o Provincia).'
  } else if (!['Lima', 'Provincia'].includes(formData.destinoEntrega.value)) {
    fieldErrors.destinoEntrega = 'El destino debe ser Lima o Provincia.'
  }

  if (tipo === 'FACTURA') {
    const rucDigits = onlyDigits(formData.ruc)
    const rs = formData.razonSocial.trim()
    const dom = formData.domicilioFiscal.trim()
    if (rucDigits.length !== 11) {
      fieldErrors.ruc = 'El RUC debe tener exactamente 11 dígitos.'
    }
    if (rs.length < 3) {
      fieldErrors.razonSocial = 'La razón social debe tener al menos 3 caracteres.'
    } else if (rs.length > 255) {
      fieldErrors.razonSocial = 'La razón social no puede superar 255 caracteres.'
    }
    if (dom.length < 10) {
      fieldErrors.domicilioFiscal = 'El domicilio fiscal debe tener al menos 10 caracteres.'
    } else if (dom.length > 2000) {
      fieldErrors.domicilioFiscal = 'El domicilio fiscal no puede superar 2000 caracteres.'
    }
  } else if (tipo === 'BOLETA') {
    const nombre = formData.nombreCompleto.trim()
    const doc = formData.dniCarnet.trim()
    if (nombre.length < 3) {
      fieldErrors.nombreCompleto = 'El nombre completo debe tener al menos 3 caracteres.'
    } else if (nombre.length > 255) {
      fieldErrors.nombreCompleto = 'El nombre completo no puede superar 255 caracteres.'
    }
    if (!doc) {
      fieldErrors.dniCarnet = 'Ingresa DNI o carné de extranjería.'
    } else if (!DNI_CARNET_RE.test(doc)) {
      fieldErrors.dniCarnet =
        'DNI: 8 dígitos. Carné: 9 a 20 caracteres (letras, números o guiones).'
    }
  }

  return Object.keys(fieldErrors).length === 0
}

function applyApiErrors(apiErrors: Record<string, string[] | string> | undefined) {
  if (!apiErrors || typeof apiErrors !== 'object') return
  const keyMap: Record<string, FieldKey> = {
    importador: 'importador',
    tipo_comprobante: 'tipoComprobante',
    destino_entrega: 'destinoEntrega',
    ruc: 'ruc',
    razon_social: 'razonSocial',
    domicilio_fiscal: 'domicilioFiscal',
    nombre_completo: 'nombreCompleto',
    dni_carnet: 'dniCarnet'
  }
  for (const [k, v] of Object.entries(apiErrors)) {
    const frontKey = keyMap[k]
    if (!frontKey) continue
    const msg = Array.isArray(v) ? v[0] : v
    if (msg) fieldErrors[frontKey] = String(msg)
  }
}

const canSubmit = computed(() => {
  if (!formData.importador?.value) return false
  if (!formData.tipoComprobante?.value) return false
  if (!formData.destinoEntrega?.value) return false

  if (formData.tipoComprobante.value === 'FACTURA') {
    return !!(formData.ruc?.trim() && formData.razonSocial?.trim() && formData.domicilioFiscal?.trim())
  }
  if (formData.tipoComprobante.value === 'BOLETA') {
    return !!(formData.nombreCompleto?.trim() && formData.dniCarnet?.trim())
  }
  return false
})

function applyRegistroGuardado(r: ComprobanteFormRegistroGuardado) {
  formData.tipoComprobante =
    tiposComprobante.find((t) => t.value === r.tipo_comprobante) ?? null
  formData.destinoEntrega = r.destino_entrega
    ? destinosEntrega.find((d) => d.value === r.destino_entrega) ?? null
    : null
  if (r.tipo_comprobante === 'FACTURA') {
    formData.ruc = r.ruc ?? ''
    formData.razonSocial = r.razon_social ?? ''
    formData.domicilioFiscal = r.domicilio_fiscal ?? ''
    formData.nombreCompleto = ''
    formData.dniCarnet = ''
  } else if (r.tipo_comprobante === 'BOLETA') {
    formData.nombreCompleto = r.nombre_completo ?? ''
    formData.dniCarnet = r.dni_carnet ?? ''
    formData.ruc = ''
    formData.razonSocial = ''
    formData.domicilioFiscal = ''
  }
}

function clearCamposComprobante() {
  formData.tipoComprobante = null
  formData.destinoEntrega = null
  formData.ruc = ''
  formData.razonSocial = ''
  formData.domicilioFiscal = ''
  formData.nombreCompleto = ''
  formData.dniCarnet = ''
}

const isEditing = computed(() => {
  const uuid = formData.importador?.value
  if (!uuid) return false
  return misRegistros.value.some((r) => r.importador_uuid === uuid)
})

watch(
  () => formData.importador,
  (imp) => {
    clearFieldError('importador')
    if (!imp?.value) return
    const r = misRegistros.value.find((x) => x.importador_uuid === imp.value)
    if (r) applyRegistroGuardado(r)
    else clearCamposComprobante()
  }
)
watch(
  () => formData.tipoComprobante,
  () => {
    clearFieldError('tipoComprobante')
    clearFieldError('ruc')
    clearFieldError('razonSocial')
    clearFieldError('domicilioFiscal')
    clearFieldError('nombreCompleto')
    clearFieldError('dniCarnet')
  }
)
watch(
  () => formData.destinoEntrega,
  () => clearFieldError('destinoEntrega')
)
watch(
  () => formData.ruc,
  () => clearFieldError('ruc')
)
watch(
  () => formData.razonSocial,
  () => clearFieldError('razonSocial')
)
watch(
  () => formData.domicilioFiscal,
  () => clearFieldError('domicilioFiscal')
)
watch(
  () => formData.nombreCompleto,
  () => clearFieldError('nombreCompleto')
)
watch(
  () => formData.dniCarnet,
  () => clearFieldError('dniCarnet')
)

const handleSubmit = async () => {
  if (!validateClient()) {
    showError('Revisa el formulario', 'Corrige los campos indicados antes de enviar.')
    return
  }
  if (!canSubmit.value) return

  loading.value = true
  try {
    const tipo = formData.tipoComprobante!.value
    const payload: Record<string, any> = {
      importador: formData.importador!.value,
      tipo_comprobante: tipo,
      destino_entrega: formData.destinoEntrega!.value
    }

    if (tipo === 'FACTURA') {
      payload.ruc = onlyDigits(formData.ruc)
      payload.razon_social = formData.razonSocial.trim()
      payload.domicilio_fiscal = formData.domicilioFiscal.trim()
    } else {
      payload.nombre_completo = formData.nombreCompleto.trim()
      payload.dni_carnet = formData.dniCarnet.trim()
    }

    const response = await storeForm(contenedorId, payload)
    if (response?.success) {
      clearAllFieldErrors()
      successWasUpdate.value = isEditing.value
      showSuccessModal.value = true
      await getClientes(contenedorId)
      const uuid = formData.importador?.value
      if (uuid) {
        const r = misRegistros.value.find((x) => x.importador_uuid === uuid)
        if (r) applyRegistroGuardado(r)
      }
    } else {
      clearAllFieldErrors()
      applyApiErrors(response?.errors)
      const hasFieldErrors = Object.keys(fieldErrors).length > 0
      showError(
        'Error al enviar',
        hasFieldErrors ? 'Revisa los campos marcados.' : (response?.error || 'No se pudo guardar el formulario')
      )
    }
  } catch (err: any) {
    showError('Error al enviar', err?.message || 'Error inesperado')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await getClientes(contenedorId)
  if (misRegistros.value.length === 1) {
    const r = misRegistros.value[0]
    if (r.importador_uuid) {
      const item = clientes.value.find((c) => c.value === r.importador_uuid)
      if (item) {
        formData.importador = item
      }
    }
  }
})
</script>
