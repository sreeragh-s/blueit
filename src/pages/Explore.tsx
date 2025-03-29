
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import Navbar from "@/components/Navbar";
import { useCommunities } from "@/hooks/use-communities";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useThreadsWithRefresh } from "@/hooks/use-threads-with-refresh";

// Import new components
import SearchBar from "@/components/explore/SearchBar";
import CommunityTab from "@/components/explore/CommunityTab";
import UserPostsTab from "@/components/explore/UserPostsTab";

const Explore = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState(tabFromUrl === "my-posts" ? "my-posts" : "communities");
  const { communities, loading: loadingCommunities } = useCommunities();
  const { user } = useAuth();
  const { threads, isLoading: loadingThreads, refreshThreads } = useThreadsWithRefresh(user?.id);
  
  useEffect(() => {
    if (activeTab === "communities") {
      searchParams.delete("tab");
    } else {
      searchParams.set("tab", activeTab);
    }
    setSearchParams(searchParams);
  }, [activeTab, searchParams, setSearchParams]);

  useEffect(() => {
    if (tabFromUrl === "my-posts") {
      setActiveTab("my-posts");
    }
  }, [tabFromUrl]);

  const getSearchPlaceholder = () => {
    return activeTab === "communities" 
      ? "Search communities by name, description, or tags..." 
      : "Search your posts...";
  };
  
  return (
    <>
      <Navbar />
      <MainLayout>
        <div className="w-full max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Explore</h1>
          
          <SearchBar 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery} 
            placeholder={getSearchPlaceholder()} 
          />
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList>
              <TabsTrigger value="communities">All Communities</TabsTrigger>
              <TabsTrigger value="my-posts">My Posts</TabsTrigger>
            </TabsList>
            
            <TabsContent value="communities">
              <CommunityTab 
                communities={communities} 
                loading={loadingCommunities} 
                searchQuery={searchQuery} 
              />
            </TabsContent>
            
            <TabsContent value="my-posts">
              <UserPostsTab 
                threads={threads}
                loading={loadingThreads}
                searchQuery={searchQuery}
                userId={user?.id}
                refreshThreads={refreshThreads}
              />
            </TabsContent>
          </Tabs>
        </div>
      </MainLayout>
    </>
  );
};

export default Explore;
