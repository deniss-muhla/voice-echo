import { describe, expect, it } from 'vitest';
import { sharedSmoke } from './index';

describe('sharedSmoke', () => {
  it('returns ok', () => {
    expect(sharedSmoke()).toBe('ok');
  });
});
