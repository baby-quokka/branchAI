import type { TreeNode } from "../types/TreeNode";

interface OutlineItemProps {
  node: TreeNode;
  level: number;
}

export default function OutlineItem({ node, level }: OutlineItemProps) {
  const scrollToNode = (id: string) => {
    const target = document.querySelector(`[data-node-id='${id}']`);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className={`ml-${level * 4}`}>
      {node.question && (
        <button
          onClick={() => scrollToNode(node.id)}
          className="text-blue-400 hover:underline block mb-1"
        >
          {node.question.slice(0, 30)}...
        </button>
      )}
      {node.children.map((child) => (
        <OutlineItem key={child.id} node={child} level={level + 1} />
      ))}
    </div>
  );
}
