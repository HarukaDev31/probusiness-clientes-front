import type { User, LoginCredentials as _LoginCredentials, LoginResponse as _LoginResponse, ApiLoginResponse, RegisterCredentials, RegisterResponse } from '../types/auth'
import { websocketRoles } from '../config/websocket/channels'
import { useEcho } from '../composables/websocket/useEcho'

interface ApiPlugin {
  call: <T>(endpoint: string, options?: any) => Promise<T>
  auth: <T>(endpoint: string, credentials: { No_Usuario: string; No_Password: string }) => Promise<T>
  config: any
}

export interface AuthUser {
  id: number | string
  email: string
  name: string
  role?: string
  avatar?: string | null
  lastLogin?: string
  isActive?: boolean
  dni?: string
  phone?: string
  country?: string
  city?: string
  department?: number
  district?: number
  goals?: string
  empresa?: string
  fechaNacimiento?: string
  no_como_entero?: number | null
  no_otros_como_entero_empresa?: number | null
  raw?: any
}

export interface AuthMenu {
  ID_Menu: number
  ID_Padre: number
  Nu_Orden: number
  No_Menu: string
  No_Menu_Url: string
  No_Class_Controller: string
  Txt_Css_Icons: string
  Nu_Separador: number
  Nu_Seguridad: number
  Nu_Activo: number
  Nu_Tipo_Sistema: number
  Txt_Url_Video: string | null
  No_Menu_China: string
  show_father: number
  url_intranet_v2?: string | null
  Nu_Cantidad_Menu_Padre: number
  Hijos: AuthMenu[]
  SubHijos?: AuthMenu[]
  route?: string
}

class AuthService {
  private static instance: AuthService
  private currentUser: AuthUser | null = null
  private token: string | null = null
  private menu: AuthMenu[] = []
  private nuxtApp: any = null
  private echo = useEcho()
  private isEchoInitialized = false

  private constructor() {
    this.initializeFromStorage()
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  setNuxtApp(app: any) {
    this.nuxtApp = app
  }

  async initializeEcho() {
    if (!this.isEchoInitialized && this.token) {
      const config = {
        wsHost: this.nuxtApp.$config.public.pusherWsHost,
        forceTLS: false,
        enabledTransports: ['ws', 'wss'],
        authEndpoint: `https://${this.nuxtApp.$config.public.pusherWsHost}/api/broadcasting/auth`,
        auth: {
          headers: {
            Authorization: `Bearer ${this.token}`,
            Accept: 'application/json'
          }
        }
      }

      await this.echo.initializeEcho(config)
      this.isEchoInitialized = true
      const role = this.currentUser?.raw?.grupo.nombre
      if (role) {
        this.setupWebSocketChannels(role)
      }
    }
  }

  private initializeFromStorage(): void {
    if (process.client) {
      const storedToken = localStorage.getItem('auth_token')
      const storedUser = localStorage.getItem('auth_user')
      const storedMenu = localStorage.getItem('auth_menu')

      if (storedToken && storedUser) {
        this.token = storedToken
        this.currentUser = JSON.parse(storedUser)
      }
      if (storedMenu) {
        this.menu = JSON.parse(storedMenu)
      }
    }
  }

  private setupWebSocketChannels(role: string) {
    if (!this.isEchoInitialized) {
      console.warn('Echo no está inicializado. Los canales se configurarán después de la inicialización.')
      return
    }

    const roleConfig = websocketRoles[role]
    if (roleConfig) {
      console.log('Suscribiendo a canales para rol:', role)
      this.echo.subscribeToRoleChannels(roleConfig)
    }
  }

  private saveToStorage(): void {
    if (process.client) {
      if (this.token) {
        localStorage.setItem('auth_token', this.token)
      }
      if (this.currentUser) {
        localStorage.setItem('auth_user', JSON.stringify(this.currentUser))
      }
      if (this.menu) {
        localStorage.setItem('auth_menu', JSON.stringify(this.menu))
      }
    }
  }

  private clearStorage(): void {
    if (process.client) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      localStorage.removeItem('auth_menu')
    }
  }

  async login(credentials: _LoginCredentials): Promise<_LoginResponse> {
    try {
      if (!this.nuxtApp) throw new Error('Nuxt app not initialized')

      const response = await this.nuxtApp.$api.auth('/api/auth/login', {
        No_Usuario: credentials.email,
        No_Password: credentials.password
      })

      if (response.status === 'success' && response.token && response.user) {
        const user: AuthUser = {
          id: response.user.ID_Usuario,
          email: response.user.Txt_Email || response.user.No_Usuario,
          name: response.user.No_Usuario,
          role: response.user.role || 'user',
          avatar: null,
          lastLogin: response.user.Fe_Creacion,
          isActive: response.user.Nu_Estado === 1,
          dni: response.user.dni,
          raw: response.user
        }
        const token = response.token
        const menu: AuthMenu[] = response.menus || []

        this.currentUser = user
        this.token = token
        //if menu.show_father=0 then remove menu.Hijos
        menu.forEach(
          (item) => {
            if (item.show_father == 0) {
              item.Hijos = []
            }
          }
        )
        this.menu = menu
        this.saveToStorage()

        // Inicializar Echo y configurar canales
        await this.initializeEcho()

        return {
          success: true,
          data: {
            user: user as any,
            token
          },
          message: response.message || 'Login exitoso'
        }
      } else {
        return {
          success: false,
          data: null,
          error: response.message || 'Credenciales incorrectas'
        }
      }
    } catch (error: any) {
      return {
        success: false,
        data: null,
        error: error.message || 'Error de conexión'
      }
    }
  }
  async loginCliente(credentials: _LoginCredentials): Promise<_LoginResponse> {
    try {
      if (!this.nuxtApp) throw new Error('Nuxt app not initialized')

      const response = await this.nuxtApp.$api.auth('/api/auth/clientes/login', {
        No_Usuario: credentials.email,
        No_Password: credentials.password
      })

      if (response.success && response.token && response.user) {
        const user: AuthUser = {
          id: response.user.id,
          email: response.user.email || response.user.No_Usuario,
          name: response.user.name,
          role: response.user.role || 'user',
          avatar: response.user.photoUrl,
          lastLogin: response.user.Fe_Creacion,
          isActive: response.user.Nu_Estado === 1,
          dni: response.user.dni,
          phone: response.user.phone,
          country: response.user.country,
          city: response.user.city,
          goals: response.user.goals,
          empresa: response.user.empresa,
          fechaNacimiento: response.user.fechaNacimiento, 
          raw: response.user.raw
        }
        const token = response.token
        const menu: AuthMenu[] = response.menus || []

        this.currentUser = user
        this.token = token
        //if menu.show_father=0 then remove menu.Hijos
        menu.forEach(
          (item) => {
            if (item.show_father == 0) {
              item.Hijos = []
            }
            item.route = item.url_intranet_v2 || ''
          }
        )
        this.menu = menu
        this.saveToStorage()

        // Inicializar Echo y configurar canales
        await this.initializeEcho()

        return {
          success: true,
          data: {
            user: user as any,
            token
          },
          message: response.message || 'Login exitoso'
        }
      } else {
        return {
          success: false,
          data: null,
          error: response.message || 'Credenciales incorrectas'
        }
      }
    } catch (error: any) {
      return {
        success: false,
        data: null,
        error: error.message || 'Error de conexión'
      }
    }
  }

  async register(credentials: RegisterCredentials): Promise<RegisterResponse> {
    try {
      if (!this.nuxtApp) throw new Error('La aplicación Nuxt no está inicializada')
      
      const requestPayload = {
        nombre: credentials.nombre,
        lastname: credentials.apellido,
        email: credentials.email,
        whatsapp: credentials.whatsapp,
        password: credentials.password,
        repeatPassword: credentials.repeatPassword,
        dni: credentials.dni,
        fechaNacimiento: credentials.fechaNacimiento,
        no_como_entero: credentials.no_como_entero,
        no_otros_como_entero_empresa: credentials.no_otros_como_entero_empresa,
        departamento_id: credentials.departamento,
        provincia_id: credentials.provincia,
        distrito_id: credentials.distrito
      }
      
      console.log('🔧 AuthService: Enviando al backend:', requestPayload)
      
      // Corregido para usar los tipos correctos y evitar el uso de <any>
      const response = await this.nuxtApp.$api.auth('/api/auth/clientes/register', requestPayload)
      if (response.success && response.token && response.user) {
        console.log(response)
        const user: AuthUser = {
          id: response.user.id,
          email: response.user.email || response.user.No_Usuario,
          name: response.user.name,
          phone: response.user.phone,
          fechaNacimiento: response.user.fechaNacimiento,
          country: response.user.country,
          city: response.user.city,
          department: response.user.department,
          district: response.user.district,
          dni: response.user.dni,
          goals: response.user.goals,
          empresa: response.user.empresa,
          role: 'Cliente',
          avatar: response.user.photoUrl,
          lastLogin: response.user.createdAt,
          isActive: response.user.isActive,
          raw: response.user.raw
        }
        const token = response.token
        const menu: AuthMenu[] = response.menus || []

        this.currentUser = user
        this.token = token
        this.menu = menu
        this.saveToStorage()

        // Inicializar Echo y configurar canales
        await this.initializeEcho()

        return {
          success: true,
          data: {
            user: user as any,
            token
          },
          message: response.message || 'Registro exitoso'
        }
      }
    }
    catch (error: any) {
      throw error
    }
  }
  async forgotPassword(email: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      if (!this.nuxtApp) throw new Error('Nuxt app not initialized')

      const response = await this.nuxtApp.$api.auth('/api/auth/clientes/forgot-password', {
        email: email
      })

      if (response.success) {
        return {
          success: true,
          message: response.message || 'Se ha enviado un correo con las instrucciones para restablecer tu contraseña'
        }
      } else {
        return {
          success: false,
          error: response.message || 'Error al enviar el correo de recuperación'
        }
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.data?.message || error.message || 'Error de conexión'
      }
    }
  }

  async resetPassword(token: string, password: string, passwordConfirmation: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      if (!this.nuxtApp) throw new Error('Nuxt app not initialized')

      const response = await this.nuxtApp.$api.auth('/api/auth/clientes/reset-password', {
        token: token,
        password: password,
        password_confirmation: passwordConfirmation
      })

      if (response.success) {
        return {
          success: true,
          message: response.message || 'Tu contraseña ha sido restablecida exitosamente'
        }
      } else {
        return {
          success: false,
          error: response.message || 'Error al restablecer la contraseña'
        }
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.data?.message || error.message || 'Error de conexión'
      }
    }
  }

  async updateUserAccount(data: any): Promise<any> {
    try {
      if (!this.nuxtApp) throw new Error('Nuxt app not initialized')

      const response = await this.nuxtApp.$api.call('/api/auth/clientes/update-account', {
        method: 'PUT',
        body: data
      })

      if (response.success && response.user) {
        // Actualizar el usuario en el storage
        const updatedUser: AuthUser = {
          ...this.currentUser,
          ...response.user
        }
        this.currentUser = updatedUser
        this.saveToStorage()
      }

      return response
    } catch (error: any) {
      throw error
    }
  }

  async me(): Promise<any> {
    try {
      if (!this.nuxtApp) throw new Error('Nuxt app not initialized')

      const response = await this.nuxtApp.$api.call('/api/auth/clientes/me', {
        method: 'GET'
      })

      return response
    } catch (error: any) {
      throw error
    }
  }

  async logout(): Promise<void> {
    try {
      if (this.isEchoInitialized) {
        this.echo.disconnect()
        this.isEchoInitialized = false
      }

      this.currentUser = null
      this.token = null
      this.menu = []
      this.clearStorage()
    } catch (error) {
      console.error('Error during logout:', error)
    }
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    return this.currentUser
  }

  getMenu(): AuthMenu[] {
    return this.menu
  }

  isAuthenticated(): boolean {
    return !!this.token && !!this.currentUser
  }

  getToken(): string | null {
    return this.token
  }
}

export default AuthService
export type { _LoginCredentials as LoginCredentials, _LoginResponse as LoginResponse }