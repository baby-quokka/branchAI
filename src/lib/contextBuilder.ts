import type { TreeNode } from "../types/TreeNode";
import type { ChatMessage } from "../services/gptService";

// GPT 프롬프트용 상위 노드 컨텍스트 생성 함수
export function buildContextString(node: TreeNode): string {
    let context = "";
    let current = node.parent;

    while (current) {
        context = `질문: ${current.question}\n답변: ${current.answer}\n\n` + context;
        current = current.parent;
    }

    return context.trim();
}

export function buildChatStylePrompt(node: TreeNode, currentQuestion: string): string {
    let lines: string[] = [];
  
    let current: TreeNode | null = node;
    while (current) {
      if (current.question && current.answer) {
        lines.unshift(`사용자: ${current.question}\nGPT: ${current.answer}`);
      }
      current = current.parent ?? null;
    }
  
    return [
      "다음은 사용자와 GPT의 대화입니다.",
      ...lines,
      `사용자: ${currentQuestion}`,
    ].join("\n");
}

export function buildMessagesFromTree(node: TreeNode, currentQuestion: string): ChatMessage[] {
    const messages: ChatMessage[] = [
        {
        role: "system",
        content: "You are a helpful assistant. Always respond in the same language the user uses.",
        },
    ];

    const past: ChatMessage[] = [];
    let current: TreeNode | null = node;

    while (current) {
        if (current.question && current.answer) {
        past.unshift({ role: "user", content: current.question }); 
        past.unshift({ role: "assistant", content: current.answer }); 
        }
        current = current.parent ?? null;
    }

    messages.push(...past);
    messages.push({ role: "user", content: currentQuestion });

    return messages;
}
