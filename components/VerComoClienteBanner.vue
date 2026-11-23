<template>
  <div
    v-if="visible"
    role="status"
    class="sticky top-0 z-40 flex flex-wrap items-center justify-center gap-3 bg-amber-400 px-4 py-2 text-sm font-medium text-gray-900"
  >
    <span>Estás viendo el portal como {{ nombre || 'el cliente' }} · solo lectura</span>
    <UButton label="Salir" size="xs" color="neutral" variant="solid" @click="salir" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { authStorage, esVerComoCliente } from '~/utils/authStorage'
import AuthService from '../services/authService'

const visible = ref(false)
const nombre = ref('')

onMounted(() => {
  visible.value = esVerComoCliente()
  if (!visible.value) return
  try {
    nombre.value = JSON.parse(authStorage().getItem('auth_user') || '{}')?.name || ''
  } catch {
    nombre.value = ''
  }
})

async function salir() {
  await AuthService.getInstance().logout()
  window.close()
  // Si el navegador no deja cerrar la pestaña, recarga para soltar la sesión en memoria.
  window.location.replace('/login')
}
</script>
