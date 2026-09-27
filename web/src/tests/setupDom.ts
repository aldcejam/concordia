import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
  url: 'http://localhost',
  pretendToBeVisual: true,
});

const win = dom.window as unknown as Window & typeof globalThis;

try {
  Object.defineProperty(globalThis, 'window', { value: win, configurable: true, writable: true });
} catch {
  (globalThis as unknown as { window: unknown }).window = win;
}
try {
  Object.defineProperty(globalThis, 'document', { value: dom.window.document, configurable: true, writable: true });
} catch {
  (globalThis as unknown as { document: unknown }).document = dom.window.document;
}
try {
  Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, configurable: true, writable: true });
} catch {
  // Navigator built-in in Node 21+
}

(globalThis as unknown as { HTMLElement: typeof HTMLElement }).HTMLElement = dom.window.HTMLElement;
(globalThis as unknown as { HTMLInputElement: typeof HTMLInputElement }).HTMLInputElement = dom.window.HTMLInputElement;
(globalThis as unknown as { HTMLTextAreaElement: typeof HTMLTextAreaElement }).HTMLTextAreaElement = dom.window.HTMLTextAreaElement;
(globalThis as unknown as { HTMLButtonElement: typeof HTMLButtonElement }).HTMLButtonElement = dom.window.HTMLButtonElement;
(globalThis as unknown as { KeyboardEvent: typeof KeyboardEvent }).KeyboardEvent = dom.window.KeyboardEvent;
(globalThis as unknown as { MouseEvent: typeof MouseEvent }).MouseEvent = dom.window.MouseEvent;
(globalThis as unknown as { Event: typeof Event }).Event = dom.window.Event;
(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

export { dom };
