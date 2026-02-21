import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ToastProvider } from './components/Toast';
import { ThemeProvider } from './context/ThemeContext';
import { initFirebase } from './FireBase/firebase';
import FirebaseConfigNeeded from './components/FirebaseConfigNeeded';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy init so invalid-api-key is caught here and we show config screen instead of crashing
let firebase = null;
try {
  firebase = initFirebase();
} catch (e) {
  if (process.env.NODE_ENV !== 'test') {
    console.warn('Firebase init error:', e?.message || e);
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {!firebase?.auth ? (
      <FirebaseConfigNeeded />
    ) : (
      <ErrorBoundary>
        <ThemeProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </ThemeProvider>
      </ErrorBoundary>
    )}
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
