import { BaseService } from '../base/BaseService'

export interface ClientEventPayload {
  event: string
  page?: string
  metadata?: Record<string, unknown>
  timestamp?: string
}

export class ClientEventService extends BaseService {
  private static baseUrl = '/api/clientes/eventos'

  static async track(payload: ClientEventPayload): Promise<void> {
    try {
      await this.apiCall(`${this.baseUrl}`, {
        method: 'POST',
        body: {
          ...payload,
          timestamp: payload.timestamp ?? new Date().toISOString()
        }
      })
    } catch {
      // Fire-and-forget: no interrumpir la UX si el tracking falla
    }
  }
}
