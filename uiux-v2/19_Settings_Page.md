# Screen 19 — Settings Page
## MantleMandate

---

## PURPOSE
Users configure account-wide preferences, notification settings, privacy controls, and security options.

---

## WHAT CHANGED FROM V1
- Brand: "MANTLEMANDATE-SAAS" → "MantleMandate"
- Added Notification Preferences section (was in docs, missing from mockup)
- Settings sidebar navigation added for quick section jumping
- "Renews on [date]" added to plan display

---

## LAYOUT

Standard app layout (sidebar + main content)

**Settings page uses its own sub-navigation:**
Left sub-nav (within main content, 200px) + Settings content (fills remaining space)

**Breadcrumb:** "Home > Settings" — Inter Regular 12px, `#484F58`

**Page heading:** "Settings" — H2, `#F0F6FC`

---

## SETTINGS SUB-NAVIGATION (left, 200px)

```
Account
  General
  Profile           → links to User Profile page
  Password

Preferences
  Notifications
  Display
  Language

Security
  Two-Factor Auth
  Active Sessions
  API Keys

Billing
  Plan & Billing     → links to Payment Methods page
  Usage

Danger Zone
```

- Active section: `#0066FF` text, left border indicator
- Section labels: Label Caps 10px, `#484F58`
- Items: Inter Medium 13px, `#8B949E` (inactive) / `#F0F6FC` (active)

---

## SETTINGS CONTENT AREA

### SECTION: Account — General

**Account Information:**
```
Email:      john@example.com  [Verified ✓]  [Change Email]
Username:   john_michael                    [Change]
Time Zone:  UTC+2 (Eastern European Time)  [Change]
Language:   English                         [Change]
```

Each row: label (160px wide, `#8B949E`) + value (`#F0F6FC`) + action button (right-aligned)
Action buttons: Ghost small, 28px height

---

### SECTION: Preferences — Notifications

**Heading:** "Notification Preferences" — H4, `#F0F6FC`
**Sub-text:** "Control how MantleMandate notifies you about your agents and trades."

**Email Notifications:**

Toggle rows (label left, toggle right):
```
Trade executions            [● ON]
Trade failures              [● ON]
Drawdown alerts             [● ON]
Mandate breach alerts       [● ON]
Daily performance summary   [○ OFF]
Weekly summary              [○ OFF]
System updates              [● ON]
Marketing emails            [○ OFF]
```

**In-App Notifications:**
```
All system alerts           [● ON — cannot disable]
```
Note below: "In-app alerts cannot be disabled for system-critical events (errors, mandate breaches)."
Inter Regular 12px, `#484F58`, italic

**Telegram Webhook:**
```
Webhook URL:  [ https://hooks.telegram... ]    [Test Connection]  [Save]
```
Input: full width minus buttons, JetBrains Mono 12px (technical field)
If configured and working: green "Connected ✓" badge right of input
If configured but failing: red "Connection failed" badge

---

### SECTION: Preferences — Display

```
Default theme:     [● Dark Mode]  ○ Light Mode  ○ System
Dashboard layout:  [● Expanded]  ○ Compact
Default time range: [● 1 Month ▾]
Date format:        [● MM/DD/YYYY ▾]
Number format:      [● 1,234.56 ▾]
Currency display:   [● USD ($) ▾]
```

All rows: label (left) + control (right)
Controls: toggles or dropdowns as appropriate

---

### SECTION: Security — Two-Factor Authentication

**Current status:** "Enabled — SMS to +1 (555) 000-0000"

```
Status:   ENABLED ✓   [Disable 2FA]   [Change Method]
Method:   SMS (phone number ending in 0000)
Backup:   Recovery codes generated   [View Codes]
```

"[Disable 2FA]": Red ghost button — destructive, requires confirmation modal
"[Change Method]": Ghost button

---

### SECTION: Security — API Keys

**Heading:** "API Keys" — H4, `#F0F6FC`
**Sub-text:** "API keys allow external applications to interact with MantleMandate."

**Existing keys table:**

| Name | Created | Last Used | Permissions | Actions |
|------|---------|-----------|-------------|---------|
| Bybit Integration | Apr 1, 2026 | 2 min ago | Read only | [Revoke] |
| Custom Dashboard | Mar 15, 2026 | 1 day ago | Read only | [Revoke] |

**Create new API key button:**
```
[ + Generate New API Key ]
```
Ghost button
→ Modal: Name input + Permission selection (Read only / Read + Write) + "Generate"
→ Shows key ONCE after creation with "Copy Key" — key cannot be retrieved again

---

### SECTION: Danger Zone

**Same styling as User Profile Danger Zone:**
Border 1px `#EF4444` at 30% opacity, `#161B22` background

**Items:**

1. Pause All Agents
   - Description: "Immediately pause all active AI agents. Mandates are preserved."
   - Button: [ Pause All Agents ] — orange ghost button (paused = orange, not red)

2. Delete All Mandates
   - Description: "Permanently delete all mandates and their associated agents. This cannot be undone."
   - Button: [ Delete All Mandates ] — red ghost button
   - Requires confirmation: type "DELETE ALL" to confirm

3. Delete Account
   - Description: "Permanently delete your account, mandates, agents, and all data."
   - Button: [ Delete Account ] — red ghost button
   - Requires confirmation: type "DELETE" to confirm

---

## SAVE BEHAVIOR

Settings save on a per-section basis:
- Each section has its own "Save Changes" + "Cancel" button group at the bottom of the section
- Changes in one section do not affect another
- On save: brief success toast "Settings saved" (3 second, bottom-right of screen)

Toast style:
```
✓ Settings saved
```
- Background: `#0D2818`, border: 1px `#22C55E`, border-radius 6px, padding 12px 16px, bottom-right, 3 sec
