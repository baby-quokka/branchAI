import { useState } from "react";

type Props = {
  onSubmit: (question: string) => void;
};

export default function InputBox({ onSubmit }: Props) {
  const [text, setText] = useState("");

  const handleSubmit = () => {
    if (!text.trim()) return;
    onSubmit(text.trim());
    setText("");
  };

  return (
    <div className="flex gap-2 p-4 border-t bg-gray-800 w-full">
      <input
        type="text"
        className="flex-1 border px-3 py-2 rounded-md bg-gray-900 text-white"
        placeholder="질문을 입력하세요..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
      />
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        onClick={handleSubmit}
      >
        질문
      </button>
    </div>
  );
}
