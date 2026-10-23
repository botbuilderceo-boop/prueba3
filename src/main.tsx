import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import BookingPage from './pages/BookingPage';
import './styles/global.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BookingPage />
  </StrictMode>,
);
