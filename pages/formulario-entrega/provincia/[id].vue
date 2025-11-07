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
          Ahora necesitamos los datos del destinatario para entregar tu pedido.
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
      <div class="text-center mb-8">
        <!-- Mensaje de información importante -->
        <div v-if="currentStep === 1" class="max-w-4xl mx-auto">
          <div class="bg-yellow-50 dark:bg-yellow-800 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mb-6">
            <div class="flex items-start">
              <div class="flex-shrink-0">
                <UIcon name="i-heroicons-information-circle" class="h-5 w-5 text-yellow-600" />
              </div>
              <div class="ml-3">
                <p class="text-sm text-yellow-800 dark:text-yellow-100">
                  <strong>Los datos que ingreses en este formulario son totalmente confidenciales.</strong> ProBusiness los utilizará únicamente para fines internos y la gestión de tu pedido, no serán compartidos ni divulgados públicamente.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Form Container -->
      <UCard class="max-w-4xl mx-auto">
        <form @submit.prevent="handleSubmit">
          <!-- Paso 1: Información básica -->
          <div v-if="currentStep === 1" class="space-y-6">
            <div class="text-center mb-6">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
                Persona que recoja la carga:
              </h2>
            </div>
            <UFormField label="Selecciona el nombre del importador:" required>
              <USelectMenu v-model="formData.importador" :items="clientes" placeholder="Selecciona el importador"
                :disabled="loading" class="w-full" />
            </UFormField>

            <UFormField label="Escoge el tipo de comprobante:" required>
              <USelectMenu v-model="formData.tipoComprobante" :items="tiposComprobante"
                placeholder="Selecciona tipo de comprobante" :disabled="loading" class="w-full" />
            </UFormField>

            <UFormField label="Tipos de productos importado (juguetes, stickers, botellas ... etc):" required>
              <UTextarea v-model="formData.tiposProductos" placeholder="Describe los productos importados" :rows="3"
                :disabled="loading" class="w-full" />
            </UFormField>
          </div>

          <!-- Paso 2: Datos del cliente -->
          <div v-if="currentStep === 2" class="space-y-6">
            

            <!-- Boleta -->
            <div v-if="formData.tipoComprobante && formData.tipoComprobante.value === 'boleta'" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <UFormField label="DNI:" required>
                  <UInput v-model="formData.clienteDni" placeholder="" :disabled="loading" class="w-full" />
                </UFormField>

                <UFormField label="Nombre completo:" required>
                  <UInput v-model="formData.clienteNombre" placeholder="" :disabled="loading"
                    class="w-full" />
                </UFormField>
              </div>

              <UFormField label="Correo:" required>
                <UInput v-model="formData.clienteCorreo" type="email" placeholder=""
                  :disabled="loading" class="w-full" />
              </UFormField>
            </div>

            <!-- Factura -->
            <div v-else-if="formData.tipoComprobante && formData.tipoComprobante.value === 'factura'" class="space-y-4">
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
                <UInput v-model="formData.clienteCorreo" type="email" placeholder=""
                  :disabled="loading" class="w-full" />
              </UFormField>
            </div>
          </div>

          <!-- Paso 3: Información del destinatario -->
          <div v-if="currentStep === 3" class="space-y-8">
            <!-- ¿A quién se envía la carga? -->
            <div class="space-y-4">
              <div class="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 justify-center py-4">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white text-center md:text-left">
                  ¿A quién se envía la carga?
                </h3>
                <URadioGroup
                  orientation="horizontal" variant="list"
                  :items="tiposDestinatarioItems"
                  :model-value="formData.tipoDestinatario?.value"
                  @update:model-value="(value) => formData.tipoDestinatario = tiposDestinatario.find(t => t.value === value) || null"
                  :disabled="loading"
                  :ui="{ 
                    wrapper: 'flex gap-4 md:gap-8 justify-center',
                    container: 'flex gap-4 md:gap-8',
                    item: 'mx-1 md:mx-2'
                  }"
                />
              </div>
            </div>

            <!-- Divider -->
            <hr class="border-gray-200 dark:border-gray-700">

            <!-- Persona autorizada para recoger la carga -->
            <div class="space-y-6">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                Persona autorizada para recoger la carga
              </h3>

              <!-- Información del destinatario -->
              <div v-if="formData.tipoDestinatario.value === 'PERSONA NATURAL'" class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <UFormField label="DNI/ID:" required>
                    <UInput v-model="formData.destinatarioDni" placeholder="Ingrese DNI/ID" :disabled="loading"
                      class="w-full" />
                  </UFormField>

                  <UFormField label="Nombre completo:" required>
                    <UInput v-model="formData.destinatarioNombre" placeholder="Ingrese nombre completo" :disabled="loading"
                      class="w-full" />
                  </UFormField>
                </div>

                <UFormField label="Celular:" required>
                  <UInput v-model="formData.destinatarioCelular" placeholder="Ingrese celular" :disabled="loading"
                    class="w-full" />
                </UFormField>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <UFormField label="Departamento:" required>
                    <USelectMenu v-model="formData.destinatarioDepartamento" placeholder="Selecciona el departamento"
                      class="w-full" :items="departamentos" :disabled="loadingDepartamentos"
                      @update:model-value="getProvincias(formData.destinatarioDepartamento.value)" />
                  </UFormField>

                  <UFormField label="Provincia:" required>
                    <USelectMenu v-model="formData.destinatarioProvincia" placeholder="Selecciona la provincia"
                      class="w-full" :items="provincias" :disabled="loadingProvincias"
                      @update:model-value="getDistritos(formData.destinatarioProvincia.value)" />
                  </UFormField>

                  <UFormField label="Distrito:" required>
                    <USelectMenu v-model="formData.destinatarioDistrito" placeholder="Selecciona el distrito"
                      class="w-full" :items="distritos" :disabled="loadingDistritos"
                      @update:model-value="getDistritos(formData.destinatarioProvincia.value)" />
                  </UFormField>
                </div>
              </div>

              <!-- Información de EMPRESA -->
              <div v-else-if="formData.tipoDestinatario.value === 'EMPRESA'" class="space-y-4">
                <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p class="text-blue-800 dark:text-blue-200 text-sm">
                    Recuerde que si la carga va a nombre de una EMPRESA el representante legal es quien tiene que recoger
                    su pedido en la agencia
                  </p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <UFormField label="RUC:" required>
                    <UInput v-model="formData.destinatarioRuc" placeholder="Ingrese RUC" :disabled="loading"
                      class="w-full" />
                  </UFormField>

                  <UFormField label="Razón social:" required>
                    <UInput v-model="formData.destinatarioRazonSocial" placeholder="Ingrese razón social"
                      :disabled="loading" class="w-full" />
                  </UFormField>
                </div>

                <UFormField label="Celular:" required>
                  <UInput v-model="formData.destinatarioCelular" placeholder="Ingrese celular" :disabled="loading"
                    class="w-full" />
                </UFormField>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <UFormField label="Departamento:" required>
                    <USelectMenu v-model="formData.destinatarioDepartamento" class="w-full" :items="departamentos"
                      placeholder="Selecciona el departamento" :disabled="loadingDepartamentos"
                      @update:model-value="getProvincias(formData.destinatarioDepartamento.value)" />
                  </UFormField>

                  <UFormField label="Provincia:" required>
                    <USelectMenu v-model="formData.destinatarioProvincia" class="w-full" :items="provincias"
                      placeholder="Selecciona la provincia" :disabled="loadingProvincias"
                      @update:model-value="getDistritos(formData.destinatarioProvincia.value)" />
                  </UFormField>

                  <UFormField label="Distrito:" required>
                    <USelectMenu v-model="formData.destinatarioDistrito" class="w-full" :items="distritos"
                      placeholder="Selecciona el distrito" :disabled="loadingDistritos"
                      @update:model-value="getDistritos(formData.destinatarioProvincia.value)" />
                  </UFormField>
                </div>
              </div>
            </div>

            <!-- Divider -->
            <hr class="border-gray-200 dark:border-gray-700">

            <!-- Agencia autorizada para recoger la carga -->
            <div class="space-y-6">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                Agencia autorizada para recoger la carga
              </h3>

              <UFormField label="Escoge la agencia de envío:" required>
                <USelectMenu v-model="formData.agenciaEnvio" :items="agencies"
                  placeholder="Selecciona la agencia de envío" :disabled="loading" class="w-full" />
              </UFormField>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4" v-if="formData.agenciaEnvio?.value == 3">
                <UFormField label="Nombre de la agencia:" required>
                  <UInput v-model="formData.nombreAgencia" placeholder="Ingrese nombre de la agencia" :disabled="loading"
                    class="w-full" />
                </UFormField>

                <UFormField label="RUC de la agencia:" required>
                  <UInput v-model="formData.rucAgencia" placeholder="Ingrese RUC de la agencia" :disabled="loading" class="w-full" />
                </UFormField>

                <UFormField label="Dirección de la agencia sede lima:" required>
                  <UInput v-model="formData.direccionAgenciaLima" placeholder="Ingrese dirección de la agencia en Lima"
                    :disabled="loading" class="w-full" />
                </UFormField>
              </div>

              <UFormField label="Dirección de la agencia de destino (La dirección de la agencia en su provincia):" required>
                <UTextarea v-model="formData.direccionAgenciaDestino" placeholder="Dirección de la agencia en provincia"
                  :rows="2" :disabled="loading" class="w-full" />
              </UFormField>
            </div>

            <!-- Divider -->
            <hr class="border-gray-200 dark:border-gray-700">

            <!-- Envío a domicilio -->
            <div class="space-y-6">
              <div class="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white text-center md:text-left">
                  ¿Desea envío a domicilio?
                </h3>
                <URadioGroup
                  orientation="horizontal" variant="list"  
                  :items="envioADomicilioItems"
                  :model-value="formData.envioADomicilio.toString()"
                  @update:model-value="(value) => formData.envioADomicilio = value === 'true'"
                  :disabled="loading"
                  :ui="{ 
                    wrapper: 'flex gap-4 md:gap-8 justify-center md:justify-start',
                    container: 'flex gap-4 md:gap-8',
                    item: 'mx-1 md:mx-2'
                  }"
                />
              </div>

              <!-- Campo de dirección domicilio - solo aparece si selecciona "Sí" -->
              <div v-if="formData.envioADomicilio" class="space-y-4">
                <UFormField label="Escriba su dirección exacta:" required>
                  <UTextarea v-model="formData.direccionDomicilio" placeholder="Dirección exacta para envío a domicilio"
                    :rows="2" :disabled="loading" class="w-full" />
                </UFormField>
              </div>
            </div>
          </div>

          <!-- Navigation Buttons -->
          <div class="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <UButton v-if="currentStep > 1" @click="previousStep" variant="outline" icon="i-heroicons-arrow-left"
              :disabled="loading">
              Anterior
            </UButton>

            <div class="ml-auto">
              <UButton v-if="currentStep < 3" @click="nextStep" icon="i-heroicons-arrow-right" trailing
                :disabled="!canProceedToNextStep || loading" :loading="loading">
                Continuar
              </UButton>

              <UButton v-if="currentStep === 3" @click="finalizarFormulario" color="error" size="lg"
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
import { ref, computed, reactive, watch } from 'vue'
import { useOptions } from '~/composables/commons/useOptions'
import { useDelivery } from '~/composables/clientes/delivery/useDelivery'
import type { ClientesOptions } from '~/types/clientes/delivery/common'
import { useLocation } from '~/composables/commons/useLocation'
import { useSpinner } from '~/composables/commons/useSpinner'
import { useFormPersistence } from '~/composables/commons/useFormPersistence'
import SuccessReservationModal from '~/components/commons/SuccessModal.vue'
import type { RadioGroupItem } from '@nuxt/ui'
// Composables
import {useModal} from '~/composables/commons/useModal'
import {useUserRole} from '~/composables/auth/useUserRole'
const { showSuccess, showError } = useModal()
const { paises, getPaises } = useOptions()
const { getDeliveryByConsolidadoId, clientes, carga, getDeliveryAgency, agencies, saveDeliveryProvincia, getHorariosDisponibles, horarios, loadingHorarios } = useDelivery()
const { departamentos, provincias, distritos, getDepartamentos, getProvincias, getDistritos, loadingDepartamentos, loadingProvincias, loadingDistritos } = useLocation()
const { withSpinner } = useSpinner()
const { userData } = useUserRole()

// Meta
definePageMeta({
  title: 'Formulario de Entrega - Provincia',
  layout: 'default',
  middleware: 'auth'
})

// Route
const route = useRoute()
const consolidadoId = route.params.id as string
const { saveFormState, loadFormState, clearFormState } = useFormPersistence('provincia', consolidadoId)

// Estado del formulario
const currentStep = ref(1)
const loading = ref(false)
const showSuccessModal = ref(false)

// Watcher para depurar cuándo cambia el estado del modal
watch(showSuccessModal, (newValue, oldValue) => {
  console.log(`Modal cambió de ${oldValue} a ${newValue}`)
}, { immediate: true })

// Configuración de pasos
const steps = [
  { id: 1, title: 'Información básica' },
  { id: 2, title: 'Datos del cliente' },
  { id: 3, title: 'Información del envío' }
]

// Datos del formulario
const formData = reactive({
  // Paso 1
  importador: null,
  tipoComprobante: null,
  tiposProductos: '',

  // Paso 2
  clienteDni: '',
  clienteNombre: '',
  clienteCorreo: '',
  clienteRuc: '',
  clienteRazonSocial: '',

  // Paso 3
  tipoDestinatario: { label: 'Persona natural', value: 'PERSONA NATURAL' },
  destinatarioDni: '',
  destinatarioNombre: '',
  destinatarioCelular: '',
  destinatarioDepartamento: null,
  destinatarioProvincia: null,
  destinatarioDistrito: null,
  destinatarioRuc: '',
  destinatarioRazonSocial: '',
  agenciaEnvio: null,
  nombreAgencia: '',
  rucAgencia: '',
  direccionAgenciaLima: '',
  direccionAgenciaDestino: '',
  direccionDomicilio: '',
  envioADomicilio: false
})

// Opciones para selects
const importadores = ref<ClientesOptions[]>([])
const tiposComprobante = [
  { label: 'BOLETA', value: 'boleta' },
  { label: 'FACTURA', value: 'factura' }
]

const tiposDestinatario = [
  { label: 'Persona natural', value: 'PERSONA NATURAL' },
  { label: 'Empresa', value: 'EMPRESA' }
]

// Opciones para URadioGroup
const tiposDestinatarioItems = ref<RadioGroupItem[]>(
  tiposDestinatario.map(tipo => ({
    value: tipo.value,
    label: tipo.label
  }))
)

const envioADomicilioItems = ref<RadioGroupItem[]>([
  { value: 'false', label: 'No' },
  { value: 'true', label: 'Sí' }
])



// Validaciones por paso
const canProceedToNextStep = computed(() => {
  switch (currentStep.value) {
    case 1:
      return formData.importador?.value &&
        formData.tipoComprobante &&
        formData.tiposProductos
    case 2:
      if (formData.tipoComprobante?.value === 'boleta') {
        return formData.clienteDni && formData.clienteNombre && formData.clienteCorreo
      } else if (formData.tipoComprobante?.value === 'factura') {
        return formData.clienteRuc && formData.clienteRazonSocial && formData.clienteCorreo
      }
      return false
    case 3:
      const destinatarioValid = formData.tipoDestinatario?.value === 'PERSONA NATURAL'
        ? (formData.destinatarioDni && formData.destinatarioNombre && formData.destinatarioCelular)
        : (formData.destinatarioRuc && formData.destinatarioRazonSocial && formData.destinatarioCelular)

      return destinatarioValid &&
        formData.destinatarioDepartamento &&
        formData.destinatarioProvincia &&
        formData.destinatarioDistrito &&
     ((formData.agenciaEnvio && formData.agenciaEnvio?.value == 3) && 
       (formData.nombreAgencia && formData.rucAgencia && formData.direccionAgenciaLima)) ||((
        formData.agenciaEnvio && formData.agenciaEnvio.value != 3)) &&
        formData.direccionAgenciaDestino &&
        (!formData.envioADomicilio || formData.direccionDomicilio)
    default:
      return false
  }
})

// Navegación entre pasos
const nextStep = () => {
  if (currentStep.value < 3 && canProceedToNextStep.value) {
    currentStep.value++
    // Guardar estado después de cambiar de paso
    saveFormState(formData, currentStep.value)
  }
}

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
    // Guardar estado después de cambiar de paso
    saveFormState(formData, currentStep.value)
  }
}

// Función para navegar directamente a un paso específico
const goToStep = (stepNumber: number) => {
  if (canNavigateToStep(stepNumber)) {
    currentStep.value = stepNumber
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
    return formData.importador?.value &&
      formData.tipoComprobante &&
      formData.tiposProductos
  }
  
  // Para ir al paso 3, debe completar el paso 2
  if (stepNumber === 3) {
    const step1Valid = formData.importador?.value &&
      formData.tipoComprobante &&
      formData.tiposProductos
      
    const step2Valid = formData.tipoComprobante?.value === 'boleta'
      ? (formData.clienteDni && formData.clienteNombre && formData.clienteCorreo)
      : formData.tipoComprobante?.value === 'factura'
      ? (formData.clienteRuc && formData.clienteRazonSocial && formData.clienteCorreo)
      : false
      
    return step1Valid && step2Valid
  }
  
  return false
}

// Computed para el resumen de la reserva (para el modal)
const reservationSummary = computed(() => ({
  fecha: '', // Provincia no maneja fechas específicas como Lima
  hora: '', // Provincia no maneja horarios específicos como Lima
  persona: formData.destinatarioNombre || formData.destinatarioRazonSocial || '',
  dni: formData.destinatarioDni || formData.destinatarioRuc || '',
  agencia: formData.agenciaEnvio?.label || '',
  provincia: formData.destinatarioProvincia?.label || '',
  distrito: formData.destinatarioDistrito || '',
  tipoComprobante: formData.tipoComprobante?.label || '',
  importador: formData.importador?.label || ''
}))

// Funciones del modal
const handleNewReservation = () => {
  // Resetear formulario y volver al paso 1
  resetForm()
  currentStep.value = 1
  showSuccessModal.value = false
  // Limpiar estado guardado
  clearFormState()
  // Scroll hacia arriba
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handleGoToHome = () => {
  // Cerrar modal y navegar al home
  showSuccessModal.value = false
  // Limpiar estado guardado
  clearFormState()
  navigateTo('/')
}

// Manejo del formulario
const handleSubmit = () => {
  if (currentStep.value < 3) {
    nextStep()
  }
}

const finalizarFormulario = async () => {
  loading.value = true

  try {
    await withSpinner(async () => {
      try {
        const data = {
          ...formData,
          importador: formData.importador.value,
          tipoComprobante: formData.tipoComprobante.value,
          tipoDestinatario: formData.tipoDestinatario.value,
          destinatarioDepartamento: formData.destinatarioDepartamento.value,
          destinatarioProvincia: formData.destinatarioProvincia.value,
          destinatarioDistrito: formData.destinatarioDistrito.value,
          agenciaEnvio: formData.agenciaEnvio.value,
        }
        const response = await saveDeliveryProvincia(data)
        if (response.success) {
          // Mostrar modal de éxito en lugar de navegar directamente
          showSuccessModal.value = true
        
        } else {
          showError('Error al guardar', response.error || 'Error al guardar los datos')
        }
      } catch (error: any) {
        // Manejar errores de API correctamente
        const errorMessage = error?.response?.data?.message || 
                           error?.message || 
                           'Error al guardar los datos'
        showError('Error al guardar', errorMessage)
        console.error('Error en saveDeliveryProvincia:', error)
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
    importador: null,
    tipoComprobante: null,
    tiposProductos: '',
    clienteDni: '',
    clienteNombre: '',
    clienteCorreo: '',
    clienteRuc: '',
    clienteRazonSocial: '',
    tipoDestinatario: { label: 'Persona natural', value: 'PERSONA NATURAL' },
    destinatarioDni: '',
    destinatarioNombre: '',
    destinatarioCelular: '',
    destinatarioDepartamento: null,
    destinatarioProvincia: null,
    destinatarioDistrito: null,
    destinatarioRuc: '',
    destinatarioRazonSocial: '',
    agenciaEnvio: null,
    nombreAgencia: '',
    rucAgencia: '',
    direccionAgenciaLima: '',
    direccionAgenciaDestino: '',
    direccionDomicilio: '',
    envioADomicilio: false
  })
}

// Actualizar datos del consolidado
watch(() => formData.tipoComprobante, (newValue) => {
  if (newValue && newValue.value === 'boleta') {
    // Pre-llenar datos para boleta
    formData.clienteDni = userData.value?.dni || ''
    formData.clienteNombre = userData.value?.name || ''
  } else if (newValue && newValue.value === 'factura') {
    // Pre-llenar datos para factura
    formData.clienteRuc = userData.value?.empresa?.ruc || ''
    formData.clienteRazonSocial = userData.value?.empresa?.name || ''
  }
})

// Cargar datos iniciales
onMounted(async () => {
  await withSpinner(async () => {
  formData.clienteCorreo = userData.value?.email || ''


  // Cargar datos del servidor
  await getDeliveryByConsolidadoId(Number(consolidadoId))
  importadores.value = clientes.value
  
  // Cargar horarios disponibles
  await getHorariosDisponibles(Number(consolidadoId))
  
  Promise.all([
    await getDepartamentos(),
    await getProvincias('1'),
    await getDistritos('1'),
    await getDeliveryAgency()
  ])
  
  // Intentar cargar estado guardado
  const savedState = loadFormState()
  if (savedState) {
    console.log('Estado guardado encontrado:', savedState)
    // Restaurar datos del formulario
    Object.assign(formData, savedState.formData)
    // Restaurar paso actual
    currentStep.value = savedState.currentStep
  }
  }, 'Cargando datos...')
  if(formData.tipoComprobante.value === 'boleta'){
    formData.clienteDni = formData.clienteDni!=='' ? formData.clienteDni : userData.value?.dni || ''
    formData.clienteNombre = formData.clienteNombre!=='' ? formData.clienteNombre : userData.value?.name || ''
  }
  if(formData.tipoComprobante.value === 'factura'){
    formData.clienteRuc = formData.clienteRuc!=='' ? formData.clienteRuc : userData.value?.empresa?.ruc || ''
    formData.clienteRazonSocial = formData.clienteRazonSocial!=='' ? formData.clienteRazonSocial : userData.value?.empresa?.name || ''
  }
})
</script>

<style scoped>
/* Estilos adicionales si son necesarios */
.step-indicator {
  transition: all 0.3s ease;
}
</style>
