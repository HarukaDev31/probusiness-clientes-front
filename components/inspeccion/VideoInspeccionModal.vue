<template>
  <UModal
    :default-open="true"
    :close="{ onClick: () => emit('close') }"
    :title="file?.file_name || 'Video de inspección'"
    :ui="{ body: 'bg-white dark:bg-gray-900' }"
  >
    <template #body>
      <div class="space-y-4">
        <div class="relative w-full aspect-video min-h-[240px] rounded-lg overflow-hidden bg-black">
          <video
            v-if="file"
            :key="file.id"
            ref="videoRef"
            :src="videoSrc"
            class="absolute inset-0 w-full h-full object-contain"
            controls
            preload="auto"
            playsinline
            @loadeddata="videoLoading = false"
            @canplay="videoLoading = false"
            @error="videoError = true; videoLoading = false"
          />
          <!-- Vista previa / cargando -->
          <div
            v-if="videoLoading && !videoError"
            class="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black text-white p-4"
          >
            <UIcon name="i-heroicons-arrow-path" class="w-10 h-10 text-primary-400 animate-spin" />
            <p class="text-sm text-gray-400">Cargando video...</p>
          </div>
          <div
            v-if="videoError"
            class="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black text-white p-4 text-center"
          >
            <UIcon name="i-heroicons-exclamation-triangle" class="w-12 h-12 text-amber-400" />
            <p class="text-sm">No se pudo cargar el video.</p>
            <UButton size="xs" color="primary" @click="openInNewTab">
              Abrir en nueva pestaña
            </UButton>
          </div>
        </div>
        <div class="flex justify-end gap-2 flex-wrap">
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-heroicons-arrow-uturn-left"
            size="xs"
            @click="rewindVideo"
          >
            Retroceder 10s
          </UButton>
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-heroicons-arrow-down-tray"
            size="xs"
            :disabled="!file || downloading"
            :loading="downloading"
            @click="file && downloadFile()"
          >
            Descargar
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { FileAlmacenInspectionItem } from '~/types/inspeccionPublica'

const props = defineProps<{
  file: FileAlmacenInspectionItem | null
}>()

const emit = defineEmits<{
  close: []
}>()

const videoRef = ref<HTMLVideoElement | null>(null)
const videoError = ref(false)
const videoLoading = ref(true)
const downloading = ref(false)

/** file_url ya viene como URL absoluta desde la API */
const videoSrc = computed(() => props.file?.file_url ?? '')

watch(() => props.file?.id, () => {
  videoLoading.value = true
  videoError.value = false
})

function rewindVideo() {
  const video = videoRef.value
  if (!video) return
  video.currentTime = Math.max(0, video.currentTime - 10)
}

function buildFileUrl() {
  return props.file?.file_url ?? ''
}

async function downloadFile() {
  const url = buildFileUrl()
  if (!url || !props.file) return
  const fileName = props.file.file_name || 'archivo'
  downloading.value = true
  try {
    const res = await fetch(url, { mode: 'cors' })
    if (!res.ok) throw new Error(res.statusText)
    const blob = await res.blob()
    const blobUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = blobUrl
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(blobUrl)
  } catch {
    // CORS o error: abrir en nueva pestaña para que el usuario pueda guardar desde ahí
    window.open(url, '_blank')
  } finally {
    downloading.value = false
  }
}

function openInNewTab() {
  const url = buildFileUrl()
  if (!url) return
  window.open(url, '_blank')
}

onBeforeUnmount(() => {
  const video = videoRef.value
  if (video) {
    video.pause()
    video.removeAttribute('src')
    video.load()
  }
})
</script>
