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
            Ahora necesitamos los datos para realizar tu comprobante.
          </p>
        </div>
        <div v-else-if="currentStep === 3">
          <p class="text-gray-600 dark:text-gray-300">
            Completa los datos de entrega. Si aún no tienes la información del chofer, puedes continuar sin ella.
          </p>
        </div>
        <div v-else-if="currentStep === 4">
          <p class="text-gray-600 dark:text-gray-300">
            Por favor selecciona la fecha y hora disponible, después culmina el formulario.
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
                {{ step.title }}
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

          <!-- Paso 1: Importación -->
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

            <div class="flex items-center justify-center gap-2 text-gray-900 dark:text-white">
              <UIcon name="i-heroicons-cube" class="h-6 w-6 text-primary-500 shrink-0" />
              <h2 class="text-xl font-semibold">
                Datos de la importación
              </h2>
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

          <!-- Paso 2: Guía de Remisión / Facturación -->
          <div v-if="currentStep === 2" class="space-y-8">
            <div class="flex items-center justify-center gap-3 text-gray-900 dark:text-white">
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-500/15 ring-1 ring-primary-500/30">
                <UIcon name="i-heroicons-document-text" class="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
              <h2 class="text-xl font-semibold">
                Datos de Guía y Facturación
              </h2>
            </div>

            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <button
                type="button"
                class="rounded-xl border-2 p-4 text-left transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                :class="formData.tipoComprobante?.value === 'factura'
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/40'
                  : 'border-gray-200 bg-white hover:border-primary-200 dark:border-gray-700 dark:bg-gray-950 dark:hover:border-primary-800'"
                @click="setTipoComprobanteGuia('factura')"
              >
                <div class="flex items-start gap-3">
                  <span
                    class="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2"
                    :class="formData.tipoComprobante?.value === 'factura' ? 'border-primary-500' : 'border-gray-300 dark:border-gray-600'"
                  >
                    <span v-if="formData.tipoComprobante?.value === 'factura'" class="h-2 w-2 rounded-full bg-primary-500" />
                  </span>
                  <div>
                    <p class="font-semibold text-gray-900 dark:text-white">Factura</p>
                    <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">RUC + Razón social</p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                class="rounded-xl border-2 p-4 text-left transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                :class="formData.tipoComprobante?.value === 'boleta'
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/40'
                  : 'border-gray-200 bg-white hover:border-primary-200 dark:border-gray-700 dark:bg-gray-950 dark:hover:border-primary-800'"
                @click="setTipoComprobanteGuia('boleta')"
              >
                <div class="flex items-start gap-3">
                  <span
                    class="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2"
                    :class="formData.tipoComprobante?.value === 'boleta' ? 'border-primary-500' : 'border-gray-300 dark:border-gray-600'"
                  >
                    <span v-if="formData.tipoComprobante?.value === 'boleta'" class="h-2 w-2 rounded-full bg-primary-500" />
                  </span>
                  <div>
                    <p class="font-semibold text-gray-900 dark:text-white">Boleta</p>
                    <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">DNI + Nombre completo</p>
                  </div>
                </div>
              </button>
            </div>

            <div
              v-if="formData.tipoComprobante?.value === 'factura'"
              class="overflow-hidden rounded-xl border-2 border-primary-500 bg-white dark:bg-gray-950"
            >
              <div class="bg-gray-100 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-amber-950/90 dark:bg-gray-800/90 dark:text-amber-100/90">
                Factura
              </div>
              <div class="space-y-4 p-4 md:p-6">
                <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <UFormField label="RUC" required>
                    <UInput v-model="formData.clienteRuc" placeholder="Ej: 20512345678" :disabled="loading" class="w-full" />
                  </UFormField>
                  <UFormField label="Razón social" required>
                    <UInput v-model="formData.clienteRazonSocial" placeholder="Razón social" :disabled="loading" class="w-full" />
                  </UFormField>
                </div>
                <div>
                  <p class="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Domicilio fiscal
                  </p>
                  <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <UFormField label="Distrito" required>
                      <UInput v-model="formData.facturacionDistrito" placeholder="Ej: San Isidro" :disabled="loading" class="w-full" />
                    </UFormField>
                    <UFormField label="Dirección" required>
                      <UInput v-model="formData.facturacionDireccionFiscal" placeholder="Av., número, referencia…" :disabled="loading" class="w-full" />
                    </UFormField>
                  </div>
                </div>
                <UFormField label="Correo electrónico" required>
                  <UInput v-model="formData.clienteCorreo" type="email" :disabled="loading" class="w-full" />
                </UFormField>
              </div>
            </div>

            <div
              v-else-if="formData.tipoComprobante?.value === 'boleta'"
              class="overflow-hidden rounded-xl border-2 border-primary-500 bg-white dark:bg-gray-950"
            >
              <div class="bg-gray-100 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-amber-950/90 dark:bg-gray-800/90 dark:text-amber-100/90">
                Boleta
              </div>
              <div class="space-y-4 p-4 md:p-6">
                <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <UFormField label="DNI o Carnet de extranjería" required>
                    <UInput v-model="formData.clienteDni" placeholder="Ej: 12345678" :disabled="loading" class="w-full" />
                  </UFormField>
                  <UFormField label="Nombre completo" required>
                    <UInput v-model="formData.clienteNombre" placeholder="Nombre y apellidos" :disabled="loading" class="w-full" />
                  </UFormField>
                </div>
                <UFormField label="Correo electrónico" required>
                  <UInput v-model="formData.clienteCorreo" type="email" :disabled="loading" class="w-full" />
                </UFormField>
              </div>
            </div>
          </div>

          <!-- Paso 3: Datos de entrega -->
          <div v-if="currentStep === 3" class="space-y-8">

            <!-- Persona que recoge -->
            <section class="space-y-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-950 md:p-6">
              <div class="flex items-center gap-2">
                <UIcon name="i-heroicons-user-circle" class="h-6 w-6 text-primary-500 shrink-0" />
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                  Persona que recoge la carga
                </h3>
              </div>

              <!-- Callout ubicación almacén -->
              <div class="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950/30">
                <div class="flex items-start gap-2">
                  <UIcon name="i-heroicons-map-pin" class="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div class="text-sm text-blue-900 dark:text-blue-100">
                    <p class="font-semibold">Almacén ProBusiness Lima</p>
                    <p class="mt-0.5 text-blue-700 dark:text-blue-300">
                      La persona deberá presentar su DNI al momento de recoger la carga.
                    </p>
                    <a
                      href="https://maps.app.goo.gl/5raLmkX65nNHB2Fr9"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="mt-1 inline-flex items-center gap-1 text-blue-600 underline hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-100"
                    >
                      <UIcon name="i-heroicons-arrow-top-right-on-square" class="h-3.5 w-3.5" />
                      Ver ubicación en Google Maps
                    </a>
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                <UFormField label="Nombre completo" required>
                  <UInput v-model="formData.nombreCompleto" placeholder="Nombre y apellidos" :disabled="loading" class="w-full" />
                </UFormField>
                <UFormField label="DNI / ID" required>
                  <UInput v-model="formData.dni" placeholder="Ej: 12345678" :disabled="loading" class="w-full" />
                </UFormField>
              </div>
              <UFormField label="Celular" required>
                <UInput v-model="formData.celularPersonaRecoge" placeholder="9XX XXX XXX" :disabled="loading" class="w-full" />
              </UFormField>
            </section>

            <!-- Datos del chofer -->
            <section class="space-y-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-950 md:p-6">
              <div class="flex items-center gap-2">
                <UIcon name="i-heroicons-truck" class="h-6 w-6 text-primary-500 shrink-0" />
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                  Datos del chofer
                  <span class="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">(opcional)</span>
                </h3>
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Si aún no cuenta con la información del chofer, puede continuar sin completar esta sección.
              </p>

              <UFormField label="Nombre completo del chofer (si es usted, coloque su nombre)">
                <UInput v-model="formData.choferNombre" placeholder="Nombre del chofer" :disabled="loading" class="w-full" />
              </UFormField>

              <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                <UFormField label="DNI / ID del chofer">
                  <UInput v-model="formData.choferDni" placeholder="Ej: 12345678" :disabled="loading" class="w-full" />
                </UFormField>
                <UFormField label="N° de licencia de conducir">
                  <UInput v-model="formData.choferLicencia" placeholder="Ej: Q12345678" :disabled="loading" class="w-full" />
                </UFormField>
              </div>

              <UFormField label="Placa del vehículo">
                <UInput v-model="formData.choferPlaca" placeholder="Ej: ABC-123" :disabled="loading" class="w-full" />
              </UFormField>
            </section>

            <!-- Dirección de destino -->
            <section class="space-y-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-950 md:p-6">
              <div class="flex items-center gap-2">
                <UIcon name="i-heroicons-home" class="h-6 w-6 text-primary-500 shrink-0" />
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                  Dirección final de destino
                </h3>
              </div>

              <UFormField label="Dirección completa (almacén, casa, etc.)">
                <UTextarea
                  v-model="formData.direccionDestino"
                  placeholder="Av. Los Héroes 123, distrito, Lima"
                  :rows="2"
                  :disabled="loading"
                  class="w-full"
                />
              </UFormField>

              <UFormField label="Distrito de destino">
                <USelectMenu
                  v-model="formData.distritoDestino"
                  :items="distritos"
                  placeholder="Selecciona el distrito"
                  :disabled="loading"
                  class="w-full"
                />
              </UFormField>
            </section>
          </div>

          <!-- Paso 4: Selección de fecha -->
          <div v-if="currentStep === 4" class="space-y-6 w-full">
            <div class="text-center mb-6">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
                Selección de fecha y horario
              </h2>
            </div>

            <div v-if="!loadingHorarios && horarios.length === 0" class="bg-yellow-50 dark:bg-yellow-800 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mb-6">
              <div class="flex items-start">
                <UIcon name="i-heroicons-information-circle" class="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                <div class="ml-3">
                  <p class="text-sm text-yellow-800 dark:text-yellow-100">
                    <strong>No hay horarios disponibles en este momento.</strong>
                    Puedes continuar y completar el formulario sin seleccionar una fecha.
                    Nos pondremos en contacto contigo para coordinar la entrega.
                  </p>
                </div>
              </div>
            </div>

            <div v-else-if="loadingHorarios" class="flex justify-center items-center py-8">
              <div class="text-center">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
                <p class="text-gray-600 dark:text-gray-300">Cargando horarios disponibles...</p>
              </div>
            </div>

            <AppointmentScheduler v-else :horarios="horarios" @date-selected="handleDateSelected" />
          </div>

          <!-- Navigation Buttons -->
          <div class="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <UButton v-if="currentStep > 1" @click="previousStep" variant="outline" icon="i-heroicons-arrow-left" :disabled="loading">
              Anterior
            </UButton>

            <div class="ml-auto">
              <UButton
                v-if="currentStep < 4"
                @click="nextStep"
                icon="i-heroicons-arrow-right"
                trailing
                :disabled="!canProceedToNextStep || loading"
                :loading="loading"
              >
                Continuar
              </UButton>

              <UButton
                v-if="currentStep === 4"
                @click="finalizarReserva"
                color="primary"
                size="lg"
                :disabled="!canProceedToNextStep || loading"
                :loading="loading"
              >
                Terminar formulario
              </UButton>
            </div>
          </div>
        </form>
      </UCard>
    </div>

    <!-- Modal de éxito -->
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
import { DeliveryService } from '~/services/clientes/delivery/deliveryService'
import type { UsuarioDatosFacturacionDto } from '~/types/clientes/delivery/usuarioDatosFacturacion'
import { useLocation } from '~/composables/commons/useLocation'
import { useSpinner } from '~/composables/commons/useSpinner'
import { useFormPersistence } from '~/composables/commons/useFormPersistence'
import { useRoute } from 'vue-router'
import { useUserRole } from '~/composables/auth/useUserRole'

const { showError } = useModal()
const {
  getDeliveryByConsolidadoId, clientes, carga,
  saveDeliveryLima, getHorariosDisponibles, horarios, loadingHorarios,
  getFormularioLimaByCotizacion
} = useDelivery()
const { distritos, getDistritos } = useLocation()
const { withSpinner } = useSpinner()
const { userData } = useUserRole()

definePageMeta({
  title: 'Formulario de Entrega - Lima',
  layout: 'default',
  middleware: 'auth'
})

const route = useRoute()
const consolidadoId = route.params.id as string
const { saveFormState, loadFormState, clearFormState } = useFormPersistence('lima', consolidadoId)

const currentStep = ref(1)
const loading = ref(false)
const showSuccessModal = ref(false)

const steps = [
  { id: 1, title: 'Importación' },
  { id: 2, title: 'Guía de Remisión' },
  { id: 3, title: 'Entrega' },
  { id: 4, title: 'Fecha' }
]

const formData = reactive({
  // Paso 1
  importador: { label: '', value: '' } as { label: string; value: string },
  tiposProductos: '',

  // Paso 2
  tipoComprobante: { label: 'BOLETA', value: 'boleta' } as { label: string; value: string },
  clienteDni: '',
  clienteNombre: '',
  clienteCorreo: '',
  clienteRuc: '',
  clienteRazonSocial: '',
  facturacionDistrito: '',
  facturacionDireccionFiscal: '',

  // Paso 3 — persona que recoge
  nombreCompleto: '',
  dni: '',
  celularPersonaRecoge: '',
  // Chofer (opcional)
  choferNombre: '',
  choferDni: '',
  choferLicencia: '',
  choferPlaca: '',
  // Dirección
  direccionDestino: '',
  distritoDestino: '' as any,

  // Paso 4
  fechaEntrega: null as Date | null,
  horarioSeleccionado: null as any
})

// ─── Comprobante card selector ────────────────────────────────────────────────
function setTipoComprobanteGuia (tipo: 'boleta' | 'factura') {
  formData.tipoComprobante = tipo === 'factura'
    ? { label: 'FACTURA', value: 'factura' }
    : { label: 'BOLETA', value: 'boleta' }
}

// ─── Pre-rellenar datos de facturación desde API ──────────────────────────────
function normalizeStr (v: unknown): string {
  if (v === null || v === undefined) return ''
  return String(v).trim()
}

function splitDomicilioFiscal (raw: string | null | undefined): { distrito: string; direccion: string } {
  if (!raw || !String(raw).trim()) return { distrito: '', direccion: '' }
  const s = String(raw).trim()
  const pipe = s.split('|').map(x => x.trim())
  if (pipe.length >= 2) return { distrito: pipe[0] || '', direccion: pipe.slice(1).join(' | ') }
  return { distrito: '', direccion: s }
}

function applyUsuarioDatosFacturacion (data: UsuarioDatosFacturacionDto) {
  const ruc = normalizeStr(data.ruc)
  const nombreCompleto = normalizeStr(data.nombre_completo)
  if (ruc) {
    formData.tipoComprobante = { label: 'FACTURA', value: 'factura' }
    formData.clienteRuc = ruc
    formData.clienteRazonSocial = normalizeStr(data.razon_social)
    const { distrito, direccion } = splitDomicilioFiscal(data.domicilio_fiscal)
    formData.facturacionDistrito = distrito
    formData.facturacionDireccionFiscal = direccion
  } else if (nombreCompleto) {
    formData.tipoComprobante = { label: 'BOLETA', value: 'boleta' }
    formData.clienteNombre = nombreCompleto
    formData.clienteDni = normalizeStr(data.dni)
  }
}

// ─── Mercancías ───────────────────────────────────────────────────────────────
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
    if (!uuid) { formData.tiposProductos = ''; return }
    const rows = clientes.value.find(c => c.value === uuid)?.mercancias ?? []
    const names = [...new Set(rows.map(r => r.producto).filter(Boolean))]
    formData.tiposProductos = names.length ? names.join(', ') : ''
  },
  { deep: true, immediate: true }
)

// ─── Validaciones por paso ────────────────────────────────────────────────────
function hasStep2Valid () {
  if (formData.tipoComprobante?.value === 'boleta') {
    return Boolean(formData.clienteDni?.trim() && formData.clienteNombre?.trim() && formData.clienteCorreo?.trim())
  }
  if (formData.tipoComprobante?.value === 'factura') {
    return Boolean(
      formData.clienteRuc?.trim() &&
      formData.clienteRazonSocial?.trim() &&
      formData.facturacionDistrito?.trim() &&
      formData.facturacionDireccionFiscal?.trim() &&
      formData.clienteCorreo?.trim()
    )
  }
  return false
}

const canProceedToNextStep = computed(() => {
  switch (currentStep.value) {
    case 1:
      return Boolean(formData.importador?.value)
    case 2:
      return hasStep2Valid()
    case 3:
      return Boolean(
        formData.nombreCompleto?.trim() &&
        formData.dni?.trim() &&
        formData.celularPersonaRecoge?.trim()
      )
    case 4:
      if (horarios.value.length === 0) return true
      return formData.fechaEntrega !== null && formData.horarioSeleccionado !== null
    default:
      return false
  }
})

const canNavigateToStep = (stepNumber: number) => {
  if (stepNumber === 1) return true
  if (stepNumber === 2) return Boolean(formData.importador?.value)
  if (stepNumber === 3) return Boolean(formData.importador?.value) && hasStep2Valid()
  if (stepNumber === 4) {
    return Boolean(formData.importador?.value) &&
      hasStep2Valid() &&
      Boolean(formData.nombreCompleto?.trim() && formData.dni?.trim() && formData.celularPersonaRecoge?.trim())
  }
  return false
}

// ─── Resumen para modal de éxito ──────────────────────────────────────────────
const reservationSummary = computed(() => {
  const formatTimeToAMPM = (t: string) => {
    if (!t) return ''
    const [h, m] = t.split(':')
    const h24 = parseInt(h, 10)
    const h12 = h24 === 0 ? 12 : h24 > 12 ? h24 - 12 : h24
    return `${h12}:${m} ${h24 >= 12 ? 'PM' : 'AM'}`
  }
  const formatDate = (date: Date | null | string) => {
    if (!date) return ''
    const d = typeof date === 'string' ? new Date(date) : date
    if (isNaN(d.getTime())) return String(date)
    const months = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']
    return `${d.getDate()} de ${months[d.getMonth()]} de ${d.getFullYear()}`
  }

  const distrito = formData.distritoDestino
  const distritoLabel = distrito && typeof distrito === 'object' ? (distrito.label ?? '') : String(distrito ?? '')

  return {
    fecha: formatDate(formData.fechaEntrega),
    hora: formData.horarioSeleccionado?.start_time && formData.horarioSeleccionado?.end_time
      ? `${formatTimeToAMPM(formData.horarioSeleccionado.start_time)} - ${formatTimeToAMPM(formData.horarioSeleccionado.end_time)}`
      : '',
    persona: formData.nombreCompleto || '',
    dni: formData.dni || '',
    distrito: distritoLabel,
    tipoComprobante: String(formData.tipoComprobante?.label ?? ''),
    importador: String(typeof formData.importador === 'object' ? formData.importador?.label : formData.importador ?? '')
  }
})

// ─── Navegación ───────────────────────────────────────────────────────────────
const nextStep = async () => {
  if (currentStep.value < 4 && canProceedToNextStep.value) {
    if (currentStep.value === 3) {
      try {
        await getHorariosDisponibles(Number(consolidadoId))
      } catch { /* continuar aunque haya error */ }
    }
    currentStep.value++
    showSuccessModal.value = false
    saveFormState(formData, currentStep.value)
  }
}

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
    showSuccessModal.value = false
    saveFormState(formData, currentStep.value)
  }
}

const goToStep = (stepNumber: number) => {
  if (canNavigateToStep(stepNumber)) {
    currentStep.value = stepNumber
    showSuccessModal.value = false
    saveFormState(formData, currentStep.value)
  }
}

const handleDateSelected = (date: Date | null, timeSlot: any) => {
  formData.fechaEntrega = date
  formData.horarioSeleccionado = timeSlot
  showSuccessModal.value = false
  saveFormState(formData, currentStep.value)
}

const handleSubmit = () => {
  if (currentStep.value < 4) nextStep()
}

// ─── Envío ────────────────────────────────────────────────────────────────────
const finalizarReserva = async () => {
  loading.value = true
  try {
    await withSpinner(async () => {
      try {
        let distritoDestinoValue = ''
        const d: any = formData.distritoDestino
        if (d) {
          distritoDestinoValue = typeof d === 'object' && 'value' in d ? String(d.value ?? '') : String(d)
        }

        const isFactura = formData.tipoComprobante?.value === 'factura'
        const data = {
          importador: formData.importador.value,
          tiposProductos: formData.tiposProductos,
          tipoComprobante: formData.tipoComprobante?.value ?? 'boleta',
          // Comprobante
          clienteDni: isFactura ? null : formData.clienteDni,
          clienteNombre: isFactura ? null : formData.clienteNombre,
          clienteRuc: isFactura ? formData.clienteRuc : null,
          clienteRazonSocial: isFactura ? formData.clienteRazonSocial : null,
          facturacionDistrito: isFactura ? formData.facturacionDistrito : null,
          facturacionDireccionFiscal: isFactura ? formData.facturacionDireccionFiscal : null,
          clienteCorreo: formData.clienteCorreo,
          // Persona que recoge
          nombreCompleto: formData.nombreCompleto,
          dni: formData.dni,
          celularPersonaRecoge: formData.celularPersonaRecoge,
          // Chofer
          choferNombre: formData.choferNombre,
          choferDni: formData.choferDni,
          choferLicencia: formData.choferLicencia,
          choferPlaca: formData.choferPlaca,
          // Destino
          direccionDestino: formData.direccionDestino,
          distritoDestino: distritoDestinoValue,
          // Horario
          fechaEntrega: formData.fechaEntrega || null,
          horarioSeleccionado: formData.horarioSeleccionado || null
        }

        const response = await saveDeliveryLima(data)
        if (response.success) {
          showSuccessModal.value = true
          clearFormState()
        } else {
          showError('Error al guardar', response.error || 'Error al guardar los datos')
        }
      } catch (error: any) {
        showError('Error al guardar', error?.response?.data?.message || error?.message || 'Error al guardar los datos')
      }
    }, 'Guardando datos de envío...')
  } catch (error: any) {
    showError('Error al procesar', error?.message || 'Error inesperado al procesar el formulario')
  } finally {
    loading.value = false
  }
}

// ─── Restaurar formulario guardado al cambiar importador ─────────────────────
const handleImportadorChange = async (newValue: any) => {
  if (!newValue?.value) return
  try {
    const formularioData = await getFormularioLimaByCotizacion(newValue.value)
    if (!formularioData?.success || !formularioData?.data?.formData) return

    const saved = formularioData.data.formData

    if (saved.nombreCompleto) formData.nombreCompleto = saved.nombreCompleto
    if (saved.dni) formData.dni = saved.dni
    if (saved.celularPersonaRecoge) formData.celularPersonaRecoge = saved.celularPersonaRecoge

    // Normalizar tipoComprobante a lowercase para el nuevo UI
    if (saved.tipoComprobante) {
      const val = (typeof saved.tipoComprobante === 'object' ? saved.tipoComprobante.value : saved.tipoComprobante) ?? ''
      const lower = String(val).toLowerCase()
      formData.tipoComprobante = lower === 'factura'
        ? { label: 'FACTURA', value: 'factura' }
        : { label: 'BOLETA', value: 'boleta' }
    }

    if (saved.clienteDni) formData.clienteDni = saved.clienteDni
    if (saved.clienteNombre) formData.clienteNombre = saved.clienteNombre
    if (saved.clienteCorreo) formData.clienteCorreo = saved.clienteCorreo
    if (saved.clienteRuc) formData.clienteRuc = saved.clienteRuc
    if (saved.clienteRazonSocial) formData.clienteRazonSocial = saved.clienteRazonSocial
    if (saved.facturacionDistrito) formData.facturacionDistrito = saved.facturacionDistrito
    if (saved.facturacionDireccionFiscal) formData.facturacionDireccionFiscal = saved.facturacionDireccionFiscal
    if (saved.choferNombre) formData.choferNombre = saved.choferNombre
    if (saved.choferDni) formData.choferDni = saved.choferDni
    if (saved.choferLicencia) formData.choferLicencia = saved.choferLicencia
    if (saved.choferPlaca) formData.choferPlaca = saved.choferPlaca
    if (saved.direccionDestino) formData.direccionDestino = saved.direccionDestino
    if (saved.distritoDestino) formData.distritoDestino = saved.distritoDestino

    formData.fechaEntrega = null
    formData.horarioSeleccionado = null

    if (formularioData.data.currentStep) {
      currentStep.value = formularioData.data.currentStep
      if (formularioData.data.currentStep === 4) {
        try { await getHorariosDisponibles(Number(consolidadoId)) } catch { /* continuar */ }
      }
    }

    saveFormState(formData, currentStep.value)
  } catch (error: any) {
    if (error?.response?.status !== 404) {
      console.error('Error al cargar formulario guardado:', error)
    }
  }
}

// ─── Reset ────────────────────────────────────────────────────────────────────
const resetForm = () => {
  currentStep.value = 1
  Object.assign(formData, {
    importador: { label: '', value: '' },
    tiposProductos: '',
    tipoComprobante: { label: 'BOLETA', value: 'boleta' },
    clienteDni: '',
    clienteNombre: '',
    clienteCorreo: '',
    clienteRuc: '',
    clienteRazonSocial: '',
    facturacionDistrito: '',
    facturacionDireccionFiscal: '',
    nombreCompleto: '',
    dni: '',
    celularPersonaRecoge: '',
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

const handleNewReservation = () => { resetForm(); navigateTo('/') }
const handleGoToHome = () => { navigateTo('/') }

// ─── Cargar horarios al llegar al paso 4 ─────────────────────────────────────
watch(() => currentStep.value, async (newStep) => {
  if (newStep === 4 && horarios.value.length === 0 && !loadingHorarios.value) {
    try { await getHorariosDisponibles(Number(consolidadoId)) } catch { /* continuar */ }
  }
})

// ─── Inicialización ───────────────────────────────────────────────────────────
onMounted(async () => {
  showSuccessModal.value = false

  await getDeliveryByConsolidadoId(Number(consolidadoId))

  // Pre-rellenar correo del usuario en sesión
  formData.clienteCorreo = userData.value?.email || ''

  // Restaurar borrador guardado localmente
  const savedState = loadFormState()
  if (savedState) {
    Object.assign(formData, savedState.formData)
    // Normalizar tipoComprobante si viene en uppercase del localStorage antiguo
    const tv = formData.tipoComprobante as any
    if (tv?.value && typeof tv.value === 'string') {
      const lower = tv.value.toLowerCase()
      if (lower === 'boleta' || lower === 'factura') {
        formData.tipoComprobante = lower === 'factura'
          ? { label: 'FACTURA', value: 'factura' }
          : { label: 'BOLETA', value: 'boleta' }
      }
    }
    currentStep.value = savedState.currentStep
    if (savedState.currentStep >= 4) {
      try { await getHorariosDisponibles(Number(consolidadoId)) } catch { /* continuar */ }
    }
  }

  // Pre-rellenar datos de facturación desde historial del usuario
  try {
    const res = await DeliveryService.getUsuarioDatosFacturacion('Lima')
    if (res.success && res.data) {
      const apiRuc = normalizeStr(res.data.ruc)
      if (apiRuc) {
        // RUC presente → siempre aplicar Factura (prioridad)
        applyUsuarioDatosFacturacion(res.data)
      } else if (!savedState) {
        applyUsuarioDatosFacturacion(res.data)
      }
    }
  } catch { /* ignorar — no es crítico */ }

  // Pre-rellenar datos de sesión para Boleta si aún están vacíos
  if (formData.tipoComprobante?.value === 'boleta') {
    if (!formData.clienteDni?.trim()) formData.clienteDni = userData.value?.dni || ''
    if (!formData.clienteNombre?.trim()) formData.clienteNombre = userData.value?.name || ''
  }
  if (!formData.clienteCorreo?.trim()) formData.clienteCorreo = userData.value?.email || ''

  // Datos persona que recoge desde sesión (si vacíos)
  if (!formData.nombreCompleto?.trim()) formData.nombreCompleto = userData.value?.name || ''
  if (!formData.dni?.trim()) formData.dni = userData.value?.dni || ''

  await getDistritos('1')
})
</script>

<style scoped>
.step-indicator {
  transition: all 0.3s ease;
}
</style>
