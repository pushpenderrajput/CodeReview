import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DiffView from './Components/DiffView';
import Login from './Components/pages/Login';

function App() {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            user ? (
              <DiffView user={user} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/login"
          element={<Login onLogin={(user) => {
            setUser(user);
            localStorage.setItem('user', JSON.stringify(user));
          }} />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
