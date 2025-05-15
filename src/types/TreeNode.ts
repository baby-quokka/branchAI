export type TreeNode = {
    id: string;
    parentId: string | null;
    question: string;
    answer: string;
    children: TreeNode[];
    isExpanded: boolean;
    isReply: boolean;
    attachedToIndex?: number;
    summary?: string;
  };
  