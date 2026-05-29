import {
  compileHistoryTimeline,
  createHistoryTimeline,
  explainFieldChange,
  planHistoryUndo,
  type FrontierHistoryExplanation,
  type FrontierHistoryTimeline,
  type FrontierHistoryUndoPlan
} from '../src/index.js';

const timeline: FrontierHistoryTimeline = createHistoryTimeline({
  records: [{
    id: 'record:1',
    action: 'action.save',
    patches: [{ path: '/value', value: 1, oldValue: 0 }]
  }]
});

const compiled = compileHistoryTimeline(timeline);
const explanation: FrontierHistoryExplanation = explainFieldChange(compiled, { path: '/value' });
const undo: FrontierHistoryUndoPlan = planHistoryUndo(compiled, { scope: 'path', target: '/value' });

void explanation;
void undo;
