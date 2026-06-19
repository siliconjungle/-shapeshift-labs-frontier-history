import type { JsonObject, JsonValue } from '@shapeshift-labs/frontier';
import { cloneJson } from '@shapeshift-labs/frontier/clone';
import {
  createFrontierRegistryGraph,
  type FrontierRegistryEdge,
  type FrontierRegistryEntry,
  type FrontierRegistryGraph,
  type FrontierRegistrySource
} from '@shapeshift-labs/frontier/registry';

export const FRONTIER_HISTORY_TIMELINE_KIND = 'frontier.history.timeline';
export const FRONTIER_HISTORY_TIMELINE_VERSION = 1;
export const FRONTIER_HISTORY_RECORD_KIND = 'frontier.history.record';
export const FRONTIER_HISTORY_RECORD_VERSION = 1;
export const FRONTIER_HISTORY_EXPLANATION_KIND = 'frontier.history.explanation';
export const FRONTIER_HISTORY_EXPLANATION_VERSION = 1;
export const FRONTIER_HISTORY_UNDO_PLAN_KIND = 'frontier.history.undo-plan';
export const FRONTIER_HISTORY_UNDO_PLAN_VERSION = 1;
export const FRONTIER_HISTORY_PROOF_KIND = 'frontier.history.proof';
export const FRONTIER_HISTORY_PROOF_VERSION = 1;
export const FRONTIER_HISTORY_MERGE_GRAPH_KIND = 'frontier.history.merge-graph';
export const FRONTIER_HISTORY_MERGE_GRAPH_VERSION = 1;

export type FrontierHistoryRecordKind =
  | 'patch'
  | 'action'
  | 'mutation'
  | 'workflow-step'
  | 'policy-decision'
  | 'effect-result'
  | 'trace-span'
  | 'agent-run'
  | 'test-run'
  | 'crdt-version'
  | 'event-log-entry'
  | 'undo-scope'
  | 'migration'
  | 'sync'
  | string;

export type FrontierHistoryRecordStatus =
  | 'ok'
  | 'failed'
  | 'blocked'
  | 'denied'
  | 'pending'
  | 'compensated'
  | 'unknown'
  | string;

export type FrontierHistoryExplanationConfidence = 'direct' | 'inferred' | 'partial' | 'unknown';

export interface FrontierHistoryPatchInput {
  op?: string;
  path: string;
  from?: string;
  value?: unknown;
  oldValue?: unknown;
  inverse?: readonly FrontierHistoryPatchInput[];
  metadata?: unknown;
}

export interface FrontierHistoryPatch {
  op: string;
  path: string;
  from?: string;
  value?: JsonValue;
  oldValue?: JsonValue;
  inverse: FrontierHistoryPatch[];
  metadata?: JsonObject;
}

export interface FrontierHistoryLinkInput {
  type: string;
  targetId: string;
  reason?: string;
  metadata?: unknown;
}

export interface FrontierHistoryLink {
  type: string;
  targetId: string;
  reason?: string;
  metadata?: JsonObject;
}

export interface FrontierHistoryRecordInput {
  id: string;
  kind?: FrontierHistoryRecordKind;
  title?: string;
  description?: string;
  at?: number;
  sequence?: number;
  logicalTime?: string | number;
  status?: FrontierHistoryRecordStatus;
  action?: string;
  tool?: string;
  workflow?: string;
  step?: string;
  policy?: string;
  policyDecision?: string;
  effect?: string;
  route?: string;
  view?: string;
  traceId?: string;
  spanId?: string;
  parentSpanId?: string;
  actor?: string;
  agent?: string;
  subject?: string;
  user?: string;
  test?: string;
  replay?: string;
  proof?: string;
  requestId?: string;
  commandId?: string;
  transactionId?: string;
  version?: string;
  branch?: string;
  undoScope?: string;
  paths?: readonly string[];
  reads?: readonly string[];
  writes?: readonly string[];
  patches?: readonly FrontierHistoryPatchInput[];
  resources?: readonly string[];
  artifacts?: readonly string[];
  causeIds?: readonly string[];
  parentIds?: readonly string[];
  links?: readonly FrontierHistoryLinkInput[];
  tags?: readonly string[];
  owner?: string;
  package?: string;
  feature?: string;
  source?: string | FrontierRegistrySource;
  metadata?: unknown;
}

export interface FrontierHistoryRecord {
  kind: typeof FRONTIER_HISTORY_RECORD_KIND;
  version: typeof FRONTIER_HISTORY_RECORD_VERSION;
  id: string;
  recordKind: FrontierHistoryRecordKind;
  title: string;
  description?: string;
  at: number;
  sequence: number;
  logicalTime?: string | number;
  status: FrontierHistoryRecordStatus;
  action?: string;
  tool?: string;
  workflow?: string;
  step?: string;
  policy?: string;
  policyDecision?: string;
  effect?: string;
  route?: string;
  view?: string;
  traceId?: string;
  spanId?: string;
  parentSpanId?: string;
  actor?: string;
  agent?: string;
  subject?: string;
  user?: string;
  test?: string;
  replay?: string;
  proof?: string;
  requestId?: string;
  commandId?: string;
  transactionId?: string;
  versionId?: string;
  branch?: string;
  undoScope?: string;
  paths: string[];
  reads: string[];
  writes: string[];
  patches: FrontierHistoryPatch[];
  resources: string[];
  artifacts: string[];
  causeIds: string[];
  parentIds: string[];
  links: FrontierHistoryLink[];
  tags: string[];
  owner?: string;
  package?: string;
  feature?: string;
  source?: FrontierRegistrySource;
  metadata?: JsonObject;
}

export interface FrontierHistoryTimelineInput {
  id?: string;
  title?: string;
  description?: string;
  records?: readonly FrontierHistoryRecordInput[];
  package?: string;
  feature?: string;
  owner?: string;
  generatedAt?: number;
  source?: FrontierRegistrySource;
  tags?: readonly string[];
  metadata?: unknown;
}

export interface FrontierHistorySummary {
  recordCount: number;
  pathCount: number;
  actionCount: number;
  workflowCount: number;
  policyCount: number;
  effectCount: number;
  traceCount: number;
  actorCount: number;
  agentCount: number;
  testCount: number;
  undoableRecordCount: number;
  firstAt?: number;
  lastAt?: number;
}

export interface FrontierHistoryTimeline {
  kind: typeof FRONTIER_HISTORY_TIMELINE_KIND;
  version: typeof FRONTIER_HISTORY_TIMELINE_VERSION;
  id: string;
  title?: string;
  description?: string;
  records: FrontierHistoryRecord[];
  package?: string;
  feature?: string;
  owner?: string;
  generatedAt?: number;
  source?: FrontierRegistrySource;
  tags: string[];
  metadata?: JsonObject;
  summary: FrontierHistorySummary;
}

export interface FrontierHistoryValidationIssue {
  code: string;
  message: string;
  recordId?: string;
  severity: 'error' | 'warning';
}

export interface FrontierHistoryValidation {
  valid: boolean;
  issues: FrontierHistoryValidationIssue[];
}

export interface FrontierCompiledHistoryTimeline {
  kind: 'frontier.history.compiled';
  version: 1;
  timeline: FrontierHistoryTimeline;
  recordsById: ReadonlyMap<string, FrontierHistoryRecord>;
  recordsByPath: ReadonlyMap<string, readonly string[]>;
  recordsByAction: ReadonlyMap<string, readonly string[]>;
  recordsByWorkflow: ReadonlyMap<string, readonly string[]>;
  recordsByPolicy: ReadonlyMap<string, readonly string[]>;
  recordsByEffect: ReadonlyMap<string, readonly string[]>;
  recordsByTrace: ReadonlyMap<string, readonly string[]>;
  recordsByActor: ReadonlyMap<string, readonly string[]>;
  recordsByAgent: ReadonlyMap<string, readonly string[]>;
  recordsByTest: ReadonlyMap<string, readonly string[]>;
  recordsByResource: ReadonlyMap<string, readonly string[]>;
  recordsByCause: ReadonlyMap<string, readonly string[]>;
  recordsByTag: ReadonlyMap<string, readonly string[]>;
  validation: FrontierHistoryValidation;
  get(recordId: string): FrontierHistoryRecord;
}

export interface FrontierHistoryQueryInput {
  ids?: readonly string[];
  kinds?: readonly string[];
  paths?: readonly string[];
  actions?: readonly string[];
  workflows?: readonly string[];
  policies?: readonly string[];
  effects?: readonly string[];
  traces?: readonly string[];
  actors?: readonly string[];
  agents?: readonly string[];
  tests?: readonly string[];
  resources?: readonly string[];
  causes?: readonly string[];
  features?: readonly string[];
  packages?: readonly string[];
  owners?: readonly string[];
  tags?: readonly string[];
  status?: readonly string[];
  from?: number;
  to?: number;
  limit?: number;
}

export interface FrontierHistoryQueryResult {
  kind: 'frontier.history.query';
  version: 1;
  ids: string[];
  records: FrontierHistoryRecord[];
}

export interface FrontierFieldExplanationInput {
  path: string;
  at?: number;
  from?: number;
  to?: number;
  includeRelated?: boolean;
  maxRelatedDepth?: number;
  limit?: number;
}

export interface FrontierHistoryExplanationReason {
  recordId: string;
  type: string;
  message: string;
  targetId?: string;
}

export interface FrontierHistoryExplanation {
  kind: typeof FRONTIER_HISTORY_EXPLANATION_KIND;
  version: typeof FRONTIER_HISTORY_EXPLANATION_VERSION;
  timelineId: string;
  path: string;
  at?: number;
  records: FrontierHistoryRecord[];
  relatedRecords: FrontierHistoryRecord[];
  actions: string[];
  workflows: string[];
  policies: string[];
  effects: string[];
  traces: string[];
  actors: string[];
  agents: string[];
  tests: string[];
  proofs: string[];
  reasons: FrontierHistoryExplanationReason[];
  confidence: FrontierHistoryExplanationConfidence;
}

export interface FrontierHistoryUndoInput {
  scope: 'record' | 'path' | 'action' | 'workflow' | 'policy' | 'effect' | 'actor' | 'agent' | 'test' | 'trace';
  target: string;
  at?: number;
  from?: number;
  to?: number;
  strict?: boolean;
  limit?: number;
}

export interface FrontierHistoryUndoPlan {
  kind: typeof FRONTIER_HISTORY_UNDO_PLAN_KIND;
  version: typeof FRONTIER_HISTORY_UNDO_PLAN_VERSION;
  timelineId: string;
  scope: FrontierHistoryUndoInput['scope'];
  target: string;
  recordIds: string[];
  inversePatches: FrontierHistoryPatch[];
  compensationActions: string[];
  affectedPaths: string[];
  conflicts: Array<{ recordId: string; path: string; reason: string }>;
  requiresReview: boolean;
  reasons: string[];
}

export interface FrontierHistoryWindow {
  kind: 'frontier.history.window';
  version: 1;
  timelineId: string;
  from?: number;
  to?: number;
  records: FrontierHistoryRecord[];
  summary: FrontierHistorySummary;
}

export interface FrontierHistoryWindowDiff {
  kind: 'frontier.history.window-diff';
  version: 1;
  leftTimelineId: string;
  rightTimelineId: string;
  added: string[];
  removed: string[];
  changed: string[];
  pathChanged: string[];
  summary: { added: number; removed: number; changed: number };
}

export interface FrontierHistoryMergeGraphEventMetadataInput {
  title?: string;
  description?: string;
  at?: number;
  logicalTime?: string | number;
  recordKind?: FrontierHistoryRecordKind;
  status?: FrontierHistoryRecordStatus;
  action?: string;
  tool?: string;
  workflow?: string;
  step?: string;
  actor?: string;
  agent?: string;
  owner?: string;
  package?: string;
  feature?: string;
  traceId?: string;
  spanId?: string;
  artifacts?: readonly string[];
  tags?: readonly string[];
  metadata?: unknown;
}

export interface FrontierHistoryMergeGraphNodeInput {
  id: string;
  recordId?: string;
  parentIds?: readonly string[];
  label?: string;
  lane?: string;
  scope?: string;
  at?: number;
  sequence?: number;
  status?: FrontierHistoryRecordStatus;
  event?: FrontierHistoryMergeGraphEventMetadataInput;
  metadata?: unknown;
}

export interface FrontierHistoryMergeGraphInput {
  id?: string;
  title?: string;
  description?: string;
  timelineId?: string;
  generatedAt?: number;
  lane?: string;
  scope?: string;
  nodes?: readonly FrontierHistoryMergeGraphNodeInput[];
  source?: string | FrontierRegistrySource;
  tags?: readonly string[];
  metadata?: unknown;
}

export interface FrontierHistoryMergeGraphEventMetadata {
  title: string;
  description?: string;
  at?: number;
  logicalTime?: string | number;
  recordKind?: FrontierHistoryRecordKind;
  status?: FrontierHistoryRecordStatus;
  action?: string;
  tool?: string;
  workflow?: string;
  step?: string;
  actor?: string;
  agent?: string;
  owner?: string;
  package?: string;
  feature?: string;
  traceId?: string;
  spanId?: string;
  artifacts: string[];
  tags: string[];
  metadata?: JsonObject;
}

export interface FrontierHistoryMergeGraphNode {
  id: string;
  recordId?: string;
  parentIds: string[];
  label: string;
  lane?: string;
  scope?: string;
  at?: number;
  sequence: number;
  status?: FrontierHistoryRecordStatus;
  event: FrontierHistoryMergeGraphEventMetadata;
  metadata?: JsonObject;
}

export interface FrontierHistoryMergeGraphParentLink {
  id: string;
  parentId: string;
  childId: string;
  parentIndex: number;
  lane?: string;
  scope?: string;
}

export interface FrontierHistoryMergeGraphSummary {
  nodeCount: number;
  parentLinkCount: number;
  rootNodeCount: number;
  mergeNodeCount: number;
  laneCount: number;
  scopeCount: number;
}

export interface FrontierHistoryMergeGraph {
  kind: typeof FRONTIER_HISTORY_MERGE_GRAPH_KIND;
  version: typeof FRONTIER_HISTORY_MERGE_GRAPH_VERSION;
  id: string;
  timelineId?: string;
  title?: string;
  description?: string;
  generatedAt?: number;
  nodes: FrontierHistoryMergeGraphNode[];
  parentLinks: FrontierHistoryMergeGraphParentLink[];
  source?: FrontierRegistrySource;
  tags: string[];
  metadata?: JsonObject;
  summary: FrontierHistoryMergeGraphSummary;
}

export interface FrontierHistoryProof {
  kind: typeof FRONTIER_HISTORY_PROOF_KIND;
  version: typeof FRONTIER_HISTORY_PROOF_VERSION;
  timelineId: string;
  generatedAt: number;
  hash: string;
  summary: FrontierHistorySummary | FrontierHistoryExplanation | FrontierHistoryUndoPlan;
  validation?: FrontierHistoryValidation;
  metadata?: JsonObject;
}

export function defineHistoryRecord(input: FrontierHistoryRecordInput): FrontierHistoryRecord {
  return normalizeRecord(input, 0);
}

export function createHistoryTimeline(input: FrontierHistoryTimelineInput = {}): FrontierHistoryTimeline {
  const records = (input.records ?? []).map((record, index) => normalizeRecord(record, index)).sort(compareRecords);
  return {
    kind: FRONTIER_HISTORY_TIMELINE_KIND,
    version: FRONTIER_HISTORY_TIMELINE_VERSION,
    id: normalizeId(input.id ?? 'history', 'history timeline id'),
    ...(input.title ? { title: input.title } : {}),
    ...(input.description ? { description: input.description } : {}),
    records,
    ...(input.package ? { package: input.package } : {}),
    ...(input.feature ? { feature: input.feature } : {}),
    ...(input.owner ? { owner: input.owner } : {}),
    ...(input.generatedAt !== undefined ? { generatedAt: input.generatedAt } : {}),
    ...(input.source ? { source: input.source } : {}),
    tags: uniqueStrings(input.tags),
    ...optionalObject('metadata', input.metadata),
    summary: summarizeRecords(records)
  };
}

export function compileHistoryTimeline(timelineOrInput: FrontierHistoryTimeline | FrontierHistoryTimelineInput): FrontierCompiledHistoryTimeline {
  const timeline = isHistoryTimeline(timelineOrInput) ? cloneHistoryTimeline(timelineOrInput) : createHistoryTimeline(timelineOrInput);
  const recordsById = new Map<string, FrontierHistoryRecord>();
  const recordsByPath = new Map<string, string[]>();
  const recordsByAction = new Map<string, string[]>();
  const recordsByWorkflow = new Map<string, string[]>();
  const recordsByPolicy = new Map<string, string[]>();
  const recordsByEffect = new Map<string, string[]>();
  const recordsByTrace = new Map<string, string[]>();
  const recordsByActor = new Map<string, string[]>();
  const recordsByAgent = new Map<string, string[]>();
  const recordsByTest = new Map<string, string[]>();
  const recordsByResource = new Map<string, string[]>();
  const recordsByCause = new Map<string, string[]>();
  const recordsByTag = new Map<string, string[]>();

  for (const record of timeline.records) {
    recordsById.set(record.id, record);
    for (const path of record.paths) pushMap(recordsByPath, path, record.id);
    for (const path of record.writes) pushMap(recordsByPath, path, record.id);
    for (const path of record.reads) pushMap(recordsByPath, path, record.id);
    if (record.action) pushMap(recordsByAction, record.action, record.id);
    if (record.workflow) pushMap(recordsByWorkflow, record.workflow, record.id);
    if (record.policy) pushMap(recordsByPolicy, record.policy, record.id);
    if (record.effect) pushMap(recordsByEffect, record.effect, record.id);
    if (record.traceId) pushMap(recordsByTrace, record.traceId, record.id);
    if (record.spanId) pushMap(recordsByTrace, record.spanId, record.id);
    if (record.actor) pushMap(recordsByActor, record.actor, record.id);
    if (record.user) pushMap(recordsByActor, record.user, record.id);
    if (record.agent) pushMap(recordsByAgent, record.agent, record.id);
    if (record.test) pushMap(recordsByTest, record.test, record.id);
    for (const resource of record.resources) pushMap(recordsByResource, resource, record.id);
    for (const causeId of record.causeIds) pushMap(recordsByCause, causeId, record.id);
    for (const parentId of record.parentIds) pushMap(recordsByCause, parentId, record.id);
    for (const link of record.links) pushMap(recordsByCause, link.targetId, record.id);
    for (const tag of record.tags) pushMap(recordsByTag, tag, record.id);
  }

  const validation = validateHistoryTimeline(timeline);
  return {
    kind: 'frontier.history.compiled',
    version: 1,
    timeline,
    recordsById,
    recordsByPath,
    recordsByAction,
    recordsByWorkflow,
    recordsByPolicy,
    recordsByEffect,
    recordsByTrace,
    recordsByActor,
    recordsByAgent,
    recordsByTest,
    recordsByResource,
    recordsByCause,
    recordsByTag,
    validation,
    get(recordId: string) {
      const record = recordsById.get(recordId);
      if (!record) throw new Error('unknown history record: ' + recordId);
      return record;
    }
  };
}

export function validateHistoryTimeline(timelineOrInput: FrontierHistoryTimeline | FrontierHistoryTimelineInput): FrontierHistoryValidation {
  const timeline = isHistoryTimeline(timelineOrInput) ? timelineOrInput : createHistoryTimeline(timelineOrInput);
  const issues: FrontierHistoryValidationIssue[] = [];
  const allIds = new Set(timeline.records.map((record) => record.id));
  const ids = new Set<string>();
  for (const record of timeline.records) {
    if (ids.has(record.id)) issues.push({ code: 'duplicate-record-id', message: 'duplicate history record id: ' + record.id, recordId: record.id, severity: 'error' });
    ids.add(record.id);
    for (const causeId of record.causeIds) {
      if (!allIds.has(causeId)) {
        issues.push({ code: 'unknown-cause', message: 'record references unknown cause id: ' + causeId, recordId: record.id, severity: 'warning' });
      }
    }
    if (record.paths.length === 0 && record.reads.length === 0 && record.writes.length === 0 && record.patches.length === 0) {
      issues.push({ code: 'no-paths', message: 'record has no path/read/write/patch evidence: ' + record.id, recordId: record.id, severity: 'warning' });
    }
  }
  return { valid: issues.every((issue) => issue.severity !== 'error'), issues };
}

export function queryHistoryTimeline(compiledOrTimeline: FrontierCompiledHistoryTimeline | FrontierHistoryTimeline | FrontierHistoryTimelineInput, query: FrontierHistoryQueryInput = {}): FrontierHistoryQueryResult {
  const compiled = isCompiledTimeline(compiledOrTimeline) ? compiledOrTimeline : compileHistoryTimeline(compiledOrTimeline);
  let ids = compiled.timeline.records.map((record) => record.id);
  ids = intersectFilter(ids, query.ids);
  ids = filterByMap(ids, query.paths, compiled.recordsByPath, pathMatchesAny);
  ids = filterByMap(ids, query.actions, compiled.recordsByAction);
  ids = filterByMap(ids, query.workflows, compiled.recordsByWorkflow);
  ids = filterByMap(ids, query.policies, compiled.recordsByPolicy);
  ids = filterByMap(ids, query.effects, compiled.recordsByEffect);
  ids = filterByMap(ids, query.traces, compiled.recordsByTrace);
  ids = filterByMap(ids, query.actors, compiled.recordsByActor);
  ids = filterByMap(ids, query.agents, compiled.recordsByAgent);
  ids = filterByMap(ids, query.tests, compiled.recordsByTest);
  ids = filterByMap(ids, query.resources, compiled.recordsByResource);
  ids = filterByMap(ids, query.causes, compiled.recordsByCause);
  ids = filterByMap(ids, query.tags, compiled.recordsByTag);
  ids = ids.filter((id) => matchesRecordQuery(compiled.get(id), query));
  if (query.limit !== undefined) ids = ids.slice(0, Math.max(0, query.limit));
  return { kind: 'frontier.history.query', version: 1, ids, records: ids.map((id) => compiled.get(id)) };
}

export function explainFieldChange(compiledOrTimeline: FrontierCompiledHistoryTimeline | FrontierHistoryTimeline | FrontierHistoryTimelineInput, input: FrontierFieldExplanationInput): FrontierHistoryExplanation {
  const compiled = isCompiledTimeline(compiledOrTimeline) ? compiledOrTimeline : compileHistoryTimeline(compiledOrTimeline);
  const at = input.at ?? input.to;
  const limit = input.limit ?? 25;
  const records = queryHistoryTimeline(compiled, { paths: [input.path], from: input.from, to: at, limit }).records
    .filter((record) => pathMatchesRecord(input.path, record))
    .sort(compareRecords);
  const relatedRecords = input.includeRelated === false ? [] : collectRelatedRecords(compiled, records, input.maxRelatedDepth ?? 2);
  const all = records.concat(relatedRecords);
  const reasons: FrontierHistoryExplanationReason[] = [];
  for (const record of all) {
    if (record.action) reasons.push({ recordId: record.id, type: 'action', targetId: record.action, message: 'action ' + record.action + ' participated in the change' });
    if (record.workflow) reasons.push({ recordId: record.id, type: 'workflow', targetId: record.workflow, message: 'workflow ' + record.workflow + (record.step ? ' step ' + record.step : '') + ' was active' });
    if (record.policy) reasons.push({ recordId: record.id, type: 'policy', targetId: record.policy, message: 'policy ' + record.policy + ' returned ' + (record.policyDecision ?? record.status) });
    if (record.effect) reasons.push({ recordId: record.id, type: 'effect', targetId: record.effect, message: 'effect ' + record.effect + ' produced or consumed related data' });
    if (record.actor || record.agent || record.user) reasons.push({ recordId: record.id, type: 'subject', targetId: record.actor ?? record.agent ?? record.user, message: 'initiated by ' + (record.actor ?? record.agent ?? record.user) });
    if (record.test) reasons.push({ recordId: record.id, type: 'test', targetId: record.test, message: 'test/replay evidence is attached through ' + record.test });
  }
  return {
    kind: FRONTIER_HISTORY_EXPLANATION_KIND,
    version: FRONTIER_HISTORY_EXPLANATION_VERSION,
    timelineId: compiled.timeline.id,
    path: input.path,
    ...(at !== undefined ? { at } : {}),
    records,
    relatedRecords,
    actions: uniqueStrings(all.map((record) => record.action)),
    workflows: uniqueStrings(all.map((record) => record.workflow)),
    policies: uniqueStrings(all.map((record) => record.policy)),
    effects: uniqueStrings(all.map((record) => record.effect)),
    traces: uniqueStrings(all.flatMap((record) => [record.traceId, record.spanId])),
    actors: uniqueStrings(all.flatMap((record) => [record.actor, record.user])),
    agents: uniqueStrings(all.map((record) => record.agent)),
    tests: uniqueStrings(all.map((record) => record.test)),
    proofs: uniqueStrings(all.map((record) => record.proof)),
    reasons,
    confidence: explanationConfidence(records, reasons)
  };
}

export function planHistoryUndo(compiledOrTimeline: FrontierCompiledHistoryTimeline | FrontierHistoryTimeline | FrontierHistoryTimelineInput, input: FrontierHistoryUndoInput): FrontierHistoryUndoPlan {
  const compiled = isCompiledTimeline(compiledOrTimeline) ? compiledOrTimeline : compileHistoryTimeline(compiledOrTimeline);
  const query = undoQuery(input);
  const selected = queryHistoryTimeline(compiled, { ...query, from: input.from, to: input.at ?? input.to, limit: input.limit }).records;
  const inversePatches: FrontierHistoryPatch[] = [];
  const reasons: string[] = [];
  const compensationActions: string[] = [];
  for (const record of selected.slice().sort((left, right) => compareRecords(right, left))) {
    for (const patch of record.patches.slice().reverse()) {
      const inverse = invertPatch(patch);
      if (inverse) inversePatches.push(inverse);
      else reasons.push('record ' + record.id + ' has non-invertible patch at ' + patch.path);
    }
    const compensation = readString(record.metadata?.compensationAction) ?? readString(record.metadata?.rollbackAction);
    if (compensation) compensationActions.push(compensation);
  }
  const affectedPaths = uniqueStrings(selected.flatMap(recordPathsForUndo));
  const after = selected.length ? Math.max(...selected.map((record) => record.at)) : input.at ?? input.to ?? -Infinity;
  const conflicts = compiled.timeline.records
    .filter((record) => record.at > after && !selected.some((candidate) => candidate.id === record.id))
    .flatMap((record) => recordPathsForUndo(record)
      .filter((path) => affectedPaths.some((affected) => pathsOverlap(path, affected)))
      .map((path) => ({ recordId: record.id, path, reason: 'later record touches same scope' })));
  return {
    kind: FRONTIER_HISTORY_UNDO_PLAN_KIND,
    version: FRONTIER_HISTORY_UNDO_PLAN_VERSION,
    timelineId: compiled.timeline.id,
    scope: input.scope,
    target: input.target,
    recordIds: selected.map((record) => record.id),
    inversePatches,
    compensationActions: uniqueStrings(compensationActions),
    affectedPaths,
    conflicts,
    requiresReview: reasons.length > 0 || conflicts.length > 0 || (input.strict === true && selected.length === 0),
    reasons
  };
}

export function createHistoryWindow(compiledOrTimeline: FrontierCompiledHistoryTimeline | FrontierHistoryTimeline | FrontierHistoryTimelineInput, query: FrontierHistoryQueryInput = {}): FrontierHistoryWindow {
  const compiled = isCompiledTimeline(compiledOrTimeline) ? compiledOrTimeline : compileHistoryTimeline(compiledOrTimeline);
  const records = queryHistoryTimeline(compiled, query).records;
  return {
    kind: 'frontier.history.window',
    version: 1,
    timelineId: compiled.timeline.id,
    ...(query.from !== undefined ? { from: query.from } : {}),
    ...(query.to !== undefined ? { to: query.to } : {}),
    records,
    summary: summarizeRecords(records)
  };
}

export function diffHistoryWindows(left: FrontierHistoryWindow | FrontierHistoryTimeline, right: FrontierHistoryWindow | FrontierHistoryTimeline): FrontierHistoryWindowDiff {
  const leftRecords = 'records' in left ? left.records : [];
  const rightRecords = 'records' in right ? right.records : [];
  const leftById = new Map(leftRecords.map((record) => [record.id, record]));
  const rightById = new Map(rightRecords.map((record) => [record.id, record]));
  const added = rightRecords.filter((record) => !leftById.has(record.id)).map((record) => record.id);
  const removed = leftRecords.filter((record) => !rightById.has(record.id)).map((record) => record.id);
  const changed = rightRecords.filter((record) => {
    const leftRecord = leftById.get(record.id);
    return leftRecord !== undefined && stableStringify(leftRecord) !== stableStringify(record);
  }).map((record) => record.id);
  const pathChanged = uniqueStrings(added.concat(removed, changed).flatMap((id) => (rightById.get(id) ?? leftById.get(id))?.paths ?? []));
  return {
    kind: 'frontier.history.window-diff',
    version: 1,
    leftTimelineId: 'timelineId' in left ? left.timelineId : left.id,
    rightTimelineId: 'timelineId' in right ? right.timelineId : right.id,
    added,
    removed,
    changed,
    pathChanged,
    summary: { added: added.length, removed: removed.length, changed: changed.length }
  };
}

export function createHistoryMergeGraph(input: FrontierHistoryMergeGraphInput | FrontierHistoryTimeline | FrontierCompiledHistoryTimeline = {}): FrontierHistoryMergeGraph {
  if (isCompiledTimeline(input)) return createHistoryMergeGraphFromTimeline(input.timeline);
  if (isHistoryTimeline(input)) return createHistoryMergeGraphFromTimeline(input);

  const nodes = (input.nodes ?? [])
    .map((node, index) => normalizeMergeGraphNode(node, index, input))
    .sort(compareMergeGraphNodes);
  const parentLinks = createMergeGraphParentLinks(nodes);
  return {
    kind: FRONTIER_HISTORY_MERGE_GRAPH_KIND,
    version: FRONTIER_HISTORY_MERGE_GRAPH_VERSION,
    id: normalizeId(input.id ?? 'history.merge-graph', 'history merge graph id'),
    ...(input.timelineId ? { timelineId: input.timelineId } : {}),
    ...(input.title ? { title: input.title } : {}),
    ...(input.description ? { description: input.description } : {}),
    ...(input.generatedAt !== undefined ? { generatedAt: input.generatedAt } : {}),
    nodes,
    parentLinks,
    ...(input.source ? { source: normalizeSource(input.source) } : {}),
    tags: uniqueStrings(input.tags),
    ...optionalObject('metadata', input.metadata),
    summary: summarizeMergeGraph(nodes, parentLinks)
  };
}

export function createHistoryRegistryGraph(timelineOrCompiled: FrontierHistoryTimeline | FrontierCompiledHistoryTimeline, options: { generatedAt?: number; metadata?: unknown } = {}): FrontierRegistryGraph {
  const timeline = isCompiledTimeline(timelineOrCompiled) ? timelineOrCompiled.timeline : timelineOrCompiled;
  const entries: FrontierRegistryEntry[] = [];
  const edges: FrontierRegistryEdge[] = [];
  entries.push({
    id: 'history:' + timeline.id,
    kind: 'history',
    description: timeline.title ?? timeline.id,
    package: timeline.package,
    feature: timeline.feature,
    owner: timeline.owner,
    tags: timeline.tags,
    metadata: { summary: timeline.summary as unknown as JsonValue }
  });
  for (const record of timeline.records) {
    const entryId = 'history-record:' + record.id;
    entries.push({
      id: entryId,
      kind: record.recordKind,
      description: record.title,
      package: record.package ?? timeline.package,
      feature: record.feature ?? timeline.feature,
      owner: record.owner ?? timeline.owner,
      reads: record.reads,
      writes: record.writes,
      touches: record.paths,
      produces: record.artifacts,
      tags: record.tags,
      source: record.source,
      metadata: { at: record.at, status: record.status }
    });
    edges.push({ from: 'history:' + timeline.id, to: entryId, kind: 'contains' });
    for (const path of uniqueStrings(record.paths.concat(record.reads, record.writes))) edges.push({ from: entryId, to: 'path:' + path, kind: 'touches' });
    for (const causeId of record.causeIds) edges.push({ from: entryId, to: 'history-record:' + causeId, kind: 'caused-by' });
    for (const parentId of record.parentIds) edges.push({ from: entryId, to: 'history-record:' + parentId, kind: 'child-of' });
    if (record.action) edges.push({ from: entryId, to: record.action, kind: 'caused-by-action' });
    if (record.workflow) edges.push({ from: entryId, to: record.workflow, kind: 'part-of-workflow' });
    if (record.policy) edges.push({ from: entryId, to: record.policy, kind: 'allowed-by-policy' });
    if (record.effect) edges.push({ from: entryId, to: record.effect, kind: 'produced-by-effect' });
    if (record.traceId) edges.push({ from: entryId, to: 'trace:' + record.traceId, kind: 'observed-in-trace' });
    if (record.test) edges.push({ from: entryId, to: record.test, kind: 'proven-by-test' });
    for (const link of record.links) edges.push({ from: entryId, to: link.targetId, kind: link.type, metadata: link.metadata });
  }
  return createFrontierRegistryGraph({ generatedAt: options.generatedAt, entries, edges, metadata: asJsonObject(options.metadata) });
}

export function createHistoryProvenanceGraph(timelineOrCompiled: FrontierHistoryTimeline | FrontierCompiledHistoryTimeline, options: { generatedAt?: number; metadata?: unknown } = {}): FrontierRegistryGraph {
  const graph = createHistoryRegistryGraph(timelineOrCompiled, options);
  return createFrontierRegistryGraph({
    generatedAt: graph.generatedAt,
    entries: graph.entries,
    records: graph.records,
    edges: graph.edges.map((edge) => ({ ...edge, kind: provenanceEdgeKind(edge.kind) })),
    metadata: { ...(graph.metadata ?? {}), model: 'frontier-prov' }
  });
}

export function encodeHistoryJsonl(items: readonly unknown[]): string {
  return items.map((item) => stableStringify(item)).join('\n') + (items.length ? '\n' : '');
}

export function decodeHistoryJsonl(text: string): unknown[] {
  return text.split(/\r?\n/g).filter((line) => line.trim().length > 0).map((line) => JSON.parse(line));
}

export function redactHistoryValue<T>(value: T, keys: readonly string[] = ['password', 'secret', 'token', 'authorization', 'cookie', 'apiKey']): T {
  const lowered = new Set(keys.map((key) => key.toLowerCase()));
  return redactAny(value, lowered) as T;
}

export function createHistoryProof(input: FrontierHistoryTimeline | FrontierHistoryExplanation | FrontierHistoryUndoPlan | FrontierHistoryWindow, options: { generatedAt?: number; metadata?: unknown } = {}): FrontierHistoryProof {
  const timelineId = 'timelineId' in input ? input.timelineId : input.id;
  const summary = isHistoryTimeline(input) || input.kind === 'frontier.history.window' ? input.summary : input;
  const validation = isHistoryTimeline(input) ? validateHistoryTimeline(input) : undefined;
  const generatedAt = options.generatedAt ?? Date.now();
  const payload = redactHistoryValue({ input, generatedAt });
  return {
    kind: FRONTIER_HISTORY_PROOF_KIND,
    version: FRONTIER_HISTORY_PROOF_VERSION,
    timelineId,
    generatedAt,
    hash: hashString(stableStringify(payload)),
    summary,
    ...(validation ? { validation } : {}),
    ...optionalObject('metadata', options.metadata)
  };
}

function normalizeRecord(input: FrontierHistoryRecordInput, index: number): FrontierHistoryRecord {
  const patches = (input.patches ?? []).map(normalizePatch);
  const patchPaths = patches.flatMap((patch) => [patch.path, patch.from]);
  const writes = uniqueStrings((input.writes ?? []).concat(patches.map((patch) => patch.path)));
  const paths = uniqueStrings([...(input.paths ?? []), ...(input.reads ?? []), ...writes, ...patchPaths]);
  return {
    kind: FRONTIER_HISTORY_RECORD_KIND,
    version: FRONTIER_HISTORY_RECORD_VERSION,
    id: normalizeId(input.id, 'history record id'),
    recordKind: input.kind ?? 'patch',
    title: input.title ?? input.id,
    ...(input.description ? { description: input.description } : {}),
    at: input.at ?? index,
    sequence: input.sequence ?? index,
    ...(input.logicalTime !== undefined ? { logicalTime: input.logicalTime } : {}),
    status: input.status ?? 'ok',
    ...optionalString('action', input.action),
    ...optionalString('tool', input.tool),
    ...optionalString('workflow', input.workflow),
    ...optionalString('step', input.step),
    ...optionalString('policy', input.policy),
    ...optionalString('policyDecision', input.policyDecision),
    ...optionalString('effect', input.effect),
    ...optionalString('route', input.route),
    ...optionalString('view', input.view),
    ...optionalString('traceId', input.traceId),
    ...optionalString('spanId', input.spanId),
    ...optionalString('parentSpanId', input.parentSpanId),
    ...optionalString('actor', input.actor),
    ...optionalString('agent', input.agent),
    ...optionalString('subject', input.subject),
    ...optionalString('user', input.user),
    ...optionalString('test', input.test),
    ...optionalString('replay', input.replay),
    ...optionalString('proof', input.proof),
    ...optionalString('requestId', input.requestId),
    ...optionalString('commandId', input.commandId),
    ...optionalString('transactionId', input.transactionId),
    ...(input.version ? { versionId: input.version } : {}),
    ...optionalString('branch', input.branch),
    ...optionalString('undoScope', input.undoScope),
    paths,
    reads: uniqueStrings(input.reads),
    writes,
    patches,
    resources: uniqueStrings(input.resources),
    artifacts: uniqueStrings(input.artifacts),
    causeIds: uniqueStrings(input.causeIds),
    parentIds: uniqueStrings((input.parentIds ?? []).concat(input.parentSpanId ? [input.parentSpanId] : [])),
    links: (input.links ?? []).map(normalizeLink),
    tags: uniqueStrings(input.tags),
    ...optionalString('owner', input.owner),
    ...optionalString('package', input.package),
    ...optionalString('feature', input.feature),
    ...(input.source ? { source: normalizeSource(input.source) } : {}),
    ...optionalObject('metadata', input.metadata)
  };
}

function normalizePatch(input: FrontierHistoryPatchInput): FrontierHistoryPatch {
  return {
    op: input.op ?? 'set',
    path: normalizePath(input.path),
    ...(input.from ? { from: normalizePath(input.from) } : {}),
    ...optionalJson('value', input.value),
    ...optionalJson('oldValue', input.oldValue),
    inverse: (input.inverse ?? []).map(normalizePatch),
    ...optionalObject('metadata', input.metadata)
  };
}

function normalizeLink(input: FrontierHistoryLinkInput): FrontierHistoryLink {
  return {
    type: normalizeId(input.type, 'history link type'),
    targetId: normalizeId(input.targetId, 'history link target id'),
    ...(input.reason ? { reason: input.reason } : {}),
    ...optionalObject('metadata', input.metadata)
  };
}

function createHistoryMergeGraphFromTimeline(timeline: FrontierHistoryTimeline): FrontierHistoryMergeGraph {
  const nodes = timeline.records.map(mergeGraphNodeFromRecord).sort(compareMergeGraphNodes);
  const parentLinks = createMergeGraphParentLinks(nodes);
  return {
    kind: FRONTIER_HISTORY_MERGE_GRAPH_KIND,
    version: FRONTIER_HISTORY_MERGE_GRAPH_VERSION,
    id: timeline.id + '.merge-graph',
    timelineId: timeline.id,
    ...(timeline.title ? { title: timeline.title } : {}),
    ...(timeline.description ? { description: timeline.description } : {}),
    ...(timeline.generatedAt !== undefined ? { generatedAt: timeline.generatedAt } : {}),
    nodes,
    parentLinks,
    ...(timeline.source ? { source: timeline.source } : {}),
    tags: timeline.tags,
    ...optionalObject('metadata', timeline.metadata),
    summary: summarizeMergeGraph(nodes, parentLinks)
  };
}

function mergeGraphNodeFromRecord(record: FrontierHistoryRecord, index: number): FrontierHistoryMergeGraphNode {
  const lane = readString(record.metadata?.lane) ?? record.branch ?? record.workflow ?? record.agent;
  const scope = readString(record.metadata?.scope) ?? record.feature ?? record.package ?? record.undoScope ?? record.paths[0];
  return {
    id: record.id,
    recordId: record.id,
    parentIds: uniqueStrings(record.parentIds),
    label: record.title,
    ...optionalString('lane', lane),
    ...optionalString('scope', scope),
    at: record.at,
    sequence: record.sequence ?? index,
    status: record.status,
    event: normalizeMergeGraphEvent({
      title: record.title,
      description: record.description,
      at: record.at,
      logicalTime: record.logicalTime,
      recordKind: record.recordKind,
      status: record.status,
      action: record.action,
      tool: record.tool,
      workflow: record.workflow,
      step: record.step,
      actor: record.actor ?? record.user ?? record.subject,
      agent: record.agent,
      owner: record.owner,
      package: record.package,
      feature: record.feature,
      traceId: record.traceId,
      spanId: record.spanId,
      artifacts: record.artifacts,
      tags: record.tags,
      metadata: recordMergeGraphEventMetadata(record)
    }, record.title)
  };
}

function normalizeMergeGraphNode(input: FrontierHistoryMergeGraphNodeInput, index: number, defaults: FrontierHistoryMergeGraphInput = {}): FrontierHistoryMergeGraphNode {
  const label = readString(input.label) ?? readString(input.event?.title) ?? input.recordId ?? input.id;
  const lane = input.lane ?? defaults.lane;
  const scope = input.scope ?? defaults.scope;
  return {
    id: normalizeId(input.id, 'history merge graph node id'),
    ...(input.recordId ? { recordId: input.recordId } : {}),
    parentIds: uniqueStrings(input.parentIds),
    label,
    ...optionalString('lane', lane),
    ...optionalString('scope', scope),
    ...(input.at !== undefined ? { at: input.at } : {}),
    sequence: input.sequence ?? index,
    ...(input.status ? { status: input.status } : {}),
    event: normalizeMergeGraphEvent({
      ...input.event,
      title: input.event?.title ?? label,
      at: input.event?.at ?? input.at,
      status: input.event?.status ?? input.status
    }, label),
    ...optionalObject('metadata', input.metadata)
  };
}

function normalizeMergeGraphEvent(input: FrontierHistoryMergeGraphEventMetadataInput, fallbackTitle: string): FrontierHistoryMergeGraphEventMetadata {
  return {
    title: input.title ?? fallbackTitle,
    ...(input.description ? { description: input.description } : {}),
    ...(input.at !== undefined ? { at: input.at } : {}),
    ...(input.logicalTime !== undefined ? { logicalTime: input.logicalTime } : {}),
    ...(input.recordKind ? { recordKind: input.recordKind } : {}),
    ...(input.status ? { status: input.status } : {}),
    ...optionalString('action', input.action),
    ...optionalString('tool', input.tool),
    ...optionalString('workflow', input.workflow),
    ...optionalString('step', input.step),
    ...optionalString('actor', input.actor),
    ...optionalString('agent', input.agent),
    ...optionalString('owner', input.owner),
    ...optionalString('package', input.package),
    ...optionalString('feature', input.feature),
    ...optionalString('traceId', input.traceId),
    ...optionalString('spanId', input.spanId),
    artifacts: uniqueStrings(input.artifacts),
    tags: uniqueStrings(input.tags),
    ...optionalObject('metadata', input.metadata)
  };
}

function recordMergeGraphEventMetadata(record: FrontierHistoryRecord): JsonObject {
  return compactJsonObject({
    paths: record.paths,
    reads: record.reads,
    writes: record.writes,
    resources: record.resources,
    requestId: record.requestId,
    commandId: record.commandId,
    transactionId: record.transactionId,
    proof: record.proof,
    replay: record.replay
  });
}

function createMergeGraphParentLinks(nodes: readonly FrontierHistoryMergeGraphNode[]): FrontierHistoryMergeGraphParentLink[] {
  return nodes.flatMap((node) => node.parentIds.map((parentId, parentIndex) => ({
    id: 'history-merge-parent:' + parentId + '->' + node.id,
    parentId,
    childId: node.id,
    parentIndex,
    ...optionalString('lane', node.lane),
    ...optionalString('scope', node.scope)
  }))).sort(compareMergeGraphParentLinks);
}

function summarizeMergeGraph(nodes: readonly FrontierHistoryMergeGraphNode[], parentLinks: readonly FrontierHistoryMergeGraphParentLink[]): FrontierHistoryMergeGraphSummary {
  return {
    nodeCount: nodes.length,
    parentLinkCount: parentLinks.length,
    rootNodeCount: nodes.filter((node) => node.parentIds.length === 0).length,
    mergeNodeCount: nodes.filter((node) => node.parentIds.length > 1).length,
    laneCount: countUnique(nodes.map((node) => node.lane)),
    scopeCount: countUnique(nodes.map((node) => node.scope))
  };
}

function summarizeRecords(records: readonly FrontierHistoryRecord[]): FrontierHistorySummary {
  return {
    recordCount: records.length,
    pathCount: countUnique(records.flatMap((record) => record.paths)),
    actionCount: countUnique(records.map((record) => record.action)),
    workflowCount: countUnique(records.map((record) => record.workflow)),
    policyCount: countUnique(records.map((record) => record.policy)),
    effectCount: countUnique(records.map((record) => record.effect)),
    traceCount: countUnique(records.flatMap((record) => [record.traceId, record.spanId])),
    actorCount: countUnique(records.flatMap((record) => [record.actor, record.user])),
    agentCount: countUnique(records.map((record) => record.agent)),
    testCount: countUnique(records.map((record) => record.test)),
    undoableRecordCount: records.filter((record) => record.patches.some((patch) => patch.inverse.length > 0 || invertPatch(patch) !== undefined)).length,
    ...(records.length ? { firstAt: records[0]?.at, lastAt: records[records.length - 1]?.at } : {})
  };
}

function matchesRecordQuery(record: FrontierHistoryRecord, query: FrontierHistoryQueryInput): boolean {
  if (query.kinds && !query.kinds.includes(record.recordKind)) return false;
  if (query.features && (!record.feature || !query.features.includes(record.feature))) return false;
  if (query.packages && (!record.package || !query.packages.includes(record.package))) return false;
  if (query.owners && (!record.owner || !query.owners.includes(record.owner))) return false;
  if (query.status && !query.status.includes(record.status)) return false;
  if (query.from !== undefined && record.at < query.from) return false;
  if (query.to !== undefined && record.at > query.to) return false;
  return true;
}

function collectRelatedRecords(compiled: FrontierCompiledHistoryTimeline, records: readonly FrontierHistoryRecord[], depth: number): FrontierHistoryRecord[] {
  const out = new Map<string, FrontierHistoryRecord>();
  const queue = records.map((record) => ({ record, depth: 0 }));
  const seen = new Set(records.map((record) => record.id));
  for (let cursor = 0; cursor < queue.length; cursor++) {
    const { record, depth: currentDepth } = queue[cursor]!;
    if (currentDepth >= depth) continue;
    const ids = uniqueStrings(record.causeIds.concat(record.parentIds, record.links.map((link) => link.targetId)));
    for (const id of ids) {
      const related = compiled.recordsById.get(id);
      if (!related || seen.has(related.id)) continue;
      seen.add(related.id);
      out.set(related.id, related);
      queue.push({ record: related, depth: currentDepth + 1 });
    }
    for (const id of compiled.recordsByCause.get(record.id) ?? []) {
      const child = compiled.recordsById.get(id);
      if (!child || seen.has(child.id)) continue;
      seen.add(child.id);
      out.set(child.id, child);
      queue.push({ record: child, depth: currentDepth + 1 });
    }
  }
  return Array.from(out.values()).sort(compareRecords);
}

function explanationConfidence(records: readonly FrontierHistoryRecord[], reasons: readonly FrontierHistoryExplanationReason[]): FrontierHistoryExplanationConfidence {
  if (records.length === 0) return 'unknown';
  if (reasons.some((reason) => reason.type === 'action') && reasons.some((reason) => reason.type === 'policy' || reason.type === 'effect')) return 'direct';
  if (reasons.length > 0) return 'inferred';
  return 'partial';
}

function undoQuery(input: FrontierHistoryUndoInput): FrontierHistoryQueryInput {
  switch (input.scope) {
    case 'record': return { ids: [input.target] };
    case 'path': return { paths: [input.target] };
    case 'action': return { actions: [input.target] };
    case 'workflow': return { workflows: [input.target] };
    case 'policy': return { policies: [input.target] };
    case 'effect': return { effects: [input.target] };
    case 'actor': return { actors: [input.target] };
    case 'agent': return { agents: [input.target] };
    case 'test': return { tests: [input.target] };
    case 'trace': return { traces: [input.target] };
  }
}

function invertPatch(patch: FrontierHistoryPatch): FrontierHistoryPatch | undefined {
  if (patch.inverse.length > 0) return patch.inverse[0];
  if (patch.op === 'add') return { op: 'remove', path: patch.path, inverse: [] };
  if ((patch.op === 'remove' || patch.op === 'delete') && patch.oldValue !== undefined) return { op: 'add', path: patch.path, value: cloneJson(patch.oldValue), inverse: [] };
  if ((patch.op === 'replace' || patch.op === 'set') && patch.oldValue !== undefined) return { op: 'set', path: patch.path, value: cloneJson(patch.oldValue), oldValue: patch.value, inverse: [] };
  return undefined;
}

function recordPathsForUndo(record: FrontierHistoryRecord): string[] {
  return uniqueStrings(record.writes.concat(record.patches.map((patch) => patch.path), record.paths));
}

function pathMatchesRecord(path: string, record: FrontierHistoryRecord): boolean {
  return record.paths.some((candidate) => pathsOverlap(path, candidate)) ||
    record.reads.some((candidate) => pathsOverlap(path, candidate)) ||
    record.writes.some((candidate) => pathsOverlap(path, candidate)) ||
    record.patches.some((patch) => pathsOverlap(path, patch.path));
}

function pathMatchesAny(value: string, target: string): boolean {
  return pathsOverlap(value, target);
}

function pathsOverlap(left: string, right: string): boolean {
  const a = normalizePath(left);
  const b = normalizePath(right);
  return a === b || a.startsWith(b.endsWith('/') ? b : b + '/') || b.startsWith(a.endsWith('/') ? a : a + '/');
}

function filterByMap(ids: string[], filters: readonly string[] | undefined, map: ReadonlyMap<string, readonly string[]>, matcher: (left: string, right: string) => boolean = (left, right) => left === right): string[] {
  if (!filters || filters.length === 0) return ids;
  const selected = new Set<string>();
  for (const [key, values] of map) {
    if (filters.some((filter) => matcher(key, filter))) for (const value of values) selected.add(value);
  }
  return ids.filter((id) => selected.has(id));
}

function intersectFilter(ids: string[], filters: readonly string[] | undefined): string[] {
  if (!filters || filters.length === 0) return ids;
  const set = new Set(filters);
  return ids.filter((id) => set.has(id));
}

function pushMap(map: Map<string, string[]>, key: string | undefined, value: string): void {
  if (!key) return;
  let values = map.get(key);
  if (!values) {
    values = [];
    map.set(key, values);
  }
  if (!values.includes(value)) values.push(value);
}

function compareRecords(left: FrontierHistoryRecord, right: FrontierHistoryRecord): number {
  return left.at - right.at || left.sequence - right.sequence || left.id.localeCompare(right.id);
}

function compareMergeGraphNodes(left: FrontierHistoryMergeGraphNode, right: FrontierHistoryMergeGraphNode): number {
  return (left.at ?? 0) - (right.at ?? 0) || left.sequence - right.sequence || left.id.localeCompare(right.id);
}

function compareMergeGraphParentLinks(left: FrontierHistoryMergeGraphParentLink, right: FrontierHistoryMergeGraphParentLink): number {
  return left.childId.localeCompare(right.childId) || left.parentIndex - right.parentIndex || left.parentId.localeCompare(right.parentId);
}

function isHistoryTimeline(value: unknown): value is FrontierHistoryTimeline {
  return !!value && typeof value === 'object' && (value as { kind?: unknown }).kind === FRONTIER_HISTORY_TIMELINE_KIND;
}

function isCompiledTimeline(value: unknown): value is FrontierCompiledHistoryTimeline {
  return !!value && typeof value === 'object' && (value as { kind?: unknown }).kind === 'frontier.history.compiled';
}

function cloneHistoryTimeline(timeline: FrontierHistoryTimeline): FrontierHistoryTimeline {
  return cloneJson(timeline as unknown as JsonValue) as unknown as FrontierHistoryTimeline;
}

function normalizeSource(source: string | FrontierRegistrySource): FrontierRegistrySource {
  return typeof source === 'string' ? { file: source } : source;
}

function optionalString<Key extends string>(key: Key, value: string | undefined): { [K in Key]?: string } {
  return value ? { [key]: value } as { [K in Key]?: string } : {};
}

function optionalObject<Key extends string>(key: Key, value: unknown): { [K in Key]?: JsonObject } {
  const object = asJsonObject(value);
  return object ? { [key]: object } as { [K in Key]?: JsonObject } : {};
}

function optionalJson<Key extends string>(key: Key, value: unknown): { [K in Key]?: JsonValue } {
  return value === undefined ? {} : { [key]: toJsonValue(value) } as { [K in Key]?: JsonValue };
}

function asJsonObject(value: unknown): JsonObject | undefined {
  if (value === undefined) return undefined;
  if (value && typeof value === 'object' && !Array.isArray(value)) return cloneJson(value as JsonObject) as JsonObject;
  return { value: toJsonValue(value) };
}

function compactJsonObject(value: Record<string, JsonValue | undefined>): JsonObject {
  const out: JsonObject = {};
  for (const [key, entry] of Object.entries(value)) {
    if (entry !== undefined) out[key] = cloneJson(entry);
  }
  return out;
}

function toJsonValue(value: unknown): JsonValue {
  if (value === undefined) return null;
  return cloneJson(value as JsonValue);
}

function uniqueStrings(values: readonly (string | undefined | null)[] | undefined): string[] {
  return Array.from(new Set((values ?? []).filter((value): value is string => typeof value === 'string' && value.length > 0))).sort();
}

function countUnique(values: readonly (string | undefined)[]): number {
  return uniqueStrings(values).length;
}

function normalizeId(value: string, label: string): string {
  if (typeof value !== 'string' || value.length === 0) throw new Error(label + ' must be a non-empty string');
  return value;
}

function normalizePath(path: string): string {
  if (!path) return '/';
  return path.startsWith('/') ? path : '/' + path;
}

function readString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function provenanceEdgeKind(kind: string): string {
  if (kind === 'caused-by' || kind === 'caused-by-action') return 'wasGeneratedBy';
  if (kind === 'allowed-by-policy' || kind === 'produced-by-effect') return 'used';
  if (kind === 'proven-by-test') return 'wasDerivedFrom';
  if (kind === 'child-of') return 'wasInformedBy';
  return kind;
}

function redactAny(value: unknown, keys: ReadonlySet<string>): unknown {
  if (Array.isArray(value)) return value.map((item) => redactAny(item, keys));
  if (!value || typeof value !== 'object') return value;
  const out: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(value)) out[key] = keys.has(key.toLowerCase()) ? '[redacted]' : redactAny(entry, keys);
  return out;
}

function stableStringify(value: unknown): string {
  return JSON.stringify(sortForJson(value));
}

function sortForJson(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortForJson);
  if (!value || typeof value !== 'object') return value;
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(value).sort()) out[key] = sortForJson((value as Record<string, unknown>)[key]);
  return out;
}

function hashString(value: string): string {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return 'fnv1a32:' + (hash >>> 0).toString(16).padStart(8, '0');
}
