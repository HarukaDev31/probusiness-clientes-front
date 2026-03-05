<template>
  <div class="min-h-screen bg-[#F2F4F7] dark:bg-gray-950">
    <!-- Header con UAvatar y USeparator -->
    <header class="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <UContainer class="py-4">
        <div class="flex items-center gap-3 min-w-0">
          <UAvatar
            icon="i-heroicons-clipboard-document-check"
            size="md"
            class="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 shrink-0"
          />
          <div class="min-w-0">
            <h1 class="text-base font-semibold text-gray-500 dark:text-gray-400 sm:text-lg">
              Inspección de cotización
            </h1>
            <p v-if="data" class="mt-0.5 text-sm text-gray-700 dark:text-gray-300 truncate max-w-[280px] sm:max-w-md">
              {{ data.nombre }}
            </p>
          </div>
        </div>
      </UContainer>
    </header>

    <UContainer class="py-6 sm:py-8">
      <!-- Loading con USkeleton -->
      <UCard v-if="loading" class="overflow-hidden">
        <div class="p-6">
          <USkeleton class="mb-4 h-4 w-48" />
          <USeparator class="my-4" />
          <USkeleton class="mb-6 h-10 w-32 rounded-full" />
          <div class="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <USkeleton v-for="i in 3" :key="i" class="aspect-video w-full rounded-xl" />
          </div>
        </div>
      </UCard>

      <!-- Error con UAlert -->
      <UAlert
        v-else-if="error"
        icon="i-heroicons-exclamation-triangle"
        color="error"
        variant="subtle"
        title="No se pudo cargar la inspección"
        :description="`${error} Comprueba que el enlace sea correcto o que la cotización exista y esté confirmada.`"
        class="rounded-xl"
      />

      <template v-else-if="data">
        <!-- UCard principal + UTabs para proveedores -->
        <UCard v-if="providersWithFiles.length > 0">
          <template #header>
            <div class="space-y-4">
              <h2 class="text-sm font-bold uppercase tracking-wide text-gray-900 dark:text-white">
                Selecciona un proveedor
              </h2>
              <USeparator />
              <div class="overflow-x-auto scrollbar-hide -mx-1">
                <UTabs
                  v-model="activeProviderId"
                  :items="tabItems"
                  size="sm"
                  variant="pill"
                  class="min-w-max sm:min-w-0"
                />
              </div>
            </div>
          </template>

          <!-- Contenido por proveedor -->
          <div v-for="item in providersWithFiles" :key="item.provider.id">
            <div v-show="activeProviderId === item.provider.id">
              <!-- Empty state con UCard -->
              <UCard v-if="item.files.length === 0" class="bg-gray-50 dark:bg-gray-800/50">
                <div class="flex flex-col items-center justify-center py-14">
                  <UAvatar
                    icon="i-heroicons-photo"
                    size="2xl"
                    class="bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500"
                  />
                  <p class="mt-3 text-sm text-gray-600 dark:text-gray-400">
                    Sin archivos de inspección
                  </p>
                </div>
              </UCard>

              <!-- Galería: UCard por archivo, UBadge, ULink, UButtonGroup -->
              <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style="gap: 1em;">
                <UCard
                  v-for="file in item.files"
                  :key="file.id"
                  class="overflow-hidden p-0"
                >
                  <ULink
                    :to="fileUrl(file.file_url)"
                    target="_blank"
                    class="relative block aspect-video w-full overflow-hidden bg-gray-200 dark:bg-gray-700"
                  >
                    <img
                      v-if="isImage(file.file_ext)"
                      :src="fileUrl(file.file_url)"
                      :alt="file.file_name"
                      class="h-full w-full object-cover min-h-48 object-center text-center items-center justify-center"
                      loading="lazy"
                    />
                    <template v-else-if="isVideo(file.file_ext)">
                      <div class="h-full w-full bg-gray-300 dark:bg-gray-600 min-h-48 text-center" />
                      <div class="absolute inset-0 flex items-center justify-center">
                        <span class="flex h-14 w-14 items-center justify-center rounded-full bg-orange-500 text-white shadow-md">
                          <UIcon name="i-heroicons-play" class="h-7 w-7 ml-0.5" />
                        </span>
                      </div>
                    </template>
                    <div v-else class="flex h-full w-full items-center justify-center bg-gray-200 dark:bg-gray-700">
                      <UIcon name="i-heroicons-document" class="h-12 w-12 text-gray-400 dark:text-gray-500" />
                    </div>
                  </ULink>
                  <div class="flex items-start justify-between gap-2 p-4">
                    <div class="min-w-0 flex-1">
                      <UTooltip :text="file.file_name" :popper="{ placement: 'top' }">
                        <p class="truncate text-sm font-medium text-gray-900 dark:text-white">
                          {{ file.file_name }}
                        </p>
                      </UTooltip>
                      <UBadge
                        :label="fileTypeLabel(file.file_ext)"
                        size="xs"
                        color="neutral"
                        variant="soft"
                        class="mt-1"
                      />
                    </div>
                    <UButtonGroup v-if="!isVideo(file.file_ext)" size="xs" orientation="horizontal">
                      <UButton
                        :to="fileUrl(file.file_url)"
                        target="_blank"
                        color="neutral"
                        variant="ghost"
                        icon="i-heroicons-arrow-down-tray"
                        aria-label="Descargar"
                      />
                      <UButton
                        :to="fileUrl(file.file_url)"
                        target="_blank"
                        color="neutral"
                        variant="ghost"
                        icon="i-heroicons-arrow-top-right-on-square"
                        aria-label="Abrir"
                      />
                    </UButtonGroup>
                  </div>
                </UCard>
              </div>
            </div>
          </div>
        </UCard>

        <!-- Sin proveedores: UCard + UAvatar -->
        <UCard v-else-if="data.providers?.length === 0">
          <div class="flex flex-col items-center justify-center py-12 text-center">
            <UAvatar
              icon="i-heroicons-user-group"
              size="2xl"
              class="bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500"
            />
            <p class="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Esta cotización no tiene proveedores registrados.
            </p>
          </div>
        </UCard>
      </template>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import { getInspeccionByUuid } from '~/services/inspeccionPublicaService'
import type { InspeccionPublicaData, FileAlmacenInspectionItem, ProviderInspeccion } from '~/types/inspeccionPublica'

definePageMeta({
  layout: 'auth',
  // Sin middleware para acceso público por enlace
})

const route = useRoute()
const uuid = route.params.uuid as string

const config = useRuntimeConfig()
const apiBaseUrl = config.public.apiBaseUrl

const data = ref<InspeccionPublicaData | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

/** URL absoluta para archivos (file_url viene como ruta relativa tipo inspection/xxx.jpg) */
function fileUrl(path: string): string {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return `${apiBaseUrl}/storage/${path.replace(/^\//, '')}`
}

function isImage(ext: string): boolean {
  if (!ext) return false
  const e = (ext || '').toLowerCase().replace(/^\./, '')
  const extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp']
  if (extensions.includes(e)) return true
  return e.startsWith('image/')
}

function isVideo(ext: string): boolean {
  if (!ext) return false
  const e = (ext || '').toLowerCase().replace(/^\./, '')
  const extensions = ['mp4', 'webm', 'ogg', 'mov', 'avi']
  if (extensions.includes(e)) return true
  return e.startsWith('video/')
}

function fileTypeLabel(ext: string): string {
  if (isImage(ext)) return 'Imagen'
  if (isVideo(ext)) return 'Video'
  return 'Archivo'
}

/** Proveedores con sus archivos de inspección, para tabs */
interface ProviderWithFiles {
  provider: ProviderInspeccion
  files: FileAlmacenInspectionItem[]
}

const providersWithFiles = computed<ProviderWithFiles[]>(() => {
  const d = data.value
  if (!d?.providers?.length) return []

  return d.providers.map((provider) => ({
    provider,
    files: (d.files_almacen_inspection || []).filter((f) => f.id_proveedor === provider.id),
  }))
})

const activeProviderId = ref<number | null>(null)

/** Items para UTabs: label, value y badge con cantidad */
const tabItems = computed(() =>
  providersWithFiles.value.map((item) => ({
    label: item.provider.code_supplier,
    value: item.provider.id,
  }))
)

watch(providersWithFiles, (list) => {
  if (list.length > 0 && activeProviderId.value === null) {
    activeProviderId.value = list[0].provider.id
  }
}, { immediate: true })

onMounted(async () => {
  try {
    loading.value = true
    error.value = null
    const res = await getInspeccionByUuid(uuid)
    if (!res.success || !res.data) {
      error.value = res.message || 'Cotización no encontrada'
      return
    }
    data.value = res.data
  } catch (e: any) {
    error.value = e?.data?.message || e?.message || 'Error al cargar la inspección'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
