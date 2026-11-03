import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import { LookupsProvider } from './lookups';
import { WorkspaceProvider } from './workspace';
import { ExplainProvider } from './components/Explain';
import { LOCAL_BACKEND } from './api';
import './styles.css';

const root = createRoot(document.getElementById('root')!);

if (LOCAL_BACKEND) {
  root.render(<div className="spinner">Setting up your private workspace…</div>);
  await (await import('./local/backend')).initLocalBackend();
}

root.render(
  <StrictMode>
    <BrowserRouter>
      <ExplainProvider>
        <WorkspaceProvider>
          <LookupsProvider>
            <App />
          </LookupsProvider>
        </WorkspaceProvider>
      </ExplainProvider>
    </BrowserRouter>
  </StrictMode>,
);
