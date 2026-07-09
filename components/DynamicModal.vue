<template>
  <div
    class="fixed inset-0 z-[9000] flex items-center justify-center p-4"
    style="background-color: rgba(0, 0, 0, 0.45);"
    @mousedown.self="handleClose"
  >
    <UCard class="w-full max-w-md shadow-xl" @click.stop>
      <template #header>
        <div class="flex items-center gap-3">
          <div
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
            :class="iconWrapperClass"
          >
            <UIcon :name="iconName" class="h-6 w-6" :class="iconClass" />
          </div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ modal.title }}
          </h3>
        </div>
      </template>

      <p class="text-gray-700 dark:text-gray-300">
        {{ modal.message }}
      </p>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton
            v-if="modal.type === 'confirmation'"
            variant="outline"
            @click="handleCancel"
          >
            Cancelar
          </UButton>
          <UButton :color="buttonColor" @click="handlePrimaryAction">
            {{ primaryButtonLabel }}
          </UButton>
        </div>
      </template>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import type { ModalData } from '~/composables/commons/useModal'

const props = defineProps<{
  modal: ModalData
}>()

const emit = defineEmits<{
  close: []
  confirm: []
  cancel: []
}>()

const iconConfig = computed(() => {
  switch (props.modal.type) {
    case 'success':
      return {
        icon: 'i-heroicons-check-circle',
        wrapper: 'bg-green-100 dark:bg-green-900/40',
        iconClass: 'text-green-600 dark:text-green-400',
        buttonColor: 'success' as const,
        label: 'Aceptar'
      }
    case 'warning':
      return {
        icon: 'i-heroicons-exclamation-triangle',
        wrapper: 'bg-amber-100 dark:bg-amber-900/40',
        iconClass: 'text-amber-600 dark:text-amber-400',
        buttonColor: 'warning' as const,
        label: 'Entendido'
      }
    case 'info':
      return {
        icon: 'i-heroicons-information-circle',
        wrapper: 'bg-blue-100 dark:bg-blue-900/40',
        iconClass: 'text-blue-600 dark:text-blue-400',
        buttonColor: 'primary' as const,
        label: 'Aceptar'
      }
    case 'confirmation':
      return {
        icon: 'i-heroicons-question-mark-circle',
        wrapper: 'bg-gray-100 dark:bg-gray-800',
        iconClass: 'text-gray-600 dark:text-gray-300',
        buttonColor: 'primary' as const,
        label: 'Confirmar'
      }
    default:
      return {
        icon: 'i-heroicons-exclamation-triangle',
        wrapper: 'bg-red-100 dark:bg-red-900/40',
        iconClass: 'text-red-600 dark:text-red-400',
        buttonColor: 'error' as const,
        label: 'Cerrar'
      }
  }
})

const iconName = computed(() => iconConfig.value.icon)
const iconWrapperClass = computed(() => iconConfig.value.wrapper)
const iconClass = computed(() => iconConfig.value.iconClass)
const buttonColor = computed(() => iconConfig.value.buttonColor)
const primaryButtonLabel = computed(() => iconConfig.value.label)

const handleClose = () => {
  emit('close')
}

const handlePrimaryAction = () => {
  if (props.modal.type === 'confirmation') {
    emit('confirm')
    return
  }
  emit('close')
}

const handleCancel = () => {
  emit('cancel')
}
</script>
