
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useThreads } from "@/hooks/use-threads";
import ThreadFilterTabs from "@/components/ThreadFilterTabs";
import EmptyThreadsState from "@/components/EmptyThreadsState";
import ThreadLoadingState from "@/components/ThreadLoadingState";
import ThreadList from "@/components/ThreadList";

const Index = () => {
  const navigate = useNavigate();
  const { user, session } = useAuth();
  const [activeTab, setActiveTab] = useState("trending");
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user && !session) {
      navigate("/login");
    }
  }, [user, session, navigate]);
  
  const { threads, isLoading } = useThreads(user?.id);
  
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
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar className="h-[calc(100vh-4rem)]" />
        
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Home Feed</h1>
            <Button asChild>
              <Link to="/create">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Thread
              </Link>
            </Button>
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
              <EmptyThreadsState />
            )}
          </ThreadFilterTabs>
        </main>
      </div>
    </div>
  );
};

export default Index;
