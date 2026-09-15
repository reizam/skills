# Rédaction du corps

Hook validé, visuel cadré : écris. Applique `references/voix.md` en même temps que cette page — la structure dit quoi mettre où, la voix dit comment ça sonne, et la voix prime.

## Progression

Une seule idée du premier au dernier mot : la Big Idea. Le deuxième bon angle devient un autre post.

`problème → preuve → mécanisme → ce que ça a changé → position`

1. **Le problème**, vécu, en deux ou trois lignes. Ce que le hook a promis. Pas de rappel des bases : le pair connaît le contexte, entre directement dans le cas.
2. **La preuve** — le reçu occupe la place centrale, pas une note de bas de page. Chiffre avec sa méthode, ou le code en clair quand il tient en dix lignes.
3. **Le mécanisme** — pourquoi ça cassait, au niveau où ça casse vraiment. **C'est le bloc le plus long du post.** Un pair ne lit pas pour la leçon, il lit pour la cause racine : nomme la fonction, la ligne, l'ordre d'exécution, l'hypothèse fausse. C'est aussi la partie qu'un LLM ne peut pas écrire à la place de Karl.
4. **Ce que ça a changé chez Karl** — la règle qu'il applique depuis, formulée assez précisément pour être copiée telle quelle. Ce qu'il fait, pas ce qu'« il faut » faire.
5. **La position** — une affirmation tranchée qui referme le post.

**Les clefs, pas le plan.** Le pair repart avec les principes (quoi, pourquoi, où s'inspirer), jamais l'implémentation (étages internes, outils, prompts, chiffres de détail). Le détail précis vit dans le visuel ou en réponse aux commentaires — c'est aussi ce qui nourrit le fil de discussion. Un post qui renvoie vers un produit pour la vraie réponse reste une pub ; un post qui garde le comment n'en est pas une tant que le principe donné est actionnable seul.

**Termine sur une question au pair, suivie de `👇`.** La moyenne du dataset dit −6 % pour les questions finales ; les posts de Karl disent l'inverse, ses deux meilleurs (30 957 et 29 776 impressions) finissant tous les deux ainsi. Ce qui fait la différence est dans `references/voix.md` : la question demande une **contribution technique**, pas un avis. « Balance ton setup 👇 » appelle une réponse ; « et vous, qu'en pensez-vous ? » n'en appelle aucune. Sur un post de vécu pur, une ligne sèche sans question est l'autre forme validée.

## Mise en forme : la règle des 66 %

LinkedIn coupe les lignes différemment sur mobile, tablette et desktop. Sans retours manuels, c'est lui qui décide où couper, et il décide mal. 80 % de l'audience est sur mobile.

- Retours à la ligne **manuels**, autour de 66 % de la largeur d'une ligne desktop.
- Une ligne = une idée. Un bloc = un temps.
- Ligne vide entre les blocs.
- Chaque ligne doit donner envie de lire la suivante. Sinon elle saute.

## Longueur

**Digeste par défaut : 1 000 à 1 500 caractères, une idée par ligne, zéro subordonnée.** Le meilleur post de Karl (« On recrute 5 devs », 68 686 impressions) est court, découpé en blocs, sans une seule phrase complexe. Le gabarit : hook choc → chiffres bruts → « La réalité ? » → blocs numérotés ou listes `→` → « Les limites qu'on assume » → chute en miroir. Une phrase qui contient une virgule de subordination se découpe en deux lignes.

Le format long (1 500-2 200) reste permis dans un seul cas : quand le mécanisme EST l'histoire et que le post donne tout (posts « démonstration » type vibe coding, 31 044 impressions). Le plafond reste 3 000. Ce qui coûte, ce n'est pas la longueur, c'est la ligne qui n'apporte rien.

## Tactiques de dwell time

Le dwell time — le temps passé sur le post avant de scroller — est le signal que l'algorithme suit. Pioche **deux ou trois** leviers par post, jamais plus : empilés, ils produisent un post parfait sur le papier et creux à la lecture.

- **Open loop** — une information suspendue en haut, résolue plus bas. La résolution doit valoir l'attente.
- **Pattern interrupt** — une ligne qui casse le rythme au moment où le lecteur s'installe.
- **Structure escalier** — chaque ligne s'appuie sur la précédente.
- **Répétition rythmique** — le même gabarit de phrase, trois fois, pour marquer.
- **Contraste** — l'état d'avant contre l'état d'après, sans dramatisation.
- **Vulnérabilité** — la difficulté réelle puis la leçon. Karl assume ses échecs ; c'est ce qui rend ses wins crédibles.
- **Citation mémorable** — une phrase qui se cite hors du post.
- **Polarisation** — deux camps clairs. Les posts polarisants mesurent ×1,82 sur les likes contre les posts consensuels, et provoquer bat plaire d'environ 50 %. Polariser sur une **pratique technique**, jamais sur des personnes.

Typographie de Karl, attestée : `→` pour lister, `↳` pour la punchline qui referme la liste, majuscules isolées sur un mot, un ou deux emojis en fin de ligne en registre ironique. Détails et extraits dans `references/voix.md`.

Hashtags : aucun. Dix hashtags coûtent −44 % de reach ; l'absence d'URL n'en fait gagner que 6, donc un lien utile reste acceptable.

## Vérification avant livraison

Réponds à chaque point par une **citation du brouillon**, pas par « oui » :

- Quelle phrase porte le reçu vérifiable, avec sa méthode de mesure ?
- Quelle phrase serait fausse si un autre développeur la publiait telle quelle ? (Aucune → le post est générique, reprends la Big Idea.)
- Sur quelle phrase un pair peut-il être en désaccord — et Karl tiendrait-il en commentaire ?
- Qu'est-ce qu'un CTO qui a déjà résolu ce problème apprend ? (Rien → descends dans le mécanisme.)
- Quelle ligne explique une base que le pair connaît déjà ? (Supprime-la.)
- Quelle information manque pour appliquer le post sans écrire à Karl ? (Ajoute-la.)
- Quel passage Karl n'a pas vécu ? (Supprime-le.)
- Combien d'idées le post défend ? (Plus d'une → coupe.)
- Lis le post à voix haute. Quelle ligne accroche la langue ? (Réécris-la.)
- Pose « et alors ? » à chaque ligne. Celles qui n'ont pas de réponse sautent.

## Ensuite

Le brouillon part en revue : `references/self-review.md`. Tu ne livres rien avant.

## Cadence

Un post par jour maximum. Republier sur un sujet déjà traité dans la semaine divise le reach par trois : l'audience décroche, l'algorithme suit. Si le log montre un post d'angle voisin daté d'hier, dis-le à Karl et propose un changement de sujet ou de format — la décision reste la sienne.
