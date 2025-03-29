
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import MainLayout from "@/components/layout/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useBookmarkedThreads } from "@/hooks/use-bookmarked-threads";
import ThreadFilterTabs from "@/components/ThreadFilterTabs";
import EmptyThreadsState from "@/components/EmptyThreadsState";
import ThreadLoadingState from "@/components/ThreadLoadingState";
import ThreadList from "@/components/ThreadList";
import { Bookmark } from "lucide-react";

const SavedThreads = () => {
  const navigate = useNavigate();
  const { user, session } = useAuth();
  const [activeTab, setActiveTab] = useState("trending");
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user && !session) {
      navigate("/login");
    }
  }, [user, session, navigate]);
  
  const { threads, isLoading } = useBookmarkedThreads(user?.id);
  
  // Sort threads based on active tab
  const sortedThreads = [...threads].sort((a, b) => {
    switch (activeTab) {
      case "trending":
        return (b.votes + b.commentCount) - (a.votes + a.commentCount);
      case "new":
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case "top":
        return b.votes - a.votes;
      case "comments":
        return b.commentCount - a.commentCount;
      default:
        return 0;
    }
  });
  
  if (!user) {
    return null; // Don't render anything if not authenticated
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <div className="flex flex-1 overflow-hidden w-full">
        <MainLayout>
          <div className="flex items-center mb-6 min-h-[40px]">
            <Bookmark className="mr-2 h-5 w-5" />
            <h1 className="text-2xl font-bold">Saved Threads</h1>
          </div>
          
          <ThreadFilterTabs 
            activeTab={activeTab} 
            onTabChange={setActiveTab}
          >
            {isLoading ? (
              <ThreadLoadingState />
            ) : sortedThreads.length > 0 ? (
              <ThreadList threads={sortedThreads} />
            ) : (
              <div className="text-center py-12">
                <Bookmark className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No saved threads yet</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Threads you save will appear here
                </p>
              </div>
            )}
          </ThreadFilterTabs>
        </MainLayout>
      </div>
    </div>
  );
};

export default SavedThreads;
