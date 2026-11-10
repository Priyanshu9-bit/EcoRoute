import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { JourneyProvider } from './context/JourneyContext';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <JourneyProvider>
          <AppRoutes />
        </JourneyProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
