
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Bookmark } from "lucide-react";

interface ThreadBookmarkSectionProps {
  threadId: string;
  saved?: boolean;
  isBookmarking?: boolean;
  onToggleSave?: () => Promise<void>;
}

const ThreadBookmarkSection = ({ 
  threadId, 
  saved: initialSaved = false, 
  isBookmarking: initialIsBookmarking = false,
  onToggleSave: externalToggleSave 
}: ThreadBookmarkSectionProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [saved, setSaved] = useState(initialSaved);
  const [isBookmarking, setIsBookmarking] = useState(initialIsBookmarking);

  useEffect(() => {
    setSaved(initialSaved);
  }, [initialSaved]);

  useEffect(() => {
    setIsBookmarking(initialIsBookmarking);
  }, [initialIsBookmarking]);

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

    if (!externalToggleSave) {
      checkIfSaved();
    }
  }, [user, threadId, externalToggleSave]);

  const handleToggleSave = async () => {
    if (externalToggleSave) {
      await externalToggleSave();
      return;
    }

    if (!user) {
      toast({
        title: "Sign in required",
        description: "You need to sign in to save threads.",
        variant: "destructive"
      });
      return;
    }
    
    if (!threadId) {
      toast({
        title: "Error",
        description: "Invalid thread. Cannot save.",
        variant: "destructive"
      });
      return;
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
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast({
        title: "Error",
        description: "Failed to save thread. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsBookmarking(false);
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      className={`flex items-center gap-1 ${saved ? "text-primary" : ""}`}
      onClick={() => handleToggleSave()}
      disabled={isBookmarking}
    >
      <Bookmark size={16} />
      <span>{saved ? "Saved" : "Save"}</span>
    </Button>
  );
};

export default ThreadBookmarkSection;
