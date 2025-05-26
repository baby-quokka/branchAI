import { useEffect, useState } from "react";
import TreeViewer from "./components/TreeViewer";
import LoginForm from "./components/LoginForm";
import SettingsMenu from "./components/SettingsMenu";
import RegisterForm from "./components/ResiterForm";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    setIsLoggedIn(!!token);
  }, []);

  return (
    <div className="relative min-h-screen bg-gray-900 text-white flex justify-center items-start py-10 px-4">
      {/* 설정 버튼 */}
      {isLoggedIn && (
        <div className="fixed top-4 right-4 z-50" style={{ right: "16px" }}>
          <button 
            onClick={() => setShowSettings(!showSettings)} 
            className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-full shadow-lg"
          >
            ⚙
          </button>
          {showSettings && (
            <SettingsMenu
              onLogout={() => {
                localStorage.clear();
                window.location.reload();
              }}
              onDeleteAccount={async () => {
                const res = await fetch("http://localhost:8000/api/users/delete-account/", {
                  method: "DELETE",
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                  },
                });
                if (res.status === 204) {
                  alert("회원탈퇴 완료!");
                  localStorage.clear();
                  window.location.reload();
                } else {
                  alert("회원탈퇴 실패");
                }
              }}
            />
          )}
        </div>
      )}
      <div className="w-full max-w-2xl">
        {isLoggedIn ? (
          <TreeViewer />
        ) : isRegistering ? (
          <RegisterForm onRegisterSuccess={() => setIsRegistering(false)} />
        ) : (
          <LoginForm onLoginSuccess={() => setIsLoggedIn(true)} />
        )}
      </div>

      {!isLoggedIn && (
        <button
          onClick={() => setIsRegistering(!isRegistering)}
          className="mt-4 text-sm text-blue-400 underline"
        >
          {isRegistering ? "← 로그인으로 돌아가기" : "회원가입 하기 →"}
        </button>
      )}
    </div>
  );
}

export default App;
