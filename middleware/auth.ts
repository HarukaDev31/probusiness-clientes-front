import { authStorage, esVerComoCliente } from '../utils/authStorage'
import AuthService from '../services/authService'
import { useSession } from '../composables/auth/useSession'

export default defineNuxtRouteMiddleware((to) => {
  if (to.path === '/login') return

  // En Node (SSR) no existe localStorage; hasValidToken() devuelve false y el acceso a localStorage rompía la página (500).
  if (import.meta.server) {
    return
  }

  const authService = AuthService.getInstance()
  const { hasValidToken } = useSession()

  if (!hasValidToken() || !authService.isAuthenticated()) {
    authStorage().removeItem('auth_token')
    authStorage().removeItem('auth_user')
    authStorage().removeItem('auth_menu')
    localStorage.setItem('return_to', to.path)
    return navigateTo('/login')
  }

  if (esVerComoCliente()) return

  const returnTo = localStorage.getItem('return_to')
  if (returnTo) {
    localStorage.removeItem('return_to')
    return navigateTo(returnTo)
  }
})