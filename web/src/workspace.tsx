import { createContext, useContext, type ReactNode } from 'react';
import { api, useApi, type Row } from './api';

export interface Workspace {
  id: string;
  org_name: string;
  scenario: Row | null;
  last_score: string | null;
  loaded: boolean;
}

const fallback: Workspace = { id: 'demo', org_name: 'Maple Ridge Credit Union', scenario: null, last_score: null, loaded: false };
const Ctx = createContext<Workspace>(fallback);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { data } = useApi<Workspace>('/workspace');
  return <Ctx.Provider value={data ? { ...data, loaded: true } : fallback}>{children}</Ctx.Provider>;
}

export const useWorkspace = () => useContext(Ctx);

/** Switch the server to another workspace and reload, so every page refetches its data. */
export async function switchWorkspace(id: string, to = id === 'demo' ? '/' : '/practice/brief') {
  await api(`/workspaces/${id}/activate`, { method: 'POST' });
  window.location.assign(to);
}
