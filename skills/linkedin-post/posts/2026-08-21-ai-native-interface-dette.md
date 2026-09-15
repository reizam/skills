---
date: 2026-08-21
big_idea: Si un agent sait le faire, ton interface est de la dette.
hook: double détente élargie hors dev (B1)
visuel: photo perso (vacances), aucun texte incrusté
recus:
  - "04/04/2026 — ec8ea2b3b + 5400e6f7c + 431933347 + a9a89f50f = -30 224 lignes (éditeur de workflows supprimé)"
  - "11/03/2026 — fac4347c2 (flows avancés, assign node, expression editor)"
  - "31/03/2026 — 78391436d (pivot form-only agent triggers)"
  - "11/01/2026 — b4ed16ecb (workflow-builder déjà en place → ~3 mois de chantier)"
  - "Figma : ~960 000 tokens renvoyés pour un composant vs ~67 000 estimés par l'UI ; appels à 657 311 tokens > fenêtre de contexte (forum Figma, issue Kilo-Org/kilocode #2378)"
non_verifie:
  - "« Figma a dû faire une refonte » — aucune source ne l'établit, retiré du post."
---

Tout le monde veut faire une boîte "AI-native".
Nous, ça a commencé par jeter 3 mois de travail.
En une journée.

4 avril. 30 224 lignes supprimées.
Notre éditeur de workflows à la n8n.
Tu tires des flèches entre des boîtes pour dire à la machine quoi faire.

On l'avait construit parce que tout le monde en construit un.
Puis on a regardé un agent faire le même boulot.
Sans le graphe.

Le problème ?
Un éditeur de nodes, c'est une interface pour un humain.
Les boîtes, les flèches, la mise en page : ça sert un œil.
Pas une machine.

Et ça se paie cash.

Sur Figma, des devs mesurent ~960 000 tokens renvoyés pour UN seul composant.
L'interface, elle, en estime 67 000 pour le même.

Ce JSON n'est pas "trop gros".
Il est fait pour l'écran.

La ligne de partage est là :
→ Interface pour humain : verbeux, positionné, redondant. L'œil ignore le superflu gratuitement car les données sont traduites en interface.
→ Interface pour agent : chaque champ inutile est payé. En tokens, en latence, en erreurs.
↳ Un agent ne survole pas. Il lit TOUT, à chaque fois.

Depuis, notre règle tient en une phrase :
si un agent sait faire, l'interface qui le reproduit est de la dette.

On ne construit plus d'écrans pour faire le travail.
On construit des écrans pour VOIR le travail fait.

Et la plupart des produits "AI-native" que je croise font l'inverse.
Une interface d'humain.
Un chat posé dessus.
Et l'addition en tokens.

T'as déjà supprimé une feature parce qu'un agent la rendait inutile ? Raconte 👇
