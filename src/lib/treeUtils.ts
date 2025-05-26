import type { TreeNode } from "../types/TreeNode";

export function setParentReferences(node: TreeNode, parent: TreeNode | null = null): void {
  node.parent = parent;
  node.children.forEach((child) => setParentReferences(child, node));
}
