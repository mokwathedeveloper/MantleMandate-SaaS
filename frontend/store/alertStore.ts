import { create } from 'zustand'

export interface AlertItem {
  id: string
  title: string
  message: string
  severity: 'high' | 'medium' | 'low'
  alertType: string
  isRead: boolean
  createdAt: string
}

interface AlertState {
  alerts: AlertItem[]
  unreadCount: number
  addAlert: (alert: AlertItem) => void
  markRead: (id: string) => void
  markAllRead: () => void
}

export const useAlertStore = create<AlertState>((set) => ({
  alerts: [],
  unreadCount: 0,
  addAlert: (alert) =>
    set((state) => ({
      alerts: [alert, ...state.alerts],
      unreadCount: state.unreadCount + (alert.isRead ? 0 : 1),
    })),
  markRead: (id) =>
    set((state) => ({
      alerts: state.alerts.map((a) => (a.id === id ? { ...a, isRead: true } : a)),
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),
  markAllRead: () =>
    set((state) => ({
      alerts: state.alerts.map((a) => ({ ...a, isRead: true })),
      unreadCount: 0,
    })),
}))
