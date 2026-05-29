import fs from 'node:fs';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';
import {
  compileHistoryTimeline,
  createHistoryTimeline,
  explainFieldChange,
  planHistoryUndo,
  queryHistoryTimeline
} from '../dist/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageDir = path.resolve(__dirname, '..');
const repoRoot = path.basename(path.dirname(packageDir)) === 'packages'
  ? path.resolve(packageDir, '..', '..')
  : packageDir;
const args = parseArgs(process.argv.slice(2));
const records = readPositiveInt(args.records, 1000);
const rounds = readPositiveInt(args.rounds, 30);
const outPath = args.out ? path.resolve(repoRoot, args.out) : null;

const eventRows = makeEvents(records);
const timeline = createHistoryTimeline({ id: 'competitor.history', records: eventRows });
const compiled = compileHistoryTimeline(timeline);
const auditRows = eventRows.map((record) => ({ id: record.id, at: record.at, action: record.action, path: record.paths?.[0] ?? record.writes?.[0], actor: record.actor }));
const spanRows = eventRows.map((record) => ({ traceId: record.traceId, spanId: record.spanId, parentSpanId: record.parentSpanId, attributes: { action: record.action, path: record.paths?.[0] } }));
const provRows = eventRows.map((record) => ({ entity: record.paths?.[0], activity: record.action ?? record.effect ?? record.policy, agent: record.actor ?? record.agent }));
let cursor = 0;

const rows = [
  measure('frontier-history:query-path', 64, () => queryHistoryTimeline(compiled, { paths: ['/entities/feature-' + (cursor++ % 16) + '/' + (cursor % 64) + '/value'] }).ids.length),
  measure('frontier-history:explain', 32, () => explainFieldChange(compiled, { path: '/entities/feature-' + (cursor++ % 16) + '/' + (cursor % 64) + '/value', at: 10_000 }).records.length),
  measure('frontier-history:undo-plan', 32, () => planHistoryUndo(compiled, { scope: 'path', target: '/entities/feature-' + (cursor++ % 16) + '/' + (cursor % 64) + '/value', at: 10_000 }).inversePatches.length),
  measure('plain-audit:scan-path', 32, () => plainScan(auditRows, '/entities/feature-' + (cursor++ % 16) + '/' + (cursor % 64) + '/value')),
  measure('otel-span:shape-filter', 32, () => spanFilter(spanRows, 'trace:' + (cursor++ % 16))),
  measure('prov-shape:activity-filter', 32, () => provFilter(provRows, 'action.feature-' + (cursor++ % 16) + '.save')),
  measure('event-sourcing:latest-by-path', 32, () => latestByPath(eventRows, '/entities/feature-' + (cursor++ % 16) + '/' + (cursor % 64) + '/value'))
];

const report = {
  package: '@shapeshift-labs/frontier-history',
  type: 'competitor-control',
  generatedAt: new Date().toISOString(),
  node: process.version,
  platform: process.platform + ' ' + process.arch,
  records,
  rounds,
  notes: [
    'OpenTelemetry span, W3C PROV, and plain audit rows are representative object-shape controls.',
    'Frontier rows include path indexes, causal links, undo planning, and cross-surface explanation fields.'
  ],
  rows
};

if (outPath) {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2) + '\n');
}

console.log('frontier-history competitor/control benchmark');
console.log('Node ' + report.node + ' on ' + report.platform + ', records=' + records + ', rounds=' + rounds);
console.log('Fixture'.padEnd(36) + 'Median'.padStart(12) + 'p95'.padStart(12));
for (const row of rows) console.log(row.fixture.padEnd(36) + formatUs(row.medianUs).padStart(12) + formatUs(row.p95Us).padStart(12));
if (outPath) console.log('\nwrote ' + path.relative(repoRoot, outPath));

function makeEvents(count) {
  const out = [];
  let at = 0;
  for (let i = 0; i < count; i++) {
    const feature = i % 16;
    const row = i % 64;
    const pathName = '/entities/feature-' + feature + '/' + row + '/value';
    const actionId = 'event:' + i + ':action';
    out.push({ id: 'event:' + i + ':policy', kind: 'policy-decision', at: at++, policy: 'policy.feature-' + feature + '.write', policyDecision: 'allow', actor: 'user:' + (i % 8), paths: [pathName] });
    out.push({ id: actionId, kind: 'action', at: at++, action: 'action.feature-' + feature + '.save', actor: 'user:' + (i % 8), paths: [pathName], writes: [pathName], patches: [{ op: 'set', path: pathName, value: i, oldValue: i - 1 }], traceId: 'trace:' + feature, spanId: 'span:' + i });
    if (i % 3 === 0) out.push({ id: 'event:' + i + ':effect', kind: 'effect-result', at: at++, effect: 'effect.feature-' + feature + '.sync', causeIds: [actionId], parentSpanId: 'span:' + i, writes: ['/sync/feature-' + feature + '/' + row] });
  }
  return out;
}

function plainScan(rows, pathName) {
  let count = 0;
  for (const row of rows) if (row.path === pathName || pathName.startsWith(row.path + '/')) count++;
  return count;
}

function spanFilter(rows, traceId) {
  let count = 0;
  for (const row of rows) if (row.traceId === traceId) count++;
  return count;
}

function provFilter(rows, activity) {
  let count = 0;
  for (const row of rows) if (row.activity === activity) count++;
  return count;
}

function latestByPath(rows, pathName) {
  let latest = 0;
  for (const row of rows) {
    const touched = (row.paths ?? []).includes(pathName) || (row.writes ?? []).includes(pathName);
    if (touched && row.at > latest) latest = row.at;
  }
  return latest;
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

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--records') out.records = argv[++i];
    else if (argv[i] === '--rounds') out.rounds = argv[++i];
    else if (argv[i] === '--out') out.out = argv[++i];
  }
  return out;
}

function readPositiveInt(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}
