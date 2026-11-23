/**
 * «Ver como cliente» (Coordinación, desde Entregas): la sesión vive solo en esa pestaña (sessionStorage) y no toca
 * la sesión normal del portal, que sigue en localStorage.
 */
const VER_COMO_KEY = 'ver_como_cliente'

export function esVerComoCliente(): boolean {
  return process.client && sessionStorage.getItem(VER_COMO_KEY) === '1'
}

export function authStorage(): Storage {
  return esVerComoCliente() ? sessionStorage : localStorage
}

export function activarVerComoCliente(): void {
  sessionStorage.setItem(VER_COMO_KEY, '1')
}

export function desactivarVerComoCliente(): void {
  sessionStorage.removeItem(VER_COMO_KEY)
}
