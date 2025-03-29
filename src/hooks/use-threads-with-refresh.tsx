
import { useState, useEffect } from "react";
import { useThreads } from "./use-threads";

export const useThreadsWithRefresh = (userId?: string) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const { threads, isLoading } = useThreads(userId, refreshKey);
  
  const refreshThreads = () => {
    setRefreshKey(prev => prev + 1);
  };
  
  return {
    threads,
    isLoading,
    refreshThreads
  };
};
