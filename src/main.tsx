import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

import './styles/global.css';
import './styles/layout.css';
import './styles/common.css';
import './styles/hoje.css';
import './styles/semana.css';
import './styles/alimentacao.css';
import './styles/evolucao.css';
import './styles/mais.css';
import './styles/session.css';
import './styles/forms.css';
import './styles/modal.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
