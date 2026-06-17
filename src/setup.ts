import '@testing-library/jest-dom';
import 'fake-indexeddb/auto';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

class MockCustomEvent extends Event {
  detail: unknown;
  constructor(type: string, options?: CustomEventInit) {
    super(type, options);
    this.detail = options?.detail;
  }
}
(window as unknown as Record<string, unknown>).CustomEvent = MockCustomEvent;
