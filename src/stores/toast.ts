import { create } from 'zustand';

let toastSeq = 0;

export interface ToastMsg {
  text: string;
  tone: 'default' | 'success' | 'error' | 'warning';
  key: number;
}

interface ToastStore {
  current: ToastMsg | null;
  push: (text: string, opts?: { tone?: ToastMsg['tone'] }) => void;
  dismiss: () => void;
}

// Mirrors window.PPToast(text, opts) call surface (src/app.jsx:67)
export const useToastStore = create<ToastStore>((set) => ({
  current: null,
  push: (text, opts) =>
    set({ current: { text, tone: opts?.tone ?? 'default', key: ++toastSeq } }),
  dismiss: () => set({ current: null }),
}));
