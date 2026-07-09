import type { RegisterResponse, RegisterCredentials } from '~/types/auth'
import type { AuthUser, AuthMenu, LoginCredentials, LoginResponse } from '../../services/authService'
import AuthService from '../../services/authService'

export const useAuth = () => {
  const user = ref<AuthUser | null>(null)
  const isAuthenticated = ref(false)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const menu = ref<AuthMenu[]>([])

  const authService = AuthService.getInstance()

  // Initialize auth state
  const initializeAuth = async () => {
    user.value = await authService.getCurrentUser()
    menu.value = authService.getMenu()
    isAuthenticated.value = !!user.value
  }

  // Login function
  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      const response: LoginResponse = await authService.login(credentials)
      if (response.success && response.data) {
        user.value = response.data.user as AuthUser
        isAuthenticated.value = true
        menu.value = authService.getMenu()
        return true
      } else {
        error.value = response.error || 'Error al iniciar sesión'
        return false
      }
    } catch (err) {
      error.value = 'Error de conexión'
      return false
    } finally {
      loading.value = false
    }
  }
  const register = async (credentials: RegisterCredentials): Promise<RegisterResponse> => {
    loading.value = true
    error.value = null
    try {
      const response: RegisterResponse = await authService.register(credentials)
      user.value = response.data.user as AuthUser
      isAuthenticated.value = true
      menu.value = authService.getMenu()
      return response
    }
    catch (err: any) {
      error.value = err?.data?.message || err?.message || 'Error al registrar usuario'
      throw err
    } finally {
      loading.value = false
    }
  }
  const loginCliente = async (credentials: LoginCredentials): Promise<LoginResponse> => {
    loading.value = true
    error.value = null
    try {
      const response: LoginResponse = await authService.loginCliente(credentials)
      return response
    }
    catch (err) {
      error.value = err.data.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateUserAccount = async (data: any) => {
    try {
      const response = await authService.updateUserAccount(data)
      return response
    } catch (err) {
      console.error('Error during updateUserAccount:', err)
    }
  }
  // Logout function
  const logout = async () => {
    loading.value = true
    try {
      await authService.logout()
      user.value = null
      isAuthenticated.value = false
      menu.value = []
      await navigateTo('/login')
    } catch (err) {
      console.error('Error during logout:', err)
    } finally {
      loading.value = false
    }
  }
  const me = async () => {
    try {
      const response = await authService.me()
      return response
    } catch (err) {
      console.error('Error during me:', err)
    }
  }

  const forgotPassword = async (email: string) => {
    loading.value = true
    error.value = null
    try {
      const response = await authService.forgotPassword(email)
      return response
    } catch (err) {
      error.value = 'Error al enviar el correo de recuperación'
      throw err
    } finally {
      loading.value = false
    }
  }

  const resetPassword = async (token: string, password: string, passwordConfirmation: string) => {
    loading.value = true
    error.value = null
    try {
      const response = await authService.resetPassword(token, password, passwordConfirmation)
      return response
    } catch (err) {
      error.value = 'Error al restablecer la contraseña'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Get current user
  const getCurrentUser = (): AuthUser | null => {
    return user.value
  }

  // Get menu
  const getMenu = (): AuthMenu[] => {
    return menu.value
  }

  // Check if user is authenticated
  const checkAuth = (): boolean => {
    return isAuthenticated.value
  }
  const getToken = (): string | null => {
    return authService.getToken()
  }
  // Initialize on mount
  onMounted(() => {
    initializeAuth()
  })

  return {
    // State
    user: readonly(user),
    isAuthenticated: readonly(isAuthenticated),
    loading: readonly(loading),
    error: readonly(error),
    menu: readonly(menu),

    // Methods
    login,
    logout,
    getCurrentUser,
    getMenu,
    checkAuth,
    getToken,
    initializeAuth,
    register,
    loginCliente,
    updateUserAccount,
    me,
    forgotPassword,
    resetPassword
  }
} 