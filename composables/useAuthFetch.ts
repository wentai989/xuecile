export const useAuthFetch = <T = any>(url: string, options: any = {}) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

  const headers = {
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  }

  return $fetch<T>(url, {
    ...options,
    headers,
    async onResponseError({ response }) {
      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          window.location.href = '/login'
        }
      }
    }
  })
}