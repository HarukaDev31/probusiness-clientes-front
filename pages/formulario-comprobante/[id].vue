<template>
  <FormularioComprobante :contenedor-id="contenedorId" />
</template>

<script setup lang="ts">
import FormularioComprobante from '~/components/formulario-comprobante/FormularioComprobante.vue'

definePageMeta({
  title: 'Formulario de Comprobante',
  layout: 'default',
  middleware: 'auth'
})

const route = useRoute()
const contenedorId = Number(route.params.id)
</script>
