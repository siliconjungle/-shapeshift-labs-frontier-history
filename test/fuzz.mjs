import assert from 'node:assert';
import {
  compileHistoryTimeline,
  createHistoryProof,
  createHistoryRegistryGraph,
  createHistoryTimeline,
  createHistoryWindow,
  decodeHistoryJsonl,
  encodeHistoryJsonl,
  explainFieldChange,
  planHistoryUndo,
  queryHistoryTimeline,
  validateHistoryTimeline
} from '../dist/index.js';

const args = parseArgs(process.argv.slice(2));
const cases = readPositiveInt(args.cases, 500);
let seed = readPositiveInt(args.seed, 0x51570a1);
let checked = 0;

for (let i = 0; i < cases; i++) {
  const input = makeTimelineInput(i);
  const timeline = createHistoryTimeline(input);
  const compiled = compileHistoryTimeline(timeline);
  const validation = validateHistoryTimeline(timeline);
  assert.strictEqual(compiled.validation.valid, validation.valid);
  assert.strictEqual(compiled.timeline.records.length, timeline.records.length);

  const feature = 'feature-' + nextInt(input.featureCount);
  const featureRecords = queryHistoryTimeline(compiled, { features: [feature] }).records;
  assert.ok(featureRecords.every((record) => record.feature === feature));

  const path = '/entities/feature-' + nextInt(input.featureCount) + '/' + nextInt(input.recordsPerFeature) + '/value';
  const pathRecords = queryHistoryTimeline(compiled, { paths: [path] }).records;
  assert.ok(pathRecords.every((record) => record.paths.some((candidate) => candidate === path || path.startsWith(candidate + '/') || candidate.startsWith(path + '/'))));

  const action = 'action.feature-' + nextInt(input.featureCount) + '.save';
  const actionRecords = queryHistoryTimeline(compiled, { actions: [action] }).records;
  assert.ok(actionRecords.every((record) => record.action === action));

  const explanation = explainFieldChange(compiled, { path, at: 10_000, includeRelated: true });
  assert.ok(Array.isArray(explanation.records));
  assert.ok(['direct', 'inferred', 'partial', 'unknown'].includes(explanation.confidence));

  const undo = planHistoryUndo(compiled, { scope: 'path', target: path, at: 10_000 });
  assert.ok(undo.affectedPaths.every((affected) => affected.startsWith('/')));

  const window = createHistoryWindow(compiled, { from: 0, to: 10_000, paths: [path] });
  assert.ok(window.summary.recordCount <= timeline.summary.recordCount);
  assert.ok(createHistoryRegistryGraph(compiled).entries.length >= timeline.records.length);
  assert.strictEqual(decodeHistoryJsonl(encodeHistoryJsonl([timeline, explanation, undo])).length, 3);
  assert.notStrictEqual(createHistoryProof(timeline).hash.length, 0);
  checked++;
}

console.log('frontier-history fuzz ok: ' + checked + ' cases');

function makeTimelineInput(index) {
  const featureCount = 2 + nextInt(6);
  const recordsPerFeature = 4 + nextInt(10);
  const records = [];
  let at = index * 1000;
  for (let feature = 0; feature < featureCount; feature++) {
    for (let j = 0; j < recordsPerFeature; j++) {
      const path = '/entities/feature-' + feature + '/' + j + '/value';
      const actionId = 'record:feature-' + feature + '.' + j + '.action';
      const policyId = 'record:feature-' + feature + '.' + j + '.policy';
      records.push({
        id: policyId,
        kind: 'policy-decision',
        at: at++,
        feature: 'feature-' + feature,
        policy: 'policy.feature-' + feature + '.write',
        policyDecision: j % 11 === 0 ? 'deny' : 'allow',
        actor: 'user:' + (j % 3),
        paths: [path]
      });
      records.push({
        id: actionId,
        kind: 'action',
        at: at++,
        feature: 'feature-' + feature,
        action: 'action.feature-' + feature + '.save',
        actor: 'user:' + (j % 3),
        agent: j % 5 === 0 ? 'agent:assistant' : undefined,
        causeIds: [policyId],
        writes: [path],
        patches: [{ op: 'set', path, value: j, oldValue: j - 1 }],
        traceId: 'trace:' + feature,
        spanId: 'span:' + feature + ':' + j,
        metadata: j % 7 === 0 ? { compensationAction: 'feature.rollback' } : undefined
      });
      if (j % 3 === 0) {
        records.push({
          id: 'record:feature-' + feature + '.' + j + '.effect',
          kind: 'effect-result',
          at: at++,
          feature: 'feature-' + feature,
          effect: 'effect.feature-' + feature + '.sync',
          causeIds: [actionId],
          writes: ['/sync/feature-' + feature + '/' + j],
          resources: ['fetch:/api/feature-' + feature],
          parentSpanId: 'span:' + feature + ':' + j
        });
      }
      if (j % 4 === 0) {
        records.push({
          id: 'record:feature-' + feature + '.' + j + '.test',
          kind: 'test-run',
          at: at++,
          feature: 'feature-' + feature,
          test: 'spec.feature-' + feature + '.' + j,
          proof: 'proof:' + feature + ':' + j,
          causeIds: [actionId],
          paths: [path]
        });
      }
    }
  }
  return { id: 'history-' + index, featureCount, recordsPerFeature, records };
}

function nextInt(max) {
  return next() % max;
}

function next() {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed;
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--cases') out.cases = argv[++i];
    else if (argv[i] === '--seed') out.seed = argv[++i];
  }
  return out;
}

function readPositiveInt(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}
