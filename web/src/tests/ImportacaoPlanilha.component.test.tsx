import assert from 'node:assert/strict';
import { act } from 'react';
import { FileDropzone } from '@/components/molecules/FileDropzone/FileDropzone';
import { ImportErrorReport } from '@/components/molecules/ImportErrorReport/ImportErrorReport';
import { ImportSummaryStats } from '@/components/molecules/ImportSummaryStats/ImportSummaryStats';
import { EapTree } from '@/components/organisms/EapTree/EapTree';
import { ImportPreviewPanel } from '@/components/organisms/ImportPreviewPanel/ImportPreviewPanel';
import { resumoImportacaoFixture, resumoInvalidoFixture } from '@/system-design/importacaoFixtures';
import { ApiProblemError, ensureOk, problemErrors, problemMessage } from '@/services/apiProblem';
import { setupTestDom, render, fireClick, createTestRunner } from './testUtils';

const dom = setupTestDom();
const { testCase, printSummary } = createTestRunner('UC01 IMPORTAR PLANILHA ORÇAMENTÁRIA — COMPONENTES');

function selectFile(input: HTMLInputElement, name: string) {
  const file = new dom.window.File(['conteudo'], name);
  Object.defineProperty(input, 'files', { value: [file], configurable: true });
  act(() => {
    input.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
  });
}

async function runTests() {
  console.log('--- FileDropzone ---');

  await testCase('aceita planilha .xlsx e rejeita outras extensões', () => {
    const selecionados: string[] = [];
    const rejeitados: string[] = [];
    const { container, unmount } = render(
      <FileDropzone
        accept={['.xlsx', '.xls']}
        onFileSelected={(file) => selecionados.push(file.name)}
        onRejected={(file) => rejeitados.push(file.name)}
      />,
    );
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    assert.equal(input.getAttribute('accept'), '.xlsx,.xls');

    selectFile(input, 'orcamento.XLSX');
    selectFile(input, 'orcamento.csv');

    assert.deepEqual(selecionados, ['orcamento.XLSX']);
    assert.deepEqual(rejeitados, ['orcamento.csv']);
    unmount();
  });

  await testCase('mostra arquivo selecionado e estado de carregamento', () => {
    const file = new dom.window.File([new Uint8Array(2048)], 'orcamento_analitico.xlsx');
    const { container, unmount } = render(
      <FileDropzone accept={['.xlsx']} file={file} onFileSelected={() => {}} loading loadingLabel="Validando planilha…" />,
    );
    assert.ok(container.textContent?.includes('orcamento_analitico.xlsx'));
    assert.ok(container.textContent?.includes('2 KB'));
    assert.ok(container.textContent?.includes('Validando planilha…'));
    assert.ok((container.querySelector('input[type="file"]') as HTMLInputElement).disabled);
    unmount();
  });

  console.log('\n--- ImportErrorReport (fluxo de exceção 3a) ---');

  await testCase('lista erros com linha e coluna', () => {
    const { container, unmount } = render(
      <ImportErrorReport
        erros={[
          { linha: 17, coluna: 'H', mensagem: 'Item 1.1.1: quantidade "]" não é um número válido.' },
          { linha: null, coluna: null, mensagem: 'Nenhum item de serviço foi encontrado na planilha.' },
        ]}
      />,
    );
    assert.equal(container.querySelector('[role="alert"]')?.textContent?.includes('2 erros impedem a importação'), true);
    const rows = container.querySelectorAll('tbody tr');
    assert.equal(rows.length, 2);
    assert.equal(rows[0].children[0].textContent, '17');
    assert.equal(rows[0].children[1].textContent, 'H');
    assert.equal(rows[1].children[0].textContent, '—');
    unmount();
  });

  await testCase('não renderiza nada sem erros', () => {
    const { container, unmount } = render(<ImportErrorReport erros={[]} />);
    assert.equal(container.innerHTML, '');
    unmount();
  });

  console.log('\n--- Resumo, EAP e pré-visualização ---');

  await testCase('resumo exibe custo total, BDI e soma dos pesos', () => {
    const { container, unmount } = render(<ImportSummaryStats resumo={resumoImportacaoFixture} />);
    const text = container.textContent?.replace(/\u00a0/g, ' ') ?? '';
    assert.ok(text.includes('R$ 1.857.981,21'), text);
    assert.ok(text.includes('20,74%'));
    assert.ok(text.includes('100,00%'));
    assert.ok(text.includes('15 / 20'));
    unmount();
  });

  await testCase('EapTree expande macroetapas e mostra itens com peso', () => {
    const { container, unmount } = render(<EapTree nodes={resumoImportacaoFixture.eap ?? []} />);
    assert.ok(!container.textContent?.includes('1.1.1'), 'itens começam recolhidos');
    fireClick(container.querySelector('button[aria-label^="Expandir 1 "]')!);
    fireClick(container.querySelector('button[aria-label^="Expandir 1.1 "]')!);
    assert.ok(container.textContent?.includes('1.1.1'));
    assert.ok(container.textContent?.includes('SINAPI 103689'));
    assert.ok(container.textContent?.includes('6,14%'));
    fireClick(container.querySelector('button[aria-label^="Recolher 1 "]')!);
    assert.ok(!container.textContent?.includes('1.1.1'));
    unmount();
  });

  await testCase('EapTree vazia mostra estado vazio', () => {
    const { container, unmount } = render(<EapTree nodes={[]} />);
    assert.ok(container.textContent?.includes('Nenhuma etapa encontrada'));
    unmount();
  });

  await testCase('pré-visualização válida mostra sucesso, avisos e árvore', () => {
    const { container, unmount } = render(<ImportPreviewPanel resumo={resumoImportacaoFixture} fileName="orcamento.xlsx" />);
    assert.ok(container.textContent?.includes('Planilha válida'));
    assert.ok(container.textContent?.includes('composição própria'));
    assert.ok(container.querySelector('[role="tree"]'));
    unmount();
  });

  await testCase('pré-visualização inválida mostra relatório e oculta a árvore', () => {
    const { container, unmount } = render(<ImportPreviewPanel resumo={resumoInvalidoFixture} />);
    assert.ok(container.textContent?.includes('1 erro impede a importação'));
    assert.ok(container.textContent?.includes('Colunas obrigatórias ausentes'));
    assert.equal(container.querySelector('[role="tree"]'), null);
    unmount();
  });

  console.log('\n--- Adaptador de erros da API ---');

  await testCase('ensureOk converte ProblemDetail 422 em ApiProblemError com relatório', () => {
    const erros = [{ linha: 4, coluna: 'H', mensagem: 'quantidade inválida' }];
    assert.throws(
      () => ensureOk({ status: 422, data: { title: 'Planilha Inválida', detail: 'A planilha possui 1 erro(s).', erros } }),
      (error: unknown) => {
        assert.ok(error instanceof ApiProblemError);
        assert.equal(error.status, 422);
        assert.equal(problemMessage(error), 'A planilha possui 1 erro(s).');
        assert.deepEqual(problemErrors(error), erros);
        return true;
      },
    );
    assert.equal(ensureOk({ status: 201, data: { ok: true } }).status, 201);
  });

  await testCase('mensagem amigável quando a API está fora do ar', () => {
    assert.equal(
      problemMessage(new TypeError('Failed to fetch')),
      'Não foi possível conectar à API. Verifique se o backend está em execução.',
    );
  });

  printSummary();
}

runTests();
