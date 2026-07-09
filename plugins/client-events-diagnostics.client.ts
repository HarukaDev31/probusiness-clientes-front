import { exposeClientEventDiagnostics } from '~/utils/clientEventTrace'

export default defineNuxtPlugin(() => {
  exposeClientEventDiagnostics()
})
