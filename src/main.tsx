import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './styles/main.scss';
//import './styles/CompanyPage.css'


try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element with id "root" not found in index.html');
  }

  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error('Failed to render application:', error);
  document.body.innerHTML = `
    <div style="padding: 20px; color: red; font-family: Arial, sans-serif;">
      <h1>Application Error</h1>
      <p>${(error as Error).message}</p>
      <pre>${(error as Error).stack}</pre>
    </div>
  `;
}
