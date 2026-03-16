---
name: nuxt-ui-first
description: Prefer Nuxt UI v3 components first, then reuse project components, then build from scratch. Use when adding UI, forms, buttons, modals, cards, inputs, or any Vue/Nuxt component in this frontend.
---

# Nuxt UI first, luego reutilizar, después desde cero

Sigue siempre este orden al implementar interfaz o componentes.

## 1. Nuxt UI v3 primero

Antes de escribir markup o buscar librerías externas:

1. **Revisar la documentación de Nuxt UI v3** para el patrón que necesitas (botón, input, modal, card, tabla, formulario, etc.).
2. Usar componentes oficiales: `UButton`, `UCard`, `UModal`, `UInput`, `UFormField`, `USelectMenu`, `UTabs`, `UAlert`, `UBadge`, `UAvatar`, `UIcon`, etc.
3. Aprovechar props y slots de Nuxt UI (variant, color, size, icon, etc.) antes de añadir CSS o wrappers propios.

Consulta: https://ui.nuxt.com/ (Nuxt UI v3).

### UModal y useOverlay

**No pongas el contenido del modal inline en la página.** Los modales deben vivir en un **componente aparte** y abrirse con `useOverlay`:

1. Crea un componente (ej. `components/.../MiModal.vue`) que envuelva **solo** `UModal` y su contenido.
2. El componente debe **emitir `close`** para que el overlay se cierre correctamente (p. ej. `UModal @close="$emit('close')"`).
3. En la página o vista: `const overlay = useOverlay()`, `const modal = overlay.create(MiModal, { destroyOnClose: true })`, y para mostrar: `modal.open({ ...props })`.
4. Los overlays se montan fuera del contexto de la página (por `UApp`), así que **no uses provide/inject** desde la página hacia el modal: pasa todo lo necesario por **props** en `modal.open(props)`.

Documentación: https://ui.nuxt.com/composables/use-overlay

## 2. Buscar componentes reutilizables en el proyecto

Si Nuxt UI no cubre el caso o quieres un patrón ya usado en el proyecto:

1. **Buscar en el codebase** componentes existentes en `components/`, `pages/`, o composables que ya resuelvan el caso (por nombre, por uso de UButton/UCard, etc.).
2. Reutilizar ese componente o composable; si hace falta, extenderlo o parametrizarlo en lugar de duplicar lógica.
3. No crear un componente nuevo que repita lo que ya existe.

## 3. Implementar desde cero solo si hace falta

Solo después de comprobar (1) y (2):

- Crear un componente o vista nuevo usando, si es posible, primitivos de Nuxt UI como base.
- Mantener convenciones del proyecto (Tailwind, estructura de carpetas, nombres).

## Resumen

| Orden | Acción |
|-------|--------|
| 1 | Usar componente de **Nuxt UI v3** |
| 2 | **Reutilizar** componente o composable del proyecto |
| 3 | **Implementar desde cero** solo si no hay opción en (1) ni (2) |
