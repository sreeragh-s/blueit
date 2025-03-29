
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface ThreadBookmarkSectionProps {
  threadId: string;
}

const ThreadBookmarkSection = ({ threadId }: ThreadBookmarkSectionProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [saved, setSaved] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);

  useEffect(() => {
    const checkIfSaved = async () => {
      if (!user || !threadId) return;
      
      try {
        const { data } = await supabase
          .from('bookmarks')
          .select('id')
          .eq('user_id', user.id)
          .eq('thread_id', threadId)
          .maybeSingle();
        
        setSaved(!!data);
      } catch (error) {
        // If error, bookmark doesn't exist
      }
    };

    checkIfSaved();
  }, [user, threadId]);

  const handleToggleSave = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "You need to sign in to save threads.",
        variant: "destructive"
      });
      return null;
    }
    
    if (!threadId) {
      toast({
        title: "Error",
        description: "Invalid thread. Cannot save.",
        variant: "destructive"
      });
      return null;
    }
    
    setIsBookmarking(true);
    
    try {
      if (saved) {
        // Remove bookmark
        await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('thread_id', threadId);
        
        setSaved(false);
      } else {
        // Add bookmark
        await supabase
          .from('bookmarks')
          .insert({
            thread_id: threadId,
            user_id: user.id
          });
        
        setSaved(true);
      }
      
      return !saved;
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast({
        title: "Error",
        description: "Failed to save thread. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsBookmarking(false);
    }
  };

  return { saved, isBookmarking, handleToggleSave };
};

export default ThreadBookmarkSection;
