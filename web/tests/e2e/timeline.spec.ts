import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const description =
  'COMPLEMENTAÇÃO DA OBRA DA ESCOLA MULTICAMPI DE CIÊNCIAS MÉDICAS (EMCM) - INFRAESTRUTURA E URBANIZAÇÃO - COM DESCONTO LINEAR';
const obraId = 'obra-faculdade-demo';

const initialStages = [
  {
    id: 'etapa-1',
    nome: 'Placa de obra',
    codigoEap: '1.1.1',
    macroetapa: 'SERVIÇOS PRELIMINARES › CANTEIRO',
    posicao: 1000,
    percentualExecutado: 0,
    quantidadeOrcada: 1,
    quantidadeExecutada: 0,
    valorTotalOrcado: 2500,
    valorUnitarioOrcado: 2500,
    unidadeOrcamento: 'UN',
  },
  {
    id: 'etapa-2',
    nome: 'Alvenaria de vedação de blocos cerâmicos',
    codigoEap: '1.1.2',
    macroetapa: 'SERVIÇOS PRELIMINARES › CANTEIRO',
    posicao: 2000,
    percentualExecutado: 0,
    quantidadeOrcada: 120,
    quantidadeExecutada: 0,
    valorTotalOrcado: 14500,
    valorUnitarioOrcado: 120.83,
    unidadeOrcamento: 'M2',
  },
  {
    id: 'etapa-3',
    nome: 'Instalações elétricas embutidas',
    codigoEap: '1.1.3',
    macroetapa: 'SERVIÇOS PRELIMINARES › CANTEIRO',
    posicao: 3000,
    percentualExecutado: 0,
    quantidadeOrcada: 45,
    quantidadeExecutada: 0,
    valorTotalOrcado: 8900,
    valorUnitarioOrcado: 197.77,
    unidadeOrcamento: 'PT',
  },
];

async function setupApi(page: Page) {
  await page.addInitScript(() => {
    document.addEventListener('DOMContentLoaded', () => {
      const style = document.createElement('style');
      style.textContent = 'ds-overlay { display: none !important; }';
      document.head.append(style);
    }, { once: true });
  });

  await page.route('**/api/obras**', async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;

    if (path === '/api/obras') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{ id: obraId, descricao: description }]),
      });
    }

    if (path.endsWith('/etapas')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(initialStages),
      });
    }

    if (path.endsWith('/analise-atraso')) {
      const body = request.postDataJSON();
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          etapaAtrasadaId: body.etapaId,
          etapaAtrasadaCodigo: '1.1.1',
          etapaAtrasadaNome: 'Placa de obra',
          motivo: body.motivo,
          diasAtraso: body.diasAtraso,
          sugestoes: [
            {
              etapaId: 'etapa-2',
              codigoEap: '1.1.2',
              nome: 'Alvenaria de vedação de blocos cerâmicos',
              justificativa:
                'Pode ter equipe mobilizada antecipadamente para adiantar frentes independentes.',
            },
            {
              etapaId: 'etapa-3',
              codigoEap: '1.1.3',
              nome: 'Instalações elétricas embutidas',
              justificativa:
                'Insumos e tubulações podem ser preparados em bancada para execução paralela.',
            },
          ],
        }),
      });
    }

    return route.continue();
  });
}

test('exibe a trilha de etapas da obra e permite indicar atraso com IA', async ({ page }) => {
  await setupApi(page);
  await page.goto('/');

  // Aguarda carregamento da trilha e nome da obra
  await expect(page.getByRole('heading', { name: description })).toBeVisible();
  await expect(page.getByText('Placa de obra')).toBeVisible();

  // Clica no botão de indicar atraso e IA
  const btnIndicarAtraso = page.getByRole('button', { name: /Indicar Atraso & IA/i }).first();
  await expect(btnIndicarAtraso).toBeVisible();
  await btnIndicarAtraso.click();

  // Verifica abertura do modal
  const modal = page.getByRole('dialog');
  await expect(modal).toBeVisible();
  await expect(page.getByText('Reprogramação com IA')).toBeVisible();

  // Preenche dados do atraso
  const motivoInput = page.getByLabel(/Motivo do Atraso/i);
  await motivoInput.fill('Atraso no fornecimento do material da placa');

  const diasInput = page.getByLabel(/Dias Estimados de Atraso/i);
  await diasInput.fill('7');

  // Clica no botão de consultar IA
  await page.getByRole('button', { name: /Consultar IA para Opções de Adiantamento/i }).click();

  // Verifica exibição do diagnóstico e sugestões da IA
  await expect(page.getByText('Diagnóstico de Atraso')).toBeVisible();
  await expect(page.getByText('7 dias')).toBeVisible();
  await expect(modal.getByText('Alvenaria de vedação de blocos cerâmicos')).toBeVisible();
  await expect(modal.getByText('Instalações elétricas embutidas')).toBeVisible();
  await expect(modal.getByText(/Pode ter equipe mobilizada antecipadamente/)).toBeVisible();

  // Conclui modal e verifica tag de atraso na trilha
  await page.getByRole('button', { name: 'Concluir' }).click();
  await expect(modal).not.toBeVisible();
  await expect(page.getByText(/Atraso: 7d/)).toBeVisible();
});

test('não tem violações críticas de acessibilidade na trilha', async ({ page }) => {
  await setupApi(page);
  await page.goto('/');
  await expect(page.getByText('Placa de obra')).toBeVisible();

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((v) => v.impact === 'critical')).toEqual([]);
});
