import { useState } from 'react';

export default function LoginForm({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setError(null);
    try {
      const res = await fetch('http://localhost:8000/api/users/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) throw new Error('로그인 실패');

      const data = await res.json();
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      onLoginSuccess(); 

      alert('로그인 성공!');
    } catch (err) {
      setError('아이디 또는 비밀번호가 올바르지 않습니다.');
    }
  };

  return (
    <div className="p-4 border rounded w-96 mx-auto mt-20 bg-gray-800 text-white">
      <h2 className="text-lg font-bold mb-4">로그인</h2>
      <input
        className="w-full p-2 mb-2 rounded bg-gray-700"
        placeholder="아이디"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        className="w-full p-2 mb-2 rounded bg-gray-700"
        type="password"
        placeholder="비밀번호"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        className="w-full p-2 bg-blue-500 rounded hover:bg-blue-600"
        onClick={handleLogin}
      >
        로그인
      </button>
      {error && <p className="text-red-400 mt-2">{error}</p>}
    </div>
  );
}
