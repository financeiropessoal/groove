import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { VenueAuthProvider } from './contexts/VenueAuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { MusicianAuthProvider } from './contexts/MusicianAuthContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <HashRouter>
      <ToastProvider>
        <AuthProvider>
          <VenueAuthProvider>
            <MusicianAuthProvider>
              <App />
            </MusicianAuthProvider>
          </VenueAuthProvider>
        </AuthProvider>
      </ToastProvider>
    </HashRouter>
  </React.StrictMode>
);