import { ClientEventService } from '~/services/commons/clientEventService'
import { devLogger } from '~/utils/devLogger'

export interface TrackClientEventOptions {
  page?: string
  metadata?: Record<string, unknown>
  sendToApi?: boolean
}

export const useClientEvents = (defaultPage?: string) => {
  const route = useRoute()
  const page = defaultPage ?? route.path

  const trackClientEvent = (event: string, options: TrackClientEventOptions = {}) => {
    const payload = {
      event,
      page: options.page ?? page,
      metadata: options.metadata ?? {},
      timestamp: new Date().toISOString()
    }

    devLogger.log('[ClientEvent]', payload)

    if (options.sendToApi !== false) {
      ClientEventService.track(payload)
    }
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
      metadata: { form, status, ...metadata }
    })
  }

  return {
    trackClientEvent,
    trackFieldInteraction,
    trackFormSubmit
  }
}
