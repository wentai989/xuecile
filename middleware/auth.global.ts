import { defineNuxtRouteMiddleware, navigateTo } from 'nuxt/app'
import type { RouteLocationNormalized } from 'vue-router'

export default defineNuxtRouteMiddleware((to: RouteLocationNormalized) => {
  if (to.path === '/login') return
  if (import.meta.client) {
    const token = localStorage.getItem('token')
    if (!token) {
      return navigateTo('/login')
    }
  }
})
