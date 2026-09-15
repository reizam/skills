---
date: 2026-08-22
big_idea: Sur une lib mature, tu ne contribues pas en codant, tu contribues en reproduisant.
hook: aveu chiffré + open loop ("Mais en vrai...")
visuel: capture GitHub brute de TanStack/query#11105 (Merged, +9 −9, diff visible)
cta: retiré du corps — à poster en premier commentaire ("Ta dernière contribution open source, c'était du code ou un repro ?")
recus:
  - "TanStack/query #11093 — +28 −26 sur 5 fichiers, mergée le 26/07/2026 par sukvvon"
  - "TanStack/query #11105 — +9 −9 sur 4 fichiers, mergée le 26/07/2026"
  - "vercel/ai #17590 — sa PR de doc, +20 −1, FERMÉE 40 min après ouverture (21/07 11:28 → 12:08) par lgrammel : « Issue #17579 was closed as completed. »"
  - "vercel/ai issues #17936 + #17937 — ouvertes par reizam le 25/07 avec repro, fermées le 28/07"
  - "Fixes co-authorés : dc2f851b8 (+86 −0) et d2d932441 (+63 −1) = 149 lignes, écrites par Lars Grammel, Co-authored-by: reizam"
erreurs_evitees:
  - "vercel/ai #17610 (+1537 −7, toujours ouverte) N'EST PAS de Karl — auteur lgrammel, Karl y est reviewer. Ne jamais la présenter comme sa PR."
---

J'ai contribué à TanStack Query.

Ça claque sur un profil.

Mais en vrai...

C'est seulement 37 lignes de tests.

Deux PR. Zéro ligne de code de prod.
J'ai remplacé des assertions vagues par des valeurs exactes.
Mergées en 4 jours.

Chez Vercel, j'ai tenté d'apporter un truc.
Une PR de doc. 20 lignes.
Fermée en 40 minutes.

Le truc que personne ne dit :
sur une lib ultra-mature, contribuer du CODE est quasi impossible.

Et c'est pas une question de niveau.
→ La lib porte des années de décisions que t'as pas vécues.
→ Chaque API publique est un contrat que les mainteneurs paieront pendant 5 ans.
→ Une feature externe, c'est de la maintenance que tu leur offres sans leur demander.
↳ Ta PR n'est pas mauvaise. Elle arrive juste derrière leur roadmap. C'est pas pareil.

Et pourtant j'ai eu une vraie contribution chez Vercel.
Je n'en ai pas écrit une ligne.
J'ai juste ouvert deux issues avec un repro exact.

3 jours plus tard, le mainteneur de l'AI SDK écrivait le fix.
149 lignes.
Avec mon nom en co-author.

Compare.
Mes 20 lignes de doc : fermées en 40 minutes.
Mon repro : 149 lignes écrites par un mainteneur en 3 jours.

Sur une lib mature, ta valeur n'est pas dans le code que tu proposes.
Elle est dans le bug que tu sais reproduire.
Eux ont le contexte. Toi t'as le cas réel.
Et le cas réel, ils l'ont PAS.

Alors la prochaine fois que tu vois "contributeur open source" sur un profil,
demande le diff.
Le mien fait 37 lignes de tests. 🙃
