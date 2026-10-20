import { test, expect, type Page, type Route } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const obraId = 'obra-demo';

const etapa = (id: string, codigoEap: string, nome: string, macroetapa: string, extra: object = {}) => ({
  id,
  codigoEap,
  nome,
  macroetapa,
  posicao: Number(codigoEap.replace(/\./g, '')),
  percentualExecutado: 0,
  quantidadeOrcada: 1,
  quantidadeExecutada: 0,
  valorTotalOrcado: 1000,
  valorUnitarioOrcado: 1000,
  unidadeOrcamento: 'UN',
  bloqueada: false,
  predecessoras: [],
  sucessoras: [],
  ...extra,
});

function etapasIniciais() {
  return [
    etapa('e-fundacao', '3.1.1', 'ESCAVAÇÃO PARA BLOCO DE COROAMENTO', 'FUNDAÇÃO / CONTENÇÃO › FUNDAÇÕES', {
      sucessoras: [
        { dependenciaId: 'd1', etapaId: 'e-pilar', codigoEap: '4.1.1', nome: 'PILAR EM CONCRETO ARMADO', tipo: 'FI', desfasamentoDias: 0, obrigatoria: true, satisfeita: false },
      ],
    }),
    etapa('e-pilar', '4.1.1', 'PILAR EM CONCRETO ARMADO', 'SUPERESTRUTURA › PILARES', {
      bloqueada: true,
      predecessoras: [
        { dependenciaId: 'd1', etapaId: 'e-fundacao', codigoEap: '3.1.1', nome: 'ESCAVAÇÃO PARA BLOCO DE COROAMENTO', tipo: 'FI', desfasamentoDias: 0, obrigatoria: true, satisfeita: false },
      ],
    }),
    etapa('e-drenagem', '8.1.1', 'TUBO PVC DN 150MM PARA DRENAGEM', 'INSTALAÇÕES › DRENAGEM'),
  ];
}

const dependenciaD1 = {
  id: 'd1',
  predecessora: { id: 'e-fundacao', codigoEap: '3.1.1', nome: 'ESCAVAÇÃO PARA BLOCO DE COROAMENTO' },
  sucessora: { id: 'e-pilar', codigoEap: '4.1.1', nome: 'PILAR EM CONCRETO ARMADO' },
  tipo: 'FI',
  desfasamentoDias: 0,
  obrigatoria: true,
  satisfeita: false,
};

interface Estado {
  etapas: ReturnType<typeof etapasIniciais>;
  dependencias: object[];
  posts: Record<string, unknown>[];
}

async function setupApi(page: Page): Promise<Estado> {
  const estado: Estado = { etapas: etapasIniciais(), dependencias: [dependenciaD1], posts: [] };
  await page.addInitScript(() => {
    document.addEventListener('DOMContentLoaded', () => {
      const style = document.createElement('style');
      style.textContent = 'ds-overlay { display: none !important; }';
      document.head.append(style);
    }, { once: true });
  });

  const json = (route: Route, status: number, body: unknown) =>
    route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });

  await page.route('**/api/obras**', async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    if (path === '/api/obras') return json(route, 200, [{ id: obraId, descricao: 'OBRA DEMO DEPENDÊNCIAS' }]);
    if (path === `/api/obras/${obraId}`) return json(route, 200, { id: obraId, descricao: 'OBRA DEMO DEPENDÊNCIAS', uf: 'RN' });
    if (path === `/api/obras/${obraId}/etapas`) return json(route, 200, estado.etapas);
    if (path === `/api/obras/${obraId}/dependencias` && request.method() === 'GET') {
      return json(route, 200, estado.dependencias);
    }
    if (path === `/api/obras/${obraId}/dependencias` && request.method() === 'POST') {
      const body = request.postDataJSON();
      estado.posts.push(body);
      if (body.predecessoraId === 'e-pilar' && body.sucessoraId === 'e-fundacao') {
        return json(route, 409, {
          title: 'Conflito',
          status: 409,
          detail: 'Vínculo recusado: criaria um ciclo na EAP (4.1.1 → 3.1.1 → 4.1.1). Uma etapa não pode depender, direta ou indiretamente, de si mesma.',
        });
      }
      const nova = {
        id: 'd2',
        predecessora: { id: body.predecessoraId, codigoEap: '3.1.1', nome: 'ESCAVAÇÃO PARA BLOCO DE COROAMENTO' },
        sucessora: { id: body.sucessoraId, codigoEap: '8.1.1', nome: 'TUBO PVC DN 150MM PARA DRENAGEM' },
        tipo: body.tipo,
        desfasamentoDias: body.desfasamentoDias,
        obrigatoria: body.obrigatoria,
        satisfeita: false,
      };
      estado.dependencias = [...estado.dependencias, nova];
      estado.etapas = estado.etapas.map((e) =>
        e.id === 'e-drenagem'
          ? {
              ...e,
              bloqueada: body.tipo !== 'FF',
              predecessoras: [
                { dependenciaId: 'd2', etapaId: body.predecessoraId, codigoEap: '3.1.1', nome: 'ESCAVAÇÃO PARA BLOCO DE COROAMENTO', tipo: body.tipo, desfasamentoDias: body.desfasamentoDias, obrigatoria: body.obrigatoria, satisfeita: false },
              ],
            }
          : e,
      );
      return json(route, 201, nova);
    }
    return route.continue();
  });
  return estado;
}

test('UC06: lista etapas, vínculos e etapas bloqueadas', async ({ page }) => {
  await setupApi(page);
  await page.goto(`/obras/${obraId}/dependencias`);

  await expect(page.getByRole('heading', { name: 'OBRA DEMO DEPENDÊNCIAS' })).toBeVisible();
  await expect(page.getByText('Matriz de dependências (1)')).toBeVisible();
  const editor = page.locator('section').filter({ hasText: 'Adicionar predecessora' }).first();
  await expect(editor.getByRole('heading', { name: 'ESCAVAÇÃO PARA BLOCO DE COROAMENTO' })).toBeVisible();

  await page.getByRole('navigation', { name: 'Etapas da obra' }).getByRole('button', { name: /4\.1\.1/ }).click();
  await expect(page.getByText('Bloqueada na trilha')).toBeVisible();
  await expect(page.getByText('Depende de (1)')).toBeVisible();
});

test('UC06 (passo 3): recusa vínculo que criaria ciclo e exibe o caminho', async ({ page }) => {
  await setupApi(page);
  await page.goto(`/obras/${obraId}/dependencias`);

  await page.getByRole('navigation', { name: 'Etapas da obra' }).getByRole('button', { name: /3\.1\.1/ }).click();
  await page.getByRole('combobox', { name: 'Etapa predecessora' }).fill('pilar');
  await page.getByRole('option', { name: /4\.1\.1/ }).click();
  await page.getByRole('button', { name: 'Vincular predecessora' }).click();

  const alerta = page.getByRole('alert').filter({ hasText: 'Vínculo não salvo' });
  await expect(alerta).toBeVisible();
  await expect(alerta).toContainText('criaria um ciclo na EAP (4.1.1 → 3.1.1 → 4.1.1)');
  await expect(page.getByText('Matriz de dependências (1)')).toBeVisible();
});

test('UC06 (passo 4): salva vínculo e atualiza a regra de liberação', async ({ page }) => {
  const estado = await setupApi(page);
  await page.goto(`/obras/${obraId}/dependencias`);

  await page.getByRole('navigation', { name: 'Etapas da obra' }).getByRole('button', { name: /8\.1\.1/ }).click();
  await expect(page.getByText('Liberada na trilha')).toBeVisible();

  await page.getByRole('combobox', { name: 'Etapa predecessora' }).fill('3.1');
  await page.getByRole('option', { name: /3\.1\.1/ }).click();
  await page.getByLabel('Tipo de vínculo').selectOption('II');
  await page.getByLabel('Desfasamento').fill('2');
  await page.getByRole('button', { name: 'Vincular predecessora' }).click();

  await expect(page.getByText('8.1.1 agora depende de 3.1.1 (II).')).toBeVisible();
  await expect(page.getByText('Bloqueada na trilha')).toBeVisible();
  await expect(page.getByText('Matriz de dependências (2)')).toBeVisible();
  expect(estado.posts.at(-1)).toEqual({
    predecessoraId: 'e-fundacao',
    sucessoraId: 'e-drenagem',
    tipo: 'II',
    desfasamentoDias: 2,
    obrigatoria: true,
  });
});

test('UC06: trilha mostra o cadeado e a predecessora pendente', async ({ page }) => {
  await setupApi(page);
  await page.goto(`/obras/${obraId}`);

  await page.getByRole('button', { name: /SUPERESTRUTURA/ }).click();
  await expect(page.getByText('BLOQUEADA • AGUARDA 3.1.1')).toBeVisible();
  await page.getByRole('button', { name: 'Dependências' }).click();
  await expect(page).toHaveURL(new RegExp(`/obras/${obraId}/dependencias$`));
});

test('UC06: tela de dependências sem violações críticas de acessibilidade', async ({ page }) => {
  await setupApi(page);
  await page.goto(`/obras/${obraId}/dependencias`);
  await expect(page.getByText('Matriz de dependências (1)')).toBeVisible();

  const results = await new AxeBuilder({ page }).exclude('ds-overlay').analyze();
  expect(results.violations.filter((v) => v.impact === 'critical')).toEqual([]);
});
