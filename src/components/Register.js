import React, { useState } from 'react';
import axios from 'axios';
import '../styles/Auth.css';

const Register = ({ onRegister, onSwitchToLogin }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/users/register`, {
        username,
        email,
        password,
      });
      onRegister();
    } catch (err) {
      setError(err.response?.data?.error || '회원가입 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>회원가입</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">사용자명</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
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
            회원가입
          </button>
        </form>
        <div className="auth-switch">
          <button onClick={onSwitchToLogin}>이미 계정이 있으신가요? 로그인</button>
        </div>
      </div>
    </div>
  );
};

export default Register;
