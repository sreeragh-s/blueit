
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
      const { data: existingVote } = await supabase
        .from('votes')
        .select('id, vote_type')
        .eq('thread_id', threadId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingVote) {
        if (existingVote.vote_type === voteType) {
          // Remove vote if clicking the same button again
          await supabase
            .from('votes')
            .delete()
            .eq('id', existingVote.id);
          return true;
        } else {
          // Update vote if changing vote type
          await supabase
            .from('votes')
            .update({ vote_type: voteType })
            .eq('id', existingVote.id);
          return true;
        }
      } else {
        // Create new vote
        await supabase
          .from('votes')
          .insert({
            thread_id: threadId,
            user_id: user.id,
            vote_type: voteType
          });
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
      const { data: existingBookmark } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('thread_id', threadId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingBookmark) {
        // Remove bookmark
        await supabase
          .from('bookmarks')
          .delete()
          .eq('id', existingBookmark.id);
        return false; // not bookmarked anymore
      } else {
        // Add bookmark
        await supabase
          .from('bookmarks')
          .insert({
            thread_id: threadId,
            user_id: user.id
          });
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
