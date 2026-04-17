<template>
  <div class="h-auto bg-gray-50 dark:bg-gray-900 py-8">
    <div class="max-w-7xl mx-auto px-4">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Consolidado #{{ carga }}
        </h1>
        <div v-if="currentStep === 1">
          <p class="text-gray-600 dark:text-gray-300">
          Completa la información para que puedas recoger tu pedido.
        </p>
        </div>
        <div v-else-if="currentStep === 2">
          <p class="text-gray-600 dark:text-gray-300">
            Ahora necesitamos los datos para realizar tu comprobante
          </p>
        </div>
        <div v-else-if="currentStep === 3">
          <p class="text-gray-600 dark:text-gray-300">
            Ahora necesitamos los datos del chofer para entregar tu pedido,<strong> si aún no cuenta con la información dar en continuar.</strong>
          </p>
        </div>
        <div v-else-if="currentStep === 4">
          <p class="text-gray-600 dark:text-gray-300">
            Por favor selecciona la fecha y hora disponible, después culmina el formulario
          </p>
        </div>
      </div>

      <!-- Stepper -->
      <div class="mb-5">
        <!-- Desktop stepper -->
        <div class="hidden md:flex items-center justify-center">
          <div class="flex items-center space-x-4">
            <div v-for="(step, index) in steps" :key="step.id" class="flex items-center">
              <button 
                @click="goToStep(index + 1)"
                :disabled="!canNavigateToStep(index + 1)"
                :class="[
                  'flex items-center justify-center w-10 h-10 rounded-full text-white font-semibold transition-all duration-200',
                  currentStep >= index + 1 ? 'bg-primary-500 hover:bg-primary-600' : 'bg-gray-300 dark:bg-gray-600',
                  canNavigateToStep(index + 1) ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed opacity-75'
                ]"
              >
                {{ index + 1 }}
              </button>
              <div v-if="index < steps.length - 1" class="w-16 h-1 bg-gray-300 dark:bg-gray-600 mx-2">
                <div :class="[
                  'h-full transition-all duration-300',
                  currentStep > index + 1 ? 'bg-primary-500 w-full' : 'bg-transparent w-0'
                ]"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Mobile stepper -->
        <div class="md:hidden">
          <div class="flex items-center justify-between px-4">
            <div v-for="(step, index) in steps" :key="step.id" class="flex flex-col items-center flex-1">
              <button 
                @click="goToStep(index + 1)"
                :disabled="!canNavigateToStep(index + 1)"
                :class="[
                  'flex items-center justify-center w-8 h-8 rounded-full text-white font-semibold text-sm mb-2 transition-all duration-200',
                  currentStep >= index + 1 ? 'bg-primary-500 hover:bg-primary-600' : 'bg-gray-300 dark:bg-gray-600',
                  canNavigateToStep(index + 1) ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed opacity-75'
                ]"
              >
                {{ index + 1 }}
              </button>
              <div class="text-xs text-center text-gray-600 dark:text-gray-300 max-w-16">
                {{ step.title}}
              </div>
            </div>
          </div>
          
          <!-- Progress bar móvil -->
          <div class="mt-4 px-4">
            <div class="w-full bg-gray-300 dark:bg-gray-600 h-1 rounded-full">
              <div 
                class="bg-primary-500 h-full rounded-full transition-all duration-300"
                :style="{ width: `${(currentStep / steps.length) * 100}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>
      <!-- Form Container -->
      <UCard class="max-w-4xl mx-auto">
        <form @submit.prevent="handleSubmit">
          <!-- Paso 1: Información básica -->
          <div v-if="currentStep === 1" class="space-y-6">
            <div class="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
              <div class="flex items-start gap-3">
                <UIcon name="i-heroicons-exclamation-circle" class="h-5 w-5 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
                <p class="text-sm text-yellow-800 dark:text-yellow-100 text-left leading-relaxed">
                  <span class="font-semibold">Los datos de este formulario son confidenciales.</span>
                  ProBusiness los usará únicamente para gestionar tu pedido y no serán compartidos.
                </p>
              </div>
            </div>

            <div class="text-center mb-2">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
                Persona que recoja la carga
              </h2>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UFormField label="Nombre completo:" required>
                <UInput v-model="formData.nombreCompleto" placeholder="Nombre completo" :disabled="loading"
                  class="w-full" />
              </UFormField>

              <UFormField label="DNI / ID:" required>
                <UInput v-model="formData.dni" placeholder="48558558" :disabled="loading" class="w-full" />
              </UFormField>
            </div>

            <div class="flex items-center justify-center gap-2 text-gray-900 dark:text-white pt-2">
              <UIcon name="i-heroicons-cube" class="h-6 w-6 text-primary-500 shrink-0" />
              <h3 class="text-lg font-semibold">
                Datos de la importación
              </h3>
            </div>

            <div class="space-y-2">
              <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide text-center">
                Importador
              </p>
              <UFormField label="Selecciona el nombre del importador" required>
                <USelectMenu
                  v-model="formData.importador"
                  :items="clientes"
                  placeholder="— Elige un importador —"
                  :disabled="loading"
                  class="w-full"
                  @update:model-value="handleImportadorChange"
                />
              </UFormField>
            </div>

            <div v-if="formData.importador?.value" class="space-y-3">
              <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide text-center">
                Mercancías
              </p>
              <div class="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-950">
                <div v-if="mercanciasSeleccionadas.length === 0" class="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                  No hay proveedores embarcados registrados para esta cotización.
                </div>
                <table v-else class="w-full text-sm text-left">
                  <thead>
                    <tr class="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                      <th class="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Proveedor
                      </th>
                      <th class="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide text-right w-24">
                        Bultos
                      </th>
                      <th class="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Producto
                      </th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                    <tr v-for="(row, idx) in mercanciasSeleccionadas" :key="idx" class="text-gray-900 dark:text-gray-100">
                      <td class="px-4 py-3">{{ row.proveedor || '—' }}</td>
                      <td class="px-4 py-3 text-right tabular-nums">{{ formatBultosMercancia(row.bultos) }}</td>
                      <td class="px-4 py-3">{{ row.producto || '—' }}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr class="border-t border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-900/40 font-semibold">
                      <td class="px-4 py-3 text-gray-900 dark:text-white">Total</td>
                      <td class="px-4 py-3 text-right tabular-nums text-primary-600 dark:text-primary-400">
                        {{ formatBultosMercancia(totalBultosEmbarcados) }}
                      </td>
                      <td class="px-4 py-3" />
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          <!-- Paso 2: Datos del cliente -->
          <div v-if="currentStep === 2" class="space-y-6">
            <div class="text-center mb-6">
           
              
            </div>
            <div v-if="formData.tipoComprobante.value === 'BOLETA'" class="space-y-4">


              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <UFormField label="DNI:" required>
                  <UInput v-model="formData.clienteDni" placeholder="Ingrese DNI" :disabled="loading" class="w-full" />
                </UFormField>

                <UFormField label="Nombre completo:" required>
                  <UInput v-model="formData.clienteNombre" placeholder="Ingrese nombre completo" :disabled="loading"
                    class="w-full" />
                </UFormField>
              </div>

              <UFormField label="Correo:" required>
                <UInput v-model="formData.clienteCorreo" type="email" placeholder="Ingrese correo"
                  :disabled="loading" class="w-full" />
              </UFormField>
            </div>

            <div v-else-if="formData.tipoComprobante.value === 'FACTURA'" class="space-y-4">
              

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <UFormField label="RUC:" required>
                  <UInput v-model="formData.clienteRuc" placeholder="Ingrese RUC" :disabled="loading" class="w-full" />
                </UFormField>

                <UFormField label="Razón social:" required>
                  <UInput v-model="formData.clienteRazonSocial" placeholder="Ingrese razón social" :disabled="loading"
                    class="w-full" />
                </UFormField>
              </div>

              <UFormField label="Correo:" required>
                <UInput v-model="formData.clienteCorreo" type="email" placeholder="Ingrese correo"
                  :disabled="loading" class="w-full" />
              </UFormField>
            </div>
          </div>

          <!-- Paso 3: Información del chofer -->
          <div v-if="currentStep === 3" class="space-y-6">
            <div class="text-center mb-6">
             
              
            </div>



            <div class="space-y-4">
              <UFormField label="Nombre completo del Chofer: (si es usted póngalo)">
                <UInput v-model="formData.choferNombre" placeholder="Nombre del chofer" :disabled="loading"
                  class="w-full" />
              </UFormField>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <UFormField label="DNI / ID Chofer:">
                  <UInput v-model="formData.choferDni" placeholder="456457457" :disabled="loading" class="w-full" />
                </UFormField>

                <UFormField label="# de Licencia de conducir:">
                  <UInput v-model="formData.choferLicencia" placeholder="456457457" :disabled="loading"
                    class="w-full" />
                </UFormField>
              </div>

              <UFormField label="Placa del Vehículo:">
                <UInput v-model="formData.choferPlaca" placeholder="456457457" :disabled="loading" class="w-full" />
              </UFormField>

              <UFormField label="Dirección final de destino (colocar la dirección completa de su almacén, casa, etc):">
                <UTextarea v-model="formData.direccionDestino" placeholder="Dirección completa" :rows="2"
                  :disabled="loading" class="w-full" />
              </UFormField>

              <UFormField label="Distrito de la dirección final de destino:">
                <USelectMenu v-model="formData.distritoDestino" :items="distritos" placeholder="Distrito" :disabled="loading" class="w-full" />
              </UFormField>
            </div>
          </div>

          <!-- Paso 4: Selección de fecha -->
          <div v-if="currentStep === 4" class="space-y-6 w-full">
            <div class="text-center mb-6">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
                Selección de fecha y horario
              </h2>
            </div>
            
            <!-- Mostrar mensaje si no hay horarios disponibles -->
            <div v-if="!loadingHorarios && horarios.length === 0" class="bg-yellow-50 dark:bg-yellow-800 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mb-6">
              <div class="flex items-start">
                <div class="flex-shrink-0">
                  <UIcon name="i-heroicons-information-circle" class="h-5 w-5 text-yellow-600" />
                </div>
                <div class="ml-3">
                  <p class="text-sm text-yellow-800 dark:text-yellow-100">
                    <strong>No hay horarios disponibles en este momento.</strong> Puedes continuar y completar el formulario sin seleccionar una fecha. Nos pondremos en contacto contigo para coordinar la entrega.
                  </p>
                </div>
              </div>
            </div>
            
            <!-- Mostrar spinner mientras se cargan los horarios -->
            <div v-else-if="loadingHorarios" class="flex justify-center items-center py-8">
              <div class="text-center">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
                <p class="text-gray-600 dark:text-gray-300">Cargando horarios disponibles...</p>
              </div>
            </div>
            
            <!-- Mostrar calendario si hay horarios disponibles -->
            <AppointmentScheduler v-else :horarios="horarios" @date-selected="handleDateSelected" />
          </div>

          <!-- Navigation Buttons -->
          <div class="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <UButton v-if="currentStep > 1" @click="previousStep" variant="outline" icon="i-heroicons-arrow-left"
              :disabled="loading">
              Anterior
            </UButton>

            <div class="ml-auto">
              <UButton v-if="currentStep < 4" @click="nextStep" icon="i-heroicons-arrow-right" trailing
                :disabled="!canProceedToNextStep || loading" :loading="loading">
                Continuar
              </UButton>
              
              <UButton v-if="currentStep === 4" @click="finalizarReserva" color="primary" size="lg"
                :disabled="!canProceedToNextStep || loading" :loading="loading">
                Terminar formulario
              </UButton>
            </div>
          </div>
        </form>
      </UCard>

    </div>

    <!-- Modal de éxito - Fuera del contenedor principal -->
    <SuccessReservationModal 
      v-if="showSuccessModal && reservationSummary.persona"
      v-model="showSuccessModal" 
      :reservation-data="reservationSummary"
      @generate-new-reservation="handleNewReservation"
      @go-to-home="handleGoToHome"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch, onMounted } from 'vue'
import { useModal } from '~/composables/commons/useModal'
import AppointmentScheduler from '~/components/commons/AppointmentScheduler.vue'
import SuccessReservationModal from '~/components/commons/SuccessModal.vue'
import { useDelivery } from '~/composables/clientes/delivery/useDelivery'
import type { ClientesOptions } from '~/types/clientes/delivery/common'
import { useLocation } from '~/composables/commons/useLocation'
import { useSpinner } from '~/composables/commons/useSpinner'
import { useFormPersistence } from '~/composables/commons/useFormPersistence'
import { useRoute } from 'vue-router'
import { useUserRole } from '~/composables/auth/useUserRole'
const { showSuccess, showError } = useModal()
const { getDeliveryByConsolidadoId, clientes, carga, getDeliveryAgency, agencies, saveDeliveryProvincia, saveDeliveryLima, getHorariosDisponibles, horarios, loadingHorarios, getFormularioLimaByCotizacion, loadingFormulario } = useDelivery()
const { departamentos, provincias, distritos, getDepartamentos, getProvincias, getDistritos, loadingDepartamentos, loadingProvincias, loadingDistritos } = useLocation()
const { withSpinner } = useSpinner()
const {
  userData,
  currentRole,
  userName,
  userEmail,
  fetchCurrentUser
} = useUserRole()
// Meta
definePageMeta({
  title: 'Formulario de Entrega - Lima',
  layout: 'default',
  middleware: 'auth'
})

// Route
const route = useRoute()
const consolidadoId = route.params.id as string
const { saveFormState, loadFormState, clearFormState } = useFormPersistence('lima', consolidadoId)

// Estado del formulario
const currentStep = ref(1)
const loading = ref(false)
const showSuccessModal = ref(false)



// Configuración de pasos
const steps = [
  { id: 1, title: 'Información básica' },
  { id: 2, title: 'Datos del cliente' },
  { id: 3, title: 'Información del chofer' },
  { id: 4, title: 'Selección de fecha' }
]

// Datos del formulario
const formData = reactive({
  // Paso 1
  nombreCompleto: '',
  dni: '',
  importador: { label: '', value: '' },
  tipoComprobante: { label: 'BOLETA', value: 'BOLETA' },
  tiposProductos: '',

  // Paso 2
  clienteDni: '',
  clienteNombre: '',
  clienteCorreo: '',
  clienteRuc: '',
  clienteRazonSocial: '',

  // Paso 3
  choferNombre: '',
  choferDni: '',
  choferLicencia: '',
  choferPlaca: '',
  direccionDestino: '',
  distritoDestino: '',

  // Paso 4
  fechaEntrega: null as Date | null,
  horarioSeleccionado: null as any
})

// Opciones para selects


const tiposComprobante = [
  { label: 'BOLETA', value: 'BOLETA' },
  { label: 'FACTURA', value: 'FACTURA' }
]

function formatBultosMercancia (n: number) {
  const x = Number(n)
  if (!Number.isFinite(x)) return '0'
  if (Number.isInteger(x)) return String(x)
  return x.toLocaleString('es-PE', { maximumFractionDigits: 2 })
}

const mercanciasSeleccionadas = computed(() => {
  const uuid = formData.importador?.value
  if (!uuid) return []
  return clientes.value.find(c => c.value === uuid)?.mercancias ?? []
})

const totalBultosEmbarcados = computed(() =>
  mercanciasSeleccionadas.value.reduce((sum, m) => sum + (Number(m.bultos) || 0), 0)
)

watch(
  [() => formData.importador?.value, clientes],
  () => {
    const uuid = formData.importador?.value
    if (!uuid) {
      formData.tiposProductos = ''
      return
    }
    const rows = clientes.value.find(c => c.value === uuid)?.mercancias ?? []
    const names = [...new Set(rows.map(r => r.producto).filter(Boolean))]
    formData.tiposProductos = names.length ? names.join(', ') : ''
  },
  { deep: true, immediate: true }
)

// Validaciones por paso
const canProceedToNextStep = computed(() => {
  switch (currentStep.value) {
    case 1:
      return Boolean(formData.nombreCompleto &&
        formData.dni &&
        formData.importador?.value)
    case 2:
      if (formData.tipoComprobante.value === 'BOLETA') {
        return formData.clienteDni && formData.clienteNombre && formData.clienteCorreo
      } else if (formData.tipoComprobante.value === 'FACTURA') {
        return formData.clienteRuc && formData.clienteRazonSocial && formData.clienteCorreo
      }
      return false
    case 3:
      return true // Este paso es opcional
    case 4:
      // Si no hay horarios disponibles, permitir continuar sin seleccionar fecha/horario
      if (horarios.value.length === 0) {
        return true
      }
      // Si hay horarios disponibles, requerir selección
      return formData.fechaEntrega !== null && formData.horarioSeleccionado !== null
    default:
      return false
  }
})

// Computed para el resumen de la reserva
const reservationSummary = computed(() => {
  // Función para formatear hora a formato AM/PM
  const formatTimeToAMPM = (time24: string): string => {
    if (!time24) return ''
    const [hours, minutes] = time24.split(':')
    const hour24 = parseInt(hours, 10)
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24
    const ampm = hour24 >= 12 ? 'PM' : 'AM'
    return `${hour12}:${minutes} ${ampm}`
  }

  // Función para formatear fecha
  const formatSelectedDate = (date: Date | null | string): string => {
    if (!date) return ''
    
    // Si es una cadena, intentar convertirla a Date
    let dateObj: Date
    if (typeof date === 'string') {
      dateObj = new Date(date)
      // Verificar si la conversión fue exitosa
      if (isNaN(dateObj.getTime())) return date // Retornar la cadena original si no se puede convertir
    } else if (date instanceof Date) {
      dateObj = date
    } else {
      return '' // Si no es Date ni string, retornar vacío
    }
    
    const day = dateObj.getDate()
    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ]
    const month = months[dateObj.getMonth()]
    const year = dateObj.getFullYear()
    return `${day} de ${month} de ${year}`
  }

  return {
    fecha: formatSelectedDate(formData.fechaEntrega),
    hora: formData.horarioSeleccionado && formData.horarioSeleccionado.start_time && formData.horarioSeleccionado.end_time
      ? `${formatTimeToAMPM(formData.horarioSeleccionado.start_time)} - ${formatTimeToAMPM(formData.horarioSeleccionado.end_time)}`
      : '',
    persona: formData.nombreCompleto || '',
    dni: formData.dni || '',
    distrito: formData.distritoDestino,
    tipoComprobante: String(typeof formData.tipoComprobante === 'object' && formData.tipoComprobante ? formData.tipoComprobante.label : formData.tipoComprobante || ''),
    importador: String(typeof formData.importador === 'object' && formData.importador ? formData.importador.label : formData.importador || '')
  }
})

// Navegación entre pasos
const nextStep = async () => {
  console.log(canProceedToNextStep.value, "waos")
  if (currentStep.value < 4 && canProceedToNextStep.value) {
    // Si estamos en el paso 2 y vamos al paso 3, cargar horarios
    if (currentStep.value === 2) {
      try {
        await getHorariosDisponibles(Number(consolidadoId))
      } catch (error) {
        console.error('Error al cargar horarios:', error)
        // Continuar aunque haya error, ya que el paso 3 es opcional
      }
    }
    
    currentStep.value++
    // Asegurar que el modal esté cerrado al cambiar de paso
    showSuccessModal.value = false
    // Guardar estado después de cambiar de paso
    saveFormState(formData, currentStep.value)
  }
}

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
    // Asegurar que el modal esté cerrado al cambiar de paso
    showSuccessModal.value = false
    // Guardar estado después de cambiar de paso
    saveFormState(formData, currentStep.value)
  }
}

// Función para navegar directamente a un paso específico
const goToStep = (stepNumber: number) => {
  if (canNavigateToStep(stepNumber)) {
    currentStep.value = stepNumber
    // Asegurar que el modal esté cerrado al navegar a un paso
    showSuccessModal.value = false
    // Guardar estado después de cambiar de paso
    saveFormState(formData, currentStep.value)
  }
}

// Función para verificar si se puede navegar a un paso específico
const canNavigateToStep = (stepNumber: number) => {
  // Siempre puede ir al paso 1
  if (stepNumber === 1) return true
  
  // Para ir al paso 2, debe completar el paso 1
  if (stepNumber === 2) {
    return Boolean(formData.nombreCompleto &&
      formData.dni &&
      formData.importador?.value)
  }
  
  // Para ir al paso 3, debe completar el paso 2
  if (stepNumber === 3) {
    const step1Valid = Boolean(formData.nombreCompleto &&
      formData.dni &&
      formData.importador?.value)
      
    const step2Valid = formData.tipoComprobante.value === 'BOLETA'
      ? (formData.clienteDni && formData.clienteNombre && formData.clienteCorreo)
      : formData.tipoComprobante.value === 'FACTURA'
      ? (formData.clienteRuc && formData.clienteRazonSocial && formData.clienteCorreo)
      : false
      
    return step1Valid && step2Valid
  }
  
  // Para ir al paso 4, debe completar el paso 3 (que es opcional)
  if (stepNumber === 4) {
    const step1Valid = Boolean(formData.nombreCompleto &&
      formData.dni &&
      formData.importador?.value)
      
    const step2Valid = formData.tipoComprobante.value === 'BOLETA'
      ? (formData.clienteDni && formData.clienteNombre && formData.clienteCorreo)
      : formData.tipoComprobante.value === 'FACTURA'
      ? (formData.clienteRuc && formData.clienteRazonSocial && formData.clienteCorreo)
      : false
      
    // Permitir ir al paso 4 si los pasos anteriores están completos
    // El paso 4 puede completarse sin horarios disponibles
    return step1Valid && step2Valid
  }
  
  return false
}

// Manejo de fecha seleccionada del calendario
const handleDateSelected = (date: Date | null, timeSlot: any) => {
  formData.fechaEntrega = date
  formData.horarioSeleccionado = timeSlot
  // Asegurar que el modal esté cerrado al seleccionar fecha/horario
  showSuccessModal.value = false
  // Guardar estado cuando se selecciona fecha/horario
  saveFormState(formData, currentStep.value)
}

// Manejo del formulario
const handleSubmit = () => {
  if (currentStep.value < 4) {
    nextStep()
  }
}

const finalizarReserva = async () => {
  loading.value = true

  try {
    await withSpinner(async () => {
      try {
        // Manejar distritoDestino que puede ser string o objeto con value
        let distritoDestinoValue = ''
        const distritoDestino: any = formData.distritoDestino
        if (distritoDestino) {
          if (typeof distritoDestino === 'object' && distritoDestino !== null && 'value' in distritoDestino) {
            distritoDestinoValue = String(distritoDestino.value || '')
          } else if (typeof distritoDestino === 'string') {
            distritoDestinoValue = distritoDestino
          }
        }
        
        const data = {
          ...formData,
          importador: formData.importador.value,
          tipoComprobante: formData.tipoComprobante.value,
          // Solo incluir fecha y horario si están seleccionados
          fechaEntrega: formData.fechaEntrega || null,
          horarioSeleccionado: formData.horarioSeleccionado || null,
          distritoDestino: distritoDestinoValue
        }
        
        const response = await saveDeliveryLima(data)
        console.log(response, "response")
        if (response.success) {
          console.log("exitosamente - mostrando modal")
          // Mostrar modal de éxito en lugar del toast
          showSuccessModal.value = true
          // Limpiar estado del localStorage al enviar exitosamente
          clearFormState()
        } else {
          showError('Error al guardar', response.error || 'Error al guardar los datos')
        }
      } catch (error: any) {
        // Manejar errores de API correctamente
        const errorMessage = error?.response?.data?.message || 
                           error?.message || 
                           'Error al guardar los datos'
        showError('Error al guardar', errorMessage)
        console.error('Error en saveDeliveryLima:', error)
      }
    }, 'Guardando datos de envío...')

  } catch (error: any) {
    // Manejar errores del spinner o otros errores
    const errorMessage = error?.message || 'Error inesperado al procesar el formulario'
    showError('Error al procesar', errorMessage)
    console.error('Error al finalizar formulario:', error)
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  currentStep.value = 1

  // Resetear formulario manteniendo algunos valores por defecto
  Object.assign(formData, {
    nombreCompleto: '',
    dni: '',
    importador: { label: '', value: '' },
    tipoComprobante: { label: 'BOLETA', value: 'BOLETA' },
    tiposProductos: '',
    clienteDni: '',
    clienteNombre: '',
    clienteCorreo: '',
    clienteRuc: '',
    clienteRazonSocial: '',
    choferNombre: '',
    choferDni: '',
    choferLicencia: '',
    choferPlaca: '',
    direccionDestino: '',
    distritoDestino: '',
    fechaEntrega: null,
    horarioSeleccionado: null
  })
}

// Función para manejar nueva reserva desde el modal
const handleNewReservation = () => {
  resetForm()
  // Navegar al inicio después de resetear el formulario
  navigateTo('/')
}

// Función para manejar volver al home desde el modal
const handleGoToHome = () => {
  // Solo navegar al home sin resetear el formulario
  navigateTo('/')
}

// Actualizar datos del consolidado
watch(() => formData.tipoComprobante, (newValue) => {
  if (newValue.value === 'BOLETA') {
    // Pre-llenar datos para BOLETA
    
  } else if (newValue.value === 'FACTURA') {
    // Pre-llenar datos para FACTURA
    
  }
})

// Función para manejar el cambio de importador
const handleImportadorChange = async (newValue: any) => {
  // Solo cargar si se selecciona un importador válido con value
  if (newValue && newValue.value) {
    try {
      console.log('Cargando formulario para importador:', newValue.value)
      const formularioData = await getFormularioLimaByCotizacion(newValue.value)
      
      if (formularioData && formularioData.success && formularioData.data && formularioData.data.formData) {
        const savedFormData = formularioData.data.formData
        
        console.log('Formulario encontrado, restaurando datos...', savedFormData)
        
        // Restaurar todos los datos del formulario guardado
        if (savedFormData.nombreCompleto) {
          formData.nombreCompleto = savedFormData.nombreCompleto
        }
        if (savedFormData.dni) {
          formData.dni = savedFormData.dni
        }
        // tiposProductos: lo arma el watch desde las mercancías de la cotización seleccionada

        // Actualizar tipo de comprobante si viene del formulario guardado
        if (savedFormData.tipoComprobante) {
          formData.tipoComprobante = savedFormData.tipoComprobante
        }
        
        // Datos del cliente (Paso 2)
        if (savedFormData.clienteDni) {
          formData.clienteDni = savedFormData.clienteDni
        }
        if (savedFormData.clienteNombre) {
          formData.clienteNombre = savedFormData.clienteNombre
        }
        if (savedFormData.clienteCorreo) {
          formData.clienteCorreo = savedFormData.clienteCorreo
        }
        if (savedFormData.clienteRuc) {
          formData.clienteRuc = savedFormData.clienteRuc
        }
        if (savedFormData.clienteRazonSocial) {
          formData.clienteRazonSocial = savedFormData.clienteRazonSocial
        }
        
        // Datos del chofer (Paso 3)
        if (savedFormData.choferNombre) {
          formData.choferNombre = savedFormData.choferNombre
        }
        if (savedFormData.choferDni) {
          formData.choferDni = savedFormData.choferDni
        }
        if (savedFormData.choferLicencia) {
          formData.choferLicencia = savedFormData.choferLicencia
        }
        if (savedFormData.choferPlaca) {
          formData.choferPlaca = savedFormData.choferPlaca
        }
        if (savedFormData.direccionDestino) {
          formData.direccionDestino = savedFormData.direccionDestino
        }
        if (savedFormData.distritoDestino) {
          // Manejar distritoDestino que puede ser string o objeto
          const distrito = savedFormData.distritoDestino
          if (typeof distrito === 'string') {
            formData.distritoDestino = distrito
          } else if (typeof distrito === 'object' && distrito !== null) {
            formData.distritoDestino = distrito
          }
        }
        
        // NO incluir fechaEntrega ni horarioSeleccionado (se mantienen como null)
        formData.fechaEntrega = null
        formData.horarioSeleccionado = null
        
        // Restaurar el paso donde se quedó (normalmente paso 4 sin horario)
        if (formularioData.data.currentStep) {
          currentStep.value = formularioData.data.currentStep
          
          // Si está en el paso 4, cargar horarios disponibles
          if (formularioData.data.currentStep === 4) {
            try {
              await getHorariosDisponibles(Number(consolidadoId))
            } catch (error) {
              console.error('Error al cargar horarios:', error)
            }
          }
        }
        
        // Guardar estado después de cargar
        saveFormState(formData, currentStep.value)
        
        console.log('Formulario guardado cargado exitosamente', {
          paso: currentStep.value,
          tieneHorario: !!formData.horarioSeleccionado
        })
      } else {
        console.log('No se encontró formulario guardado para este importador')
      }
    } catch (error: any) {
      // Si el error es 404 (no hay formulario), es normal, no hacer nada
      if (error?.response?.status !== 404) {
        console.error('Error al cargar formulario guardado:', error)
      } else {
        console.log('No hay formulario guardado (404), continuando normalmente')
      }
      // Si no hay formulario guardado, continuar normalmente con el formulario vacío
    }
  }
}

// Watcher como respaldo (por si acaso)
watch(() => formData.importador?.value, async (newValue, oldValue) => {
  // Solo ejecutar si el valor realmente cambió
  if (newValue && newValue !== oldValue) {
    console.log('Watcher detectó cambio en importador.value:', newValue)
    // La función handleImportadorChange ya maneja esto, pero lo dejamos como respaldo
  }
}, { immediate: false })
onMounted(async () => {
  // Asegurar que el modal esté cerrado al montar el componente
  showSuccessModal.value = false
  
  // Cargar datos del servidor
  await getDeliveryByConsolidadoId(Number(consolidadoId))
  
  // No cargar horarios aquí, se cargarán cuando se entre al paso 3
  
  if(formData.tipoComprobante.value === 'BOLETA'){
    formData.clienteDni = userData.value?.dni || ''
    formData.clienteNombre = userData.value?.name || ''
  }
  formData.clienteCorreo = userData.value?.email || ''
  
  // Intentar cargar estado guardado
  const savedState = loadFormState()
  if (savedState) {
    console.log('Estado guardado encontrado:', savedState)
    // Restaurar datos del formulario
    Object.assign(formData, savedState.formData)
    // Restaurar paso actual
    currentStep.value = savedState.currentStep
    
    // Si el paso guardado es 3 o 4, cargar horarios
    if (savedState.currentStep >= 3) {
      try {
        await getHorariosDisponibles(Number(consolidadoId))
      } catch (error) {
        console.error('Error al cargar horarios:', error)
      }
    }
  }
  
  await getDistritos('1')
})

// Watcher para cargar horarios cuando se entra al paso 3
watch(() => currentStep.value, async (newStep) => {
  if (newStep === 3 && horarios.value.length === 0 && !loadingHorarios.value) {
    try {
      await getHorariosDisponibles(Number(consolidadoId))
    } catch (error) {
      console.error('Error al cargar horarios:', error)
      // Continuar aunque haya error, ya que el paso 3 es opcional
    }
  }
})
</script>

<style scoped>
/* Estilos adicionales si son necesarios */
.step-indicator {
  transition: all 0.3s ease;
}
</style>
