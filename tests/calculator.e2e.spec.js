import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const calculatorUrl = pathToFileURL(
  path.resolve(__dirname, '..', 'calculator.html'),
).href;

const display = (page) => page.locator('#display');

test('adds numbers and shows result', async ({ page }) => {
  await page.goto(calculatorUrl);

  await page.getByRole('button', { name: '1' }).click();
  await page.getByRole('button', { name: '2' }).click();
  await page.getByRole('button', { name: '+' }).click();
  await page.getByRole('button', { name: '3' }).click();
  await page.getByRole('button', { name: '=' }).click();

  await expect(display(page)).toHaveText('15');
});

test('multiplies decimals', async ({ page }) => {
  await page.goto(calculatorUrl);

  await page.getByRole('button', { name: '1' }).click();
  await page.getByRole('button', { name: '.' }).click();
  await page.getByRole('button', { name: '5' }).click();
  await page.getByRole('button', { name: '×' }).click();
  await page.getByRole('button', { name: '2' }).click();
  await page.getByRole('button', { name: '=' }).click();

  await expect(display(page)).toHaveText('3');
});

test('division by zero shows error', async ({ page }) => {
  await page.goto(calculatorUrl);

  await page.getByRole('button', { name: '9' }).click();
  await page.getByRole('button', { name: '/' }).click();
  await page.getByRole('button', { name: '0' }).click();
  await page.getByRole('button', { name: '=' }).click();

  await expect(display(page)).toHaveText('Ошибка');
});

test('new input after result resets display', async ({ page }) => {
  await page.goto(calculatorUrl);

  await page.getByRole('button', { name: '7' }).click();
  await page.getByRole('button', { name: '+' }).click();
  await page.getByRole('button', { name: '8' }).click();
  await page.getByRole('button', { name: '=' }).click();

  await expect(display(page)).toHaveText('15');

  // Next digit should replace the previous result
  await page.getByRole('button', { name: '9' }).click();
  await expect(display(page)).toHaveText('9');
});

