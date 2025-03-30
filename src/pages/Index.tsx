
import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useThreads } from "@/hooks/use-threads";
import ThreadFilterTabs from "@/components/ThreadFilterTabs";
import EmptyThreadsState from "@/components/EmptyThreadsState";
import ThreadLoadingState from "@/components/ThreadLoadingState";
import ThreadList from "@/components/ThreadList";

const Index = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("new");
  
  // Get threads for all users, regardless of auth status
  const { threads, isLoading } = useThreads();
  
  // Sort threads based on active tab
  const sortedThreads = [...threads].sort((a, b) => {
    switch (activeTab) {
      case "new":
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case "comments":
        return b.commentCount - a.commentCount;
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <div className="flex flex-1 overflow-hidden w-full">
        <MainLayout>
          <div className="flex justify-between items-center mb-6 min-h-[40px]">
            <h1 className="text-2xl font-bold">Home Feed</h1>
            {user ? (
              <Button asChild>
                <Link to="/create">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Thread
                </Link>
              </Button>
            ) : (
              <Button onClick={() => window.location.href = "/login"}>
                Sign In to Create
              </Button>
            )}
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
        </MainLayout>
      </div>
    </div>
  );
};

export default Index;
