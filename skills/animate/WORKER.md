# The frame worker's constraint block

Paste this into every frame-worker dispatch, under the packet paths and the
frame's own content. Each line is a trap that cost a rebuild the first time it
was met.

---

## Composition

Set `data-composition-id`, `data-width`, `data-height` and `data-duration` on the
root, and a stable `id` on every clip layer — `lint` fails the project without
them. **A worker that regenerates its file from a shared source drops these; put
them in the generator, not in the output.**

Set every initial state in CSS or with `gsap.set(...)` **outside** the timeline.
A `tl.set(...)` at position 0 does not render while the playhead sits exactly at
0, so frame 0 shows the un-hidden state — and through a crossfade that is a
visible flash of the ending over the previous frame. This bug travels in
families: when you find one, check every element whose resting state the timeline
establishes.

Animate transforms only — `x`, `y`, `scale`, `scaleX`, `opacity`. Layout
properties (`top`, `left`, `width`, `height`) snap to integer device pixels, and
the capture engine seeks frame by frame, so an ease-out tail stutters. A dot that
shrinks does it with `scale`, not with `width`.

A presentation wrapper carrying `transform: scale(...)` must carry **no GSAP
target**, or the scale fights the animation. Put the entrance tween on an
unscaled parent.

Prefer `autoAlpha: 0` over `opacity: 0` when something leaves: it also sets
`visibility: hidden`, which takes the element out of the layout checkers as well
as out of the eye. A block dimmed to 0.12 still has mass, and a mark landing on
top of it reads as breakage.

## Legibility

Size for the feed: the piece is watched at about a third of the canvas width.
Nothing load-bearing goes under ~44px on a 1920 canvas. When a string cannot fit
at that size, change the layout before you change the size — stack instead of
row, wrap an array prettier-style, drop an element that has already done its job
elsewhere in the film.

**Two labels need a gap larger than the spaces inside them.** At 40px mono the
inter-word space is ~24px, so 23px between two labels reads as one string. Aim
for 2× the widest internal space, and verify by measuring rendered bounding
boxes.

**Measure the text, not the box it sits in.** A label wider than the grid it
belongs to can breach the margin while the grid stays inside it. Check the
rendered run, not the container.

Centre what is **drawn**, not the element that holds it. A block sized to a
nominal width with narrower ink inside lands off-centre on screen.

## Truth

Report what you could not honour, in one line, rather than resolving it silently.
Two constraints that contradict each other are the author's bug to fix, not
yours to arbitrate — say which two.

Verify by measuring in a real browser, not by arithmetic. Count what rendered,
not what the source array holds. When a report says a count, it means a count of
what is on screen.

Never adjust a value for rhythm or symmetry. An awkward number stays awkward.
