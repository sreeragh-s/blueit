
import React, { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import ThreadList from "@/components/ThreadList";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ThreadWithRelations } from "@/types/supabase";
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

interface UserPostsTabProps {
  threads: ThreadWithRelations[];
  loading: boolean;
  searchQuery: string;
  userId?: string;
  refreshThreads: () => void;
}

const UserPostsTab = ({ threads, loading, searchQuery, userId, refreshThreads }: UserPostsTabProps) => {
  const { toast } = useToast();
  const [deletingThreadId, setDeletingThreadId] = useState<string | null>(null);
  
  const userThreads = threads.filter(thread => thread.author.id === userId);
  
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
        .eq('user_id', userId);
      
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
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (filteredUserThreads.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium">You haven't created any threads yet</h3>
        <p className="text-muted-foreground mt-1">
          Create a thread to share your thoughts with the community.
        </p>
      </div>
    );
  }
  
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
    </div>
  );
};

export default UserPostsTab;
