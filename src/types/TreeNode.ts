export type TreeNode = {
    id: string;
    parentId: string | null;
    parent: TreeNode | null;
    question: string;
    answer: string;
    children: TreeNode[];
    isExpanded: boolean;
    isReply: boolean;
    attachedToIndex?: number;
    summary?: string;
    createdAt: string;
  };
  