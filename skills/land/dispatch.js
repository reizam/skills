export const meta = {
  name: 'land-dispatch',
  description: 'One land sweep: every red head fixed, every green head judged, answered and re-judged, in parallel, up to three rounds',
  phases: [
    { title: 'Fix', detail: 'one fixer per red head' },
    { title: 'Judge', detail: 'one juror per green head, at its fixed tier' },
    { title: 'Answer', detail: 'the fixer answers the verdict on the branch' },
    { title: 'Re-judge', detail: 'the previous entries and the delta, nothing else' },
  ],
}

// args = {
//   skill: '<absolute path of land/SKILL.md>',
//   solo:  '<absolute path of evaluate/SOLO.md>',
//   heads: [{ number, branch, head, tier, round, state: 'red' | 'green',
//             failure?: '<failed step + log excerpt, or the conflict>',
//             previousVerdict?: '<entries of the last verdict, with the fixer's answers>' }],
// }
// `round` is the number of `land: verdict` stamps the PR already carries.

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

const results = await pipeline(args.heads, async (pr) => {
  if (pr.state === 'red') {
    const push = await fixer(pr, pr.failure, 'Fix')
    return { number: pr.number, head: push.head, outcome: 'fixed', note: push.summary }
  }

  let round = pr.round + 1
  let head = pr.head
  let verdict = await juror({ ...pr, head }, round, pr.head)
  while (!verdict.go && round < 3) {
    const push = await fixer({ ...pr, head }, verdict.verdict, 'Answer')
    const judged = head
    head = push.head
    round += 1
    verdict = await juror({ ...pr, head, previousVerdict: verdict.verdict }, round, judged)
  }
  return { number: pr.number, head, outcome: verdict.go ? 'go' : 'with-karl', note: verdict.verdict }
})

return results.filter(Boolean)
