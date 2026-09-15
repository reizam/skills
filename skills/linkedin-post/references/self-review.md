# Self-review

Le brouillon est écrit. Quatre agents le passent en revue **en parallèle** — un seul message,
quatre appels — puis tu arbitres. Ils ne publient rien et ne modifient aucun fichier : ils
rendent du texte.

**Contrainte commune, à répéter dans chaque brief** : chaque agent reçoit le contenu de
`references/voix.md` et la Big Idea. Toute proposition qui sort de la voix de Karl est
rejetée à l'arbitrage, même si elle est meilleure sur son propre critère. Le post doit
rester de Karl ; un post optimisé qui ne sonne pas comme lui perd le seul avantage qui ne
se copie pas.

Dis aussi à chaque agent qu'il n'a **pas** à être agréable, et qu'un « c'est déjà bien »
sans proposition concrète est un échec de sa mission.

## Agent 1 — Hook

**Brief** : voici le hook retenu, les quatre alternatives, la Big Idea, le corps du post, et
`references/voix.md` avec les impressions réelles par pattern.

Il rend :
- Un verdict sur le hook retenu : tenu par le corps, ou promesse plus forte que la preuve ?
- **Trois hooks réécrits**, patterns différents, chacun nommé, chacun ancré sur un objet
  technique ou un chiffre réel du post.
- Pour chacun, la première ligne telle qu'elle apparaîtra avant le « voir plus » sur mobile.

Critère qu'on lui donne : le hook doit être compréhensible seul, hors contexte, par
quelqu'un qui ne connaît pas Karl, et rester exact.

## Agent 2 — Valeur

**Brief** : le post complet, la cicatrice, le reçu, et `references/voix.md`.

Il rend :
- **Ce que le pair apprend**, formulé en une phrase. S'il n'y arrive pas, c'est le
  diagnostic.
- Le passage où le post s'arrête trop tôt sur le mécanisme, **réécrit** avec le niveau de
  détail manquant : la fonction, l'ordre d'exécution, l'hypothèse fausse, le chiffre.
- Le principe gardé pour soi qui devrait entrer dans le post — et, en sens inverse, le
  détail d'implémentation qui divulgue trop (étage interne, outil, prompt, métrique fine)
  et doit en sortir : les clefs, pas le plan.
- Les lignes qui n'apportent rien, citées, à supprimer.

Question de contrôle qu'on lui pose : **est-ce que ce post existe pour annoncer que Karl est
fort, ou pour donner un mécanisme ?** Le premier cas mesure 457 impressions dans l'historique
de Karl, le second 30 957. S'il penche vers le premier, il le dit franchement.

## Agent 3 — Hostile

**Brief** : le post complet. Consigne : tu es un CTO senior de quinze ans d'expérience, tu
n'aimes pas ce post, et tu vas le contredire en commentaire devant l'audience de Karl.

Il rend :
- **Les trois attaques les plus probables**, écrites comme de vrais commentaires.
- Pour chacune : est-ce que le post y répond déjà, et où ?
- L'attaque à laquelle le post ne survit pas, s'il y en a une.
- La ligne de bornage à ajouter pour la désarmer par avance, rédigée.

Un post qui prend position sera attaqué : le but n'est pas d'éviter le débat mais que
l'attaque évidente arrive déjà traitée.

## Agent 4 — Preuve

**Brief** : le post complet, et l'accès au repo.

Il rend, pour **chaque** chiffre, nom de fichier, nom de fonction et affirmation
factuelle du post :
- La source exacte — `fichier:ligne`, commande, ou lien — ou la mention **non vérifié**.
- La correction quand le chiffre est faux.
- Les affirmations invérifiables qui doivent être retirées ou reformulées.

Il compte réellement, il ne se fie pas à ce qu'affirme le brouillon. « Une quarantaine de
tools » se vérifie en listant les tools, pas en relisant la phrase.

## Arbitrage

Les agents proposent, Karl décide. Tu ne fusionnes rien automatiquement.

1. **Applique sans discuter** les corrections de l'agent Preuve : un chiffre faux se corrige
   ou se retire, il n'y a rien à arbitrer.
   **Mais son rapport est une preuve, pas un contenu.** Il rend des `fichier:ligne` et des
   mécanismes internes ; le post en garde le strict minimum qui porte l'idée. Repère : le
   post de Karl à 30 957 impressions ne nomme que du vocabulaire partagé par tous les devs
   (CI, tests, lint, PR) et zéro nom propre interne. Un nom d'API maison dans le post
   signale que la vérification a débordé dans la rédaction.
2. **Applique** la ligne de bornage de l'agent Hostile quand le post ne survit pas à
   l'attaque.
3. **Présente à Karl** les hooks de l'agent 1 et la réécriture de mécanisme de l'agent 2,
   avec la version d'origine à côté. Il tranche.
4. **Rejette** toute proposition qui sort de `references/voix.md`, en le disant.
5. **Dis ce que tu as écarté et pourquoi.** Une revue silencieuse ne s'audite pas.

Si deux agents se contredisent — le hook plus fort affaiblit la valeur, ou la ligne de
bornage casse le rythme — pose le choix à Karl au lieu de le trancher seul.

## Livraison

Dans cet ordre, sans commentaire d'accompagnement :

1. Le post final dans un bloc de code, retours à la ligne compris, prêt à coller.
2. Le hook retenu et quatre alternatives.
3. La direction de visuel, en une ligne de rappel.
4. Le compte rendu de revue : ce qui a été corrigé, ce qui a été écarté, ce qui reste
   non vérifié.

Puis ajoute une ligne à `references/posts-publies.md` : date, Big Idea en 12 mots, reçu
utilisé, pattern de hook.
