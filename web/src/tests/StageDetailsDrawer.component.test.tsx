import assert from 'node:assert/strict';
import { act } from 'react';
import { StageDetailsDrawer } from '@/components/organisms/StageDetailsDrawer';
import { TimelineNodeData, StageMeasurementFormValues } from '@/types/timeline';
import {
  render,
  fireClick,
  fireInput,
  fireTextarea,
  fireKeyDown,
  createTestRunner,
} from './testUtils';

const { testCase, printSummary } = createTestRunner('STAGEDETAILSDRAWER COMPONENT TEST SUITE');

const MOCK_BASE_NODE: TimelineNodeData = {
  id: 'node-tubulacao-pvc',
  title: 'Tubulação PVC R DN 150mm',
  subtitle: '60% executado • 120m de 200m',
  status: 'in_progress',
  progress: 60,
  position: { left: '42%', top: '35%' },
  eapCode: '02.01.015',
  sinapiCode: 'SINAPI 104166',
  technicalDescription: 'Fornecimento e assentamento de tubo PVC rígido para drenagem pluvial DN 150mm.',
  budgetedValue: 48500.0,
  executedValue: 29100.0,
  financialWeight: 2.75,
  unit: 'm',
  budgetedQuantity: 200,
  executedQuantity: 120,
};

async function runTests() {
  // =========================================================================
  // 1. OPENING STATE AND NULL NODE SAFETY
  // =========================================================================
  console.log('--- 1. Opening State and Null Node Safety ---');

  await testCase('returns null and renders nothing when isOpen=false with valid node', () => {
    const { container, unmount } = render(
      <StageDetailsDrawer
        isOpen={false}
        node={MOCK_BASE_NODE}
        onClose={() => {}}
      />
    );
    try {
      assert.equal(container.innerHTML, '', 'Container must be empty when isOpen=false');
    } finally {
      unmount();
    }
  });

  await testCase('returns null and renders nothing when isOpen=true with node=null', () => {
    const { container, unmount } = render(
      <StageDetailsDrawer
        isOpen={true}
        node={null}
        onClose={() => {}}
      />
    );
    try {
      assert.equal(container.innerHTML, '', 'Container must be empty when node=null');
    } finally {
      unmount();
    }
  });

  await testCase('returns null and renders nothing when isOpen=false with node=null', () => {
    const { container, unmount } = render(
      <StageDetailsDrawer
        isOpen={false}
        node={null}
        onClose={() => {}}
      />
    );
    try {
      assert.equal(container.innerHTML, '', 'Container must be empty when both closed and null');
    } finally {
      unmount();
    }
  });

  await testCase('renders full dialog container when isOpen=true with valid node', () => {
    const { container, unmount } = render(
      <StageDetailsDrawer
        isOpen={true}
        node={MOCK_BASE_NODE}
        onClose={() => {}}
      />
    );
    try {
      const dialog = container.querySelector('[role="dialog"]');
      assert.ok(dialog, 'Dialog container must be mounted in DOM');
    } finally {
      unmount();
    }
  });

  // =========================================================================
  // 2. EAP CODE, SINAPI CODE (WITH font-mono), DESCRIPTION & FINANCIAL WEIGHT
  // =========================================================================
  console.log('\n--- 2. EAP Code, SINAPI Code, Description & Financial Weight ---');

  await testCase('renders EAP code with font-mono styling and uppercase tracking', () => {
    const { container, unmount } = render(
      <StageDetailsDrawer
        isOpen={true}
        node={MOCK_BASE_NODE}
        onClose={() => {}}
      />
    );
    try {
      const eapSpan = Array.from(container.querySelectorAll('span')).find((s) =>
        s.textContent?.includes('EAP 02.01.015')
      );
      assert.ok(eapSpan, 'EAP span must exist');
      assert.ok(eapSpan.classList.contains('font-mono'), 'Must use font-mono');
    } finally {
      unmount();
    }
  });

  await testCase('renders SINAPI code in reference card with font-mono typography', () => {
    const { container, unmount } = render(
      <StageDetailsDrawer
        isOpen={true}
        node={MOCK_BASE_NODE}
        onClose={() => {}}
      />
    );
    try {
      const sinapiElement = Array.from(container.querySelectorAll('span')).find((s) =>
        s.textContent?.includes('SINAPI 104166')
      );
      assert.ok(sinapiElement, 'SINAPI code element must exist');
      assert.ok(sinapiElement.classList.contains('font-mono'), 'Must use font-mono for SINAPI code');
    } finally {
      unmount();
    }
  });

  await testCase('renders fallback "Composição Própria" with font-mono when sinapiCode is omitted', () => {
    const nodeWithoutSinapi: TimelineNodeData = {
      ...MOCK_BASE_NODE,
      sinapiCode: '',
    };
    const { container, unmount } = render(
      <StageDetailsDrawer
        isOpen={true}
        node={nodeWithoutSinapi}
        onClose={() => {}}
      />
    );
    try {
      const sinapiElement = Array.from(container.querySelectorAll('span')).find((s) =>
        s.textContent?.includes('Composição Própria')
      );
      assert.ok(sinapiElement, 'Fallback Composição Própria must exist');
      assert.ok(sinapiElement.classList.contains('font-mono'), 'Must use font-mono');
    } finally {
      unmount();
    }
  });

  await testCase('renders technical description and handles default fallback', () => {
    const { container, rerender, unmount } = render(
      <StageDetailsDrawer
        isOpen={true}
        node={MOCK_BASE_NODE}
        onClose={() => {}}
      />
    );
    try {
      const desc = container.querySelector('#stage-drawer-description');
      assert.ok(desc, 'Description element must exist');
      assert.equal(desc.textContent?.trim(), MOCK_BASE_NODE.technicalDescription);

      // Fallback when technicalDescription is empty
      const nodeNoDesc: TimelineNodeData = {
        ...MOCK_BASE_NODE,
        technicalDescription: '',
      };
      rerender(
        <StageDetailsDrawer
          isOpen={true}
          node={nodeNoDesc}
          onClose={() => {}}
        />
      );
      const fallbackDesc = container.querySelector('#stage-drawer-description');
      assert.ok(
        fallbackDesc?.textContent?.includes('Serviço técnico integrante do cronograma executivo'),
        'Must render default technical description fallback'
      );
    } finally {
      unmount();
    }
  });

  await testCase('renders contract financial weight with font-mono and percentage format', () => {
    const { container, unmount } = render(
      <StageDetailsDrawer
        isOpen={true}
        node={MOCK_BASE_NODE}
        onClose={() => {}}
      />
    );
    try {
      const weightElement = Array.from(container.querySelectorAll('span')).find((s) =>
        s.textContent?.includes('2.75%')
      );
      assert.ok(weightElement, 'Financial weight element must exist');
      assert.ok(weightElement.classList.contains('font-mono'), 'Must use font-mono');
    } finally {
      unmount();
    }
  });

  await testCase('renders budgeted value formatted in BRL currency with font-mono', () => {
    const { container, unmount } = render(
      <StageDetailsDrawer
        isOpen={true}
        node={MOCK_BASE_NODE}
        onClose={() => {}}
      />
    );
    try {
      const valueElement = container.querySelector('.font-mono.text-sm.font-extrabold.text-foreground');
      assert.ok(valueElement, 'Budgeted value element must exist');
      assert.ok(valueElement.textContent?.includes('48.500,00'), 'Formatted value must contain 48.500,00');
      assert.ok(valueElement.textContent?.includes('R$'), 'Must contain currency symbol R$');
    } finally {
      unmount();
    }
  });

  // =========================================================================
  // 3. BUDGETED VS EXECUTED METRICS AND PROGRESS BAR CALCULATION
  // =========================================================================
  console.log('\n--- 3. Budgeted vs Executed Metrics & Progress Bar Calculation ---');

  await testCase('calculates and renders executed vs budgeted quantities and unit', () => {
    const { container, unmount } = render(
      <StageDetailsDrawer
        isOpen={true}
        node={MOCK_BASE_NODE}
        onClose={() => {}}
      />
    );
    try {
      // 200m * 60% = 120.0 m
      const qtySpan = Array.from(container.querySelectorAll('span')).find((s) =>
        s.textContent?.includes('120.0 / 200 m')
      );
      assert.ok(qtySpan, 'Quantity progress span 120.0 / 200 m must exist');
    } finally {
      unmount();
    }
  });

  await testCase('renders progress bar with semantic role, aria values and visual fill width', () => {
    const { container, unmount } = render(
      <StageDetailsDrawer
        isOpen={true}
        node={MOCK_BASE_NODE}
        onClose={() => {}}
      />
    );
    try {
      const progressbar = container.querySelector('[role="progressbar"]');
      assert.ok(progressbar, 'Progress bar with role="progressbar" must exist');
      assert.equal(progressbar.getAttribute('aria-valuenow'), '60');
      assert.equal(progressbar.getAttribute('aria-valuemin'), '0');
      assert.equal(progressbar.getAttribute('aria-valuemax'), '100');
      assert.equal(progressbar.getAttribute('aria-label'), 'Avanço da medição: 60%');

      const innerBar = progressbar.firstElementChild as HTMLElement;
      assert.ok(innerBar, 'Inner progress bar fill element must exist');
      assert.equal(innerBar.style.width, '60%');
    } finally {
      unmount();
    }
  });

  await testCase('parses string-formatted budgetedQuantity gracefully', () => {
    const nodeWithStringQty: TimelineNodeData = {
      ...MOCK_BASE_NODE,
      budgetedQuantity: '150,5' as unknown as number,
      progress: 50,
      unit: 'm²',
    };
    const { container, unmount } = render(
      <StageDetailsDrawer
        isOpen={true}
        node={nodeWithStringQty}
        onClose={() => {}}
      />
    );
    try {
      // 150.5 * 50% = 75.3 / 150.5 m²
      const qtySpan = Array.from(container.querySelectorAll('span')).find((s) =>
        s.textContent?.includes('75.3 / 150.5 m²')
      );
      assert.ok(qtySpan, 'Quantity span 75.3 / 150.5 m² must exist');
    } finally {
      unmount();
    }
  });

  await testCase('metric chip displays "100% Concluído" when node status is completed', () => {
    const completedNode: TimelineNodeData = {
      ...MOCK_BASE_NODE,
      status: 'completed',
      progress: 100,
    };
    const { container, unmount } = render(
      <StageDetailsDrawer
        isOpen={true}
        node={completedNode}
        onClose={() => {}}
      />
    );
    try {
      const chipText = Array.from(container.querySelectorAll('span')).find((s) =>
        s.textContent?.includes('100% Concluído')
      );
      assert.ok(chipText, 'Must display 100% Concluído chip');
    } finally {
      unmount();
    }
  });

  // =========================================================================
  // 4. MEASUREMENT CONTROLS AND onSaveMeasurement CALLBACK
  // =========================================================================
  console.log('\n--- 4. Measurement Controls & onSaveMeasurement Callback ---');

  await testCase('changing slider range updates progress and live executed quantity', () => {
    const { container, unmount } = render(
      <StageDetailsDrawer
        isOpen={true}
        node={MOCK_BASE_NODE}
        onClose={() => {}}
      />
    );
    try {
      const slider = container.querySelector('input[type="range"]') as HTMLInputElement;
      assert.ok(slider, 'Range slider input must exist');
      assert.equal(slider.value, '60');

      // Change slider to 75%
      fireInput(slider, 75);

      // Quantity updates live: 200 * 75% = 150.0 m
      const qtySpan = Array.from(container.querySelectorAll('span')).find((s) =>
        s.textContent?.includes('150.0 / 200 m')
      );
      assert.ok(qtySpan, 'Quantity must update to 150.0 / 200 m');

      // Progress bar updates live
      const progressbar = container.querySelector('[role="progressbar"]');
      assert.equal(progressbar?.getAttribute('aria-valuenow'), '75');
      assert.equal((progressbar?.firstElementChild as HTMLElement)?.style.width, '75%');
    } finally {
      unmount();
    }
  });

  await testCase('quick buttons (+5%, +10%, 100% Concluir) increment and set progress', () => {
    const { container, unmount } = render(
      <StageDetailsDrawer
        isOpen={true}
        node={MOCK_BASE_NODE} // starts at 60%
        onClose={() => {}}
      />
    );
    try {
      const buttons = Array.from(container.querySelectorAll('button'));
      const btn5 = buttons.find((b) => b.textContent?.trim() === '+5%') as HTMLButtonElement;
      const btn10 = buttons.find((b) => b.textContent?.trim() === '+10%') as HTMLButtonElement;
      const btn100 = buttons.find((b) => b.textContent?.trim() === '100% Concluir') as HTMLButtonElement;

      assert.ok(btn5, '+5% button must exist');
      assert.ok(btn10, '+10% button must exist');
      assert.ok(btn100, '100% Concluir button must exist');

      // Click +5%: 60 -> 65
      fireClick(btn5);
      let qtySpan = Array.from(container.querySelectorAll('span')).find((s) =>
        s.textContent?.includes('130.0 / 200 m')
      );
      assert.ok(qtySpan, 'Quantity must be 130.0 / 200 m after +5%');

      // Click +10%: 65 -> 75
      fireClick(btn10);
      qtySpan = Array.from(container.querySelectorAll('span')).find((s) =>
        s.textContent?.includes('150.0 / 200 m')
      );
      assert.ok(qtySpan, 'Quantity must be 150.0 / 200 m after +10%');

      // Click 100% Concluir: 75 -> 100
      fireClick(btn100);
      qtySpan = Array.from(container.querySelectorAll('span')).find((s) =>
        s.textContent?.includes('200.0 / 200 m')
      );
      assert.ok(qtySpan, 'Quantity must be 200.0 / 200 m after 100% Concluir');
    } finally {
      unmount();
    }
  });

  await testCase('clicking "Salvar Medição" invokes callbacks with calculated quantity and displays success message', async () => {
    let savedNodeId = '';
    let savedQuantity = -1;
    let savedValues: StageMeasurementFormValues | null = null;

    const { container, unmount } = render(
      <StageDetailsDrawer
        isOpen={true}
        node={MOCK_BASE_NODE}
        onClose={() => {}}
        onSaveMeasurement={(id, qty) => {
          savedNodeId = id;
          savedQuantity = qty;
        }}
        onSaveMeasurementValues={(values) => {
          savedValues = values;
        }}
      />
    );
    try {
      // Use quick button +10% twice: 60 -> 70 -> 80 (200 * 80% = 160.0)
      const buttons = Array.from(container.querySelectorAll('button'));
      const btn10 = buttons.find((b) => b.textContent?.trim() === '+10%') as HTMLButtonElement;
      fireClick(btn10);
      fireClick(btn10);

      const saveButton = Array.from(container.querySelectorAll('button')).find((b) =>
        b.textContent?.includes('Salvar Medição')
      ) as HTMLButtonElement;
      assert.ok(saveButton, 'Salvar Medição button must exist');

      fireClick(saveButton);
      await act(async () => {
        await new Promise((r) => setTimeout(r, 50));
      });

      assert.equal(savedNodeId, MOCK_BASE_NODE.id);
      assert.equal(savedQuantity, 160.0, 'Must save 160.0 executed quantity');
      assert.ok(savedValues !== null, 'onSaveMeasurementValues must be invoked');
      const resolvedValues = savedValues as unknown as StageMeasurementFormValues;
      assert.equal(resolvedValues.nodeId, MOCK_BASE_NODE.id);
      assert.equal(resolvedValues.executedQuantity, 160.0);

      // Success notification appears in DOM
      const successMsg = Array.from(container.querySelectorAll('div')).find((d) =>
        d.textContent?.includes('Medição de 80% salva com sucesso!')
      );
      assert.ok(successMsg, 'Success feedback banner must appear');
    } finally {
      unmount();
    }
  });

  // =========================================================================
  // 5. IMPEDIMENT REPORTING FORM AND onReportImpediment CALLBACK
  // =========================================================================
  console.log('\n--- 5. Impediment Reporting Form & onReportImpediment Callback ---');

  await testCase('delayed node displays critical impediment banner with root cause', () => {
    const delayedNode: TimelineNodeData = {
      ...MOCK_BASE_NODE,
      status: 'delayed',
      impedimentReason: 'Falta de fôrmas metálicas e atraso na entrega do concreto usinado.',
    };
    const { container, unmount } = render(
      <StageDetailsDrawer
        isOpen={true}
        node={delayedNode}
        onClose={() => {}}
      />
    );
    try {
      const alertBanner = container.querySelector('.bg-warning-soft\\/60');
      assert.ok(alertBanner, 'Delayed impediment banner must be rendered');
      assert.ok(alertBanner.textContent?.includes('Impedimento Crítico Registrado'));
      assert.ok(alertBanner.textContent?.includes('Falta de fôrmas metálicas'));
    } finally {
      unmount();
    }
  });

  await testCase('expands impediment form, validates input, and submits with onReportImpediment callback', async () => {
    let reportedNodeId = '';
    let reportedReason = '';
    let reportedDays = 0;

    const { container, unmount } = render(
      <StageDetailsDrawer
        isOpen={true}
        node={MOCK_BASE_NODE}
        onClose={() => {}}
        onReportImpediment={(id, reason, days) => {
          reportedNodeId = id;
          reportedReason = reason;
          reportedDays = days ?? 0;
        }}
      />
    );
    try {
      // 1. Initial state: Form is collapsed, button is visible
      const openFormBtn = Array.from(container.querySelectorAll('button')).find((b) =>
        b.textContent?.includes('Reportar Impedimento / Atraso')
      ) as HTMLButtonElement;
      assert.ok(openFormBtn, 'Reportar Impedimento button must exist');

      // 2. Click button to expand form
      fireClick(openFormBtn);

      const textarea = container.querySelector('#impediment-reason') as HTMLTextAreaElement;
      assert.ok(textarea, 'Justification textarea must now be mounted in DOM');

      const submitBtn = Array.from(container.querySelectorAll('button')).find((b) =>
        b.textContent?.includes('Registrar e Notificar Gestão')
      ) as HTMLButtonElement;
      assert.ok(submitBtn, 'Submit button must exist');
      assert.equal(submitBtn.disabled, true, 'Submit button must be disabled when reason is empty');

      // 3. Select impact days: click +5d
      const dayButtons = Array.from(container.querySelectorAll('button')).filter((b) =>
        /^\+\d+d$/.test(b.textContent?.trim() || '')
      );
      assert.equal(dayButtons.length, 5, 'Must render +1d, +2d, +3d, +5d, +7d buttons');
      const btn5d = dayButtons.find((b) => b.textContent?.trim() === '+5d') as HTMLButtonElement;
      fireClick(btn5d);

      // 4. Fill in root cause justification
      fireTextarea(textarea, 'Chuva torrencial alagou a vala de drenagem profunda.');
      assert.equal(submitBtn.disabled, false, 'Submit button must be enabled once text is entered');

      // 5. Submit form
      fireClick(submitBtn);
      await act(async () => {
        await new Promise((r) => setTimeout(r, 50));
      });

      assert.equal(reportedNodeId, MOCK_BASE_NODE.id);
      assert.equal(reportedReason, 'Chuva torrencial alagou a vala de drenagem profunda.');
      assert.equal(reportedDays, 5, 'Must report 5 days impact');

      // 6. Success message is rendered
      const successBanner = container.querySelector('.bg-amber-50');
      assert.ok(successBanner, 'Impediment success notification must appear');
      assert.ok(successBanner.textContent?.includes('Impedimento (+5 dias) reportado com sucesso!'));
    } finally {
      unmount();
    }
  });

  await testCase('canceling impediment form collapses it back without submitting', () => {
    let submitted = false;
    const { container, unmount } = render(
      <StageDetailsDrawer
        isOpen={true}
        node={MOCK_BASE_NODE}
        onClose={() => {}}
        onReportImpediment={() => { submitted = true; }}
      />
    );
    try {
      const openFormBtn = Array.from(container.querySelectorAll('button')).find((b) =>
        b.textContent?.includes('Reportar Impedimento / Atraso')
      ) as HTMLButtonElement;
      fireClick(openFormBtn);

      const cancelBtn = Array.from(container.querySelectorAll('button')).find((b) =>
        b.textContent?.trim() === 'Cancelar'
      ) as HTMLButtonElement;
      assert.ok(cancelBtn, 'Cancel button must exist');

      fireClick(cancelBtn);

      assert.equal(submitted, false);
      assert.equal(container.querySelector('#impediment-reason'), null, 'Form must be collapsed');
    } finally {
      unmount();
    }
  });

  // =========================================================================
  // 6. STAGE ACCELERATION ("PONTE DOURADA") AND onAccelerate CALLBACK
  // =========================================================================
  console.log('\n--- 6. Stage Acceleration ("Ponte Dourada") & onAccelerate Callback ---');

  await testCase('accelerate node displays Ponte Dourada card and triggers callbacks on click', () => {
    let acceleratedNodeId = '';
    let acceleratedNodeData: TimelineNodeData | null = null;

    const accelerateNode: TimelineNodeData = {
      ...MOCK_BASE_NODE,
      id: 'node-chapisco-interno',
      status: 'accelerate',
      accelerationOpportunity: 'Frente independente liberada no Bloco B. Possível antecipação em 8 dias.',
    };

    const { container, unmount } = render(
      <StageDetailsDrawer
        isOpen={true}
        node={accelerateNode}
        onClose={() => {}}
        onAccelerate={(id) => {
          acceleratedNodeId = id;
        }}
        onAccelerateStage={(node) => {
          acceleratedNodeData = node;
        }}
      />
    );
    try {
      const goldCard = container.querySelector('.border-amber-400\\/40');
      assert.ok(goldCard, 'Ponte Dourada gold opportunity card must exist');
      assert.ok(goldCard.textContent?.includes('Oportunidade: Ponte Dourada'));
      assert.ok(goldCard.textContent?.includes('Frente independente liberada'));

      const mobilizeBtn = Array.from(goldCard.querySelectorAll('button')).find((b) =>
        b.textContent?.includes('Mobilizar Frente / Adiantar Etapa')
      ) as HTMLButtonElement;
      assert.ok(mobilizeBtn, 'Mobilizar Frente button must exist');

      fireClick(mobilizeBtn);

      assert.equal(acceleratedNodeId, 'node-chapisco-interno');
      assert.ok(acceleratedNodeData !== null, 'onAccelerateStage must pass node data');
      const resolvedNodeData = acceleratedNodeData as unknown as TimelineNodeData;
      assert.equal(resolvedNodeData.id, 'node-chapisco-interno');
    } finally {
      unmount();
    }
  });

  await testCase('Ponte Dourada card is NOT rendered for non-accelerate status nodes', () => {
    const { container, unmount } = render(
      <StageDetailsDrawer
        isOpen={true}
        node={MOCK_BASE_NODE} // status is in_progress
        onClose={() => {}}
      />
    );
    try {
      assert.equal(container.querySelector('.border-amber-400\\/40'), null);
      assert.ok(!container.textContent?.includes('Oportunidade: Ponte Dourada'));
    } finally {
      unmount();
    }
  });

  // =========================================================================
  // 7. TRIPLE CLOSE MECHANISMS: CLOSE BUTTON X, BACKDROP CLICK, ESCAPE KEY
  // =========================================================================
  console.log('\n--- 7. Triple Close Mechanisms & Body Scroll Locking ---');

  await testCase('Mechanism 1: Close button X triggers onClose()', () => {
    let closed = false;
    const { container, unmount } = render(
      <StageDetailsDrawer
        isOpen={true}
        node={MOCK_BASE_NODE}
        onClose={() => { closed = true; }}
      />
    );
    try {
      const closeBtn = container.querySelector('[aria-label="Fechar painel de detalhes"]') as HTMLButtonElement;
      assert.ok(closeBtn, 'Close button X must exist');

      fireClick(closeBtn);
      assert.equal(closed, true, 'onClose must be called when clicking close button X');
    } finally {
      unmount();
    }
  });

  await testCase('Mechanism 2: Backdrop click triggers onClose() while inside clicks do not', () => {
    let closeCount = 0;
    const { container, unmount } = render(
      <StageDetailsDrawer
        isOpen={true}
        node={MOCK_BASE_NODE}
        onClose={() => { closeCount++; }}
      />
    );
    try {
      const backdrop = container.querySelector('[role="dialog"]') as HTMLElement;
      const innerPanel = container.querySelector('.max-w-lg') as HTMLElement;

      // Click inside the drawer panel -> should NOT close
      fireClick(innerPanel);
      assert.equal(closeCount, 0, 'Clicking inside drawer content must NOT trigger onClose');

      // Click directly on the backdrop (outer container) -> should close
      fireClick(backdrop);
      assert.equal(closeCount, 1, 'Clicking outer backdrop must trigger onClose');
    } finally {
      unmount();
    }
  });

  await testCase('Mechanism 3: Escape keydown on window triggers onClose()', () => {
    let closeCount = 0;
    const { unmount } = render(
      <StageDetailsDrawer
        isOpen={true}
        node={MOCK_BASE_NODE}
        onClose={() => { closeCount++; }}
      />
    );
    try {
      // Non-Escape key does not trigger
      fireKeyDown(window, 'Tab');
      fireKeyDown(window, 'Enter');
      assert.equal(closeCount, 0, 'Non-Escape keys must not trigger onClose');

      // Escape key triggers
      fireKeyDown(window, 'Escape');
      assert.equal(closeCount, 1, 'Escape key must trigger onClose');
    } finally {
      unmount();
    }
  });

  await testCase('Body scroll locking: locks document.body.style.overflow while open and restores on unmount', () => {
    document.body.style.overflow = 'auto';

    const { unmount } = render(
      <StageDetailsDrawer
        isOpen={true}
        node={MOCK_BASE_NODE}
        onClose={() => {}}
      />
    );

    assert.equal(document.body.style.overflow, 'hidden', 'Body overflow must be set to hidden when open');

    unmount();
    assert.equal(document.body.style.overflow, 'auto', 'Body overflow must be restored after unmount');
  });

  // =========================================================================
  // 8. ACCESSIBILITY ATTRIBUTES: role="dialog", aria-modal, aria-labelledby
  // =========================================================================
  console.log('\n--- 8. Accessibility Attributes (WCAG 2.1 AA) ---');

  await testCase('validates role="dialog", aria-modal, and labelledby/describedby relationships', () => {
    const { container, unmount } = render(
      <StageDetailsDrawer
        isOpen={true}
        node={MOCK_BASE_NODE}
        onClose={() => {}}
      />
    );
    try {
      const dialog = container.querySelector('[role="dialog"]') as HTMLElement;
      assert.ok(dialog, 'Element with role="dialog" must exist');
      assert.equal(dialog.getAttribute('aria-modal'), 'true');
      assert.equal(dialog.getAttribute('aria-labelledby'), 'stage-drawer-title');
      assert.equal(dialog.getAttribute('aria-describedby'), 'stage-drawer-description');

      const title = container.querySelector('#stage-drawer-title');
      assert.ok(title, 'Heading element with id="stage-drawer-title" must exist');
      assert.equal(title.textContent?.trim(), MOCK_BASE_NODE.title);

      const desc = container.querySelector('#stage-drawer-description');
      assert.ok(desc, 'Description element with id="stage-drawer-description" must exist');
      assert.equal(desc.textContent?.trim(), MOCK_BASE_NODE.technicalDescription);
    } finally {
      unmount();
    }
  });

  await testCase('focus management: auto-focuses close button when opened', async () => {
    const { container, unmount } = render(
      <StageDetailsDrawer
        isOpen={true}
        node={MOCK_BASE_NODE}
        onClose={() => {}}
      />
    );
    try {
      const closeBtn = container.querySelector('[aria-label="Fechar painel de detalhes"]') as HTMLButtonElement;
      assert.ok(closeBtn);

      // Wait for the 50ms focus timer in StageDetailsDrawer
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 80));
      });

      assert.equal(
        document.activeElement,
        closeBtn,
        'Close button must be focused after drawer opens'
      );
    } finally {
      unmount();
    }
  });

  printSummary();
}

runTests();
