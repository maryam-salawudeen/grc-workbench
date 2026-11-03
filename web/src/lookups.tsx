import { createContext, useContext, type ReactNode } from 'react';
import { useApi, type Lookups } from './api';

const empty: Lookups = { people: [], assets: [], risks: [], controls: [], frameworks: [], assessments: [] };
const Ctx = createContext<{ lookups: Lookups; reloadLookups: () => void }>({ lookups: empty, reloadLookups: () => {} });

export function LookupsProvider({ children }: { children: ReactNode }) {
  const { data, reload } = useApi<Lookups>('/lookups');
  return <Ctx.Provider value={{ lookups: data ?? empty, reloadLookups: reload }}>{children}</Ctx.Provider>;
}

export const useLookups = () => useContext(Ctx);
