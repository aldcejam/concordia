import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const resumoValido = {
  formato: 'Planilha analítica (composições SINAPI)',
  nomeObra: 'COMPLEMENTAÇÃO DE OBRA - INFRAESTRUTURA E URBANIZAÇÃO',
  percentualBdi: 20.74,
  totalItens: 2,
  totalMacroetapas: 1,
  totalSubetapas: 1,
  composicoesProprias: 1,
  valorTotalSemBdi: 1907.1,
  valorTotalComBdi: 2302.7,
  somaPesos: 100,
  valida: true,
  erros: [],
  avisos: ['1 item(ns) cadastrado(s) como composição própria (sem código de banco oficial).'],
  eap: [
    {
      codigoEap: '1',
      nome: 'SERVIÇOS PRELIMINARES',
      itemServico: false,
      valorTotal: 2302.7,
      pesoPercentual: 100,
      quantidadeItens: 2,
      filhos: [
        {
          codigoEap: '1.1',
          nome: 'CANTEIRO',
          itemServico: false,
          valorTotal: 2302.7,
          pesoPercentual: 100,
          quantidadeItens: 2,
          filhos: [
            {
              codigoEap: '1.1.1',
              nome: 'PLACA DE OBRA EM CHAPA GALVANIZADA',
              itemServico: true,
              banco: 'SINAPI',
              codigoComposicao: '103689',
              unidade: 'm²',
              quantidade: 4.5,
              valorTotal: 1897.83,
              pesoPercentual: 82.4176,
              quantidadeItens: 1,
              filhos: [],
            },
          ],
        },
      ],
    },
  ],
};

async function hideDevOverlay(page: Page) {
  await page.addInitScript(() => {
    document.addEventListener('DOMContentLoaded', () => {
      const style = document.createElement('style');
      style.textContent = 'ds-overlay { display: none !important; }';
      document.head.append(style);
    }, { once: true });
  });
}

async function enviarPlanilha(page: Page, nome = 'orcamento_analitico.xlsx') {
  await page.locator('input[type="file"]').setInputFiles({
    name: nome,
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    buffer: Buffer.from('PK fake xlsx'),
  });
}

test.beforeEach(async ({ page }) => {
  await hideDevOverlay(page);
});

test('UC01: valida a planilha, mostra o resumo e importa a obra', async ({ page }) => {
  let importRequestUrl = '';
  await page.route('**/api/obras/importacoes/pre-visualizacao', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(resumoValido) }),
  );
  await page.route('**/api/obras/importacoes?**', (route) => {
    importRequestUrl = route.request().url();
    return route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({ idObra: 'obra-nova', descricaoObra: 'ESCOLA DEMO', resumo: resumoValido }),
    });
  });

  await page.goto('/obras/nova');
  await expect(page.getByRole('heading', { name: 'Importar orçamento' })).toBeVisible();

  await enviarPlanilha(page);
  await expect(page.getByText('Planilha válida')).toBeVisible();
  await expect(page.getByText('composição própria').first()).toBeVisible();
  await expect(page.getByText('R$ 2.302,70').first()).toBeVisible();
  await expect(page.getByRole('tree', { name: 'Estrutura analítica do projeto' })).toBeVisible();

  const descricao = page.getByLabel('Descrição da obra');
  await expect(descricao).toHaveValue(resumoValido.nomeObra);
  await descricao.fill('ESCOLA DEMO');
  await page.getByLabel('UF').selectOption('PB');

  await page.getByRole('button', { name: 'Importar e gerar trilha' }).click();
  await expect(page.getByText('Obra importada com sucesso!')).toBeVisible();
  expect(importRequestUrl).toContain('uf=PB');
  expect(importRequestUrl).toContain('descricao=ESCOLA+DEMO');

  await expect(page.getByRole('button', { name: 'Abrir trilha da obra' })).toBeVisible();
  await page.getByRole('button', { name: 'Configurar dependências' }).click();
  await expect(page).toHaveURL(/\/obras\/obra-nova\/dependencias$/);
});

test('UC01 (3a): exibe o relatório de erros quando a planilha é inválida', async ({ page }) => {
  await page.route('**/api/obras/importacoes/pre-visualizacao', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        formato: 'Planilha analítica (composições SINAPI)',
        valida: false,
        eap: [],
        avisos: [],
        erros: [{ linha: 17, coluna: 'H', mensagem: 'Item 1.1.1: quantidade "4,5O" não é um número válido.' }],
      }),
    }),
  );

  await page.goto('/obras/nova');
  await enviarPlanilha(page);

  const relatorio = page.getByRole('alert').filter({ hasText: 'impede a importação' });
  await expect(relatorio).toBeVisible();
  await expect(relatorio.getByRole('cell', { name: '17' })).toBeVisible();
  await expect(relatorio.getByText('quantidade "4,5O" não é um número válido')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Importar e gerar trilha' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Enviar outro arquivo' })).toBeVisible();
});

test('UC01: recusa arquivos que não são planilhas Excel sem chamar a API', async ({ page }) => {
  let chamadas = 0;
  await page.route('**/api/obras/importacoes/**', (route) => {
    chamadas++;
    return route.abort();
  });

  await page.goto('/obras/nova');
  await enviarPlanilha(page, 'orcamento.csv');

  await expect(page.getByText('Formato não suportado')).toBeVisible();
  expect(chamadas).toBe(0);
});

test('UC01: mostra o relatório devolvido pela API quando a importação responde 422', async ({ page }) => {
  await page.route('**/api/obras/importacoes/pre-visualizacao', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(resumoValido) }),
  );
  await page.route('**/api/obras/importacoes?**', (route) =>
    route.fulfill({
      status: 422,
      contentType: 'application/problem+json',
      body: JSON.stringify({
        title: 'Planilha Inválida',
        status: 422,
        detail: 'A planilha possui 1 erro(s) que impedem a importação.',
        erros: [{ linha: 9, coluna: 'A', mensagem: 'Código EAP 1.1.1 está duplicado.' }],
      }),
    }),
  );

  await page.goto('/obras/nova');
  await enviarPlanilha(page);
  await page.getByRole('button', { name: 'Importar e gerar trilha' }).click();

  await expect(page.getByText('Código EAP 1.1.1 está duplicado.')).toBeVisible();
  await expect(page.getByText('Obra importada com sucesso!')).toHaveCount(0);
});

test('UC01: tela de importação sem violações críticas de acessibilidade', async ({ page }) => {
  await page.route('**/api/obras/importacoes/pre-visualizacao', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(resumoValido) }),
  );
  await page.goto('/obras/nova');
  await enviarPlanilha(page);
  await expect(page.getByText('Planilha válida')).toBeVisible();

  const results = await new AxeBuilder({ page }).exclude('ds-overlay').analyze();
  expect(results.violations.filter((v) => v.impact === 'critical')).toEqual([]);
});
