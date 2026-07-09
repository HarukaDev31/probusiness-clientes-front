<template>
  <DynamicModal
    v-for="modal in modals"
    :key="modal.id"
    :modal="modal"
    @close="removeModal(modal.id)"
    @confirm="handleConfirm(modal)"
    @cancel="handleCancel(modal)"
  />
</template>

<script setup lang="ts">
import { useModal } from '../composables/commons/useModal'
const { modals, removeModal } = useModal()

const handleConfirm = (modal: any) => {
  if (modal.onConfirm) {
    modal.onConfirm()
  }
  removeModal(modal.id)
}
const handleCancel = (modal: any) => {
  if (modal.onCancel) {
    modal.onCancel()
  }
  removeModal(modal.id)
}
</script> 