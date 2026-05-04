# Screen 18 — User Profile
## MantleMandate

---

## PURPOSE
Users view and update their personal information, manage connected wallets, configure security settings, and access account controls.

---

## WHAT CHANGED FROM V1
- Brand: "MANTLEMANDATE-SAAS" → "MantleMandate"
- Added "Connected Wallets" section — essential for a DeFi product
- Avatar: allows upload or connect to ENS identity (on-chain avatar)
- "Log Out" button color changed from attention-grabbing red to muted `#484F58`
- Danger Zone remains red — correct

---

## LAYOUT

Standard app layout (sidebar + main content)

**Main content:** Two columns
- Left (profile info + security): 60%
- Right (plan + wallets + danger zone): 40%

**Breadcrumb:**
"Home > User Profile" — Inter Regular 12px, `#484F58`

**Page heading:** "User Profile" — H2, `#F0F6FC`

---

## LEFT COLUMN

### Profile Header

```
┌─────────────────────────────────────────────────────────┐
│  [Avatar 80px]  John Michael                            │
│                 john@example.com                        │
│                 [Upload Photo]  [Connect ENS]           │
└─────────────────────────────────────────────────────────┘
```

**Avatar:**
- 80px circle
- Default: colored circle with initials (e.g. "JM" on `#0066FF`)
- Uploaded: User's photo
- ENS connected: Shows on-chain avatar from ENS record
- Hover: "Change" overlay appears

**Upload Photo button:** Ghost button, small
**Connect ENS:** Ghost button with ENS logo icon — "Use your on-chain identity"
- Tooltip: "Connect your ENS name to use your Web3 identity across MantleMandate"

---

### Personal Information

**Heading:** "Personal Information" — H4, `#F0F6FC`

Fields (editable, all have "Edit" icon that activates field):

- Full Name: "John Michael"
- Email Address: "john@example.com"  [Verified ✓]
- Date of Birth: "Jan 15, 1990" (optional)
- Phone Number: "+1 (555) 000-0000" (optional, for 2FA)
- Time Zone: "UTC+2 (Eastern European Time)" — dropdown
- Language: "English" — dropdown

Each field:
- Displayed as read-only by default (Inter Regular 14px, `#F0F6FC`)
- "Edit" pencil icon right-aligned (`#8B949E`, hover `#F0F6FC`)
- Click "Edit" → field becomes editable input, shows "Save" + "Cancel" buttons inline

**Save Changes button** (appears below form when any field is edited):
```
[ Save Changes ]    [ Cancel ]
```

---

### Security Settings

**Heading:** "Security Settings" — H4, `#F0F6FC`

**Two-Factor Authentication:**
```
Two-Factor Authentication (2FA)
[● Enabled]  ·  SMS to +1 (555) 000-0000  ·  [Change 2FA method]
```
Or if disabled:
```
[Disabled — Enable 2FA for better security →]
```

**Change Password:**
```
Password  ·  Last changed: 3 months ago  ·  [Change Password]
```
"Change Password" → opens inline form with: Current password / New password / Confirm new password

**Active Sessions:**
```
Active Sessions (2)
  → Chrome on MacOS — San Francisco  ·  Active now  [Revoke]
  → Firefox on Windows — New York  ·  2 hours ago  [Revoke]
  [ Revoke All Other Sessions ]
```
"Revoke" buttons: Ghost small, red text (not full red fill — it's destructive but not primary action)

---

## RIGHT COLUMN

### Current Plan

```
┌───────────────────────┐
│  STRATEGIST           │
│  $99 / month          │
│  Since: May 5, 2026   │
│  Renews: Jun 4, 2026  │
│  [Manage Plan]        │
└───────────────────────┘
```

---

### Connected Wallets (NEW — not in v1)

**Heading:** "Connected Wallets" — H4, `#F0F6FC`
**Sub-text:** "Wallets used for agent execution. All wallets remain non-custodial." — Body 12px, `#8B949E`

**Connected wallet list:**

```
┌──────────────────────────────────────────────────────┐
│  [MetaMask icon]  0x1a2b...9f3c                       │
│  Mantle Network  ·  Primary Execution Wallet          │
│                                    [Set Primary] [Remove]│
└──────────────────────────────────────────────────────┘
```

- Address: JetBrains Mono 13px, `#F0F6FC`
- Network: Label Caps 10px, `#8B949E`
- Role: "Primary Execution Wallet" — Label Caps 10px, `#0066FF`
- [Remove]: Ghost button, small, red text — triggers confirmation modal

**Add wallet button:**
```
[ + Connect Another Wallet ]
```
Ghost button, full width
→ Opens wallet connector modal (MetaMask / WalletConnect / Coinbase)

**Note below:**
"Your private keys are never stored by MantleMandate. We only request transaction signing permissions."
Inter Regular 12px, `#484F58`

---

### Notification Preferences (compact)

**Heading:** "Notifications" — H4, `#F0F6FC`

Toggle rows:
```
Email — Trade executions          [● ON]
Email — Weekly summary            [○ OFF]
Email — System updates            [● ON]
In-app — All alerts               [● ON] (locked)
Telegram webhook                  [ Configure → ]
```

---

### Danger Zone

**Heading:** "Danger Zone" — H4, `#EF4444`
**Background:** `#161B22`, border: 1px solid `#EF4444` at 30% opacity, border-radius 8px, padding 20px

**Item 1: Delete Account**
- Label: "Delete Account"
- Description: "This will permanently delete all your mandates, agents, and data. This cannot be undone."
- Button: [ Delete Account ] — red ghost button (border `#EF4444`, text `#EF4444`)
- → Confirmation modal required: "Type DELETE to confirm"

**Item 2: Revoke All Agent Access**
- Label: "Revoke All Agent Access"
- Description: "Immediately stops all agents and revokes all execution permissions. Mandates are preserved."
- Button: [ Revoke All Access ] — red ghost button

---

### Log Out (bottom of right column, NOT in Danger Zone)

```
[ Log Out ]
```
- Ghost button, Inter Regular 13px, `#8B949E` text (MUTED — not red)
- Danger Zone is already red — log out must NOT compete with it
