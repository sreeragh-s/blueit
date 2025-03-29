import { useState } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/sidebar";
import { Input } from "@/components/ui/input";
import { Search, Loader2, Trash2 } from "lucide-react";
import CommunityCard from "@/components/CommunityCard";
import { useCommunities } from "@/hooks/use-communities";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import ThreadList from "@/components/ThreadList";
import { useThreads } from "@/hooks/use-threads";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("communities");
  const { communities, loading: loadingCommunities } = useCommunities();
  const { user } = useAuth();
  const { threads, isLoading: loadingThreads } = useThreads(user?.id);
  const { toast } = useToast();
  const [deletingThreadId, setDeletingThreadId] = useState<string | null>(null);
  
  // Filter communities based on search query
  const filteredCommunities = communities.filter(community => 
    community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (community.description && community.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (community.tags && community.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  // Get only the user's threads
  const userThreads = threads.filter(thread => thread.author.id === user?.id);
  
  // Handle thread deletion
  const handleDeleteThread = async (threadId: string) => {
    try {
      setDeletingThreadId(threadId);
      
      // Delete the thread from Supabase
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
      
      // Update the local threads state to remove the deleted thread
      // Note: useThreads will re-fetch threads on its own, but this provides immediate UI feedback
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
  
  // Modified ThreadList to include delete buttons
  const renderThreadWithDeleteOption = () => {
    return (
      <div className="space-y-6">
        {userThreads.map((thread) => {
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
        
        {userThreads.length === 0 && !loadingThreads && (
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
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container flex">
        <Sidebar />
        
        <main className="flex-1 p-4 lg:p-6">
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
        </main>
      </div>
    </div>
  );
};

export default Explore;
