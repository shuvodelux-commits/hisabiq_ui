#!/usr/bin/env node
/**
 * GitHub-hosted HisabIQ /ui-refine-loop adapter.
 * The upstream .claude/workflows/ui-refine-loop.js requires an Agent Workflow
 * host. This adapter keeps its separate role boundaries and immutable guardrails
 * using fresh Codex Action invocations. It is NOT that host's JS evaluator.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const RUN = path.join(ROOT, '.refine-cloud');
const REPORTS = path.join(RUN, 'reports');
const PROMPTS = path.join(RUN, 'prompts');
const SHOTS = path.join(RUN, 'shots');
const SKILL = '.claude/skills/ui-refine-loop';
const TARGET = 'src/pages/Expenses.tsx';
const ROUTE = '/#/app/expenses';
const command = process.argv[2];
const round = Number(process.argv[3] || 0);
const make = dir => fs.mkdirSync(dir, { recursive: true });
const save = (file, data) => { make(path.dirname(file)); fs.writeFileSync(file, data); };
const json = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const rel = file => path.relative(ROOT, file).split(path.sep).join('/');
const exec = (file, args, opt = {}) => execFileSync(file, args, { cwd: ROOT, stdio: 'inherit', ...opt });
const fail = message => { throw Error('ui-refine-cloud: ' + message); };

const issue = {
  type: 'object',
  properties: {
    id: { type: 'string' }, severity: { type: 'string', enum: ['P0','P1','P2','P3'] },
    type: { type: 'string' }, title: { type: 'string' }, location: { type: 'string' },
    evidence: { type: 'string' }, fix: { type: 'string' }
  },
  required: ['id','severity','type','title','location','evidence','fix'],
  additionalProperties: false
};
const shape = (p, required) => ({ type: 'object', properties: p, required, additionalProperties: false });
const str = { type: 'string' };
const num = { type: 'number' };
const arr = type => ({ type: 'array', items: type });
const dims = names => shape(Object.fromEntries(names.map(n => [n, num])), names);
const schemas = {
  design: shape({ dims: dims(['specificity','hierarchy','typography','color','composition']), designTotal:num, problems:arr(issue), strengths:arr(str), openQuestions:arr(str) }, ['dims','designTotal','problems','strengths','openQuestions']),
  detector: shape({ dims: dims(['accessibility','performance','responsive','theming','integrity']), auditTotal:num, detectorRan:{type:'boolean'}, detectorCount:num, problems:arr(issue), openQuestions:arr(str) }, ['dims','auditTotal','detectorRan','detectorCount','problems','openQuestions']),
  checker: shape({ problems:arr(issue), vsBefore:{type:'string',enum:['baseline','better','same','worse']}, vsBeforeNote:str, summary:str, openQuestions:arr(str) }, ['problems','vsBefore','vsBeforeNote','summary','openQuestions']),
  finish: shape({ grades:arr(shape({ id:str, grade:{type:'string',enum:['fixed','partial','not-fixed']}, evidence:str }, ['id','grade','evidence'])), regressions:arr(str), disposition:str }, ['grades','regressions','disposition'])
};
const CHECKS = [
  ['TypeScript', 'npx', ['tsc', '--noEmit']],
  ['ESLint', 'npm', ['run','lint']],
  ['UI contract', 'npm', ['run','check:ui-contract']],
  ['Unit', 'npm', ['test']],
  ['Build', 'npm', ['run','build']],
  ['Expenses workflows Playwright', 'node', ['scripts/expense-workflows-browser.cjs']],
  ['Expenses Bangla Playwright', 'node', ['scripts/bangla-expenses-browser.cjs']]
];

const common = `Target: ${ROUTE}, source: ${TARGET}.
You MUST read ${SKILL}/SKILL.md, AGENTS.md, DESIGN.md, docs/design/taste.md,
docs/ui/HISABIQ-DESIGN-GUIDE.md, docs/ui/transaction-cart-design-contract.md,
docs/ui/ui-refine-loop.md, and the current Expenses source and imports.
Use the initialized, pinned official Impeccable at .agents/skills/impeccable.
The original HisabIQ_UI is final authority. No redesign, backend, accounts,
business rules, posting, pricing/ledger calculations, storage or workflow changes.
Keep bilingual English/Bangla, 36px ordinary controls, 0.375rem radius, 13/12/11
table typography, accessible 320/390 phones and 768/1024 tablets, light/dark.
Never invent fixtures, screenshots, scores, working actions or tests.
This GitHub cloud runner uses fresh *isolated* Codex invocations per role.
Write all requested findings honestly; do NOT claim to have executed the upstream
Workflow JS or that independent roles ran in parallel.
The codebase's demo expense posting is preview-only.`;

function ensureSetup() {
  for (const d of [RUN,REPORTS,PROMPTS,SHOTS]) make(d);
  // Keep temporary generated files out of Git; no changes to the repository ignore policy.
  fs.appendFileSync('.git/info/exclude', '\n.refine-cloud/\n');
  const detected = JSON.parse(execFileSync('bash', [`${SKILL}/scripts/refine-setup.sh`, 'detect'], { cwd: ROOT, encoding: 'utf8' }));
  if (detected.critic !== 'impeccable' || !detected.impeccable?.detect || detected.warnings?.length)
    fail('Impeccable is missing or degraded: ' + JSON.stringify(detected.warnings));
  if (detected.rounds !== 3) fail('Expected three configured rounds');
  const expected = ['npx tsc --noEmit','npm run lint','npm run check:ui-contract','CI=1 npm test','npm run build'];
  if (expected.some(s => !detected.checks.includes(s))) fail('Mandatory check commands missing');
  save(path.join(RUN,'detect.json'), JSON.stringify(detected, null, 2));
  // In CI, recursive checkout MUST initialize submodule before this check.
  const commit = execFileSync('git',['-C','vendor/impeccable','rev-parse','HEAD'],{encoding:'utf8'}).trim();
  if (commit !== 'e89e3ada3e875a89ac2c5d33d11e65ebef6fe285') fail('Impeccable pin mismatch: '+commit);
  console.log('Pinned Impeccable detected; three-round configuration present.');
}

function prompt(role, n) {
  if (!Number.isInteger(n) || n < 1 || n > 4) fail('round must be 1..4');
  const previous = n === 1 ? 'round-0' : `round-${n-1}`;
  const cur = n === 1 ? 'round-0' : `round-${n-1}`;
  const saved = path.join(REPORTS,`round-${n}-${role}.json`);
  const baseline = `Images: .refine-cloud/shots/round-0-main-{desktop,mobile}-{light,dark}.png`;
  const current = `Current screenshots: .refine-cloud/shots/${cur}-main-{desktop,mobile}-{light,dark}.png`;
  let body;
  switch(role) {
    case 'design':
      body = `Fresh, independent Impeccable visual design reviewer, Assessment A ONLY.
Read ${SKILL}/references/checker-brief.md 'Design reviewer'; read
.agents/skills/impeccable/reference/critique.md (Assessment A) and craft-floor.md.
Inspect the screenshots supplied to this invocation (both themes, both sizes).
${baseline}
${current}
Judge actual pixels and code. Score specificity, hierarchy, typography,
color and composition from 0 to 4. Return designTotal as the correct sum /20.
Return at most eight verified typed ranked problems using ${SKILL}/references/routing.md.
DO NOT read another role's report. Do not change files. Do not run a rubric fallback.`;
      break;
    case 'detector':
      body = `Fresh, independent Impeccable DETECTOR and AUDIT (Assessment B).
Read ${SKILL}/references/checker-brief.md 'Detector', Impeccable audit.md,
and Impeccable craft-floor.md. Run the pinned official Impeccable detector on
${TARGET}; check its findings against source and remove false positives.
Score accessibility, performance, responsive, theming, integrity each 0..4.
Return auditTotal as sum /20, detectorRan=true ONLY IF actually executed,
detectorCount as grounded nonnegative integer, and at most eight problems.
DO NOT read other role reports or screenshots. Do not change app files.
If detector cannot run, return detectorRan=false with a precise reason;
never silently substitute rubric output.`;
      break;
    case 'checker':
      body = `Fresh Impeccable CHECKER role. Read ${SKILL}/references/checker-brief.md 'Checker'.
Read only the completed independent findings at:
.refine-cloud/reports/round-${n}-design.json and
.refine-cloud/reports/round-${n}-detector.json.
Read the available baseline/current screenshots, source and prior issue ledger.
Merge matching problems into at most eight P0..P3 typed problems, retain stable
IDs, respect HisabIQ owner taste above generic suggestions, compare against
round-0, and return a grounded one-line summary and before/after judgement.
No code edits, no invention, no generic UI redesign.`;
      break;
    case 'fixer':
      body = `Fresh Impeccable FIXER for round ${n}. Read
${SKILL}/references/fixer-brief.md, ${SKILL}/references/routing.md,
the actual .agents/skills/impeccable/SKILL.md Commands table and the matching
Impeccable playbooks; read craft-floor. Read ranked issues from
.refine-cloud/reports/round-${n}-checker.json.
Edit ONLY ${TARGET}; any change outside that file is prohibited in this
initial cloud executor. Preserve all expense logic, data flows and interactions.
Resolve P0 then P1 then P2; apply typed Impeccable commands, polish last.
Do not mutate .github, scripts, .claude, config, themes or test files.
Run the configured TypeScript, ESLint, UI-contract, unit and build commands.
The runner independently checks all of them plus expense Playwright tests.
If checks cannot pass, revert changes to ${TARGET} and report blocker.
DO NOT push, merge, deploy, create a PR or change Git branches.
Explain your changes and unresolved defects in a concise final message.`;
      break;
    case 'finish':
      body = `Fresh FINISH reviewer. Read ${SKILL}/references/finish-reviewer-brief.md.
Compare all real round-0/final images and code, then read the three merged
checker reports and the runner ledger. Grade each claimed fix fixed/partial/
not-fixed with explicit evidence. Name up to three possible regressions.
Verify reports don't imply actual backend posting or untested workflows.
No edits. No rubric fallback or invented scores.`;
      break;
    default: fail('Unknown role '+role);
  }
  const p = path.join(PROMPTS, `round-${n}-${role}.md`);
  save(p, `${common}\n\n${body}\n\nReturn the requested structured response faithfully.\n`);
  if (schemas[role]) save(path.join(RUN,`${role}-schema.json`),JSON.stringify(schemas[role],null,2));
  console.log(rel(p), '->',rel(saved));
}

function assertReports(n, role) {
  const file = path.join(REPORTS,`round-${n}-${role}.json`);
  const obj = json(file);
  const schema = schemas[role];
  if (!schema) fail('No schema for '+role);
  for (const name of schema.required) if (!(name in obj)) fail(`${role} round ${n}: missing ${name}`);
  if (role === 'detector' && obj.detectorRan !== true) fail('Impeccable detector did not run; no degraded PR permitted');
  if (role === 'design' || role === 'detector') {
    const dims = Object.values(obj.dims);
    if (dims.length !== 5 || dims.some(v => typeof v !== 'number' || v < 0 || v > 4))
      fail(`${role} scoring dimension out of bounds`);
    const key = role === 'design' ? 'designTotal' : 'auditTotal';
    const sum = dims.reduce((a,b)=>a+b,0);
    if (Math.abs(sum-obj[key])>0.001) fail('Score mismatch in '+file);
  }
  if (obj.problems && (!Array.isArray(obj.problems) || obj.problems.length>8)) fail('Too many problems in '+file);
  if (role === 'checker') {
    assertReports(n,'design'); assertReports(n,'detector');
    const d=json(path.join(REPORTS,`round-${n}-design.json`));
    const a=json(path.join(REPORTS,`round-${n}-detector.json`));
    save(path.join(REPORTS,`round-${n}-score.json`),JSON.stringify({
      round:n, score:d.designTotal+a.auditTotal,design:d.designTotal,audit:a.auditTotal,
      assessment:obj.vsBefore, problems:obj.problems
    },null,2));
  }
  console.log(`Validated ${role} ${n} report`);
}

function check(label) {
  for (const [name, bin, args] of CHECKS) {
    console.log(`--- ${label}: ${name} ---`);
    exec(bin,args,{env:{...process.env,CI:'1'}});
  }
  save(path.join(REPORTS,`checks-${label}.txt`),
    CHECKS.map(([name,bin,args])=>`PASS ${name}: ${bin} ${args.join(' ')}`).join('\n')+'\n');
}
function after(n) {
  const protectedPaths = execFileSync('git',['diff','--name-only'],{encoding:'utf8'}).trim().split('\n').filter(Boolean);
  if(protectedPaths.some(p=>p!==TARGET)) fail('Out-of-scope tracked changes: '+protectedPaths.join(', '));
  // Fail closed on regression. No screenshot or draft PR is published from a broken round.
  check(`round-${n}`);
  exec('node',[`${SKILL}/scripts/shoot.mjs`,'--base','http://127.0.0.1:4308','--route',ROUTE,'--out',rel(SHOTS),'--label',`round-${n}`,'--compare','round-0']);
  exec('node',['scripts/expense-refine-matrix.cjs',`round-${n}`]);
  if (protectedPaths.length) {
    exec('git',['add','--',TARGET]);
    exec('git',['-c','user.name=HisabIQ UI Refine','-c','user.email=actions@users.noreply.github.com','commit','-m',`💄 [ui] expenses: Impeccable round ${n}`]);
  }
  save(path.join(REPORTS,`round-${n}-status.txt`),protectedPaths.length?'committed\n':'unchanged\n');
}

function finalize() {
  for(let n=1;n<=4;n++) assertReports(n,'checker');
  assertReports(4,'finish');
  const scores = [1,2,3,4].map(n=>json(path.join(REPORTS,`round-${n}-score.json`)));
  for(let n=1;n<=3;n++) if(!fs.existsSync(path.join(REPORTS,`checks-round-${n}.txt`))) fail('Round missing regression checks');
  const grades=json(path.join(REPORTS,'round-4-finish.json'));
  const series=scores.map(s=>`C${s.round} ${s.score}/40 (${s.assessment})`).join(' → ');
  const history=scores.map(s=>`| C${s.round} | ${s.design}/20 | ${s.audit}/20 | ${s.score}/40 | ${s.assessment} | ${s.problems.length} |`).join('\n');
  const lines = [
    '# Expenses UI refine: verified cloud run',
    '',
    'Target: `/#/app/expenses`. Fixed scope: `src/pages/Expenses.tsx`.',
    'Independent Impeccable roles ran in separate fresh Codex invocations (sequential, not parallel).',
    'This is a GitHub Actions adaptation of the installed skill, not execution of the upstream Workflow JS.',
    'Only UI-preview functionality; backend, accounting and persistence unchanged.',
    '',
    '### Visual review', series,'',
    '| Check | Design | Audit | Total | vs baseline | Findings |',
    '|---|---:|---:|---:|---|---:|',history,'',
    '### Finish grades',
    ...grades.grades.map(g=>`- ${g.grade}: ${g.id} — ${g.evidence}`),
    '','### Possible regressions',
    ...(grades.regressions.length?grades.regressions.map(r=>`- ${r}`):['- None reported by finish reviewer (manual review still required).']),
    '','### Validation',
    ...CHECKS.map(([name])=>`- PASS (all three rounds): ${name}`),
    '- Light/dark screenshots: 1440px, 390px (every round); 320px, 768px and 1024px (baseline and final).',
    '',
    '### Restrictions','- Draft only. No backend, deploy, direct main push or merge.',
    '- Human visual review and owner approval required. AI review scores are subjective.',
    '',
  ];
  save(path.join(REPORTS,'pr-body.md'),lines.join('\n'));
  console.log(series);
}

switch(command) {
  case 'setup': ensureSetup(); break;
  case 'prompt': prompt(process.argv[4],round); break;
  case 'assert': assertReports(round,process.argv[4]); break;
  case 'check': check(process.argv[3] || 'baseline'); break;
  case 'after': after(round); break;
  case 'finalize': finalize(); break;
  default: fail('Usage: setup | prompt ROUND ROLE | assert ROUND ROLE | check LABEL | after ROUND | finalize');
}
