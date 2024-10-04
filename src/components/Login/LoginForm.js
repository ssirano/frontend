import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { loginSuccess, loginFailure } from '../../redux/actions/userActions';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/users/login', { email, password });
      const { token } = res.data;
      // 토큰을 로컬 스토리지에 저장
      localStorage.setItem('token', token);
      // 사용자 정보 디코딩 (옵션)
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const decodedData = JSON.parse(Buffer.from(base64, 'base64').toString('utf-8'));
      dispatch(loginSuccess(decodedData));
    } catch (error) {
      console.error('로그인 오류:', error.response.data.error);
      dispatch(loginFailure(error.response.data.error));
      alert(error.response.data.error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>로그인</h2>
      <input
        type="email"
        placeholder="이메일"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="비밀번호"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit">로그인</button>
    </form>
  );
};

export default LoginForm;