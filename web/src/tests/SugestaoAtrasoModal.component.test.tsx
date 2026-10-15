import assert from 'node:assert/strict';
import { SugestaoAtrasoModal } from '@/components/molecules/SugestaoAtrasoModal';
import { setupTestDom, render, createTestRunner } from './testUtils';

setupTestDom();

const { testCase, printSummary } = createTestRunner('SUGESTAO ATRASO MODAL TEST SUITE');

async function runTests() {
  console.log('--- 1. Renderização e Estados do Modal ---');

  await testCase('não renderiza quando isOpen for false', () => {
    const { container, unmount } = render(
      <SugestaoAtrasoModal
        isOpen={false}
        onClose={() => {}}
        etapa={{ id: '1', nome: 'Fundação' }}
        obraId="obra-1"
      />
    );
    assert.equal(container.innerHTML, '', 'Modal não deve ter conteúdo no DOM quando isOpen=false');
    unmount();
  });

  await testCase('renderiza detalhes da etapa quando aberto', () => {
    const { container, unmount } = render(
      <SugestaoAtrasoModal
        isOpen={true}
        onClose={() => {}}
        etapa={{ id: 'etapa-1', codigoEap: '1.2.3', nome: 'Alvenaria de Vedação' }}
        obraId="obra-1"
      />
    );
    const dialog = container.querySelector('[role="dialog"]');
    assert.ok(dialog, 'Elemento com role="dialog" deve existir');

    const title = container.querySelector('#modal-title');
    assert.ok(title, 'Título do modal deve existir');
    assert.ok(title.textContent?.includes('Reprogramação com IA'));

    assert.ok(container.textContent?.includes('Alvenaria de Vedação'));
    assert.ok(container.textContent?.includes('1.2.3'));

    const textarea = container.querySelector('#motivo') as HTMLTextAreaElement;
    assert.ok(textarea, 'Campo motivo deve estar presente');

    const diasInput = container.querySelector('#diasAtraso') as HTMLInputElement;
    assert.ok(diasInput, 'Campo diasAtraso deve estar presente');
    assert.equal(diasInput.value, '5');

    unmount();
  });

  await testCase('aceita callback onEscolherEtapa nas props', () => {
    let selecionado = false;
    const { container, unmount } = render(
      <SugestaoAtrasoModal
        isOpen={true}
        onClose={() => {}}
        onEscolherEtapa={() => {
          selecionado = true;
        }}
        etapa={{ id: 'etapa-1', codigoEap: '1.2.3', nome: 'Alvenaria' }}
        obraId="obra-1"
      />
    );
    assert.ok(container.querySelector('[role="dialog"]'));
    assert.equal(selecionado, false);
    unmount();
  });

  printSummary();
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
