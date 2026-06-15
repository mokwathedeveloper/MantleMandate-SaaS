// French translations for the mandate edit/new wizard, billing, and agents list pages.
export const fr: Record<string, string> = {
  // ── Mandate wizard — shared step indicator ──────────────────────────────────
  'Describe': 'Décrire',
  'Define your strategy': 'Définissez votre stratégie',
  'Set safety parameters': 'Définissez les paramètres de sécurité',
  'Review & go live': 'Vérifiez et lancez',

  // ── New Mandate page ─────────────────────────────────────────────────────────
  'New Mandate': 'Nouveau mandat',
  'Describe your strategy in plain English — Claude AI turns it into an enforceable on-chain policy':
    'Décrivez votre stratégie en langage simple — Claude AI la transforme en politique on-chain applicable',
  'Mandate name': 'Nom du mandat',
  'e.g. ETH Conservative RSI Strategy': 'ex. Stratégie RSI conservatrice ETH',
  'Strategy description': 'Description de la stratégie',
  'Write your trading strategy in plain English. Include assets, entry / exit triggers, risk limits, and DeFi protocols you want to use on Mantle Network…':
    'Décrivez votre stratégie de trading en langage simple. Indiquez les actifs, les déclencheurs d\'entrée/sortie, les limites de risque et les protocoles DeFi que vous souhaitez utiliser sur Mantle Network…',
  'Quick-start examples': 'Exemples de démarrage rapide',
  'RSI Reversal': 'Retournement RSI',
  'Yield Farming': 'Yield farming',
  'DCA Strategy': 'Stratégie DCA',
  'Arbitrage': 'Arbitrage',
  'Base currency': 'Devise de base',
  'Live AI Preview': 'Aperçu IA en direct',
  'Continue to Risk Settings': 'Continuer vers les paramètres de risque',

  // AI parse panel
  'Claude Sonnet is parsing…': 'Claude Sonnet analyse…',
  'AI Preview': 'Aperçu IA',
  'Type your mandate and Claude will extract a structured policy in real time':
    'Saisissez votre mandat et Claude extraira une politique structurée en temps réel',
  'Policy extracted': 'Politique extraite',
  'Parsing with Claude AI...': 'Analyse par Claude AI...',
  'Edit mandate text to see updated policy': 'Modifiez le texte du mandat pour voir la politique mise à jour',
  'Policy parsed by Claude AI': 'Politique analysée par Claude AI',

  // Risk profile / levels
  'Risk Profile': 'Profil de risque',
  'Conservative': 'Conservateur',
  'Moderate': 'Modéré',
  'Aggressive': 'Agressif',
  'High Risk': 'Risque élevé',
  'Risk Parameters': 'Paramètres de risque',

  // Risk sliders (new mandate page)
  'Max Drawdown': 'Drawdown maximal',
  'Halt trading if portfolio drops by this percentage': 'Arrêter le trading si le portefeuille chute de ce pourcentage',
  'Max Position Size': 'Taille de position maximale',
  'Maximum portfolio allocation per single position': 'Allocation maximale du portefeuille par position unique',
  'Stop Loss': 'Stop loss',
  'Automatically exit if a position loses this much': 'Sortir automatiquement si une position perd ce montant',
  'Max Concurrent Positions': 'Positions simultanées maximales',
  'How many trades can be open simultaneously': 'Nombre de transactions pouvant être ouvertes simultanément',
  'Cooldown Period': 'Période de récupération',
  'Pause duration after a stop-loss is triggered': 'Durée de pause après le déclenchement d\'un stop loss',

  // Risk sliders (edit mandate page — slightly different hint text)
  'Stop trading if portfolio drops by this much': 'Arrêter le trading si le portefeuille chute de ce montant',
  'Maximum % of capital in a single position': '% maximal du capital dans une seule position',
  'Exit position if it loses this much': 'Sortir de la position si elle perd ce montant',
  'Maximum open positions at any time': 'Nombre maximal de positions ouvertes à tout moment',
  'Hours to wait after a stop-loss trigger': 'Heures d\'attente après le déclenchement d\'un stop loss',

  // Capital limit card
  'Capital Limit': 'Limite de capital',
  'Max capital (USD)': 'Capital maximal (USD)',
  'No limit': 'Aucune limite',
  'Leave blank to allow unlimited capital allocation.': 'Laissez vide pour autoriser une allocation de capital illimitée.',

  // On-chain enforcement info box
  'On-Chain Enforcement': 'Application on-chain',
  'These parameters are cryptographically encoded into your policy hash and enforced by the':
    'Ces paramètres sont encodés cryptographiquement dans votre hash de politique et appliqués par le',
  'smart contract on Mantle Network.': 'contrat intelligent sur Mantle Network.',
  'The AI agent': 'L\'agent IA',
  'cannot': 'ne peut pas',
  'exceed these limits.': 'dépasser ces limites.',

  'Back': 'Retour',
  'Review & Deploy': 'Vérifier et déployer',

  // Step 3 — review & deploy
  'Mandate Summary': 'Résumé du mandat',
  'Name': 'Nom',
  'Currency': 'Devise',
  'Capital cap': 'Plafond de capital',
  'Strategy': 'Stratégie',
  'Max Open Positions': 'Positions ouvertes maximales',
  'Cooldown After Loss': 'Récupération après perte',
  'On-Chain Policy Hash': 'Hash de politique on-chain',
  'SHA-256 fingerprint — immutably posted to Mantle Network at deployment':
    'Empreinte SHA-256 — publiée de manière immuable sur Mantle Network lors du déploiement',
  'Policy hash missing': 'Hash de politique manquant',
  'Go back to Step 1 and enter your mandate text so Claude can generate the policy hash.':
    'Revenez à l\'étape 1 et saisissez le texte de votre mandat pour que Claude puisse générer le hash de politique.',
  'Creation failed': 'Échec de la création',
  'Save Mandate': 'Enregistrer le mandat',
  'This saves your mandate. To deploy a live trading agent, open the mandate and click':
    'Cela enregistre votre mandat. Pour déployer un agent de trading en direct, ouvrez le mandat et cliquez sur',
  'Deploy Agent': 'Déployer l\'agent',
  'after connecting your Mantle wallet.': 'après avoir connecté votre portefeuille Mantle.',

  // ── Edit Mandate page ────────────────────────────────────────────────────────
  'Editing:': 'Modification :',
  'Deployed': 'Déployé',
  'Mandate ID:': 'ID du mandat :',
  'draft': 'brouillon',
  'active': 'actif',
  'paused': 'en pause',
  'archived': 'archivé',
  'Policy hash will regenerate.': 'Le hash de politique sera régénéré.',
  'Changes will generate a new on-chain policy hash. Any agent running this mandate will briefly pause during the update.':
    'Les modifications génèreront un nouveau hash de politique on-chain. Tout agent exécutant ce mandat sera brièvement mis en pause pendant la mise à jour.',
  'Mandate not found': 'Mandat introuvable',
  "This mandate does not exist or you don't have access to it.": 'Ce mandat n\'existe pas ou vous n\'y avez pas accès.',
  'Update failed': 'Échec de la mise à jour',
  'Mandate Details': 'Détails du mandat',
  'e.g. Conservative ETH Dip Buyer': 'ex. Acheteur de baisse ETH conservateur',
  'Capital cap (USD)': 'Plafond de capital (USD)',
  'Leave blank for no limit': 'Laissez vide pour aucune limite',
  'Your Trading Mandate': 'Votre mandat de trading',
  'The Hero Field': 'Le champ principal',
  'Edit your strategy in plain English. The AI will re-parse it in real time.':
    'Modifiez votre stratégie en langage simple. L\'IA la réanalysera en temps réel.',
  'e.g. "Buy ETH on Mantle when the RSI drops below 30.\nNever risk more than 5% of my portfolio on a single trade.\nTake profit when I\'m up 15%. Don\'t trade on weekends."':
    'ex. « Achetez de l\'ETH sur Mantle lorsque le RSI tombe sous 30.\nNe risquez jamais plus de 5 % de mon portefeuille sur une seule transaction.\nPrenez des bénéfices à +15 %. Ne tradez pas le week-end. »',
  'Copied!': 'Copié !',
  'Copy hash': 'Copier le hash',
  'Explorer': 'Explorateur',
  'Hash will change after saving': 'Le hash changera après l\'enregistrement',
  'Will be generated on save': 'Sera généré lors de l\'enregistrement',
  '(computed from mandate content)': '(calculé à partir du contenu du mandat)',
  'Risk Summary': 'Résumé des risques',
  'Max Position': 'Position maximale',
  'Max Positions': 'Positions maximales',
  'Cooldown': 'Récupération',
  'Cancel': 'Annuler',
  'Saving will regenerate the policy hash': 'L\'enregistrement régénérera le hash de politique',
  'Activate': 'Activer',
  'Update Mandate': 'Mettre à jour le mandat',

  // ── Billing page ─────────────────────────────────────────────────────────────
  'Payment Methods & Billing': 'Moyens de paiement et facturation',
  'Manage subscription payments, crypto billing, and invoices for MantleMandate.':
    'Gérez les paiements d\'abonnement, la facturation crypto et les factures pour MantleMandate.',
  'Payment Methods': 'Moyens de paiement',
  'Manage how you pay for MantleMandate.': 'Gérez la façon dont vous payez pour MantleMandate.',
  'On-chain payments (Mantle Sepolia)': 'Paiements on-chain (Mantle Sepolia)',
  'Pay for your subscription with a direct MNT transfer — see the Crypto tab below. Card payments are not yet connected.':
    'Payez votre abonnement avec un transfert MNT direct — voir l\'onglet Crypto ci-dessous. Les paiements par carte ne sont pas encore connectés.',
  'Add New Payment Method': 'Ajouter un nouveau moyen de paiement',
  '💳 Card': '💳 Carte',
  '💲 Crypto': '💲 Crypto',
  'Coming soon': 'Bientôt disponible',

  // Crypto tab
  "Crypto payments aren't configured yet": 'Les paiements crypto ne sont pas encore configurés',
  'The operator needs to set NEXT_PUBLIC_TREASURY_ADDRESS to a wallet they control before crypto payments can be verified.':
    'L\'opérateur doit définir NEXT_PUBLIC_TREASURY_ADDRESS sur un portefeuille qu\'il contrôle avant que les paiements crypto puissent être vérifiés.',
  "Card payments aren't connected yet": 'Les paiements par carte ne sont pas encore connectés',
  "This deployment doesn't have a Stripe account configured. Use the Crypto tab to pay with MNT on Mantle Sepolia.":
    'Ce déploiement n\'a pas de compte Stripe configuré. Utilisez l\'onglet Crypto pour payer en MNT sur Mantle Sepolia.',
  'Pay with Crypto': 'Payer en crypto',
  'Send MNT on Mantle Sepolia Testnet to the treasury address below, then verify your transaction to upgrade your plan.':
    'Envoyez des MNT sur le testnet Mantle Sepolia à l\'adresse de trésorerie ci-dessous, puis vérifiez votre transaction pour mettre à niveau votre forfait.',
  'Plan': 'Forfait',
  '/mo': '/mois',
  'Send MNT to this address:': 'Envoyez des MNT à cette adresse :',
  'Send only': 'Envoyez uniquement',
  'on': 'sur',
  'to this address.': 'à cette adresse.',
  'Any positive amount is accepted as proof of payment for this testnet deployment.':
    'Tout montant positif est accepté comme preuve de paiement pour ce déploiement testnet.',
  'Confirm in wallet…': 'Confirmer dans le portefeuille…',
  'Waiting for confirmation on Mantle Sepolia…': 'Attente de confirmation sur Mantle Sepolia…',
  'Pay {amount} MNT with connected wallet': 'Payer {amount} MNT avec le portefeuille connecté',
  'Connect your wallet (top right) to pay in one click — or send manually below.':
    'Connectez votre portefeuille (en haut à droite) pour payer en un clic — ou envoyez manuellement ci-dessous.',
  'or pay manually': 'ou payer manuellement',
  'Enter your transaction hash to verify:': 'Saisissez le hash de votre transaction pour le vérifier :',
  'Verify': 'Vérifier',
  'View on Mantle Explorer': 'Voir sur Mantle Explorer',
  'Verification failed': 'Échec de la vérification',
  'Payment of {amount} {currency} verified. Your plan is now {plan}.':
    'Paiement de {amount} {currency} vérifié. Votre forfait est maintenant {plan}.',
  'Network error — please try again.': 'Erreur réseau — veuillez réessayer.',
  'Transaction was rejected or failed.': 'La transaction a été rejetée ou a échoué.',

  // Right column
  '/ month': '/ mois',
  'Trial: {n} days remaining': 'Essai : {n} jours restants',
  'Billing History': 'Historique de facturation',
  'Export': 'Exporter',
  'Loading…': 'Chargement…',
  'No invoices yet.': 'Aucune facture pour le moment.',
  'View transaction': 'Voir la transaction',

  // Plan config labels
  'Operator Plan': 'Forfait Opérateur',
  'Strategist Plan': 'Forfait Stratège',
  'Institution Plan': 'Forfait Institution',

  // ── Agents page ──────────────────────────────────────────────────────────────
  'AI Agents': 'Agents IA',
  '{n} agents deployed · {a} active · {p} paused · {f} failed':
    '{n} agents déployés · {a} actifs · {p} en pause · {f} échoués',
  'Deploy New Agent': 'Déployer un nouvel agent',
  'Total Agents': 'Total des agents',
  'Active': 'Actif',
  'Paused': 'En pause',
  'Failed': 'Échoué',
  'All': 'Tous',

  // Agent card
  'Running:': 'En cours :',
  'P&L': 'P&L',
  'ROI': 'ROI',
  'Volume': 'Volume',
  'Drawdown': 'Drawdown',
  'Deployed:': 'Déployé :',
  'Pause agent': 'Mettre l\'agent en pause',
  'Stop agent': 'Arrêter l\'agent',
  'Resume agent': 'Relancer l\'agent',
  'Agent settings': 'Paramètres de l\'agent',
  'View agent detail': 'Voir le détail de l\'agent',

  // Agent status labels
  'failed': 'échoué',
  'stopped': 'arrêté',
  'inactive': 'inactif',

  // Deploy modal
  'Deploy New Agent ': 'Déployer un nouvel agent',
  'From existing mandate:': 'À partir d\'un mandat existant :',
  'Select mandate…': 'Sélectionner un mandat…',
  'Agent name (optional)': 'Nom de l\'agent (facultatif)',
  'Auto-named from mandate': 'Nommé automatiquement à partir du mandat',
  'Capital cap ($)': 'Plafond de capital ($)',
  'Wallet': 'Portefeuille',
  'Primary': 'Principal',
  'or': 'ou',
  'Create a New Mandate First': 'Créer d\'abord un nouveau mandat',

  // Filter bar / empty states
  'Search agents…': 'Rechercher des agents…',
  'Sort: {o}': 'Trier : {o}',
  'Date deployed': 'Date de déploiement',
  'No agents deployed yet': 'Aucun agent déployé pour le moment',
  'Create a mandate and deploy your first AI agent to start trading automatically on Mantle Network.':
    'Créez un mandat et déployez votre premier agent IA pour commencer à trader automatiquement sur Mantle Network.',
  'Deploy My First Agent': 'Déployer mon premier agent',
  'or browse example mandates': 'ou parcourir des exemples de mandats',
  'No agents match your filter.': 'Aucun agent ne correspond à votre filtre.',
  'Clear filters': 'Effacer les filtres',
}
