import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import SocialRoutes from './social/SocialRoutes';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <SocialRoutes />
    </BrowserRouter>
  </StrictMode>,
);
