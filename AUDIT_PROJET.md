AUDIT D'ARCHITECTURE — Portfolio Kalvin 2026
Verdict en une phrase : le projet a des fondations techniques bien meilleures que sa réputation (i18n propre, API mail robuste, accessibilité réellement traitée), mais il est actuellement non déployable, il porte ~2 000 lignes de code mort, 317 Mo d'assets, et son design n'est pas « mal fait » — il est non décidé : 24 niveaux d'opacité, 62 recettes d'ombre et 14 rayons de bordure différents, ce qui est la signature mathématique d'une interface générée.

1 · CE QUI BLOQUE TOUT — à corriger avant la moindre ligne de style
🔴 P0 — npm run build échoue. Le site ne peut pas être déployé.

Error: Turbopack build failed with 3 errors:
Module not found: Can't resolve './components/FeaturedProjectCard '
Module not found: Can't resolve './components/MarqueeRow'
Module not found: Can't resolve './components/TypewriterText'
EXIT CODE = 1
Cause exacte, et elle est grave : le fichier propos/components/page.client.tsx n'est pas la page À Propos. C'est une copie octet pour octet de la page d'accueil page.client.tsx (diff → fichiers identiques).

La page d'accueil importe ses composants en chemin relatif :


import TypewriterText from './components/TypewriterText';   // depuis app/[locale]/ → OK
Recopiée dans app/[locale]/propos/components/, la même ligne cherche désormais app/[locale]/propos/components/components/TypewriterText — qui n'existe pas.

La vraie page À Propos n'est pas perdue. Elle est conservée, entièrement commentée, dans les 362 premières lignes du même fichier (lignes 1→362). Elle référence AboutAnimations.tsx et TimelineCard.tsx, qui existent toujours et sont aujourd'hui orphelins (plus aucun import).

Explication simple : quelqu'un — ou un script — a écrasé le fichier de la page À Propos avec le contenu de la page d'accueil, puis a collé l'ancienne version en commentaire au-dessus « au cas où ». Le coupable probable est recover.js à la racine du projet : c'est un script de récupération qui lit un journal et écrit directement app/[locale]/page.client.tsx et app/[locale]/propos/page.client.tsx par comparaison de nombre de lignes. Il contient un chemin absolu appartenant à une autre machine (C:\Users\jonas\.gemini\...). Ce fichier doit disparaître du dépôt.

🔴 P0 — 5 erreurs TypeScript (tsc --noEmit)
Fichier	Erreur
propos/components/page.client.tsx:39,40,44	TS2307 modules introuvables (ci-dessus)
projets/components/modal/StarField.tsx:272	TS2322 tuple readonly passé à animate de framer-motion, qui exige un tableau mutable
components/animations/StarField.tsx:160	idem — dans un fichier mort (jamais importé)
Correctif du StarField : retirer le as const sur les trajectoires, ou les cloner ([...moveX]) au point de passage.

🟠 P0 bis — l'état Git est trompeur
Le dépôt annonçait « clean » : c'est faux. 31 fichiers modifiés non commités, dont tout le travail d'amélioration (les commentaires correctifs détaillés, lib/site.ts, le durcissement de l'API mail). Ce travail n'est protégé par rien. À commiter avant toute refonte — c'est le filet de sécurité qui permettra de refondre sans peur.

2 · CARTOGRAPHIE — ce que le projet est réellement

Next.js 16.1.6 · React 19.2.3 · Tailwind v4 · TypeScript strict · next-intl v4
│
├── app/
│   ├── layout.tsx ················· enveloppe vide (motif next-intl correct ✓)
│   ├── [locale]/layout.tsx ········· <html>/<body>, SEO, polices, anti-FOUC ✓
│   ├── [locale]/page.tsx ·········· Server Component → metadata seule ✓
│   ├── [locale]/page.client.tsx ··· 525 l. — TOUTE la landing page
│   ├── [locale]/components/ ······· 6 composants locaux à l'accueil
│   ├── [locale]/propos/ ··········· 🔴 CASSÉ
│   ├── [locale]/projets/ ·········· la partie la plus mûre du projet ✓
│   ├── [locale]/contact/ ·········· formulaire RHF + Zod ✓
│   └── api/sendEmail/route.ts ····· 723 l. (dont 192 mortes) — solide ✓
├── components/{layout,animations,ui}
├── hooks/ · lib/ · i18n/ · messages/ · types/
└── public/ ························ 317 Mo 🔴
Le motif Server/Client est correct et c'est une vraie qualité : chaque page.tsx reste un Server Component qui ne produit que les metadata (donc SEO rendu côté serveur), et délègue le rendu à un page.client.tsx. C'est le bon compromis pour un site fortement animé.

Mais la frontière est posée trop haut. La landing page entière est 'use client'. Conséquence mesurable : framer-motion + lucide-react + les 8 dictionnaires de traduction + toutes les données projets partent dans le bundle navigateur, alors que 90 % de cette page est du contenu statique (titres, paragraphes, listes de technos). Seuls le typewriter, le marquee, le parallax et la lightbox ont réellement besoin du client.

3 · LES FORCES — ce qu'il ne faut surtout pas casser
Ce projet a été travaillé avec un vrai soin. Je le dis précisément, parce que la refonte doit préserver ces acquis.

1. L'accessibilité est traitée sérieusement, pas cochée.

Lien d'évitement fonctionnel (layout.tsx:235)
prefers-reduced-motion honoré partout, y compris dans les défilements programmatiques et avec des variantes de repli réelles — le marquee devient un rail à défilement manuel avec accroche magnétique (MarqueeRow.tsx:82). C'est du niveau professionnel.
Le marquee duplique ses cartes ×4 pour la boucle, et masque les doublons aux lecteurs d'écran en exposant la liste réelle une seule fois (MarqueeRow.tsx:123). Très peu de développeurs y pensent.
Piège à focus + Échap dans le menu mobile (Navbar.tsx:123)
Le typewriter est aria-hidden avec le texte réel en sr-only
Anneau de focus global comme filet de sécurité + garde forced-colors sur .text-gradient
2. Le verrouillage du défilement est fait correctement — trois fois.
Navbar, useProjectModal et ImageLightbox sauvegardent et restaurent la valeur précédente de overflow au lieu d'écrire '' en dur, et compensent la largeur de la barre de défilement. C'est exactement le bon motif ; l'erreur naïve (un composant qui déverrouille le scroll d'un autre) a été identifiée et corrigée.

3. L'API d'envoi de mail est réellement durcie.
Validation Zod côté serveur, anti-injection d'en-têtes SMTP, échappement HTML, runtime = 'nodejs' déclaré explicitement, transporteur SMTP mutualisé en portée de module (pool: true + délais d'attente), SITE_URL lu côté serveur et non depuis l'en-tête Origin fourni par le client, réponses localisées, Cache-Control: no-store, gabarit e-mail en tableaux imbriqués compatible Outlook avec pré-en-tête. C'est mieux que la plupart des formulaires de contact en production.

4. L'i18n est architecturé proprement.
routing.ts source unique, navigation typée, generateStaticParams, alternates.languages + x-default, sitemap qui déclare les deux langues (et non l'anglais en simple alternate), lastmod figé sur une date éditoriale. Parité parfaite fr/en : 208 clés de chaque côté, zéro écart.

5. Le thème sombre est correct de bout en bout.
Script anti-FOUC synchrone bloquant dans le <head> qui pose class, data-theme et style.colorScheme ; store Zustand aligné après coup (et non en concurrence) ; suivi de prefers-color-scheme tant qu'aucun choix explicite n'a été fait ; sélecteurs Zustand individuels pour éviter les re-rendus parasites.

6. Les optimisations de performance fines sont réelles.
ProjectsGrid met en cache les DOMRect et n'écrit les variables CSS qu'une fois par image affichée, au lieu de mesurer 9 cartes à chaque mousemove (≈500 recalculs de mise en page forcés par seconde évités). SkillCard et le Footer écrivent la position du curseur en variables CSS sur le nœud DOM — zéro setState, zéro re-rendu.

7. Le niveau de commentaire est exceptionnel. Les commentaires expliquent le pourquoi et documentent les régressions évitées. À conserver comme norme du projet.

4 · LES DÉFAUTS TECHNIQUES — par gravité
🔴 Poids des assets : 317 Mo dans public/
Dossier	Poids
public/images/	153 Mo
public/images_projets/	139 Mo
public/animation/ + lottis/	13 Mo (29 + 21 fichiers JSON jamais utilisés)
public/logo/	5,3 Mo (24 variantes du logo, 2 utilisées)
Le pire : 4 fichiers Nikon RAW .NEF = 92 Mo — b1.NEF (23,9 Mo), b3.NEF (24,1 Mo), b9.NEF (21,7 Mo), b10.NEF (22,3 Mo). Aucun navigateur ne sait afficher un .NEF. Ce sont des fichiers d'appareil photo oubliés dans le dossier public.

Autres points concrets :

Kalvin.jpg = 2,97 Mo pour être affiché dans un cercle de 288 px, avec priority — c'est la ressource la plus lourde du chemin critique de rendu.
Plusieurs captures projets à 6–8 Mo (event_08.jpg 7,8 Mo, shop_03.jpg 7,2 Mo).
output: 'standalone' → l'image Docker embarque ces 317 Mo.
Pourquoi c'est grave au-delà du poids : next/image optimise à la demande. La première requête sur une image de 8 Mo déclenche un redimensionnement serveur lent (plusieurs secondes) et, sur Vercel, consomme le quota d'optimisation d'images. Le visiteur paie l'attente.

🔴 Code mort : ~2 000 lignes + 9 fichiers + 11 dépendances
1 961 lignes préfixées //. Le motif est systématique : l'ancienne version est commentée en tête de fichier, la nouvelle vit en dessous.

Fichier	Mortes / Total
ProjectCard.tsx	262 / 674 (38 %)
ProjectModal.tsx	213 / 544 (39 %)
route.ts	192 / 723 (26 %)
ImageCarousel.tsx	169 / 437 (38 %)
Button.tsx	162 / 406 (39 %)
useTheme.ts	118 / 354 (33 %)
+ 8 autres fichiers > 30 %	
Fichiers entiers jamais importés :

Fichier	Lignes	Note
components/ui/Button.tsx	406	un système de boutons complet, inutilisé — chaque bouton est réécrit à la main dans les pages
components/ui/Badge.tsx	196	inutilisé
components/animations/StarField.tsx	196	doublon de la version modale, inutilisé, et il porte une erreur TS
app/[locale]/components/ImageLightbox2.tsx	298	doublon de ImageLightbox
lib/mail.ts	143	2ᵉ implémentation d'envoi de mail, avec d'autres noms de variables d'env (GMAIL_USERNAME vs EMAIL_HOST_USER) — piège à débogage
lib/data/testimonials.ts	32	jamais lu
lib/data/experience.ts	53	seul le type est importé ; les données sont dupliquées dans messages/*.json
recover.js	43	script de récupération avec chemin d'une autre machine
AboutAnimations.tsx + TimelineCard.tsx	352	orphelins depuis la casse de la page À Propos
11 dépendances déclarées, jamais importées : les 7 paquets @radix-ui/*, @vercel/analytics, gsap, lottie-react, react-icons.

🟠 24 erreurs ESLint — dont un signal réel de React 19
Toutes de la même famille : react-hooks/set-state-in-effect (règle du React Compiler). Elle signale un setState synchrone dans un corps d'effet, qui provoque un rendu en cascade — un rendu inutile de plus au montage, sur chaque page.

Les 17 emplacements incluent : TypewriterText:125, ThemeToggle:54, Navbar:159, StardustCursor:30, AnimatedCounter:116, ImageLightbox:66,78, useStarField:45, useDisintegrationGrid:112, ProjectCard:409, les 4 pages d'erreur.

Le motif fautif dominant est le const [mounted, setMounted] = useState(false) + useEffect(() => setMounted(true), []). Remplaçable par useSyncExternalStore ou, plus simple, par un rendu serveur neutre sans état de montage.

🟠 Typage : any sur les frontières de composants
Les trois composants de la landing page sont non typés :


// MarqueeRow.tsx:40
({ skills, reverse, speed, tSkills }: { skills: any[], ..., tSkills: any })
// SkillCard.tsx:35
({ skill, tSkills }: { skill: any; tSkills: any })
// FeaturedProjectCard .tsx:53
({ project, index, tProjects }: { project: any, index: number, tProjects: any })
Or les types existent : Skill, SkillCategory (skills.ts), Project (projects.ts). Ils sont simplement ignorés. Résultat : aucune erreur de compilation si un champ est renommé, et zéro autocomplétion sur les composants qu'on va le plus modifier pendant la refonte.

🟠 Un fichier dont le nom contient une espace
app/[locale]/components/FeaturedProjectCard .tsx — espace avant l'extension. L'import le reproduit : from './components/FeaturedProjectCard '. Cela fonctionne, mais casse les outils de renommage, les URL et certains systèmes de fichiers. À renommer en premier.

🟡 Fuites d'internationalisation
1. Les filtres de la page Projets ne sont jamais traduits. page.client.tsx:74 construit les libellés depuis PROJECT_CATEGORIES, dérivé des données en dur : 'Logiciel Windows', 'Application Mobile', 'Application Web', 'SaaS', 'Mobile + Web + API'. En anglais, les filtres restent en français.

2. Deux projets affichent la description d'un autre. PROJECTS contient 8 projets, messages/*.json → projects_data n'en contient que 6. locamanager et Lotus ne sont dans aucune table de correspondance ; le repli les envoie sur la clé 'green' (FeaturedProjectCard:31, project.types.ts:49). LocaManager et Lotus Pro s'affichent donc avec la catégorie et le résumé de Green Challenger.

3. 47 clés traduites, jamais utilisées — dont toute la section experience.* (20 clés) et tout testimonials.* (12 clés) : c'est le contenu de la page À Propos cassée. Plus about_page.titleLine2/3, values.excellence/innovation, vision.p3, vision.sidebar*.

4. Le mouvement inverse existe aussi : ~20 chaînes en dur dans le code, sous le commentaire récurrent « hors catalogue i18n, aucune clé nouvelle requise ». Exemple révélateur, page.client.tsx:111 :


const scrollHint = locale === 'fr' ? 'Faire défiler vers le contenu' : 'Scroll to content';
…alors que hero.scrollHint existe dans les deux dictionnaires ("Découvrir" / "Discover"). Le dictionnaire est court-circuité par un ternaire.

🟡 Sécurité et SEO — les manques
Point	État	Impact
En-têtes de sécurité	❌ absents de next.config.ts	pas de Content-Security-Policy, X-Frame-Options, Referrer-Policy, X-Content-Type-Options, Permissions-Policy. Le site est intégrable en <iframe> par n'importe qui (risque de clickjacking).
Pot de miel anti-robot	⚠️ inerte	L'API attend un champ website (route.ts:380) et l'exploite correctement. Mais le formulaire ne le rend pas : body: JSON.stringify(data) n'envoie que {name, email, subject, message}. La protection existe côté serveur et n'est jamais déclenchée.
locale non transmis	⚠️	même cause : l'API repliera toujours sur Accept-Language.
Limitation de débit	⚠️ en mémoire de processus	honnêtement documenté dans le code. Arrête les floods naïfs, pas un attaquant. À adosser à Vercel KV / Upstash.
Image OpenGraph	❌ dimensions fausses	déclarée 1200×630 (layout.tsx:128), le fichier réel est 1080×1080. Les aperçus LinkedIn / WhatsApp / Facebook sont donc rognés de travers. Et c'est un logo, pas une carte de partage.
next.config.ts	⚠️ 4 lignes	aucune configuration images (formats, deviceSizes, minimumCacheTTL), pas d'en-têtes, pas de poweredByHeader: false.
🟡 Divergences d'API internes
Deux composants nommés AnimatedCounter coexistent, avec la même prop duration dans des unités opposées — millisecondes dans components/ui/AnimatedCounter.tsx, secondes dans AboutAnimations.tsx. Le danger est documenté en commentaire (ligne 82) mais pas résolu : selon le fichier d'import, on obtient une animation de 2 ms ou de 33 minutes.

Idem pour TECH_SVG_MAP et TECH_SVG_MAP_CARD (project.types.ts) : deux tables de 32 entrées, identiques à 8 lignes près. Une seule table avec une variante suffirait.

5 · LE DIAGNOSTIC DESIGN — pourquoi la landing page « fait IA »
C'est le cœur de ta demande. Ta perception est juste, et elle est mesurable. Voici les six causes réelles, de la plus profonde à la plus superficielle.

Cause n°1 — Il n'y a pas de système de design. Il y a 500 décisions isolées.
Un design système, c'est une échelle contrainte. Voici ce que le code contient réellement :

Dimension	Valeurs distinctes trouvées	Ce qu'un système en aurait
Opacités sur l'encre (base-content/…)	24	3 à 4
Recettes d'ombre écrites à la main (shadow-[…])	62	3 à 5
Rayons de bordure	14	3 à 4
Rythme vertical de section	6 valeurs sans échelle	1 échelle
24 paliers d'opacité sur la même encre. /90 /85 /80 /70 /65 /60 /55 /50 /45 /40 /35 /30 /25 /20 /15 /10 /5 plus 7 valeurs fractionnaires [0.04]…[0.14]. Cela signifie que la hiérarchie du texte est faite par transparence, et non par taille, graisse, couleur ou espace.

Pourquoi c'est LE marqueur n°1 d'une interface générée. Quand un humain hiérarchise, il tranche : « ce texte est important → il est plus grand » ; « ce texte est secondaire → il est gris ». Quand une interface est composée par empilement de suggestions, chaque bloc reçoit l'opacité qui « allait bien » localement. Le résultat global est un brouillard : rien n'est franchement noir, rien n'est franchement gris, et l'œil ne trouve aucun point d'ancrage. C'est exactement l'impression que tu décris par « banal » — en réalité, c'est indécis.

62 ombres uniques. Exemple réel, sur un seul bouton :


shadow-[0_1px_2px_rgba(0,0,0,0.14),0_16px_32px_-18px_rgba(0,0,0,0.6)]
Chaque ombre encode une source de lumière différente. 62 ombres = 62 soleils dans la même pièce. L'œil le perçoit comme une absence de matière.

Le rythme vertical est corrigé à la main, pas systématique. page.client.tsx:323 :


pt-48 pb-2 sm:pt-64 sm:pb-2
12 rem de padding en haut, 0,5 rem en bas. Ce n'est pas une décision, c'est un rattrapage. Puis viennent py-24 sm:py-40, py-24 sm:py-32, py-20, py-24 sm:py-32. Aucune progression lisible.

Cause n°2 — La structure de page est le gabarit par défaut, dans l'ordre par défaut

Hero (salutation + machine à écrire + 2 CTA + portrait rond + badges flottants)
  ↓  Teaser « Philosophie » + 4 cartes de valeurs
  ↓  Marquee infini de logos de technologies
  ↓  Projets en alternance gauche/droite
  ↓  4 compteurs animés
  ↓  CTA final + téléchargement de CV
Aucune de ces sections ne pourrait pas se trouver sur n'importe quel autre portfolio. Ce n'est pas un problème de qualité d'exécution — l'exécution est bonne. C'est un problème d'absence de thèse : la page ne dit rien que son auteur seul pourrait dire.

Et elle accumule les quatre clichés les plus reconnaissables du genre, tous les quatre dans le premier écran : machine à écrire sur le métier, portrait circulaire, badges en suspension, anneaux orbitaux.

Cause n°3 — Le texte est du texte de générateur, et il se contredit
Emplacement	Texte	Problème
hero.description	« des solutions digitales performantes et élégantes qui transforment les idées en produits d'exception »	trois adjectifs, zéro information
about_teaser.p2	« chaque pixel […] pensé pour sublimer votre message et convertir vos visiteurs en ambassadeurs »	vocabulaire d'agence, pas d'ingénieur
cta.title1/2	« Prêt à élever votre standard digital ? »	formule de page d'atterrissage SaaS
cta.description	« Pas de vente forcée, juste une conversation stratégique. »	rassure sur un problème que personne n'avait
seo.description	« applications web ultra-premium »	« ultra-premium » est un mot de générateur
La contradiction la plus coûteuse, visible dans le même écran :

hero.floatingBadge1 = « Développeur Senior »
stats.years = 3+ années d'expérience
Trois ans et « Senior » sur le même écran : le visiteur qui recrute le remarque immédiatement, et tout le reste de la page perd sa crédibilité. Un portfolio ne se juge pas sur ses superlatifs, il se juge sur sa fiabilité déclarative.

Et stats.engagement = 89 % : 89 % de quoi ? Une métrique sans unité ni référent signale l'absence de vraies preuves — elle fait plus de mal que son absence.

Enfin, l'information la plus précieuse de la page n'est pas affichée. hero.badge = "Disponible pour missions remote" existe dans les deux dictionnaires et n'est rendue nulle part. Pour un portfolio dont le but est de générer des missions, c'est la seule phrase qui a une valeur commerciale directe. Elle est dans le code, invisible.

Cause n°4 — L'or est partout, donc il n'accentue plus rien
La palette « Void & Or » est une bonne idée. Son application la neutralise. L'or (--primary) sert simultanément à :

bordures de cartes · halos de survol · pastilles de filtre · surtitres · liens · anneau de focus · le point pulsant du logo · le point pulsant du pied de page · le curseur personnalisé · les filets de séparation · la jauge de niveau des compétences · les CTA · le dégradé de texte · la scrollbar au survol · le trait sous les titres…

Règle simple : une couleur d'accent ne fonctionne que si elle est rare. Quand elle est partout, elle devient la couleur de fond du site, et il n'existe plus de couleur pour dire « regarde ici ».

Et le .text-gradient est un dégradé or → or. globals.css:325 : linear-gradient(135deg, var(--primary), var(--accent)) = #F0A500 → #FFD166. Deux ors très proches. Le dégradé est donc quasi invisible comme dégradé, mais il coûte au prénom « Kalvin » sa couleur pleine et lui donne exactement l'aspect « texte en dégradé d'IA » qui te dérange. Le pire des deux mondes.

Cause n°5 — Le flou est l'unique matière du site
Inventaire des couches floues sur le seul premier écran : 2 orbes radiales (600 × 600 px), 1 grille de points, 1 dégradé de fusion bas, 3 badges en backdrop-blur-xl, puis à la section suivante 2 nouveaux halos en blur-[150px] et blur-[120px], un pied de page en backdrop-blur-3xl, une navbar en backdrop-blur-2xl, et un calque de bruit fixe plein écran en z-index: 9999 (globals.css) — au-dessus de tout, y compris des modales.

Deux conséquences :

Esthétique : le glassmorphism + halos flous est *l'*esthétique par défaut de 2021-2023. Employé partout, il signale « thème téléchargé ».
Performance : chaque backdrop-filter et chaque flou de 150 px est une passe de composition GPU distincte. Sur un téléphone d'entrée de gamme, c'est le premier poste de chute d'images par seconde. Les commentaires du code montrent que plusieurs halos redondants ont déjà été supprimés pour cette raison — le travail est à finir.
Cause n°6 — Tout bouge en permanence, donc rien n'attire l'œil
Animations tournant simultanément et indéfiniment sur la page d'accueil au repos :

StardustCursor — 2 éléments suiveurs avec ressorts, en continu
TypewriterText — écrit/efface en boucle
3 badges flottants — repeat: Infinity
2 anneaux orbitaux — spin 40s et spin 60s
2 marquees — pilotés image par image
Parallaxe du hero — lié au défilement
Indicateur de défilement pulsant
Point du logo — animate-pulse
Point du pied de page — animate-pulse
Soit une douzaine d'animations concurrentes, sans hiérarchie. Le mouvement est un outil d'attention : il ne fonctionne que par contraste avec l'immobilité. Ici il n'y a pas d'immobilité, donc pas d'attention dirigée — juste une agitation de fond qui fatigue et fait « site de démo ».

Note de justice : prefers-reduced-motion est honoré partout. Le problème n'est pas l'accessibilité, il est artistique.

Cause n°7 — Deux polices sur trois sont chargées et quasi inutilisées
layout.tsx charge Inter + Playfair Display + JetBrains Mono. Usage réel dans tout le code : font-display → 4 occurrences, font-mono → 11, sur des milliers de classes. Le <body> porte inter.className en dur.

Conséquence : Playfair Display — la police qui pourrait porter une vraie personnalité typographique — est téléchargée et pratiquement jamais affichée. On paie le coût réseau d'une identité qu'on n'utilise pas. Toute la page est en Inter font-bold, un seul poids, une seule famille : d'où l'impression de platitude.

En résumé, ce que « banal » signifie ici
Ce n'est pas que le design soit laid. C'est qu'aucune décision n'y est assez forte pour être fausse. 24 gris, 62 ombres, 14 rayons, 12 animations, une couleur d'accent utilisée partout et trois adjectifs par phrase : la page est une moyenne. Et une moyenne ressemble toujours à toutes les autres moyennes.

6 · CE QUE JE PROPOSE — l'ordre des opérations
Étape 0 — Rendre le projet sain (préalable non négociable)
Commiter les 31 fichiers modifiés — protéger le travail existant.
Réparer la page À Propos — restaurer le vrai code depuis le bloc commenté (lignes 1→362), recâbler AboutAnimations et TimelineCard.
Corriger les 2 erreurs TS de StarField (retirer as const sur les trajectoires).
Supprimer recover.js, ImageLightbox2.tsx, lib/mail.ts, components/animations/StarField.tsx, Button.tsx, Badge.tsx, les 1 961 lignes commentées, les 11 dépendances inutilisées.
Renommer FeaturedProjectCard .tsx (retirer l'espace).
Purger public/ : supprimer les 4 .NEF (−92 Mo), les 50 JSON Lottie inutilisés (−13 Mo), les 22 variantes de logo mortes ; recompresser les captures en WebP ≤ 300 Ko et le portrait en ≤ 80 Ko. Objectif : 317 Mo → < 15 Mo.
Typer les 3 composants de la landing page avec Skill / Project.
Ces 7 points sont mécaniques, sans risque, et conditionnent tout le reste : on ne restyle pas un projet qui ne compile pas, et chaque valeur en dur supprimée maintenant est une valeur qu'on n'aura pas à refondre deux fois.

Étape 1 — Construire le système de design, avant de dessiner
Avant de toucher au visuel, contraindre les échelles dans globals.css :

Encre : 4 niveaux nommés, pas 24 opacités (--ink-primary, --ink-secondary, --ink-muted, --ink-faint)
Élévation : 4 ombres tokenisées, pas 62 littérales — une seule source de lumière
Rayons : 4 valeurs, pas 14
Rythme vertical : une échelle unique appliquée à toutes les sections
Or : budget d'usage explicite — réservé aux actions et à un seul geste par écran
Typographie : décider — soit Playfair devient l'identité des titres et on l'assume, soit on la retire et on économise le réseau
Ce socle fait, la refonte visuelle devient rapide et cohérente par construction — au lieu de 500 arbitrages isolés.

Étape 2 — Refondre la landing page sur une thèse
La question à trancher avant de coder, et elle t'appartient : quelle est la seule chose que cette page doit prouver ? Un portfolio d'ingénieur ne convainc pas par des adjectifs, mais par des preuves : un problème raconté, une décision d'architecture défendue, un chiffre vrai et sourcé, du code lisible.

J'ai trois directions concrètes en tête, radicalement différentes les unes des autres — chacune avec une structure de page, une palette et un geste signature propres. Mais te les proposer maintenant serait prématuré : le choix dépend de qui tu veux convaincre (recruteurs techniques ? clients directs ? agences ?), et cette réponse n'est pas dans le code.

Récapitulatif chiffré
Mesure
🔴 Build	échoue — exit 1, 3 modules introuvables
🔴 TypeScript	5 erreurs
🟠 ESLint	24 erreurs, 2 avertissements
🔴 Assets public/	317 Mo dont 92 Mo de RAW inaffichables
🔴 Code mort	1 961 lignes + 9 fichiers + 11 dépendances
🟡 i18n	208/208 clés en parité ✓ · 47 clés mortes · ~20 chaînes en dur · filtres non traduits
🔴 Design	24 opacités · 62 ombres · 14 rayons · 12 animations simultanées
✅ Accessibilité	traitée sérieusement — à préserver
✅ API mail	durcie, de niveau production — à préserver
✅ Architecture i18n / SEO / thème	solide — à préserver
Deux questions pour enchaîner :

Je commence par l'étape 0 (réparer + nettoyer, pour que le projet compile et pèse 20× moins) ? C'est ~1 h de travail mécanique et ça débloque tout le reste.
Qui la landing page doit-elle convaincre en priorité — recruteurs techniques, clients directs, ou agences ? Ta réponse détermine entièrement la direction artistique que je te proposerai.
Si tu préfères, je peux aussi te livrer cet audit comme page consultable (sommaire, tableaux triables) à garder ouverte pendant la refonte — dis-le moi.