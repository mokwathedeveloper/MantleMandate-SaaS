import axios, { AxiosError } from 'axios'

// ── camelCase transformer ─────────────────────────────────────────────────────

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

// ── In-memory token store (never touches localStorage / sessionStorage) ───────
// Tokens live only in module scope — cleared on full page reload.
// This prevents XSS scripts from reading tokens out of browser storage.

const _mem: { access: string | null; refresh: string | null } = {
  access:  null,
  refresh: null,
}

export const tokenStore = {
  getAccess:     () => _mem.access,
  getRefresh:    () => _mem.refresh,
  setAccess:     (t: string) => { _mem.access  = t },
  setRefresh:    (t: string) => { _mem.refresh = t },
  clearAccess:   () => { _mem.access  = null },
  clearAll:      () => { _mem.access  = null; _mem.refresh = null },
}

// ── axios instance ────────────────────────────────────────────────────────────

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
})

// ── request: attach JWT ───────────────────────────────────────────────────────

api.interceptors.request.use((config) => {
  const token = tokenStore.getAccess()
  if (token) config.headers.Authorization = `Bearer ${token}`
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

    if (
      error.response?.status === 401 &&
      !original._retry
    ) {
      const refreshToken = tokenStore.getRefresh()
      if (refreshToken) {
        original._retry = true

        try {
          if (!refreshing) {
            refreshing = axios
              .post(`${api.defaults.baseURL}/auth/refresh`, null, {
                headers: { Authorization: `Bearer ${refreshToken}` },
              })
              .then((r) => (r.data as { data: { access_token: string } }).data.access_token)
              .finally(() => { refreshing = null })
          }

          const newToken = await refreshing
          tokenStore.setAccess(newToken)
          original!.headers!.Authorization = `Bearer ${newToken}`
          return api(original!)
        } catch {
          tokenStore.clearAll()
          if (typeof window !== 'undefined') window.location.href = '/login'
        }
      } else {
        tokenStore.clearAll()
        if (typeof window !== 'undefined') window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

export default api
