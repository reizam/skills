# Packaging

Le hook est tout ce qui s'affiche avant le « voir plus ». Le visuel est ce qui arrête le pouce. Ensemble ils décident du reach ; le corps ne décide que de ce qu'on en retient.

## Le hook

Propose **cinq** hooks à Karl, chacun bâti sur un pattern différent de la liste ci-dessous, chacun ancré dans la cicatrice — pas cinq reformulations de la même phrase.

**Le hook nomme un objet technique réel.** Un package, une API, une version, un chiffre, un message d'erreur. C'est ce qui distingue un hook lu par un pair d'un hook scrollé par un pair : la spécificité prouve que la suite existe. « J'ai perdu 3 jours sur un bug de cache » se scrolle ; « `revalidateTag` ne purge pas le cache client, et rien dans la doc ne le dit » se lit.

Patterns, classés par ce qu'ils ont réellement fait chez Karl :

- **Position tranchée en trois mots** — « Je ne crois pas au vibe coding. » **30 957 impressions**, son meilleur post. Sujet + verbe + refus, rien d'autre. Suivi d'une ligne qui assume la friction (« Ça va en énerver certains. Tant mieux. »), puis de la démonstration.
- **Le paradoxe chiffré** — « Le pays qui dépense le plus dans l'IA n'est que 24ème en adoption. » **29 776 impressions**. Deux chiffres qui ne devraient pas coexister, sources tierces à l'appui.
- **Le constat qui se retourne** — « On a appliqué les bonnes pratiques d'architectures. / C'était la pire idée. 🙁 » L'attente établie en une ligne, cassée à la suivante.
- **Le vécu daté à contre-courant** — « J'ai jamais signé un CDI. En 10 ans. / Voilà ce que ça m'a vraiment coûté. » 9 713 impressions.
- **L'accusation directe au lecteur** — « Ton `CLAUDE.md` fait 200 lignes..... / Tu codes comme un stagiaire. 👇 » Tient uniquement si le post donne ensuite la structure complète, gratuitement.
- **Chiffre brut + punch** — « On a analysé 1.5M d'emails marketing. / En 7 jours. / Sans lire un seul. 👇 » Fort en accroche, mais attention : ce post a fait 579 impressions parce que la suite était une annonce produit. Le hook n'était pas en cause.

**Le hook nomme un objet technique réel ou un chiffre réel.** Un package, une version, une mesure, un message d'erreur. La spécificité prouve au pair que la suite existe.

**Écarté, mesuré à 457 impressions** : le hook de fierté sans preuve (« Mon objectif en 2026 ? / Avoir le même effectif qu'IBM. »). Même sujet que le post à 30 957, quatre jours plus tard. La différence n'est pas le hook, c'est que le post annonçait une réussite au lieu de démontrer un mécanisme. Un post qui existe pour dire que Karl est fort ne se publie pas.

Contraintes du hook :

- Une à deux lignes. Médiane observée : 66 caractères. Ce qui compte est le pattern, pas la longueur.
- Il doit être **tenu** par le post. Un hook plus fort que la preuve coûte la crédibilité, et devant des pairs elle ne revient pas.
- Il se lit seul, hors contexte, sur un écran de téléphone.

Écartés devant cette audience : la question ouverte en hook (un pair y répond dans sa tête et scrolle) et toute promesse de résultat non chiffrée.

Écartés pour Karl, sauf demande explicite de sa part — ils achètent de l'engagement contre de la crédibilité, exactement ce que la cicatrice et le reçu servent à construire :

- L'erreur volontaire (coquille posée pour faire réagir).
- Le lead magnet à commentaire (« commente RESSOURCE et je t'envoie… »).
- « Je t'offre X » et les hooks de don gratuit.
- La preuve sociale exhibée pour elle-même.

## Le visuel

**Karl est designer. Le visuel est le seul endroit où il part avec un avantage structurel sur sa niche — traite-le comme la moitié du travail, pas comme une illustration.**

Un post sans visuel se compare mal : sur la période mesurée, texte seul et image chutent au même rythme, la vidéo est le seul format qui monte. Choisis dans cet ordre de préférence, selon ce que la cicatrice permet :

1. **Le reçu lui-même, mis en forme** — le diff, la mesure, le avant/après, la capture du bug. C'est le visuel le plus honnête et le plus difficile à copier.
2. **Un schéma du mécanisme** — ce que le lecteur ne verrait pas en lisant le code. Le terrain naturel de Karl.
3. **Une vidéo courte** — l'interaction, le glitch, le rendu qui bouge. Seul format en croissance.
4. **Un carrousel** — uniquement si l'idée est réellement séquentielle. Sinon c'est un post texte déguisé.

Livre à Karl une **direction** de visuel : quoi montrer, quel cadrage, quel texte dans l'image. Pas une liste d'idées à trier.

### La DA par défaut : print, pas dashboard

Le visuel suit la DA éditoriale &YC (celle des rapports clients) : **fond blanc, encre
`#131313`, Manrope, un seul accent `#2ecc71` qui porte du sens** (le résultat, jamais la
décoration). De vraies données du repo, des étiquettes directes sur les 3-4 valeurs qui
comptent seulement, une annotation en français courant qui raconte (« Le creux de juillet,
c'est nous »), et une **ligne de source en pied** (« git log, facturation et CI du même
repo ») — c'est elle qui dit au pair que tout est vérifiable, honnêtetés comprises
(« août : rythme des 9 premiers jours »).

### Interdits anti-slop

Le template IA que le feed sature — validé contre uizze.com/anti-ui-slop
(skills.sh/site/uizze.com/anti-ui-slop) :

- Fond noir + accent néon. C'est LE cliché des visuels IA LinkedIn.
- Kicker / eyebrow en capitales espacées au-dessus du titre.
- Cartes arrondies empilées, chips décoratives, glassmorphism, dégradés.
- Emoji, points colorés ou glyphes Unicode comme décoration.
- Un graphique qui demande une notice (cascade, sankey) là où des barres suffisent.
- Ajouter des éléments pour faire « designé » : chaque pixel non porteur de sens saute.

Un pattern familier n'est pas du slop quand c'est le fit le plus clair : des barres
mensuelles restent des barres mensuelles.

### Rendu (pièges mesurés le 2026-08-10)

- Format LinkedIn : **1080×1350**. `weasyprint visuel.html out.pdf` puis
  `sips -s format png -Z 1350 out.pdf --out out.png`.
- **Vérifier `mdls -name kMDItemNumberOfPages` = 1** : un débordement crée une page 2
  silencieuse et le PNG n'en montre que la première.
- **Toujours regarder le PNG rendu** avant livraison — c'est là qu'on a attrapé chaque
  défaut, jamais dans le HTML.
- weasyprint casse les charts en flex imbriqué (barres fusionnées) : **positionner les
  barres en absolu**, hauteurs calculées en px.
- Manrope n'a pas le glyphe `÷` (rendu `+`, contresens) : écrire `/ 1,5` ou `− 35 %`.
- Polices : les woff2 Manrope vivent dans `~/.claude/skills/client-report/assets/`.

## Sortie de l'étape

1. Cinq hooks numérotés, patterns différents, patterns nommés.
2. Une direction de visuel, avec sa raison en une phrase.

Karl choisit. Tu n'écris pas le corps avant.
