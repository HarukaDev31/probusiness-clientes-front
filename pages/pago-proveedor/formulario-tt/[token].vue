<template>
  <div class="min-h-screen bg-[#F2F4F7] px-4 py-5 text-gray-900">
    <div class="mx-auto max-w-[590px]">
      <div class="mb-4 flex items-center gap-2 text-lg font-bold">
        <span class="size-5 rounded-md bg-gradient-to-br from-orange-500 to-orange-400" />
        probusiness
      </div>

      <div v-if="cargando" class="space-y-3">
        <USkeleton class="h-8 w-72" />
        <USkeleton class="h-28 w-full rounded-xl" />
        <USkeleton class="h-96 w-full rounded-xl" />
      </div>

      <UAlert v-else-if="errorCarga" color="error" variant="subtle" icon="i-heroicons-exclamation-triangle" title="No se pudo abrir el formulario" :description="errorCarga" />

      <div v-else-if="mensajeFinal" class="rounded-xl border border-gray-200 bg-white p-8 text-center">
        <div class="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-green-100 text-2xl text-green-700">✓</div>
        <h1 class="mb-1.5 text-xl font-bold">{{ tituloFinal }}</h1>
        <!-- #2276: el código del proveedor en negrita y, si está registrado, su nombre entre paréntesis. -->
        <p v-if="finalConProveedor" class="text-sm leading-relaxed text-gray-500">
          Ya podemos preparar tu pago a <strong class="text-gray-800">{{ formulario?.proveedor }}</strong><template v-if="formulario?.nombre_proveedor"> ({{ formulario.nombre_proveedor }})</template>. {{ mensajeFinal }}
        </p>
        <p v-else class="text-sm leading-relaxed text-gray-500">{{ mensajeFinal }}</p>
      </div>

      <template v-else-if="formulario">
        <h1 class="mb-3 text-xl font-bold">{{ enRevision ? 'Revisa los datos bancarios de tu proveedor' : 'Datos bancarios de tu proveedor' }}</h1>

        <div class="mb-4 rounded-xl border border-l-4 border-gray-200 border-l-orange-500 bg-white px-4 py-3">
          <p class="text-[11px] font-bold uppercase tracking-wide text-gray-500">{{ enRevision ? 'Estás revisando los datos de' : 'Estás llenando los datos de' }}</p>
          <p class="mb-2 font-bold">{{ [formulario.proveedor, formulario.nombre_proveedor].filter(Boolean).join(' · ') }}</p>
          <div class="grid gap-2 text-xs sm:grid-cols-3">
            <div><span class="block text-gray-500">Código de proveedor</span><strong>{{ formulario.proveedor || '—' }}</strong></div>
            <div><span class="block text-gray-500">Producto</span><strong>{{ formulario.producto || '—' }}</strong></div>
            <div v-if="formulario.proforma_nombre">
              <span class="block text-gray-500">Proforma</span>
              <a v-if="formulario.proforma_url" :href="formulario.proforma_url" target="_blank" rel="noopener" class="break-all font-bold underline">{{ formulario.proforma_nombre }}</a>
              <strong v-else class="break-all">{{ formulario.proforma_nombre }}</strong>
            </div>
          </div>
        </div>

        <p class="mb-3 text-sm leading-relaxed text-gray-500">
          {{ enRevision
            ? 'Revisa estos datos y, si algo no es correcto, pulsa «Editar datos». Luego autoriza su uso para realizar el pago.'
            : 'Necesitamos estos datos para pagar a tu proveedor por transferencia internacional (T-T). Pídeselos a tu proveedor o cópialos de su proforma.' }}
        </p>

        <div v-if="enRevision" class="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm" :class="editando ? 'border-orange-200 bg-orange-50' : 'border-gray-200 bg-white'">
          <span>{{ editando ? 'Estás editando los datos. Cuando termines, autoriza y envía.' : 'Los datos están bloqueados para que no se cambien por error.' }}</span>
          <UButton size="xs" color="neutral" variant="outline" :icon="editando ? undefined : 'i-heroicons-pencil'" @click="alternarEdicion">{{ editando ? 'Descartar cambios' : 'Editar datos' }}</UButton>
        </div>

        <div class="mb-3 flex flex-wrap gap-2 text-xs text-gray-600">
          <span v-for="paso in ['1 Beneficiario', '2 Banco destino', '3 Banco intermediario (opcional)']" :key="paso" class="rounded-full border border-gray-200 bg-white px-2.5 py-1">{{ paso }}</span>
        </div>

        <form novalidate class="space-y-4" @submit.prevent="enviar">
          <section class="seccion">
            <div class="seccion-cabeza">
              <span class="seccion-numero">1</span>
              <div><h2>Datos del beneficiario (proveedor)</h2><p>Quien recibe el dinero</p></div>
            </div>
            <div v-for="campo in camposBeneficiario" :key="campo.clave" class="campo">
              <label :for="campo.clave">{{ campo.etiqueta }} <span class="text-red-500">*</span></label>
              <select v-if="campo.paises" :id="campo.clave" v-model="datos[campo.clave]" :disabled="bloqueado"><option value="">Selecciona</option><option v-for="pais in paisesDe(datos[campo.clave])" :key="pais" :value="pais">{{ pais }}</option></select>
              <input v-else :id="campo.clave" v-model="datos[campo.clave]" type="text" :disabled="bloqueado" :placeholder="campo.ejemplo" autocomplete="off">
              <p v-if="campo.ayuda" class="ayuda">{{ campo.ayuda }}</p>
              <p v-if="errores[campo.clave]" class="error">{{ errores[campo.clave] }}</p>
            </div>
          </section>

          <section class="seccion">
            <div class="seccion-cabeza">
              <span class="seccion-numero">2</span>
              <div><h2>Datos del banco de destino</h2><p>Banco donde tu proveedor tiene la cuenta</p></div>
            </div>
            <div v-for="campo in camposBanco('banco')" :key="campo.clave" class="campo">
              <label :for="campo.clave">{{ campo.etiqueta }} <span class="text-red-500">*</span></label>
              <select v-if="campo.tipos" :id="campo.clave" v-model="datos[campo.clave]" :disabled="bloqueado"><option value="">Selecciona</option><option v-for="tipo in tiposCodigo" :key="tipo.valor" :value="tipo.valor">{{ tipo.etiqueta }}</option></select>
              <select v-else-if="campo.paises" :id="campo.clave" v-model="datos[campo.clave]" :disabled="bloqueado"><option value="">Selecciona</option><option v-for="pais in paisesDe(datos[campo.clave])" :key="pais" :value="pais">{{ pais }}</option></select>
              <input v-else :id="campo.clave" v-model="datos[campo.clave]" type="text" :disabled="bloqueado" :placeholder="campo.ejemplo" autocomplete="off">
              <p v-if="errores[campo.clave]" class="error">{{ errores[campo.clave] }}</p>
            </div>
          </section>

          <section class="seccion">
            <div class="seccion-cabeza">
              <span class="seccion-numero">3</span>
              <div><h2>Datos del banco intermediario (opcional)</h2><p>Solo si tu proveedor lo indica: no todos lo usan</p></div>
            </div>
            <label class="casilla">
              <input v-model="datos.usa_intermediario" type="checkbox" :disabled="bloqueado">
              <span><strong>Mi proveedor indica un banco intermediario</strong><br><span class="ayuda">Márcalo solo si en los datos de tu proveedor aparece un banco intermediario o de correspondencia.</span></span>
            </label>
            <div v-if="datos.usa_intermediario" class="mt-3">
              <div v-for="campo in camposBanco('inter')" :key="campo.clave" class="campo">
                <label :for="campo.clave">{{ campo.etiqueta }} <span class="text-red-500">*</span></label>
                <select v-if="campo.tipos" :id="campo.clave" v-model="datos[campo.clave]" :disabled="bloqueado"><option value="">Selecciona</option><option v-for="tipo in tiposCodigo" :key="tipo.valor" :value="tipo.valor">{{ tipo.etiqueta }}</option></select>
                <select v-else-if="campo.paises" :id="campo.clave" v-model="datos[campo.clave]" :disabled="bloqueado"><option value="">Selecciona</option><option v-for="pais in paisesDe(datos[campo.clave])" :key="pais" :value="pais">{{ pais }}</option></select>
                <input v-else :id="campo.clave" v-model="datos[campo.clave]" type="text" :disabled="bloqueado" :placeholder="campo.ejemplo" autocomplete="off">
                <p v-if="errores[campo.clave]" class="error">{{ errores[campo.clave] }}</p>
              </div>
            </div>
          </section>

          <!-- #2353/#2354: abierto por el asesor («Abrir como cliente»): solo vista, la autorización es del cliente. -->
          <UAlert v-if="vistaAsesor" color="warning" variant="subtle" title="Vista del asesor" description="Solo el cliente puede autorizar y enviar estos datos desde el enlace que recibe por WhatsApp." />
          <section class="seccion">
            <label class="casilla" :class="vistaAsesor ? 'opacity-50' : ''">
              <input v-model="autorizo" type="checkbox" :disabled="vistaAsesor">
              <span>Autorizo que estos datos sean utilizados para realizar el pago al proveedor. <span class="ayuda">Revisa que sean correctos: un dato errado puede demorar o devolver el pago.</span></span>
            </label>
          </section>

          <UAlert v-if="errorEnvio" color="error" variant="subtle" :title="errorEnvio" />

          <button type="submit" class="w-full rounded-lg bg-orange-500 p-3 text-sm font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50" :disabled="vistaAsesor || !autorizo || enviando">
            {{ enviando ? 'Enviando…' : enRevision ? 'Autorizar y enviar datos' : 'Enviar datos' }}
          </button>
          <p v-if="!autorizo && !vistaAsesor" class="text-center text-xs text-gray-500">Marca la autorización para poder enviar los datos.</p>
        </form>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { enviarFormularioTt, obtenerFormularioTt } from '~/services/pagoProveedorTtService'
import type { DatosBancariosTt, FormularioTt } from '~/services/pagoProveedorTtService'

definePageMeta({
  layout: 'auth',
  // Sin middleware para acceso público por enlace
})

type ClaveTexto = Exclude<keyof DatosBancariosTt, 'usa_intermediario'>

interface Campo {
  clave: ClaveTexto
  etiqueta: string
  ejemplo?: string
  ayuda?: string
  paises?: boolean
  tipos?: boolean
}

const PAISES = ['China', 'Hong Kong', 'Taiwán', 'Singapur', 'Malasia', 'Tailandia', 'Vietnam', 'India', 'Japón', 'Corea del Sur', 'Indonesia', 'Filipinas', 'Emiratos Árabes Unidos', 'Turquía', 'Estados Unidos', 'Canadá', 'México', 'Panamá', 'Colombia', 'Chile', 'Brasil', 'Argentina', 'Perú', 'España', 'Alemania', 'Italia', 'Francia', 'Reino Unido', 'Países Bajos', 'Portugal', 'Otro país']
const tiposCodigo = [
  { valor: 'SWIFT', etiqueta: 'SWIFT', ejemplo: 'Ej.: BKCHCNBJ' },
  { valor: 'ABA', etiqueta: 'ABA / Routing', ejemplo: 'Ej.: 021000021' },
  { valor: 'CHIPS', etiqueta: 'CHIPS', ejemplo: 'Ej.: 0002' },
  { valor: 'Sort Code', etiqueta: 'Sort Code', ejemplo: 'Ej.: 20-00-00' },
  { valor: 'Otro', etiqueta: 'Otro', ejemplo: 'Código del banco' },
]
const camposBeneficiario: Campo[] = [
  { clave: 'beneficiario_nombre', etiqueta: 'Nombre del beneficiario', ejemplo: 'Tal como figura en la cuenta', ayuda: 'Razón social de tu proveedor.' },
  { clave: 'beneficiario_cuenta', etiqueta: 'Número de cuenta', ejemplo: 'Número de cuenta o IBAN' },
  { clave: 'beneficiario_direccion', etiqueta: 'Dirección del beneficiario' },
  { clave: 'beneficiario_pais', etiqueta: 'País', paises: true },
  { clave: 'beneficiario_ciudad', etiqueta: 'Ciudad' },
]

const route = useRoute()
const token = String(route.params.token)
// El asesor abre el formulario con ?vista=asesor: lo ve como el cliente, pero no puede autorizar ni enviar.
const vistaAsesor = computed(() => route.query.vista === 'asesor')
const cargando = ref(true)
const enviando = ref(false)
const editando = ref(false)
const autorizo = ref(false)
const errorCarga = ref('')
const errorEnvio = ref('')
const mensajeFinal = ref('')
const finalConProveedor = ref(false)
const tituloFinal = ref('')
const formulario = ref<FormularioTt | null>(null)
const errores = reactive<Partial<Record<ClaveTexto, string>>>({})
const datos = reactive<DatosBancariosTt>(datosVacios())

const enRevision = computed(() => formulario.value?.estado === 'por_autorizar' || !!formulario.value?.correccion_solicitada)
const bloqueado = computed(() => enRevision.value && !editando.value)

function datosVacios(): DatosBancariosTt {
  return {
    beneficiario_nombre: '', beneficiario_cuenta: '', beneficiario_direccion: '', beneficiario_pais: '', beneficiario_ciudad: '',
    banco_tipo_codigo: '', banco_codigo: '', banco_nombre: '', banco_direccion: '', banco_pais: '', banco_ciudad: '',
    usa_intermediario: false,
    inter_tipo_codigo: '', inter_codigo: '', inter_nombre: '', inter_direccion: '', inter_pais: '', inter_ciudad: '',
  }
}

function camposBanco(prefijo: 'banco' | 'inter'): Campo[] {
  const tipo = tiposCodigo.find(item => item.valor === datos[`${prefijo}_tipo_codigo`])

  return [
    { clave: `${prefijo}_tipo_codigo`, etiqueta: 'Tipo de código de banco', tipos: true },
    { clave: `${prefijo}_codigo`, etiqueta: 'Código de banco pagador', ejemplo: tipo?.ejemplo || 'Elige primero el tipo de código' },
    { clave: `${prefijo}_nombre`, etiqueta: 'Nombre del Banco', ejemplo: 'Ej.: Bank of China' },
    { clave: `${prefijo}_direccion`, etiqueta: 'Dirección de banco pagador' },
    { clave: `${prefijo}_pais`, etiqueta: 'País', paises: true },
    { clave: `${prefijo}_ciudad`, etiqueta: 'Ciudad' },
  ]
}

// Los datos que Ventas registró antes pueden traer un país fuera de la lista.
function paisesDe(valor: unknown) {
  return typeof valor === 'string' && valor && !PAISES.includes(valor) ? [valor, ...PAISES] : PAISES
}

function cargarDatos(origen: FormularioTt['datos']) {
  Object.assign(datos, datosVacios())
  for (const [clave, valor] of Object.entries(origen)) {
    if (clave === 'usa_intermediario') datos.usa_intermediario = !!valor
    else if (valor !== null && valor !== undefined) datos[clave as ClaveTexto] = String(valor)
  }
}

function alternarEdicion() {
  if (editando.value && formulario.value) cargarDatos(formulario.value.datos)
  editando.value = !editando.value
  limpiarErrores()
}

function limpiarErrores() {
  (Object.keys(errores) as ClaveTexto[]).forEach((clave) => { delete errores[clave] })
}

function validarCodigo(prefijo: 'banco' | 'inter') {
  const codigo = datos[`${prefijo}_codigo`].replace(/\s/g, '')
  const tipo = datos[`${prefijo}_tipo_codigo`]
  if (codigo && tipo === 'SWIFT' && !/^[A-Za-z]{6}[A-Za-z0-9]{2}([A-Za-z0-9]{3})?$/.test(codigo)) {
    errores[`${prefijo}_codigo`] = 'El código SWIFT tiene 8 u 11 caracteres (ej.: BKCHCNBJ).'
  }
  if (codigo && tipo === 'ABA' && !/^\d{9}$/.test(codigo)) {
    errores[`${prefijo}_codigo`] = 'El código ABA tiene 9 dígitos.'
  }
}

function validar() {
  limpiarErrores()
  const campos = [...camposBeneficiario, ...camposBanco('banco'), ...(datos.usa_intermediario ? camposBanco('inter') : [])]
  for (const campo of campos) {
    if (!datos[campo.clave].trim()) errores[campo.clave] = 'Obligatorio'
  }
  validarCodigo('banco')
  if (datos.usa_intermediario) validarCodigo('inter')
  const primero = campos.find(campo => errores[campo.clave])
  if (primero) document.getElementById(primero.clave)?.scrollIntoView({ block: 'center' })

  return !primero
}

async function enviar() {
  errorEnvio.value = ''
  if (vistaAsesor.value) return
  if (!validar()) return
  enviando.value = true
  try {
    const revision = enRevision.value
    const respuesta = await enviarFormularioTt(token, { ...datos, autorizo: autorizo.value })
    tituloFinal.value = revision ? '¡Gracias! Autorizaste los datos' : '¡Gracias! Recibimos los datos'
    finalConProveedor.value = !!formulario.value?.proveedor && !!respuesta?.data
    mensajeFinal.value = finalConProveedor.value
      ? 'Te avisaremos por WhatsApp cuando lo ejecutemos.'
      : (respuesta?.data ? 'Ya podemos preparar tu pago a tu proveedor. Te avisaremos por WhatsApp cuando lo ejecutemos.' : 'Recibimos tus datos.')
  } catch (error: any) {
    errorEnvio.value = error?.data?.message || 'No se pudo enviar el formulario. Intenta de nuevo.'
  } finally {
    enviando.value = false
  }
}

onMounted(async () => {
  try {
    const respuesta = await obtenerFormularioTt(token)
    formulario.value = respuesta.data
    cargarDatos(respuesta.data.datos)
    if (respuesta.data.bloqueado) {
      tituloFinal.value = 'Estos datos ya fueron autorizados'
      finalConProveedor.value = !!respuesta.data.proveedor
      mensajeFinal.value = finalConProveedor.value
        ? 'Si necesitas corregir algo, escríbele a tu asesor.'
        : 'Ya podemos preparar tu pago a tu proveedor. Si necesitas corregir algo, escríbele a tu asesor.'
    }
  } catch (error: any) {
    errorCarga.value = error?.data?.message || 'Comprueba que el enlace sea correcto.'
  } finally {
    cargando.value = false
  }
})
</script>

<style scoped>
.seccion {
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  background: #fff;
  padding: 1rem;
}
.seccion-cabeza {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 0.75rem;
}
.seccion-cabeza h2 {
  font-size: 0.9375rem;
  font-weight: 700;
}
.seccion-cabeza p,
.ayuda {
  font-size: 0.75rem;
  color: #6b7280;
}
.seccion-numero {
  display: flex;
  flex-shrink: 0;
  width: 1.625rem;
  height: 1.625rem;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background: #f97316;
  color: #fff;
  font-size: 0.8125rem;
  font-weight: 700;
}
.campo {
  margin-bottom: 0.75rem;
}
.campo label {
  display: block;
  margin-bottom: 0.25rem;
  font-size: 0.8125rem;
  font-weight: 600;
}
.campo input,
.campo select {
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  background: #fff;
  padding: 0.5rem 0.65rem;
  font-size: 0.875rem;
}
.campo input:disabled,
.campo select:disabled {
  background: #f3f4f6;
  color: #6b7280;
}
.error {
  margin-top: 0.2rem;
  font-size: 0.75rem;
  color: #dc2626;
}
.casilla {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  background: #f9fafb;
  padding: 0.65rem 0.75rem;
  font-size: 0.875rem;
}
.casilla input {
  margin-top: 0.2rem;
}
</style>
