
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import Navbar from "@/components/Navbar";
import { useCommunities } from "@/hooks/use-communities";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useThreadsWithRefresh } from "@/hooks/use-threads-with-refresh";

// Import components
import SearchBar from "@/components/explore/SearchBar";
import CommunityTab from "@/components/explore/CommunityTab";
import UserPostsTab from "@/components/explore/UserPostsTab";

const Explore = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const [searchQuery, setSearchQuery] = useState("");
  const { communities, loading: loadingCommunities } = useCommunities();
  const { user } = useAuth();
  const { threads, isLoading: loadingThreads, refreshThreads } = useThreadsWithRefresh(user?.id);
  
  // Set default active tab to "channels" if user is not signed in or if tab is not "my-posts"
  const [activeTab, setActiveTab] = useState(
    user && tabFromUrl === "my-posts" ? "my-posts" : "channels"
  );
  
  useEffect(() => {
    if (activeTab === "channels") {
      searchParams.delete("tab");
    } else {
      searchParams.set("tab", activeTab);
    }
    setSearchParams(searchParams);
  }, [activeTab, searchParams, setSearchParams]);

  useEffect(() => {
    if (user && tabFromUrl === "my-posts") {
      setActiveTab("my-posts");
    } else {
      setActiveTab("channels");
    }
  }, [tabFromUrl, user]);

  const getSearchPlaceholder = () => {
    return activeTab === "channels" 
      ? "Search channels by name, description, or tags..." 
      : "Search your posts...";
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex flex-1 overflow-hidden w-full">
        <MainLayout>
          <div className="w-full">
            <h1 className="text-2xl font-bold mb-6 min-h-[40px]">Explore</h1>
            
            <SearchBar 
              searchQuery={searchQuery} 
              setSearchQuery={setSearchQuery} 
              placeholder={getSearchPlaceholder()} 
            />
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList>
                <TabsTrigger value="channels">All Channels</TabsTrigger>
                {user && <TabsTrigger value="my-posts">My Posts</TabsTrigger>}
              </TabsList>
              
              <TabsContent value="channels">
                <CommunityTab 
                  communities={communities} 
                  loading={loadingCommunities} 
                  searchQuery={searchQuery} 
                />
              </TabsContent>
              
              {user && (
                <TabsContent value="my-posts">
                  <UserPostsTab 
                    threads={threads}
                    loading={loadingThreads}
                    searchQuery={searchQuery}
                    userId={user?.id}
                    refreshThreads={refreshThreads}
                  />
                </TabsContent>
              )}
            </Tabs>
          </div>
        </MainLayout>
      </div>
    </div>
  );
};

export default Explore;
