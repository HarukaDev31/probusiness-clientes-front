<template>
  <div class="min-h-screen w-3/4 mx-auto min-w-fit bg-gray-50">
    <!-- Header -->
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
    </UCard>

    <!-- PDF Container -->
    <div class="mx-4 mb-4">
      <UCard class="shadow-lg">
        <div class="bg-gray-100 rounded-lg overflow-hidden max-h-[90vh] overflow-y-auto">
          <!-- Loading -->
          <div v-if="!isLoaded" class="flex items-center justify-center p-20">
            <div class="text-center">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p class="text-gray-600">Cargando documento...</p>
            </div>
          </div>

          <!-- PDF con object para mejor compatibilidad móvil -->
          <div v-if="isLoaded" class="w-full pdf-container">
            <!-- Opción 1: Usando object (mejor para móviles) -->
            <object
              :data="pdfUrl"
              type="application/pdf"
              class="w-full pdf-viewer"
            >
              <!-- Fallback para navegadores que no soportan object -->
              <embed
                :src="pdfUrl"
                type="application/pdf"
                class="w-full pdf-viewer"
              />
              
              <!-- Fallback final si ninguno funciona -->
              <div class="p-8 text-center">
                <p class="text-gray-600 mb-4">
                  No se puede mostrar el PDF en este navegador.
                </p>
                <UButton
                  @click="downloadPDF"
                  color="primary"
                  variant="solid"
                  icon="i-heroicons-arrow-down-tray"
                >
                  Descargar PDF
                </UButton>
              </div>
            </object>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Controles flotantes -->
    <div class="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 flex gap-4">
      <div v-if="!hasSignedContract" class="bg-white rounded-lg shadow-lg p-3 flex items-center gap-2">
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
      
      <div v-if="hasSignedContract" class="bg-white rounded-lg shadow-lg p-3 flex items-center gap-2">
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import SignatureModal from '~/components/SignatureModal.vue'
import { useModal } from '~/composables/commons/useModal'
import { useServiceContract } from '~/composables/useServiceContract'

const { showSuccess, showError } = useModal()

// Forzar tema claro
const colorMode = useColorMode()
const previousTheme = ref(colorMode.preference)

// Composables
const { 
  getServiceContract, 
  signServiceContract, 
  downloadContract, 
  contractUrl, 
  hasContract, 
  hasSignedContract
} = useServiceContract()

const { uuid } = useRoute().params

definePageMeta({
  layout: 'external',
})

const isLoaded = ref(false)
const pdfUrl = computed(() => contractUrl.value)

// useOverlay para modales
const overlay = useOverlay()
const signatureModal = overlay.create(SignatureModal)

// Cargar PDF
const loadPDF = async () => {
  try {
    isLoaded.value = false
    await getServiceContract(uuid as string, false)
    
    if (!hasContract.value) {
      throw new Error('No se pudo obtener el contrato de servicio')
    }
    
    isLoaded.value = true
  } catch (err) {
    console.error('Error cargando PDF:', err)
    showError('Error al cargar el documento', 'No se pudo cargar el documento PDF.')
  }
}

// Abrir modal de firma
const openSignatureModal = () => {
  signatureModal.open({
    onClose: () => signatureModal.close(),
    onConfirm: async (signatureData) => {
      signatureModal.close()
      
      try {
        const response = await signServiceContract(uuid as string, signatureData as unknown as string)
        if (response.success) {
          showSuccess('Firma guardada', 'La firma se ha guardado correctamente')
          await loadPDF()
          redirectToWhatsApp('+51992583703')
        } else {
          showError('Error al guardar', 'No se pudo guardar la firma.')
        }
      } catch (err) {
        showError('Error al guardar', 'No se pudo guardar la firma.')
      }
    }
  })
}

// Redirigir a WhatsApp
const redirectToWhatsApp = (phoneNumber: string = '+51992583703') => {
  try {
    const cleanNumber = phoneNumber.replace(/[\s\-\(\)]/g, '')
    const message = encodeURIComponent(
      '¡Hola! He firmado exitosamente el acuerdo de servicio. ¿Podrían confirmar la recepción del documento firmado?'
    )
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${message}`
    window.open(whatsappUrl, '_blank')
  } catch (error) {
    showError('Error de redirección', 'No se pudo abrir WhatsApp.')
  }
}

// Descargar PDF
const downloadPDF = async () => {
  try {
    await downloadContract()
  } catch (err) {
    showError('Error al descargar', 'No se pudo descargar el documento.')
  }
}

// Lifecycle
onMounted(async () => {
  colorMode.preference = 'light'
  await loadPDF()
})

onUnmounted(() => {
  colorMode.preference = previousTheme.value
})
</script>

<style scoped>
.pdf-iframe {
  height: 85vh;
  min-height: 500px;
  width: 100%;
}

@media (max-width: 768px) {
  .pdf-iframe {
    height: 70vh;
    min-height: 400px;
    -webkit-overflow-scrolling: touch;
    touch-action: manipulation;
  }
}
</style>