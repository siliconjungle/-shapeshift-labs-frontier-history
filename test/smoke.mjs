import assert from 'node:assert';
import {
  compileHistoryTimeline,
  createHistoryMergeGraph,
  createHistoryProof,
  createHistoryProvenanceGraph,
  createHistoryRegistryGraph,
  createHistoryTimeline,
  createHistoryWindow,
  defineHistoryRecord,
  diffHistoryWindows,
  decodeHistoryJsonl,
  encodeHistoryJsonl,
  explainFieldChange,
  planHistoryUndo,
  queryHistoryTimeline,
  redactHistoryValue,
  validateHistoryTimeline
} from '../dist/index.js';

const timeline = createHistoryTimeline({
  id: 'app.history',
  package: '@app/web',
  feature: 'todos',
  owner: '@team/app',
  generatedAt: 1,
  metadata: { apiKey: 'secret' },
  records: [
    {
      id: 'action:todos.complete',
      kind: 'action',
      at: 10,
      action: 'action.todos.complete',
      actor: 'user:u1',
      agent: 'agent:assistant',
      route: 'route:/todos',
      paths: ['/entities/todos/t1'],
      writes: ['/entities/todos/t1/done'],
      patches: [{ op: 'set', path: '/entities/todos/t1/done', value: true, oldValue: false }],
      traceId: 'trace:1',
      spanId: 'span:action',
      metadata: { compensationAction: 'todos.reopen' }
    },
    {
      id: 'policy:todo.write',
      kind: 'policy-decision',
      at: 9,
      policy: 'policy.todo.write',
      policyDecision: 'allow',
      actor: 'user:u1',
      paths: ['/entities/todos/t1/done'],
      links: [{ type: 'allowed', targetId: 'action:todos.complete' }]
    },
    {
      id: 'effect:todos.sync',
      kind: 'effect-result',
      at: 11,
      effect: 'effect.todos.sync',
      causeIds: ['action:todos.complete'],
      writes: ['/sync/todos/t1'],
      resources: ['fetch:/api/todos/t1'],
      traceId: 'trace:1',
      parentSpanId: 'span:action'
    },
    {
      id: 'workflow:onboarding.step',
      kind: 'workflow-step',
      at: 8,
      workflow: 'workflow.onboarding',
      step: 'complete-first-todo',
      paths: ['/entities/todos/t1'],
      causeIds: ['policy:todo.write']
    },
    {
      id: 'test:todos.complete',
      kind: 'test-run',
      at: 12,
      test: 'spec.todos.complete',
      proof: 'proof:todos.complete',
      causeIds: ['action:todos.complete'],
      paths: ['/entities/todos/t1/done'],
      artifacts: ['reports/todos-complete.json']
    }
  ]
});

assert.strictEqual(defineHistoryRecord({ id: 'record:empty' }).recordKind, 'patch');
const moved = defineHistoryRecord({ id: 'record:move', patches: [{ op: 'move', path: 'after/value', from: 'before/value' }] });
assert.strictEqual(moved.patches[0].from, '/before/value');
assert.ok(moved.paths.includes('/before/value'));
assert.strictEqual(timeline.summary.recordCount, 5);
assert.strictEqual(timeline.summary.actionCount, 1);
assert.strictEqual(validateHistoryTimeline(timeline).valid, true);

const invalid = validateHistoryTimeline({ records: [{ id: 'r1' }, { id: 'r1' }] });
assert.strictEqual(invalid.valid, false);

const compiled = compileHistoryTimeline(timeline);
assert.strictEqual(compiled.get('action:todos.complete').action, 'action.todos.complete');
assert.deepStrictEqual(queryHistoryTimeline(compiled, { actions: ['action.todos.complete'] }).ids, ['action:todos.complete']);
assert.ok(queryHistoryTimeline(compiled, { paths: ['/entities/todos/t1/done'] }).ids.includes('policy:todo.write'));

const explanation = explainFieldChange(compiled, { path: '/entities/todos/t1/done', at: 12, includeRelated: true });
assert.strictEqual(explanation.confidence, 'direct');
assert.ok(explanation.actions.includes('action.todos.complete'));
assert.ok(explanation.policies.includes('policy.todo.write'));
assert.ok(explanation.effects.includes('effect.todos.sync'));
assert.ok(explanation.tests.includes('spec.todos.complete'));

const undo = planHistoryUndo(compiled, { scope: 'path', target: '/entities/todos/t1/done', at: 12 });
assert.strictEqual(undo.inversePatches[0].value, false);
assert.ok(undo.compensationActions.includes('todos.reopen'));
assert.strictEqual(undo.requiresReview, false);

const windowA = createHistoryWindow(compiled, { to: 10 });
const windowB = createHistoryWindow(compiled, { to: 12 });
const windowDiff = diffHistoryWindows(windowA, windowB);
assert.ok(windowDiff.added.includes('effect:todos.sync'));

const graph = createHistoryRegistryGraph(timeline, { generatedAt: 2 });
assert.ok(graph.entries.some((entry) => entry.id === 'history-record:action:todos.complete'));
assert.ok(graph.edges.some((edge) => edge.kind === 'caused-by-action' && edge.to.endsWith('action.todos.complete')));
const prov = createHistoryProvenanceGraph(timeline);
assert.ok(prov.edges.some((edge) => edge.kind === 'wasGeneratedBy'));

const mergeTimeline = createHistoryTimeline({
  id: 'agent.history',
  package: '@shapeshift-labs/frontier-history',
  feature: 'semantic-merge',
  generatedAt: 20,
  records: [
    {
      id: 'base:coordinator',
      kind: 'agent-run',
      at: 1,
      agent: 'agent:coordinator',
      paths: ['/packages/frontier-history'],
      metadata: { lane: 'coordinator', scope: 'history' }
    },
    {
      id: 'worker:a',
      kind: 'agent-run',
      at: 2,
      parentIds: ['base:coordinator'],
      agent: 'agent:a',
      paths: ['/packages/frontier-history/src/index.ts'],
      metadata: { lane: 'history-semantic', scope: 'types' }
    },
    {
      id: 'worker:b',
      kind: 'agent-run',
      at: 3,
      parentIds: ['base:coordinator'],
      agent: 'agent:b',
      paths: ['/packages/frontier-history/test/smoke.mjs'],
      metadata: { lane: 'history-semantic', scope: 'tests' }
    },
    {
      id: 'worker:c',
      kind: 'agent-run',
      at: 4,
      parentIds: ['base:coordinator'],
      agent: 'agent:c',
      paths: ['/packages/frontier-history/README.md'],
      metadata: { lane: 'history-semantic', scope: 'docs' }
    },
    {
      id: 'merge:octopus',
      kind: 'agent-run',
      title: 'Octopus merge',
      at: 5,
      parentIds: ['worker:c', 'worker:a', 'worker:b'],
      agent: 'agent:coordinator',
      paths: ['/packages/frontier-history'],
      metadata: { lane: 'coordinator', scope: 'history-semantic' }
    }
  ]
});
const mergeGraph = createHistoryMergeGraph(mergeTimeline);
const octopus = mergeGraph.nodes.find((node) => node.id === 'merge:octopus');
assert.ok(octopus);
assert.deepStrictEqual(octopus.parentIds, ['worker:a', 'worker:b', 'worker:c']);
assert.strictEqual(octopus.lane, 'coordinator');
assert.strictEqual(octopus.scope, 'history-semantic');
assert.strictEqual(octopus.event.title, 'Octopus merge');
assert.strictEqual(mergeGraph.parentLinks.filter((link) => link.childId === 'merge:octopus').length, 3);
assert.deepStrictEqual(mergeGraph.parentLinks.filter((link) => link.childId === 'merge:octopus').map((link) => link.parentId), ['worker:a', 'worker:b', 'worker:c']);
assert.strictEqual(mergeGraph.summary.mergeNodeCount, 1);
assert.strictEqual(mergeGraph.summary.parentLinkCount, 6);

const directMergeGraph = createHistoryMergeGraph({
  id: 'direct.merge',
  lane: 'agent',
  scope: 'package',
  nodes: [
    { id: 'n1', label: 'Root event', event: { status: 'ok', tags: ['root'] } },
    { id: 'n2', parentIds: ['n1'], event: { title: 'Child event', actor: 'agent:worker' } }
  ]
});
assert.strictEqual(directMergeGraph.nodes[1].lane, 'agent');
assert.strictEqual(directMergeGraph.nodes[1].scope, 'package');
assert.strictEqual(directMergeGraph.parentLinks[0].id, 'history-merge-parent:n1->n2');

const jsonl = encodeHistoryJsonl([timeline, explanation, undo]);
assert.strictEqual(decodeHistoryJsonl(jsonl).length, 3);
assert.strictEqual(JSON.stringify(redactHistoryValue(timeline)).includes('secret'), false);
assert.notStrictEqual(createHistoryProof(timeline, { generatedAt: 3 }).hash.length, 0);
assert.notStrictEqual(createHistoryProof(explanation, { generatedAt: 3 }).hash.length, 0);
