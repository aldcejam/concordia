import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const description = 'COMPLEMENTAÇÃO DA OBRA DA ESCOLA MULTICAMPI DE CIÊNCIAS MÉDICAS (EMCM) - INFRAESTRUTURA E URBANIZAÇÃO - COM DESCONTO LINEAR';
const obraId = 'obra-teste';
const initialStages = [
  { id: 'A', nome: 'Placa de obra', codigoEap: '1.1.1', macroetapa: 'SERVIÇOS PRELIMINARES › CANTEIRO' },
  { id: 'B', nome: 'Placa de licenciamento', codigoEap: '1.1.2', macroetapa: 'SERVIÇOS PRELIMINARES › CANTEIRO' },
  { id: 'D', nome: 'Ligação elétrica', codigoEap: '1.1.3', macroetapa: 'SERVIÇOS PRELIMINARES › CANTEIRO' },
  { id: 'C', nome: 'Drenagem do pórtico', codigoEap: '8.1.1', macroetapa: 'DRENAGEM › PÓRTICO' },
].map((stage, index) => ({ ...stage, descricao: stage.nome, posicao: index, inicio: `2026-10-${15 + index}T08:00:00-03:00`, fim: `2026-10-${20 + index}T08:00:00-03:00`, prazoEsperadoDias: 5, percentualExecutado: 0, quantidadeOrcada: 1, quantidadeExecutada: 0, valorTotalOrcado: 100, valorUnitarioOrcado: 100, unidadeOrcamento: 'UN' }));

type SetupOptions = { missingDates?: boolean; failAnalysis?: boolean; conflictPreview?: boolean; noCandidates?: boolean; empty?: boolean; serverError?: boolean; failConfirm?: boolean; savedDelay?: boolean };
async function setupApi(page: Page, options: SetupOptions = {}) {
  // Developer annotations are outside the product flow and cover the mobile viewport.
  await page.addInitScript(() => {
    document.addEventListener('DOMContentLoaded', () => {
      const style = document.createElement('style'); style.textContent = 'ds-overlay { display: none !important; }'; document.head.append(style);
    }, { once: true });
  });
  let applied = false;
  let analyses = 0;
  let saved = Boolean(options.savedDelay);
  const requests: { path: string; method: string; body: any }[] = [];
  const stages = options.empty ? [] : initialStages.map(stage => options.missingDates ? { ...stage, inicio: null, fim: null, prazoEsperadoDias: null } : stage);
  const before = { versao: 1, etapas: stages.map((stage, order) => ({ id: stage.id, descricao: stage.nome, ordem: order, inicio: stage.inicio, fim: stage.fim, duracaoDias: stage.prazoEsperadoDias, status: 'NAO_INICIADA', predecessores: [] })) };
  const afterIds = ['A', 'C', 'D', 'B'];
  const after = { versao: 2, etapas: afterIds.map((id, order) => ({ ...before.etapas.find(stage => stage.id === id), ordem: order, inicio: '2026-10-13T08:00:00-03:00', fim: id === 'A' ? '2026-10-25T08:00:00-03:00' : '2026-10-18T08:00:00-03:00' })) };
  const recommendations = options.noCandidates ? [] : [
    { etapaId: 'B', justificativa: 'Equipe independente disponível.' },
    { etapaId: 'D', justificativa: 'Materiais disponíveis no canteiro.' },
    { etapaId: 'C', justificativa: 'Pode começar em outra frente da obra.' },
  ];
  const delay = (status: string) => ({ id: 'atraso-teste', etapaId: 'A', motivo: 'Entrega atrasada', diasAtraso: 5, status, sugestoes: recommendations });
  const preview = { antes: before, depois: after, terminoAntes: '2026-10-23T08:00:00-03:00', terminoDepois: '2026-10-25T08:00:00-03:00' };
  await page.route('**/api/obras**', async route => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    const method = request.method();
    const body = method === 'GET' ? null : request.postDataJSON();
    requests.push({ path, method, body });
    const respond = (value: unknown, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(value) });
    if (path === '/api/obras') return respond([{ id: obraId, descricao: description }]);
    if (path.endsWith('/etapas')) {
      if (options.serverError) return respond({ detail: 'Falha de leitura' }, 500);
      return respond(stages.map(stage => applied ? { ...stage, inicio: '2026-10-13T08:00:00-03:00', fim: '2026-10-18T08:00:00-03:00' } : stage));
    }
    if (path.endsWith('/cronograma')) return respond({ obraId, fusoHorario: 'America/Fortaleza', cronograma: applied ? after : before, atrasos: applied ? [{ ...delay('APLICADO'), selecionadas: ['C', 'D'], resultado: preview }] : saved ? [delay(analyses ? 'PRONTO' : 'REGISTRADO')] : [] });
    if (path.endsWith('/atrasos')) { saved = true; return respond(delay('REGISTRADO'), 201); }
    if (path.endsWith('/analise')) {
      analyses++;
      if (options.failAnalysis && analyses === 1) return respond({ ...delay('FALHOU'), erro: 'IA temporariamente indisponível' });
      return respond(delay('PRONTO'));
    }
    if (path.endsWith('/simulacao')) {
      if (options.conflictPreview) return respond({ detail: 'O cronograma mudou. Gere novas sugestões.' }, 409);
      return respond(preview);
    }
    if (path.endsWith('/aplicacao')) { if (options.failConfirm) return respond({ detail: 'O cronograma mudou. Gere novas sugestões.' }, 409); applied = true; return respond({ ...delay('APLICADO'), resultado: preview }); }
    throw new Error(`Requisição inesperada: ${method} ${path}`);
  });
  await page.goto('/');
  if (options.serverError) await expect(page.getByRole('alert')).toContainText('Não foi possível carregar');
  else await expect(page.getByRole('heading', { name: description })).toBeVisible();
  return requests;
}
async function indicateDelay(page: Page) {
  await page.locator('[data-node-id="A"]').click();
  await page.getByRole('button', { name: 'Indicar atraso' }).click();
  await page.getByLabel('Previsão de atraso (dias)').fill('5');
  await page.getByLabel('Motivo do atraso').fill('Entrega atrasada');
  await page.getByRole('button', { name: 'Analisar adiantamentos' }).click();
}

test('seleciona ramificações, altera ordem, confere datas e persiste sequência entre macroetapas', async ({ page }) => {
  const requests = await setupApi(page);
  await indicateDelay(page);
  await expect(page.getByRole('region', { name: 'Opções de adiantamento' })).toBeVisible();
  const button = (code: string) => page.getByRole('button', { name: new RegExp(`^Selecionar ${code}`) });
  await button('1.1.2').click();
  await expect(button('1.1.2')).toHaveAttribute('aria-pressed', 'true');
  await button('1.1.2').click();
  await expect(button('1.1.2')).toHaveAttribute('aria-pressed', 'false');
  await button('1.1.3').click(); await button('8.1.1').click();
  await page.getByRole('button', { name: 'Mover 8.1.1 para cima' }).click();
  const selected = page.getByRole('list', { name: 'Ordem das etapas selecionadas' });
  await expect(selected.locator('li').first()).toContainText('Drenagem do pórtico');
  await expect(page.getByRole('button', { name: 'Confirmar sequência e datas' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Conferir sequência e datas' }).click();
  await expect(page.getByRole('table')).toContainText('25/10/2026');
  // Changing order discards an outdated preview.
  await page.getByRole('button', { name: 'Mover 8.1.1 para baixo' }).click();
  await expect(page.getByRole('table')).toHaveCount(0);
  await page.getByRole('button', { name: 'Mover 8.1.1 para cima' }).click();
  await page.getByRole('button', { name: 'Conferir sequência e datas' }).click();
  await page.getByRole('button', { name: 'Confirmar sequência e datas' }).click();
  await expect(page.getByRole('status')).toContainText('Sequência e datas atualizadas');
  expect(await page.locator('[data-stage-id]').evaluateAll(elements => elements.map(element => element.getAttribute('data-stage-id')))).toEqual(['A', 'C', 'D', 'B']);
  expect(requests.filter(request => request.path.endsWith('/aplicacao')).map(request => request.body)).toEqual([{ etapaIds: ['C', 'D'] }]);
  expect(requests.some(request => request.path.includes('dependencias'))).toBe(false);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Cronograma reprogramado' })).toBeVisible();
  expect(await page.locator('[data-stage-id]').evaluateAll(elements => elements.map(element => element.getAttribute('data-stage-id')))).toEqual(['A', 'C', 'D', 'B']);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('repete análise sem cadastrar o atraso duas vezes', async ({ page }) => {
  const requests = await setupApi(page, { failAnalysis: true });
  await indicateDelay(page);
  await expect(page.getByRole('alert')).toContainText('IA temporariamente indisponível');
  await page.getByRole('button', { name: 'Repetir análise' }).click();
  await expect(page.getByRole('region', { name: 'Opções de adiantamento' })).toBeVisible();
  expect(requests.filter(request => request.path.endsWith('/atrasos'))).toHaveLength(1);
  expect(requests.filter(request => request.path.endsWith('/analise'))).toHaveLength(2);
});

test('conflito no cronograma bloqueia a confirmação e oferece nova análise', async ({ page }) => {
  const requests = await setupApi(page, { conflictPreview: true });
  await indicateDelay(page);
  await page.getByRole('button', { name: /^Selecionar 1.1.2/ }).click();
  await page.getByRole('button', { name: 'Conferir sequência e datas' }).click();
  await expect(page.getByRole('alert')).toContainText('O cronograma mudou');
  await expect(page.getByRole('button', { name: 'Confirmar sequência e datas' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Atualizar análise' }).click();
  await expect(page.getByRole('alert')).toHaveCount(0);
  expect(requests.filter(request => request.path.endsWith('/aplicacao'))).toHaveLength(0);
});

test('explica a falta de planejamento e não inventa datas', async ({ page }) => {
  const requests = await setupApi(page, { missingDates: true });
  await page.locator('[data-node-id="A"]').click();
  await page.getByRole('button', { name: 'Indicar atraso' }).click();
  await page.getByLabel('Previsão de atraso (dias)').fill('5');
  await page.getByLabel('Motivo do atraso').fill('Entrega atrasada');
  await expect(page.getByText(/4 etapa\(s\) sem datas/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Analisar adiantamentos' })).toBeDisabled();
  await page.getByRole('button', { name: 'Salvar apontamento' }).click();
  await expect(page.getByText('O apontamento foi salvo.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Análise indisponível (sem planejamento)' })).toBeDisabled();
  expect(requests.filter(request => request.path.endsWith('/atrasos'))).toHaveLength(1);
  expect(requests.filter(request => request.path.endsWith('/analise'))).toHaveLength(0);
});

test('sem candidatas permite simular apenas o impacto do atraso', async ({ page }) => {
  const requests = await setupApi(page, { noCandidates: true });
  await indicateDelay(page);
  await expect(page.getByText('Nenhuma etapa elegível para adiantamento')).toBeVisible();
  await page.getByRole('button', { name: 'Conferir sequência e datas' }).click();
  await expect(page.getByRole('table')).toBeVisible();
  expect(requests.find(request => request.path.endsWith('/simulacao'))?.body).toEqual({ etapaIds: [] });
});

test('popover funciona por teclado e devolve o foco ao nó', async ({ page }) => {
  await setupApi(page);
  const trigger = page.locator('[data-node-id="A"]');
  await trigger.focus(); await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test('estado vazio mantém a trilha vazia', async ({ page }) => {
  await setupApi(page, { empty: true });
  await expect(page.locator('[data-node-id]')).toHaveCount(0);
  await expect(page.getByText('Nenhum serviço cadastrado nesta macroetapa.')).toBeVisible();
});

test('falha na leitura da API mostra erro recuperável', async ({ page }) => {
  await setupApi(page, { serverError: true });
  await expect(page.getByRole('alert')).toContainText('Não foi possível carregar');
  await expect(page.getByRole('button', { name: 'Tentar novamente' })).toBeVisible();
});

test('seleção não tem violações críticas de acessibilidade', async ({ page }) => {
  await setupApi(page);
  await indicateDelay(page);
  await expect(page.getByRole('region', { name: 'Opções de adiantamento' })).toBeVisible();
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter(violation => violation.impact === 'critical')).toEqual([]);
});

test('falha na confirmação descarta a prévia e exige atualizar a análise', async ({ page }) => {
  await setupApi(page, { failConfirm: true });
  await indicateDelay(page);
  await page.getByRole('button', { name: /^Selecionar 1.1.2/ }).click();
  await page.getByRole('button', { name: 'Conferir sequência e datas' }).click();
  await page.getByRole('button', { name: 'Confirmar sequência e datas' }).click();
  await expect(page.getByRole('alert')).toContainText('O cronograma mudou');
  await expect(page.getByRole('table')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Confirmar sequência e datas' })).toHaveCount(0);
});

test('retoma apontamento salvo sem duplicar o registro', async ({ page }) => {
  const requests = await setupApi(page, { savedDelay: true });
  await page.locator('[data-node-id="A"]').click();
  await page.getByRole('button', { name: 'Repetir análise' }).click();
  await expect(page.getByRole('region', { name: 'Opções de adiantamento' })).toBeVisible();
  expect(requests.filter(request => request.path.endsWith('/atrasos'))).toHaveLength(0);
});

test('cadastra obra pela interface e abre seu cronograma', async ({ page }) => {
  const newWork = { id: 'obra-nova', descricao: 'Reforma da Unidade de Saúde', uf: 'CE', fusoHorario: 'America/Fortaleza' };
  let createBody: Record<string, unknown> | null = null;
  let created = false;
  await page.addInitScript(() => {
    document.addEventListener('DOMContentLoaded', () => {
      const style = document.createElement('style'); style.textContent = 'ds-overlay { display: none !important; }'; document.head.append(style);
    }, { once: true });
  });
  await page.route('**/api/obras**', async route => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    if (path === '/api/obras' && request.method() === 'GET') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(created ? [newWork] : []) });
    }
    if (path === '/api/obras' && request.method() === 'POST') {
      createBody = request.postDataJSON();
      created = true;
      return route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify(newWork) });
    }
    if (path === '/api/obras/obra-nova/etapas') return route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    if (path === '/api/obras/obra-nova/cronograma') return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ obraId: 'obra-nova', fusoHorario: 'America/Fortaleza', cronograma: { etapas: [] }, atrasos: [] }) });
    throw new Error(`Requisição inesperada: ${request.method()} ${path}`);
  });

  await page.goto('/');
  await page.getByRole('heading', { name: 'Nenhuma obra cadastrada' }).waitFor();
  await page.getByRole('link', { name: 'Cadastrar obra' }).click();
  await page.getByLabel(/Nome da obra/).fill(newWork.descricao);
  await page.getByRole('button', { name: 'Cadastrar obra' }).click();

  await expect(page).toHaveURL(/obraId=obra-nova/);
  await expect(page.getByRole('heading', { name: newWork.descricao })).toBeVisible();
  expect(createBody).toEqual({ descricao: newWork.descricao, uf: 'CE', fusoHorario: 'America/Fortaleza' });
  await page.getByRole('link', { name: 'Obras' }).click();
  await expect(page.getByRole('link', { name: /Reforma da Unidade de Saúde/ })).toBeVisible();
});
