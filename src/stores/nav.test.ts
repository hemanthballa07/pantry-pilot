import { describe, it, expect, beforeEach } from 'vitest';
import { useNavStore } from '@/stores/nav';

const reset = () =>
  useNavStore.setState({
    askPilotOpen: false,
    addItemOpen: false,
    inboxOpen: false,
    captureKind: null,
    recipeId: null,
    cookId: null,
    checkoutOpen: false,
  });

describe('useNavStore', () => {
  beforeEach(reset);

  it('defaults every overlay closed and no capture kind', () => {
    const s = useNavStore.getState();
    expect(s.askPilotOpen).toBe(false);
    expect(s.addItemOpen).toBe(false);
    expect(s.inboxOpen).toBe(false);
    expect(s.captureKind).toBeNull();
  });

  it('openAskPilot / closeAskPilot toggle only that flag', () => {
    useNavStore.getState().openAskPilot();
    expect(useNavStore.getState().askPilotOpen).toBe(true);
    expect(useNavStore.getState().addItemOpen).toBe(false);
    useNavStore.getState().closeAskPilot();
    expect(useNavStore.getState().askPilotOpen).toBe(false);
  });

  it('openAddItem and openInbox set their flags independently', () => {
    useNavStore.getState().openAddItem();
    expect(useNavStore.getState().addItemOpen).toBe(true);
    expect(useNavStore.getState().inboxOpen).toBe(false);
    useNavStore.getState().openInbox();
    expect(useNavStore.getState().inboxOpen).toBe(true);
  });

  it('setCapture sets and clears the capture kind', () => {
    useNavStore.getState().setCapture('receipt');
    expect(useNavStore.getState().captureKind).toBe('receipt');
    useNavStore.getState().setCapture(null);
    expect(useNavStore.getState().captureKind).toBeNull();
  });

  it('defaults recipeId to null', () => {
    expect(useNavStore.getState().recipeId).toBeNull();
  });

  it('openRecipe sets the recipeId, closeRecipe clears it', () => {
    useNavStore.getState().openRecipe('r1');
    expect(useNavStore.getState().recipeId).toBe('r1');
    useNavStore.getState().closeRecipe();
    expect(useNavStore.getState().recipeId).toBeNull();
  });

  it('openRecipe replaces an already-open recipe', () => {
    useNavStore.getState().openRecipe('r1');
    useNavStore.getState().openRecipe('r7');
    expect(useNavStore.getState().recipeId).toBe('r7');
  });

  it('defaults cookId to null', () => {
    expect(useNavStore.getState().cookId).toBeNull();
  });

  it('openCook sets the cookId, closeCook clears it', () => {
    useNavStore.getState().openCook('r1');
    expect(useNavStore.getState().cookId).toBe('r1');
    useNavStore.getState().closeCook();
    expect(useNavStore.getState().cookId).toBeNull();
  });

  it('defaults checkoutOpen to false', () => {
    expect(useNavStore.getState().checkoutOpen).toBe(false);
  });

  it('openCheckout / closeCheckout toggle only that flag', () => {
    useNavStore.getState().openCheckout();
    expect(useNavStore.getState().checkoutOpen).toBe(true);
    expect(useNavStore.getState().recipeId).toBeNull();
    useNavStore.getState().closeCheckout();
    expect(useNavStore.getState().checkoutOpen).toBe(false);
  });
});
