import { openDB } from 'idb';
import type { TreeNode } from '../types/TreeNode';

const DB_NAME = 'gpt-tree-db';
const STORE_NAME = 'sessions';

export const initDB = async () => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    },
  });
};

export const saveSession = async (session: {
  id: string;
  title: string;
  tree: TreeNode;
  savedAt: string;
}) => {
  const db = await initDB();
  await db.put(STORE_NAME, session);
};

export const loadSessions = async () => {
  const db = await initDB();
  return db.getAll(STORE_NAME);
};

export const getSessionById = async (id: string) => {
  const db = await initDB();
  return db.get(STORE_NAME, id);
};

export const deleteSession = async (id: string) => {
    const db = await initDB();
    return db.delete('sessions', id);
};
