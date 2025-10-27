<template>
  <div class="min-h-screen w-3/4 mx-auto min-w-fit bg-gray-50">
    <!-- Header con controles -->
    <UCard class="m-4 shadow-lg">
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
             <span v-if="isMobile" class="text-xs text-gray-500 dark:text-gray-500">
             📱 Pellizca para hacer zoom
             </span>
         </div>
       </template>
    </UCard>

    <!-- Contenedor principal del PDF -->
    <div class="mx-4 mb-4">
      <UCard class="shadow-lg">
         <div class="relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden" ref="pdfContainer">
           <!-- Contenedor con scroll mejorado para todas las páginas -->
           <div 
             class="overflow-auto max-h-[85vh] p-4 relative pdf-container" 
             ref="scrollContainer"
             @touchstart="handleTouchStart"
             @touchmove="handleTouchMove"
             @touchend="handleTouchEnd"
           >
             <!-- Indicador de zoom para móvil -->
             <div 
               v-if="isMobile && isZooming" 
               class="absolute top-4 right-4 z-20 bg-black bg-opacity-75 text-white px-3 py-2 rounded-lg text-sm font-medium zoom-indicator"
             >
               {{ Math.round(currentScale * 100) }}%
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
             <div class="flex flex-col items-center space-y-4" ref="pdfViewer">
               <!-- Canvas para mostrar todas las páginas del PDF -->
               <div 
                 v-for="pageNum in totalPages" 
                 :key="pageNum"
                 class="relative"
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
 const maxScale = ref(3.0)

 // Estado general
const pdfUrl = computed(() => contractUrl.value)

 // Detectar si es móvil
const isMobile = ref(false)

// Variables para zoom táctil
const touchStartDistance = ref(0)
const touchStartScale = ref(1)
const isZooming = ref(false)
const lastTouchTime = ref(0)
const renderTimeout = ref(null)
 
 // Estado de la firma (ya no se usa, se envía directamente)


// Función para establecer referencias de canvas
const setCanvasRef = (el, pageNum) => {
  if (el) {
    pdfCanvases.value[pageNum] = el
  }
}

// Funciones para zoom táctil
const getDistance = (touch1, touch2) => {
  const dx = touch1.clientX - touch2.clientX
  const dy = touch1.clientY - touch2.clientY
  return Math.sqrt(dx * dx + dy * dy)
}

const handleTouchStart = (event) => {
  if (event.touches.length === 2) {
    // Iniciar zoom con dos dedos
    event.preventDefault()
    isZooming.value = true
    touchStartDistance.value = getDistance(event.touches[0], event.touches[1])
    touchStartScale.value = currentScale.value
    lastTouchTime.value = Date.now()
  }
}

// Función optimizada para renderizado durante zoom táctil
const debouncedRender = () => {
  if (renderTimeout.value) {
    clearTimeout(renderTimeout.value)
  }
  renderTimeout.value = setTimeout(() => {
    renderAllPages()
  }, 50) // Debounce de 50ms para mejor rendimiento
}

const handleTouchMove = (event) => {
  if (event.touches.length === 2 && isZooming.value) {
    event.preventDefault()
    event.stopPropagation()
    
    const currentDistance = getDistance(event.touches[0], event.touches[1])
    const scaleChange = currentDistance / touchStartDistance.value
    const newScale = touchStartScale.value * scaleChange
    
    // Aplicar límites de zoom con rango extendido para móvil
    const mobileMaxScale = isMobile.value ? 5.0 : maxScale.value
    const clampedScale = Math.max(minScale.value, Math.min(mobileMaxScale, newScale))
    
    // Solo actualizar si hay un cambio significativo (más suave)
    if (Math.abs(clampedScale - currentScale.value) > 0.02) {
      currentScale.value = clampedScale
      
      // Usar renderizado optimizado
      debouncedRender()
    }
  }
}

const handleTouchEnd = (event) => {
  if (event.touches.length < 2) {
    isZooming.value = false
    touchStartDistance.value = 0
    touchStartScale.value = 1
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
 const renderAllPages = async () => {
   if (!pdfDoc.value || isRendering.value) return
   
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
     
     const containerWidth = pdfContainer.value.clientWidth - 64
     const scaleX = containerWidth / viewport.width
     const scale = Math.max(scaleX, minScale.value)
     
     console.log('🔧 Escala calculada:', {
       containerWidth,
       scaleX,
       scale,
       currentScale: currentScale.value,
       isMobile: isMobile.value
     })
     
     if (currentScale.value === 1.0) {
       currentScale.value = Math.min(scale, maxScale.value)
       console.log('🔧 Escala actualizada a:', currentScale.value)
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
     
     // Configurar tamaño del canvas
     canvas.width = scaledViewport.width
     canvas.height = scaledViewport.height
     
     // Centrar el canvas horizontalmente
     canvas.style.display = 'block'
     canvas.style.margin = '0 auto'
     
     // Limpiar el canvas antes de renderizar
     context.clearRect(0, 0, canvas.width, canvas.height)
     
     // Renderizar la página en el canvas
     const renderContext = {
       canvasContext: context,
       viewport: scaledViewport,
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
     await renderAllPages()
   }
 }
 
 const zoomOut = async () => {
   if (currentScale.value > minScale.value) {
     currentScale.value = Math.max(minScale.value, currentScale.value - 0.25)
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

/* Canvas responsivo */
canvas {
  max-width: 100%;
  width: 100%;
  height: auto !important;
  margin: 0 auto;
}

/* Contenedor del PDF con zoom */
.pdf-container {
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  width: 100%;
}

/* Contenedor de página individual */
.page-container {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
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

/* Mejorar experiencia táctil */
.touch-manipulation {
  touch-action: manipulation;
}

/* Prevenir zoom del navegador durante el zoom personalizado */
.prevent-zoom {
  touch-action: pan-x pan-y;
}

/* Transición suave para el indicador de zoom */
.zoom-indicator {
  transition: opacity 0.2s ease-in-out;
}
</style>