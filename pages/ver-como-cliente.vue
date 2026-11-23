<template>
  <div class="flex min-h-screen items-center justify-center p-6">
    <p v-if="!error" class="text-gray-700">Abriendo el portal del cliente…</p>
    <div v-else class="max-w-md rounded-lg bg-white p-6 text-center shadow">
      <h1 class="mb-2 text-lg font-semibold text-gray-900">No se pudo abrir el portal</h1>
      <p class="text-gray-700">{{ error }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AuthService from '../services/authService'

definePageMeta({ layout: 'auth' })

const error = ref('')

onMounted(async () => {
  const codigo = new URLSearchParams(window.location.hash.slice(1)).get('codigo') || ''
  // El código es de un solo uso: no se queda en la URL ni en el historial.
  window.history.replaceState(window.history.state, '', window.location.pathname)
  if (!codigo) {
    error.value = 'Falta el código. Ábrelo de nuevo desde Entregas.'
    return
  }
  const response = await AuthService.getInstance().loginVerComoCliente(codigo)
  if (!response.success) {
    error.value = response.error || 'Ábrelo de nuevo desde Entregas.'
    return
  }
  window.location.replace('/')
})
</script>
