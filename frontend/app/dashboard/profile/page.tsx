'use client'

import { useState } from 'react'
import { Pencil, Plus, LogOut } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useLogout } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

function Toggle({ on, locked }: { on: boolean; locked?: boolean }) {
  const [state, setState] = useState(on)
  return (
    <button
      onClick={() => !locked && setState(v => !v)}
      className={cn('relative h-5 w-9 rounded-full transition-colors shrink-0', state ? 'bg-primary' : 'bg-surface border border-border', locked && 'cursor-not-allowed opacity-70')}
    >
      <span className={cn('absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform shadow-sm', state ? 'translate-x-4' : 'translate-x-0.5')} />
    </button>
  )
}

function AvatarCircle({ name }: { name: string }) {
  const initials = name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
  return (
    <div className="h-20 w-20 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold shrink-0">
      {initials}
    </div>
  )
}

function EditableField({ label, value, type = 'text' }: { label: string; value: string; type?: string }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(value)
  return (
    <div className="flex items-center gap-4 py-2 border-b border-border last:border-0">
      <span className="text-sm text-text-secondary w-36 shrink-0">{label}</span>
      {editing ? (
        <div className="flex items-center gap-2 flex-1">
          <input
            type={type}
            value={val}
            onChange={e => setVal(e.target.value)}
            className="flex-1 bg-input border border-border rounded-md px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:border-primary"
            autoFocus
          />
          <button onClick={() => setEditing(false)} className="text-xs bg-primary hover:bg-primary-hover text-white px-2 py-1 rounded transition-colors">Save</button>
          <button onClick={() => setEditing(false)} className="text-xs text-text-secondary hover:text-text-primary">Cancel</button>
        </div>
      ) : (
        <div className="flex items-center gap-2 flex-1">
          <span className="text-sm text-text-primary flex-1">{val}</span>
          <button onClick={() => setEditing(true)} className="text-text-disabled hover:text-text-primary transition-colors">
            <Pencil className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}

export default function ProfilePage() {
  const user   = useAuthStore(s => s.user)
  const logout = useLogout()

  const [deleteInput, setDel] = useState('')

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <nav className="text-xs text-text-disabled">Home &rsaquo; User Profile</nav>
      <h2 className="text-2xl font-bold text-text-primary">User Profile</h2>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left (60%) */}
        <div className="lg:col-span-3 space-y-5">
          {/* Profile header */}
          <div className="bg-card border border-border rounded-lg p-5">
            <div className="flex items-center gap-4">
              <AvatarCircle name={user?.name ?? 'User'} />
              <div>
                <p className="text-lg font-bold text-text-primary">{user?.name ?? '—'}</p>
                <p className="text-sm text-text-secondary">{user?.email ?? '—'}</p>
                <div className="flex gap-2 mt-2">
                  <button className="text-xs border border-border rounded px-2 py-1 text-text-secondary hover:text-text-primary hover:border-primary transition-colors">Upload Photo</button>
                  <button className="text-xs border border-border rounded px-2 py-1 text-text-secondary hover:text-text-primary hover:border-primary transition-colors">Connect ENS</button>
                </div>
              </div>
            </div>
          </div>

          {/* Personal info */}
          <div className="bg-card border border-border rounded-lg p-5 space-y-1">
            <h4 className="text-sm font-semibold text-text-primary mb-3">Personal Information</h4>
            <EditableField label="Full Name"      value={user?.name ?? ''} />
            <EditableField label="Email Address"  value={user?.email ?? ''} type="email" />
            <EditableField label="Date of Birth"  value="Jan 15, 1990" />
            <EditableField label="Phone Number"   value="+1 (555) 000-0000" />
            <EditableField label="Time Zone"      value="UTC+2" />
            <EditableField label="Language"       value="English" />
          </div>

          {/* Security */}
          <div className="bg-card border border-border rounded-lg p-5 space-y-4">
            <h4 className="text-sm font-semibold text-text-primary">Security Settings</h4>

            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-text-primary">Two-Factor Authentication (2FA)</p>
                <p className="text-xs text-text-secondary mt-0.5">SMS to +1 (555) 000-0000</p>
              </div>
              <div className="flex gap-2">
                <span className="text-[10px] bg-success-bg text-success px-2 py-0.5 rounded font-semibold">ENABLED</span>
                <button className="text-xs border border-border rounded px-2 py-1 text-text-secondary hover:border-primary transition-colors">Change Method</button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-border pt-4">
              <div>
                <p className="text-sm text-text-primary">Password</p>
                <p className="text-xs text-text-secondary mt-0.5">Last changed: 3 months ago</p>
              </div>
              <button className="text-xs border border-border rounded px-2 py-1 text-text-secondary hover:border-primary hover:text-text-primary transition-colors">Change Password</button>
            </div>

            <div className="border-t border-border pt-4 space-y-2">
              <p className="text-sm text-text-primary">Active Sessions (2)</p>
              {[
                { browser: 'Chrome on macOS',   loc: 'San Francisco', when: 'Active now' },
                { browser: 'Firefox on Windows', loc: 'New York',      when: '2 hours ago' },
              ].map(s => (
                <div key={s.browser} className="flex items-center justify-between py-1.5">
                  <div>
                    <p className="text-xs text-text-primary">{s.browser}</p>
                    <p className="text-[11px] text-text-disabled">{s.loc} · {s.when}</p>
                  </div>
                  <button className="text-xs text-error hover:underline">Revoke</button>
                </div>
              ))}
              <button className="text-xs text-error hover:underline mt-1">Revoke All Other Sessions</button>
            </div>
          </div>
        </div>

        {/* Right (40%) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Plan */}
          <div className="bg-card border border-border rounded-lg p-5 space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-primary">{(user?.plan ?? 'operator').toUpperCase()}</p>
            <p className="text-xl font-bold text-text-primary">$99 / month</p>
            <p className="text-xs text-text-secondary">Since: May 5, 2026</p>
            <p className="text-xs text-text-secondary">Renews: Jun 4, 2026</p>
            <button className="mt-3 bg-primary hover:bg-primary-hover text-white text-xs px-3 py-1.5 rounded-md transition-colors">Manage Plan</button>
          </div>

          {/* Wallets */}
          <div className="bg-card border border-border rounded-lg p-5 space-y-3">
            <div>
              <h4 className="text-sm font-semibold text-text-primary">Connected Wallets</h4>
              <p className="text-xs text-text-secondary mt-0.5">All wallets remain non-custodial.</p>
            </div>
            <div className="border border-border rounded-md p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-mono text-xs text-text-primary">0x1a2b...9f3c</p>
                  <p className="text-[10px] text-text-disabled mt-0.5">MANTLE NETWORK</p>
                  <p className="text-[10px] font-semibold text-primary mt-0.5">PRIMARY EXECUTION WALLET</p>
                </div>
                <div className="flex gap-1">
                  <button className="text-[10px] border border-border rounded px-1.5 py-0.5 text-text-secondary hover:text-text-primary transition-colors">Set Primary</button>
                  <button className="text-[10px] border border-error/50 rounded px-1.5 py-0.5 text-error hover:bg-error-bg transition-colors">Remove</button>
                </div>
              </div>
            </div>
            <button className="w-full flex items-center justify-center gap-1.5 border border-dashed border-border rounded-md py-2 text-xs text-text-secondary hover:text-text-primary hover:border-primary transition-colors">
              <Plus className="h-3.5 w-3.5" />
              Connect Another Wallet
            </button>
            <p className="text-[11px] text-text-disabled">Your private keys are never stored by MantleMandate.</p>
          </div>

          {/* Notifications */}
          <div className="bg-card border border-border rounded-lg p-5 space-y-3">
            <h4 className="text-sm font-semibold text-text-primary">Notifications</h4>
            {[
              ['Email — Trade executions', true, false],
              ['Email — Weekly summary',   false, false],
              ['Email — System updates',   true, false],
              ['In-app — All alerts',      true, true],
            ].map(([lbl, on, locked]) => (
              <div key={String(lbl)} className="flex items-center justify-between">
                <span className="text-xs text-text-secondary">{String(lbl)}</span>
                <Toggle on={Boolean(on)} locked={Boolean(locked)} />
              </div>
            ))}
            <button className="text-xs text-text-link hover:text-text-link-hover">Configure Telegram →</button>
          </div>

          {/* Danger zone */}
          <div className="border border-error/30 bg-card rounded-lg p-5 space-y-4">
            <h4 className="text-sm font-semibold text-error">Danger Zone</h4>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-text-primary">Revoke All Agent Access</p>
                <p className="text-xs text-text-secondary mt-0.5">Immediately stops all agents. Mandates are preserved.</p>
                <button className="mt-2 text-xs border border-error text-error rounded-md px-3 py-1.5 hover:bg-error-bg transition-colors">Revoke All Access</button>
              </div>
              <div className="border-t border-border pt-3">
                <p className="text-sm font-medium text-text-primary">Delete Account</p>
                <p className="text-xs text-text-secondary mt-0.5">Permanently deletes all mandates, agents, and data. Cannot be undone.</p>
                <input
                  value={deleteInput}
                  onChange={e => setDel(e.target.value)}
                  placeholder='Type "DELETE" to confirm'
                  className="mt-2 bg-input border border-border rounded-md px-3 py-1.5 text-xs text-text-primary w-full focus:outline-none focus:border-error"
                />
                <button
                  disabled={deleteInput !== 'DELETE'}
                  className="mt-2 text-xs border border-error text-error rounded-md px-3 py-1.5 hover:bg-error-bg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>

          {/* Log out */}
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-1.5 border border-border rounded-md py-2.5 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Log Out
          </button>
        </div>
      </div>
    </div>
  )
}
