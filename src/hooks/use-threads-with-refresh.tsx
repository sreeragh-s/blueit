
import { useState } from "react";
import { useThreads } from "./use-threads";
import { ThreadWithRelations } from "@/types/supabase";

export const useThreadsWithRefresh = (userId?: string) => {
  const { threads, isLoading } = useThreads(userId);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const refreshThreads = () => {
    setRefreshKey(prev => prev + 1);
  };
  
  return {
    threads,
    isLoading,
    refreshThreads
  };
};
