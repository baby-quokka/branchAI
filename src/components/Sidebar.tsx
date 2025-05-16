import { useEffect, useState } from "react";
import { loadSessions, deleteSession } from "../lib/db";
import type { TreeNode } from "../types/TreeNode";

export default function Sidebar({
  onSelect,
  refreshTrigger,
}: {
  onSelect: (tree: TreeNode) => void;
  refreshTrigger: number;
}) {
  const [sessions, setSessions] = useState<any[]>([]);

  useEffect(() => {
    loadSessions().then((loaded) => {
      const sorted = [...loaded].sort(
        (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
      );
      setSessions(sorted);
    });
  }, [refreshTrigger]);
  
  const handleDelete = async (id: string) => {
    const ok = confirm("이 대화 기록을 삭제하시겠습니까?");
    if (!ok) return;
  
    await deleteSession(id);
    const updated = await loadSessions();
    setSessions(updated);
  };

  return (
    <div className="w-64 bg-gray-900 text-white p-4 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">대화 기록</h2>
      </div>

      {sessions.map((s) => (
        <div
          key={s.id}
          className="mb-3 p-2 rounded hover:bg-gray-800 group flex justify-between items-start"
        >
          <div
            onClick={() => onSelect(s.tree)}
            className="cursor-pointer flex-1"
          >
            <p className="font-medium">{s.title}</p>
            <p className="text-xs text-gray-400">
              {new Date(s.savedAt).toLocaleString()}
            </p>
          </div>

          <button
            onClick={() => handleDelete(s.id)}
            className="text-red-400 hover:text-red-600 ml-2 opacity-0 group-hover:opacity-100 transition"
            title="삭제"
          >
            🗑️
          </button>
        </div>
      ))}
    </div>
  );
}
