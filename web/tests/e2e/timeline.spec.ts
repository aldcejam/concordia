import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('trilha e drawer funcionam no dispositivo alvo', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Residencial Vista Verde', { exact: true })).toBeVisible();
  await expect(page.locator('[data-node-id]')).toHaveCount(7);
  await expect(page.locator('body')).toHaveCSS('font-family', /Manrope/);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
  expect(overflow).toBe(true);

  await page.getByRole('button', { name: 'Guia da EAP e Memorial descritivo' }).click();
  const drawer = page.getByRole('dialog');
  await expect(drawer).toBeVisible();
  await expect(page.getByRole('button', { name: 'Fechar painel de detalhes' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(drawer).toHaveCount(0);
});

test('estado vazio não cria etapas artificiais', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-node-id]')).toHaveCount(7);
  await expect(page.getByRole('main')).not.toContainText('Nenhum serviço cadastrado nesta macroetapa.');
});

test('aplicação inicial não tem violações críticas de acessibilidade', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((violation) => violation.impact === 'critical')).toEqual([]);
});
