
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export const useThread = (threadId: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isVoting, setIsVoting] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);

  const voteThread = async (voteType: 'up' | 'down') => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to vote on threads",
        variant: "destructive"
      });
      return false;
    }

    setIsVoting(true);
    try {
      // Check if user has already voted
      const { data: existingVote, error: voteError } = await supabase
        .from('votes')
        .select('*')
        .eq('thread_id', threadId)
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (voteError) {
        console.error('Error checking vote:', voteError);
        throw voteError;
      }

      if (existingVote) {
        if (existingVote.vote_type === voteType) {
          // Remove vote if clicking the same button again
          const { error: deleteError } = await supabase
            .from('votes')
            .delete()
            .eq('id', existingVote.id);
            
          if (deleteError) {
            console.error('Error removing vote:', deleteError);
            throw deleteError;
          }
          
          return true;
        } else {
          // Update vote if changing vote type
          const { error: updateError } = await supabase
            .from('votes')
            .update({ vote_type: voteType })
            .eq('id', existingVote.id);
            
          if (updateError) {
            console.error('Error updating vote:', updateError);
            throw updateError;
          }
          
          return true;
        }
      } else {
        // Create new vote
        const { error: insertError } = await supabase
          .from('votes')
          .insert({
            thread_id: threadId,
            user_id: user.id,
            vote_type: voteType
          });
          
        if (insertError) {
          console.error('Error creating vote:', insertError);
          throw insertError;
        }
        
        return true;
      }
    } catch (error) {
      console.error('Error voting on thread:', error);
      toast({
        title: "Error",
        description: "Failed to register your vote. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsVoting(false);
    }
  };

  const toggleBookmark = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to bookmark threads",
        variant: "destructive"
      });
      return false;
    }

    setIsBookmarking(true);
    try {
      // Check if already bookmarked
      const { data: existingBookmark, error: bookmarkError } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('thread_id', threadId)
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (bookmarkError) {
        console.error('Error checking bookmark:', bookmarkError);
        throw bookmarkError;
      }

      if (existingBookmark) {
        // Remove bookmark
        const { error: deleteError } = await supabase
          .from('bookmarks')
          .delete()
          .eq('id', existingBookmark.id);
          
        if (deleteError) {
          console.error('Error removing bookmark:', deleteError);
          throw deleteError;
        }
        
        return false; // not bookmarked anymore
      } else {
        // Add bookmark
        const { error: insertError } = await supabase
          .from('bookmarks')
          .insert({
            thread_id: threadId,
            user_id: user.id
          });
          
        if (insertError) {
          console.error('Error adding bookmark:', insertError);
          throw insertError;
        }
        
        return true; // now bookmarked
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast({
        title: "Error",
        description: "Failed to update bookmark. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsBookmarking(false);
    }
  };

  return {
    voteThread,
    toggleBookmark,
    isVoting,
    isBookmarking
  };
};
