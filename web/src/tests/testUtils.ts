import { dom } from './setupDom';
import React from 'react';
import ReactDOMClient, { Root } from 'react-dom/client';
import { act } from 'react';

export function setupTestDom() {
  return dom;
}

export interface RenderResult {
  container: HTMLElement;
  root: Root;
  unmount: () => void;
  rerender: (ui: React.ReactElement) => void;
}

/**
 * Renders a React element into an isolated DOM container within the JSDOM environment.
 */
export function render(ui: React.ReactElement): RenderResult {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = ReactDOMClient.createRoot(container);

  act(() => {
    root.render(ui);
  });

  return {
    container,
    root,
    unmount: () => {
      act(() => {
        root.unmount();
      });
      container.remove();
    },
    rerender: (newUi: React.ReactElement) => {
      act(() => {
        root.render(newUi);
      });
    },
  };
}

/**
 * Dispatches a click event inside React's act environment.
 */
export function fireClick(element: Element): void {
  act(() => {
    (element as HTMLElement).click();
  });
}

/**
 * Dispatches an input/change event on an HTMLInputElement inside React's act environment.
 */
export function fireInput(input: HTMLInputElement, value: string | number): void {
  act(() => {
    const valStr = String(value);
    const win = input.ownerDocument.defaultView || globalThis.window;
    const tracker = (input as unknown as { _valueTracker?: { setValue: (v: string) => void } })._valueTracker;
    if (tracker) {
      tracker.setValue(valStr === input.value ? '' : input.value);
    }
    const nativeSetter = Object.getOwnPropertyDescriptor(
      win.HTMLInputElement.prototype,
      'value'
    )?.set;
    nativeSetter?.call(input, valStr);
    input.dispatchEvent(new win.Event('input', { bubbles: true }));
    input.dispatchEvent(new win.Event('change', { bubbles: true }));
  });
}

/**
 * Dispatches an input/change event on an HTMLTextAreaElement inside React's act environment.
 */
export function fireTextarea(textarea: HTMLTextAreaElement, value: string): void {
  act(() => {
    const win = textarea.ownerDocument.defaultView || globalThis.window;
    const tracker = (textarea as unknown as { _valueTracker?: { setValue: (v: string) => void } })._valueTracker;
    if (tracker) {
      tracker.setValue(value === textarea.value ? '' : textarea.value);
    }
    const nativeSetter = Object.getOwnPropertyDescriptor(
      win.HTMLTextAreaElement.prototype,
      'value'
    )?.set;
    nativeSetter?.call(textarea, value);
    textarea.dispatchEvent(new win.Event('input', { bubbles: true }));
    textarea.dispatchEvent(new win.Event('change', { bubbles: true }));
  });
}

/**
 * Dispatches a keydown event on a target inside React's act environment.
 */
export function fireKeyDown(
  target: EventTarget,
  key: string,
  options?: Partial<KeyboardEventInit>
): void {
  act(() => {
    const win = globalThis.window;
    const event = new win.KeyboardEvent('keydown', {
      key,
      bubbles: true,
      cancelable: true,
      ...options,
    });
    target.dispatchEvent(event);
  });
}

/**
 * Clean runner helper for test cases.
 */
export function createTestRunner(suiteTitle: string) {
  let passed = 0;
  let failed = 0;

  console.log('\n============================================================');
  console.log(`⚡ ${suiteTitle}`);
  console.log('============================================================\n');

  async function testCase(name: string, fn: () => void | Promise<void>): Promise<void> {
    try {
      await fn();
      passed++;
      console.log(`  ✓ ${name}`);
    } catch (err: unknown) {
      failed++;
      console.error(`  ✗ FAIL: ${name}`);
      if (err instanceof Error) {
        console.error(`    ${err.message}`);
        if (err.stack) {
          const relevant = err.stack.split('\n').slice(1, 3).join('\n');
          console.error(relevant);
        }
      } else {
        console.error(`    ${String(err)}`);
      }
    }
  }

  function printSummary(): void {
    console.log('\n============================================================');
    console.log(`SUMMARY: ${passed} passed, ${failed} failed`);
    console.log('============================================================\n');
    if (failed > 0) {
      process.exit(1);
    }
  }

  return { testCase, printSummary, getStats: () => ({ passed, failed }) };
}
