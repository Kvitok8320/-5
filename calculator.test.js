import { describe, it, beforeEach, expect } from 'vitest';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { JSDOM } from 'jsdom';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Calculator (calculator.html)', () => {
  let window;
  let display;

  const loadCalculator = () => {
    const htmlPath = path.resolve(__dirname, 'calculator.html');
    const html = readFileSync(htmlPath, 'utf8');
    const dom = new JSDOM(html, {
      runScripts: 'dangerously',
      resources: 'usable',
    });

    window = dom.window;
    display = window.document.getElementById('display');
  };

  const getInput = () => window.eval('currentInput');
  const setInput = (val) => window.eval(`currentInput = ${JSON.stringify(val)}`);
  const setResetFlag = (val) => window.eval(`shouldResetDisplay = ${val}`);
  const getResetFlag = () => window.eval('shouldResetDisplay');

  beforeEach(() => {
    loadCalculator();
  });

  it('replaces leading zero when first digit is typed', () => {
    window.appendNumber('5');

    expect(getInput()).toBe('5');
    expect(display.textContent).toBe('5');
  });

  it('appends multiple digits in sequence', () => {
    window.appendNumber('1');
    window.appendNumber('2');
    window.appendNumber('3');

    expect(getInput()).toBe('123');
  });

  it('adds decimal point only once', () => {
    window.appendNumber('1');
    window.appendDecimal();
    window.appendDecimal(); // second call should be ignored

    expect(getInput()).toBe('1.');
  });

  it('resets pending result before adding decimal', () => {
    window.shouldResetDisplay = true;
    window.appendDecimal();

    expect(getInput()).toBe('0.');
  });

  it('replaces the last operator with a new one', () => {
    window.appendNumber('9');
    window.appendOperator('+');
    window.appendOperator('-');

    expect(getInput()).toBe('9-');
    expect(display.textContent).toBe('9-');
  });

  it('appends operator after a number', () => {
    window.appendNumber('4');
    window.appendOperator('*');
    window.appendNumber('2');

    expect(getInput()).toBe('4*2');
  });

  it('calculates valid expressions', () => {
    setInput('2+3*4');
    window.calculate();

    expect(getInput()).toBe('14');
    expect(display.textContent).toBe('14');
    expect(getResetFlag()).toBe(true);
  });

  it('handles division by zero with an error and resets on next input', () => {
    setInput('10/0');
    window.calculate();

    expect(getInput()).toBe('Ошибка');
    expect(getResetFlag()).toBe(true);

    window.appendNumber('7');
    expect(getInput()).toBe('7');
    expect(getResetFlag()).toBe(false);
  });

  it('marks invalid expressions as error', () => {
    setInput('2+*2');
    window.calculate();

    expect(getInput()).toBe('Ошибка');
    expect(getResetFlag()).toBe(true);
  });

  it('clears the display and state', () => {
    setInput('123');
    setResetFlag(true);

    window.clearDisplay();

    expect(getInput()).toBe('0');
    expect(getResetFlag()).toBe(false);
  });

  it('deletes last character and falls back to zero', () => {
    setInput('123');
    window.deleteLast();
    expect(getInput()).toBe('12');

    window.deleteLast();
    window.deleteLast();
    expect(getInput()).toBe('0');
  });

  it('deleteLast clears when result is pending reset', () => {
    setResetFlag(true);
    setInput('99');

    window.deleteLast();

    expect(getInput()).toBe('0');
    expect(getResetFlag()).toBe(false);
  });
});

