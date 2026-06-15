// French translations for the Settings page (frontend/app/dashboard/settings/page.tsx).
export const fr: Record<string, string> = {
  // Breadcrumb / page
  'Home': 'Accueil',
  'Settings': 'Paramètres',

  // Language names (shown in the Language picker)
  'English': 'Anglais',
  'French': 'Français',
  'Spanish': 'Espagnol',
  'German': 'Allemand',
  'Chinese (Simplified)': 'Chinois (simplifié)',
  'Japanese': 'Japonais',

  // Nav groups
  'Account': 'Compte',
  'Preferences': 'Préférences',
  'Security': 'Sécurité',
  'Billing': 'Facturation',
  'Danger Zone': 'Zone de danger',

  // Nav items
  'General': 'Général',
  'Profile': 'Profil',
  'Password': 'Mot de passe',
  'Notifications': 'Notifications',
  'Display': 'Affichage',
  'Language': 'Langue',
  'Two-Factor Auth': 'Authentification à deux facteurs',
  'Active Sessions': 'Sessions actives',
  'API Keys': 'Clés API',
  'Plan & Billing': 'Forfait et facturation',
  'Usage': 'Utilisation',

  // Shared actions
  'Save Changes': 'Enregistrer les modifications',
  'Cancel': 'Annuler',
  'Change': 'Modifier',
  'Save': 'Enregistrer',

  // General
  'Account Information': 'Informations du compte',
  'Email': 'E-mail',
  'Verified ✓': 'Vérifié ✓',
  'Change Email': "Changer l'e-mail",
  'Username': "Nom d'utilisateur",
  'Time Zone': 'Fuseau horaire',

  // Password
  'Change Password': 'Changer le mot de passe',
  'Current password': 'Mot de passe actuel',
  'New password': 'Nouveau mot de passe',
  'Confirm new password': 'Confirmer le nouveau mot de passe',
  'Update Password': 'Mettre à jour le mot de passe',

  // Notifications
  'Notification Preferences': 'Préférences de notification',
  'Control how MantleMandate notifies you about your agents and trades.':
    'Contrôlez la façon dont MantleMandate vous informe de vos agents et transactions.',
  'Email Notifications': 'Notifications par e-mail',
  'Trade executions': 'Exécutions de transactions',
  'Trade failures': 'Échecs de transactions',
  'Drawdown alerts': 'Alertes de baisse',
  'Mandate breach alerts': 'Alertes de violation de mandat',
  'Daily performance summary': 'Résumé quotidien des performances',
  'Weekly summary': 'Résumé hebdomadaire',
  'System updates': 'Mises à jour du système',
  'Marketing emails': 'E-mails marketing',
  'In-App Notifications': "Notifications dans l'application",
  'All system alerts': 'Toutes les alertes système',
  'In-app alerts cannot be disabled for system-critical events (errors, mandate breaches).':
    "Les alertes dans l'application ne peuvent pas être désactivées pour les événements critiques du système (erreurs, violations de mandat).",
  'Telegram Webhook': 'Webhook Telegram',
  'Test Connection': 'Tester la connexion',
  'Connected ✓': 'Connecté ✓',
  'Connection failed': 'Connexion échouée',

  // Display
  'Display Preferences': "Préférences d'affichage",
  'Default theme': 'Thème par défaut',
  'Dark Mode': 'Mode sombre',
  'Light Mode': 'Mode clair',
  'System': 'Système',
  'Dashboard layout': 'Mise en page du tableau de bord',
  'expanded': 'étendue',
  'compact': 'compacte',
  'Default time range': 'Plage de temps par défaut',
  '1 Week': '1 semaine',
  '1 Month': '1 mois',
  '3 Months': '3 mois',
  '1 Year': '1 an',
  'Date format': 'Format de date',
  'Number format': 'Format des nombres',
  'Currency display': 'Devise affichée',

  // Language tab
  'Interface language': 'Langue de l\'interface',
  'More languages are coming soon. Your preference is saved and will be applied automatically once they ship.':
    "D'autres langues arrivent bientôt. Votre préférence est enregistrée et sera appliquée automatiquement dès leur disponibilité.",

  // 2FA
  'Two-Factor Authentication': 'Authentification à deux facteurs',
  'Loading…': 'Chargement…',
  'ENABLED ✓': 'ACTIVÉE ✓',
  'NOT ENABLED': 'NON ACTIVÉE',
  'Disable 2FA': "Désactiver l'A2F",
  'Enable 2FA': "Activer l'A2F",
  'Method:': 'Méthode :',
  'Enrolled:': 'Activée le :',
  'Authenticator app (TOTP)': "Application d'authentification (TOTP)",
  'Add an extra layer of security to your account using a TOTP authenticator app (e.g. Google Authenticator, 1Password).':
    "Ajoutez une couche de sécurité supplémentaire à votre compte avec une application d'authentification TOTP (par ex. Google Authenticator, 1Password).",
  'Disable Two-Factor Authentication': "Désactiver l'authentification à deux facteurs",
  'Disabling 2FA will make your account less secure. Are you sure you want to continue?':
    "La désactivation de l'A2F rendra votre compte moins sécurisé. Voulez-vous vraiment continuer ?",
  'Enable Two-Factor Authentication': "Activer l'authentification à deux facteurs",
  'Scan this QR code with your authenticator app, then enter the 6-digit code it generates.':
    "Scannez ce code QR avec votre application d'authentification, puis saisissez le code à 6 chiffres généré.",
  'Or enter this code manually': 'Ou saisissez ce code manuellement',
  'Verification code': 'Code de vérification',
  'Verifying…': 'Vérification…',
  'Verify & Enable': 'Vérifier et activer',

  // Active Sessions
  'Sign Out Other Sessions': 'Déconnecter les autres sessions',
  'This device': 'Cet appareil',
  'Current': 'Actuelle',
  'Last sign-in:': 'Dernière connexion :',
  'Active now': 'Actif maintenant',
  '"Sign Out Other Sessions" revokes access from all devices except this one.':
    '« Déconnecter les autres sessions » révoque l\'accès de tous les appareils sauf celui-ci.',

  // API Keys
  'API keys allow external applications to interact with MantleMandate.':
    'Les clés API permettent à des applications externes d\'interagir avec MantleMandate.',
  'Generate New API Key': 'Générer une nouvelle clé API',
  'NAME': 'NOM',
  'CREATED': 'CRÉÉE',
  'LAST USED': 'DERNIÈRE UTILISATION',
  'PERMISSIONS': 'PERMISSIONS',
  'ACTIONS': 'ACTIONS',
  'Never': 'Jamais',
  'Revoke': 'Révoquer',
  'No API keys yet.': 'Aucune clé API pour le moment.',
  'API Key Generated': 'Clé API générée',
  'Copy your API key now. It will': 'Copiez votre clé API maintenant. Elle ne',
  'not be shown again.': 'sera plus affichée par la suite.',
  'Copied!': 'Copié !',
  'Copy Key': 'Copier la clé',
  'Done': 'Terminé',
  'Key name': 'Nom de la clé',
  'e.g. Trading Bot Integration': 'ex. Intégration bot de trading',
  'Permissions': 'Permissions',
  'Read only': 'Lecture seule',
  'Read + Write': 'Lecture + écriture',
  'Generate': 'Générer',

  // Plan & Billing (settings redirect)
  'Manage your subscription plan and payment methods on the Billing page.':
    'Gérez votre forfait et vos moyens de paiement sur la page Facturation.',
  'Go to Billing page': 'Aller à la page Facturation',

  // Usage
  'Active Agents': 'Agents actifs',
  'Mandates': 'Mandats',
  'Trades Executed': 'Transactions exécutées',
  'Manage plan': 'Gérer le forfait',

  // Danger Zone
  'Pause All Agents': 'Mettre en pause tous les agents',
  'Immediately pause all active AI agents. Mandates are preserved.':
    'Met immédiatement en pause tous les agents IA actifs. Les mandats sont conservés.',
  'Delete All Mandates': 'Supprimer tous les mandats',
  'Permanently delete all mandates and their associated agents. This cannot be undone.':
    'Supprime définitivement tous les mandats et leurs agents associés. Action irréversible.',
  'Delete Account': 'Supprimer le compte',
  'Permanently delete your account, mandates, agents, and all data.':
    'Supprime définitivement votre compte, vos mandats, vos agents et toutes vos données.',
  'Type': 'Saisissez',
  'to confirm': 'pour confirmer',

  // Toasts
  'Settings saved': 'Paramètres enregistrés',
  'Changes discarded': 'Modifications annulées',
  'Display preferences saved': "Préférences d'affichage enregistrées",
  'Language preference saved': 'Préférence de langue enregistrée',
  'Notification preferences saved': 'Préférences de notification enregistrées',
  'Telegram webhook saved': 'Webhook Telegram enregistré',
  'Signed out of all other sessions': 'Déconnecté de toutes les autres sessions',
  'Two-factor authentication enabled': 'Authentification à deux facteurs activée',
  'Two-factor authentication disabled': 'Authentification à deux facteurs désactivée',
  'Password updated': 'Mot de passe mis à jour',
}
