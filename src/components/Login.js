// Login.js
import React, { useState } from 'react';
import axios from 'axios';
import '../styles/Auth.css';

const Login = ({ onLogin, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5003';
      console.log('Attempting to log in to:', apiUrl); // 추가된 로그
      const response = await axios.post(`${apiUrl}/api/users/login`, { email, password });
      console.log('Login response:', response.data); // 응답 데이터 출력
      localStorage.setItem('token', response.data.token);
      onLogin(response.data.token);
    } catch (err) {
      console.error('Login error:', err.response || err); // 에러 출력
      setError(err.response?.data?.error || '로그인 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>로그인</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">이메일</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">비밀번호</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="submit-button">
            로그인
          </button>
        </form>
        <div className="auth-switch">
          <button onClick={onSwitchToRegister}>계정이 없으신가요? 회원가입</button>
        </div>
      </div>
    </div>
  );
};

export default Login;
