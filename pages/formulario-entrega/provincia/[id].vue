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
                      <td class="px-4 py-3"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          <!-- Paso 2: Guía y facturación -->
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
                    <span
                      v-if="formData.tipoComprobante?.value === 'factura'"
                      class="h-2 w-2 rounded-full bg-primary-500"
                    />
                  </span>
                  <div>
                    <p class="font-semibold text-gray-900 dark:text-white">
                      Factura
                    </p>
                    <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      RUC + Razón social
                    </p>
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
                    <span
                      v-if="formData.tipoComprobante?.value === 'boleta'"
                      class="h-2 w-2 rounded-full bg-primary-500"
                    />
                  </span>
                  <div>
                    <p class="font-semibold text-gray-900 dark:text-white">
                      Boleta
                    </p>
                    <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      DNI + Nombre completo
                    </p>
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
              <div class="space-y-6 p-4 md:p-6">
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
              <div class="space-y-6 p-4 md:p-6">
                <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <UFormField label="DNI o Carnet extranjería" required>
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
                  @update:model-value="setTipoDestinatarioRadio"
                  :disabled="loading"
                  :ui="{ 
                    wrapper: 'flex gap-4 md:gap-8 justify-center',
                    container: 'flex gap-4 md:gap-8',
                    item: 'mx-1 md:mx-2'
                  }"
                />
              </div>
            </div>

            <hr class="border-gray-200 dark:border-gray-700">

            <!-- ——— Persona natural: card 1 como diseño; transporte + traslado igual que empresa ——— -->
            <template v-if="formData.tipoDestinatario?.value === 'PERSONA NATURAL'">
              <div
                class="rounded-lg border border-emerald-200 bg-emerald-50/90 p-4 text-sm leading-relaxed text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950/35 dark:text-emerald-50"
              >
                Tu carga está registrada a tu nombre. Si por fuerza mayor no puedes recogerla, puedes autorizar a otra
                persona colocando sus datos.
              </div>

              <!-- 1. Datos del destinatario -->
              <section class="space-y-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-950 md:p-6">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                  1. Datos del destinatario
                </h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  {{ formData.recojoYoMismo ? 'Persona que recogerá la carga' : 'Persona autorizada a recoger la carga' }}
                </p>
                <div
                  class="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-100"
                >
                  {{ titularLineaResumen }}
                </div>
                <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <button
                    type="button"
                    class="flex flex-col items-start gap-1 rounded-xl border-2 p-4 text-left transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                    :class="formData.recojoYoMismo
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/40'
                      : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-950'"
                    :disabled="loading"
                    @click="onElegirRecojoYoMismo"
                  >
                    <span class="font-semibold text-gray-900 dark:text-white">Recojo yo mismo</span>
                    <span class="text-xs text-gray-500 dark:text-gray-400">Yo retiro la carga en agencia</span>
                  </button>
                  <button
                    type="button"
                    class="flex flex-col items-start gap-1 rounded-xl border-2 p-4 text-left transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                    :class="!formData.recojoYoMismo
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/40'
                      : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-950'"
                    :disabled="loading"
                    @click="onElegirAutorizarOtraPersona"
                  >
                    <span class="font-semibold text-gray-900 dark:text-white">Autorizar a otra persona</span>
                    <span class="text-xs text-gray-500 dark:text-gray-400">Otra persona retira con su DNI</span>
                  </button>
                </div>
                <div v-if="!formData.recojoYoMismo" class="space-y-4">
                  <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div class="space-y-1">
                      <UFormField label="DNI / ID del autorizado" required>
                        <UInput
                          v-model="formData.destinatarioDni"
                          placeholder="Ej: 12345678"
                          :disabled="loading"
                          class="w-full"
                        />
                      </UFormField>
                      <p class="text-xs text-gray-500 dark:text-gray-400">
                        DNI: 8 dígitos — CE: hasta 12
                      </p>
                    </div>
                    <UFormField label="Nombre completo" required>
                      <UInput
                        v-model="formData.destinatarioNombre"
                        placeholder="Nombre y apellidos"
                        :disabled="loading"
                        class="w-full"
                      />
                    </UFormField>
                  </div>
                  <div class="space-y-1">
                    <UFormField label="Celular" required>
                      <UInput
                        v-model="formData.destinatarioCelular"
                        placeholder="9XX XXX XXX"
                        :disabled="loading"
                        class="w-full"
                      />
                    </UFormField>
                    <p class="text-xs text-gray-500 dark:text-gray-400">
                      Solo números, sin espacios
                    </p>
                  </div>
                  <div
                    class="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100"
                  >
                    Asegúrate de que la persona autorizada tenga su DNI o carnet al momento de recoger la carga.
                  </div>
                </div>
              </section>

              <!-- 2. Datos del transporte -->
              <section class="space-y-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-950 md:p-6">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                  Datos del transporte
                </h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  Agencia de envío autorizada por el cliente
                </p>
                <UFormField label="Escoge la agencia de envío" required>
                  <USelectMenu v-model="formData.agenciaEnvio" :items="agencies"
                    placeholder="Selecciona la agencia de envío" :disabled="loading" class="w-full" />
                </UFormField>
                <div
                  v-if="formData.agenciaEnvio"
                  class="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/40"
                >
                  <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                    Datos de la agencia
                  </p>
                  <p class="text-sm text-gray-900 dark:text-gray-100">
                    <span class="text-gray-500 dark:text-gray-400">Razón social:</span>
                    {{ formData.agenciaEnvio?.label || '—' }}
                  </p>
                  <p v-if="formData.agenciaEnvio?.value == 3 && formData.rucAgencia" class="mt-1 text-sm text-gray-900 dark:text-gray-100">
                    <span class="text-gray-500 dark:text-gray-400">RUC:</span>
                    {{ formData.rucAgencia }}
                  </p>
                </div>
                <div v-if="formData.agenciaEnvio?.value == 3" class="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <UFormField label="Nombre de la agencia:" required>
                    <UInput v-model="formData.nombreAgencia" placeholder="Ingrese nombre de la agencia" :disabled="loading"
                      class="w-full" />
                  </UFormField>
                  <UFormField label="RUC de la agencia:" required>
                    <UInput v-model="formData.rucAgencia" placeholder="Ingrese RUC de la agencia" :disabled="loading" class="w-full" />
                  </UFormField>
                  <UFormField class="md:col-span-2" label="Dirección de la agencia sede lima:" required>
                    <UInput v-model="formData.direccionAgenciaLima" placeholder="Ingrese dirección de la agencia en Lima"
                      :disabled="loading" class="w-full" />
                  </UFormField>
                </div>
              </section>

              <!-- 3. Datos del traslado -->
              <section class="space-y-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-950 md:p-6">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                  Datos del traslado
                </h3>
                <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Punto de llegada
                </p>
                <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <UFormField label="Departamento" required>
                    <USelectMenu v-model="formData.destinatarioDepartamento" class="w-full" :items="departamentos"
                      placeholder="Selecciona" :disabled="loadingDepartamentos"
                      @update:model-value="onDestinatarioDepartamentoChange" />
                  </UFormField>
                  <UFormField label="Provincia" required>
                    <USelectMenu v-model="formData.destinatarioProvincia" class="w-full" :items="provincias"
                      placeholder="Elige la provincia" :disabled="loadingProvincias"
                      @update:model-value="onDestinatarioProvinciaChange" />
                  </UFormField>
                  <UFormField label="Distrito" required>
                    <USelectMenu v-model="formData.destinatarioDistrito" class="w-full" :items="distritos"
                      placeholder="Primero elige provincia" :disabled="loadingDistritos"
                      @update:model-value="onDestinatarioDistritoChange" />
                  </UFormField>
                </div>
                <p class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Entrega en
                </p>
                <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <button
                    type="button"
                    class="flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                    :class="!formData.envioADomicilio
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/40'
                      : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-950'"
                    @click="formData.envioADomicilio = false"
                  >
                    <UIcon name="i-heroicons-building-storefront" class="mt-0.5 h-6 w-6 shrink-0 text-primary-600" />
                    <div>
                      <p class="font-semibold text-gray-900 dark:text-white">
                        Agencia
                      </p>
                      <p class="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                        Recojo en local
                      </p>
                    </div>
                  </button>
                  <button
                    type="button"
                    class="flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                    :class="formData.envioADomicilio
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/40'
                      : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-950'"
                    @click="formData.envioADomicilio = true"
                  >
                    <UIcon name="i-heroicons-truck" class="mt-0.5 h-6 w-6 shrink-0 text-primary-600" />
                    <div>
                      <p class="font-semibold text-gray-900 dark:text-white">
                        Domicilio
                      </p>
                      <p class="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                        Delivery a destino
                      </p>
                    </div>
                  </button>
                </div>
                <UFormField label="Dirección de la agencia en destino" required>
                  <UInput v-model="formData.direccionAgenciaDestino" placeholder="Ej. Av. Los Héroes 123, Arequipa"
                    :disabled="loading" class="w-full" />
                </UFormField>
                <div v-if="formData.envioADomicilio" class="space-y-2">
                  <UFormField label="Escriba su dirección exacta:" required>
                    <UTextarea v-model="formData.direccionDomicilio" placeholder="Dirección exacta para envío a domicilio"
                      :rows="2" :disabled="loading" class="w-full" />
                  </UFormField>
                </div>
              </section>
            </template>

            <!-- ——— Empresa: guía según diseño (mismos v-model / payload) ——— -->
            <template v-else-if="formData.tipoDestinatario?.value === 'EMPRESA'">
              <!-- 1. Datos del destinatario -->
              <section class="space-y-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-950 md:p-6">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                  Datos del destinatario
                </h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  Persona autorizada a recoger la carga en la agencia
                </p>
                <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div class="space-y-1">
                    <UFormField label="DNI / ID" required>
                      <UInput v-model="formData.destinatarioDni" placeholder="Ej. 12345678" :disabled="loading" class="w-full" />
                    </UFormField>
                    <p class="text-xs text-gray-500 dark:text-gray-400">
                      DNI: 8 dígitos — CE: hasta 12
                    </p>
                  </div>
                  <UFormField label="Nombre completo" required>
                    <UInput v-model="formData.destinatarioNombre" placeholder="Nombre y apellidos" :disabled="loading" class="w-full" />
                  </UFormField>
                </div>
                <div class="space-y-1">
                  <UFormField label="Celular" required>
                    <UInput v-model="formData.destinatarioCelular" placeholder="9XX XXX XXX" :disabled="loading" class="w-full" />
                  </UFormField>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    Solo números, sin espacios
                  </p>
                </div>
              </section>

              <!-- 2. Datos del transporte -->
              <section class="space-y-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-950 md:p-6">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                  Datos del transporte
                </h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  Agencia de envío autorizada por el cliente
                </p>
                <UFormField label="Escoge la agencia de envío" required>
                  <USelectMenu v-model="formData.agenciaEnvio" :items="agencies"
                    placeholder="Selecciona la agencia de envío" :disabled="loading" class="w-full" />
                </UFormField>
                <div
                  v-if="formData.agenciaEnvio"
                  class="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/40"
                >
                  <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                    Datos de la agencia
                  </p>
                  <p class="text-sm text-gray-900 dark:text-gray-100">
                    <span class="text-gray-500 dark:text-gray-400">Razón social:</span>
                    {{ formData.agenciaEnvio?.label || '—' }}
                  </p>
                  <p v-if="formData.agenciaEnvio?.value == 3 && formData.rucAgencia" class="mt-1 text-sm text-gray-900 dark:text-gray-100">
                    <span class="text-gray-500 dark:text-gray-400">RUC:</span>
                    {{ formData.rucAgencia }}
                  </p>
                </div>
                <div v-if="formData.agenciaEnvio?.value == 3" class="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <UFormField label="Nombre de la agencia:" required>
                    <UInput v-model="formData.nombreAgencia" placeholder="Ingrese nombre de la agencia" :disabled="loading"
                      class="w-full" />
                  </UFormField>
                  <UFormField label="RUC de la agencia:" required>
                    <UInput v-model="formData.rucAgencia" placeholder="Ingrese RUC de la agencia" :disabled="loading" class="w-full" />
                  </UFormField>
                  <UFormField class="md:col-span-2" label="Dirección de la agencia sede lima:" required>
                    <UInput v-model="formData.direccionAgenciaLima" placeholder="Ingrese dirección de la agencia en Lima"
                      :disabled="loading" class="w-full" />
                  </UFormField>
                </div>
              </section>

              <!-- 3. Datos del traslado -->
              <section class="space-y-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-950 md:p-6">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                  Datos del traslado
                </h3>
                <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Punto de llegada
                </p>
                <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <UFormField label="Departamento" required>
                    <USelectMenu v-model="formData.destinatarioDepartamento" class="w-full" :items="departamentos"
                      placeholder="Selecciona" :disabled="loadingDepartamentos"
                      @update:model-value="onDestinatarioDepartamentoChange" />
                  </UFormField>
                  <UFormField label="Provincia" required>
                    <USelectMenu v-model="formData.destinatarioProvincia" class="w-full" :items="provincias"
                      placeholder="Elige la provincia" :disabled="loadingProvincias"
                      @update:model-value="onDestinatarioProvinciaChange" />
                  </UFormField>
                  <UFormField label="Distrito" required>
                    <USelectMenu v-model="formData.destinatarioDistrito" class="w-full" :items="distritos"
                      placeholder="Primero elige provincia" :disabled="loadingDistritos"
                      @update:model-value="onDestinatarioDistritoChange" />
                  </UFormField>
                </div>
                <p class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Entrega en
                </p>
                <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <button
                    type="button"
                    class="flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                    :class="!formData.envioADomicilio
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/40'
                      : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-950'"
                    @click="formData.envioADomicilio = false"
                  >
                    <UIcon name="i-heroicons-building-storefront" class="mt-0.5 h-6 w-6 shrink-0 text-primary-600" />
                    <div>
                      <p class="font-semibold text-gray-900 dark:text-white">
                        Agencia
                      </p>
                      <p class="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                        Recojo en local
                      </p>
                    </div>
                  </button>
                  <button
                    type="button"
                    class="flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                    :class="formData.envioADomicilio
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/40'
                      : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-950'"
                    @click="formData.envioADomicilio = true"
                  >
                    <UIcon name="i-heroicons-truck" class="mt-0.5 h-6 w-6 shrink-0 text-primary-600" />
                    <div>
                      <p class="font-semibold text-gray-900 dark:text-white">
                        Domicilio
                      </p>
                      <p class="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                        Delivery a destino
                      </p>
                    </div>
                  </button>
                </div>
                <UFormField label="Dirección de la agencia en destino" required>
                  <UInput v-model="formData.direccionAgenciaDestino" placeholder="Ej. Av. Los Héroes 123, Arequipa"
                    :disabled="loading" class="w-full" />
                </UFormField>
                <div v-if="formData.envioADomicilio" class="space-y-2">
                  <UFormField label="Escriba su dirección exacta:" required>
                    <UTextarea v-model="formData.direccionDomicilio" placeholder="Dirección exacta para envío a domicilio"
                      :rows="2" :disabled="loading" class="w-full" />
                  </UFormField>
                </div>
              </section>
            </template>
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
      layout="entrega-provincia"
      :reservation-data="reservationSummary"
      @generate-new-reservation="handleNewReservation"
      @go-to-home="handleGoToHome"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch, nextTick } from 'vue'
import { useOptions } from '~/composables/commons/useOptions'
import { useDelivery } from '~/composables/clientes/delivery/useDelivery'
import type { ClientesOptions } from '~/types/clientes/delivery/common'
import type { UsuarioDatosFacturacionDto } from '~/types/clientes/delivery/usuarioDatosFacturacion'
import { DeliveryService } from '~/services/clientes/delivery/deliveryService'
import { useLocation } from '~/composables/commons/useLocation'
import { useSpinner } from '~/composables/commons/useSpinner'
import { useFormPersistence } from '~/composables/commons/useFormPersistence'
import SuccessReservationModal from '~/components/commons/SuccessModal.vue'
import type { RadioGroupItem } from '@nuxt/ui'
import type { EntregaProvinciaNotificacionInput } from '~/utils/clientes/delivery/notificacionEntregaProvincia'
// Composables
import {useModal} from '~/composables/commons/useModal'
import {useUserRole} from '~/composables/auth/useUserRole'
const { showSuccess, showError } = useModal()
const { paises, getPaises } = useOptions()
const { getDeliveryByConsolidadoId, clientes, carga, getDeliveryAgency, agencies, saveDeliveryProvincia } = useDelivery()
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

/** RUC / razón social empresa en destinatario: copia desde paso 2 (factura) si vienen vacíos */
function syncEmpresaDestinatarioDesdeCliente () {
  if (formData.tipoDestinatario?.value !== 'EMPRESA') return
  const cr = formData.clienteRuc?.trim()
  const crs = formData.clienteRazonSocial?.trim()
  if (cr && !formData.destinatarioRuc?.trim()) {
    formData.destinatarioRuc = cr
  }
  if (crs && !formData.destinatarioRazonSocial?.trim()) {
    formData.destinatarioRazonSocial = crs
  }
}

// Configuración de pasos
const steps = [
  { id: 1, title: 'Importación' },
  { id: 2, title: 'Guía de Remisión' },
  { id: 3, title: 'Envío' }
]

// Datos del formulario
const formData = reactive({
  // Paso 1
  importador: null,
  /** Sin selector en UI: siempre boleta para el flujo de provincia */
  tipoComprobante: { label: 'BOLETA', value: 'boleta' } as { label: string; value: string } | null,
  /** Se completa al elegir importador a partir de las mercancías de esa cotización */
  tiposProductos: '',

  // Paso 2
  clienteDni: '',
  clienteNombre: '',
  clienteCorreo: '',
  clienteRuc: '',
  clienteRazonSocial: '',
  /** Domicilio fiscal (factura): distrito y dirección en UI; en BD van en domicilio_fiscal como "distrito | dirección" */
  facturacionDistrito: '',
  facturacionDireccionFiscal: '',

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
  envioADomicilio: false,
  /** Persona natural paso 3: datos del destinatario = titular (paso 2 / sesión) o otra persona */
  recojoYoMismo: true
})

watch(
  () => [currentStep.value, formData.tipoDestinatario?.value] as const,
  () => {
    if (currentStep.value === 3) {
      syncEmpresaDestinatarioDesdeCliente()
    }
  }
)

watch(
  () =>
    [
      currentStep.value,
      formData.tipoDestinatario?.value,
      formData.recojoYoMismo,
      formData.clienteDni,
      formData.clienteNombre,
      userData.value?.phone,
      userData.value?.dni,
      userData.value?.name
    ] as const,
  () => {
    if (
      currentStep.value === 3 &&
      formData.tipoDestinatario?.value === 'PERSONA NATURAL' &&
      formData.recojoYoMismo
    ) {
      applyDestinatarioDesdeTitular()
    }
  }
)

// Opciones para selects
const importadores = ref<ClientesOptions[]>([])

const tiposDestinatario = [
  { label: 'Persona natural', value: 'PERSONA NATURAL' },
  { label: 'Empresa', value: 'EMPRESA' }
]

function setTipoDestinatarioRadio (value: unknown) {
  const v = typeof value === 'string' ? value : (value as { value?: string } | null)?.value
  const found = tiposDestinatario.find(t => t.value === v)
  if (found) {
    formData.tipoDestinatario = found
    if (found.value === 'PERSONA NATURAL') {
      formData.recojoYoMismo = true
      void nextTick(() => applyDestinatarioDesdeTitular())
    }
  }
}

function formatCelDisplay (s: string) {
  const d = String(s || '').replace(/\D/g, '')
  if (!d) return '—'
  return d.replace(/(\d{3})(?=\d)/g, '$1 ').trim()
}

/** Línea de referencia: titular de la carga (paso 2 + sesión), siempre visible en card 1 persona natural */
const titularLineaResumen = computed(() => {
  const nom = (formData.clienteNombre?.trim() || userData.value?.name || userData.value?.nombre || '').trim()
  const dni = (formData.clienteDni?.trim() || userData.value?.dni || '').trim()
  const celRaw = (userData.value?.phone || '').trim() || (formData.destinatarioCelular || '').trim()
  const cel = formatCelDisplay(celRaw)
  if (!nom && !dni) return 'Completa el paso 2 (boleta o factura) para mostrar al titular de la carga.'
  return `${nom} — DNI: ${dni || '—'} - Cel: ${cel}`
})

function applyDestinatarioDesdeTitular () {
  if (formData.tipoDestinatario?.value !== 'PERSONA NATURAL' || !formData.recojoYoMismo) return
  const dni = formData.clienteDni?.trim() || userData.value?.dni?.trim() || ''
  const nombre = formData.clienteNombre?.trim() || userData.value?.name?.trim() || userData.value?.nombre?.trim() || ''
  const cel = (userData.value?.phone || '').replace(/\s/g, '') || formData.destinatarioCelular?.trim() || ''
  formData.destinatarioDni = dni
  formData.destinatarioNombre = nombre
  if (cel) formData.destinatarioCelular = cel
}

function onElegirRecojoYoMismo () {
  formData.recojoYoMismo = true
  applyDestinatarioDesdeTitular()
}

function onElegirAutorizarOtraPersona () {
  formData.recojoYoMismo = false
  formData.destinatarioDni = ''
  formData.destinatarioNombre = ''
  formData.destinatarioCelular = ''
}

function setEnvioADomicilioRadio (value: unknown) {
  formData.envioADomicilio = String(value) === 'true'
}

function onDestinatarioDepartamentoChange () {
  const id = formData.destinatarioDepartamento?.value
  if (id != null && id !== '') getProvincias(String(id))
}

function onDestinatarioProvinciaChange () {
  const id = formData.destinatarioProvincia?.value
  if (id != null && id !== '') getDistritos(String(id))
}

function onDestinatarioDistritoChange () {
  const id = formData.destinatarioProvincia?.value
  if (id != null && id !== '') getDistritos(String(id))
}

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
      return Boolean(formData.importador?.value)
    case 2:
      if (formData.tipoComprobante?.value === 'boleta') {
        return Boolean(
          formData.clienteDni?.trim() &&
            formData.clienteNombre?.trim() &&
            formData.clienteCorreo?.trim()
        )
      }
      if (formData.tipoComprobante?.value === 'factura') {
        return Boolean(
          formData.clienteRuc?.trim() &&
            formData.clienteRazonSocial?.trim() &&
            formData.clienteCorreo?.trim() &&
            formData.facturacionDistrito?.trim() &&
            formData.facturacionDireccionFiscal?.trim()
        )
      }
      return false
    case 3: {
      /** Destinatario: DNI o RUC según flujo; el backend ignora "" y toma el segundo campo si aplica */
      const destinatarioValid =
        formData.tipoDestinatario?.value === 'EMPRESA'
          ? Boolean(
            (formData.destinatarioDni?.trim() || formData.destinatarioRuc?.trim()) &&
              (formData.destinatarioNombre?.trim() || formData.destinatarioRazonSocial?.trim()) &&
              formData.destinatarioCelular?.trim()
          )
          : Boolean(
            formData.destinatarioDni?.trim() &&
              formData.destinatarioNombre?.trim() &&
              formData.destinatarioCelular?.trim()
          )
      const ramaAgenciaPropio =
        Boolean(formData.agenciaEnvio && formData.agenciaEnvio?.value == 3) &&
        Boolean(
          formData.nombreAgencia &&
            formData.rucAgencia &&
            formData.direccionAgenciaLima
        )
      const ramaOtraAgencia =
        Boolean(formData.agenciaEnvio && formData.agenciaEnvio.value != 3) &&
        Boolean(formData.direccionAgenciaDestino) &&
        Boolean(!formData.envioADomicilio || formData.direccionDomicilio)
      const agenciaOk = ramaAgenciaPropio || ramaOtraAgencia
      return Boolean(
        destinatarioValid &&
          formData.destinatarioDepartamento &&
          formData.destinatarioProvincia &&
          formData.destinatarioDistrito &&
          agenciaOk
      )
    }
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
    return Boolean(formData.importador?.value)
  }
  
  // Para ir al paso 3, debe completar el paso 2
  if (stepNumber === 3) {
    const step1Valid = Boolean(formData.importador?.value)
      
    const step2Valid = formData.tipoComprobante?.value === 'boleta'
      ? Boolean(formData.clienteDni?.trim() && formData.clienteNombre?.trim() && formData.clienteCorreo?.trim())
      : formData.tipoComprobante?.value === 'factura'
        ? Boolean(
          formData.clienteRuc?.trim() &&
            formData.clienteRazonSocial?.trim() &&
            formData.clienteCorreo?.trim() &&
            formData.facturacionDistrito?.trim() &&
            formData.facturacionDireccionFiscal?.trim()
        )
        : false
      
    return step1Valid && step2Valid
  }
  
  return false
}

function buildEntregaProvinciaNotificacionInput (): EntregaProvinciaNotificacionInput {
  const dept = formData.destinatarioDepartamento as { label?: string } | null
  const prov = formData.destinatarioProvincia as { label?: string } | null
  const dist = formData.destinatarioDistrito as { label?: string } | null
  const partes = [dept?.label, prov?.label, dist?.label].filter(Boolean) as string[]
  const nombre = (formData.destinatarioNombre || formData.destinatarioRazonSocial || '').trim()
  const primerNombre = nombre.split(/\s+/)[0] || 'Cliente'
  const esAgenciaPropia = Number(formData.agenciaEnvio?.value) === 3
  const rucAg = (esAgenciaPropia ? (formData.rucAgencia || '').trim() : '') || '—'
  const documentoLabel = formData.tipoDestinatario?.value === 'EMPRESA' ? 'RUC' as const : 'DNI' as const
  return {
    primerNombre,
    consolidadoId: String(carga.value || consolidadoId),
    nombreCompleto: nombre,
    documentoLabel,
    dni: (formData.destinatarioDni || formData.destinatarioRuc || '').trim(),
    celular: (formData.destinatarioCelular || '').trim(),
    agenciaNombre: formData.agenciaEnvio?.label || '—',
    agenciaRuc: rucAg,
    destinoLine: partes.join(' — '),
    entregaEsDomicilio: !!formData.envioADomicilio,
    direccionDomicilio: (formData.direccionDomicilio || '').trim()
  }
}

// Computed para el resumen de la reserva (para el modal — mismos campos que el correo / WhatsApp)
const reservationSummary = computed(() => {
  const dist = formData.destinatarioDistrito as { label?: string } | null | undefined
  const distritoLabel = dist && typeof dist === 'object' ? (dist.label ?? '') : ''
  const n = buildEntregaProvinciaNotificacionInput()
  return {
    fecha: '',
    hora: '',
    persona: n.nombreCompleto,
    documentoLabel: n.documentoLabel || 'DNI',
    dni: n.dni,
    celular: n.celular,
    agencia: n.agenciaNombre,
    agenciaRuc: n.agenciaRuc,
    destinoLine: n.destinoLine,
    entregaEn: (n.entregaEsDomicilio ? 'Domicilio' : 'Agencia') as 'Agencia' | 'Domicilio',
    direccionDomicilio: n.entregaEsDomicilio ? n.direccionDomicilio : '',
    consolidadoNumero: n.consolidadoId,
    provincia: formData.destinatarioProvincia?.label || '',
    distrito: distritoLabel,
    tipoComprobante: formData.tipoComprobante?.label || '',
    importador: formData.importador?.label || ''
  }
})

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
  if (!formData.importador?.value) {
    showError('Formulario incompleto', 'Selecciona un importador.')
    return
  }
  if (!formData.tipoDestinatario?.value) {
    showError('Formulario incompleto', 'Indica el tipo de destinatario.')
    return
  }
  if (!formData.destinatarioDepartamento?.value || !formData.destinatarioProvincia?.value || !formData.destinatarioDistrito?.value) {
    showError('Formulario incompleto', 'Completa departamento, provincia y distrito.')
    return
  }
  if (!formData.agenciaEnvio?.value) {
    showError('Formulario incompleto', 'Selecciona una agencia de envío.')
    return
  }

  const destinatarioOk =
    formData.tipoDestinatario?.value === 'EMPRESA'
      ? Boolean(
        (formData.destinatarioDni?.trim() || formData.destinatarioRuc?.trim()) &&
          (formData.destinatarioNombre?.trim() || formData.destinatarioRazonSocial?.trim()) &&
          formData.destinatarioCelular?.trim()
      )
      : Boolean(
        formData.destinatarioDni?.trim() &&
          formData.destinatarioNombre?.trim() &&
          formData.destinatarioCelular?.trim()
      )
  if (!destinatarioOk) {
    showError('Formulario incompleto', 'Completa los datos del destinatario (documento, nombre y celular).')
    return
  }

  loading.value = true

  try {
    await withSpinner(async () => {
      try {
        const data = {
          ...formData,
          importador: formData.importador!.value,
          tipoComprobante: formData.tipoComprobante?.value ?? 'boleta',
          tipoDestinatario: formData.tipoDestinatario!.value,
          destinatarioDepartamento: formData.destinatarioDepartamento!.value,
          destinatarioProvincia: formData.destinatarioProvincia!.value,
          destinatarioDistrito: formData.destinatarioDistrito!.value,
          agenciaEnvio: formData.agenciaEnvio!.value
        }
        const response = await saveDeliveryProvincia(data)
        if (response.success) {
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
    tipoComprobante: { label: 'BOLETA', value: 'boleta' },
    tiposProductos: '',
    clienteDni: '',
    clienteNombre: '',
    clienteCorreo: '',
    clienteRuc: '',
    clienteRazonSocial: '',
    facturacionDistrito: '',
    facturacionDireccionFiscal: '',
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
    envioADomicilio: false,
    recojoYoMismo: true
  })
}

function normalizeStr (v: unknown): string {
  if (v === null || v === undefined) return ''
  return String(v).trim()
}

function splitDomicilioFiscal (raw: string | null | undefined): { distrito: string; direccion: string } {
  if (!raw || !String(raw).trim()) return { distrito: '', direccion: '' }
  const s = String(raw).trim()
  const pipe = s.split('|').map(x => x.trim())
  if (pipe.length >= 2) {
    return { distrito: pipe[0] || '', direccion: pipe.slice(1).join(' | ') }
  }
  const lines = s.split(/\r?\n/)
  if (lines.length >= 2) {
    return { distrito: lines[0] || '', direccion: lines.slice(1).join('\n') }
  }
  return { distrito: '', direccion: s }
}

/** Última fila usuario_datos_facturacion: prioridad RUC → factura; si no, nombre_completo → boleta */
function applyUsuarioDatosFacturacion (data: UsuarioDatosFacturacionDto) {
  const ruc = normalizeStr(data.ruc)
  const nombreCompleto = normalizeStr(data.nombre_completo)
  if (ruc) {
    formData.tipoComprobante = { label: 'FACTURA', value: 'factura' }
    formData.clienteRuc = ruc
    formData.clienteRazonSocial = normalizeStr(data.razon_social)
    const { distrito, direccion } = splitDomicilioFiscal(data.domicilio_fiscal ?? undefined)
    formData.facturacionDistrito = distrito
    formData.facturacionDireccionFiscal = direccion
  } else if (nombreCompleto) {
    formData.tipoComprobante = { label: 'BOLETA', value: 'boleta' }
    formData.clienteNombre = nombreCompleto
    formData.clienteDni = normalizeStr(data.dni)
  }
}

function setTipoComprobanteGuia (tipo: 'boleta' | 'factura') {
  formData.tipoComprobante = tipo === 'factura'
    ? { label: 'FACTURA', value: 'factura' }
    : { label: 'BOLETA', value: 'boleta' }
}

/** Paso 2: ya hay datos de comprobante rellenos (no pisar con API si el usuario restauró borrador) */
function hasStep2FacturacionCore (): boolean {
  if (formData.tipoComprobante?.value === 'factura') {
    return Boolean(formData.clienteRuc?.trim() && formData.clienteRazonSocial?.trim())
  }
  if (formData.tipoComprobante?.value === 'boleta') {
    return Boolean(formData.clienteDni?.trim() && formData.clienteNombre?.trim())
  }
  return false
}

// Cargar datos iniciales
onMounted(async () => {
  let restoredFromPersistence = false
  console.log('formData', formData)
  await withSpinner(async () => {
    formData.clienteCorreo = userData.value?.email || ''

    await getDeliveryByConsolidadoId(Number(consolidadoId))
    importadores.value = clientes.value

    await Promise.all([
      getDepartamentos(),
      getProvincias('1'),
      getDistritos('1'),
      getDeliveryAgency()
    ])

    const savedState = loadFormState()
    if (savedState) {
      console.log('Estado guardado encontrado:', savedState)
      Object.assign(formData, savedState.formData)
      if (!formData.tipoComprobante) {
        formData.tipoComprobante = { label: 'BOLETA', value: 'boleta' }
      }
      currentStep.value = savedState.currentStep
      restoredFromPersistence = true
    }

    // Siempre consultar últimos datos de facturación (JWT). Aplicar solo si no hay borrador con paso 2 ya cubierto.
    try {
      const res = await DeliveryService.getUsuarioDatosFacturacion('Provincia')
      if (res.success && res.data) {
        const apiRuc = normalizeStr(res.data.ruc)
        // Con RUC en API → siempre Factura (prioridad sobre borrador en boleta vacío)
        if (apiRuc) {
          applyUsuarioDatosFacturacion(res.data)
        } else if (!restoredFromPersistence || !hasStep2FacturacionCore()) {
          applyUsuarioDatosFacturacion(res.data)
        }
      }
    } catch (e) {
      console.warn('usuario-datos-facturacion:', e)
    }
  }, 'Cargando datos...')

  formData.clienteCorreo = formData.clienteCorreo?.trim() || userData.value?.email || ''

  if (formData.tipoComprobante?.value === 'boleta') {
    if (!formData.clienteDni?.trim()) formData.clienteDni = userData.value?.dni || ''
    if (!formData.clienteNombre?.trim()) formData.clienteNombre = userData.value?.name || ''
  }
  if (formData.tipoComprobante?.value === 'factura') {
    const empresa = userData.value?.empresa as { ruc?: string; name?: string } | undefined
    if (!formData.clienteRuc?.trim()) formData.clienteRuc = empresa?.ruc || ''
    if (!formData.clienteRazonSocial?.trim()) formData.clienteRazonSocial = empresa?.name || ''
  }
})
</script>

<style scoped>
/* Estilos adicionales si son necesarios */
.step-indicator {
  transition: all 0.3s ease;
}
</style>
