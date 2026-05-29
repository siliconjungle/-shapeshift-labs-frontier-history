import fs from 'node:fs';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';
import {
  compileHistoryTimeline,
  createHistoryProof,
  createHistoryProvenanceGraph,
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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageDir = path.resolve(__dirname, '..');
const repoRoot = path.basename(path.dirname(packageDir)) === 'packages'
  ? path.resolve(packageDir, '..', '..')
  : packageDir;
const args = parseArgs(process.argv.slice(2));
const recordCount = readPositiveInt(args.records, 1000);
const rounds = readPositiveInt(args.rounds, 30);
const outPath = args.out ? path.resolve(repoRoot, args.out) : null;

const input = makeTimelineInput(recordCount);
let timeline = createHistoryTimeline(input);
let compiled = compileHistoryTimeline(timeline);
let explanation = explainFieldChange(compiled, { path: '/entities/feature-1/1/value', at: 10_000, includeRelated: true });
let undo = planHistoryUndo(compiled, { scope: 'path', target: '/entities/feature-1/1/value', at: 10_000 });
let window = createHistoryWindow(compiled, { paths: ['/entities/feature-1/1/value'] });
let jsonl = encodeHistoryJsonl([timeline, explanation, undo]);
let cursor = 0;

const rows = [
  measure('create-timeline-' + recordCount, 8, () => {
    timeline = createHistoryTimeline(input);
    return timeline.records.length;
  }),
  measure('compile-timeline-' + recordCount, 8, () => {
    compiled = compileHistoryTimeline(timeline);
    return compiled.recordsById.size;
  }),
  measure('validate-timeline-' + recordCount, 16, () => validateHistoryTimeline(timeline).issues.length),
  measure('query-path', 64, () => queryHistoryTimeline(compiled, { paths: ['/entities/feature-' + (cursor++ % 16) + '/' + (cursor % 64) + '/value'] }).ids.length),
  measure('query-action', 64, () => queryHistoryTimeline(compiled, { actions: ['action.feature-' + (cursor++ % 16) + '.save'] }).ids.length),
  measure('explain-field-change', 32, () => {
    explanation = explainFieldChange(compiled, { path: '/entities/feature-' + (cursor++ % 16) + '/' + (cursor % 64) + '/value', at: 10_000, includeRelated: true });
    return explanation.records.length + explanation.relatedRecords.length;
  }),
  measure('plan-undo', 32, () => {
    undo = planHistoryUndo(compiled, { scope: 'path', target: '/entities/feature-' + (cursor++ % 16) + '/' + (cursor % 64) + '/value', at: 10_000 });
    return undo.inversePatches.length + undo.conflicts.length;
  }),
  measure('history-window', 32, () => {
    window = createHistoryWindow(compiled, { from: 0, to: 10_000, paths: ['/entities/feature-' + (cursor++ % 16) + '/' + (cursor % 64) + '/value'] });
    return window.records.length;
  }),
  measure('registry-graph', 4, () => {
    const graph = createHistoryRegistryGraph(compiled, { package: '@shapeshift-labs/frontier-history' });
    return graph.entries.length + graph.edges.length;
  }),
  measure('provenance-graph', 4, () => {
    const graph = createHistoryProvenanceGraph(compiled);
    return graph.entries.length + graph.edges.length;
  }),
  measure('jsonl-encode', 32, () => {
    jsonl = encodeHistoryJsonl([timeline, explanation, undo]);
    return jsonl.length;
  }),
  measure('jsonl-decode', 32, () => decodeHistoryJsonl(jsonl).length),
  measure('proof', 8, () => createHistoryProof(timeline).hash.length)
];

const report = {
  package: '@shapeshift-labs/frontier-history',
  version: readPackageVersion(),
  generatedAt: new Date().toISOString(),
  node: process.version,
  platform: process.platform + ' ' + process.arch,
  recordCount,
  rounds,
  rows
};

if (outPath) {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2) + '\n');
}

console.log(report.package + ' package benchmark');
console.log('Node ' + report.node + ' on ' + report.platform + ', records=' + recordCount + ', rounds=' + rounds);
console.log('These are Frontier-only package measurements, not competitor comparisons.');
console.log('');
console.log(padRight('Fixture', 28) + padLeft('Median', 12) + padLeft('p95', 12));
for (const row of rows) console.log(padRight(row.fixture, 28) + padLeft(formatUs(row.medianUs), 12) + padLeft(formatUs(row.p95Us), 12));
if (outPath) console.log('\nwrote ' + path.relative(repoRoot, outPath));

function makeTimelineInput(count) {
  const featureCount = 16;
  const records = [];
  let at = 0;
  for (let i = 0; i < count; i++) {
    const feature = i % featureCount;
    const row = i % 64;
    const pathName = '/entities/feature-' + feature + '/' + row + '/value';
    const policyId = 'record:' + i + ':policy';
    const actionId = 'record:' + i + ':action';
    records.push({
      id: policyId,
      kind: 'policy-decision',
      at: at++,
      feature: 'feature-' + feature,
      policy: 'policy.feature-' + feature + '.write',
      policyDecision: 'allow',
      actor: 'user:' + (i % 8),
      paths: [pathName]
    });
    records.push({
      id: actionId,
      kind: 'action',
      at: at++,
      feature: 'feature-' + feature,
      action: 'action.feature-' + feature + '.save',
      actor: 'user:' + (i % 8),
      agent: i % 9 === 0 ? 'agent:assistant' : undefined,
      causeIds: [policyId],
      writes: [pathName],
      patches: [{ op: 'set', path: pathName, value: i, oldValue: i - 1 }],
      traceId: 'trace:' + feature,
      spanId: 'span:' + i,
      metadata: i % 13 === 0 ? { compensationAction: 'feature.rollback' } : undefined
    });
    if (i % 3 === 0) records.push({ id: 'record:' + i + ':effect', kind: 'effect-result', at: at++, feature: 'feature-' + feature, effect: 'effect.feature-' + feature + '.sync', causeIds: [actionId], writes: ['/sync/feature-' + feature + '/' + row], parentSpanId: 'span:' + i });
    if (i % 5 === 0) records.push({ id: 'record:' + i + ':test', kind: 'test-run', at: at++, feature: 'feature-' + feature, test: 'spec.feature-' + feature + '.' + row, proof: 'proof:' + i, causeIds: [actionId], paths: [pathName] });
  }
  return { id: 'bench.history', records, metadata: { token: 'bench-secret' } };
}

function measure(fixture, batchSize, fn) {
  const values = [];
  let sink = 0;
  for (let round = 0; round < rounds; round++) {
    const started = performance.now();
    for (let i = 0; i < batchSize; i++) sink += fn();
    values[values.length] = ((performance.now() - started) * 1000) / batchSize;
  }
  if (sink === -1) console.log('sink=' + sink);
  values.sort((left, right) => left - right);
  return { fixture, medianUs: percentile(values, 0.5), p95Us: percentile(values, 0.95) };
}

function percentile(values, p) {
  return values[Math.min(values.length - 1, Math.floor((values.length - 1) * p))] ?? 0;
}

function formatUs(value) {
  if (value >= 1000) return (value / 1000).toFixed(2) + ' ms';
  return value.toFixed(2) + ' us';
}

function padRight(value, width) {
  return String(value).padEnd(width, ' ');
}

function padLeft(value, width) {
  return String(value).padStart(width, ' ');
}

function readPackageVersion() {
  return JSON.parse(fs.readFileSync(path.join(packageDir, 'package.json'), 'utf8')).version;
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--records') out.records = argv[++i];
    else if (arg === '--rounds') out.rounds = argv[++i];
    else if (arg === '--out') out.out = argv[++i];
    else if (arg === '--help' || arg === '-h') {
      console.log('Usage: npm run bench -- [--records 1000] [--rounds 30] [--out benchmarks/results/frontier-history-package-bench-latest.json]');
      process.exit(0);
    }
  }
  return out;
}

function readPositiveInt(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}
