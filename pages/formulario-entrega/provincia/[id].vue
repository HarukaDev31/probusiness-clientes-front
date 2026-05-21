<template>
  <FormularioEntregaProvincia :consolidado-id="consolidadoId" />
</template>

<script setup lang="ts">
import FormularioEntregaProvincia from '~/components/formulario-entrega/FormularioEntregaProvincia.vue'

definePageMeta({
  title: 'Formulario de Entrega - Provincia',
  layout: 'default',
  middleware: 'auth'
})

const route = useRoute()
const consolidadoId = computed(() => String(route.params.id ?? ''))
</script>
