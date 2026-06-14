'use client'

import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'

export interface Invoice {
  id:            string
  plan:          string
  amount:        number
  currency:      string
  paymentMethod: 'crypto' | 'card' | 'bank'
  status:        'pending' | 'paid' | 'failed'
  txHash:        string | null
  createdAt:     string
}

interface InvoiceRow {
  id:             string
  plan:           string
  amount:         number
  currency:       string
  payment_method: 'crypto' | 'card' | 'bank'
  status:         'pending' | 'paid' | 'failed'
  tx_hash:        string | null
  created_at:     string
}

function rowToInvoice(row: InvoiceRow): Invoice {
  return {
    id:            row.id,
    plan:          row.plan,
    amount:        row.amount,
    currency:      row.currency,
    paymentMethod: row.payment_method,
    status:        row.status,
    txHash:        row.tx_hash,
    createdAt:     row.created_at,
  }
}

export function useInvoices() {
  const { user } = useAuthStore()

  return useQuery<Invoice[]>({
    queryKey: ['invoices', user?.id],
    queryFn: async () => {
      if (!user) return []
      const { data, error } = await supabase
        .from('invoices')
        .select('id, plan, amount, currency, payment_method, status, tx_hash, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (error || !data) return []
      return (data as InvoiceRow[]).map(rowToInvoice)
    },
    enabled: !!user,
    staleTime: 30_000,
  })
}
