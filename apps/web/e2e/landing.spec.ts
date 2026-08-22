import { test, expect } from '@playwright/test';

test('landing mostra a proposta Trauner', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Venda qualquer coisa.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Começar gratuitamente' }).first()).toBeVisible();
});
