export const meta = {
  name: 'land-dispatch',
  description: 'One land sweep: every red head fixed, every green head judged, answered and re-judged, every go with a screen demonstrated five per stack, in parallel, up to three rounds',
  phases: [
    { title: 'Fix', detail: 'one fixer per red head' },
    { title: 'Judge', detail: 'one juror per green head, at its fixed tier' },
    { title: 'Answer', detail: 'the fixer answers the verdict on the branch' },
    { title: 'Re-judge', detail: 'the previous entries and the delta, nothing else' },
    { title: 'Demo', detail: 'five go heads merged on one stack, each gesture on video' },
  ],
}

// args = {
//   skill: '<absolute path of land/SKILL.md>',
//   solo:  '<absolute path of evaluate/SOLO.md>',
//   slack: '<absolute path of verifying-changes/SLACK.md>',
//   stack: '<absolute path of the demo worktree, .worktrees/land-demo>',
//   heads: [{ number, branch, head, tier, round, screen: boolean,
//             state: 'red' | 'green' | 'demo',
//             failure?: '<failed step + log excerpt, or the conflict>',
//             judged?: '<SHA the last verdict judged>',
//             previousVerdict?: '<entries of the last verdict, with the fixer's answers>' }],
// }
// `round` is the number of `land: verdict` + `land: demo failed` stamps the PR
// already carries. `state: 'demo'` is a go head with a screen and no demo yet.

const BATCH = 5

const PUSH = {
  type: 'object',
  properties: { head: { type: 'string' }, summary: { type: 'string' } },
  required: ['head', 'summary'],
}
const VERDICT = {
  type: 'object',
  properties: { head: { type: 'string' }, go: { type: 'boolean' }, verdict: { type: 'string' } },
  required: ['head', 'go', 'verdict'],
}
const DEMO = {
  type: 'object',
  properties: {
    results: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          number: { type: 'number' },
          head: { type: 'string' },
          demo: { type: 'string', enum: ['pass', 'fail', 'interaction', 'skipped-model', 'skipped-stack', 'conflict'] },
          note: { type: 'string' },
        },
        required: ['number', 'head', 'demo', 'note'],
      },
    },
  },
  required: ['results'],
}

function fixer(pr, brief, phase) {
  return agent(
    `You are the fixer of pull request #${pr.number} (branch \`${pr.branch}\`, pinned head \`${pr.head}\`).
Read § 2 of ${args.skill} and obey it: worktree on the branch, reproduce first, red-proven fix, conflict resolved in a merge commit, the project's gate before pushing.
Stamp \`land: fixing ${pr.head}\` on the PR before touching a line (gh pr comment).

Your brief:
${brief}

Answer every entry or refute it in writing, in a PR comment whose first line is \`land: fixed ${pr.head}→<new head>\`.
Run \`git cat-file -e <new head>\` before quoting it. Return the new head SHA and one line per change.`,
    { label: `fix:#${pr.number}`, phase, schema: PUSH },
  )
}

function juror(pr, round, judged) {
  const first = round === 1
  const brief = first
    ? `Round 1. Run ${args.solo} on pinned head \`${pr.head}\` with the counts of tier **${pr.tier}** as § 3 of ${args.skill} lists them. Stamp \`land: verdict 1 ${pr.head}\` on the PR with the entries.`
    : `Round ${round}. Judge two things only: the previous verdict's entries with the fixer's answers, and \`git diff ${judged}..${pr.head}\`.
For each entry return **closed** (quote the test or excerpt that proves it) or **open** (what is still missing). Then read the delta alone and return any \`blocking\` it introduces. Nothing else is in scope.
Stamp \`land: verdict ${round} ${pr.head}\` on the PR with the entries.

Previous verdict and answers:
${pr.previousVerdict}`
  return agent(
    `You are the juror of pull request #${pr.number}, pinned head \`${pr.head}\`. Read ${args.skill} § 3 first. Never judge a head other than the pinned one.
${brief}

Return go=true only when ${first ? 'there is no `blocking` and no `to fix`' : 'every entry is closed and the delta introduces no `blocking`'}. Return the verdict text exactly as stamped.`,
    { label: `judge:#${pr.number} r${round}`, phase: first ? 'Judge' : 'Re-judge', schema: VERDICT },
  )
}

function demonstrator(batch, n) {
  const list = batch.map((pr) => `- #${pr.number} \`${pr.branch}\` head \`${pr.head}\``).join('\n')
  return agent(
    `You are the demonstrator of batch ${n} of this land sweep. Read § 3 "Demo" of ${args.skill} and obey it, then ${args.slack} for the announcement upload.

The batch:
${list}

Demo worktree: ${args.stack} (its sandbox slot is fixed by its path: \`pnpm exec tsx apps/sandbox/scripts/instance-slot.ts --print-env\` prints the ports). Work there and only there.

In order:
1. \`git fetch origin\`, a throwaway branch \`land-demo/${n}\` from \`origin/main\`, each head merged in with \`git merge --no-ff\`; a head that conflicts is dropped from the batch and returned as \`conflict\` (reset the merge, continue with the others). Never push this branch.
2. The stack: \`pnpm sandbox:e2e:up && pnpm sandbox:e2e:ready\` if \`sandbox:e2e:ready\` does not already pass; \`pnpm sandbox:e2e:reset\` first when a merged head carries \`packages/adapter-postgres/migrations/\`. Then \`pnpm turbo run build --filter='@sandbox/web^...'\`, restart the \`sandbox-api\` container on the fresh dist (the compose file under apps/sandbox names it), \`rm -rf apps/sandbox/web/.next\`, and start the web dev server on the slot's \`SANDBOX_WEB_PORT\` with the four \`NEXT_PUBLIC_*\` the slot implies (see webServerEnv in apps/sandbox/web/playwright.config.ts). A stack that stays down after one retry returns every head as \`skipped-stack\` with the failing step's output.
3. For each head, before reading its diff: the gesture from \`gh pr view <N>\` (title, body, the issue it closes) — route, steps, end state a person can check. A model-backed surface (chat, architect, anything that calls a model) is \`skipped-model\` without a try: the stack's gateway key is a placeholder.
4. One spec per head at apps/sandbox/web/e2e/qa/<N>.spec.ts asserting the end state, human pace; run them together from apps/sandbox/web: \`SANDBOX_INSTANCE=<slot> SANDBOX_WEB_PORT=<port> pnpm exec playwright test --config playwright.qa.config.ts qa/ --workers=${BATCH}\`. Unique data names per spec (suffix \`land<N>\`), never delete another spec's data.
5. A failing gesture is replayed alone: a second throwaway branch \`land-demo/${n}-<N>\` = origin/main + that head only, same rebuild, that spec only. Fails again → \`fail\`. Passes alone → \`interaction\`; return the pair it collided with in the note when you can name it.
6. Stamps, video attached (\`gh pr comment <N> --attach <video.webm>\`): \`land: demo <head>\` for a pass (the gesture in three lines), \`land: demo failed <head>\` for a fail (the spec in a fenced block, expected against observed), \`land: demo skipped — needs a model\` / \`— stack: <what>\`. Each pass is then announced on Slack as § 3 Demo point 5 says; missing SLACK_BOT_TOKEN or SLACK_QA_CHANNEL_ID is noted in the note, not an error.
7. \`git worktree\` stays; delete the throwaway branches, keep the stack up for the next batch.

Return one result per head of the batch.`,
    { label: `demo:batch ${n}`, phase: 'Demo', schema: DEMO },
  )
}

// Go heads with a screen wait here; the demonstrator takes five at a time, one
// batch after another on the single stack, while the other chains keep running.
const pending = []
const demoOf = new Map()
let batches = Promise.resolve()
let batchNo = 0
let chainsLeft = args.heads.length

function flush(force) {
  while (pending.length >= BATCH || (force && pending.length > 0)) {
    const batch = pending.splice(0, BATCH)
    const n = ++batchNo
    batches = batches
      .then(() => demonstrator(batch, n))
      .then(
        (r) => { for (const x of (r && r.results) || []) demoOf.set(x.number, x) },
        () => { for (const pr of batch) demoOf.set(pr.number, { number: pr.number, head: pr.head, demo: 'skipped-stack', note: 'the demonstrator died' }) },
      )
  }
}

function offer(pr) {
  if (pr.screen) pending.push(pr)
  flush(false)
}

function chainDone() {
  chainsLeft -= 1
  if (chainsLeft === 0) flush(true)
}

const judged = await pipeline(args.heads, async (pr) => {
  try {
    if (pr.state === 'red') {
      const push = await fixer(pr, pr.failure, 'Fix')
      return { number: pr.number, head: push.head, outcome: 'fixed', note: push.summary }
    }
    if (pr.state === 'demo') {
      offer(pr)
      return { number: pr.number, head: pr.head, outcome: 'go', note: 'go already stamped; demo pending' }
    }

    let round = pr.round + 1
    let head = pr.head
    let verdict = await juror({ ...pr, head }, round, pr.judged || pr.head)
    while (!verdict.go && round < 3) {
      const push = await fixer({ ...pr, head }, verdict.verdict, 'Answer')
      const judgedSha = head
      head = push.head
      round += 1
      verdict = await juror({ ...pr, head, previousVerdict: verdict.verdict }, round, judgedSha)
    }
    if (verdict.go) offer({ ...pr, head })
    return { number: pr.number, head, outcome: verdict.go ? 'go' : 'with-karl', note: verdict.verdict }
  } finally {
    chainDone()
  }
})

flush(true)
await batches

// A failed demo is a verdict entry: the fixer answers it in this run, and the
// next sweep re-judges the delta and demonstrates again.
const results = await Promise.all(
  judged.filter(Boolean).map(async (r) => {
    const d = demoOf.get(r.number)
    if (!d || r.outcome !== 'go') return r
    const pr = args.heads.find((h) => h.number === r.number)
    switch (d.demo) {
      case 'pass':
        return { ...r, note: d.note }
      case 'fail': {
        const push = await fixer({ ...pr, head: d.head }, d.note, 'Answer')
        return { number: r.number, head: push.head, outcome: 'fixed', note: push.summary }
      }
      case 'interaction':
        return { ...r, outcome: 'with-karl', note: d.note }
      case 'conflict':
        return { ...r, outcome: 'demo-skipped', note: `conflicts with the batch — next sweep; ${d.note}` }
      case 'skipped-model':
        return { ...r, outcome: 'go', note: d.note }
      default:
        return { ...r, outcome: 'demo-skipped', note: d.note }
    }
  }),
)

return results
