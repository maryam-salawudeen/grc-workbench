import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import { LookupsProvider } from './lookups';
import { WorkspaceProvider } from './workspace';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <WorkspaceProvider>
        <LookupsProvider>
          <App />
        </LookupsProvider>
      </WorkspaceProvider>
    </BrowserRouter>
  </StrictMode>,
);
