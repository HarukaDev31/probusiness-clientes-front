import { clientEventTrace } from '~/utils/clientEventTrace'

export interface TrackClientEventOptions {
  page?: string
  metadata?: Record<string, unknown>
  level?: 'log' | 'warn' | 'error'
}

export const useClientEvents = (defaultPage?: string) => {
  const route = useRoute()
  const page = defaultPage ?? route.path

  const trackClientEvent = (event: string, options: TrackClientEventOptions = {}) => {
    clientEventTrace(event, {
      page: options.page ?? page,
      metadata: options.metadata,
      level: options.level ?? 'log'
    })
  }

  const trackFieldInteraction = (
    field: string,
    action: 'blur' | 'change' | 'input',
    metadata: Record<string, unknown> = {}
  ) => {
    trackClientEvent('field_interaction', {
      metadata: { field, action, ...metadata }
    })
  }

  const trackFormSubmit = (
    form: string,
    status: 'start' | 'validation_failed' | 'success' | 'error',
    metadata: Record<string, unknown> = {}
  ) => {
    trackClientEvent('form_submit', {
      metadata: { form, status, ...metadata },
      level: status === 'error' ? 'error' : status === 'validation_failed' ? 'warn' : 'log'
    })
  }

  return {
    trackClientEvent,
    trackFieldInteraction,
    trackFormSubmit
  }
}
