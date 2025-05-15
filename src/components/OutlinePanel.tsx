import type { TreeNode } from "../types/TreeNode";
import OutlineItem from "./OutlineItem";

interface OutlinePanelProps {
  rootNode: TreeNode;
}

export default function OutlinePanel({ rootNode }: OutlinePanelProps) {
  return (
    <div className="w-64 border-l border-gray-700 p-4 overflow-y-auto text-sm">
      <p className="text-gray-300 font-semibold mb-2">📚 목차</p>
      <OutlineItem node={rootNode} level={0} />
    </div>
  );
}