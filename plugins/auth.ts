import AuthService from '../services/authService'

export default defineNuxtPlugin((nuxtApp) => {
  const authService = AuthService.getInstance()
  authService.setNuxtApp(nuxtApp)
})
