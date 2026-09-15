---
name: linkedin-post
description: Écrire un post LinkedIn de Karl, à partir d'une expérience réelle et vérifiable.
disable-model-invocation: true
---

Karl écrit pour **le pair** : un CTO ou un dev senior qui a déjà shippé, déjà cassé de la prod, déjà porté une migration jusqu'au bout. Une seule personne, pas une audience. Tout ce skill découle de là.

Karl est un **tueur au sens de crack** : celui qui délivre. Son arme est ce qu'il donne, pas ce qu'il attaque. Ses deux meilleurs posts (30 957 et 29 776 impressions) ne s'en prennent à personne — ils prennent position, prouvent, et donnent le mécanisme en entier.

Le pair impose trois choses :

- **On ne lui explique pas, on lui montre.** Il connaît les bases. Vulgariser le vexe et lui signale que le post ne lui est pas destiné.
- **Il repère le packaging.** Un hook générique se décode en une seconde et coûte la lecture. Il tolère l'emballage à condition que le contenu le tienne.
- **Il repart avec quelque chose d'exécutable.** Sinon il a lu une anecdote.

Un post qui marche, c'est **Big Idea × Autorité**, servi dans un **packaging**.

- **Autorité** — pourquoi le pair écoute Karl sur ce sujet précis. Elle ne se déclare pas, elle se prouve : une **cicatrice**, un **reçu**, sur son **terrain**.
- **Big Idea** — l'opinion tranchée que le post défend, en une phrase. Pas un constat tiède.
- **Packaging** — le hook et le visuel. Ils décident si le corps est lu. Ils s'écrivent en premier.

Les trois piliers de l'autorité :

- **Cicatrice** — un truc qui est arrivé à Karl, daté, qui a coûté quelque chose. Si ça n'a ni fait mal ni surpris, ce n'est pas une cicatrice.
- **Reçu** — l'artefact vérifiable : un chiffre mesuré, un extrait de code, un diff, une capture, un lien. Sans reçu, c'est un post d'opinion, et LinkedIn en est saturé.
- **Terrain** — mesuré sur les posts publiés, par reach décroissant : agents IA et orchestration, CI et qualité comme condition de l'autonomie, adoption de l'IA avec données, vécu d'indépendant, arbitrages d'architecture vécus, front-end et TypeScript. Hors terrain, le pair sait mieux que Karl, et ça se sent.

**Un produit n'est jamais le sujet d'un post.** Les cinq posts d'annonce de Karl plafonnent entre 579 et 4 000 impressions ; ses posts de position en font trente mille. Standards, RilayKit et Neo apparaissent comme **conséquence** d'un mécanisme démontré, jamais comme motif du post. Détail chiffré dans `references/voix.md`.

**Les clefs, pas le plan.** Le pair repart avec les principes actionnables — quoi faire, pourquoi ça marche, où s'inspirer — jamais avec l'implémentation : étages nommés du pipeline, outils internes, prompts, métriques de détail. Les résultats chiffrés font cliquer ; la méthode précise reste chez Karl. Un post qui liste ses étages internes documente un concurrent ; un post qui donne le principe et l'inspiration (« les process des repos open source de Vercel ») rend le pair capable sans rendre Karl copiable. Décidé le 2026-08-10, remplace « le post est autosuffisant ».

**L'ordre des étapes ne se négocie pas.** Autorité, puis Big Idea, puis packaging, puis corps. Écrire le corps en premier produit un post agréable que personne n'ouvre.

## 1. Sortir la cicatrice

Interroge Karl jusqu'à tenir les quatre :

- **Quand** — au moins le mois, ou la version, ou le sprint.
- **Où** — le projet, le package, le fichier, le client.
- **Ce qui a cassé** — le comportement précis, pas la catégorie du problème.
- **Ce que ça a coûté** — heures perdues, bug en prod, refonte, deadline ratée.

Une question à la fois, la plus discriminante d'abord. Karl répond court : creuse ce qui reste flou plutôt que d'empiler les questions.

**Critère de complétion** : tu peux réciter les quatre en une phrase chacun, avec des noms propres dedans. « Un bug de cache » ne compte pas ; « le epoch cache de `schema` servait la version N-1 pendant 30 s après un sync » compte.

Si Karl n'a pas de cicatrice sur ce sujet : dis-le, et propose les cicatrices que tu as réellement sous la main (mémoire de session, `git log`, issues récentes). Un post inventé se voit et coûte plus cher que pas de post.

## 2. Encaisser le reçu

Demande l'artefact qui prouve la cicatrice, et va le chercher toi-même quand il est dans le repo : `git log`, le fichier, l'issue, la PR.

**Critère de complétion** : tu tiens au moins un élément que le lecteur pourrait vérifier ou rejouer — un chiffre avec son unité et sa méthode de mesure, dix lignes de code réelles, un nom de commit, un lien public. Chiffres précis, jamais arrondis : `847 ms` bat « presque une seconde ». Un chiffre dont tu ne peux pas dire d'où il sort n'est pas un reçu : demande-le à Karl ou retire-le.

## 3. Formuler la Big Idea

Une phrase, 12 mots maximum, qui **prend position**. Le test : un pair doit pouvoir être en désaccord. Si personne de compétent ne peut contredire la phrase, ce n'est pas une Big Idea, c'est un constat — et un constat se scrolle.

Quatre contrôles :

- **Test du pair** — un CTO qui a déjà résolu ce problème apprend-il quelque chose ? S'il hocherait la tête en scrollant, la Big Idea vise un débutant : descends d'un cran dans le mécanisme, pas d'un cran dans la simplification.
- **Surprise** — elle dit l'inverse de ce que la niche répète, ou elle révèle un mécanisme que personne ne regarde.
- **Unicité** — ouvre `references/posts-publies.md`. Angle déjà servi → change d'angle, ou nomme à Karl l'écart réel entre les deux posts.
- **Test des 3 secondes** — un LLM pourrait-il écrire ce post sans connaître Karl ? Si oui, l'idée est générique : reprends. L'info est gratuite, le vécu de Karl ne l'est pas.

**Critère de complétion** : Karl valide la phrase. Tu ne rédiges rien avant.

## 4. Fabriquer le packaging

Le hook et le visuel, avant la première ligne de corps. Ouvre `references/packaging.md`.

**Critère de complétion** : Karl a choisi un hook parmi ceux proposés et validé la direction du visuel.

## 5. Écrire le corps

Ouvre `references/redaction.md` et suis-le.

## 6. Passer la self-review

Quatre agents en parallèle — hook, valeur, hostile, preuve — puis arbitrage et livraison. Ouvre `references/self-review.md`.

**Critère de complétion** : chaque chiffre du post a une source ou a été retiré, et l'attaque la plus probable d'un pair arrive désarmée dans le post.

---

**Voix.** `references/voix.md` prime sur tout le reste. Quand une tactique de packaging ou de rédaction contredit la voix de Karl, la voix gagne : un post optimisé qui ne sonne pas comme lui rate son seul avantage durable.

**Statut des chiffres cités dans ce skill.** Ils viennent des analyses publiques de LinkPost (~430 k posts). Ce sont des corrélations publiées par un éditeur qui vend un outil, pas des lois. Elles orientent les arbitrages ; elles ne justifient jamais de sacrifier la cicatrice ou le reçu.
