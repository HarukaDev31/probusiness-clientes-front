<template>

  <div class="min-h-auto bg-gray-50 dark:bg-gray-900 py-8">

    <div class="max-w-7xl mx-auto px-4">

      <div v-if="gateLoading" class="flex flex-col items-center justify-center gap-4 py-24">

        <div class="h-12 w-12 animate-spin rounded-full border-b-2 border-primary-500" />

        <p class="text-sm text-gray-600 dark:text-gray-300">Verificando datos...</p>

      </div>



      <FormularioComprobante

        v-else-if="requiresComprobanteFirst"

        :contenedor-id="contenedorIdNum"

        return-mode="entrega"

        :initial-destino-entrega="initialDestinoComprobante"

        embedded

        @completed="onComprobanteCompleted"

      />



      <template v-else>

        <div class="text-center mb-6">

          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">

            Formulario de entrega

          </h1>

          <p v-if="carga" class="text-gray-600 dark:text-gray-300">

            Consolidado #{{ carga }}

          </p>

        </div>



        <div class="max-w-4xl mx-auto mb-8 flex flex-wrap justify-center gap-3">

          <UButton

            v-for="item in tabItems"

            :key="item.value"

            type="button"

            size="lg"

            :variant="activeTab === item.value ? 'solid' : 'outline'"

            :color="activeTab === item.value ? 'primary' : 'neutral'"

            class="min-w-[9rem] transition-all duration-300 ease-out"

            :class="activeTab === item.value ? 'scale-[1.03] shadow-md' : 'hover:scale-[1.02]'"

            @click="selectTab(item.value as DestinoTab)"

          >

            <UIcon :name="item.icon" class="size-5 shrink-0" />

            <span class="font-semibold">{{ item.label }}</span>

          </UButton>

        </div>



        <Transition name="form-fade" mode="out-in">

          <p

            v-if="activeTab"

            :key="`desc-${activeTab}`"

            class="max-w-xl mx-auto -mt-4 mb-6 text-center text-sm text-gray-500 dark:text-gray-400"

          >

            {{ tabItems.find(t => t.value === activeTab)?.description }}

          </p>

        </Transition>



        <div class="relative overflow-x-hidden">

          <Transition :name="formTransitionName" mode="out-in">

            <div

              v-if="!activeTab"

              key="prompt-destino"

              class="max-w-2xl mx-auto rounded-xl border border-dashed border-primary-300 bg-primary-50/60 px-6 py-8 text-center dark:border-primary-700 dark:bg-primary-950/30"

            >

              <UIcon name="i-heroicons-map-pin" class="mx-auto mb-3 h-10 w-10 text-primary-500" />

              <p class="text-lg font-semibold text-gray-900 dark:text-white">

                ¿A dónde va dirigida su carga?

              </p>

              <p class="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">

                Elija una pestaña arriba:

                <strong class="text-gray-800 dark:text-gray-200">Lima</strong>

                si recogerá o entregará en la capital, o

                <strong class="text-gray-800 dark:text-gray-200">Provincia</strong>

                si el envío continúa hacia otra región del país.

              </p>

            </div>

            <div v-else-if="activeTab === 'lima'" key="form-lima" class="form-panel">

              <FormularioEntregaLima

                :consolidado-id="consolidadoId"

                embedded

              />

            </div>

            <div v-else-if="activeTab === 'provincia'" key="form-provincia" class="form-panel">

              <FormularioEntregaProvincia

                :consolidado-id="consolidadoId"

                embedded

              />

            </div>

          </Transition>

        </div>

      </template>

    </div>

  </div>

</template>



<script setup lang="ts">

import { ref, computed, watch } from 'vue'

import FormularioEntregaLima from '~/components/formulario-entrega/FormularioEntregaLima.vue'

import FormularioEntregaProvincia from '~/components/formulario-entrega/FormularioEntregaProvincia.vue'

import FormularioComprobante from '~/components/formulario-comprobante/FormularioComprobante.vue'

import { useDelivery } from '~/composables/clientes/delivery/useDelivery'



definePageMeta({

  title: 'Formulario de Entrega',

  layout: 'default',

  middleware: 'auth'

})



type DestinoTab = 'lima' | 'provincia'



const route = useRoute()

const router = useRouter()

const consolidadoId = computed(() => String(route.params.id ?? ''))

const contenedorIdNum = computed(() => Number(consolidadoId.value))



const {

  getDeliveryByConsolidadoId,

  ensureProvinciaCatalogs,

  ensureLimaFormReady,

  carga,

  checkHasDatosFacturacion,

  invalidateDatosFacturacionCache,

  limaFormBootstrapped

} = useDelivery()



const gateLoading = ref(true)

const requiresComprobanteFirst = ref(false)



const tabItems = [

  {

    label: 'Lima',

    value: 'lima',

    icon: 'i-heroicons-building-office-2',

    description: 'Recojo en almacén Lima o entrega en capital'

  },

  {

    label: 'Provincia',

    value: 'provincia',

    icon: 'i-heroicons-map',

    description: 'Envío a agencia o domicilio fuera de Lima'

  }

]



const activeTab = ref<DestinoTab | undefined>(undefined)

const formTransitionName = ref('form-fade')



const tabOrder: Record<DestinoTab, number> = { lima: 0, provincia: 1 }



const initialDestinoComprobante = computed((): 'Lima' | 'Provincia' | null => {

  const tab = parseDestinoFromQuery(route.query.destino ?? route.query.tab)

  if (tab === 'lima') return 'Lima'

  if (tab === 'provincia') return 'Provincia'

  return null

})



function setFormTransition (from: DestinoTab | undefined, to: DestinoTab | undefined) {

  if (!from || !to) {

    formTransitionName.value = 'form-fade'

    return

  }

  formTransitionName.value = tabOrder[to] > tabOrder[from] ? 'form-slide-forward' : 'form-slide-back'

}



function parseDestinoFromQuery (raw: unknown): DestinoTab | undefined {

  const d = String(raw ?? '').toLowerCase().trim()

  if (d === 'lima') return 'lima'

  if (d === 'provincia' || d === 'prov') return 'provincia'

  return undefined

}



function syncTabFromRoute () {

  activeTab.value = parseDestinoFromQuery(route.query.destino ?? route.query.tab)

}



watch(

  () => [route.query.destino, route.query.tab] as const,

  () => syncTabFromRoute(),

  { immediate: true }

)



function queryWithoutDestino () {

  const { destino: _d, tab: _t, ...rest } = route.query

  return rest

}



function selectTab (tab: DestinoTab) {

  if (activeTab.value === tab) {

    setFormTransition(activeTab.value, undefined)

    activeTab.value = undefined

    router.replace({ query: queryWithoutDestino() })

    return

  }

  setFormTransition(activeTab.value, tab)

  activeTab.value = tab

  router.replace({ query: { ...queryWithoutDestino(), destino: tab } })

}



async function loadConsolidadoBase () {

  const id = Number(consolidadoId.value)

  if (Number.isFinite(id) && id > 0) {

    await getDeliveryByConsolidadoId(id)

  }

}



async function evaluateBillingGate () {

  gateLoading.value = true

  try {

    const hasDatos = await checkHasDatosFacturacion()

    requiresComprobanteFirst.value = !hasDatos

  } finally {

    gateLoading.value = false

  }

}



async function onComprobanteCompleted (payload?: { destinoEntrega?: 'Lima' | 'Provincia' | null }) {

  invalidateDatosFacturacionCache()

  limaFormBootstrapped.value = false

  requiresComprobanteFirst.value = false



  const destinoFromForm = payload?.destinoEntrega

  let tab: DestinoTab | undefined = activeTab.value ?? destinoTabFromQuery()



  if (!tab && destinoFromForm === 'Lima') tab = 'lima'

  if (!tab && destinoFromForm === 'Provincia') tab = 'provincia'



  if (tab) {

    activeTab.value = tab

    router.replace({ query: { ...queryWithoutDestino(), destino: tab } })

    await preloadTabCatalogs(tab)

  } else {

    syncTabFromRoute()

  }

}



function destinoTabFromQuery (): DestinoTab | undefined {

  return parseDestinoFromQuery(route.query.destino ?? route.query.tab)

}



async function preloadTabCatalogs (tab: DestinoTab | undefined) {

  const id = Number(consolidadoId.value)

  if (!Number.isFinite(id) || id <= 0) return

  if (tab === 'lima') await ensureLimaFormReady(id)

  if (tab === 'provincia') await ensureProvinciaCatalogs(id)

}



watch(consolidadoId, () => {
  void loadConsolidadoBase()
  void evaluateBillingGate()
}, { immediate: true })



watch(activeTab, (tab) => {

  if (tab && !requiresComprobanteFirst.value) preloadTabCatalogs(tab)

}, { immediate: true })

</script>



<style scoped>

.form-panel {

  width: 100%;

}



.form-fade-enter-active,

.form-fade-leave-active,

.form-slide-forward-enter-active,

.form-slide-forward-leave-active,

.form-slide-back-enter-active,

.form-slide-back-leave-active {

  transition:

    opacity 0.32s cubic-bezier(0.4, 0, 0.2, 1),

    transform 0.38s cubic-bezier(0.4, 0, 0.2, 1);

}



.form-fade-enter-from,

.form-fade-leave-to {

  opacity: 0;

  transform: translateY(10px);

}



.form-slide-forward-enter-from {

  opacity: 0;

  transform: translateX(28px);

}



.form-slide-forward-leave-to {

  opacity: 0;

  transform: translateX(-28px);

}



.form-slide-back-enter-from {

  opacity: 0;

  transform: translateX(-28px);

}



.form-slide-back-leave-to {

  opacity: 0;

  transform: translateX(28px);

}



@media (prefers-reduced-motion: reduce) {

  .form-fade-enter-active,

  .form-fade-leave-active,

  .form-slide-forward-enter-active,

  .form-slide-forward-leave-active,

  .form-slide-back-enter-active,

  .form-slide-back-leave-active {

    transition-duration: 0.01ms;

  }



  .form-fade-enter-from,

  .form-fade-leave-to,

  .form-slide-forward-enter-from,

  .form-slide-forward-leave-to,

  .form-slide-back-enter-from,

  .form-slide-back-leave-to {

    transform: none;

  }

}

</style>


