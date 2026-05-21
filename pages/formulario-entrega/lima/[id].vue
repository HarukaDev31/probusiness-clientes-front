<template>
  <FormularioEntregaLima :consolidado-id="consolidadoId" />
</template>

<script setup lang="ts">
import FormularioEntregaLima from '~/components/formulario-entrega/FormularioEntregaLima.vue'

definePageMeta({
  title: 'Formulario de Entrega - Lima',
  layout: 'default',
  middleware: 'auth'
})

const route = useRoute()
const consolidadoId = computed(() => String(route.params.id ?? ''))
</script>
