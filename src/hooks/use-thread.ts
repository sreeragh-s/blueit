
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Vote, Bookmark } from "@/types/supabase";

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
      const { data: existingVoteData, error: voteError } = await supabase
        .from('votes')
        .select('*')
        .eq('thread_id', threadId)
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (voteError) {
        console.error('Error checking vote:', voteError);
        throw voteError;
      }

      // Cast to our Vote type
      const existingVote = existingVoteData as Vote | null;

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
          
          toast({
            title: "Vote removed",
            description: "Your vote has been removed",
          });
          return true;
        } else {
          // Update vote if changing vote type
          const { error: updateError } = await supabase
            .from('votes')
            .update({ vote_type: voteType } as Partial<Vote>)
            .eq('id', existingVote.id);
            
          if (updateError) {
            console.error('Error updating vote:', updateError);
            throw updateError;
          }
          
          toast({
            title: "Vote updated",
            description: `You ${voteType}voted this thread`,
          });
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
          } as Vote);
          
        if (insertError) {
          console.error('Error creating vote:', insertError);
          throw insertError;
        }
        
        toast({
          title: "Vote registered",
          description: `You ${voteType}voted this thread`,
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
      const { data: existingBookmarkData, error: bookmarkError } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('thread_id', threadId)
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (bookmarkError) {
        console.error('Error checking bookmark:', bookmarkError);
        throw bookmarkError;
      }

      // Cast to our Bookmark type
      const existingBookmark = existingBookmarkData as Bookmark | null;

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
        
        toast({
          title: "Bookmark removed",
          description: "Thread removed from your bookmarks",
        });
        return false; // not bookmarked anymore
      } else {
        // Add bookmark
        const { error: insertError } = await supabase
          .from('bookmarks')
          .insert({
            thread_id: threadId,
            user_id: user.id
          } as Bookmark);
          
        if (insertError) {
          console.error('Error adding bookmark:', insertError);
          throw insertError;
        }
        
        toast({
          title: "Bookmark added",
          description: "Thread added to your bookmarks",
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
