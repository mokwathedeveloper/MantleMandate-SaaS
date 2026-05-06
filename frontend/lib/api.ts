import axios, { AxiosError } from 'axios'

// ── camelCase transformer ─────────────────────────────────────────────────────
// Backend returns snake_case; frontend types are camelCase.
// Transform every response body recursively so field accesses work correctly.

function toCamel(s: string): string {
  return s.replace(/_([a-z0-9])/g, (_, c: string) => c.toUpperCase())
}

function camelizeKeys(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(camelizeKeys)
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj as Record<string, unknown>).map(([k, v]) => [
        toCamel(k),
        camelizeKeys(v),
      ])
    )
  }
  return obj
}

// ── axios instance ────────────────────────────────────────────────────────────

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
})

// ── request: attach JWT ───────────────────────────────────────────────────────

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── response: camelCase + token refresh ──────────────────────────────────────

let refreshing: Promise<string> | null = null

api.interceptors.response.use(
  (res) => {
    res.data = camelizeKeys(res.data)
    return res
  },
  async (error: AxiosError) => {
    const original = error.config as typeof error.config & { _retry?: boolean }

    // 401 with a refresh token available → try to refresh once
    if (
      error.response?.status === 401 &&
      !original._retry &&
      typeof window !== 'undefined'
    ) {
      const refreshToken = localStorage.getItem('refresh_token')
      if (refreshToken) {
        original._retry = true

        try {
          // Deduplicate concurrent 401s — only one refresh request at a time
          if (!refreshing) {
            refreshing = axios
              .post(`${api.defaults.baseURL}/auth/refresh`, null, {
                headers: { Authorization: `Bearer ${refreshToken}` },
              })
              .then((r) => (r.data as { data: { access_token: string } }).data.access_token)
              .finally(() => { refreshing = null })
          }

          const newToken = await refreshing
          localStorage.setItem('access_token', newToken)
          original!.headers!.Authorization = `Bearer ${newToken}`
          return api(original!)
        } catch {
          // Refresh failed — clear tokens and redirect to login
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          window.location.href = '/login'
        }
      } else {
        // No refresh token → straight to login
        localStorage.removeItem('access_token')
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

export default api
