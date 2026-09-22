---
name: animate
description: Use when a mechanism, feature or launch needs a short demo video that reads as credible rather than as AI slop — explaining how a system decides, showing a feature inside its real interface, or cutting a clip for X and LinkedIn. Builds it with HyperFrames in the house art direction, verified at the image before it renders.
---

# Animate

A demo video is believed or it is not, and the thing that decides is whether a
viewer can check it. Slop is the failure mode: motion that decorates instead of
demonstrating, a number chosen because it made a prettier curve, a UI drawn to
look like the product rather than reproduced from it. None of it announces
itself — it just quietly costs the piece its authority.

Four laws defeat it. They are the whole skill; the run below is how you apply
them.

## Requires HyperFrames

This rite drives the HyperFrames CLI and borrows the `faceless-explainer`
workflow's scripts. Establish both before step 1:

```bash
npx hyperframes doctor --json | jq -e '.ok'   # Node 22+, FFmpeg, a browser
npx hyperframes skills                        # the core skill pack
npx hyperframes skills update faceless-explainer
```

`hyperframes` owns the composition contract and the render loop;
`faceless-explainer` owns the scripts this rite calls by name —
`build-frame.mjs`, `frame-packets.mjs`, `assemble-index.mjs` and
`transitions.mjs`, all under that skill's `scripts/` directory. Read
`hyperframes-core` before writing composition HTML yourself; when the frames are
built by workers, their packets carry it for them.

Their guidance governs the composition; the four laws below govern the film.
Where a HyperFrames default and a law disagree, the law wins — it is the reason
this rite exists.

## The four laws

**Literal.** Every number, name and price on screen is computed from the
repository and traceable to a line in it. The catalogue is 27 because it is 27.
A funnel reads `27 → 12 → 8 → 2 → 1` because the real predicates produce that,
not because it falls prettily. When a set is small enough, draw it — 27 dots
that extinguish in place let a viewer count and agree, so the film asserts
nothing it cannot show. Values stay unrounded, unpadded, and awkward when they
are awkward. **Nothing on screen is adjusted for rhythm.**

**Product.** A UI on screen is reproduced from its real design tokens, at its
real px, never illustrated from memory. Read the tokens out of the codebase —
`DA.md` says where — and author every value literally inside one wrapper that
carries a uniform `transform: scale(...)`, so the source stays true while the
canvas gets a legible size.

**One move, one point.** Each frame moves one thing to prove one thing. One
focal object; a second object at a lower opacity is still a second object.
Translations stay small, the easing is single, and nothing bounces or spins.
Hierarchy comes from a 1px hairline and from air — no shadow anywhere, no
decorative icon, no generated footage.

**The floor.** The piece is watched at roughly a third of its canvas width in a
feed, so divide by three and size for that. Nothing load-bearing survives under
~44px on a 1920 canvas. When a layout fights the floor, change the layout: five
words in a row are bound by their sum, five words in a column by the longest, so
the column can be twice the size.

## The run

Each step names what ends it.

1. **Fix the claim, then compute it.** Write the one sentence the film must
   deliver, then open the code that decides it and compute every figure the film
   will show. **Done when every number you intend to put on screen is traced to
   a line in the repository** — and when the computed numbers contradict your
   plan, the plan changes. They are usually the better story.

2. **Scaffold and adopt the art direction.** `npx hyperframes init <name>
   --non-interactive --example=blank --resolution <landscape|square>`, then
   follow `DA.md` to build `frame.md` and vendor the fonts and the mark. **Done
   when `assets/fonts/` holds every face the film uses and no frame will need
   the network to render.**

3. **Write `STORYBOARD.md`.** Four frames, rarely more; a fifth usually means
   two are the same beat. Give each a time-coded scene sequence to the tenth of
   a second, and a `## Video direction` block carrying the four laws as this
   film's own rules. **Done when each frame states what it proves, and the
   durations sum to the target length.**

4. **Dispatch one worker per frame.** Build the packets
   (`frame-packets.mjs`), then send one subagent per frame, in parallel, each
   carrying `_role.md`, its packet, and the constraint block from `WORKER.md`.
   **Frames coupled by a hard cut go to ONE worker** — two authors produce two
   geometries and the cut jumps; make that worker measure both sides and report
   the boxes. **Done when every frame file exists and each worker has reported
   what it could not honour.**

5. **Assemble and gate.** `assemble-index.mjs`, then `transitions.mjs inject`
   (after assembly — it needs `index.html`), then `verify`, `lint`, `check`.
   **Done when `lint` and `check` both pass**, with any surviving warning named
   and justified rather than silenced: a row dimmed on purpose fails contrast
   because it is meant to be extinguished, and raising it would destroy the
   shot.

6. **Read the contact sheet.** `npx hyperframes snapshot --at <t1,t2,…>` across
   every beat, then look at the image. **This step is not optional and it is
   where the real defects are** — `lint` and `check` cannot see a composition
   sitting in one corner, a tooltip colliding with the text under it, a label
   that reads as a caption because its neighbour is a space away, or a block
   that reads as a UI which failed to load. **Done when you have looked at every
   sampled beat and can name what each one proves.** Send fixes back to the
   worker that owns the frame; its context is intact.

7. **Render.** `npx hyperframes render --quality high --output renders/<name>.mp4`,
   then `ffprobe` it. **Done when the file exists with the expected dimensions,
   duration and frame rate.**

## Reference

- [`DA.md`](DA.md) — the art direction: the two-layer rule, the palette roles,
  the fonts, the mark, and where the real product tokens live.
- [`WORKER.md`](WORKER.md) — the constraint block every frame worker receives.
  It carries the traps that each cost a rebuild the first time.
