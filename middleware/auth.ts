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
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    localStorage.removeItem('auth_menu')
    localStorage.setItem('return_to', to.path)
    return navigateTo('/login')
  }

  const returnTo = localStorage.getItem('return_to')
  if (returnTo) {
    localStorage.removeItem('return_to')
    return navigateTo(returnTo)
  }
})