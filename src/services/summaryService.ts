export async function fetchSummary(text: string): Promise<string> {
    const prompt = `다음 질문 내용을 한 줄 제목처럼 요약해줘: "${text}"`;
    const res = await fetch("http://localhost:8000/api/gpt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
    const data = await res.json();
    return data.text;
  }