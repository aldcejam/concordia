import assert from 'node:assert/strict';
import React from 'react';
import { TactileNode } from '@/components/atoms/TactileNode';
import { NodeStatus } from '@/types/timeline';
import {
  setupTestDom,
  render,
  fireClick,
  fireKeyDown,
  createTestRunner,
} from './testUtils';

// Initialize headless JSDOM environment
setupTestDom();

const { testCase, printSummary } = createTestRunner('TACTILENODE COMPONENT TEST SUITE');

async function runTests() {
  // =========================================================================
  // 1. ALL 6 NodeStatus STATES: Colors, Depths, Sizes, Default Icons
  // =========================================================================
  console.log('--- 1. NodeStatus States (6 variants) ---');

  await testCase('renders status "completed" with primary tokens and Check icon', () => {
    const { container, unmount } = render(<TactileNode status="completed" />);
    const node = container.querySelector('.node-tactile') as HTMLElement;
    assert.ok(node, 'TactileNode container must exist');

    assert.equal(node.style.getPropertyValue('--node-color'), 'var(--primary)');
    assert.equal(node.style.getPropertyValue('--node-depth'), 'var(--primary-deep)');
    assert.ok(node.classList.contains('text-primary-foreground'));
    assert.ok(node.classList.contains('size-16'), 'Default size must be md (size-16)');

    const icon = node.querySelector('.lucide-check');
    assert.ok(icon, 'Lucide Check icon must be rendered for completed status');

    const ring = node.querySelector('svg:not(.lucide)');
    assert.equal(ring, null, 'Progress ring must NOT be rendered when progress is undefined');
    unmount();
  });

  await testCase('renders status "in_progress" with primary tokens, Ruler icon, pulse, and progress ring', () => {
    const { container, unmount } = render(<TactileNode status="in_progress" />);
    const node = container.querySelector('.node-tactile') as HTMLElement;
    assert.ok(node, 'TactileNode container must exist');

    assert.equal(node.style.getPropertyValue('--node-color'), 'var(--primary)');
    assert.equal(node.style.getPropertyValue('--node-depth'), 'var(--primary-deep)');
    assert.ok(node.classList.contains('text-primary-foreground'));
    assert.ok(node.classList.contains('size-20'), 'Default size must be lg (size-20)');
    assert.ok(node.classList.contains('active-pulse'), 'Must have active-pulse animation');

    const icon = node.querySelector('.lucide-ruler');
    assert.ok(icon, 'Lucide Ruler icon must be rendered for in_progress status');

    // SVG progress ring defaults to 65% when not provided
    const ring = node.querySelector('svg.pointer-events-none');
    assert.ok(ring, 'Progress ring SVG must be rendered for in_progress status');
    const progressCircle = ring.querySelectorAll('circle')[1];
    assert.equal(progressCircle.getAttribute('stroke-dasharray'), '65 100');
    unmount();
  });

  await testCase('renders status "delayed" with warning tokens and TriangleAlert icon', () => {
    const { container, unmount } = render(<TactileNode status="delayed" />);
    const node = container.querySelector('.node-tactile') as HTMLElement;
    assert.ok(node, 'TactileNode container must exist');

    assert.equal(node.style.getPropertyValue('--node-color'), 'var(--warning)');
    assert.equal(node.style.getPropertyValue('--node-depth'), '#991b1b');
    assert.ok(node.classList.contains('text-white'));
    assert.ok(node.classList.contains('size-16'), 'Default size must be md (size-16)');

    const icon = node.querySelector('.lucide-triangle-alert');
    assert.ok(icon, 'Lucide TriangleAlert icon must be rendered for delayed status');
    assert.ok(!node.classList.contains('active-pulse'), 'Delayed status must NOT pulse by default');
    unmount();
  });

  await testCase('renders status "accelerate" with gold tokens and Gem icon', () => {
    const { container, unmount } = render(<TactileNode status="accelerate" />);
    const node = container.querySelector('.node-tactile') as HTMLElement;
    assert.ok(node, 'TactileNode container must exist');

    assert.equal(node.style.getPropertyValue('--node-color'), 'var(--gold)');
    assert.equal(node.style.getPropertyValue('--node-depth'), '#b45309');
    assert.ok(node.classList.contains('text-foreground'));
    assert.ok(node.classList.contains('size-16'), 'Default size must be md (size-16)');

    const icon = node.querySelector('.lucide-gem');
    assert.ok(icon, 'Lucide Gem icon must be rendered for accelerate status');
    unmount();
  });

  await testCase('renders status "locked" with concrete tokens and LockKeyhole icon', () => {
    const { container, unmount } = render(<TactileNode status="locked" />);
    const node = container.querySelector('.node-tactile') as HTMLElement;
    assert.ok(node, 'TactileNode container must exist');

    assert.equal(node.style.getPropertyValue('--node-color'), 'var(--concrete)');
    assert.equal(node.style.getPropertyValue('--node-depth'), '#475569');
    assert.ok(node.classList.contains('text-primary-foreground'));
    assert.ok(node.classList.contains('size-16'), 'Default size must be md (size-16)');

    const icon = node.querySelector('.lucide-lock-keyhole');
    assert.ok(icon, 'Lucide LockKeyhole icon must be rendered for locked status');
    unmount();
  });

  await testCase('renders status "milestone" with gold tokens and Trophy icon', () => {
    const { container, unmount } = render(<TactileNode status="milestone" />);
    const node = container.querySelector('.node-tactile') as HTMLElement;
    assert.ok(node, 'TactileNode container must exist');

    assert.equal(node.style.getPropertyValue('--node-color'), 'var(--gold)');
    assert.equal(node.style.getPropertyValue('--node-depth'), '#b45309');
    assert.ok(node.classList.contains('text-foreground'));
    assert.ok(node.classList.contains('size-20'), 'Default size must be lg (size-20)');

    const icon = node.querySelector('.lucide-trophy');
    assert.ok(icon, 'Lucide Trophy icon must be rendered for milestone status');
    assert.ok(icon.classList.contains('size-8'), 'Milestone trophy icon must use size-8 when lg');
    unmount();
  });

  // =========================================================================
  // 2. SIZE VARIANTS ('sm', 'md', 'lg')
  // =========================================================================
  console.log('\n--- 2. Size Variants ("sm", "md", "lg") ---');

  await testCase('size variant "sm" applies size-12, size-5 icon, stroke-width 2.5 and centered size-16 ring', () => {
    const { container, unmount } = render(
      <TactileNode status="in_progress" size="sm" progress={40} />
    );
    const node = container.querySelector('.node-tactile') as HTMLElement;
    assert.ok(node.classList.contains('size-12'), 'Root must have size-12');

    const ring = node.querySelector('svg.pointer-events-none');
    assert.ok(ring?.classList.contains('size-16'), 'Ring must have size-16 for sm');
    assert.ok(ring?.classList.contains('left-1/2'), 'Ring must have left-1/2 for centering');
    assert.ok(ring?.classList.contains('-translate-x-1/2'), 'Ring must have -translate-x-1/2 for centering');

    const icon = node.querySelector('.lucide-ruler');
    assert.ok(icon?.classList.contains('size-5'), 'Icon must have size-5 for sm');
    assert.equal(icon?.getAttribute('stroke-width'), '2.5', 'Icon strokeWidth must be 2.5 for sm');
    unmount();
  });

  await testCase('size variant "md" applies size-16, size-7 icon, stroke-width 2.8 and centered size-20 ring', () => {
    const { container, unmount } = render(
      <TactileNode status="in_progress" size="md" progress={50} />
    );
    const node = container.querySelector('.node-tactile') as HTMLElement;
    assert.ok(node.classList.contains('size-16'), 'Root must have size-16');

    const ring = node.querySelector('svg.pointer-events-none');
    assert.ok(ring?.classList.contains('size-20'), 'Ring must have size-20 for md');
    assert.ok(ring?.classList.contains('left-1/2'), 'Ring must have left-1/2 for centering');
    assert.ok(ring?.classList.contains('-translate-x-1/2'), 'Ring must have -translate-x-1/2 for centering');

    const icon = node.querySelector('.lucide-ruler');
    assert.ok(icon?.classList.contains('size-7'), 'Icon must have size-7 for md');
    assert.equal(icon?.getAttribute('stroke-width'), '2.8', 'Icon strokeWidth must be 2.8 for md');
    unmount();
  });

  await testCase('size variant "lg" applies size-20, size-7 icon, stroke-width 2.8 and centered size-24 ring', () => {
    const { container, unmount } = render(
      <TactileNode status="in_progress" size="lg" progress={80} />
    );
    const node = container.querySelector('.node-tactile') as HTMLElement;
    assert.ok(node.classList.contains('size-20'), 'Root must have size-20');

    const ring = node.querySelector('svg.pointer-events-none');
    assert.ok(ring?.classList.contains('size-24'), 'Ring must have size-24 for lg');
    assert.ok(ring?.classList.contains('left-1/2'), 'Ring must have left-1/2 for centering');
    assert.ok(ring?.classList.contains('-translate-x-1/2'), 'Ring must have -translate-x-1/2 for centering');

    const icon = node.querySelector('.lucide-ruler');
    assert.ok(icon?.classList.contains('size-7'), 'Icon must have size-7 for lg');
    assert.equal(icon?.getAttribute('stroke-width'), '2.8', 'Icon strokeWidth must be 2.8 for lg');
    unmount();
  });

  // =========================================================================
  // 3. SVG PROGRESS RING & BOUNDS CLAMPING
  // =========================================================================
  console.log('\n--- 3. SVG Progress Ring & Bounds Clamping ---');

  await testCase('progress ring clamps 0% properly', () => {
    const { container, unmount } = render(
      <TactileNode status="in_progress" progress={0} />
    );
    const progressCircle = container.querySelectorAll('circle')[1];
    assert.equal(progressCircle.getAttribute('stroke-dasharray'), '0 100');
    unmount();
  });

  await testCase('progress ring renders 50% properly', () => {
    const { container, unmount } = render(
      <TactileNode status="in_progress" progress={50} />
    );
    const progressCircle = container.querySelectorAll('circle')[1];
    assert.equal(progressCircle.getAttribute('stroke-dasharray'), '50 100');
    unmount();
  });

  await testCase('progress ring clamps 100% properly', () => {
    const { container, unmount } = render(
      <TactileNode status="in_progress" progress={100} />
    );
    const progressCircle = container.querySelectorAll('circle')[1];
    assert.equal(progressCircle.getAttribute('stroke-dasharray'), '100 100');
    unmount();
  });

  await testCase('progress ring clamps extreme negative values (-25, -9999) to 0%', () => {
    const { container: c1, unmount: u1 } = render(
      <TactileNode status="in_progress" progress={-25} />
    );
    assert.equal(c1.querySelectorAll('circle')[1].getAttribute('stroke-dasharray'), '0 100');
    u1();

    const { container: c2, unmount: u2 } = render(
      <TactileNode status="in_progress" progress={-9999} />
    );
    assert.equal(c2.querySelectorAll('circle')[1].getAttribute('stroke-dasharray'), '0 100');
    u2();
  });

  await testCase('progress ring clamps extreme over-100 values (150, 9999) to 100%', () => {
    const { container: c1, unmount: u1 } = render(
      <TactileNode status="in_progress" progress={150} />
    );
    assert.equal(c1.querySelectorAll('circle')[1].getAttribute('stroke-dasharray'), '100 100');
    u1();

    const { container: c2, unmount: u2 } = render(
      <TactileNode status="in_progress" progress={9999} />
    );
    assert.equal(c2.querySelectorAll('circle')[1].getAttribute('stroke-dasharray'), '100 100');
    u2();
  });

  await testCase('SVG progress ring validates full SVG vector attributes', () => {
    const { container, unmount } = render(
      <TactileNode status="in_progress" progress={75} />
    );
    const svg = container.querySelector('svg.pointer-events-none');
    assert.ok(svg, 'SVG element must exist');
    assert.equal(svg.getAttribute('viewBox'), '0 0 100 100');
    assert.equal(svg.getAttribute('aria-hidden'), 'true');

    const circles = svg.querySelectorAll('circle');
    assert.equal(circles.length, 2, 'Must have track and progress circles');

    // Track circle
    const track = circles[0];
    assert.equal(track.getAttribute('cx'), '50');
    assert.equal(track.getAttribute('cy'), '50');
    assert.equal(track.getAttribute('r'), '45');
    assert.equal(track.getAttribute('fill'), 'none');
    assert.equal(track.getAttribute('stroke'), 'var(--border)');
    assert.equal(track.getAttribute('stroke-width'), '6');

    // Progress circle
    const prog = circles[1];
    assert.equal(prog.getAttribute('cx'), '50');
    assert.equal(prog.getAttribute('cy'), '50');
    assert.equal(prog.getAttribute('r'), '45');
    assert.equal(prog.getAttribute('fill'), 'none');
    assert.equal(prog.getAttribute('stroke'), 'var(--action)');
    assert.equal(prog.getAttribute('stroke-width'), '6');
    assert.equal(prog.getAttribute('stroke-linecap'), 'round');
    assert.equal(prog.getAttribute('pathLength'), '100');
    assert.equal(prog.getAttribute('stroke-dasharray'), '75 100');
    unmount();
  });

  await testCase('shows progress ring for non-in_progress node when progress > 0', () => {
    const { container, unmount } = render(
      <TactileNode status="completed" progress={100} />
    );
    const svg = container.querySelector('svg.pointer-events-none');
    assert.ok(svg, 'Progress ring must render when progress is provided');
    assert.equal(svg.querySelectorAll('circle')[1].getAttribute('stroke-dasharray'), '100 100');
    unmount();
  });

  // =========================================================================
  // 4. LUCIDE ICONS & CUSTOM ICON OVERRIDE
  // =========================================================================
  console.log('\n--- 4. Lucide Icons & Custom Icon Override ---');

  const ALL_STATUSES: NodeStatus[] = [
    'completed',
    'in_progress',
    'delayed',
    'accelerate',
    'locked',
    'planned',
    'milestone',
  ];

  await testCase('renders correct Lucide icon for every status enum', () => {
    const expectedIconClasses: Record<NodeStatus, string> = {
      completed: 'lucide-check',
      in_progress: 'lucide-ruler',
      delayed: 'lucide-triangle-alert',
      accelerate: 'lucide-gem',
      locked: 'lucide-lock-keyhole',
      planned: 'lucide-clipboard-list',
      milestone: 'lucide-trophy',
    };

    for (const st of ALL_STATUSES) {
      const { container, unmount } = render(<TactileNode status={st} />);
      const icon = container.querySelector(`.${expectedIconClasses[st]}`);
      assert.ok(icon, `Icon class ${expectedIconClasses[st]} must exist for status ${st}`);
      unmount();
    }
  });

  await testCase('custom icon prop replaces the default Lucide icon', () => {
    const customIcon = <span data-testid="custom-gem-badge">CUSTOM_GEM</span>;
    const { container, unmount } = render(
      <TactileNode status="completed" icon={customIcon} />
    );

    const custom = container.querySelector('[data-testid="custom-gem-badge"]');
    assert.ok(custom, 'Custom icon element must be rendered');
    assert.equal(custom.textContent, 'CUSTOM_GEM');

    const defaultIcon = container.querySelector('.lucide-check');
    assert.equal(defaultIcon, null, 'Default icon must be replaced');
    unmount();
  });

  // =========================================================================
  // 5. CLICK HANDLERS, isSelected PROP & KEYBOARD ACCESSIBILITY
  // =========================================================================
  console.log('\n--- 5. Click Handlers, isSelected & Keyboard Accessibility ---');

  await testCase('invokes onClick handler when clicked', () => {
    let clicked = false;
    const { container, unmount } = render(
      <TactileNode status="in_progress" onClick={() => { clicked = true; }} />
    );

    const node = container.querySelector('.node-tactile') as HTMLElement;
    fireClick(node);
    assert.equal(clicked, true, 'onClick handler must be triggered on click');
    unmount();
  });

  await testCase('isSelected prop toggles highlight ring styling', () => {
    const { container, rerender, unmount } = render(
      <TactileNode status="in_progress" isSelected={false} />
    );
    const node = container.querySelector('.node-tactile') as HTMLElement;
    assert.ok(!node.classList.contains('ring-4'), 'Must not have ring-4 when isSelected=false');
    assert.ok(!node.classList.contains('ring-action'), 'Must not have ring-action when isSelected=false');

    rerender(<TactileNode status="in_progress" isSelected={true} />);
    assert.ok(node.classList.contains('ring-4'), 'Must have ring-4 when isSelected=true');
    assert.ok(node.classList.contains('ring-action'), 'Must have ring-action when isSelected=true');
    assert.ok(node.classList.contains('ring-offset-2'), 'Must have ring-offset-2 when isSelected=true');
    unmount();
  });

  await testCase('keyboard accessibility: aria-label, role="button", and keydown events', () => {
    let keyTriggered = '';
    const handleKeyDown = (e: React.KeyboardEvent<HTMLSpanElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        keyTriggered = e.key;
      }
    };

    const { container, unmount } = render(
      <TactileNode
        status="in_progress"
        role="button"
        tabIndex={0}
        ariaLabel="Etapa 3: Tubulação PVC"
        onKeyDown={handleKeyDown}
      />
    );

    const node = container.querySelector('.node-tactile') as HTMLElement;
    assert.equal(node.getAttribute('role'), 'button');
    assert.equal(node.getAttribute('tabindex'), '0');
    assert.equal(node.getAttribute('aria-label'), 'Etapa 3: Tubulação PVC');

    // Test Enter key
    fireKeyDown(node, 'Enter');
    assert.equal(keyTriggered, 'Enter', 'Enter key must trigger handler');

    // Test Space key
    fireKeyDown(node, ' ');
    assert.equal(keyTriggered, ' ', 'Space key must trigger handler');
    unmount();
  });

  await testCase('customColor and customDepth override default status tokens', () => {
    const { container, unmount } = render(
      <TactileNode
        status="completed"
        customColor="#10b981"
        customDepth="#047857"
      />
    );
    const node = container.querySelector('.node-tactile') as HTMLElement;
    assert.equal(node.style.getPropertyValue('--node-color'), '#10b981');
    assert.equal(node.style.getPropertyValue('--node-depth'), '#047857');
    unmount();
  });

  await testCase('activePulse and isPulsing props force pulse animation on non-active status', () => {
    const { container: c1, unmount: u1 } = render(
      <TactileNode status="locked" activePulse={true} />
    );
    assert.ok(c1.querySelector('.node-tactile')?.classList.contains('active-pulse'));
    u1();

    const { container: c2, unmount: u2 } = render(
      <TactileNode status="completed" isPulsing={true} />
    );
    assert.ok(c2.querySelector('.node-tactile')?.classList.contains('active-pulse'));
    u2();

    // isPulsing={false} suppresses pulse on in_progress
    const { container: c3, unmount: u3 } = render(
      <TactileNode status="in_progress" isPulsing={false} />
    );
    assert.ok(!c3.querySelector('.node-tactile')?.classList.contains('active-pulse'));
    u3();
  });

  await testCase('passes additional HTML attributes through ...rest', () => {
    const props = {
      status: 'in_progress' as NodeStatus,
      id: 'custom-node-id',
      'data-testid': 'tactile-node-unit',
      'data-step': '3',
    };
    const { container, unmount } = render(<TactileNode {...props} />);
    const node = container.querySelector('#custom-node-id');
    assert.ok(node, 'Node with custom id must exist');
    assert.equal(node.getAttribute('data-testid'), 'tactile-node-unit');
    assert.equal(node.getAttribute('data-step'), '3');
    unmount();
  });

  printSummary();
}

runTests();
