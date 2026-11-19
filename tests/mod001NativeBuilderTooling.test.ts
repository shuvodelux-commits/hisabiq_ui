import assert from 'node:assert/strict';
import { readFileSync, readlinkSync, lstatSync, realpathSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync, spawnSync } from 'node:child_process';
import test from 'node:test';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = (path: string) => readFileSync(resolve(root, path), 'utf8');
const allowedHelpers = [
  'super-board-github-read.py',
  'super-board-skills-ready.py',
  'super-board-gh-guard.sh',
  'super-board-card.sh',
  'super-board-pr-body.sh',
  'super-board-merge-gate.sh',
  'super-board-verification-ready.py',
] as const;

test('MOD-001 Codex builder has a local skill without a legacy Claude dispatcher', () => {
  const skill = source('.claude/skills/super-build/SKILL.md');
  assert.match(skill, /gpt-6\.1-sol/);
  assert.match(skill, /model_reasoning_effort=medium/);
  assert.match(skill, /--only 548/);
  assert.match(skill, /--backend-runtime-root/);
  assert.match(skill, /git submodule update --init -- vendor\/super-board/);
  assert.match(skill, /Blocked/);
  assert.doesNotMatch(skill, /claude\s+-p/);
  assert.match(skill, /draft PR/i);
  const alias = resolve(root, '.agents/skills/super-build');
  assert.ok(lstatSync(alias).isSymbolicLink());
  assert.equal(realpathSync(alias), resolve(root, '.claude/skills/super-build'));
});

test('MOD-001 helpers are pinned; absent submodule fails closed, initialized one resolves', () => {
  const tree = execFileSync('git', ['ls-tree', 'HEAD', 'vendor/super-board'], { cwd: root, encoding: 'utf8' });
  assert.match(tree, /^160000 commit d0b7d5a6850614ca809477c1af43d5d7da408726\s+vendor\/super-board/m);
  const initialized = existsSync(resolve(root, 'vendor/super-board/scripts/super-board-github-read.py'));
  for (const name of allowedHelpers) {
    const path = resolve(root, '.claude/bin', name);
    assert.ok(lstatSync(path).isSymbolicLink(), name);
    assert.equal(readlinkSync(path), `../../vendor/super-board/scripts/${name}`);
    if (initialized) {
      assert.equal(realpathSync(path), resolve(root, 'vendor/super-board/scripts', name), name);
    } else {
      assert.equal(existsSync(path), false, 'uninitialized helper must never appear ready');
    }
  }
  const skillLink = resolve(root, '.claude/skills/super-board');
  assert.equal(readlinkSync(skillLink), '../../vendor/super-board/skills/super-board');
  if (initialized) {
    assert.equal(realpathSync(skillLink), resolve(root, 'vendor/super-board/skills/super-board'));
  } else {
    assert.equal(existsSync(skillLink), false);
  }
});

test('MOD-001 frontend board is single-worker and human-merge-only', () => {
  const config = JSON.parse(source('.claude/super-board/configs/hisabiq-ui-mod001.json'));
  assert.deepEqual(config.project, { owner: 'shuvodelux-commits', title: 'HisabIQ Nest Adoption', number: 2 });
  assert.equal(config.repo.remote, 'https://github.com/shuvodelux-commits/hisabiq_ui');
  assert.equal(config.repo.path, '.');
  assert.equal(config.base_branch, 'main');
  assert.equal(config.host, 'codex');
  assert.equal(config.worker_backend, 'workflow');
  assert.equal(config.codex.model, 'gpt-6.1-sol');
  assert.equal(config.max_workers, 1);
  assert.equal(config.human_approves_merge, true);
  assert.equal(config.merge_policy.default, 'human');
  assert.equal(config.merge_policy.allow_auto_on_production, false);
  assert.ok(config.verify_commands.some((cmd: string) => /check:ui-contract/.test(cmd)));
  assert.ok(config.verify_commands.some((cmd: string) => /npm test/.test(cmd)));
  assert.ok(config.verify_commands.some((cmd: string) => /tsc --noEmit/.test(cmd)));
  assert.ok(config.verify_commands.every((cmd: string) => !/\bclaude\b|\bdeploy\b|\bmerge\b/i.test(cmd)));
});

test('MOD-001 accepts only reviewed read-only helper and large-evidence preflight', () => {
  const helper = resolve(root, '.claude/bin/super-board-github-read.py');
  const result = spawnSync('python3', [helper, '--check'], { cwd: root, encoding: 'utf8' });
  if (existsSync(helper)) {
    assert.equal(result.status, 0, result.stderr);
  } else {
    assert.notEqual(result.status, 0, 'uninitialized helper cannot be invoked successfully');
  }
  const preflight = source('.claude/bin/super-board-preflight.sh');
  assert.match(preflight, /--slurpfile mergedDocs/);
  assert.match(preflight, /--rawfile files/);
  assert.match(preflight, /expected one JSON array/);
  assert.doesNotMatch(preflight, /--argjson merged/);
});

test('MOD-001 has explicit fail-closed source/Project/production rules', () => {
  const skill = source('.claude/skills/super-build/SKILL.md');
  assert.match(skill, /57585270eda42f89748bbd01b134a5e1ed805f6b/);
  assert.match(skill, /Project #2/);
  assert.match(skill, /exact.*SHA/is);
  assert.match(skill, /Ready/);
  assert.match(skill, /no (?:auto-)?merge/i);
  assert.match(skill, /VITE_CONNECTED_INVOICE_LOGO_WRITES/);
  assert.match(skill, /backend.*read-only/is);
});
