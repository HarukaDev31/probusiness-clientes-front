<template>
  <div class="relative min-h-screen flex flex-col-reverse md:flex-row justify-between items-center py-4 sm:py-8 px-4 sm:px-10 bg-[#FF6700]">
    <img
      src="https://intranet.probusiness.pe/assets/tienda/fondo_auth.webp"
      alt=""
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover object-center"
      width="1920"
      height="1080"
      decoding="async"
    />
    <button type="button" @click="navigateTo('/')" class="relative z-10 focus:outline-none">
      <img
        src="/images/auth/logo-probusiness.svg"
        alt="ProBusiness"
        width="177"
        height="52"
        class="mt-4 self-center md:mt-0 md:self-end"
        decoding="async"
      />
    </button>
    <UCard class="relative z-10 w-full max-w-md sm:max-w-lg md:max-w-md rounded-md shadow-lg p-6 sm:p-8 mx-4 sm:mx-0">

      <h2 class="text-xl sm:text-2xl font-semibold text-center mb-4 sm:mb-6 border-b border-gray-200 pb-3 sm:pb-4">
        Iniciar sesión</h2>
      <form @submit.prevent="handleLoginClloginCliente" class="space-y-4 sm:space-y-5">
        <div>
          <UFormField label="Email">
            <UInput id="email" v-model="email" type="email" class="w-full " placeholder="correo@ejemplo.com" />
          </UFormField>
        </div>
        <div class="relative">
          <UFormField label="Contraseña">
            <UInput id="password" v-model="password" :type="showPassword ? 'text' : 'password'" trailing-icon=""
              class="w-full" placeholder="••••••••" :ui="{ trailing: 'pe-1' }">
              <template #trailing>
                <UButton color="neutral" variant="link" size="sm" icon="i-heroicons-eye" aria-label="Clear input"
                  @click="showPassword = !showPassword" />
              </template>
            </UInput>

          </UFormField>
          <!--Form Field-->
          <!---<button type="button" @click="showPassword = !showPassword" class="absolute right-3 top-10 sm:top-8  hover:">
            <svg v-if="showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
            </svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>-->
          <div class="text-right mt-1">
            <button type="button" @click="navigateTo('/recuperar-contrasena')"
              class="text-sm text-red-500 hover:underline bg-transparent p-0">¿Olvidaste tu
              contraseña?</button>
          </div>
        </div>
        <UButton :disabled="loginClienteLoading" color="primary" type="submit"
          class="w-full flex items-center justify-center py-4 text-white text-xl hover:bg-primary-600 hover:scale-[1.02] hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
          <svg v-if="loginClienteLoading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ loginClienteLoading ? 'Iniciando sesión...' : 'Ingresar' }}
        </UButton>
        <div v-if="loginClienteError" class="flex items-center justify-center gap-2 text-red-500 text-sm text-center mt-2 bg-red-50 border border-red-200 rounded-md p-3">
          <svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          <span>{{ loginClienteError }}</span>
        </div>
        <div v-if="loginClienteSuccess" class="flex items-center justify-center gap-2 text-green-600 text-sm text-center mt-2 bg-green-50 border border-green-200 rounded-md p-3">
          <svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          <span>¡Has iniciado sesión exitosamente!</span>
        </div>
      </form>
      <div class="flex items-center my-4 sm:my-6">
        <div class="flex-grow h-px bg-gray-200"></div>
        <span class="mx-3  text-sm">o</span>
        <div class="flex-grow h-px bg-gray-200"></div>
      </div>
      <!-- Registro -->
      <div class="text-center mb-4 sm:mb-6">
        <span class=" text-sm sm:text-base">¿Aún no tienes una cuenta?</span>
      </div>
      <div class="text-center">
        <button @click="navigateTo('/register')"
          class="ml-2 text-black-500 dark:text-gray-300 border w-full border-primary dark:border-primary-400 rounded-lg px-4 py-3 sm:py-4 font-semibold hover:bg-primary-50 dark:hover:bg-primary-900/30 hover:border-primary-600 dark:hover:border-primary-400 hover:scale-[1.02] hover:shadow-md transition-all duration-200">Registrarme</button>

      </div>
      <!-- add Al registrarte aceptas nuestra política de privacidad y términos y condiciones-->
      <div class="text-xs text-center  mt-4 text-left px-2">
        Al registrarte aceptas nuestra <a href="#" class="text-blue-600 underline">Política de Privacidad</a> y los <a
          href="#" class="text-blue-600 underline">Términos y Condiciones</a>.
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
// Define layout for this page
definePageMeta({
  layout: 'auth'
})
import { useAuth } from '../composables/auth/useAuth'

const { loginCliente } = useAuth()

const email = ref('admin')
const password = ref('')
const showPassword = ref(false)

// Variables para manejar el estado del login
const loginClienteLoading = ref(false)
const loginClienteError = ref('')
const loginClienteSuccess = ref(false)

// Limpiar errores cuando el usuario escriba
watch([email, password], () => {
  if (loginClienteError.value) {
    loginClienteError.value = ''
  }
})

// Función para validar campos
const validateFields = () => {
  if (!email.value || !password.value) {
    loginClienteError.value = 'Por favor completa todos los campos'
    return false
  }
  
  if (email.value.trim().length === 0 || password.value.trim().length === 0) {
    loginClienteError.value = 'Los campos no pueden estar vacíos'
    return false
  }
  
  // Validación básica de email solo si no está vacío
  if (email.value && email.value !== 'admin') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.value)) {
      loginClienteError.value = 'Por favor ingresa un email válido'
      return false
    }
  }
  
  return true
}

// LoginClloginCliente handler
const handleLoginClloginCliente = async () => {
  if (loginClienteLoading.value) return

  // Limpiar mensajes previos
  loginClienteError.value = ''
  loginClienteSuccess.value = false
  
  // Validar campos antes de enviar
  if (!validateFields()) {
    return
  }
  
  loginClienteLoading.value = true
  
  try {
    const response = await loginCliente({
      email: email.value,
      password: password.value
    })

    if (response?.success) {
      loginClienteSuccess.value = true
      await navigateTo('/')
    } else {
      loginClienteError.value = response?.error || response?.message || 'Credenciales incorrectas. Por favor verifica tu email y contraseña.'
    }
  } catch (err: any) {
    console.error('Error en login:', err)
    
    // Verificar si es un error 401 (Unauthorized)
    const isUnauthorized = err?.status === 401 || 
                          err?.response?.status === 401 || 
                          err?.statusCode === 401 ||
                          err?.data?.status === 401
    
    if (isUnauthorized) {
      // Para errores 401, mostrar solo nuestro mensaje (no activar modal)
      loginClienteError.value = err?.data?.message || err?.message || 'Credenciales incorrectas. Por favor verifica tu email y contraseña.'
    } else {
      loginClienteError.value = 'Error de conexión. Por favor intenta nuevamente.'
    }
  } finally {
    loginClienteLoading.value = false
  }
}

useHead({
  title: 'Iniciar Sesión - Probusiness',
  link: [
    { rel: 'preload', as: 'image', href: '/images/auth/logo-probusiness.svg' }
  ]
})
</script>

