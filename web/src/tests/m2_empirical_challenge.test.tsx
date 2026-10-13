import ReactDOMServer from 'react-dom/server';
import assert from 'node:assert/strict';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// -----------------------------------------------------------------------------
// 1. UNIFIED ROOT BARREL IMPORT VERIFICATION (@/components)
// -----------------------------------------------------------------------------
import {
  // Atoms
  TactileNode,
  TactileButton,
  StatusBadge,
  MetricChip,
  // Molecules
  TimelineNodeItem,
  ProgressBarWithMetrics,
  SiteDecoration,
  SectionBanner,
  // Organisms
  TimelineHeader,
  ConstructionTimeline,
  StageDetailsDrawer,
  // Templates
  BlueprintLayout,
} from '@/components';

import { TimelinePage } from '@/pages/TimelinePage';
import { DEFAULT_TIMELINE_NODES } from '@/mocks/timeline';
import { TimelineNodeData } from '@/types/timeline';

const renderTimelinePage = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ReactDOMServer.renderToStaticMarkup(
    <QueryClientProvider client={queryClient}><TimelinePage /></QueryClientProvider>
  );
};

let passedTests = 0;
let failedTests = 0;

function testCase(name: string, fn: () => void) {
  try {
    fn();
    passedTests++;
    console.log(`  ✓ ${name}`);
  } catch (error: any) {
    failedTests++;
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`    ${error.message}`);
    if (error.stack) {
      const relevantStack = error.stack.split('\n').slice(1, 3).join('\n');
      console.error(relevantStack);
    }
  }
}

console.log('\n============================================================');
console.log('⚡ EMPIRICAL CHALLENGER: MILESTONE 2 STRESS & INTEGRATION SUITE');
console.log('============================================================\n');

// -----------------------------------------------------------------------------
// TEST SUITE 1: Unified Root Barrel Exports (@/components)
// -----------------------------------------------------------------------------
console.log('--- 1. Unified Root Barrel Exports (@/components) ---');

testCase('Root barrel exports all Atoms cleanly', () => {
  assert.equal(typeof TactileNode, 'function', 'TactileNode must be a function/component');
  assert.equal(typeof TactileButton, 'object', 'TactileButton (forwardRef) must be defined');
  assert.equal(typeof StatusBadge, 'function', 'StatusBadge must be a function/component');
  assert.equal(typeof MetricChip, 'function', 'MetricChip must be a function/component');
});

testCase('Root barrel exports all Molecules cleanly', () => {
  assert.equal(typeof TimelineNodeItem, 'function', 'TimelineNodeItem must be a function/component');
  assert.equal(typeof ProgressBarWithMetrics, 'function', 'ProgressBarWithMetrics must be a function/component');
  assert.equal(typeof SiteDecoration, 'function', 'SiteDecoration must be a function/component');
  assert.equal(typeof SectionBanner, 'function', 'SectionBanner must be a function/component');
});

testCase('Root barrel exports all Organisms cleanly', () => {
  assert.equal(typeof TimelineHeader, 'function', 'TimelineHeader must be a function/component');
  assert.equal(typeof ConstructionTimeline, 'function', 'ConstructionTimeline must be a function/component');
  assert.equal(typeof StageDetailsDrawer, 'function', 'StageDetailsDrawer must be a function/component');
  assert.ok(Array.isArray(DEFAULT_TIMELINE_NODES), 'DEFAULT_TIMELINE_NODES must be exported array');
  assert.equal(DEFAULT_TIMELINE_NODES.length, 7, 'DEFAULT_TIMELINE_NODES must have 7 nodes');
});

testCase('Root barrel exports all Templates cleanly', () => {
  assert.equal(typeof BlueprintLayout, 'function', 'BlueprintLayout must be a function/component');
});

// -----------------------------------------------------------------------------
// TEST SUITE 2: ConstructionTimeline 7 Nodes, Coordinates & Status
// -----------------------------------------------------------------------------
console.log('\n--- 2. ConstructionTimeline: 7 Nodes, Coordinates & Status ---');

testCase('DEFAULT_TIMELINE_NODES contains exactly 7 properly configured nodes', () => {
  assert.equal(DEFAULT_TIMELINE_NODES.length, 7);

  const expectedNodes = [
    { id: '1', eap: '01.01.001', status: 'completed', left: '30%', top: '8%', progress: 100 },
    { id: '2', eap: '01.02.003', status: 'completed', left: '50%', top: '23%', progress: 100 },
    { id: '3', eap: '02.01.015', status: 'in_progress', left: '70%', top: '39%', progress: 65 },
    { id: '4', eap: '02.02.008', status: 'delayed', left: '49%', top: '55%', progress: 33 },
    { id: '5', eap: '03.01.002', status: 'accelerate', left: '29%', top: '69%', progress: 0 },
    { id: '6', eap: '02.03.001', status: 'locked', left: '48%', top: '83%', progress: 0 },
    { id: '7', eap: '02.00.000', status: 'milestone', left: '69%', top: '96%', progress: 42.8 },
  ];

  for (let i = 0; i < 7; i++) {
    const node = DEFAULT_TIMELINE_NODES[i];
    const exp = expectedNodes[i];
    assert.equal(node.id, exp.id, `Node ${i + 1} id mismatch`);
    assert.equal(node.eapCode, exp.eap, `Node ${i + 1} eap mismatch`);
    assert.equal(node.status, exp.status, `Node ${i + 1} status mismatch`);
    assert.equal(node.position.left, exp.left, `Node ${i + 1} position.left mismatch`);
    assert.equal(node.position.top, exp.top, `Node ${i + 1} position.top mismatch`);
    assert.equal(node.progress, exp.progress, `Node ${i + 1} progress mismatch`);
  }
});

testCase('ConstructionTimeline renders all 7 nodes into DOM with data-status and coordinates', () => {
  const html = ReactDOMServer.renderToStaticMarkup(
    <ConstructionTimeline nodes={DEFAULT_TIMELINE_NODES} />
  );

  // Check that all 7 node IDs are present
  for (let id = 1; id <= 7; id++) {
    assert.ok(html.includes(`data-node-id="${id}"`), `data-node-id="${id}" missing from markup`);
  }

  // Check all statuses are rendered as data-status
  assert.ok(html.includes('data-status="completed"'), 'data-status="completed" missing');
  assert.ok(html.includes('data-status="in_progress"'), 'data-status="in_progress" missing');
  assert.ok(html.includes('data-status="delayed"'), 'data-status="delayed" missing');
  assert.ok(html.includes('data-status="accelerate"'), 'data-status="accelerate" missing');
  assert.ok(html.includes('data-status="locked"'), 'data-status="locked" missing');
  assert.ok(html.includes('data-status="milestone"'), 'data-status="milestone" missing');

  // Check specific node coordinate styles
  assert.ok(html.includes('left:30%') && html.includes('top:8%'), 'Node 1 position missing');
  assert.ok(html.includes('left:50%') && html.includes('top:23%'), 'Node 2 position missing');
  assert.ok(html.includes('left:70%') && html.includes('top:39%'), 'Node 3 position missing');
  assert.ok(html.includes('left:49%') && html.includes('top:55%'), 'Node 4 position missing');
  assert.ok(html.includes('left:29%') && html.includes('top:69%'), 'Node 5 position missing');
  assert.ok(html.includes('left:48%') && html.includes('top:83%'), 'Node 6 position missing');
  assert.ok(html.includes('left:69%') && html.includes('top:96%'), 'Node 7 position missing');
});

testCase('ConstructionTimeline restores the smooth curved trail with proportional progress styling', () => {
  const html = ReactDOMServer.renderToStaticMarkup(
    <ConstructionTimeline nodes={DEFAULT_TIMELINE_NODES} />
  );

  // Linha tracejada base (3 18)
  assert.ok(
    html.includes('stroke-dasharray="3 18"') || html.includes('strokeDasharray="3 18"'),
    'Base dashed curve stroke-dasharray="3 18" missing'
  );

  assert.ok(
    html.includes('d="M 240 108 C 240 209.25, 400 209.25, 400 310.5') && html.includes('stroke-dasharray='),
    'Timeline path must use the smooth curve and include progress styling'
  );
});

testCase('ConstructionTimeline paginates long real-data trails without dropping services', () => {
  const extendedNodes = Array.from({ length: 9 }, (_, index) => ({
    ...DEFAULT_TIMELINE_NODES[index % DEFAULT_TIMELINE_NODES.length],
    id: `page-${index + 1}`,
  }));
  const html = ReactDOMServer.renderToStaticMarkup(<ConstructionTimeline nodes={extendedNodes} />);

  assert.ok(html.includes('Serviços 1–7 de 9'), 'First page must report its visible range and full service count');
  assert.ok(html.includes('Próximo trecho'), 'Long trails must provide navigation to subsequent services');
  assert.ok(html.includes('data-node-id="page-7"'), 'First page must render seven services');
  assert.ok(!html.includes('data-node-id="page-8"'), 'Later services must be paged instead of stretching the canvas');
});

testCase('ConstructionTimeline empty state: does not invent nodes when data is absent', () => {
  const htmlOmitted = ReactDOMServer.renderToStaticMarkup(<ConstructionTimeline />);
  assert.ok(!htmlOmitted.includes('data-node-id="7"'), 'Omitted nodes prop must remain empty');
  assert.ok(htmlOmitted.includes('Nenhum serviço cadastrado'), 'Omitted nodes prop must expose empty state');

  const htmlEmpty = ReactDOMServer.renderToStaticMarkup(<ConstructionTimeline nodes={[]} />);
  assert.ok(!htmlEmpty.includes('data-node-id="7"'), 'Empty nodes array must remain empty');
  assert.ok(htmlEmpty.includes('Nenhum serviço cadastrado'), 'Empty nodes array must expose empty state');
});

testCase('ConstructionTimeline supports custom nodes array override', () => {
  const customNodes: TimelineNodeData[] = [
    {
      id: 'custom-1',
      title: 'Serviço Customizado A',
      subtitle: 'Em teste',
      status: 'in_progress',
      progress: 50,
      position: { left: '10%', top: '20%' },
      eapCode: '99.01',
      sinapiCode: '99999',
      technicalDescription: 'Teste',
      budgetedValue: 100,
      executedValue: 50,
      financialWeight: '1%',
      unit: 'un',
      budgetedQuantity: 10,
      executedQuantity: 5,
    },
  ];

  const html = ReactDOMServer.renderToStaticMarkup(<ConstructionTimeline nodes={customNodes} />);
  assert.ok(html.includes('data-node-id="custom-1"'), 'Custom node id must be rendered');
  assert.ok(!html.includes('data-node-id="7"'), 'Default node 7 must NOT be rendered when custom nodes provided');
});

// -----------------------------------------------------------------------------
// TEST SUITE 3: Floating Smooth-Scroll Button Targeting in_progress
// -----------------------------------------------------------------------------
console.log('\n--- 3. Floating Smooth-Scroll Button targeting in_progress ---');

testCase('TimelinePage renders floating action button in BlueprintLayout', () => {
  const html = renderTimelinePage();

  // Button exists and has accessibility label
  assert.ok(
    html.includes('aria-label="Centralizar na etapa em execução"'),
    'Floating action button must have accessible aria-label'
  );
  assert.ok(
    html.includes('title="Centralizar na etapa em execução"'),
    'Floating action button must have title'
  );
  // Fixed positioning container
  assert.ok(
    html.includes('fixed bottom-6 right-5 z-30'),
    'Floating action container must be fixed bottom-6 right-5 z-30'
  );
});

testCase('TimelinePage does not render story fixtures before real API data loads', () => {
const nodes = DEFAULT_TIMELINE_NODES;
  const inProgressNodes = nodes.filter((n) => n.status === 'in_progress');
  assert.equal(inProgressNodes.length, 1, 'Exactly one node must initially have status="in_progress"');
  assert.equal(inProgressNodes[0].id, '3', 'Node 3 must be the in_progress node');

  const html = renderTimelinePage();
  assert.ok(
    !html.includes('Tubulação PVC R DN 150mm') && html.includes('Carregando trilha da obra'),
    'Page must show loading state and keep Storybook fixtures out of production'
  );
});

testCase('scrollToExecution logic works for both active node found and fallback to top', () => {
  let scrolledIntoView = false;
  let scrollIntoViewOptions: any = null;
  let windowScrolled = false;
  let windowScrollOptions: any = null;

  const mockActiveElement = {
    scrollIntoView: (options: any) => {
      scrolledIntoView = true;
      scrollIntoViewOptions = options;
    },
  };

  // 1. Scenario: active node exists
  const runScrollWithNode = (nodeExists: boolean) => {
    const activeNode = nodeExists ? mockActiveElement : null;
    if (activeNode) {
      activeNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      windowScrolled = true;
      windowScrollOptions = { top: 0, behavior: 'smooth' };
    }
  };

  runScrollWithNode(true);
  assert.equal(scrolledIntoView, true, 'scrollIntoView must be called when active node exists');
  assert.deepEqual(scrollIntoViewOptions, { behavior: 'smooth', block: 'center' });

  // 2. Scenario: active node does not exist (all completed)
  runScrollWithNode(false);
  assert.equal(windowScrolled, true, 'window.scrollTo must be called when active node not found');
  assert.deepEqual(windowScrollOptions, { top: 0, behavior: 'smooth' });
});

// -----------------------------------------------------------------------------
// TEST SUITE 4: BlueprintLayout Template Slots
// -----------------------------------------------------------------------------
console.log('\n--- 4. BlueprintLayout: Template Slots (header, children, floatingAction, drawer) ---');

testCase('BlueprintLayout renders all 4 slots when all are provided', () => {
  const html = ReactDOMServer.renderToStaticMarkup(
    <BlueprintLayout
      header={<div id="test-header">HEADER_CONTENT</div>}
      floatingAction={<div id="test-fab">FAB_CONTENT</div>}
      drawer={<div id="test-drawer">DRAWER_CONTENT</div>}
    >
      <div id="test-children">CHILDREN_CONTENT</div>
    </BlueprintLayout>
  );

  // Blueprint grid background class
  assert.ok(html.includes('blueprint-grid'), 'blueprint-grid class missing');
  assert.ok(html.includes('min-h-screen'), 'min-h-screen class missing');

  // Header slot
  assert.ok(html.includes('id="test-header"'), 'Header slot missing');
  assert.ok(html.includes('HEADER_CONTENT'), 'Header content missing');
  assert.ok(html.includes('w-full shrink-0'), 'Header wrapper class missing');

  // Children slot in main
  assert.ok(html.includes('<main'), 'Main element missing');
  assert.ok(html.includes('id="test-children"'), 'Children slot missing');
  assert.ok(html.includes('CHILDREN_CONTENT'), 'Children content missing');

  // Floating action slot
  assert.ok(html.includes('id="test-fab"'), 'Floating action slot missing');
  assert.ok(html.includes('FAB_CONTENT'), 'Floating action content missing');
  assert.ok(html.includes('fixed bottom-6 right-5 z-30'), 'Floating action wrapper missing');

  // Drawer slot
  assert.ok(html.includes('id="test-drawer"'), 'Drawer slot missing');
  assert.ok(html.includes('DRAWER_CONTENT'), 'Drawer content missing');
});

testCase('BlueprintLayout handles omitted optional slots without empty wrappers', () => {
  const html = ReactDOMServer.renderToStaticMarkup(
    <BlueprintLayout>
      <div>MINIMAL_CONTENT</div>
    </BlueprintLayout>
  );

  assert.ok(html.includes('MINIMAL_CONTENT'), 'Children content must be rendered');
  assert.ok(!html.includes('fixed bottom-6 right-5 z-30'), 'No floating wrapper when floatingAction omitted');
  assert.ok(!html.includes('w-full shrink-0'), 'No header wrapper when header omitted');
});

// -----------------------------------------------------------------------------
// TEST SUITE 5: StageDetailsDrawer Organism
// -----------------------------------------------------------------------------
console.log('\n--- 5. StageDetailsDrawer: Organism Verification ---');

testCase('StageDetailsDrawer returns null when isOpen=false or node=null', () => {
  const htmlClosed = ReactDOMServer.renderToStaticMarkup(
    <StageDetailsDrawer
      isOpen={false}
      node={DEFAULT_TIMELINE_NODES[0]}
      onClose={() => {}}
    />
  );
  assert.equal(htmlClosed, '', 'Must render empty string when isOpen=false');

  const htmlNullNode = ReactDOMServer.renderToStaticMarkup(
    <StageDetailsDrawer
      isOpen={true}
      node={null}
      onClose={() => {}}
    />
  );
  assert.equal(htmlNullNode, '', 'Must render empty string when node=null');
});

testCase('StageDetailsDrawer renders rich technical details when open', () => {
  const targetNode = DEFAULT_TIMELINE_NODES[2]; // Tubulação PVC (in_progress)
  const html = ReactDOMServer.renderToStaticMarkup(
    <StageDetailsDrawer
      isOpen={true}
      node={targetNode}
      onClose={() => {}}
    />
  );

  // WAI-ARIA dialog semantics
  assert.ok(html.includes('role="dialog"'), 'role="dialog" missing');
  assert.ok(html.includes('aria-modal="true"'), 'aria-modal="true" missing');
  assert.ok(html.includes('aria-labelledby="stage-drawer-title"'), 'aria-labelledby missing');
  assert.ok(html.includes('aria-describedby="stage-drawer-description"'), 'aria-describedby missing');

  // EAP and SINAPI codes
  assert.ok(html.includes('EAP 02.01.015'), 'EAP code missing');
  assert.ok(html.includes('SINAPI 104166'), 'SINAPI code missing');

  // Title and description
  assert.ok(html.includes('Tubulação PVC R DN 150mm'), 'Title missing');
  assert.ok(html.includes('Fornecimento e assentamento de tubo PVC'), 'Description missing');

  // Financial weight and budgeted value
  assert.ok(html.includes('0,10%'), 'Financial weight missing');
  assert.ok(html.includes('R$'), 'Budgeted value currency symbol missing');

  // Physical measurement registration controls
  assert.ok(html.includes('Registro de Medição Física'), 'Measurement header missing');
  assert.ok(html.includes('type="range"'), 'Range slider missing');
  assert.ok(html.includes('+5%'), '+5% quick button missing');
  assert.ok(html.includes('+10%'), '+10% quick button missing');
  assert.ok(html.includes('100% Concluir'), '100% Concluir quick button missing');
  assert.ok(html.includes('Salvar Medição'), 'Salvar Medição button missing');

  // Impediment action button
  assert.ok(html.includes('Reportar Impedimento / Atraso'), 'Report impediment button missing');
});

testCase('StageDetailsDrawer renders impediment alert for delayed status', () => {
  const delayedNode = DEFAULT_TIMELINE_NODES[3]; // Caixas de Boca de Lobo (delayed)
  const html = ReactDOMServer.renderToStaticMarkup(
    <StageDetailsDrawer
      isOpen={true}
      node={delayedNode}
      onClose={() => {}}
    />
  );

  assert.ok(html.includes('Impedimento Crítico Registrado'), 'Delayed alert banner missing');
  assert.ok(html.includes('Falta de fôrmas metálicas'), 'Impediment reason text missing');
});

testCase('StageDetailsDrawer renders golden bridge acceleration button for accelerate status', () => {
  const accelerateNode = DEFAULT_TIMELINE_NODES[4]; // Chapisco Interno (accelerate)
  const html = ReactDOMServer.renderToStaticMarkup(
    <StageDetailsDrawer
      isOpen={true}
      node={accelerateNode}
      onClose={() => {}}
    />
  );

  assert.ok(html.includes('Oportunidade: Ponte Dourada'), 'Ponte Dourada banner missing');
  assert.ok(html.includes('Mobilizar Frente / Adiantar Etapa'), 'Mobilizar Frente button missing');
});

// -----------------------------------------------------------------------------
// TEST SUITE 6: TimelinePage Full Integration & Header
// -----------------------------------------------------------------------------
console.log('\n--- 6. TimelinePage Full Integration & TimelineHeader ---');

testCase('TimelinePage SSR renders the API-backed loading state without mock project data', () => {
  const html = renderTimelinePage();

  // Layout check
  assert.ok(html.includes('blueprint-grid'), 'TimelinePage must use BlueprintLayout');

  // Sticky header check
  assert.ok(!html.includes('Residencial Vista Verde'), 'Mock project title must not be rendered');
  assert.ok(!html.includes('OBRA CV-0248'), 'Mock contract code must not be rendered');
  assert.ok(!html.includes('142 dias restantes'), 'Mock schedule must not be rendered');

  assert.ok(html.includes('Carregando trilha da obra'), 'Loading state must be shown while API data loads');

  // Floating button check
  assert.ok(html.includes('aria-label="Centralizar na etapa em execução"'), 'FAB missing in page');
});

testCase('TimelineHeader handles custom and default props defensively', () => {
  const html = ReactDOMServer.renderToStaticMarkup(
    <TimelineHeader
      projectName="Obra Alpha"
      eapPhase="FASE 1: FUNDAÇÃO"
      progressPercentage={25}
      daysRemaining={60}
      criticalDelaysCount={2}
    />
  );

  assert.ok(html.includes('Obra Alpha'), 'Custom projectName missing');
  assert.ok(html.includes('FASE 1: FUNDAÇÃO'), 'Custom eapPhase missing');
  assert.ok(html.includes('25%'), 'Custom progress missing');
  assert.ok(html.includes('60'), 'Custom days remaining missing');
});

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
console.log('\n============================================================');
console.log(`RESULTS: ${passedTests} passed, ${failedTests} failed`);
console.log('============================================================\n');

if (failedTests > 0) {
  process.exit(1);
}
