export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export async function fetchGPTAnswer(messages: ChatMessage[]): Promise<string> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages,
    }),
  });

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() ?? "답변 생성 실패";
}
