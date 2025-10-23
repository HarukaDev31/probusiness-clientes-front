<template>
  <UModal :model-value="true" @close="$emit('close')">
    <template #header>
      <h3 class="text-lg font-semibold text-primary-500">Crear tu Firma</h3>
    </template>
    <template #body>
      <div class="p-4">
        <div class="mb-4">
          <p class="text-gray-600 mb-4">Dibuja tu firma en el área de abajo:</p>
          
          <!-- Canvas para firmar -->
          <div class="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
            <canvas 
              ref="signatureCanvas"
              @mousedown="startDrawing"
              @mousemove="draw"
              @mouseup="stopDrawing"
              @mouseleave="stopDrawing"
              @touchstart="startDrawingTouch"
              @touchmove="drawTouch"
              @touchend="stopDrawing"
              class="w-full h-48 border border-gray-200 rounded cursor-crosshair bg-white"
              style="touch-action: none;"
            ></canvas>
          </div>
          
          <div class="flex justify-between items-center mt-4">
            <UButton 
              @click="clearSignature" 
              color="neutral" 
              variant="outline"
              :disabled="!hasSignature"
            >
              Limpiar
            </UButton>
            <p class="text-sm text-gray-500">
              {{ hasSignature ? 'Firma creada ✓' : 'Dibuja tu firma arriba' }}
            </p>
          </div>
        </div>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton @click="$emit('close')" color="neutral" variant="outline">
          Cancelar
        </UButton>
        <UButton 
          @click="confirmSignature" 
          color="primary"
          :disabled="!hasSignature"
        >
          Firmar
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'

interface Props {
  // Props del modal si es necesario
}

interface Emits {
  (e: 'close'): void
  (e: 'confirm', signatureData: string): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

// Refs
const signatureCanvas = ref<HTMLCanvasElement | null>(null)

// Estado
const hasSignature = ref(false)
const isDrawing = ref(false)
const lastX = ref(0)
const lastY = ref(0)

// Configurar canvas
onMounted(() => {
  nextTick(() => {
    setupCanvas()
  })
})

const setupCanvas = () => {
  if (!signatureCanvas.value) return
  
  const canvas = signatureCanvas.value
  const rect = canvas.getBoundingClientRect()
  canvas.width = rect.width
  canvas.height = rect.height
  
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }
}

// Eventos de dibujo
const startDrawing = (event: MouseEvent) => {
  if (!signatureCanvas.value) return
  
  event.preventDefault()
  event.stopPropagation()
  
  isDrawing.value = true
  const rect = signatureCanvas.value.getBoundingClientRect()
  lastX.value = event.clientX - rect.left
  lastY.value = event.clientY - rect.top
}

const draw = (event: MouseEvent) => {
  if (!isDrawing.value || !signatureCanvas.value) return
  
  event.preventDefault()
  event.stopPropagation()
  
  const ctx = signatureCanvas.value.getContext('2d')
  if (!ctx) return
  
  const rect = signatureCanvas.value.getBoundingClientRect()
  const currentX = event.clientX - rect.left
  const currentY = event.clientY - rect.top
  
  ctx.beginPath()
  ctx.moveTo(lastX.value, lastY.value)
  ctx.lineTo(currentX, currentY)
  ctx.stroke()
  
  lastX.value = currentX
  lastY.value = currentY
  
  hasSignature.value = true
}

// Eventos táctiles
const startDrawingTouch = (event: TouchEvent) => {
  if (!signatureCanvas.value) return
  
  event.preventDefault()
  event.stopPropagation()
  
  isDrawing.value = true
  const rect = signatureCanvas.value.getBoundingClientRect()
  const touch = event.touches[0]
  lastX.value = touch.clientX - rect.left
  lastY.value = touch.clientY - rect.top
}

const drawTouch = (event: TouchEvent) => {
  if (!isDrawing.value || !signatureCanvas.value) return
  
  event.preventDefault()
  event.stopPropagation()
  
  const ctx = signatureCanvas.value.getContext('2d')
  if (!ctx) return
  
  const rect = signatureCanvas.value.getBoundingClientRect()
  const touch = event.touches[0]
  const currentX = touch.clientX - rect.left
  const currentY = touch.clientY - rect.top
  
  ctx.beginPath()
  ctx.moveTo(lastX.value, lastY.value)
  ctx.lineTo(currentX, currentY)
  ctx.stroke()
  
  lastX.value = currentX
  lastY.value = currentY
  
  hasSignature.value = true
}

const stopDrawing = () => {
  isDrawing.value = false
}

// Funciones del modal
const clearSignature = () => {
  hasSignature.value = false
  if (signatureCanvas.value) {
    const ctx = signatureCanvas.value.getContext('2d')
    if (ctx) {
      ctx.clearRect(0, 0, signatureCanvas.value.width, signatureCanvas.value.height)
    }
  }
}

const confirmSignature = () => {
  if (!hasSignature.value || !signatureCanvas.value) return
  
  // Convertir canvas a imagen
  const signatureData = signatureCanvas.value.toDataURL('image/png')
  
  // Emitir evento con la firma
  emit('confirm', signatureData)
}

</script>
