import { create } from 'zustand';

interface SearchStore {
  query: string;
  setQuery: (q: string) => void;
  clear: () => void;
}

// Cross-cutting search state: the shell TopBar writes it; Cook/Pantry read it
// to filter their lists. Lives in a store (not props) because screens render
// through the router <Outlet/>, which can't prop-drill a `search` value down.
export const useSearchStore = create<SearchStore>((set) => ({
  query: '',
  setQuery: (query) => set({ query }),
  clear: () => set({ query: '' }),
}));
