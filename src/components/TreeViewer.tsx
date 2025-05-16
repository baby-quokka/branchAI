import React, { useState, useEffect, useRef } from "react";
import type { TreeNode } from "../types/TreeNode";
import TreeNodeCard from "./TreeNodeCard";
import InputBox from "./InputBox";
import { v4 as uuidv4 } from "uuid";
import { fetchGPTAnswer } from "../services/gptService";
import { fetchSummary } from "../services/summaryService";
import { saveSession } from "../lib/db";
import Sidebar from "./Sidebar";

const emptyRoot: TreeNode = {
  id: "root",
  parentId: null,
  question: "",
  answer: "",
  isExpanded: true,
  isReply: false,
  children: [],
  createdAt: new Date().toISOString(),
};

export default function TreeViewer() {
  const [rootNode, setRootNode] = useState<TreeNode>(emptyRoot);
  const [replyTargetId, setReplyTargetId] = useState<string | null>(null);
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [showReplyButton, setShowReplyButton] = useState(false);
  const [buttonPos, setButtonPos] = useState({ x: 0, y: 0 });
  const [isReplying, setIsReplying] = useState(false);
  const [replyInput, setReplyInput] = useState("");
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const sessionIdRef = useRef<string | null>(null);

  const renderTOC = (node: TreeNode, depth = -1): React.ReactNode => {
  return (
    <div key={node.id}>
      {(node.summary || (!node.isReply && node.question)) && (
        <div
          style={depth < 0 ? undefined : { paddingLeft: depth * 12 }}
          className="mb-2"
        >
          <button
            onClick={() => scrollToNode(node.id)}
            className={`block text-left text-sm hover:underline ${
              currentNodeId === node.id ? "text-yellow-400 font-bold" : "text-blue-300"
            }`}
          >
            {node.summary || node.question}
          </button>
        </div>
      )}

      {[...node.children]
        .sort((a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime())
        .map((child) => renderTOC(child, depth + 1))}
    </div>
  );
};

  const scrollToNode = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          setCurrentNodeId(entry.target.id);
          break;
        }
      }
    }, {
      root: null,
      rootMargin: "0px",
      threshold: 0.3,
    });
    const elements = document.querySelectorAll("[id]");
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleMouseUp = () => {
      if (isReplying) return;
      const selection = window.getSelection();
      const text = selection?.toString().trim();
      if (text && selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        const node = selection.anchorNode;
        const element = node instanceof Element ? node : node?.parentElement ?? undefined;
        const container = element?.closest("[data-node-id]");
        const nodeId = container?.getAttribute("data-node-id");
        if (nodeId) {
          setReplyTargetId(nodeId);
          setSelectedText(text);
          setButtonPos({ x: rect.right, y: rect.top + window.scrollY });
          setShowReplyButton(true);
          return;
        }
      }
      setShowReplyButton(false);
      setReplyTargetId(null);
      setSelectedText(null);
    };
    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, [isReplying]);

  const handleNewQuestion = async (question: string) => {
    const newNodeId = uuidv4();
    const newNode: TreeNode = {
      id: newNodeId,
      parentId: rootNode.id,
      question,
      answer: "답변: 준비 중...",
      isExpanded: true,
      isReply: false,
      createdAt: new Date().toISOString(),
      children: [],
    };
    const workingRoot = { ...rootNode, children: [...rootNode.children, newNode] };
    setRootNode(workingRoot);

    if (!sessionIdRef.current) {
      sessionIdRef.current = uuidv4();
    }
    await saveSession({
      id: sessionIdRef.current,
      title: rootNode.children[0]?.question || question,
      tree: workingRoot,
      savedAt: new Date().toISOString(),
    });

    const gptAnswer = await fetchGPTAnswer(question);
    const updatedTree = updateNodeAnswerById(workingRoot, newNodeId, gptAnswer);
    setRootNode(updatedTree);

    await saveSession({
      id: sessionIdRef.current,
      title: rootNode.children[0]?.question || question,
      tree: updatedTree,
      savedAt: new Date().toISOString(),
    });
    setRefreshTrigger((prev) => prev + 1);
  };


  const handleReplySubmit = async () => {
    if (replyTargetId && replyInput.trim()) {
      const newId = uuidv4();
      const summary = await fetchSummary(replyInput.trim());
      let attachedToIndex = undefined;

      const targetNode = findNodeById(rootNode, replyTargetId);
      if (targetNode && selectedText) {
        const lines = targetNode.answer.split("\n");
        attachedToIndex = lines.findIndex((line) => line.includes(selectedText));
      }

      const updated = addReplyToNode(
        rootNode,
        replyTargetId,
        replyInput.trim(),
        newId,
        attachedToIndex,
        summary
      );
      setRootNode(updated);

      const gptAnswer = await fetchGPTAnswer(replyInput.trim());
      setRootNode(updateNodeAnswerById(updated, newId, gptAnswer));

      const updatedWithAnswer = updateNodeAnswerById(updated, newId, gptAnswer);
      setRootNode(updatedWithAnswer);

      if (!sessionIdRef.current) {
        sessionIdRef.current = uuidv4();
      }
      await saveSession({
        id: sessionIdRef.current,
        title: rootNode.children[0]?.question || "새 대화",
        tree: updatedWithAnswer,
        savedAt: new Date().toISOString(),
      });
      setRefreshTrigger((prev) => prev + 1);
    }
    setIsReplying(false);
    setReplyInput("");
    setReplyTargetId(null);
    setSelectedText(null);
  };

  const handleLoadTree = (tree: TreeNode) => {
    setRootNode(tree);
  };

  const handleToggle = (id: string) => {
    const updated = toggleNodeById(rootNode, id);
    setRootNode(updated);
  };

  return (
    <div className="flex h-full w-full">
      {isSidebarOpen && <Sidebar onSelect={handleLoadTree} refreshTrigger={refreshTrigger} />}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="absolute left-2 top-2 z-50 bg-gray-800 text-white px-2 py-1 rounded"
      >
        {isSidebarOpen ? "◀" : "▶"}
      </button>
      <div className="flex-1 flex flex-col relative">
        <div className="flex-1 overflow-y-auto p-4">
          {rootNode.children.length === 0 && (
            <p className="text-center text-gray-400 mt-10">
              새로운 질문을 입력해 시작해보세요!
            </p>
          )}
          <TreeNodeCard node={rootNode} onToggle={handleToggle} />
        </div>
        <InputBox onSubmit={handleNewQuestion} />
        {showReplyButton && (
          <button
            style={{
              position: "absolute",
              top: `${buttonPos.y + 10}px`,
              left: `${buttonPos.x + 10}px`,
              zIndex: 50,
            }}
            className="px-2 py-1 text-sm bg-blue-600 text-white rounded-md shadow-lg"
            onClick={() => {
              setIsReplying(true);
              setShowReplyButton(false);
            }}
          >
            회신
          </button>
        )}
        {isReplying && replyTargetId && (
          <div className="p-4 bg-gray-800 border-t border-gray-600">
            <input
              type="text"
              value={replyInput}
              onChange={(e) => setReplyInput(e.target.value)}
              placeholder="회신 질문 입력..."
              className="w-full p-2 border rounded bg-gray-700 text-white"
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleReplySubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                회신 등록
              </button>
              <button
                onClick={() => {
                  setIsReplying(false);
                  setReplyInput("");
                  setReplyTargetId(null);
                  setSelectedText(null);
                }}
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                회신 취소
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="w-64 border-l border-gray-700 bg-gray-900 text-white p-4 overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">📁 메모</h2>
        {renderTOC(rootNode)}
      </div>
    </div>
  );
}

function toggleNodeById(node: TreeNode, id: string): TreeNode {
  if (node.id === id) {
    return { ...node, isExpanded: !node.isExpanded };
  }
  return { ...node, children: node.children.map((child) => toggleNodeById(child, id)) };
}

function updateNodeAnswerById(node: TreeNode, id: string, answer: string): TreeNode {
  if (node.id === id) {
    return { ...node, answer };
  }
  return { ...node, children: node.children.map((child) => updateNodeAnswerById(child, id, answer)) };
}

function addReplyToNode(
  node: TreeNode,
  targetId: string,
  question: string,
  newId: string,
  attachedToIndex?: number,
  summary?: string
): TreeNode {
  if (node.id === targetId) {
    return {
      ...node,
      children: [
        ...node.children,
        {
          id: newId,
          parentId: node.id,
          question,
          answer: "답변: 준비 중...",
          isExpanded: true,
          isReply: true,
          attachedToIndex,
          summary,
          createdAt: new Date().toISOString(),
          children: [],
        },
      ],
    };
  }
  return {
    ...node,
    children: node.children.map((child) =>
      addReplyToNode(child, targetId, question, newId, attachedToIndex, summary)
    ),
  };
}

function findNodeById(node: TreeNode, id: string): TreeNode | null {
  if (node.id === id) return node;
  for (const child of node.children) {
    const found = findNodeById(child, id);
    if (found) return found;
  }
  return null;
}