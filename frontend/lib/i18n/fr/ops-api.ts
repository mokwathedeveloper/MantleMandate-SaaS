// French translations for the API integration and reports pages.
export const fr: Record<string, string> = {
  // ─── API page — header ──────────────────────────────────────────────────────
  'API Integration & Data Ingestion': 'Intégration API et ingestion de données',
  'Live market data connections, on-chain state, and ingestion logs.':
    'Connexions de données de marché en direct, état on-chain et journaux d\'ingestion.',
  'SYSTEM OPERATIONAL': 'SYSTÈME OPÉRATIONNEL',
  'All APIs Connected': 'Toutes les API sont connectées',
  'Add New Integration': 'Ajouter une nouvelle intégration',

  // ─── API page — summary cards ───────────────────────────────────────────────
  'Market Data': 'Données de marché',
  'On-Chain State': 'État on-chain',
  'DeFi Protocols': 'Protocoles DeFi',
  'Data Freshness': 'Fraîcheur des données',
  '3 active': '3 actifs',
  'CONNECTED ✓': 'CONNECTÉ ✓',
  'LIVE': 'EN DIRECT',
  'Real-time': 'Temps réel',

  // ─── API page — Integration Settings panel ──────────────────────────────────
  'Integration Settings': 'Paramètres d\'intégration',
  'CONNECTED': 'CONNECTÉ',
  'API Key:': 'Clé API :',
  'Edit': 'Modifier',
  'Revoke': 'Révoquer',
  'Permissions': 'Permissions',
  'Rate Limit': 'Limite de débit',
  'Data feeds': 'Flux de données',
  'Last ping': 'Dernier ping',
  'Read Only ✓': 'Lecture seule ✓',
  'RPC Endpoint:': 'Point de terminaison RPC :',
  'Block time': 'Temps de bloc',
  'Latest block': 'Dernier bloc',
  'Gas (low)': 'Gas (bas)',
  '2.1s average': '2,1 s en moyenne',
  'Add New Data Source': 'Ajouter une nouvelle source de données',

  // ─── API page — Response Preview panel ──────────────────────────────────────
  'Response Preview': 'Aperçu de la réponse',
  'Run Test Request': 'Exécuter la requête de test',
  'Copy JSON': 'Copier le JSON',

  // ─── API page — Recent Inbound / Error Log panels ───────────────────────────
  'Recent Inbound': 'Entrées récentes',
  'Error Log': 'Journal des erreurs',
  'Clear': 'Effacer',
  'No errors in the last 24 hours': 'Aucune erreur au cours des dernières 24 heures',
  'ERROR': 'ERREUR',

  // ─── API page — Ingestion Log panel ──────────────────────────────────────────
  'Ingestion Log': 'Journal d\'ingestion',
  'Auto-scroll': 'Défilement auto',
  'ON': 'ACTIVÉ',
  'OFF': 'DÉSACTIVÉ',
  'Export': 'Exporter',
  'Filter': 'Filtrer',
  'All levels': 'Tous les niveaux',
  'No log entries at level {level}': 'Aucune entrée de journal au niveau {level}',
  'No log entries': 'Aucune entrée de journal',
  '{n} / 200 entries shown': '{n} / 200 entrées affichées',
  '{n} errors': '{n} erreurs',
  '{n} error': '{n} erreur',
  '{n} warnings': '{n} avertissements',
  '{n} warning': '{n} avertissement',

  // ─── API page — Add Integration modal ────────────────────────────────────────
  'Close modal': 'Fermer la fenêtre',
  'Select the type of data source you want to add:': 'Sélectionnez le type de source de données à ajouter :',
  'REST API': 'API REST',
  'WebSocket': 'WebSocket',
  'EVM RPC': 'RPC EVM',
  'Subgraph': 'Subgraph',
  'HTTP endpoints (Bybit, Binance, custom)': 'Points de terminaison HTTP (Bybit, Binance, personnalisé)',
  'Real-time streaming data feed': 'Flux de données en streaming en temps réel',
  'On-chain data via JSON-RPC node': 'Données on-chain via un nœud JSON-RPC',
  'GraphQL endpoint (The Graph protocol)': 'Point de terminaison GraphQL (protocole The Graph)',
  'Next': 'Suivant',
  'Configure your': 'Configurez votre',
  'integration:': 'intégration :',
  'Integration Name': 'Nom de l\'intégration',
  'e.g. Bybit Futures Feed': 'ex. Flux Bybit Futures',
  'Endpoint URL': 'URL du point de terminaison',
  'API Key (optional)': 'Clé API (facultatif)',
  'Back': 'Retour',
  'Saving…': 'Enregistrement…',
  'Save Integration': 'Enregistrer l\'intégration',
  'added': 'ajouté',
  'Integration saved. Data will begin flowing in shortly.': 'Intégration enregistrée. Les données commenceront à arriver prochainement.',
  'Done': 'Terminé',

  // ─── Reports page — header ───────────────────────────────────────────────────
  'Reports & Exporting': 'Rapports et exportation',
  'Performance summaries, trade logs, and compliance exports.':
    'Résumés de performance, journaux de transactions et exports de conformité.',
  'Export Report': 'Exporter le rapport',

  // ─── Reports page — KPI strip ────────────────────────────────────────────────
  'Total Reports': 'Total des rapports',
  'Total P&L': 'P&L total',
  'Avg ROI': 'ROI moyen',
  'Max Drawdown': 'Drawdown maximal',
  'Avg Sharpe': 'Sharpe moyen',
  'In selected range': 'Dans la période sélectionnée',
  'Selected range': 'Période sélectionnée',
  'Risk-adjusted': 'Ajusté au risque',

  // ─── Reports page — view toggle + filters ───────────────────────────────────
  'Table': 'Tableau',
  'Charts': 'Graphiques',
  'to': 'à',
  'All Agents': 'Tous les agents',
  'All Mandates': 'Tous les mandats',

  // ─── Reports page — table view ──────────────────────────────────────────────
  'REPORT NAME': 'NOM DU RAPPORT',
  'TYPE': 'TYPE',
  'DATE RANGE': 'PÉRIODE',
  'TOTAL P&L': 'P&L TOTAL',
  'ROI': 'ROI',
  'ACTIONS': 'ACTIONS',
  'GENERATED ON': 'GÉNÉRÉ LE',
  'DRAWDOWN': 'DRAWDOWN',
  'SHARPE': 'SHARPE',
  'Hide extra columns −': 'Masquer les colonnes supplémentaires −',
  'Show more columns +': 'Afficher plus de colonnes +',
  'Failed to load reports.': 'Échec du chargement des rapports.',
  'View': 'Voir',
  'Report downloaded: {filename}': 'Rapport téléchargé : {filename}',

  // ─── Reports page — report type badges (Report.type) ───────────────────────
  'PERFORMANCE': 'PERFORMANCE',
  'RISK': 'RISQUE',
  'AGENT': 'AGENT',
  'PORTFOLIO': 'PORTEFEUILLE',

  // ─── Reports page — empty state ─────────────────────────────────────────────
  'No reports yet': 'Aucun rapport pour le moment',
  'Reports are generated automatically each week once your agents start executing trades.':
    'Les rapports sont générés automatiquement chaque semaine une fois que vos agents commencent à exécuter des transactions.',
  'Deploy Your First Agent': 'Déployer votre premier agent',

  // ─── Reports page — Report View modal ───────────────────────────────────────
  'Close': 'Fermer',
  'Sharpe Ratio': 'Ratio de Sharpe',
  'Report Type': 'Type de rapport',
  'Period From': 'Période du',
  'Period To': 'Période au',
  'Generated On': 'Généré le',

  // ─── Reports page — CSV export field labels (downloadReportCsv) ────────────
  'Field': 'Champ',
  'Value': 'Valeur',
  'Report': 'Rapport',
  'Type': 'Type',
  'Period': 'Période',

  // ─── Reports page — Export modal ────────────────────────────────────────────
  'all-time': 'depuis le début',
  'now': 'maintenant',
  'Metric': 'Métrique',
  'Win Rate': 'Taux de réussite',
  'Total Trades': 'Total des transactions',
  'Portfolio Value': 'Valeur du portefeuille',
  'Agent P&L': 'P&L de l\'agent',
  '{reportType} — {format} downloaded': '{reportType} — {format} téléchargé',
  'Report type': 'Type de rapport',
  'Performance Summary': 'Résumé de performance',
  'Full Trade Log': 'Journal complet des transactions',
  'Agent Activity Report': 'Rapport d\'activité des agents',
  'On-Chain Audit Export': 'Export d\'audit on-chain',
  'Date range': 'Période',
  'Mandate': 'Mandat',
  'Format': 'Format',
  'Generate & Download': 'Générer et télécharger',
  'Cancel': 'Annuler',

  // ─── Reports page — Export modal PDF document strings ───────────────────────
  'Period:': 'Période :',
  'Generated:': 'Généré :',
  'Portfolio Value Timeline': 'Évolution de la valeur du portefeuille',
  'Date': 'Date',
  'No data yet': 'Aucune donnée pour le moment',
  'Agent Breakdown': 'Répartition par agent',
  'Agent': 'Agent',
  'No agents deployed yet': 'Aucun agent déployé pour le moment',
  'Protocol Volume': 'Volume par protocole',
  'Protocol': 'Protocole',
  'Share': 'Part',
  'No trade activity yet': 'Aucune activité de trading pour le moment',
  'Win Rates by Mandate': 'Taux de réussite par mandat',
  'Win %': 'Réussite %',
  'Loss %': 'Échec %',
  'No completed trades yet': 'Aucune transaction terminée pour le moment',

  // ─── Reports page — charts view ─────────────────────────────────────────────
  'Portfolio Value Over Time': 'Valeur du portefeuille dans le temps',
  'No portfolio history yet': 'Aucun historique de portefeuille pour le moment',
  'P&L by Agent': 'P&L par agent',
  'P&L': 'P&L',
  'Trade Volume by Protocol': 'Volume de transactions par protocole',
  'Volume': 'Volume',
  'Win Rate by Mandate': 'Taux de réussite par mandat',
  'Unknown': 'Inconnu',
}
