import ReactDOMServer from 'react-dom/server';
import assert from 'node:assert/strict';

// Import Atoms
import {
  TactileNode,
  TactileButton,
  StatusBadge,
  MetricChip,
  NodeSize,
} from '@/components/atoms';

// Import Molecules
import {
  TimelineNodeItem,
  ProgressBarWithMetrics,
  SiteDecoration,
  SectionBanner,
} from '@/components/molecules';

// Import Types
import { NodeStatus, TimelineNodeData, DecorationType } from '@/types/timeline';

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
console.log('⚡ EMPIRICAL CHALLENGER: MILESTONE 1 STRESS TEST SUITE');
console.log('============================================================\n');

// -----------------------------------------------------------------------------
// 1. TACTILE NODE: All NodeStatus Enum Variants & Styling
// -----------------------------------------------------------------------------
console.log('--- 1. TactileNode: All NodeStatus Enum Variants ---');

const ALL_STATUSES: NodeStatus[] = [
  'completed',
  'in_progress',
  'delayed',
  'accelerate',
  'locked',
  'milestone',
];

for (const status of ALL_STATUSES) {
  testCase(`TactileNode renders status "${status}" with correct classes and styles`, () => {
    const html = ReactDOMServer.renderToStaticMarkup(
      <TactileNode status={status} />
    );

    assert.ok(html.includes('node-tactile'), 'Must have .node-tactile class');
    assert.ok(html.includes('--node-color'), 'Must define --node-color style');
    assert.ok(html.includes('--node-depth'), 'Must define --node-depth style');
    assert.ok(html.includes('<svg'), 'Must render Lucide icon SVG');

    // Specific status checks
    if (status === 'in_progress') {
      assert.ok(html.includes('active-pulse'), 'in_progress must have active-pulse class');
      assert.ok(html.includes('size-20'), 'in_progress default size must be lg (size-20)');
      assert.ok(html.includes('stroke-dasharray'), 'in_progress must have SVG progress ring');
    } else if (status === 'completed') {
      assert.ok(html.includes('size-16'), 'completed default size must be md (size-16)');
      assert.ok(html.includes('text-primary-foreground'), 'completed text color');
    } else if (status === 'delayed') {
      assert.ok(html.includes('#991b1b'), 'delayed depth color');
      assert.ok(html.includes('text-white'), 'delayed text color');
    } else if (status === 'accelerate') {
      assert.ok(html.includes('#b45309'), 'accelerate depth color');
      assert.ok(html.includes('var(--gold)'), 'accelerate gold color');
    } else if (status === 'locked') {
      assert.ok(html.includes('var(--concrete)'), 'locked concrete color');
    } else if (status === 'milestone') {
      assert.ok(html.includes('size-20'), 'milestone default size must be lg (size-20)');
    }
  });
}

testCase('TactileNode size overrides (sm, md, lg)', () => {
  const sizes: NodeSize[] = ['sm', 'md', 'lg'];
  const expectedClasses = { sm: 'size-12', md: 'size-16', lg: 'size-20' };

  for (const s of sizes) {
    const html = ReactDOMServer.renderToStaticMarkup(
      <TactileNode status="completed" size={s} />
    );
    assert.ok(html.includes(expectedClasses[s]), `Size ${s} must have class ${expectedClasses[s]}`);
  }
});

testCase('TactileNode customColor and customDepth overrides', () => {
  const html = ReactDOMServer.renderToStaticMarkup(
    <TactileNode
      status="completed"
      customColor="#123456"
      customDepth="#654321"
    />
  );
  assert.ok(html.includes('--node-color:#123456'), 'Custom color applied to style');
  assert.ok(html.includes('--node-depth:#654321'), 'Custom depth applied to style');
});

testCase('TactileNode isSelected applies highlight ring', () => {
  const normalHtml = ReactDOMServer.renderToStaticMarkup(
    <TactileNode status="completed" isSelected={false} />
  );
  const selectedHtml = ReactDOMServer.renderToStaticMarkup(
    <TactileNode status="completed" isSelected={true} />
  );

  assert.ok(!normalHtml.includes('ring-action'), 'Unselected node should not have ring-action');
  assert.ok(selectedHtml.includes('ring-4 ring-action ring-offset-2'), 'Selected node must have ring-action');
});

testCase('TactileNode activePulse / isPulsing props force pulse animation', () => {
  const defaultLocked = ReactDOMServer.renderToStaticMarkup(
    <TactileNode status="locked" />
  );
  assert.ok(!defaultLocked.includes('active-pulse'), 'Locked node should not pulse by default');

  const pulsingLocked = ReactDOMServer.renderToStaticMarkup(
    <TactileNode status="locked" activePulse={true} />
  );
  assert.ok(pulsingLocked.includes('active-pulse'), 'activePulse={true} must force active-pulse class');

  const isPulsingLocked = ReactDOMServer.renderToStaticMarkup(
    <TactileNode status="locked" isPulsing={true} />
  );
  assert.ok(isPulsingLocked.includes('active-pulse'), 'isPulsing={true} must force active-pulse class');
});

testCase('TactileNode custom icon override', () => {
  const customIconHtml = ReactDOMServer.renderToStaticMarkup(
    <TactileNode status="completed" icon={<span id="custom-trophy">CUSTOM</span>} />
  );
  assert.ok(customIconHtml.includes('id="custom-trophy"'), 'Custom icon must replace default icon');
  assert.ok(customIconHtml.includes('CUSTOM'));
});

// -----------------------------------------------------------------------------
// 2. PROGRESS CORNER CASES: 0%, 100%, undefined, negative, >100, extreme
// -----------------------------------------------------------------------------
console.log('\n--- 2. Corner Cases: Progress Bounds & Edge Values ---');

testCase('TactileNode progress = 0%', () => {
  const inProgressHtml = ReactDOMServer.renderToStaticMarkup(
    <TactileNode status="in_progress" progress={0} />
  );
  assert.ok(inProgressHtml.includes('stroke-dasharray="0 100"'), 'Ring dasharray must be 0 100');

  const completedHtml = ReactDOMServer.renderToStaticMarkup(
    <TactileNode status="completed" progress={0} />
  );
  assert.ok(!completedHtml.includes('stroke-dasharray'), 'Non in_progress node with progress=0 should omit ring');
});

testCase('TactileNode progress = 100%', () => {
  const html = ReactDOMServer.renderToStaticMarkup(
    <TactileNode status="in_progress" progress={100} />
  );
  assert.ok(html.includes('stroke-dasharray="100 100"'), 'Ring dasharray must be 100 100');
});

testCase('TactileNode progress = undefined', () => {
  const inProgressHtml = ReactDOMServer.renderToStaticMarkup(
    <TactileNode status="in_progress" />
  );
  assert.ok(inProgressHtml.includes('stroke-dasharray="65 100"'), 'Default fallback progress is 65');

  const lockedHtml = ReactDOMServer.renderToStaticMarkup(
    <TactileNode status="locked" />
  );
  assert.ok(!lockedHtml.includes('stroke-dasharray'), 'Locked node without progress has no ring');
});

testCase('TactileNode extreme negative progress (-50, -9999) clamped safely to 0', () => {
  const negHtml = ReactDOMServer.renderToStaticMarkup(
    <TactileNode status="in_progress" progress={-50} />
  );
  assert.ok(negHtml.includes('stroke-dasharray="0 100"'), 'Negative progress must be clamped to 0');

  const extremeNegHtml = ReactDOMServer.renderToStaticMarkup(
    <TactileNode status="in_progress" progress={-9999} />
  );
  assert.ok(extremeNegHtml.includes('stroke-dasharray="0 100"'), 'Extreme negative progress must be clamped to 0');
});

testCase('TactileNode extreme over-progress (>100: 150, 9999) clamped safely to 100', () => {
  const overHtml = ReactDOMServer.renderToStaticMarkup(
    <TactileNode status="in_progress" progress={150} />
  );
  assert.ok(overHtml.includes('stroke-dasharray="100 100"'), 'Progress > 100 must be clamped to 100');

  const extremeOverHtml = ReactDOMServer.renderToStaticMarkup(
    <TactileNode status="in_progress" progress={9999} />
  );
  assert.ok(extremeOverHtml.includes('stroke-dasharray="100 100"'), 'Progress 9999 must be clamped to 100');
});

testCase('ProgressBarWithMetrics corner cases (0%, 100%, -20%, 150%)', () => {
  // 0%
  const zeroHtml = ReactDOMServer.renderToStaticMarkup(
    <ProgressBarWithMetrics progressPercentage={0} daysRemaining={30} />
  );
  assert.ok(zeroHtml.includes('aria-valuenow="0"'), 'aria-valuenow is 0');
  assert.ok(zeroHtml.includes('style="width:0%"'), 'width is 0%');

  // 100%
  const hundredHtml = ReactDOMServer.renderToStaticMarkup(
    <ProgressBarWithMetrics progressPercentage={100} daysRemaining={0} />
  );
  assert.ok(hundredHtml.includes('aria-valuenow="100"'), 'aria-valuenow is 100');
  assert.ok(hundredHtml.includes('style="width:100%"'), 'width is 100%');

  // Negative clamp
  const negHtml = ReactDOMServer.renderToStaticMarkup(
    <ProgressBarWithMetrics progressPercentage={-25} daysRemaining={30} />
  );
  assert.ok(negHtml.includes('aria-valuenow="0"'), 'Negative clamped to 0');
  assert.ok(negHtml.includes('style="width:0%"'), 'Negative width clamped to 0%');

  // Overflow clamp
  const overHtml = ReactDOMServer.renderToStaticMarkup(
    <ProgressBarWithMetrics progressPercentage={175} daysRemaining={0} />
  );
  assert.ok(overHtml.includes('aria-valuenow="100"'), 'Over 100 clamped to 100');
  assert.ok(overHtml.includes('style="width:100%"'), 'Over 100 width clamped to 100%');

  // Fractional progress formatted properly
  const floatHtml = ReactDOMServer.renderToStaticMarkup(
    <ProgressBarWithMetrics progressPercentage={42.7} daysRemaining={15} />
  );
  assert.ok(floatHtml.includes('42,7%') || floatHtml.includes('42.7%'), 'Formatted float percentage');
});

testCase('ProgressBarWithMetrics critical alerts count pluralization and fallback', () => {
  // 0 alerts: chip omitted
  const zeroAlerts = ReactDOMServer.renderToStaticMarkup(
    <ProgressBarWithMetrics progressPercentage={50} daysRemaining={10} criticalDelaysCount={0} />
  );
  assert.ok(!zeroAlerts.includes('crítica atrasada'), 'No alert chip when count is 0');

  // 1 alert: singular "etapa crítica atrasada"
  const oneAlert = ReactDOMServer.renderToStaticMarkup(
    <ProgressBarWithMetrics progressPercentage={50} daysRemaining={10} criticalDelaysCount={1} />
  );
  assert.ok(oneAlert.includes('1 etapa crítica atrasada'), 'Singular alert text');

  // Multiple alerts: plural "etapas críticas atrasadas"
  const multiAlerts = ReactDOMServer.renderToStaticMarkup(
    <ProgressBarWithMetrics progressPercentage={50} daysRemaining={10} criticalDelaysCount={3} />
  );
  assert.ok(multiAlerts.includes('3 etapas críticas atrasadas'), 'Plural alerts text');

  // criticalStagesCount alias
  const aliasAlerts = ReactDOMServer.renderToStaticMarkup(
    <ProgressBarWithMetrics progressPercentage={50} daysRemaining={10} criticalStagesCount={2} />
  );
  assert.ok(aliasAlerts.includes('2 etapas críticas atrasadas'), 'criticalStagesCount alias works');
});

// -----------------------------------------------------------------------------
// 3. TACTILE BUTTON: States, Loading, Disabled, Microinteractions
// -----------------------------------------------------------------------------
console.log('\n--- 3. TactileButton: States, Loading, Disabled, Microinteractions ---');

testCase('TactileButton normal enabled state', () => {
  const html = ReactDOMServer.renderToStaticMarkup(
    <TactileButton variant="primary">Confirmar</TactileButton>
  );
  assert.ok(html.includes('type="button"'), 'Default button type="button"');
  assert.ok(!html.includes('disabled=""'), 'Must not be disabled');
  assert.ok(html.includes('aria-busy="false"'), 'aria-busy is false');
  assert.ok(html.includes('shadow-tactile'), 'Primary variant shadow-tactile');
  assert.ok(html.includes('active:translate-y-1 active:shadow-none'), 'Microinteraction active classes');
  assert.ok(html.includes('hover:-translate-y-0.5'), 'Microinteraction hover class');
  assert.ok(html.includes('Confirmar'), 'Children text rendered');
});

testCase('TactileButton disabled state', () => {
  const html = ReactDOMServer.renderToStaticMarkup(
    <TactileButton variant="primary" disabled>Desabilitado</TactileButton>
  );
  assert.ok(html.includes('disabled=""'), 'Disabled attribute present');
  assert.ok(html.includes('opacity-50 cursor-not-allowed pointer-events-none'), 'Disabled styling classes');
});

testCase('TactileButton loading state with Loader2 spinner', () => {
  // Test loading=true
  const loadingHtml = ReactDOMServer.renderToStaticMarkup(
    <TactileButton loading leftIcon={<span id="left-icon">Left</span>}>Processando</TactileButton>
  );
  assert.ok(loadingHtml.includes('disabled=""'), 'Loading button must be disabled');
  assert.ok(loadingHtml.includes('aria-busy="true"'), 'aria-busy must be true');
  assert.ok(loadingHtml.includes('animate-spin'), 'Loader2 spinner must have animate-spin');
  assert.ok(!loadingHtml.includes('id="left-icon"'), 'leftIcon must be replaced by spinner when loading');

  // Test isLoading=true compatibility prop
  const isLoadingHtml = ReactDOMServer.renderToStaticMarkup(
    <TactileButton isLoading rightIcon={<span id="right-icon">Right</span>}>Salvando</TactileButton>
  );
  assert.ok(isLoadingHtml.includes('aria-busy="true"'), 'isLoading sets aria-busy="true"');
  assert.ok(isLoadingHtml.includes('animate-spin'), 'Spinner rendered');
  assert.ok(!isLoadingHtml.includes('id="right-icon"'), 'rightIcon hidden when loading');
});

testCase('TactileButton all variant classes and microinteraction styles', () => {
  const variants = ['primary', 'action', 'outline', 'ghost', 'warning', 'gold'] as const;

  for (const variant of variants) {
    const html = ReactDOMServer.renderToStaticMarkup(
      <TactileButton variant={variant}>{variant}</TactileButton>
    );

    if (variant === 'primary') {
      assert.ok(html.includes('bg-primary') && html.includes('shadow-tactile'));
      assert.ok(html.includes('active:translate-y-1 active:shadow-none'));
    } else if (variant === 'action') {
      assert.ok(html.includes('bg-action') && html.includes('shadow-action'));
      assert.ok(html.includes('active:translate-y-1 active:shadow-none'));
    } else if (variant === 'outline') {
      assert.ok(html.includes('border-input') && html.includes('active:translate-y-0.5'));
    } else if (variant === 'ghost') {
      assert.ok(html.includes('bg-transparent') && html.includes('hover:bg-muted'));
    } else if (variant === 'warning') {
      assert.ok(html.includes('bg-warning') && html.includes('shadow-tactile'));
      assert.ok(html.includes('active:translate-y-1 active:shadow-none'));
    } else if (variant === 'gold') {
      assert.ok(html.includes('bg-gold') && html.includes('shadow-gold'));
      assert.ok(html.includes('active:translate-y-1 active:shadow-none'));
    }
  }
});

testCase('TactileButton size variants (sm, md, lg, icon)', () => {
  const smHtml = ReactDOMServer.renderToStaticMarkup(<TactileButton size="sm">SM</TactileButton>);
  assert.ok(smHtml.includes('px-2.5 py-1 text-xs'));

  const mdHtml = ReactDOMServer.renderToStaticMarkup(<TactileButton size="md">MD</TactileButton>);
  assert.ok(mdHtml.includes('px-4 py-2 text-sm'));

  const lgHtml = ReactDOMServer.renderToStaticMarkup(<TactileButton size="lg">LG</TactileButton>);
  assert.ok(lgHtml.includes('px-6 py-3 text-base'));

  const iconHtml = ReactDOMServer.renderToStaticMarkup(<TactileButton size="icon">★</TactileButton>);
  assert.ok(iconHtml.includes('size-10 sm:size-12 p-0 grid place-items-center rounded-full'));
});

// -----------------------------------------------------------------------------
// 4. STATUS BADGE: Variants, Floating, Icons, Duplicate Guard
// -----------------------------------------------------------------------------
console.log('\n--- 4. StatusBadge: Variants & Micro-behaviors ---');

testCase('StatusBadge all variants and default labels', () => {
  const badgeVariants = [
    'in_progress',
    'accelerate',
    'completed',
    'delayed',
    'locked',
    'milestone',
    'gold',
    'warning',
    'primary',
    'success',
  ] as const;

  for (const v of badgeVariants) {
    const html = ReactDOMServer.renderToStaticMarkup(<StatusBadge variant={v} />);
    assert.ok(html.includes('<span'), `Must render span for variant ${v}`);
    if (v === 'accelerate' || v === 'gold') {
      assert.ok(html.includes('ADIANTAR!'), 'accelerate/gold has ADIANTAR!');
      assert.ok(html.includes('gold-float'), 'accelerate/gold has gold-float animation');
    } else if (v === 'in_progress' || v === 'primary') {
      assert.ok(html.includes('EM EXECUÇÃO'));
    } else if (v === 'completed' || v === 'success') {
      assert.ok(html.includes('CONCLUÍDO'));
    } else if (v === 'delayed' || v === 'warning') {
      assert.ok(html.includes('ATRASADA'));
    } else if (v === 'locked') {
      assert.ok(html.includes('BLOQUEADO'));
    } else if (v === 'milestone') {
      assert.ok(html.includes('MARCO'));
    }
  }
});

testCase('StatusBadge duplicate icon guard when text contains ⚡', () => {
  const withEmoji = ReactDOMServer.renderToStaticMarkup(
    <StatusBadge variant="accelerate" label="⚡ ADIANTAR!" />
  );
  const svgCount = (withEmoji.match(/<svg/g) || []).length;
  assert.equal(svgCount, 0, 'No redundant SVG Zap icon when text has ⚡ emoji');

  const withoutEmoji = ReactDOMServer.renderToStaticMarkup(
    <StatusBadge variant="accelerate" label="ADIANTAR AGORA" />
  );
  assert.ok(withoutEmoji.includes('<svg'), 'SVG Zap icon rendered when text lacks ⚡ emoji');
});

// -----------------------------------------------------------------------------
// 5. METRIC CHIP: Variants, Keyboard Accessibility
// -----------------------------------------------------------------------------
console.log('\n--- 5. MetricChip: Variants & Accessibility ---');

testCase('MetricChip non-interactive vs interactive accessibility', () => {
  const staticHtml = ReactDOMServer.renderToStaticMarkup(
    <MetricChip label="Dias restantes" value={45} />
  );
  assert.ok(!staticHtml.includes('role="button"'), 'Static chip must not have role="button"');
  assert.ok(!staticHtml.includes('tabindex="0"'), 'Static chip must not have tabIndex');

  const interactiveHtml = ReactDOMServer.renderToStaticMarkup(
    <MetricChip label="Alerta crítico" value={1} onClick={() => {}} />
  );
  assert.ok(interactiveHtml.includes('role="button"'), 'Interactive chip must have role="button"');
  assert.ok(interactiveHtml.includes('tabindex="0"'), 'Interactive chip must have tabindex="0"');
  assert.ok(interactiveHtml.includes('cursor-pointer'), 'Interactive chip must have cursor-pointer');
});

testCase('MetricChip variants (neutral, default, primary, warning, success, action, header-strip)', () => {
  const variants = ['neutral', 'default', 'primary', 'warning', 'success', 'action', 'header-strip'] as const;

  for (const v of variants) {
    const html = ReactDOMServer.renderToStaticMarkup(
      <MetricChip variant={v} label={`Metric ${v}`} value={123} />
    );
    assert.ok(html.includes(`Metric ${v}`), `Renders label for ${v}`);
    assert.ok(html.includes('123'), `Renders value for ${v}`);
    if (v === 'header-strip') {
      assert.ok(html.includes('bg-transparent text-primary-foreground'));
    }
  }
});

// -----------------------------------------------------------------------------
// 6. TIMELINE NODE ITEM: Composition, ARIA, Badges, Subtitles
// -----------------------------------------------------------------------------
console.log('\n--- 6. TimelineNodeItem: Composition & ARIA Dialog ---');

const mockNode = (status: NodeStatus, badge?: string | { text: string; variant?: any }): TimelineNodeData => ({
  id: `node-${status}`,
  eapCode: '02.01.015',
  title: `Serviço ${status}`,
  subtitle: '65% executado • 32m de 50m',
  status,
  progress: status === 'completed' ? 100 : status === 'locked' ? 0 : 65,
  position: { left: '30%', top: '25%' },
  badge,
});

testCase('TimelineNodeItem dialog accessibility attributes', () => {
  const unselectedHtml = ReactDOMServer.renderToStaticMarkup(
    <TimelineNodeItem node={mockNode('in_progress')} isSelected={false} />
  );
  assert.ok(unselectedHtml.includes('aria-haspopup="dialog"'), 'Must have aria-haspopup="dialog"');
  assert.ok(unselectedHtml.includes('aria-expanded="false"'), 'Unselected has aria-expanded="false"');
  assert.ok(unselectedHtml.includes('aria-label="Abrir detalhes de Serviço in_progress: status in_progress, 65% executado"'));

  const selectedHtml = ReactDOMServer.renderToStaticMarkup(
    <TimelineNodeItem node={mockNode('in_progress')} isSelected={true} />
  );
  assert.ok(selectedHtml.includes('aria-expanded="true"'), 'Selected has aria-expanded="true"');
});

testCase('TimelineNodeItem positioning style from node.position', () => {
  const html = ReactDOMServer.renderToStaticMarkup(
    <TimelineNodeItem node={mockNode('completed')} />
  );
  assert.ok(html.includes('left:30%'), 'Left position style');
  assert.ok(html.includes('top:25%'), 'Top position style');
  assert.ok(html.includes('-translate-x-1/2 -translate-y-1/2'), 'Centering translation classes');
});

testCase('TimelineNodeItem subtitle color variation per status', () => {
  const delayedHtml = ReactDOMServer.renderToStaticMarkup(
    <TimelineNodeItem node={mockNode('delayed')} />
  );
  assert.ok(delayedHtml.includes('text-warning'), 'Delayed node subtitle must be text-warning');

  const accelerateHtml = ReactDOMServer.renderToStaticMarkup(
    <TimelineNodeItem node={mockNode('accelerate')} />
  );
  assert.ok(accelerateHtml.includes('text-action-deep'), 'Accelerate node subtitle must be text-action-deep');

  const completedHtml = ReactDOMServer.renderToStaticMarkup(
    <TimelineNodeItem node={mockNode('completed')} />
  );
  assert.ok(completedHtml.includes('text-muted-foreground'), 'Default node subtitle must be text-muted-foreground');
});

testCase('TimelineNodeItem badge variations (string, object, default)', () => {
  // String badge
  const strBadgeHtml = ReactDOMServer.renderToStaticMarkup(
    <TimelineNodeItem node={mockNode('delayed', 'EM ATRASO')} />
  );
  assert.ok(strBadgeHtml.includes('EM ATRASO'), 'String badge rendered');

  // Object badge
  const objBadgeHtml = ReactDOMServer.renderToStaticMarkup(
    <TimelineNodeItem node={mockNode('delayed', { text: 'CRÍTICO!', variant: 'warning' })} />
  );
  assert.ok(objBadgeHtml.includes('CRÍTICO!'), 'Object badge rendered');

  // Default badge for in_progress
  const inProgHtml = ReactDOMServer.renderToStaticMarkup(
    <TimelineNodeItem node={mockNode('in_progress')} />
  );
  assert.ok(inProgHtml.includes('EM EXECUÇÃO'), 'Default in_progress badge rendered');

  // Default badge for accelerate
  const accelHtml = ReactDOMServer.renderToStaticMarkup(
    <TimelineNodeItem node={mockNode('accelerate')} />
  );
  assert.ok(accelHtml.includes('ADIANTAR!'), 'Default accelerate badge rendered');
});

testCase('TimelineNodeItem selection callback on click', () => {
  let selectedNode: any = null;
  const targetNode = mockNode('in_progress');

  const element = (
    <TimelineNodeItem
      node={targetNode}
      onSelect={(n) => {
        selectedNode = n;
      }}
    />
  );

  const rendered = (element.type as any)(element.props);
  const button = rendered.props.children;
  button.props.onClick();

  assert.equal(selectedNode?.id, 'node-in_progress', 'onSelect must pass the node data');
});

// -----------------------------------------------------------------------------
// 7. SITE DECORATION & SECTION BANNER
// -----------------------------------------------------------------------------
console.log('\n--- 7. SiteDecoration & SectionBanner ---');

testCase('SiteDecoration renders all decoration types with aria-hidden', () => {
  const types: DecorationType[] = [
    'epi-sign',
    'front-office',
    'support-zone',
    'survey-pin',
    'material-pallets',
    'epi',
    'front',
    'support',
    'landmark',
    'materials',
  ];

  for (const t of types) {
    const html = ReactDOMServer.renderToStaticMarkup(
      <SiteDecoration
        decoration={{
          id: `dec-${t}`,
          type: t,
          position: { top: '10%', left: '5%' },
          title: `Title ${t}`,
        }}
      />
    );
    assert.ok(html.includes('aria-hidden="true"'), 'SiteDecoration must have aria-hidden="true"');
    assert.ok(html.includes('pointer-events-none'), 'SiteDecoration must have pointer-events-none');
    assert.ok(html.includes('hidden lg:block'), 'SiteDecoration responsive class');

    // Specific type assertions
    if (t === 'epi-sign' || t === 'epi') {
      assert.ok(html.includes('<svg'), 'EPI must render HardHat SVG');
    } else if (t === 'front-office' || t === 'front') {
      assert.ok(html.includes('border-primary bg-card'), 'Front office must render card placard');
    } else if (t === 'support-zone' || t === 'support') {
      assert.ok(html.includes('<svg'), 'Support zone must render Construction SVG');
    } else if (t === 'survey-pin' || t === 'landmark') {
      assert.ok(html.includes('<svg'), 'Landmark pin must render MapPin SVG');
    } else if (t === 'material-pallets' || t === 'materials') {
      assert.ok(html.includes('<svg'), 'Materials pallets must render Box SVGs');
    }
  }
});

testCase('SectionBanner composition and 3-column stats strip', () => {
  let memorialClicked = false;
  const html = ReactDOMServer.renderToStaticMarkup(
    <SectionBanner
      tag="MACROETAPA ATUAL"
      title="SEÇÃO 2: INFRAESTRUTURA"
      description="Descrição dos serviços"
      stats={{
        totalServices: 10,
        completedServices: 4,
        criticalAlerts: 2,
      }}
      onMemorialClick={() => {
        memorialClicked = true;
      }}
    />
  );

  assert.ok(html.includes('SEÇÃO 2: INFRAESTRUTURA'), 'Title rendered');
  assert.ok(html.includes('10 SERVIÇOS'), 'Total services in stats strip');
  assert.ok(html.includes('4 CONCLUÍDOS'), 'Completed services in stats strip');
  assert.ok(html.includes('2 ALERTAS CRÍTICOS'), 'Critical alerts in stats strip');
  assert.ok(html.includes('Memorial técnico'), 'Memorial button text');
  assert.equal(memorialClicked, false, 'Initial flag is false');
});

// -----------------------------------------------------------------------------
// 8. BARREL EXPORT INTEGRITY
// -----------------------------------------------------------------------------
console.log('\n--- 8. Barrel Export Verification ---');

testCase('Atoms barrel exports all required atoms', async () => {
  const atoms = await import('@/components/atoms');
  assert.ok(typeof atoms.TactileNode === 'function', 'TactileNode exported');
  assert.ok(typeof atoms.TactileButton === 'object' || typeof atoms.TactileButton === 'function', 'TactileButton exported');
  assert.ok(typeof atoms.StatusBadge === 'function', 'StatusBadge exported');
  assert.ok(typeof atoms.MetricChip === 'function', 'MetricChip exported');
});

testCase('Molecules barrel exports all required molecules', async () => {
  const molecules = await import('@/components/molecules');
  assert.ok(typeof molecules.TimelineNodeItem === 'function', 'TimelineNodeItem exported');
  assert.ok(typeof molecules.ProgressBarWithMetrics === 'function', 'ProgressBarWithMetrics exported');
  assert.ok(typeof molecules.SiteDecoration === 'function', 'SiteDecoration exported');
  assert.ok(typeof molecules.SectionBanner === 'function', 'SectionBanner exported');
});

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
console.log('\n============================================================');
console.log(`SUMMARY: ${passedTests} passed, ${failedTests} failed`);
console.log('============================================================\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
