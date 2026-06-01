import { create } from 'zustand';

export type CaptureKind = 'receipt' | 'barcode' | 'fridge';

interface NavStore {
  askPilotOpen: boolean;
  addItemOpen: boolean;
  inboxOpen: boolean;
  captureKind: CaptureKind | null;
  recipeId: string | null;
  openAskPilot: () => void;
  closeAskPilot: () => void;
  openAddItem: () => void;
  closeAddItem: () => void;
  openInbox: () => void;
  closeInbox: () => void;
  setCapture: (kind: CaptureKind | null) => void;
  openRecipe: (id: string) => void;
  closeRecipe: () => void;
}

// Mirrors window.PPAskPilot / PPAddItem / PPInbox / PPCapture / PPOpenRecipe
// call surfaces (src/app.jsx:69-78). URL navigation goes through react-router
// useNavigate, not this store — only modal/overlay state lives here.
export const useNavStore = create<NavStore>((set) => ({
  askPilotOpen: false,
  addItemOpen: false,
  inboxOpen: false,
  captureKind: null,
  recipeId: null,
  openAskPilot: () => set({ askPilotOpen: true }),
  closeAskPilot: () => set({ askPilotOpen: false }),
  openAddItem: () => set({ addItemOpen: true }),
  closeAddItem: () => set({ addItemOpen: false }),
  openInbox: () => set({ inboxOpen: true }),
  closeInbox: () => set({ inboxOpen: false }),
  setCapture: (kind) => set({ captureKind: kind }),
  openRecipe: (id) => set({ recipeId: id }),
  closeRecipe: () => set({ recipeId: null }),
}));
