// French translations for the docs and support pages.
export const fr: Record<string, string> = {
  // ─── Write your first mandate ───────────────────────────────────────────────
  'A mandate is a plain-English description of your trading strategy. You write it in natural language; Claude compiles it into a verifiable, on-chain policy. No coding required.':
    'Un mandat est une description en langage simple de votre stratégie de trading. Vous l\'écrivez en langage naturel ; Claude le compile en une politique vérifiable, on-chain. Aucun code requis.',
  'Step 1 — Navigate to New Mandate': 'Étape 1 — Accédez à Nouveau mandat',
  'Go to': 'Allez dans',
  'Dashboard → Mandates → New Mandate': 'Tableau de bord → Mandats → Nouveau mandat',
  "You'll see a large text area and a live parsing panel on the right.":
    'Vous verrez une grande zone de texte et un panneau d\'analyse en direct à droite.',
  'Step 2 — Write your strategy': 'Étape 2 — Rédigez votre stratégie',
  'Describe your rules in plain English. Be specific about entry conditions, exit conditions, and risk limits. Example:':
    'Décrivez vos règles en langage simple. Soyez précis sur les conditions d\'entrée, les conditions de sortie et les limites de risque. Exemple :',
  'Step 3 — Review the parsed policy': 'Étape 3 — Vérifiez la politique analysée',
  'Click': 'Cliquez sur',
  'Parse Mandate': 'Analyser le mandat',
  'Claude extracts your rules into a structured JSON policy. Review it carefully — every field represents an enforceable rule:':
    'Claude extrait vos règles dans une politique JSON structurée. Vérifiez-la attentivement — chaque champ représente une règle applicable :',
  'Step 4 — Deploy to Mantle': 'Étape 4 — Déployez sur Mantle',
  'Deploy Mandate': 'Déployer le mandat',
  "This hashes the JSON policy using keccak256 and stores the hash on":
    'Cela hache la politique JSON avec keccak256 et stocke le hash sur',
  'on Mantle. You\'ll receive a policy hash and a Mantle Explorer link.':
    'sur Mantle. Vous recevrez un hash de politique et un lien vers Mantle Explorer.',
  'Your private key never leaves your wallet. The deploy transaction only stores the hash — not your personal strategy details.':
    'Votre clé privée ne quitte jamais votre portefeuille. La transaction de déploiement ne stocke que le hash — pas les détails de votre stratégie personnelle.',
  'What happens next': 'Que se passe-t-il ensuite',
  'Your mandate is now live. Assign it to an agent in':
    'Votre mandat est maintenant actif. Attribuez-le à un agent dans',
  'Dashboard → Agents → Deploy New Agent': 'Tableau de bord → Agents → Déployer un nouvel agent',
  'and the agent will execute trades that conform to your policy, with every decision logged on-chain.':
    'et l\'agent exécutera des transactions conformes à votre politique, chaque décision étant enregistrée on-chain.',

  // ─── Deploy your first AI agent ─────────────────────────────────────────────
  "An agent is an automated process that monitors markets in real-time and executes trades when your mandate's conditions are met. Each agent is bound to exactly one mandate on-chain.":
    'Un agent est un processus automatisé qui surveille les marchés en temps réel et exécute des transactions lorsque les conditions de votre mandat sont remplies. Chaque agent est lié à exactement un mandat on-chain.',
  'Prerequisites': 'Prérequis',
  'A deployed mandate (see': 'Un mandat déployé (voir',
  'Write your first mandate': 'Rédigez votre premier mandat',
  'A connected wallet (MetaMask or WalletConnect)': 'Un portefeuille connecté (MetaMask ou WalletConnect)',
  'Bybit API keys added in': 'Clés API Bybit ajoutées dans',
  'Settings → API Keys': 'Paramètres → Clés API',
  'Read + Trade permissions': 'Permissions Lecture + Trading',
  'Step 1 — Open the deploy wizard': 'Étape 1 — Ouvrez l\'assistant de déploiement',
  'The 4-step wizard opens.': 'L\'assistant en 4 étapes s\'ouvre.',
  'Step 2 — Select your mandate': 'Étape 2 — Sélectionnez votre mandat',
  'Choose the mandate this agent will follow. The policy hash is displayed — verify it matches what you see on the Mandates page.':
    'Choisissez le mandat que cet agent suivra. Le hash de politique est affiché — vérifiez qu\'il correspond à celui que vous voyez sur la page Mandats.',
  'Step 3 — Set execution parameters': 'Étape 3 — Définissez les paramètres d\'exécution',
  'Capital allocation': 'Allocation de capital',
  '— the USD amount the agent is allowed to deploy (e.g. $5,000)':
    '— le montant en USD que l\'agent est autorisé à déployer (ex. 5 000 $)',
  'Max position size': 'Taille de position maximale',
  '— largest single trade as % of allocation (e.g. 2% = max $100 per trade on a $5,000 allocation)':
    '— la plus grande transaction unique en % de l\'allocation (ex. 2 % = max 100 $ par transaction sur une allocation de 5 000 $)',
  'Allowed pairs': 'Paires autorisées',
  '— which assets the agent may trade (ETHUSDT, BTCUSDT, MANTUSDT)':
    '— quels actifs l\'agent peut trader (ETHUSDT, BTCUSDT, MANTUSDT)',
  'Execution mode': 'Mode d\'exécution',
  '— Live (real orders) or Paper (simulated, no real trades)':
    '— Live (ordres réels) ou Paper (simulé, aucune transaction réelle)',
  "Start in Paper mode until you've verified the agent behaves as expected. You can switch to Live at any time from the agent detail page.":
    'Commencez en mode Paper jusqu\'à ce que vous ayez vérifié que l\'agent se comporte comme prévu. Vous pouvez passer en mode Live à tout moment depuis la page de détail de l\'agent.',
  'Step 4 — Deploy on-chain': 'Étape 4 — Déployez on-chain',
  'Deploy Agent': 'Déployer l\'agent',
  'Your wallet signs a transaction calling': 'Votre portefeuille signe une transaction appelant',
  ', registering the agent with its policy hash. Gas on Mantle is typically less than $0.01.':
    ', enregistrant l\'agent avec son hash de politique. Le gas sur Mantle coûte généralement moins de 0,01 $.',
  'Monitoring your agent': 'Surveiller votre agent',
  'Once deployed, the agent appears in': 'Une fois déployé, l\'agent apparaît dans',
  'Dashboard → Agents': 'Tableau de bord → Agents',
  'with status': 'avec le statut',
  '. Click into the agent to see real-time logs, position history, and the on-chain audit trail.':
    '. Cliquez sur l\'agent pour voir les journaux en temps réel, l\'historique des positions et la piste d\'audit on-chain.',

  // ─── Connect your wallet ─────────────────────────────────────────────────────
  'Your wallet is your identity on Mantle. MantleMandate uses it to sign mandate deployments and authenticate on-chain agent registrations. Your private key never leaves your device.':
    'Votre portefeuille est votre identité sur Mantle. MantleMandate l\'utilise pour signer les déploiements de mandats et authentifier les enregistrements d\'agents on-chain. Votre clé privée ne quitte jamais votre appareil.',
  'Supported wallets': 'Portefeuilles pris en charge',
  'recommended for desktop': 'recommandé pour ordinateur',
  'Rainbow, Trust Wallet, Coinbase Wallet, Ledger Live, and 300+ others':
    'Rainbow, Trust Wallet, Coinbase Wallet, Ledger Live, et plus de 300 autres',
  'Injected provider': 'Fournisseur injecté',
  'any EIP-1193 compatible browser extension': 'toute extension de navigateur compatible EIP-1193',
  'How to connect': 'Comment se connecter',
  'Connect Wallet': 'Connecter le portefeuille',
  "in the top navigation bar. Select your provider. Approve the connection in your wallet app. You'll be asked to sign a message (no gas fee) to prove ownership.":
    'dans la barre de navigation supérieure. Sélectionnez votre fournisseur. Approuvez la connexion dans votre application de portefeuille. Il vous sera demandé de signer un message (sans frais de gas) pour prouver la propriété.',
  'Switch to Mantle Network': 'Passer au réseau Mantle',
  'If your wallet is on Ethereum or another chain, MantleMandate will prompt you to switch. Click':
    'Si votre portefeuille est sur Ethereum ou une autre chaîne, MantleMandate vous invitera à changer. Cliquez sur',
  'and approve in your wallet.': 'et approuvez dans votre portefeuille.',
  'Switch Network': 'Changer de réseau',
  'Disconnect or switch wallet': 'Déconnecter ou changer de portefeuille',
  'Dashboard → Wallets': 'Tableau de bord → Portefeuilles',
  'Disconnect': 'Déconnecter',
  'next to the active wallet. You can then connect a different address. Note: disconnecting from the app does not revoke on-chain permissions — your deployed mandates remain active.':
    'à côté du portefeuille actif. Vous pouvez ensuite connecter une adresse différente. Remarque : la déconnexion de l\'application ne révoque pas les permissions on-chain — vos mandats déployés restent actifs.',
  'MantleMandate is fully non-custodial. We never store, request, or have access to your private keys.':
    'MantleMandate est entièrement non-custodial. Nous ne stockons, ne demandons et n\'avons jamais accès à vos clés privées.',

  // ─── Understanding risk parameters ──────────────────────────────────────────
  "Risk parameters are the safety guardrails that limit your agent's maximum exposure. They are enforced by":
    'Les paramètres de risque sont les garde-fous de sécurité qui limitent l\'exposition maximale de votre agent. Ils sont appliqués par',
  'on Mantle — the agent cannot bypass them regardless of market conditions or mandate instructions.':
    'sur Mantle — l\'agent ne peut pas les contourner, quelles que soient les conditions du marché ou les instructions du mandat.',
  'Max Drawdown %': 'Drawdown maximal (%)',
  'A circuit breaker that automatically pauses your agent when the portfolio drops this percentage from its peak value (high-water mark). The agent sends you an alert and halts all new orders.':
    'Un disjoncteur qui met automatiquement votre agent en pause lorsque le portefeuille chute de ce pourcentage par rapport à sa valeur maximale (plus haut historique). L\'agent vous envoie une alerte et arrête tous les nouveaux ordres.',
  'Max Notional per Trade': 'Notionnel maximal par transaction',
  'The maximum USD value of a single order. Prevents the agent from concentrating too much capital in one trade.':
    'La valeur maximale en USD d\'un ordre unique. Empêche l\'agent de concentrer trop de capital dans une seule transaction.',
  'Stop-Loss %': 'Stop-loss (%)',
  'When an open position moves against you by this percentage, the agent automatically closes it. Calculated from your average entry price.':
    'Lorsqu\'une position ouverte évolue contre vous de ce pourcentage, l\'agent la clôture automatiquement. Calculé à partir de votre prix d\'entrée moyen.',
  'Recommended starting values': 'Valeurs de départ recommandées',
  'Max Drawdown:': 'Drawdown maximal :',
  'for conservative, 20% for aggressive': 'pour conservateur, 20 % pour agressif',
  'Max Notional:': 'Notionnel maximal :',
  'of allocation per trade': 'de l\'allocation par transaction',
  'Stop-Loss:': 'Stop-loss :',
  'for spot, 1–2% for high-frequency': 'pour le spot, 1–2 % pour le haute fréquence',
  'Never set Max Drawdown above 25% for fully automated strategies. Start conservative and loosen limits only after observing the agent in paper mode.':
    'Ne définissez jamais le drawdown maximal au-dessus de 25 % pour des stratégies entièrement automatisées. Commencez de manière conservatrice et n\'assouplissez les limites qu\'après avoir observé l\'agent en mode paper.',

  // ─── What is a Mandate? ──────────────────────────────────────────────────────
  'A mandate is the core governance primitive of MantleMandate. It is a plain-English description of your trading strategy that Claude compiles into a structured, cryptographically verifiable policy stored on the Mantle blockchain.':
    'Un mandat est la primitive de gouvernance centrale de MantleMandate. C\'est une description en langage simple de votre stratégie de trading que Claude compile en une politique structurée et cryptographiquement vérifiable, stockée sur la blockchain Mantle.',
  'Why mandates?': 'Pourquoi des mandats ?',
  'Traditional algorithmic trading requires you to write code. Mandates let you describe your strategy in plain English — Claude handles the translation. You define the rules; the AI and the blockchain enforce them.':
    'Le trading algorithmique traditionnel exige d\'écrire du code. Les mandats vous permettent de décrire votre stratégie en langage simple — Claude se charge de la traduction. Vous définissez les règles ; l\'IA et la blockchain les appliquent.',
  'The mandate lifecycle': 'Le cycle de vie du mandat',
  'Write': 'Rédiger',
  'You describe your strategy in plain English': 'Vous décrivez votre stratégie en langage simple',
  'Parse': 'Analyser',
  'Claude extracts structured rules into JSON': 'Claude extrait des règles structurées en JSON',
  'Hash': 'Hacher',
  'The JSON policy is hashed with keccak256': 'La politique JSON est hachée avec keccak256',
  'Register': 'Enregistrer',
  'The hash is stored on': 'Le hash est stocké sur',
  'on Mantle': 'sur Mantle',
  'Execute': 'Exécuter',
  'Every agent decision is validated against the hash': 'Chaque décision de l\'agent est validée par rapport au hash',
  'All executions are logged on-chain, immutably': 'Toutes les exécutions sont enregistrées on-chain, de manière immuable',
  'What a mandate can specify': 'Ce qu\'un mandat peut spécifier',
  'Asset pairs (ETHUSDT, BTCUSDT, MANTUSDT, and more)': 'Paires d\'actifs (ETHUSDT, BTCUSDT, MANTUSDT, et plus)',
  'Entry triggers: RSI thresholds, moving average crossovers, price levels, volume conditions':
    'Déclencheurs d\'entrée : seuils RSI, croisements de moyennes mobiles, niveaux de prix, conditions de volume',
  'Exit triggers: take-profit %, trailing stop, time-based expiry':
    'Déclencheurs de sortie : take-profit en %, stop suiveur, expiration basée sur le temps',
  'Position sizing: fixed USD, % of portfolio, Kelly criterion (beta)':
    'Dimensionnement des positions : USD fixe, % du portefeuille, critère de Kelly (bêta)',
  'Time constraints: allowed trading hours, blackout periods, max hold duration':
    'Contraintes temporelles : heures de trading autorisées, périodes d\'interdiction, durée de détention maximale',
  'Risk limits: stop-loss %, max drawdown, max notional per trade':
    'Limites de risque : stop-loss en %, drawdown maximal, notionnel maximal par transaction',
  'What a mandate cannot do': 'Ce qu\'un mandat ne peut pas faire',
  'Override': 'Outrepasser',
  "'s hard limits — they are enforced on-chain": 'ses limites strictes — elles sont appliquées on-chain',
  "Access funds outside the agent's allocated capital": 'Accéder à des fonds en dehors du capital alloué à l\'agent',
  'Trade pairs or protocols not whitelisted in your policy': 'Trader des paires ou protocoles non whitelistés dans votre politique',
  'Each mandate has a unique policy hash. If you edit your strategy, a new hash is generated and a new registration is required — preserving the full audit history of your original mandate.':
    'Chaque mandat possède un hash de politique unique. Si vous modifiez votre stratégie, un nouveau hash est généré et un nouvel enregistrement est requis — ce qui préserve l\'historique d\'audit complet de votre mandat original.',

  // ─── AI Agent Lifecycle ──────────────────────────────────────────────────────
  'An agent moves through a defined set of states from deployment to termination. Understanding the lifecycle helps you manage agents effectively and interpret the status indicators in the dashboard.':
    'Un agent traverse un ensemble défini d\'états, du déploiement à la terminaison. Comprendre ce cycle de vie vous aide à gérer efficacement les agents et à interpréter les indicateurs de statut dans le tableau de bord.',
  'States': 'États',
  'On-chain registration transaction is pending': 'La transaction d\'enregistrement on-chain est en attente',
  'Agent is active, monitoring markets, and executing trades': 'L\'agent est actif, surveille les marchés et exécute des transactions',
  'Temporarily halted (manual pause or circuit breaker triggered). Resumes when you click Resume or the condition clears.':
    'Temporairement arrêté (pause manuelle ou disjoncteur déclenché). Reprend lorsque vous cliquez sur Relancer ou que la condition se résout.',
  'Permanently halted. Requires manual review before reactivation. Triggered by critical errors or mandate revocation.':
    'Arrêté définitivement. Nécessite une révision manuelle avant la réactivation. Déclenché par des erreurs critiques ou la révocation du mandat.',
  'Agent ran its full intended duration and exited cleanly': 'L\'agent a exécuté toute sa durée prévue et s\'est arrêté proprement',
  'The execution loop': 'La boucle d\'exécution',
  'Every': 'Toutes les',
  '30 seconds': '30 secondes',
  'a RUNNING agent:': 'un agent en cours d\'exécution :',
  'Fetches the latest market data from Bybit (price, volume, indicators)':
    'Récupère les dernières données de marché depuis Bybit (prix, volume, indicateurs)',
  'Reads current on-chain state (block number, gas price) from the Mantle RPC':
    'Lit l\'état on-chain actuel (numéro de bloc, prix du gas) depuis le RPC Mantle',
  'Calls the AI decision engine with the market snapshot and mandate policy':
    'Appelle le moteur de décision IA avec l\'instantané du marché et la politique du mandat',
  'If the AI recommends a trade, calls': 'Si l\'IA recommande une transaction, appelle',
  'to validate the order': 'pour valider l\'ordre',
  'If validation passes, submits the order to Bybit and emits an':
    'Si la validation réussit, soumet l\'ordre à Bybit et émet un',
  'event on Mantle': 'événement sur Mantle',
  'Circuit breakers': 'Disjoncteurs',
  'The agent pauses automatically when:': 'L\'agent se met en pause automatiquement lorsque :',
  'Portfolio drawdown exceeds the Max Drawdown % parameter': 'Le drawdown du portefeuille dépasse le paramètre de drawdown maximal en %',
  'A single order would exceed the Max Notional per Trade limit': 'Un seul ordre dépasserait la limite de notionnel maximal par transaction',
  'Three consecutive API errors occur (Bybit rate limit or network issue)':
    'Trois erreurs API consécutives se produisent (limite de débit Bybit ou problème réseau)',
  'The mandate policy hash cannot be verified on-chain': 'Le hash de politique du mandat ne peut pas être vérifié on-chain',
  'Resuming a paused agent': 'Relancer un agent en pause',
  'click the agent, then click': 'cliquez sur l\'agent, puis cliquez sur',
  'Resume': 'Relancer',
  'Resolve the underlying issue first — resuming without fixing the root cause will trigger the same pause again.':
    'Résolvez d\'abord le problème sous-jacent — relancer sans corriger la cause profonde déclenchera à nouveau la même pause.',

  // ─── On-Chain Execution Model ────────────────────────────────────────────────
  'MantleMandate uses Mantle Network as its settlement and audit layer. Every mandate deployment, agent registration, and trade execution is recorded on-chain — creating a tamper-proof compliance trail.':
    'MantleMandate utilise Mantle Network comme couche de règlement et d\'audit. Chaque déploiement de mandat, enregistrement d\'agent et exécution de transaction est enregistré on-chain — créant une piste de conformité infalsifiable.',
  'Why Mantle?': 'Pourquoi Mantle ?',
  'Mantle is an EVM-compatible Layer 2 built on Ethereum with near-instant finality and gas costs under $0.01. This makes it practical to record individual trades on-chain — something that would be prohibitively expensive on Ethereum mainnet.':
    'Mantle est une Layer 2 compatible EVM construite sur Ethereum, avec une finalité quasi instantanée et des coûts de gas inférieurs à 0,01 $. Cela rend pratique l\'enregistrement de transactions individuelles on-chain — ce qui serait prohibitif sur le mainnet Ethereum.',
  'The three contracts': 'Les trois contrats',
  'stores and verifies policy hashes. Called when you deploy a mandate.':
    'stocke et vérifie les hash de politique. Appelé lorsque vous déployez un mandat.',
  'registers agents and emits': 'enregistre les agents et émet',
  'events. Called by the execution engine after every successful trade.':
    'des événements. Appelé par le moteur d\'exécution après chaque transaction réussie.',
  'validates each proposed order against configured risk limits. Called before every trade.':
    'valide chaque ordre proposé par rapport aux limites de risque configurées. Appelé avant chaque transaction.',
  'Transaction flow for a single trade': 'Flux de transaction pour une transaction unique',
  'Verifying a trade on Mantle Explorer': 'Vérifier une transaction sur Mantle Explorer',
  'event in the Audit tab has a TX hash. Clicking it opens the transaction on Mantle Explorer where you can inspect the full event log, including the policy hash that authorised the trade.':
    'dans l\'onglet Audit possède un hash de transaction. En cliquant sur celui-ci, vous ouvrez la transaction sur Mantle Explorer où vous pouvez inspecter le journal complet des événements, y compris le hash de politique qui a autorisé la transaction.',
  'The on-chain record cannot be modified or deleted. Even if you revoke a mandate, past executions remain permanently visible — providing a complete, trustless audit trail.':
    'L\'enregistrement on-chain ne peut être ni modifié ni supprimé. Même si vous révoquez un mandat, les exécutions passées restent visibles de manière permanente — fournissant une piste d\'audit complète et sans confiance requise.',

  // ─── Risk Engine Deep Dive ───────────────────────────────────────────────────
  'The risk engine is a two-layer system: an off-chain pre-check powered by the AI decision engine, and an on-chain hard stop enforced by':
    'Le moteur de risque est un système à deux couches : une pré-vérification hors chaîne alimentée par le moteur de décision IA, et un arrêt strict on-chain appliqué par',
  'Both must pass before a trade executes.': 'Les deux doivent réussir avant qu\'une transaction ne s\'exécute.',
  'Layer 1 — AI pre-check (off-chain)': 'Couche 1 — Pré-vérification IA (hors chaîne)',
  "Before proposing any order, the AI engine checks the mandate's own risk rules:":
    'Avant de proposer un ordre, le moteur IA vérifie les propres règles de risque du mandat :',
  "Is the proposed order within the mandate's position sizing rules?":
    'L\'ordre proposé respecte-t-il les règles de dimensionnement des positions du mandat ?',
  'Is the current portfolio below the drawdown limit?': 'Le portefeuille actuel est-il sous la limite de drawdown ?',
  "Is this trade within the mandate's allowed trading hours?":
    'Cette transaction se situe-t-elle dans les heures de trading autorisées par le mandat ?',
  "Does the order respect the mandate's stop-loss configuration?":
    'L\'ordre respecte-t-il la configuration du stop-loss du mandat ?',
  'If any check fails, the AI logs the rejection and skips the cycle. No blockchain transaction is created.':
    'Si une vérification échoue, l\'IA enregistre le rejet et passe le cycle. Aucune transaction blockchain n\'est créée.',
  'Layer 2 — RiskGuard.sol (on-chain)': 'Couche 2 — RiskGuard.sol (on-chain)',
  'Even if the AI approves the trade,': 'Même si l\'IA approuve la transaction,',
  'performs its own independent validation using the risk parameters you set in':
    'effectue sa propre validation indépendante en utilisant les paramètres de risque que vous avez définis dans',
  'Dashboard → Risk': 'Tableau de bord → Risque',
  'This function reverts if:': 'Cette fonction revient en arrière (revert) si :',
  'exceeds the Max Notional per Trade limit': 'dépasse la limite de notionnel maximal par transaction',
  'exceeds the Max Drawdown basis points': 'dépasse les points de base du drawdown maximal',
  'The agent is not registered under the given': 'L\'agent n\'est pas enregistré sous le',
  'Why two layers?': 'Pourquoi deux couches ?',
  'The off-chain AI check is fast and catches most rejections without spending gas. The on-chain check is the unforgeable backstop — it cannot be bypassed even if the AI engine is compromised or produces incorrect output.':
    'La vérification IA hors chaîne est rapide et intercepte la plupart des rejets sans consommer de gas. La vérification on-chain est le filet de sécurité infalsifiable — elle ne peut pas être contournée même si le moteur IA est compromis ou produit un résultat incorrect.',
  'The on-chain limits are independent of your mandate\'s rules. Even if your mandate says "risk 10% per trade," RiskGuard will reject the order if you\'ve configured a 2% Max Notional limit in the Risk dashboard.':
    'Les limites on-chain sont indépendantes des règles de votre mandat. Même si votre mandat indique « risquer 10 % par transaction », RiskGuard rejettera l\'ordre si vous avez configuré une limite de notionnel maximal de 2 % dans le tableau de bord Risque.',

  // ─── API Reference — Authentication & JWT ───────────────────────────────────
  "All MantleMandate API endpoints require a valid JWT issued by Supabase Auth. The JWT is automatically attached to requests when you're signed in via the dashboard. For direct API access, obtain a token using the auth endpoint below.":
    'Tous les points de terminaison de l\'API MantleMandate nécessitent un JWT valide émis par Supabase Auth. Le JWT est automatiquement attaché aux requêtes lorsque vous êtes connecté via le tableau de bord. Pour un accès direct à l\'API, obtenez un jeton à l\'aide du point de terminaison d\'authentification ci-dessous.',
  'Obtain a token': 'Obtenir un jeton',
  'Use the token': 'Utiliser le jeton',
  'Pass the access token in the': 'Transmettez le jeton d\'accès dans l\'en-tête',
  'header on every API request:': 'pour chaque requête API :',
  'Token expiry & refresh': 'Expiration et rafraîchissement du jeton',
  'Access tokens expire after': 'Les jetons d\'accès expirent après',
  '1 hour': '1 heure',
  'Use the refresh token to obtain a new access token without re-entering credentials:':
    'Utilisez le jeton de rafraîchissement pour obtenir un nouveau jeton d\'accès sans ressaisir vos identifiants :',
  'Error responses': 'Réponses d\'erreur',
  'missing or invalid token': 'jeton manquant ou invalide',
  'token is valid but lacks permission for this resource': 'le jeton est valide mais ne dispose pas de la permission pour cette ressource',

  // ─── API Reference — Mandates endpoints ─────────────────────────────────────
  'The Mandates API lets you list, create, and inspect mandates programmatically.':
    'L\'API Mandats vous permet de lister, créer et inspecter des mandats par programmation.',
  'List mandates': 'Lister les mandats',
  'Parse a mandate (preview only)': 'Analyser un mandat (aperçu uniquement)',
  'Deploy a mandate': 'Déployer un mandat',
  'Get a mandate': 'Obtenir un mandat',

  // ─── API Reference — Agents & deploy lifecycle ──────────────────────────────
  'The Agents API manages agent deployment, status queries, and lifecycle control.':
    'L\'API Agents gère le déploiement des agents, les requêtes de statut et le contrôle du cycle de vie.',
  'List agents': 'Lister les agents',
  'Deploy an agent': 'Déployer un agent',
  'Pause / Resume an agent': 'Mettre en pause / Relancer un agent',
  'Agent decision log': 'Journal de décision de l\'agent',

  // ─── API Reference — WebSocket event stream ─────────────────────────────────
  'The WebSocket event stream delivers real-time updates for agent events, trade executions, and risk alerts without polling.':
    'Le flux d\'événements WebSocket fournit des mises à jour en temps réel pour les événements d\'agent, les exécutions de transactions et les alertes de risque, sans interrogation périodique.',
  'Connect': 'Connecter',
  'Event types': 'Types d\'événements',
  'a trade was placed and logged on-chain': 'une transaction a été passée et enregistrée on-chain',
  'circuit breaker triggered or manual pause': 'disjoncteur déclenché ou pause manuelle',
  'agent restarted': 'agent relancé',
  'portfolio drawdown exceeded warning threshold (80% of limit)':
    'le drawdown du portefeuille a dépassé le seuil d\'avertissement (80 % de la limite)',
  'an action would violate the mandate policy (blocked)': 'une action violerait la politique du mandat (bloquée)',
  'Sample event payload': 'Exemple de charge utile d\'événement',
  'The WebSocket stream is powered by Supabase Realtime. All events are also persisted to the':
    'Le flux WebSocket est alimenté par Supabase Realtime. Tous les événements sont également persistés dans les tables',
  'and': 'et',
  'tables, queryable via the REST API.': ', interrogeables via l\'API REST.',

  // ─── Smart Contracts — MandatePolicy ────────────────────────────────────────
  "is the immutable on-chain registry of mandate policy hashes. It provides a trustless proof that your agent's decisions are governed by your stated strategy.":
    'est le registre on-chain immuable des hash de politique de mandat. Il fournit une preuve sans confiance requise que les décisions de votre agent sont gouvernées par la stratégie que vous avez déclarée.',
  'Contract address': 'Adresse du contrat',
  'Key functions': 'Fonctions clés',
  'Called when you deploy a mandate. Stores the keccak256 hash of your JSON policy alongside the authorised agent address.':
    'Appelé lorsque vous déployez un mandat. Stocke le hash keccak256 de votre politique JSON ainsi que l\'adresse de l\'agent autorisé.',
  'Called by': 'Appelé par',
  'before every trade. Returns': 'avant chaque transaction. Retourne',
  'if the agent is registered under the given hash. If': 'si l\'agent est enregistré sous le hash donné. Si',
  ', the trade is rejected.': ', la transaction est rejetée.',
  'Permanently revokes a mandate. Stops the registered agent immediately. Past executions remain on-chain.':
    'Révoque définitivement un mandat. Arrête immédiatement l\'agent enregistré. Les exécutions passées restent on-chain.',
  'Events': 'Événements',

  // ─── Smart Contracts — AgentExecutor ────────────────────────────────────────
  'is the execution gateway. It validates that an order is permitted by its mandate policy, calls':
    'est la passerelle d\'exécution. Il valide qu\'un ordre est autorisé par sa politique de mandat, appelle',
  'for risk checks, and emits the on-chain audit event after a successful trade.':
    'pour les vérifications de risque, et émet l\'événement d\'audit on-chain après une transaction réussie.',
  'Called by the off-chain execution engine after an order is placed on Bybit. The function verifies the policy hash, calls RiskGuard, and emits the audit event.':
    'Appelé par le moteur d\'exécution hors chaîne après qu\'un ordre a été passé sur Bybit. La fonction vérifie le hash de politique, appelle RiskGuard et émet l\'événement d\'audit.',
  'The OrderExecuted event': 'L\'événement OrderExecuted',
  'This event is the canonical on-chain record of every trade. It appears in the Audit tab and can be independently verified on Mantle Explorer.':
    'Cet événement est l\'enregistrement on-chain canonique de chaque transaction. Il apparaît dans l\'onglet Audit et peut être vérifié indépendamment sur Mantle Explorer.',
  'Failure modes': 'Modes d\'échec',
  'policyHash is not registered in MandatePolicy': 'policyHash n\'est pas enregistré dans MandatePolicy',
  'caller is not the registered agent for this hash': 'l\'appelant n\'est pas l\'agent enregistré pour ce hash',
  'RiskGuard rejected the order (returns reason string)': 'RiskGuard a rejeté l\'ordre (retourne une chaîne de motif)',

  // ─── Smart Contracts — RiskGuard ────────────────────────────────────────────
  'is the on-chain enforcement layer for risk parameters. It is the final, unforgeable check before any trade is logged. No agent can bypass it.':
    'est la couche d\'application on-chain pour les paramètres de risque. C\'est la dernière vérification infalsifiable avant l\'enregistrement de toute transaction. Aucun agent ne peut la contourner.',
  'Called when you save new risk parameters in': 'Appelé lorsque vous enregistrez de nouveaux paramètres de risque dans',
  'Only the account owner (you) can set limits for your agents.':
    'Seul le propriétaire du compte (vous) peut définir des limites pour vos agents.',
  'Returns': 'Retourne',
  'with a human-readable reason if any limit is breached.': 'avec un motif lisible si une limite est dépassée.',
  'calls this before emitting': 'appelle ceci avant d\'émettre',
  'Basis points reference': 'Référence des points de base',

  // ─── Smart Contracts — Contract addresses & ABIs ────────────────────────────
  'All MantleMandate contracts are deployed on Mantle Sepolia (testnet). Mainnet deployment is in progress and contract addresses will be published here upon launch.':
    'Tous les contrats MantleMandate sont déployés sur Mantle Sepolia (testnet). Le déploiement sur le mainnet est en cours et les adresses des contrats seront publiées ici lors du lancement.',
  'Mantle Sepolia': 'Mantle Sepolia',
  'Verify contracts': 'Vérifier les contrats',
  'All contracts are verified on Mantle Explorer. You can read the ABI, call read-only functions, and inspect transaction history directly from the explorer without any additional tools.':
    'Tous les contrats sont vérifiés sur Mantle Explorer. Vous pouvez lire l\'ABI, appeler des fonctions en lecture seule et inspecter l\'historique des transactions directement depuis l\'explorateur, sans aucun outil supplémentaire.',
  'Download ABIs': 'Télécharger les ABI',
  'ABIs are available in the': 'Les ABI sont disponibles dans le répertoire',
  'directory of the open-source repository. They are automatically generated from the Solidity source using Hardhat + TypeChain.':
    'du dépôt open-source. Ils sont générés automatiquement à partir du code source Solidity à l\'aide de Hardhat + TypeChain.',
  'Interact with contracts directly': 'Interagir directement avec les contrats',

  // ─── Mandate Syntax — Supported indicators & triggers ───────────────────────
  'Claude understands a wide range of technical indicators and market conditions. Use these terms in your mandate and they will be correctly extracted into the policy JSON.':
    'Claude comprend un large éventail d\'indicateurs techniques et de conditions de marché. Utilisez ces termes dans votre mandat et ils seront correctement extraits dans la politique JSON.',
  'Price-based triggers': 'Déclencheurs basés sur le prix',
  'absolute price level': 'niveau de prix absolu',
  'relative to moving average': 'par rapport à la moyenne mobile',
  'proximity condition': 'condition de proximité',
  'breakout trigger': 'déclencheur de cassure',
  'Momentum indicators': 'Indicateurs de momentum',
  'Relative Strength Index (1h default, specify timeframe)': 'Indice de force relative (1h par défaut, précisez l\'intervalle)',
  'MACD crossover': 'croisement MACD',
  'Volume triggers': 'Déclencheurs de volume',
  'volume spike': 'pic de volume',
  'On-Balance Volume': 'On-Balance Volume',
  'Time-based rules': 'Règles basées sur le temps',
  'Compound conditions': 'Conditions composées',
  'Combine triggers with AND / OR. Claude correctly handles complex logic:':
    'Combinez les déclencheurs avec AND / OR. Claude gère correctement la logique complexe :',

  // ─── Mandate Syntax — Risk rule syntax reference ────────────────────────────
  "Risk rules define the boundaries of your agent's exposure. Claude recognises the following patterns — use whichever phrasing feels natural.":
    'Les règles de risque définissent les limites de l\'exposition de votre agent. Claude reconnaît les modèles suivants — utilisez la formulation qui vous semble la plus naturelle.',
  'Position sizing': 'Dimensionnement des positions',
  'Stop-loss': 'Stop-loss',
  'Take-profit': 'Take-profit',
  'Drawdown circuit breakers': 'Disjoncteurs de drawdown',
  'Risk rules in your mandate text and risk parameters in Dashboard → Risk are independent. The stricter of the two always applies. When in doubt, set conservative limits in both places.':
    'Les règles de risque dans le texte de votre mandat et les paramètres de risque dans Tableau de bord → Risque sont indépendants. Le plus strict des deux s\'applique toujours. En cas de doute, définissez des limites conservatrices aux deux endroits.',

  // ─── Mandate Syntax — Example mandates library ──────────────────────────────
  'Copy any of these mandates directly into the New Mandate text area. Adjust thresholds to suit your risk tolerance.':
    'Copiez l\'un de ces mandats directement dans la zone de texte Nouveau mandat. Ajustez les seuils selon votre tolérance au risque.',
  'RSI Mean Reversion (Conservative)': 'Retour à la moyenne RSI (Conservateur)',
  'Trend Following (Moderate)': 'Suivi de tendance (Modéré)',
  'Multi-Asset Rotation (Aggressive)': 'Rotation multi-actifs (Agressif)',
  'DeFi Yield Entry': 'Entrée Yield DeFi',

  // ─── Mandate Syntax — Common mistakes & gotchas ─────────────────────────────
  'These are the most frequent issues users encounter when writing mandates, and how to avoid them.':
    'Voici les problèmes les plus fréquents rencontrés par les utilisateurs lors de la rédaction de mandats, et comment les éviter.',
  '1. Conflicting rules': '1. Règles contradictoires',
  'Writing rules that contradict each other causes the AI to skip cycles or behave unpredictably.':
    'Écrire des règles qui se contredisent fait que l\'IA passe des cycles ou se comporte de manière imprévisible.',
  '2. Missing exit conditions': '2. Conditions de sortie manquantes',
  'Every entry rule needs a corresponding exit rule. Without one, the agent holds the position indefinitely.':
    'Chaque règle d\'entrée nécessite une règle de sortie correspondante. Sans cela, l\'agent conserve la position indéfiniment.',
  '3. Too many conditions': '3. Trop de conditions',
  'More than 4–5 compound AND conditions rarely all trigger simultaneously. Your agent will never trade.':
    'Plus de 4 à 5 conditions composées AND se déclenchent rarement toutes simultanément. Votre agent ne tradera jamais.',
  '4. No risk limits': '4. Aucune limite de risque',
  'Without position sizing rules, the agent will use default limits (2% max notional). Always be explicit.':
    'Sans règles de dimensionnement des positions, l\'agent utilisera les limites par défaut (2 % de notionnel maximal). Soyez toujours explicite.',
  '5. Forgetting the RiskGuard override': '5. Oublier le remplacement par RiskGuard',
  "Your mandate's risk rules and the Dashboard → Risk parameters are": 'Les règles de risque de votre mandat et les paramètres de Tableau de bord → Risque sont',
  'independent': 'indépendants',
  '. If your mandate says "risk 5% per trade" but RiskGuard is set to 2%, the 2% limit wins. Check both places.':
    '. Si votre mandat indique « risquer 5 % par transaction » mais que RiskGuard est réglé sur 2 %, la limite de 2 % prévaut. Vérifiez les deux endroits.',

  // ─── Integrations — Bybit market data adapter ───────────────────────────────
  'All USDT spot pairs available on Bybit are supported. MantleMandate recommends starting with high-liquidity pairs:':
    'Toutes les paires spot USDT disponibles sur Bybit sont prises en charge. MantleMandate recommande de commencer avec des paires à forte liquidité :',

  // ─── Page shell — categories, headers, search ───────────────────────────────
  '{n} min read': '{n} min de lecture',
  'Getting Started': 'Premiers pas',
  'Up and running in 5 minutes': 'Opérationnel en 5 minutes',
  'Deploy your first AI agent': 'Déployez votre premier agent IA',
  'Connect your wallet': 'Connectez votre portefeuille',
  'Understanding risk parameters': 'Comprendre les paramètres de risque',
  'Core Concepts': 'Concepts de base',
  'How MantleMandate works under the hood': 'Comment MantleMandate fonctionne en interne',
  'What is a Mandate?': 'Qu\'est-ce qu\'un mandat ?',
  'AI Agent Lifecycle': 'Cycle de vie de l\'agent IA',
  'On-Chain Execution Model': 'Modèle d\'exécution on-chain',
  'Risk Engine Deep Dive': 'Approfondissement du moteur de risque',
  'API Reference': 'Référence API',
  'Full REST & WebSocket API docs': 'Documentation complète de l\'API REST et WebSocket',
  'Authentication & JWT tokens': 'Authentification et jetons JWT',
  'Mandates endpoints': 'Points de terminaison Mandats',
  'Agents & deploy lifecycle': 'Agents et cycle de déploiement',
  'WebSocket event stream': 'Flux d\'événements WebSocket',
  'Smart Contracts': 'Contrats intelligents',
  'Deployed on Mantle Testnet': 'Déployé sur le testnet Mantle',
  'MandatePolicy — store & verify': 'MandatePolicy — stocker et vérifier',
  'AgentExecutor — execute trades': 'AgentExecutor — exécuter des transactions',
  'RiskGuard — enforce limits': 'RiskGuard — appliquer les limites',
  'Contract addresses & ABIs': 'Adresses des contrats et ABI',
  'Mandate Syntax': 'Syntaxe des mandats',
  'Writing rules the AI understands': 'Rédiger des règles que l\'IA comprend',
  'Supported indicators & triggers': 'Indicateurs et déclencheurs pris en charge',
  'Risk rule syntax reference': 'Référence de syntaxe des règles de risque',
  'Example mandates library': 'Bibliothèque d\'exemples de mandats',
  'Common mistakes & gotchas': 'Erreurs courantes et pièges',
  'Integrations': 'Intégrations',
  'Connect your tools and workflows': 'Connectez vos outils et flux de travail',
  'Webhook events setup': 'Configuration des événements webhook',
  'Slack & Telegram alerts': 'Alertes Slack et Telegram',
  'WalletConnect integration': 'Intégration WalletConnect',
  'Bybit market data adapter': 'Adaptateur de données de marché Bybit',
  'Quickstart': 'Démarrage rapide',
  'Contract ABIs': 'ABI des contrats',
  'Example Mandates': 'Exemples de mandats',
  'Back to docs': 'Retour à la documentation',
  'More in {category}': 'Plus dans {category}',
  'Everything You Need to Build': 'Tout ce dont vous avez besoin pour construire',
  'Guides, API references, smart contract docs, and integration tutorials — all in one place.':
    'Guides, références API, documentation des contrats intelligents et tutoriels d\'intégration — tout en un seul endroit.',
  'Search documentation…': 'Rechercher dans la documentation…',
  '{n} result for “{query}”': '{n} résultat pour « {query} »',
  '{n} results for “{query}”': '{n} résultats pour « {query} »',
  'No articles match “{query}”': 'Aucun article ne correspond à « {query} »',
  'View all {category} docs': 'Voir toute la documentation {category}',
  "Can't find what you're looking for?": 'Vous ne trouvez pas ce que vous cherchez ?',
  'Our team typically responds in under 2 hours.': 'Notre équipe répond généralement en moins de 2 heures.',
  'Ask Support': 'Contacter le support',
  'View External Docs': 'Voir la documentation externe',

  // ════════════════════════════════════════════════════════════════════════════
  // ─── Support page ────────────────────────────────────────────────────────────
  // ════════════════════════════════════════════════════════════════════════════

  // FAQ items
  'How do I deploy my first AI agent?': 'Comment déployer mon premier agent IA ?',
  'Go to Dashboard → Agents → New Agent. Write your mandate in plain English — for example, "Buy ETH when RSI is below 30, never risk more than 3% per trade." Claude parses it into a structured policy, which is hashed and anchored to Mantle Sepolia via the MandatePolicy contract. Click Deploy and your agent is registered on-chain and starts running automatically.':
    'Allez dans Tableau de bord → Agents → Nouvel agent. Rédigez votre mandat en langage simple — par exemple, « Acheter de l\'ETH lorsque le RSI est inférieur à 30, ne jamais risquer plus de 3 % par transaction. » Claude l\'analyse en une politique structurée, qui est hachée et ancrée sur Mantle Sepolia via le contrat MandatePolicy. Cliquez sur Déployer et votre agent est enregistré on-chain et commence à fonctionner automatiquement.',
  'What is a policy hash and why does it matter?': 'Qu\'est-ce qu\'un hash de politique et pourquoi est-ce important ?',
  'A policy hash is a keccak256 fingerprint of your mandate\'s rules, stored immutably on the MandatePolicy smart contract on Mantle. It creates a cryptographically verifiable record that your agent\'s decisions are governed by your stated policy. If an agent executes a trade that violates the hash, it is detectable on-chain — giving you a trustless compliance guarantee no centralised system can offer.':
    'Un hash de politique est une empreinte keccak256 des règles de votre mandat, stockée de manière immuable sur le contrat intelligent MandatePolicy sur Mantle. Il crée un enregistrement cryptographiquement vérifiable que les décisions de votre agent sont gouvernées par votre politique déclarée. Si un agent exécute une transaction qui viole le hash, cela est détectable on-chain — vous offrant une garantie de conformité sans confiance requise qu\'aucun système centralisé ne peut offrir.',
  'How does the plain-English mandate parser work?': 'Comment fonctionne l\'analyseur de mandat en langage simple ?',
  'The mandate parser uses Claude (claude-sonnet via OpenRouter) to extract structured trading rules from your natural-language input. It identifies: asset pairs, entry/exit triggers (RSI, price levels, time windows), position size limits, and stop-loss conditions. The output is a JSON policy object that is hashed and submitted to MandatePolicy.sol. You can review the parsed JSON before deploying.':
    'L\'analyseur de mandat utilise Claude (claude-sonnet via OpenRouter) pour extraire des règles de trading structurées à partir de votre saisie en langage naturel. Il identifie : les paires d\'actifs, les déclencheurs d\'entrée/sortie (RSI, niveaux de prix, fenêtres temporelles), les limites de taille de position et les conditions de stop-loss. Le résultat est un objet de politique JSON qui est haché et soumis à MandatePolicy.sol. Vous pouvez revoir le JSON analysé avant de déployer.',
  'My agent paused unexpectedly — what do I do?': 'Mon agent s\'est mis en pause de manière inattendue — que dois-je faire ?',
  'Check Dashboard → Protocols → History tab for the last execution log. Common causes: (1) RiskGuard circuit breaker triggered — your drawdown or notional limit was hit; (2) Bybit API key expired or was rate-limited; (3) Mantle Sepolia RPC blip. To resume: resolve the root cause, then go to Agents → select the agent → Resume. If the agent shows "STOPPED" rather than "PAUSED", contact support — a STOPPED agent requires manual review before reactivation.':
    'Consultez l\'onglet Tableau de bord → Protocoles → Historique pour le dernier journal d\'exécution. Causes courantes : (1) le disjoncteur RiskGuard s\'est déclenché — votre limite de drawdown ou de notionnel a été atteinte ; (2) la clé API Bybit a expiré ou a été limitée en débit ; (3) un incident temporaire du RPC Mantle Sepolia. Pour relancer : résolvez la cause profonde, puis allez dans Agents → sélectionnez l\'agent → Relancer. Si l\'agent affiche « STOPPED » plutôt que « PAUSED », contactez le support — un agent STOPPED nécessite une révision manuelle avant la réactivation.',
  'How to read the on-chain audit trail?': 'Comment lire la piste d\'audit on-chain ?',
  'Go to Dashboard → Audit. Each row is an OrderExecuted event emitted by the AgentExecutor contract on Mantle Sepolia. Click the TX hash column to open the transaction on Mantle Explorer. The Mandate Hash column confirms which policy authorised each trade. All events are immutable — they cannot be edited or deleted, providing a tamper-proof compliance record suitable for regulatory review.':
    'Allez dans Tableau de bord → Audit. Chaque ligne est un événement OrderExecuted émis par le contrat AgentExecutor sur Mantle Sepolia. Cliquez sur la colonne du hash de transaction pour ouvrir la transaction sur Mantle Explorer. La colonne Hash du mandat confirme quelle politique a autorisé chaque transaction. Tous les événements sont immuables — ils ne peuvent être ni modifiés ni supprimés, fournissant un enregistrement de conformité infalsifiable adapté à un examen réglementaire.',
  'Setting risk limits: drawdown, stop-loss, position sizing': 'Définir les limites de risque : drawdown, stop-loss, dimensionnement des positions',
  'In Dashboard → Risk, set: Max Drawdown % (a circuit breaker that pauses the agent when the portfolio drops this amount from its peak), Max Notional per Trade (a hard USD cap per single order), and Stop-Loss % (automatically closes a position when the unrealised loss exceeds this threshold). These limits are enforced by RiskGuard.sol on-chain — agents cannot bypass them regardless of market conditions or mandate instructions.':
    'Dans Tableau de bord → Risque, définissez : Drawdown maximal en % (un disjoncteur qui met l\'agent en pause lorsque le portefeuille chute de ce montant par rapport à son pic), Notionnel maximal par transaction (un plafond strict en USD par ordre unique), et Stop-loss en % (clôture automatiquement une position lorsque la perte latente dépasse ce seuil). Ces limites sont appliquées on-chain par RiskGuard.sol — les agents ne peuvent pas les contourner, quelles que soient les conditions du marché ou les instructions du mandat.',
  'How to connect multiple wallets to one account?': 'Comment connecter plusieurs portefeuilles à un même compte ?',
  'Currently one primary wallet is linked per account (connected via MetaMask or WalletConnect during onboarding). Multi-wallet support is on the roadmap. You can view your connected wallet in Dashboard → Wallets and manage off-chain funds via the Bybit API integration from Dashboard → Settings → API Keys. Each account maps to one on-chain identity for mandate governance and audit purposes.':
    'Actuellement, un seul portefeuille principal est lié par compte (connecté via MetaMask ou WalletConnect lors de l\'intégration). La prise en charge multi-portefeuilles est sur la feuille de route. Vous pouvez voir votre portefeuille connecté dans Tableau de bord → Portefeuilles et gérer les fonds hors chaîne via l\'intégration de l\'API Bybit depuis Tableau de bord → Paramètres → Clés API. Chaque compte correspond à une identité on-chain unique pour la gouvernance des mandats et les besoins d\'audit.',
  'Exporting reports for tax purposes': 'Exporter des rapports à des fins fiscales',
  'Go to Dashboard → Trades and click Export (top right). You can download all trade history as CSV with columns: Date, Pair, Side, Amount, Price, P&L, Protocol, On-Chain TX. For tax reporting, use the On-Chain TX links to verify each trade independently on Mantle Explorer. The on-chain audit trail at Dashboard → Audit provides an immutable record acceptable for compliance submissions in most jurisdictions.':
    'Allez dans Tableau de bord → Transactions et cliquez sur Exporter (en haut à droite). Vous pouvez télécharger tout l\'historique des transactions au format CSV avec les colonnes : Date, Paire, Sens, Montant, Prix, P&L, Protocole, TX on-chain. Pour la déclaration fiscale, utilisez les liens TX on-chain pour vérifier chaque transaction indépendamment sur Mantle Explorer. La piste d\'audit on-chain dans Tableau de bord → Audit fournit un enregistrement immuable acceptable pour les déclarations de conformité dans la plupart des juridictions.',

  // Resources
  'API Documentation': 'Documentation de l\'API',
  'Smart Contract Docs': 'Documentation des contrats intelligents',
  'Changelog': 'Journal des modifications',
  'Status Page': 'Page de statut',
  'Privacy Policy': 'Politique de confidentialité',
  'Terms of Service': 'Conditions d\'utilisation',

  // Plan labels & support tiers
  'OPERATOR PLAN': 'FORFAIT OPÉRATEUR',
  'STRATEGIST PLAN': 'FORFAIT STRATÈGE',
  'INSTITUTION PLAN': 'FORFAIT INSTITUTION',
  'Standard Support': 'Support standard',
  'Priority Support': 'Support prioritaire',
  'Enterprise Support': 'Support entreprise',
  '24-hour response': 'Réponse en 24 heures',
  '4-hour response': 'Réponse en 4 heures',
  '24/7 SLA': 'SLA 24/7',

  // Time helpers
  'Unknown time': 'Heure inconnue',
  'Just now': 'À l\'instant',
  '{n} min ago': 'Il y a {n} min',
  '{n} hr ago': 'Il y a {n} h',
  '{n}d ago': 'Il y a {n} j',

  // Status / priority labels
  'open': 'ouvert',
  'closed': 'fermé',
  'pending': 'en attente',
  'High': 'Élevée',
  'Medium': 'Moyenne',
  'Low': 'Faible',

  // Ticket form
  'Subject and message are required.': 'Le sujet et le message sont requis.',
  'Failed to submit. Please try again.': 'Échec de l\'envoi. Veuillez réessayer.',
  'Ticket submitted successfully!': 'Ticket soumis avec succès !',
  "We'll respond within {hours}.": 'Nous répondrons dans un délai de {hours}.',
  '24 hours': '24 heures',
  'Submit New Ticket': 'Soumettre un nouveau ticket',
  'Subject': 'Sujet',
  'Brief description of your issue': 'Brève description de votre problème',
  'Category': 'Catégorie',
  'Agent Issue': 'Problème d\'agent',
  'Mandate Issue': 'Problème de mandat',
  'Billing': 'Facturation',
  'API': 'API',
  'General': 'Général',
  'Priority': 'Priorité',
  'Message': 'Message',
  'Describe your issue in detail...': 'Décrivez votre problème en détail...',
  'Attachment (optional)': 'Pièce jointe (facultatif)',
  'Attach file': 'Joindre un fichier',
  'Submitting…': 'Envoi en cours…',
  'Submit Ticket': 'Soumettre le ticket',
  'Cancel': 'Annuler',

  // Page header
  'Hi {name}, how can we help?': 'Bonjour {name}, comment pouvons-nous vous aider ?',
  'Search our docs, browse FAQs, or reach our team directly.': 'Recherchez dans notre documentation, parcourez les FAQ ou contactez notre équipe directement.',
  'Search tickets and help topics…': 'Rechercher des tickets et des sujets d\'aide…',

  // System status banner
  'All systems operational': 'Tous les systèmes sont opérationnels',
  'Last checked: {time}': 'Dernière vérification : {time}',

  // Contact cards
  'Email Support': 'Support par e-mail',
  'Response within 4 hours for Strategist & Institution plans.': 'Réponse en moins de 4 heures pour les forfaits Stratège et Institution.',
  'Live Chat': 'Chat en direct',
  'Online': 'En ligne',
  'Available Monday–Friday, 9am–6pm UTC.': 'Disponible du lundi au vendredi, de 9h à 18h UTC.',
  'Documentation': 'Documentation',
  'Full guides, API reference, and mandate writing tutorials.': 'Guides complets, référence API et tutoriels de rédaction de mandats.',
  'Browse Docs': 'Parcourir la documentation',
  'Community Forum': 'Forum communautaire',
  'Connect with other MantleMandate users. Share strategies.': 'Connectez-vous avec d\'autres utilisateurs de MantleMandate. Partagez des stratégies.',
  'Join Forum': 'Rejoindre le forum',

  // Tickets table
  'Your Support Tickets': 'Vos tickets de support',
  'Hide Form': 'Masquer le formulaire',
  'Loading tickets…': 'Chargement des tickets…',
  'Your session has expired. Please refresh the page to continue.': 'Votre session a expiré. Veuillez rafraîchir la page pour continuer.',
  'No tickets match "{query}"': 'Aucun ticket ne correspond à « {query} »',
  'No tickets yet. Submit your first one above.': 'Aucun ticket pour le moment. Soumettez le premier ci-dessus.',
  'Submit a ticket →': 'Soumettre un ticket →',
  'ID': 'ID',
  'SUBJECT': 'SUJET',
  'STATUS': 'STATUT',
  'PRIORITY': 'PRIORITÉ',
  'UPDATED': 'MIS À JOUR',
  'Show fewer': 'Afficher moins',
  'View all {n} tickets': 'Voir les {n} tickets',

  // FAQ accordion
  'Popular Topics': 'Sujets populaires',
  'No topics match “{query}”': 'Aucun sujet ne correspond à « {query} »',

  // Right column — resources / contact hours
  'Resources': 'Ressources',
  'Contact Hours': 'Horaires de contact',
  'Mon–Fri, 9am–6pm UTC': 'Lun-Ven, 9h-18h UTC',
  '4-hour response (Strategist / Institution)': 'Réponse en 4 heures (Stratège / Institution)',
  '24-hour response (Operator)': 'Réponse en 24 heures (Opérateur)',
  'Currently: Online': 'Actuellement : En ligne',
  'Emergency Support': 'Support d\'urgence',
  'Institution plan only — 24/7 SLA': 'Forfait Institution uniquement — SLA 24/7',
  'Upgrade for 24/7 →': 'Mettre à niveau pour le 24/7 →',
}
