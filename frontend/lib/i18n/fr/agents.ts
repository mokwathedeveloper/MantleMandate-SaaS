// French translations for the agent detail, Risk Engine, and Audit Trail pages.
export const fr: Record<string, string> = {
  // ── Agent detail page — Overview tab ────────────────────────────────────────
  'Lifetime P&L': 'P&L total',
  'Lifetime ROI': 'ROI total',
  'Total Trades': 'Total des transactions',
  'Win Rate': 'Taux de réussite',
  'Avg Trade Size': 'Taille moyenne des transactions',
  'Cumulative P&L': 'P&L cumulé',
  'P&L': 'P&L',
  'Mandate Compliance': 'Conformité du mandat',
  'Passing': 'Conforme',
  'Max drawdown limit': 'Limite de drawdown maximal',
  'Position size within bounds': 'Taille de position dans les limites',
  'Cooldown period respected': 'Période de récupération respectée',
  'On-chain policy hash verified': 'Hash de politique on-chain vérifié',
  'Pass': 'Réussi',
  'Fail': 'Échec',
  'On-Chain Reputation': 'Réputation on-chain',
  'Decisions Committed': 'Décisions enregistrées',
  'Resolved': 'Résolues',
  'Executed': 'Exécutées',

  // Tab labels
  'Overview': 'Vue d\'ensemble',
  'Trade History': 'Historique des transactions',
  'Mandate': 'Mandat',
  'Audit Trail': 'Journal d\'audit',
  'Settings': 'Paramètres',

  // ── Agent detail page — Trade History tab ───────────────────────────────────
  '{n} total trades': '{n} transactions au total',
  'No trades executed yet': 'Aucune transaction exécutée pour le moment',
  'Time': 'Heure',
  'Asset': 'Actif',
  'Direction': 'Sens',
  'Amount': 'Montant',
  'Price': 'Prix',
  'Status': 'Statut',
  'Mandate Rule': 'Règle du mandat',
  'Block': 'Bloc',
  'buy': 'achat',
  'sell': 'vente',
  'View reasoning on IPFS:': 'Voir le raisonnement sur IPFS :',
  'Reasoning CID (not pinned to IPFS):': 'CID du raisonnement (non épinglé sur IPFS) :',
  'View': 'Voir',

  // Trade status values (trade.status — also used by TRADE_STATUS_VARIANT)
  'success': 'succès',
  'failed': 'échoué',
  'pending': 'en attente',

  // ── Agent detail page — Mandate tab ──────────────────────────────────────────
  'Mandate not found': 'Mandat introuvable',
  'Could not load the mandate associated with this agent.': 'Impossible de charger le mandat associé à cet agent.',
  'Edit mandate': 'Modifier le mandat',
  'Plain-English Mandate': 'Mandat en langage simple',
  'Parsed Policy': 'Politique analysée',
  'Verified by Claude AI': 'Vérifié par Claude AI',
  'On-Chain Policy Hash': 'Hash de politique on-chain',
  'Copied!': 'Copié !',
  'Copy hash': 'Copier le hash',
  'View on Mantle Explorer': 'Voir sur Mantle Explorer',
  'SHA-256 fingerprint of your parsed policy. Posted on Mantle Network.': 'Empreinte SHA-256 de votre politique analysée. Publiée sur Mantle Network.',
  'Policy hash will be generated when this mandate is deployed on-chain.': 'Le hash de politique sera généré lors du déploiement de ce mandat on-chain.',

  // Mandate status values
  'draft': 'brouillon',
  'active': 'actif',
  'paused': 'en pause',
  'archived': 'archivé',

  // Parsed policy field labels (key.replace(/_/g, ' '))
  'asset': 'actif',
  'trigger': 'déclencheur',
  'venue': 'plateforme',
  'schedule': 'planification',
  'risk per trade': 'risque par transaction',
  'take profit': 'take profit',
  'stop loss': 'stop loss',
  'strategy type': 'type de stratégie',
  'max drawdown': 'drawdown maximal',
  'max position size': 'taille de position maximale',
  'max open positions': 'positions ouvertes maximales',
  'cooldown after loss': 'délai après une perte',
  'base currency': 'devise de base',

  // ── Agent detail page — Audit Trail tab ──────────────────────────────────────
  'Decision Audit Log': 'Journal d\'audit des décisions',
  '{n} events': '{n} événements',
  'No audit events yet': 'Aucun événement d\'audit pour le moment',
  'View on Explorer': 'Voir sur l\'explorateur',

  // Audit log event types (log.eventType.replace(/_/g, ' '))
  'trade executed': 'transaction exécutée',
  'trade rejected': 'transaction rejetée',
  'agent started': 'agent démarré',
  'agent paused': 'agent suspendu',
  'agent resumed': 'agent relancé',
  'agent stopped': 'agent arrêté',
  'decision committed': 'décision enregistrée',
  'decision resolved': 'décision résolue',
  'risk check failed': 'vérification de risque échouée',
  'policy violation': 'violation de politique',
  'mandate updated': 'mandat mis à jour',

  // ── Agent detail page — Settings tab ─────────────────────────────────────────
  'Agent Controls': 'Contrôles de l\'agent',
  'Current Status': 'Statut actuel',
  "Agent's live operating state": 'État opérationnel en direct de l\'agent',
  'Pause Agent': 'Mettre l\'agent en pause',
  'Stop Agent': 'Arrêter l\'agent',
  'Resume Agent': 'Relancer l\'agent',
  'This agent has been stopped. Deploy a new agent from the Agents page to continue trading.':
    'Cet agent a été arrêté. Déployez un nouvel agent depuis la page Agents pour continuer à trader.',
  'Agent Information': 'Informations sur l\'agent',
  'No limit': 'Aucune limite',
  'No trades yet': 'Aucune transaction pour le moment',
  'Danger Zone': 'Zone de danger',
  'Stopping an agent is irreversible. All open positions will be closed at market price.':
    'L\'arrêt d\'un agent est irréversible. Toutes les positions ouvertes seront clôturées au prix du marché.',
  'Permanently Stop Agent': 'Arrêter définitivement l\'agent',

  // Agent info row labels
  'Agent ID': 'ID de l\'agent',
  'Capital Cap': 'Plafond de capital',
  'Deployed At': 'Déployé le',
  'Last Trade': 'Dernière transaction',

  // Agent status values (agent.status — also used by STATUS_VARIANT)
  'stopped': 'arrêté',
  'inactive': 'inactif',

  // ── Agent detail page — top-level page ───────────────────────────────────────
  'Agent not found': 'Agent introuvable',
  "This agent doesn't exist or you don't have access to it.": 'Cet agent n\'existe pas ou vous n\'y avez pas accès.',
  'Back to Agents': 'Retour aux agents',
  'Running:': 'En cours :',
  'Run Trading Cycle': 'Lancer un cycle de trading',
  'Pause': 'Suspendre',
  'Stop': 'Arrêter',
  'Resume': 'Relancer',
  'Trading cycle failed': 'Échec du cycle de trading',
  'Order executed on-chain:': 'Ordre exécuté on-chain :',
  'AI recommendation:': 'Recommandation de l\'IA :',
  '(no on-chain trade)': '(pas de transaction on-chain)',
  'Confidence:': 'Confiance :',
  'Estimated P&L:': 'P&L estimé :',
  'View transaction on Mantle Explorer': 'Voir la transaction sur Mantle Explorer',
  'View swap on Mantle Explorer': 'Voir le swap sur Mantle Explorer',

  // ── Risk Engine page ──────────────────────────────────────────────────────────
  'Risk Engine': 'Moteur de risque',
  'Hard limits your AI agents can never exceed. Applied to all mandates unless overridden.':
    'Limites strictes que vos agents IA ne peuvent jamais dépasser. Appliquées à tous les mandats sauf indication contraire.',
  'Load Template': 'Charger un modèle',
  'Custom': 'Personnalisé',
  'Apply Changes': 'Appliquer les modifications',
  'Global Risk Thresholds': 'Seuils de risque globaux',
  'These apply across all agents unless a mandate specifies tighter limits.':
    'Ces seuils s\'appliquent à tous les agents, sauf si un mandat précise des limites plus strictes.',

  // Range sliders
  'Max Drawdown (%)': 'Drawdown maximal (%)',
  'If total portfolio drops by this %, all agents pause automatically.':
    'Si le portefeuille total chute de ce pourcentage, tous les agents se mettent en pause automatiquement.',
  'Max Notional Per Trade ($)': 'Montant notionnel maximal par transaction ($)',
  'Maximum USD value of a single trade position.': 'Valeur maximale en USD d\'une seule position de transaction.',
  'Max Positions Open': 'Positions ouvertes maximales',
  'Maximum number of concurrent open positions across all agents.':
    'Nombre maximal de positions ouvertes simultanément sur tous les agents.',
  'Stop Loss (%)': 'Stop loss (%)',
  'Auto-close a position if it falls this % below entry price.':
    'Clôturer automatiquement une position si elle chute de ce pourcentage sous le prix d\'entrée.',
  'Per-Agent Drawdown Limit (%)': 'Limite de drawdown par agent (%)',
  'Per-agent drawdown limit before that agent pauses.': 'Limite de drawdown par agent avant que cet agent ne se mette en pause.',
  'Max Daily Loss ($)': 'Perte quotidienne maximale ($)',
  'If total realized + unrealized loss exceeds this today, all agents pause until midnight UTC.':
    'Si la perte totale réalisée + latente dépasse ce montant aujourd\'hui, tous les agents se mettent en pause jusqu\'à minuit UTC.',

  // Venue Selection & Allocation
  'Venue Selection & Allocation': 'Sélection et répartition des plateformes',
  "Allocation limits based on real trade volume across protocols you've used.":
    'Limites de répartition basées sur le volume réel des transactions sur les protocoles que vous avez utilisés.',
  'No trade activity yet — allocation limits will appear once your agents start trading.':
    'Aucune activité de trading pour le moment — les limites de répartition apparaîtront dès que vos agents commenceront à trader.',
  'Protocol': 'Protocole',
  'Max Allocation': 'Allocation maximale',
  'Volume': 'Volume',
  'Actions': 'Actions',
  'ACTIVE': 'ACTIF',
  'allocation': 'allocation',
  'Configure': 'Configurer',
  'Total:': 'Total :',
  'adjust before applying': 'ajuster avant d\'appliquer',

  // Cooldown Periods
  'Cooldown Periods': 'Périodes de récupération',
  'After stop-loss triggered': 'Après déclenchement du stop loss',
  'After drawdown limit hit': 'Après atteinte de la limite de drawdown',
  'After trade failure': 'Après échec d\'une transaction',
  'Between repeat trades (same asset)': 'Entre transactions répétées (même actif)',

  // Cooldown options
  'None': 'Aucun',
  '30 min': '30 min',
  '1 hour': '1 heure',
  '4 hours': '4 heures',
  '12 hours': '12 heures',
  '24 hours': '24 heures',
  '1 week': '1 semaine',

  // Portfolio Risk Score
  'Portfolio Risk Score': 'Score de risque du portefeuille',
  'NO DATA': 'AUCUNE DONNÉE',
  'No active agents to monitor': 'Aucun agent actif à surveiller',
  'Within safe parameters': 'Dans les paramètres de sécurité',
  'Approaching risk limits': 'Approche des limites de risque',
  'Exceeds safe risk limits': 'Dépasse les limites de risque sécurisées',

  // Risk level labels
  'Low Risk': 'Risque faible',
  'Medium Risk': 'Risque moyen',
  'High Risk': 'Risque élevé',

  // Current Exposure
  'Current Exposure': 'Exposition actuelle',
  'Current Drawdown': 'Drawdown actuel',
  'Largest Open Position': 'Plus grande position ouverte',
  'Open Positions': 'Positions ouvertes',
  'Venue Concentration': 'Concentration des plateformes',
  'Daily Loss': 'Perte quotidienne',
  'Near limit': 'Proche de la limite',
  'Within limit': 'Dans la limite',

  // Quick Presets
  'Quick Presets': 'Préréglages rapides',
  'Conservative': 'Conservateur',
  'Balanced': 'Équilibré',
  'Aggressive': 'Agressif',

  // Unsaved changes notice
  'Unsaved changes': 'Modifications non enregistrées',
  'Click "Apply Changes" to save.': 'Cliquez sur « Appliquer les modifications » pour enregistrer.',
  '{n} active agent will be affected.': '{n} agent actif sera affecté.',
  '{n} active agents will be affected.': '{n} agents actifs seront affectés.',
  'No active agents are currently running.': 'Aucun agent actif n\'est en cours d\'exécution.',

  // Apply mutation toast messages
  'Risk settings applied to {n} active mandate': 'Paramètres de risque appliqués à {n} mandat actif',
  'Risk settings applied to {n} active mandates': 'Paramètres de risque appliqués à {n} mandats actifs',
  'Risk settings saved — no active mandates to apply to yet': 'Paramètres de risque enregistrés — aucun mandat actif auquel les appliquer pour le moment',

  // Confirm modal
  'Apply Risk Settings?': 'Appliquer les paramètres de risque ?',
  'Cancel': 'Annuler',
  'These changes update the risk parameters stored on your active mandates and apply to their agents immediately.':
    'Ces modifications mettent à jour les paramètres de risque stockés sur vos mandats actifs et s\'appliquent immédiatement à leurs agents.',
  'Active mandates': 'Mandats actifs',
  'Active agents': 'Agents actifs',
  'Failed to apply changes. Please try again.': 'Échec de l\'application des modifications. Veuillez réessayer.',

  // ── Audit Trail page ──────────────────────────────────────────────────────────
  'On-Chain Audit Viewer': 'Visualiseur d\'audit on-chain',
  'Every decision and trade recorded immutably on Mantle Network.':
    'Chaque décision et transaction enregistrée de manière immuable sur Mantle Network.',
  'Share Public Audit Link': 'Partager le lien d\'audit public',
  'Export CSV': 'Exporter en CSV',
  'Public audit link copied to clipboard': 'Lien d\'audit public copié dans le presse-papiers',
  '{file} downloaded': '{file} téléchargé',

  // Live contracts strip
  'Live Contracts · Mantle Sepolia': 'Contrats en direct · Mantle Sepolia',

  // Summary KPI cards
  'Total Transactions': 'Transactions totales',
  'Live on-chain': 'En direct on-chain',
  'No on-chain activity yet': 'Aucune activité on-chain pour le moment',
  'Total Volume': 'Volume total',
  'Verified on-chain': 'Vérifié on-chain',
  'Success Rate': 'Taux de réussite',
  'Last 24 Hours': 'Dernières 24 heures',
  '{n} transaction': '{n} transaction',
  '{n} transactions': '{n} transactions',
  'Live data': 'Données en direct',

  // Filter bar
  'Date:': 'Date :',
  'to': 'à',
  'Chain': 'Chaîne',
  'All Chains': 'Toutes les chaînes',
  'Mantle': 'Mantle',
  'Ethereum': 'Ethereum',
  'All Status': 'Tous les statuts',
  'Success': 'Succès',
  'Failed': 'Échoué',
  'Pending': 'En attente',
  'Agent': 'Agent',
  'All Agents': 'Tous les agents',
  'Agent-001': 'Agent-001',
  'Agent-002': 'Agent-002',
  'Agent-003': 'Agent-003',
  'All Mandates': 'Tous les mandats',
  'ETH Conservative Buyer': 'Acheteur conservateur ETH',
  'MNT Momentum Trader': 'Trader momentum MNT',
  'DeFi Yield Optimizer': 'Optimiseur de rendement DeFi',
  'Search by hash or address...': 'Rechercher par hash ou adresse...',

  // Active filter chips
  'Status:': 'Statut :',
  'Remove': 'Supprimer',
  'filter': 'filtre',
  'Clear all': 'Tout effacer',

  // Live / demo indicator
  '{n} live on-chain transaction fetched from the AgentExecutor contract':
    '{n} transaction on-chain en direct récupérée depuis le contrat AgentExecutor',
  '{n} live on-chain transactions fetched from the AgentExecutor contract':
    '{n} transactions on-chain en direct récupérées depuis le contrat AgentExecutor',
  'No on-chain transactions found in the recent block range — real transactions will appear here once agents execute trades on Mantle Network':
    'Aucune transaction on-chain trouvée dans la plage de blocs récente — les transactions réelles apparaîtront ici une fois que les agents exécuteront des transactions sur Mantle Network',

  // Table headers
  'TX HASH': 'HASH TX',
  'TIMESTAMP': 'HORODATAGE',
  'FROM': 'DE',
  'TO': 'VERS',
  'MANDATE': 'MANDAT',
  'AMOUNT': 'MONTANT',
  'STATUS': 'STATUT',
  'BLOCK': 'BLOC',
  'ACTIONS': 'ACTIONS',

  // Audit table tx status values (TxStatus — uppercase)
  'SUCCESS': 'SUCCÈS',
  'PENDING': 'EN ATTENTE',

  // Empty state
  'Once your AI agent executes its first trade on Mantle Network, every transaction will appear here with full verification.':
    'Une fois que votre agent IA exécute sa première transaction sur Mantle Network, chaque transaction apparaîtra ici avec une vérification complète.',
  'Deploy Your First Agent →': 'Déployer votre premier agent →',

  // Expanded row detail
  'Transaction Detail': 'Détail de la transaction',
  'Close detail': 'Fermer le détail',
  'Full TX Hash': 'Hash de transaction complet',
  'Copy TX hash': 'Copier le hash de la transaction',
  'Decision Hash': 'Hash de décision',
  'Copy decision hash': 'Copier le hash de décision',
  'Rule Applied': 'Règle appliquée',
  'Gas Used': 'Gaz utilisé',
  'Gas Price': 'Prix du gaz',

  // Pagination
  'Showing {from}–{to} of {total} transactions': 'Affichage de {from} à {to} sur {total} transactions',
}
