import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { BACResult } from '@/types/bac';
import { getResults, saveResult as saveResultToStorage, deleteResult as deleteResultFromStorage } from '@/services/storage';

interface BACContextType {
  currentResult: BACResult | null;
  history: BACResult[];
  setCurrentResult: (result: BACResult | null) => void;
  saveCurrentResult: () => Promise<void>;
  deleteHistoryItem: (id: string) => Promise<void>;
  refreshHistory: () => Promise<void>;
}

export const BACContext = createContext<BACContextType | undefined>(undefined);

export function BACProvider({ children }: { children: ReactNode }) {
  const [currentResult, setCurrentResult] = useState<BACResult | null>(null);
  const [history, setHistory] = useState<BACResult[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const results = await getResults();
    setHistory(results);
  };

      const saveCurrentResult = async (result?: BACResult) => {
    const resultToSave = result || currentResult;
    if (resultToSave) {
      await saveResultToStorage(resultToSave);
      await refreshHistory();
    }
  };

    const deleteHistoryItem = async (id: string) => {
    await deleteResultFromStorage(id);
    await refreshHistory();
  };

  const refreshHistory = async () => {
    await loadHistory();
  };

  return (
    <BACContext.Provider value={{
      currentResult,
      history,
      setCurrentResult,
      saveCurrentResult,
      deleteHistoryItem,
      refreshHistory,
    }}>
      {children}
    </BACContext.Provider>
  );
}