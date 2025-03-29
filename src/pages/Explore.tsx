import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Input } from "@/components/ui/input";
import { Search, Loader2, Trash2 } from "lucide-react";
import CommunityCard from "@/components/CommunityCard";
import { useCommunities } from "@/hooks/use-communities";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import ThreadList from "@/components/ThreadList";
import { useThreadsWithRefresh } from "@/hooks/use-threads-with-refresh";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Explore = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState(tabFromUrl === "my-posts" ? "my-posts" : "communities");
  const { communities, loading: loadingCommunities } = useCommunities();
  const { user } = useAuth();
  const { threads, isLoading: loadingThreads, refreshThreads } = useThreadsWithRefresh(user?.id);
  const { toast } = useToast();
  const [deletingThreadId, setDeletingThreadId] = useState<string | null>(null);
  
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
  
  const filteredCommunities = communities.filter(community => 
    community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (community.description && community.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (community.tags && community.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  const userThreads = threads.filter(thread => thread.author.id === user?.id);
  
  const filteredUserThreads = userThreads.filter(thread =>
    thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    thread.content.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleDeleteThread = async (threadId: string) => {
    try {
      setDeletingThreadId(threadId);
      
      const { error } = await supabase
        .from('threads')
        .delete()
        .eq('id', threadId)
        .eq('user_id', user?.id);
      
      if (error) throw error;
      
      toast({
        title: "Thread deleted",
        description: "Your thread has been successfully deleted",
      });
      
      refreshThreads();
      
    } catch (error: any) {
      console.error("Error deleting thread:", error);
      toast({
        title: "Error",
        description: "Failed to delete thread: " + error.message,
        variant: "destructive",
      });
    } finally {
      setDeletingThreadId(null);
    }
  };
  
  const renderThreadWithDeleteOption = () => {
    return (
      <div className="space-y-6">
        {filteredUserThreads.map((thread) => {
          if (!thread.id) return null;
          
          return (
            <div key={thread.id} className="relative">
              <ThreadList threads={[thread]} />
              <div className="absolute top-4 right-4">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete thread</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Thread</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this thread? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => handleDeleteThread(thread.id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {deletingThreadId === thread.id ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : null}
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          );
        })}
        
        {filteredUserThreads.length === 0 && !loadingThreads && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium">You haven't created any threads yet</h3>
            <p className="text-muted-foreground mt-1">
              Create a thread to share your thoughts with the community.
            </p>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <MainLayout>
      <div className="w-full max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Explore</h1>
        
        <div className="mb-6 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={activeTab === "communities" 
                ? "Search communities by name, description, or tags..." 
                : "Search your posts..."
              }
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="communities">All Communities</TabsTrigger>
            <TabsTrigger value="my-posts">My Posts</TabsTrigger>
          </TabsList>
          
          <TabsContent value="communities">
            {loadingCommunities ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCommunities.length > 0 ? (
                  filteredCommunities.map((community) => (
                    <CommunityCard key={community.id} community={community} />
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <h3 className="text-lg font-medium">No communities found</h3>
                    <p className="text-muted-foreground mt-1">
                      Try a different search term or create a new community.
                    </p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="my-posts">
            {loadingThreads ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              renderThreadWithDeleteOption()
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Explore;
