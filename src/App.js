// App.js
import React, { useState, useEffect, useCallback } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import CulturalPropertyMap from './components/CulturalPropertyMap';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState(null);

  const checkLoginStatus = useCallback(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      setIsLoggedIn(true);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    checkLoginStatus();
  }, [checkLoginStatus]);

  const handleLogin = (receivedToken) => {
    console.log('Received token in App.js:', receivedToken); // 추가된 로그
    localStorage.setItem('token', receivedToken);
    setToken(receivedToken);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setIsLoggedIn(false);
  };

  const handleRegister = () => {
    setShowRegister(false);
  };

  const handleTokenRefresh = useCallback((newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isLoggedIn) {
    return (
      <div>
        <button
          onClick={handleLogout}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            zIndex: 1000,
          }}
        >
          로그아웃
        </button>
        {/* CulturalPropertyMap 컴포넌트에 token과 setToken을 전달합니다. */}
        <CulturalPropertyMap token={token} setToken={handleTokenRefresh} />
      </div>
    );
  }

  return (
    <div>
      {showRegister ? (
        <Register onRegister={handleRegister} onSwitchToLogin={() => setShowRegister(false)} />
      ) : (
        // Login 컴포넌트에 handleLogin 함수를 onLogin prop으로 전달합니다.
        <Login onLogin={handleLogin} onSwitchToRegister={() => setShowRegister(true)} />
      )}
    </div>
  );
}

export default App;
