<template>
  <div class="timeline-container">
    <UTimeline 
      :items="timelineItems" 
      :default-value="activeItemIndex"
      :color="props.isDisable ? 'secondary' : 'success'"
      size="md"
      orientation="vertical"
      class="w-full max-w-2xl mx-auto"
    >
      <template #description="{ item }">
        <span v-html="item.description" />
      </template>
    </UTimeline>
  </div>
</template>

<script setup lang="ts">
import type { ContainerJourneyStatus } from '~/types/containers'
import type { TimelineItem } from '@nuxt/ui'

const props = defineProps({
  events: {
    type: Array as () => ContainerJourneyStatus[],
    default: () => [] as ContainerJourneyStatus[],
  },
  completed: {
    type: Boolean,
    default: false,
  },
  allGray: {
    type: Boolean,
    default: false,
  },
  isDisable: {
    type: Boolean,
    default: false,
  }
})

// Mapear los eventos al formato que espera UTimeline
const timelineItems = computed<TimelineItem[]>(() => {
  return props.events.map((event, index) => ({
    date: formatDateTimeToDmy(event.date),
    title: event.name,
    description: (event.description || `${event.name} `).replace(/\n/g, '<br>'),
    icon: getStatusIcon(event.status, 'i-heroicons-clock'),
    value: index,
    class: getItemClass(event.status)
  }))
})

// Obtener el índice activo: si hay 'ENTREGADO', ese es el activo; si no, el último 'COMPLETADO'
const activeItemIndex = computed(() => {
  const lastEntregadoIndex = props.events.findLastIndex(event => event.status === 'ENTREGADO')
  if (lastEntregadoIndex >= 0) return lastEntregadoIndex
  const lastCompletedIndex = props.events.findLastIndex(event => event.status === 'COMPLETADO')
  return lastCompletedIndex >= 0 ? lastCompletedIndex : -1
})

// Función para formatear fechas
const formatDate = (dateString: string) => {
  if (!dateString) return 'Fecha no disponible'
  
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Función para obtener el icono según el estado
  const getStatusIcon = (status: string, defaultIcon: string) => {
  if (status === 'COMPLETADO') {
    return 'i-heroicons-check-circle'
  } else if (status === 'PENDIENTE') {
    return 'i-heroicons-clock'
  } else if (status === 'ENTREGADO') {
    return 'i-heroicons-check-circle'
  } 
  return defaultIcon || 'i-heroicons-clock  '
}

// Función para obtener clases CSS según el estado
const getItemClass = (status: string) => {
  if (props.isDisable || props.allGray) {
    return 'text-gray-600 dark:text-gray-500'
  }
  if (status === 'COMPLETADO') {
    return 'text-green-600 dark:text-green-400'
  } else if (status === 'PENDIENTE') {
    return 'text-gray-500 dark:text-gray-400'
  } else if (status === 'ENTREGADO') {
    return 'text-gray-600 dark:text-gray-500'
  }
  return 'text-blue-600 dark:text-blue-400'
}
</script>

<style scoped>
.timeline-container {
  padding: 1rem;
}

/* Personalización para el timeline vertical */
:deep(.timeline-item) {
  transition: all 0.3s ease;
}

:deep(.timeline-item:hover) {
  transform: translateX(4px);
}

/* Estilos para mejorar la apariencia */
:deep(.timeline-item) {
  padding: 0.75rem 0;
}

:deep(.timeline-item .timeline-content) {
  padding-left: 1rem;
}

/* Estilos para diferentes estados */
:deep(.timeline-item.completed) {
  opacity: 1;
}

:deep(.timeline-item.pending) {
  opacity: 0.8;
}

/* Mejoras en el texto */
:deep(.timeline-item .timeline-title) {
  font-weight: 600;
  font-size: 1rem;
  line-height: 1.4;
}

:deep(.timeline-item .timeline-description) {
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

:deep(.timeline-item .timeline-date) {
  font-size: 0.75rem;
  color: #9ca3af;
  font-weight: 500;
}
</style>