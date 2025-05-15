import type { TreeNode } from "../types/TreeNode";

type Props = {
  node: TreeNode;
  onToggle: (id: string) => void;
};

export default function TreeNodeCard({ node, onToggle }: Props) {
  const isReply = node.isReply;
  const questionAlign = isReply ? "text-left ml-0" : "text-right ml-auto";

  const lines = node.answer
    .replace(/(?<!\\d)(?<=\\.|\\!|\\?)\\s+/g, "\n")
    .split("\n");

  return (
    <div 
      id={node.id}
      className={`my-6 w-full ${questionAlign}`}
    >
      {/* 질문 */}
      <div className={`flex items-start gap-2 ${isReply ? "" : "justify-end"}`}>
        {isReply && (
          <div
            className="cursor-pointer text-gray-400 font-bold"
            onClick={() => onToggle(node.id)}
          >
            {node.isExpanded ? "▼" : "▶"}
          </div>
        )}
        <div className="font-semibold text-white inline-block">
          {node.question}
        </div>
      </div>

      {/* 응답을 문장 단위로 렌더링 */}
      {node.isExpanded && (
        <div className="mt-2 pl-4 text-left">
          {lines.map((line, index) => (
            <div key={index}>
              <p
                data-node-id={node.id}
                className="inline-block p-3 rounded-md bg-gray-700 text-gray-200 whitespace-pre-line"
              >
                {line}
              </p>
              {/* 해당 줄에 연결된 reply 자식만 렌더 */}
              {node.children
                .filter((child) => child.attachedToIndex === index)
                .map((child) => (
                  <TreeNodeCard key={child.id} node={child} onToggle={onToggle} />
                ))}
            </div>
          ))}

          {/* 일반 질문을 맨 아래가 아니라... */}
          {/* → 전체 children 중 reply가 아닌 것들도 inline으로 처리 */}
          {node.children
            .filter((child) => child.attachedToIndex === undefined && !child.isReply)
            .map((child) => (
              <TreeNodeCard key={child.id} node={child} onToggle={onToggle} />
            ))}
        </div>
      )}
    </div>
  );
}
