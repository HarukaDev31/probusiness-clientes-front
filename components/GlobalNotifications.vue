<template>
  <LoadingSpinner
    v-if="globalLoading"
    :full-screen="true"
    :text="getLoadingMessage()"
    size="xl"
  />
</template>

<script setup lang="ts">
import LoadingSpinner from './LoadingSpinner.vue'

const {
  globalLoading,
  getLoadingMessage
} = useLoading()
</script>
