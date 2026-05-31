import { describe, it, expect, beforeEach } from 'vitest';
import { useToastStore } from '@/stores/toast';

// Note: the store's internal `toastSeq` key counter is module-level and is NOT
// reset between tests — these assertions are intentionally relative (monotonic),
// never absolute, so they stay order-independent.
describe('useToastStore', () => {
  beforeEach(() => {
    useToastStore.getState().dismiss();
  });

  it('starts (after dismiss) with no toast', () => {
    expect(useToastStore.getState().current).toBeNull();
  });

  it('push sets the current toast with the default tone and a numeric key', () => {
    useToastStore.getState().push('Saved');
    const cur = useToastStore.getState().current;
    expect(cur?.text).toBe('Saved');
    expect(cur?.tone).toBe('default');
    expect(typeof cur?.key).toBe('number');
  });

  it('push honors an explicit tone', () => {
    useToastStore.getState().push('Oops', { tone: 'error' });
    expect(useToastStore.getState().current?.tone).toBe('error');
  });

  it('each push gets a fresh, larger key so identical text re-renders', () => {
    useToastStore.getState().push('one');
    const k1 = useToastStore.getState().current!.key;
    useToastStore.getState().push('two');
    const k2 = useToastStore.getState().current!.key;
    expect(k2).toBeGreaterThan(k1);
  });

  it('dismiss clears the toast', () => {
    useToastStore.getState().push('bye');
    useToastStore.getState().dismiss();
    expect(useToastStore.getState().current).toBeNull();
  });
});
