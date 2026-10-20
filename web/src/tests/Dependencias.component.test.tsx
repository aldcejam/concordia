import assert from 'node:assert/strict';
import { act } from 'react';
import { DependencyLinkItem } from '@/components/molecules/DependencyLinkItem/DependencyLinkItem';
import { EtapaPicker } from '@/components/molecules/EtapaPicker/EtapaPicker';
import { DependencyEditor } from '@/components/organisms/DependencyEditor/DependencyEditor';
import { DependencyTable } from '@/components/organisms/DependencyTable/DependencyTable';
import { EtapaNavigator } from '@/components/organisms/EtapaNavigator/EtapaNavigator';
import { dependenciasFixture, etapasDependenciasFixture } from '@/system-design/importacaoFixtures';
import type { NovaDependencia } from '@/types/dependencias';
import { setupTestDom, render, fireClick, fireInput, createTestRunner } from './testUtils';

setupTestDom();
const { testCase, printSummary } = createTestRunner('UC06 CONFIGURAR DEPENDÊNCIAS — COMPONENTES');

const [fundacao, estrutura, alvenaria, drenagem] = etapasDependenciasFixture;

function openPicker(container: HTMLElement): HTMLInputElement {
  const input = container.querySelector('input[role="combobox"]') as HTMLInputElement;
  act(() => input.focus());
  return input;
}

async function runTests() {
  console.log('--- EtapaPicker ---');

  await testCase('filtra por código ou nome ignorando acentos e seleciona', () => {
    let escolhida: string | null = null;
    const { container, unmount } = render(
      <EtapaPicker
        etapas={etapasDependenciasFixture.map((e) => ({ id: e.id!, codigoEap: e.codigoEap, nome: e.nome }))}
        value={null}
        onChange={(id) => (escolhida = id)}
      />,
    );
    const input = openPicker(container);
    assert.equal(container.querySelectorAll('[role="option"]').length, 4);
    fireInput(input, 'escavacao');
    const options = container.querySelectorAll('[role="option"]');
    assert.equal(options.length, 1);
    assert.ok(options[0].textContent?.includes('3.1.1'));
    fireClick(options[0]);
    assert.equal(escolhida, 'etapa-fundacao');
    unmount();
  });

  await testCase('mostra mensagem quando nada corresponde', () => {
    const { container, unmount } = render(<EtapaPicker etapas={[]} value={null} onChange={() => {}} />);
    openPicker(container);
    assert.ok(container.textContent?.includes('Nenhuma etapa encontrada.'));
    unmount();
  });

  console.log('\n--- DependencyEditor ---');

  await testCase('lista predecessoras e sucessoras da etapa', () => {
    const { container, unmount } = render(
      <DependencyEditor etapa={estrutura} etapas={etapasDependenciasFixture} onAdd={() => {}} onRemove={() => {}} />,
    );
    assert.ok(container.textContent?.includes('Depende de (1)'));
    assert.ok(container.textContent?.includes('Etapas que dependem desta (1)'));
    assert.ok(container.textContent?.includes('Liberada na trilha'));
    unmount();
  });

  await testCase('etapa bloqueada exibe cadeado e situação', () => {
    const { container, unmount } = render(
      <DependencyEditor etapa={alvenaria} etapas={etapasDependenciasFixture} onAdd={() => {}} onRemove={() => {}} />,
    );
    assert.ok(container.textContent?.includes('Bloqueada na trilha'));
    assert.ok(container.textContent?.includes('aguardando'));
    unmount();
  });

  await testCase('opções excluem a própria etapa e predecessoras já vinculadas', () => {
    const { container, unmount } = render(
      <DependencyEditor etapa={estrutura} etapas={etapasDependenciasFixture} onAdd={() => {}} onRemove={() => {}} />,
    );
    openPicker(container);
    const codigos = Array.from(container.querySelectorAll('[role="option"]')).map((o) => o.textContent ?? '');
    assert.equal(codigos.length, 2);
    assert.ok(codigos.every((texto) => !texto.includes('4.1.1') && !texto.includes('3.1.1')));
    unmount();
  });

  await testCase('envia nova predecessora com tipo e desfasamento', () => {
    const enviados: NovaDependencia[] = [];
    const { container, unmount } = render(
      <DependencyEditor etapa={drenagem} etapas={etapasDependenciasFixture} onAdd={(d) => enviados.push(d)} onRemove={() => {}} />,
    );
    const submit = container.querySelector('button[type="submit"]') as HTMLButtonElement;
    assert.ok(submit.disabled, 'submit desabilitado sem predecessora');

    openPicker(container);
    const alvo = Array.from(container.querySelectorAll('[role="option"]')).find((o) => o.textContent?.includes('5.1.1'))!;
    fireClick(alvo);
    const select = container.querySelector('select') as HTMLSelectElement;
    act(() => {
      select.value = 'II';
      select.dispatchEvent(new window.Event('change', { bubbles: true }));
    });
    fireInput(container.querySelector('input[type="number"]') as HTMLInputElement, '3');
    assert.ok(!submit.disabled);
    act(() => {
      (container.querySelector('form') as HTMLFormElement).requestSubmit();
    });

    assert.deepEqual(enviados, [
      { predecessoraId: 'etapa-alvenaria', tipo: 'II', desfasamentoDias: 3, obrigatoria: true },
    ]);
    unmount();
  });

  await testCase('desfasamento fora do limite bloqueia o envio', () => {
    const { container, unmount } = render(
      <DependencyEditor etapa={drenagem} etapas={etapasDependenciasFixture} onAdd={() => {}} onRemove={() => {}} />,
    );
    fireInput(container.querySelector('input[type="number"]') as HTMLInputElement, '400');
    assert.ok(container.textContent?.includes('Inteiro entre -365 e 365'));
    unmount();
  });

  await testCase('exibe erro de ciclo devolvido pela API', () => {
    const { container, unmount } = render(
      <DependencyEditor
        etapa={fundacao}
        etapas={etapasDependenciasFixture}
        onAdd={() => {}}
        onRemove={() => {}}
        error="Vínculo recusado: criaria um ciclo na EAP (5.1.1 → 3.1.1 → 4.1.1 → 5.1.1)."
      />,
    );
    const alert = container.querySelector('[role="alert"]');
    assert.ok(alert?.textContent?.includes('criaria um ciclo na EAP'));
    unmount();
  });

  await testCase('remove vínculo pelo botão da lista', () => {
    const removidos: string[] = [];
    const { container, unmount } = render(
      <ul>
        <DependencyLinkItem vinculo={estrutura.predecessoras![0]} direction="predecessora" onRemove={(id) => removidos.push(id)} />
      </ul>,
    );
    fireClick(container.querySelector('button[aria-label^="Remover vínculo"]')!);
    assert.deepEqual(removidos, ['dep-1']);
    unmount();
  });

  console.log('\n--- EtapaNavigator e DependencyTable ---');

  await testCase('navegador agrupa por macroetapa e filtra etapas com vínculos', () => {
    const { container, unmount } = render(
      <EtapaNavigator etapas={etapasDependenciasFixture} selectedId="etapa-estrutura" onSelect={() => {}} />,
    );
    assert.ok(container.textContent?.includes('FUNDAÇÃO / CONTENÇÃO'));
    assert.equal(container.querySelectorAll('nav li button').length, 4);
    assert.ok(container.querySelector('[aria-current="true"]')?.textContent?.includes('4.1.1'));
    const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
    fireClick(checkbox);
    assert.equal(container.querySelectorAll('nav li button').length, 3);
    unmount();
  });

  await testCase('matriz lista vínculos e estado vazio', () => {
    const { container, unmount } = render(<DependencyTable dependencias={dependenciasFixture} onRemove={() => {}} />);
    assert.equal(container.querySelectorAll('tbody tr').length, 2);
    assert.ok(container.textContent?.includes('AGUARDANDO'));
    assert.ok(container.textContent?.includes('+2d'));
    unmount();

    const vazio = render(<DependencyTable dependencias={[]} />);
    assert.ok(vazio.container.textContent?.includes('Nenhuma dependência configurada'));
    vazio.unmount();
  });

  printSummary();
}

runTests();
