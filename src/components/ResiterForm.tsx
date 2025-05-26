import { useState } from 'react';

export default function RegisterForm({ onRegisterSuccess }: { onRegisterSuccess: () => void }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    setError(null);
    try {
      const res = await fetch('http://localhost:8000/api/users/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, password2 }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(Object.values(errorData).flat().join(" "));
      }

      alert('회원가입 성공! 이제 로그인해주세요.');
      onRegisterSuccess();
    } catch (err: any) {
      setError(err.message || '회원가입 실패');
    }
  };

  return (
    <div className="p-4 border rounded w-96 mx-auto mt-10 bg-gray-800 text-white">
      <h2 className="text-lg font-bold mb-4">회원가입</h2>
      <input
        className="w-full p-2 mb-2 rounded bg-gray-700"
        placeholder="아이디"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        className="w-full p-2 mb-2 rounded bg-gray-700"
        placeholder="이메일"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="w-full p-2 mb-2 rounded bg-gray-700"
        type="password"
        placeholder="비밀번호"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <input
        className="w-full p-2 mb-2 rounded bg-gray-700"
        type="password"
        placeholder="비밀번호 확인"
        value={password2}
        onChange={(e) => setPassword2(e.target.value)}
      />
      <button
        className="w-full p-2 bg-green-500 rounded hover:bg-green-600"
        onClick={handleRegister}
      >
        회원가입
      </button>
      {error && <p className="text-red-400 mt-2">{error}</p>}
    </div>
  );
}
