// plugins/services.client.ts
  import { BaseService } from '../services/base/BaseService'

export default defineNuxtPlugin((nuxtApp) => {
  BaseService.initializeAllServices(nuxtApp)
})