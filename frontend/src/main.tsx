import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

// Styles for LTR Layout
//
import './styles/styles.scss';

// Styles for RTL Layout.
// NOTE: Replace the above styles.scss with these CSS files to enable RTL mode.
//
// import './styles/rtl-css/styles.rtl.css';
// import './styles/rtl-css/custom.rtl.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
