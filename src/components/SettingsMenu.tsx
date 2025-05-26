export default function SettingsMenu({
    onLogout,
    onDeleteAccount,
  }: {
    onLogout: () => void;
    onDeleteAccount: () => void;
  }) {
    return (
      <div className="fixed top-16 right-4 bg-gray-800 p-4 rounded shadow-lg w-64 z-50">
        <h3 className="font-bold mb-3">설정</h3>
        <button
          onClick={onLogout}
          className="w-full text-left p-2 hover:bg-gray-700 rounded"
        >
          로그아웃
        </button>
        <button
          onClick={onDeleteAccount}
          className="w-full text-left p-2 text-red-400 hover:bg-gray-700 rounded"
        >
          회원탈퇴
        </button>
      </div>
    );
  }
  