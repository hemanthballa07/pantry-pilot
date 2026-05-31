import { describe, it, expect, beforeEach } from 'vitest';
import { useSearchStore } from '@/stores/search';

describe('useSearchStore', () => {
  beforeEach(() => useSearchStore.getState().clear());

  it('starts with an empty query', () => {
    expect(useSearchStore.getState().query).toBe('');
  });

  it('setQuery updates the query', () => {
    useSearchStore.getState().setQuery('jasmine rice');
    expect(useSearchStore.getState().query).toBe('jasmine rice');
  });

  it('clear resets the query to empty', () => {
    useSearchStore.getState().setQuery('eggs');
    useSearchStore.getState().clear();
    expect(useSearchStore.getState().query).toBe('');
  });
});
