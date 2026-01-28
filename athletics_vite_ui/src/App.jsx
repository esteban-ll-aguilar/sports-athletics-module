import React, { useEffect, useState } from 'react';
import AppRouter from '@core/router/AppRouter';
import { Toaster } from 'react-hot-toast';
import authService from '@modules/auth/services/auth_service';
import { ThemeProvider } from './core/contexts/ThemeContext';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      await authService.checkAuth();
      setIsLoading(false);
    };
    initAuth();
  }, []);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <Toaster position="top-right" reverseOrder={false} />
      <AppRouter />
    </ThemeProvider>
  );
}

export default App;
