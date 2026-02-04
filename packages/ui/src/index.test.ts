import { describe, expect, it } from 'vitest';
import { uiSmoke } from './index';

describe('uiSmoke', () => {
  it('returns ok', () => {
    expect(uiSmoke()).toBe('ok');
  });
});
