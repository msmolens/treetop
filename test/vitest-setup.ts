import { afterEach, beforeEach, vi } from 'vitest';

import '@testing-library/jest-dom/vitest';

// Mock Web Animations API.
// See https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API.
const mockAnimations = () => {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const savedAnimate = Element.prototype.animate;

  beforeEach(() => {
    Element.prototype.animate = vi.fn().mockReturnValue({
      cancel: vi.fn(),
      finished: Promise.resolve(),
    });
  });

  afterEach(() => {
    Element.prototype.animate = savedAnimate;
  });
};

mockAnimations();
