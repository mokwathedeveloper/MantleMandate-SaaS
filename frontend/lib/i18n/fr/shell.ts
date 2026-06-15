// French translations for the global app shell:
// Sidebar, TopBar, RightRail, MobileBottomNav, AlertsPanel.
// Keys already covered in fr/settings.ts (Home, Mandates, Settings, Billing,
// Account, Profile, Notifications, Cancel) are intentionally NOT redefined here.
export const fr: Record<string, string> = {
  // Sidebar nav labels
  'Dashboard': 'Tableau de bord',
  'Portfolio': 'Portefeuille',
  'Trades': 'Transactions',
  'On-Chain Audit': 'Audit on-chain',
  'AI Agents': 'Agents IA',
  'Risk Engine': 'Moteur de risque',
  'Protocols': 'Protocoles',
  'Users': 'Utilisateurs',
  'Wallets': 'Portefeuilles',
  'Alerts': 'Alertes',
  'Reports': 'Rapports',
  'Docs': 'Documentation',
  'Support': 'Assistance',

  // Sidebar section titles
  'Main': 'Principal',
  'Agents': 'Agents',
  'User Management': 'Gestion des utilisateurs',

  // PLAN labels (Sidebar + TopBar)
  'Operator': 'Opérateur',
  'Strategist': 'Stratège',
  'Institution': 'Institution',

  'Close menu': 'Fermer le menu',
  'Sign out': 'Se déconnecter',
  'Your AI · Your Rules': 'Votre IA · Vos règles',

  // TopBar breadcrumb route segments
  'Deploy': 'Déployer',
  'Api': 'API',
  'Audit': 'Audit',
  'Edit': 'Modifier',
  'New': 'Nouveau',
  'Risk': 'Risque',

  // TopBar
  'Open menu': 'Ouvrir le menu',
  'Connect': 'Connecter',
  'Connected': 'Connecté',
  'Chain': 'Chaîne',
  'Disconnect': 'Déconnecter',
  'Choose a wallet:': 'Choisissez un portefeuille :',
  'View all': 'Voir tout',
  'No notifications': 'Aucune notification',
  'User': 'Utilisateur',

  // RightRail
  'Real-Time Ops': 'Opérations en temps réel',
  '{n} new': '{n} nouvelles',
  'Policy Engine Online': 'Moteur de politiques en ligne',
  'No events in the last 24h': 'Aucun événement au cours des 24 dernières heures',
  '{n} event / 24h': '{n} événement / 24h',
  '{n} events / 24h': '{n} événements / 24h',
  'Recent Activity': 'Activité récente',
  'No recent activity yet.': 'Aucune activité récente pour le moment.',
  'Quick Actions': 'Actions rapides',
  'Risk Summary': 'Résumé des risques',

  // Recent activity event labels (from useRecentActivity)
  'Trade executed': 'Transaction exécutée',
  'Trade failed': 'Transaction échouée',
  'Agent deployed': 'Agent déployé',
  'Agent paused': 'Agent mis en pause',
  'Agent resumed': 'Agent relancé',
  'Agent stopped': 'Agent arrêté',
  'Mandate policy checked': 'Politique de mandat vérifiée',
  'Mandate policy submitted on-chain': 'Politique de mandat soumise on-chain',

  // Recent activity relative timestamps
  'just now': "à l'instant",
  '{n} min ago': 'il y a {n} min',
  '{n}h ago': 'il y a {n} h',
  '{n}d ago': 'il y a {n} j',

  // Run Audit modal + quick action
  'Run Audit': "Lancer l'audit",
  'Audit complete': 'Audit terminé',
  'No on-chain order executions found in the last {blocks} blocks on Mantle Sepolia.':
    "Aucune exécution d'ordre on-chain trouvée au cours des {blocks} derniers blocs sur Mantle Sepolia.",
  'Found {n} on-chain order execution in the last {blocks} blocks.':
    "{n} exécution d'ordre on-chain trouvée au cours des {blocks} derniers blocs.",
  'Found {n} on-chain order executions in the last {blocks} blocks.':
    "{n} exécutions d'ordres on-chain trouvées au cours des {blocks} derniers blocs.",
  'View Audit Log →': "Voir le journal d'audit →",
  'Close': 'Fermer',
  'Audit failed': 'Audit échoué',
  "Couldn't reach the Mantle Sepolia RPC. Please try again.":
    'Impossible de joindre le RPC Mantle Sepolia. Veuillez réessayer.',
  'Retry': 'Réessayer',
  'Scanning AgentExecutor events on Mantle Sepolia…': 'Analyse des événements AgentExecutor sur Mantle Sepolia…',
  'Scans the AgentExecutor contract for on-chain order executions in the last {blocks} blocks on Mantle Sepolia.':
    "Analyse le contrat AgentExecutor à la recherche d'exécutions d'ordres on-chain au cours des {blocks} derniers blocs sur Mantle Sepolia.",
  'Start Audit': "Démarrer l'audit",

  // Risk summary
  'No active agents yet — risk metrics will appear once an agent is deployed.':
    'Aucun agent actif pour le moment — les indicateurs de risque apparaîtront une fois un agent déployé.',
  'Open Risk Engine →': 'Ouvrir le moteur de risque →',
  'View report →': 'Voir le rapport →',
  'Low Risk': 'Risque faible',
  'Medium Risk': 'Risque moyen',
  'High Risk': 'Risque élevé',

  // MobileBottomNav
  'Mobile navigation': 'Navigation mobile',

  // AlertsPanel
  'Real-Time Alerts': 'Alertes en temps réel',
  'Mark all read': 'Tout marquer comme lu',
  'Clear': 'Effacer',
  'No alerts right now': 'Aucune alerte pour le moment',
  'Your agents are running smoothly.': 'Vos agents fonctionnent normalement.',
  'high': 'Élevée',
  'medium': 'Moyenne',
  'low': 'Faible',
  '{n}s ago': 'il y a {n} s',
  '{n}m ago': 'il y a {n} min',
}
