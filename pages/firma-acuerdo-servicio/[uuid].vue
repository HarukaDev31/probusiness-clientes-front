<template>
  <div class="min-h-screen w-full bg-gray-50 flex flex-col">
    <!-- Header con controles -->
    <UCard class="m-4 shadow-lg" ref="headerCard">
      <template #header>
        <div class="text-center">
              <h1 class="text-2xl font-bold text-gray-900">
                {{ hasSignedContract ? 'Contrato de Servicio Firmado' : 'Firma de Acuerdo de Servicio' }}
              </h1>
              <p v-if="hasSignedContract" class="text-sm text-green-600 mt-2">
                ✅ Este contrato ya ha sido firmado
              </p>
          </div>
            
       
      </template>
      
       <!-- Información de páginas -->
       <template #footer>
         <div class="flex flex-col items-center py-2 space-y-1">
             <span class="text-sm text-gray-600 dark:text-gray-400">
             {{ totalPages }} páginas - Scroll para navegar
             </span>
             
         </div>
       </template>
    </UCard>

    <!-- Contenedor principal del PDF -->
    <div class="mx-4 mb-4 flex-grow flex justify-center">
      <UCard class="shadow-lg h-full w-full">
         <div class="relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden h-full flex justify-center items-stretch" ref="pdfContainer">
           <!-- Contenedor con scroll mejorado para todas las páginas -->
          <div 
            :class="[
              'pdf-scroll-container',
              'relative p-4 w-full h-full',
              { 
                'dragging': isDragging,
                'zoomed': currentScale > 1
              }
            ]"
             ref="scrollContainer"
             @touchstart="handleTouchStart"
             @touchmove="handleTouchMove"
             @touchend="handleTouchEnd"
            @pointerdown="handlePointerDown"
            @pointermove="handlePointerMove"
            @pointerup="handlePointerUp"
            @pointercancel="handlePointerUp"
           >
             <!-- Indicador de zoom para móvil (mostrar cuando está zooming o cuando visualScale != currentScale) -->
             <div 
               v-if="isMobile && (isZooming || Math.abs(visualScale - currentScale) > 0.01)" 
               class="absolute top-4 right-4 z-20 bg-black bg-opacity-75 text-white px-3 py-2 rounded-lg text-sm font-medium zoom-indicator"
             >
               {{ Math.round(visualScale * 100) }}%
             </div>
             
             <!-- Skeleton mientras se carga el PDF (overlay) -->
             <div v-if="!isPdfLoaded" class="absolute inset-0 z-10 bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center space-y-4">
               <!-- Indicador de progreso para mobile -->
               <div v-if="isMobile" class="w-full max-w-md bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
                 <div class="bg-blue-600 h-2 rounded-full animate-pulse" style="width: 60%"></div>
               </div>
               
               <div 
                 v-for="pageNum in (totalPages || 3)" 
                 :key="`skeleton-${pageNum}`"
                 class="bg-white dark:bg-gray-700 animate-pulse rounded-lg shadow-lg p-4 sm:p-8 w-full max-w-2xl aspect-[3/4] relative"
               >
                 <!-- Simular contenido de página -->
                 <div class="space-y-3 sm:space-y-4 h-full">
                   <!-- Título -->
                   <div class="h-4 sm:h-6 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
                   
                   <!-- Líneas de texto -->
                   <div class="space-y-2">
                     <div class="h-3 sm:h-4 bg-gray-200 dark:bg-gray-600 rounded w-full"></div>
                     <div class="h-3 sm:h-4 bg-gray-200 dark:bg-gray-600 rounded w-5/6"></div>
                     <div class="h-3 sm:h-4 bg-gray-200 dark:bg-gray-600 rounded w-4/5"></div>
                     <div class="h-3 sm:h-4 bg-gray-200 dark:bg-gray-600 rounded w-full"></div>
                     <div class="h-3 sm:h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
                   </div>
                   
                   <!-- Espacio -->
                   <div class="h-4 sm:h-8"></div>
                   
                   <!-- Más líneas -->
                   <div class="space-y-2">
                     <div class="h-3 sm:h-4 bg-gray-200 dark:bg-gray-600 rounded w-full"></div>
                     <div class="h-3 sm:h-4 bg-gray-200 dark:bg-gray-600 rounded w-5/6"></div>
                     <div class="h-3 sm:h-4 bg-gray-200 dark:bg-gray-600 rounded w-4/5"></div>
                     <div class="h-3 sm:h-4 bg-gray-200 dark:bg-gray-600 rounded w-full"></div>
                     <div class="h-3 sm:h-4 bg-gray-200 dark:bg-gray-600 rounded w-2/3"></div>
                   </div>
                   
                   <!-- Más contenido para llenar la página -->
                   <div class="space-y-2">
                     <div class="h-3 sm:h-4 bg-gray-200 dark:bg-gray-600 rounded w-4/5"></div>
                     <div class="h-3 sm:h-4 bg-gray-200 dark:bg-gray-600 rounded w-full"></div>
                     <div class="h-3 sm:h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
                   </div>
                   
                   <!-- Indicador de página -->
                   <div class="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 text-gray-400 dark:text-gray-500 text-xs sm:text-sm">
                     Página {{ pageNum }}
                   </div>
                 </div>
               </div>
             </div>
             
            <!-- PDF renderizado (siempre presente en el DOM) -->
             <div 
               class="pdf-content-wrapper"
               ref="pdfViewer"
               :style="{
                 width: isMobile && currentScale > 1 ? 'max-content' : 'auto',
                 minWidth: '100%'
               }"
             >
               <!-- Canvas para mostrar todas las páginas del PDF -->
               <div 
                v-for="pageNum in totalPages" 
                :key="pageNum"
                class="relative page-wrapper"
               >
                <div class="page-container">
                  <canvas 
                    :ref="(el) => setCanvasRef(el, pageNum)"
                    class="block bg-white shadow-lg rounded"
                  ></canvas>
                </div>
              
            </div>
          </div>
        </div>
        </div>
      </UCard>
    </div>

    <!-- Controles flotantes centrados -->
    <div class="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 flex gap-4">
      <!-- Controles de zoom (solo en desktop) -->
      <div  class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 flex items-center gap-2">
        <UButton 
          @click="zoomOut" 
          :disabled="currentScale <= minScale"
          color="neutral"
          variant="outline"
          size="sm"
          icon="i-heroicons-minus"
        >
        </UButton>
        <span class="text-sm text-gray-600 dark:text-gray-300 min-w-[50px] text-center">
          {{ Math.round(currentScale * 100) }}%
        </span>
        <UButton 
          @click="zoomIn" 
          :disabled="currentScale >= maxScale"
          color="neutral"
          variant="outline"
          size="sm"
          icon="i-heroicons-plus"
        >
        </UButton>
      </div>
      
      <!-- Controles de firma (solo si no está firmado) -->
      <div v-if="!hasSignedContract" class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 flex items-center gap-2">
        <UButton 
          @click="openSignatureModal" 
          color="primary"
          variant="solid"
          size="sm"
          icon="i-heroicons-pencil"
        >
          Firmar
        </UButton>
        <UButton 
          @click="downloadPDF" 
          color="info"
          variant="outline"
          size="sm"
          icon="i-heroicons-arrow-down-tray"
        >
        </UButton>
      </div>
      
      <!-- Controles solo para descarga (si está firmado) -->
      <div v-if="hasSignedContract" class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 flex items-center gap-2">
        <UButton 
          @click="downloadPDF" 
          color="info"
          variant="outline"
          size="sm"
          icon="i-heroicons-arrow-down-tray"
        >
          Descargar Contrato Firmado
        </UButton>
      </div>
    </div>

    <!-- Instrucciones flotantes cuando está en modo selección -->
    <Transition name="slide">
      <div 
        v-if="false"
        class="fixed top-20 right-4 z-50 bg-blue-500 dark:bg-blue-600 text-white p-4 rounded-lg shadow-lg max-w-sm"
      >
        <h3 class="font-semibold mb-2">📍 Seleccione la posición</h3>
        <p class="text-sm mb-3">
          Haga clic en el documento donde desea colocar su firma.
          Puede navegar entre páginas si es necesario.
        </p>
        <UButton 
          @click="() => {}" 
          color="primary" 
          variant="solid" 
          size="sm" 
          class="w-full"
        >
          Cancelar
        </UButton>
      </div>
    </Transition>


  </div>
</template>


<script setup lang="ts">
 import { ref, computed, onMounted, onUnmounted, nextTick, markRaw } from 'vue'
 import SignatureModal from '~/components/SignatureModal.vue'
 import { useSpinner } from '~/composables/commons/useSpinner'
 import { useModal } from '~/composables/commons/useModal'
import { useServiceContract } from '~/composables/useServiceContract'
const { showSuccess, showError } = useModal()

// Forzar tema claro siempre
const colorMode = useColorMode()
const previousTheme = ref(colorMode.preference)
 // Importación dinámica de pdf.js para evitar problemas de SSR
 let pdfjsLib = null
 
 // Composables
 const { showSpinner, hideSpinner, withSpinner } = useSpinner()
 const { 
   getServiceContract, 
   signServiceContract, 
   downloadContract, 
   contractUrl, 
   hasContract, 
   hasSignedContract,
   isLoading: contractLoading,
   isSigning 
 } = useServiceContract()

const { uuid } = useRoute().params

definePageMeta({
  layout: 'external',
})

// Referencias DOM
const pdfContainer = ref(null)
const headerCard = ref(null)
const scrollContainer = ref(null)
const pdfViewer = ref(null)
const pdfCanvases = ref({}) // Objeto para almacenar múltiples canvas

 // Estado del PDF
 const pdfDoc = ref(null)
 const totalPages = ref(0)
 const isRendering = ref(false)
 const isPdfLoaded = ref(false)
 const currentScale = ref(1.0)
const minScale = ref(0.5)
const isMobile = ref(false)

const maxScale = ref(isMobile.value ? 5.0 : 3.0)

 // Estado general
const pdfUrl = computed(() => contractUrl.value)

 // Detectar si es móvil

// Variables para zoom táctil
const touchStartDistance = ref(0)
const touchStartScale = ref(1)
const isZooming = ref(false)
const lastTouchTime = ref(0)
const renderTimeout = ref(null)
const isDragging = ref(false)
const lastPointer = ref({ x: 0, y: 0 })
const visualScale = ref(1.0) // Escala visual para preview inmediato
const renderQueue = ref(0) // Contador para controlar el renderizado final
const zoomCenter = ref<{ x: number; y: number; viewportX?: number; viewportY?: number }>({ x: 0, y: 0 }) // Punto central del zoom para preservar posición
const scrollAtZoomStart = ref({ x: 0, y: 0 }) // Posición del scroll al iniciar zoom
 
 // Estado de la firma (ya no se usa, se envía directamente)


// Función para establecer referencias de canvas
const setCanvasRef = (el, pageNum) => {
  if (el) {
    pdfCanvases.value[pageNum] = el
  }
}

// Paneo por arrastre con un dedo/cursor cuando hay zoom (solo desktop/mouse)
const handlePointerDown = (e) => {
  // Solo activar en desktop (no móvil) o cuando no es un evento touch
  if (!scrollContainer.value || isMobile.value || e.pointerType === 'touch') return
  
  // Solo activar si hay zoom y es con mouse
  if (currentScale.value > 1 && e.pointerType === 'mouse') {
    e.preventDefault()
    isDragging.value = true
    lastPointer.value = { x: e.clientX, y: e.clientY }
    scrollContainer.value.setPointerCapture?.(e.pointerId)
  }
}

const handlePointerMove = (e) => {
  // Solo procesar si es mouse en desktop y no hay touch activo
  if (!isDragging.value || !scrollContainer.value || isMobile.value || e.pointerType === 'touch') return
  
  const dx = e.clientX - lastPointer.value.x
  const dy = e.clientY - lastPointer.value.y
  lastPointer.value = { x: e.clientX, y: e.clientY }
  
  // Solo paneamos si hay zoom > 1 y es con mouse
  if (currentScale.value > 1 && e.pointerType === 'mouse') {
    scrollContainer.value.scrollLeft -= dx
    scrollContainer.value.scrollTop -= dy
  }
}

const handlePointerUp = (e) => {
  if (!scrollContainer.value || e.pointerType === 'touch') return
  isDragging.value = false
  scrollContainer.value.releasePointerCapture?.(e.pointerId)
}

// Funciones para zoom táctil
const getDistance = (touch1, touch2) => {
  const dx = touch1.clientX - touch2.clientX
  const dy = touch1.clientY - touch2.clientY
  return Math.sqrt(dx * dx + dy * dy)
}

// Función para actualizar tamaños visuales inmediatamente
const updateVisualSizes = () => {
  if (!scrollContainer.value) return
  
  // Calcular el factor de escala visual
  const transformScale = visualScale.value / currentScale.value
  
  // Actualizar todos los canvas y wrappers
  Object.keys(pdfCanvases.value).forEach((pageNum) => {
    const canvas = pdfCanvases.value[pageNum]
    if (!canvas) return
    
    // Obtener el wrapper de la página
    const wrapper = canvas.parentElement // .page-container
    const pageWrapper = wrapper?.parentElement // .page-wrapper
    
    if (wrapper && pageWrapper) {
      // Obtener el ancho y alto base del canvas (antes del transform)
      const baseWidth = parseFloat(canvas.style.width) || canvas.offsetWidth
      const baseHeight = parseFloat(canvas.style.height) || canvas.offsetHeight
      
      if (baseWidth > 0 && baseHeight > 0) {
        // Aplicar transform CSS para preview inmediato
        canvas.style.transform = transformScale !== 1.0 ? `scale(${transformScale})` : 'none'
        canvas.style.transformOrigin = 'top left'
        
        // Actualizar tamaños de wrappers (ancho y alto) para que el scroll funcione correctamente
        const newWidth = baseWidth * transformScale
        const newHeight = baseHeight * transformScale
        
        wrapper.style.width = `${newWidth}px`
        wrapper.style.minWidth = `${newWidth}px`
        wrapper.style.height = `${newHeight}px`
        wrapper.style.minHeight = `${newHeight}px`
        
      pageWrapper.style.width = `${newWidth}px`
      pageWrapper.style.minWidth = `${newWidth}px`
      pageWrapper.style.height = `${newHeight}px`
      pageWrapper.style.minHeight = `${newHeight}px`
      }
    }
  })
  
  // Forzar recálculo del scrollHeight del contenedor
  if (scrollContainer.value) {
    // Trigger reflow para que el navegador recalcule el scrollHeight
    void scrollContainer.value.offsetHeight
  }
  
  // Ajustar scroll para mantener el punto de zoom en la misma posición visual
  if (isZooming.value && zoomCenter.value && scrollAtZoomStart.value && 
      typeof zoomCenter.value.viewportX !== 'undefined') {
    const scaleRatio = visualScale.value / touchStartScale.value
    
    // El punto que estaba en contentX/Y ahora está en contentX/Y * scaleRatio
    // Para mantenerlo en la misma posición del viewport (viewportX/Y):
    // nuevo_scroll = punto_escalado - posición_viewport
    const newScrollX = zoomCenter.value.x * scaleRatio - zoomCenter.value.viewportX
    const newScrollY = zoomCenter.value.y * scaleRatio - zoomCenter.value.viewportY
    
    // Aplicar el scroll ajustado (usando requestAnimationFrame para suavidad)
    requestAnimationFrame(() => {
      if (scrollContainer.value) {
        const maxScrollX = Math.max(0, scrollContainer.value.scrollWidth - scrollContainer.value.clientWidth)
        const maxScrollY = Math.max(0, scrollContainer.value.scrollHeight - scrollContainer.value.clientHeight)
        
        scrollContainer.value.scrollLeft = Math.max(0, Math.min(newScrollX, maxScrollX))
        scrollContainer.value.scrollTop = Math.max(0, Math.min(newScrollY, maxScrollY))
      }
    })
  }
}

const handleTouchStart = (event) => {
  // Si hay un solo dedo, NO hacer nada - permitir scroll nativo
  if (event.touches.length === 1) {
    return // Salir inmediatamente, no bloquear el scroll
  }
  
  // Solo interceptar si hay exactamente 2 dedos para zoom
  if (event.touches.length === 2) {
    // Iniciar zoom con dos dedos
    event.preventDefault()
    event.stopPropagation()
    isZooming.value = true
    
    // Calcular punto central entre los dos dedos (posición en viewport)
    const touch1 = event.touches[0]
    const touch2 = event.touches[1]
    const centerX = (touch1.clientX + touch2.clientX) / 2
    const centerY = (touch1.clientY + touch2.clientY) / 2
    
    // Guardar información del zoom para preservar posición
    if (scrollContainer.value) {
      const rect = scrollContainer.value.getBoundingClientRect()
      
      // Posición del punto en el viewport del scroll container
      const viewportX = centerX - rect.left
      const viewportY = centerY - rect.top
      
      // Posición del punto relativo al contenido (incluyendo scroll actual)
      const contentX = scrollContainer.value.scrollLeft + viewportX
      const contentY = scrollContainer.value.scrollTop + viewportY
      
      // Guardar ambos valores para calcular después
      zoomCenter.value = {
        x: contentX, // Posición absoluta en el contenido
        y: contentY,
        viewportX: viewportX, // Posición en el viewport
        viewportY: viewportY
      }
      
      // Guardar posición actual del scroll
      scrollAtZoomStart.value = {
        x: scrollContainer.value.scrollLeft,
        y: scrollContainer.value.scrollTop
      }
    }
    
    touchStartDistance.value = getDistance(event.touches[0], event.touches[1])
    touchStartScale.value = currentScale.value
    visualScale.value = currentScale.value
    lastTouchTime.value = Date.now()
  }
}

// Función para renderizado final de alta calidad después del zoom
const scheduleFinalRender = () => {
  if (renderTimeout.value) {
    clearTimeout(renderTimeout.value)
  }
  renderTimeout.value = setTimeout(async () => {
    // Renderizar en alta calidad cuando termine el zoom
    renderQueue.value++
    const myQueue = renderQueue.value
    await renderAllPages(true)
    // Solo aplicar si todavía es el último renderizado solicitado
    if (myQueue === renderQueue.value) {
      // Sincronizar visualScale con currentScale para quitar el transform CSS
      visualScale.value = currentScale.value
      // Actualizar tamaños para aplicar el renderizado final (sin transform)
      updateVisualSizes()
      renderQueue.value = 0
    }
  }, 300) // Esperar 300ms después de que termine el zoom
}

const handleTouchMove = (event) => {
  // Si hay un solo dedo, NO hacer nada - permitir scroll nativo
  if (event.touches.length === 1) {
    return // Salir inmediatamente, no bloquear el scroll
  }
  
  // Solo procesar zoom con 2 dedos
  if (event.touches.length === 2 && isZooming.value) {
    event.preventDefault()
    event.stopPropagation()
    
    // Actualizar punto central del zoom (sigue a los dedos)
    const touch1 = event.touches[0]
    const touch2 = event.touches[1]
    const centerX = (touch1.clientX + touch2.clientX) / 2
    const centerY = (touch1.clientY + touch2.clientY) / 2
    
    // Actualizar posición del punto central
    if (scrollContainer.value) {
      const rect = scrollContainer.value.getBoundingClientRect()
      const viewportX = centerX - rect.left
      const viewportY = centerY - rect.top
      
      // Actualizar viewportX/Y pero mantener contentX/Y original para el cálculo correcto
      zoomCenter.value.viewportX = viewportX
      zoomCenter.value.viewportY = viewportY
    }
    
    const currentDistance = getDistance(event.touches[0], event.touches[1])
    const scaleChange = currentDistance / touchStartDistance.value
    const newScale = touchStartScale.value * scaleChange
    
    // Aplicar límites de zoom con rango extendido para móvil
    const mobileMaxScale = isMobile.value ? 5.0 : maxScale.value
    const clampedScale = Math.max(minScale.value, Math.min(mobileMaxScale, newScale))
    
    // Actualizar escala visual inmediatamente para preview
    if (Math.abs(clampedScale - visualScale.value) > 0.001) {
      visualScale.value = clampedScale
      // Actualizar también currentScale para que el indicador muestre el valor correcto
      currentScale.value = clampedScale
      
      // Actualizar tamaños visuales inmediatamente (preview en tiempo real)
      updateVisualSizes()
    }
  }
}

const handleTouchEnd = (event) => {
  if (event.touches.length < 2) {
    if (isZooming.value) {
      // Cuando termina el zoom, programar renderizado de alta calidad
      scheduleFinalRender()
    }
    isZooming.value = false
    touchStartDistance.value = 0
    touchStartScale.value = 1
    // Limpiar información del zoom
    zoomCenter.value = { x: 0, y: 0 }
    scrollAtZoomStart.value = { x: 0, y: 0 }
  }
}

// useOverlay para modales
const overlay = useOverlay()
const signatureModal = overlay.create(SignatureModal)

// Inicializar PDF.js
const initPdfJs = async () => {
   try {
     // Importar pdf.js dinámicamente
     const pdfjs = await import('pdfjs-dist')
     pdfjsLib = markRaw(pdfjs) // Usar markRaw para pdfjsLib también
     
     
     // Configurar worker - ajusta la ruta según tu configuración
     pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.min.mjs'
     
     console.log('🔧 Worker configurado:', pdfjsLib.GlobalWorkerOptions.workerSrc)
    
    // Alternativa si tienes el worker en node_modules:
    // pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
    
    return true
  } catch (err) {
    console.error('Error inicializando PDF.js:', err)
    throw new Error('No se pudo inicializar el visor de PDF')
  }
}

 // Cargar documento PDF
 const loadPDF = async () => {
   try {
     console.log('🔧 Iniciando carga del PDF...')
     
     // Resetear estado del PDF
     isPdfLoaded.value = false
     
     // Primero obtener el contrato desde la API (sin spinner global)
     await getServiceContract(uuid as string, false)
     
     // Verificar que tenemos la URL del contrato
     if (!hasContract.value) {
       throw new Error('No se pudo obtener el contrato de servicio')
     }
     
     console.log('🔧 Contrato obtenido:', {
       hasContract: hasContract.value,
       contractUrl: contractUrl.value,
       pdfUrl: pdfUrl.value
     })
     
     // Inicializar pdf.js si no está cargado
     if (!pdfjsLib) {
       console.log('🔧 Inicializando PDF.js...')
       await initPdfJs()
       console.log('✅ PDF.js inicializado')
     }
     
     console.log('🔧 pdfUrl:', pdfUrl.value)
     
     // Configuración para cargar el documento
     const loadingTask = pdfjsLib.getDocument({
       url: pdfUrl.value,
       withCredentials: false,
     })
     
     // Progreso de carga
     loadingTask.onProgress = (data) => {
       if (data.total > 0) {
         const percent = Math.round((data.loaded / data.total) * 100)
         console.log(`📥 Descargando documento... ${percent}%`)
         // No mostrar spinner aquí, el skeleton ya está visible
       }
     }
     
     // Esperar a que se cargue el documento
     console.log('🔧 Cargando documento PDF...')
     const pdf = await loadingTask.promise
     pdfDoc.value = markRaw(pdf) // Usar markRaw para evitar reactividad
     totalPages.value = pdf.numPages
     
     console.log('✅ PDF cargado:', {
       numPages: pdf.numPages,
       totalPages: totalPages.value
     })
     
     // Esperar a que el DOM esté listo
     await nextTick()
     
     // Renderizar todas las páginas con timeout para mobile
     const renderPromise = renderAllPages()
     const timeoutPromise = new Promise((_, reject) => {
       setTimeout(() => reject(new Error('Timeout al renderizar PDF')), 30000) // 30 segundos
     })
     
     await Promise.race([renderPromise, timeoutPromise])
     
     // Pequeño delay para asegurar que todo esté renderizado
     await new Promise(resolve => setTimeout(resolve, 100))
     
     // Marcar PDF como cargado para ocultar skeleton
     isPdfLoaded.value = true
     
   } catch (err) {
     console.error('❌ Error cargando PDF:', err)
     showError(
       'Error al cargar el documento',
       err.message || 'No se pudo cargar el documento PDF. Verifica el UUID o tu conexión.',
       {
         onConfirm: () => retryLoad()
       }
     )
   }
 }

 // Renderizar todas las páginas
 const renderAllPages = async (isFinalRender = false) => {
   if (!pdfDoc.value || (isRendering.value && !isFinalRender)) return
   
   isRendering.value = true
   
   try {
     console.log('🔧 Iniciando renderizado de todas las páginas...')
     console.log('🔧 Es móvil:', isMobile.value)
     console.log('🔧 Ancho de ventana:', window.innerWidth)
     
     // Esperar a que todos los canvas estén disponibles
     await nextTick()
     
     // Verificar que tenemos canvas disponibles
     console.log('🔧 Canvas disponibles:', Object.keys(pdfCanvases.value))
     
    // Calcular escala automática basada en la primera página
    const firstPage = await pdfDoc.value.getPage(1)
    const viewport = firstPage.getViewport({ scale: 1 })
    
    console.log('🔧 Viewport original:', {
      width: viewport.width,
      height: viewport.height
    })
    
    // En desktop, iniciar siempre a 100%. En móvil, ajustar al ancho disponible (mínimo 1.0)
    if (currentScale.value === 1.0 && visualScale.value === 1.0) {
      if (isMobile.value) {
        const containerWidth = (scrollContainer.value?.clientWidth ?? pdfContainer.value.clientWidth) - 32
        const scaleX = containerWidth / viewport.width
        currentScale.value = Math.max(1.0, scaleX)
        visualScale.value = currentScale.value
      } else {
        // Desktop siempre inicia a 100%
        currentScale.value = 1.0
        visualScale.value = 1.0
      }
      console.log('🔧 Escala inicial establecida:', currentScale.value, isMobile.value ? '(móvil)' : '(desktop 100%)')
    }
     
     // Renderizar todas las páginas
     for (let pageNum = 1; pageNum <= totalPages.value; pageNum++) {
       await renderPage(pageNum)
     }
     
     console.log('✅ Todas las páginas renderizadas exitosamente')
     
   } catch (err) {
     console.error('❌ Error renderizando páginas:', err)
     showError('Error al mostrar las páginas', 'No se pudo renderizar las páginas del PDF')
   } finally {
     isRendering.value = false
   }
 }

 // Renderizar una página específica
 const renderPage = async (pageNum) => {
   if (!pdfDoc.value) return
   
   try {
     console.log(`🔧 Renderizando página ${pageNum}...`)
     
     // Obtener la página
     const page = await pdfDoc.value.getPage(pageNum)
     const rawPage = markRaw(page)
     
     // Crear viewport escalado
     const scaledViewport = rawPage.getViewport({ scale: currentScale.value })
     console.log(`🔧 Viewport página ${pageNum}:`, {
       width: scaledViewport.width,
       height: scaledViewport.height,
       scale: currentScale.value
     })
     
     // Obtener el canvas correspondiente
     const canvas = pdfCanvases.value[pageNum]
     if (!canvas) {
       console.warn(`Canvas para página ${pageNum} no encontrado`)
       return
     }
     
     const context = canvas.getContext('2d')
     if (!context) {
       console.error(`No se pudo obtener contexto 2D para página ${pageNum}`)
       return
     }
     
    // Calcular dimensiones óptimas para el dispositivo
    const pixelRatio = window.devicePixelRatio || 1
   const containerWidth = (scrollContainer.value?.clientWidth ?? canvas.parentElement.clientWidth) - 32 // Restamos padding .p-4
    
    // Calcular escala base para el dispositivo
    const baseViewport = rawPage.getViewport({ scale: 1.0 })
    const containerScale = containerWidth / baseViewport.width
    
   // Renderizar a alta calidad sin incluir currentScale
   canvas.width = baseViewport.width * containerScale * pixelRatio
   canvas.height = baseViewport.height * containerScale * pixelRatio
   
   // Tamaño visual del canvas (usar currentScale para el tamaño base)
   const baseVisualWidth = baseViewport.width * containerScale * currentScale.value
   const baseVisualHeight = baseViewport.height * containerScale * currentScale.value
   
   // El tamaño visual real será ajustado por visualScale mediante CSS transform
   canvas.style.width = `${baseVisualWidth}px`
   canvas.style.height = `${baseVisualHeight}px`
   
   // Aplicar transform CSS para preview inmediato del zoom
   const transformScale = visualScale.value / currentScale.value
   canvas.style.transform = transformScale !== 1.0 ? `scale(${transformScale})` : 'none'
   canvas.style.transformOrigin = 'top left'
   
   // Asegurar que los wrappers crezcan al mismo tamaño para permitir scroll (ancho y alto)
   const wrapper = canvas.parentElement // .page-container
   if (wrapper) {
     const wrapperWidth = baseVisualWidth * transformScale
     const wrapperHeight = baseVisualHeight * transformScale
     wrapper.style.width = `${wrapperWidth}px`
     wrapper.style.minWidth = `${wrapperWidth}px`
     wrapper.style.height = `${wrapperHeight}px`
     wrapper.style.minHeight = `${wrapperHeight}px`
   }
   
   const pageWrapper = wrapper?.parentElement // .page-wrapper
   if (pageWrapper) {
     const pageWrapperWidth = baseVisualWidth * transformScale
     const pageWrapperHeight = baseVisualHeight * transformScale
     pageWrapper.style.width = `${pageWrapperWidth}px`
     pageWrapper.style.minWidth = `${pageWrapperWidth}px`
     pageWrapper.style.height = `${pageWrapperHeight}px`
     pageWrapper.style.minHeight = `${pageWrapperHeight}px`
   }
     
     // Limpiar el canvas antes de renderizar
     context.clearRect(0, 0, canvas.width, canvas.height)
     
    // Renderizar la página en el canvas con la misma escala del tamaño del canvas
    const renderContext = {
      canvasContext: context,
      viewport: rawPage.getViewport({ scale: containerScale * pixelRatio }),
      intent: 'display'
    }
     
     console.log(`🔧 Iniciando renderizado de página ${pageNum}...`)
     const renderTask = rawPage.render(renderContext)
     await renderTask.promise
     
     console.log(`✅ Página ${pageNum} renderizada exitosamente - Canvas: ${canvas.width}x${canvas.height}`)
     
   } catch (err) {
     if (err.name !== 'RenderingCancelledException') {
       console.error(`❌ Error renderizando página ${pageNum}:`, err)
     }
  }
}

 // Funciones de zoom
 const zoomIn = async () => {
   if (currentScale.value < maxScale.value) {
     currentScale.value = Math.min(maxScale.value, currentScale.value + 0.25)
     visualScale.value = currentScale.value
     await renderAllPages()
   }
 }
 
 const zoomOut = async () => {
   if (currentScale.value > minScale.value) {
     currentScale.value = Math.max(minScale.value, currentScale.value - 0.25)
     visualScale.value = currentScale.value
     await renderAllPages()
   }
 }
 
 // Reintentar carga
 const retryLoad = () => {
   loadPDF()
 }

// Manejar clic para posicionar firma (ya no se usa, pero se mantiene por compatibilidad)
const handlePositionClick = (event, pageNum) => {
  // Esta función ya no se usa, la firma se posiciona automáticamente
  console.log('Click en página', pageNum, '- La firma se posiciona automáticamente')
}

// Abrir modal de firma y enviar directamente al backend
const openSignatureModal = () => {
  signatureModal.open({
    onClose: () => {
      signatureModal.close()
    },
    onConfirm: async (signatureData) => {
      signatureModal.close()
      
      // Enviar firma directamente al backend
      try {
        const response = await signServiceContract(uuid as string, signatureData as unknown as string)
        if (response.success) {
          showSuccess('Firma guardada', 'La firma se ha guardado correctamente')
          await loadPDF()
          redirectToWhatsApp('+51992583703')
        } else {
          showError('Error al guardar', 'No se pudo guardar la firma. Inténtalo de nuevo.')
        }
      } catch (err) {
        showError('Error al guardar', 'No se pudo guardar la firma. Inténtalo de nuevo.')
      }
    }
  })
}



 // Función para redirigir a WhatsApp
 const redirectToWhatsApp = (phoneNumber: string = '+51992583703') => {
   try {
     // Limpiar el número de teléfono (remover espacios, guiones, etc.)
     const cleanNumber = phoneNumber.replace(/[\s\-\(\)]/g, '')
     
     // Crear mensaje personalizado para el contexto de firma
     const message = encodeURIComponent(
       '¡Hola! He firmado exitosamente el acuerdo de servicio. ¿Podrían confirmar la recepción del documento firmado?'
     )
     
     // Crear URL de WhatsApp
     const whatsappUrl = `https://wa.me/${cleanNumber}?text=${message}`
     
     console.log('🔧 Redirigiendo a WhatsApp:', whatsappUrl)
     
     // Abrir WhatsApp en nueva ventana
     window.open(whatsappUrl, '_blank')
     
   } catch (error) {
     console.error('❌ Error redirigiendo a WhatsApp:', error)
     showError('Error de redirección', 'No se pudo abrir WhatsApp. Inténtalo manualmente.')
   }
 }


// Descargar PDF original
const downloadPDF = async () => {
  try {
    await downloadContract()
  } catch (err) {
    showError('Error al descargar', 'No se pudo descargar el documento.')
  }
}

 // Manejar resize de ventana
 const handleResize = async () => {
  // Actualizar detección de móvil
  isMobile.value = window.innerWidth <= 768
  
   if (pdfDoc.value && totalPages.value > 0) {
     await renderAllPages()
   }
 }
 
 // Lifecycle hooks
 onMounted(async () => {
   try {
    // Forzar tema claro al cargar la página
    colorMode.preference = 'light'
    
    // Detectar si es móvil
    isMobile.value = window.innerWidth <= 768
    
     // Esperar a que el DOM esté completamente montado
     await nextTick()
     
    // Agregar listener para resize
    window.addEventListener('resize', handleResize)

    // En móvil, enfocar el contenedor scrollable para que el header salga de vista
    if (isMobile.value && scrollContainer.value) {
      // pequeño delay para asegurar layout
      setTimeout(() => {
        scrollContainer.value.scrollIntoView({ block: 'start', behavior: 'instant' })
      }, 0)
    }
     
     loadPDF()
   } catch (err) {
     showError('Error de inicialización', 'No se pudo inicializar el visor de PDF')
   }
 })
 
 onUnmounted(() => {
   // Restaurar tema original del usuario
   colorMode.preference = previousTheme.value
   
   // Limpiar el documento PDF
   if (pdfDoc.value) {
     pdfDoc.value.destroy()
     pdfDoc.value = null
   }
   
   // Remover listener de resize
   window.removeEventListener('resize', handleResize)
   
   // Limpiar timeout de renderizado
   if (renderTimeout.value) {
     clearTimeout(renderTimeout.value)
   }
 })
</script>

<style scoped>
/* Transiciones */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

/* Contenedor principal con scroll mejorado */
.pdf-scroll-container {
  overflow: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  position: relative;
  /* Permitir scroll vertical y horizontal siempre */
  touch-action: pan-x pan-y pinch-zoom;
  /* Asegurar que el contenedor tenga altura para scroll */
  min-height: 0;
  height: 100%;
  /* CRÍTICO: Asegurar que el scroll vertical funcione */
  overflow-x: auto;
  overflow-y: auto;
  /* Permitir que el contenido crezca más allá del viewport */
  will-change: scroll-position;
}

/* Cuando está con zoom, asegurar que el scroll funcione correctamente */
.pdf-scroll-container.zoomed {
  overflow: scroll !important;
  /* Permitir scroll en ambas direcciones cuando hay zoom */
  overflow-x: auto !important;
  overflow-y: auto !important;
  /* Crítico: priorizar scroll vertical cuando hay zoom */
  touch-action: pan-x pan-y pinch-zoom !important;
}

/* Para móvil, asegurar que el contenedor tenga el tamaño correcto */
@media (max-width: 768px) {
  .pdf-scroll-container {
    max-width: 100%;
    max-height: 100%;
    /* Importante: permitir que el contenido crezca más allá del viewport */
    overflow: auto !important;
    overflow-x: auto !important;
    overflow-y: auto !important;
    /* Permitir scroll vertical siempre - crítica para funcionar en móvil con zoom */
    touch-action: pan-x pan-y pinch-zoom !important;
    /* Asegurar altura para scroll */
    height: 100% !important;
    min-height: 100% !important;
    /* Asegurar que captura eventos de scroll */
    -webkit-overflow-scrolling: touch !important;
    /* Permitir que el contenido tenga la altura necesaria */
    position: relative;
  }
  
  .pdf-scroll-container.zoomed {
    /* En móvil con zoom, permitir scroll libre en ambas direcciones */
    overflow: scroll !important;
    overflow-x: auto !important;
    overflow-y: auto !important;
    -webkit-overflow-scrolling: touch !important;
    /* Crítico: asegurar scroll vertical funcione */
    touch-action: pan-x pan-y pinch-zoom !important;
    /* Asegurar que el contenedor pueda scrollear verticalmente */
    max-height: 100vh !important;
    height: 100% !important;
  }
  
  /* Asegurar que el contenido PDF pueda crecer verticalmente */
  .pdf-content-wrapper {
    /* En móvil, el contenido debe poder crecer para permitir scroll */
    min-height: auto !important;
    height: auto !important;
  }
}

/* Wrapper del contenido PDF */
.pdf-content-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  position: relative;
  margin: 0 auto;
  /* Asegurar que el wrapper pueda crecer para permitir scroll vertical */
  min-height: 100%;
  width: 100%;
  /* CRÍTICO: Permitir que el contenido crezca verticalmente para scroll */
  height: auto;
  /* Asegurar que el contenido tenga el espacio necesario */
  flex-shrink: 0;
}

/* Wrapper de cada página */
.page-wrapper {
  width: max-content;
  height: max-content;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  /* Asegurar que el wrapper pueda crecer para permitir scroll */
  min-height: 0;
}

/* Canvas responsivo */
canvas {
  display: block;
  max-width: none !important; /* Importante para permitir que el canvas crezca con el zoom */
  height: auto;
  /* Permitir scroll vertical y horizontal, y pinch-zoom */
  touch-action: pan-x pan-y pinch-zoom;
  /* No bloquear eventos de pointer para permitir scroll nativo en móvil */
  pointer-events: auto;
  /* Asegurar que los transforms funcionen correctamente */
  will-change: transform;
  transform-origin: top left;
}

/* Cuando hay zoom, asegurar que el canvas no bloquee el scroll */
@media (max-width: 768px) {
  canvas {
    /* En móvil, siempre permitir scroll nativo en todas las direcciones */
    touch-action: pan-x pan-y pinch-zoom !important;
    /* No interceptar eventos de touch para scroll */
    pointer-events: auto !important;
    /* Asegurar que no bloquea el scroll pasivo */
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    user-select: none;
  }
  
  /* Wrappers también deben permitir scroll */
  .page-container,
  .page-wrapper {
    touch-action: pan-x pan-y pinch-zoom !important;
    pointer-events: auto !important;
  }
}

/* Contenedor del PDF con zoom */
.pdf-container {
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.pdf-container.dragging,
.pdf-scroll-container.dragging {
  cursor: grabbing !important;
  user-select: none !important;
}

/* Contenedor de página individual */
.page-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.5rem;
  width: max-content;
  height: max-content;
  /* Permitir que el contenedor crezca verticalmente */
  min-height: 0;
}

/* Hover effects */
.group:hover .group-hover\:opacity-100 {
  opacity: 1 !important;
}

/* Asegurar que los eventos de pointer funcionen correctamente */
.pointer-events-none {
  pointer-events: none !important;
}

.pointer-events-auto {
  pointer-events: auto !important;
}

/* Transición suave para el indicador de zoom */
.zoom-indicator {
  transition: opacity 0.2s ease-in-out;
  pointer-events: none;
}

/* Mejoras para scroll en móvil */
@supports (-webkit-touch-callout: none) {
  /* Estilos específicos para iOS */
  .pdf-scroll-container {
    -webkit-overflow-scrolling: touch;
  }
}

/* Asegurar que el scroll horizontal funcione en todos los navegadores móviles */
.pdf-scroll-container::-webkit-scrollbar {
  height: 8px;
  width: 8px;
}

.pdf-scroll-container::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

.pdf-scroll-container::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
}

.pdf-scroll-container::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.5);
}
</style>