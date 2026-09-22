# The art direction

Two layers, never mixed. The **product** layer reproduces a real interface at its
real design tokens. The **editorial** layer — titles, chips, counts, code — is
the house voice around it. Mixing them is the fastest way to make a reproduced UI
look like an illustration of one.

## Where the real tokens live

Read them, do not remember them. In `standards`, the light theme resolves from
`packages/ds/src/tokens/theme.css`; a component's true geometry is in its own
source, e.g. the chat composer in
`packages/ui/src/components/ai/core/chat-input.tsx`. Resolve the HSL to hex once
and record it in `frame.md` with the CSS variable it came from, so the next
person can check it.

Measured for the Standards light theme:

| role | hex | token |
|---|---|---|
| canvas | `#FFFEFA` | `--background` |
| ink | `#231F1F` | `--foreground` |
| surface | `#F7F4EF` | `--secondary` / `--card` / `--muted` |
| raised | `#F1EEEA` | `--accent` |
| hairline | `#E8E6E3` | `--border` |
| muted text | `#6D6A68` | `--muted-foreground` |
| faint | `#8A8785` | `--muted-foreground-faint` |

`--muted-foreground-faint` is reserved for decorative glyphs by its own token
comment, and it fails contrast at 3.54:1. Content — a cost, a model name, a
figure — takes `--muted-foreground`.

Geometry worth caching, because it is spread across files: the composer shell is
`border-radius: 20px` on `#F7F4EF` over a 1px `#E8E6E3` hairline with no shadow;
its model selector is `border-radius: 8px` on `rgba(35,31,31,0.05)`, Inter 500
12px, letter-spacing −0.0045em; the send button is a 32px `#231F1F` circle.

## The editorial layer

And You Create, taken from the client report (`~/.claude/skills/client-report/template/report.css`):

| role | value |
|---|---|
| ink | `#131313` |
| body | `#3d3d3d` |
| muted | `#5f5f5f` |
| faint | `#8b8b8b` |
| card | `#fafafa`, 10px radius, no border, no shadow |
| dark card | `#131313`, white ink, body `#c9c9c9` |
| accent | `#2ecc71` |
| chip | outlined `#dcdcdc` pill, uppercase, `letter-spacing: 0.18em` |

**The accent appears once in a film.** In the report it only ever marks the one
dark card; treat it the same way — one dot, on the one thing that was chosen.
A second green is the accent spent.

## Type

**Inter inside a product UI. Manrope for editorial. JetBrains Mono for anything
machine-written** — identifiers, predicates, prices, urls. The split is the
two-layer rule made visible, and a viewer reads it without being told.

Vendor every face. Fetch the latin subset of the variable font from Google and
save it under `assets/fonts/`, then declare `@font-face` with a **root-relative**
`src` — `assets/fonts/inter-var.woff2`, never `../../assets/...`, which the
linter rejects as parent traversal. Verify each file starts with the `wOF2`
magic. A render that needs the network is a render that will fail somewhere else.

```bash
curl -sS "https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=block" \
  | grep -o 'https://fonts.gstatic.com[^)]*\.woff2' | tail -1
```

The last `@font-face` block Google emits is the latin subset. Manrope's range is
`200..800` and JetBrains Mono's is `100..800`; asking for `100..900` is refused.

## The mark

When a film needs an icon, it takes the product's own. Extract it from the
installed package rather than redrawing it — a likeness reads as a likeness:

```bash
node -e "console.log(require('fs').readFileSync('<pkg>/dist/defs/<Icon>.es.js','utf8'))" \
  | grep -A2 '"fill"'
```

Phosphor's viewBox is `0 0 256 256`, so set width and height explicitly and let
`fill="currentColor"` inherit. Keep the extracted SVG in `assets/` as a text file
with a comment naming the package, the version and the product file that uses
it, and have every worker paste from there.

## Adopting a preset

`build-frame.mjs --preset <name>` remixes a shipped preset onto brand tokens, and
it maps colours onto roles positionally. **Check the result before trusting it**:
it has mapped a surface colour onto a text role, which renders body copy
invisible, and its self-check only compares ink against canvas. Read every
`colors:` entry in the produced `frame.md` and fix the roles by hand.
