
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";
import { useThread } from "@/hooks/use-thread";

export const useThreadInteractions = (threadId: string, user: User | null) => {
  const { toast } = useToast();
  const [votes, setVotes] = useState(0);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [saved, setSaved] = useState(false);
  const { voteThread, toggleBookmark, isVoting, isBookmarking } = useThread(threadId);

  const checkUserVote = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('votes')
        .select('vote_type')
        .eq('user_id', user.id)
        .eq('thread_id', threadId)
        .single();
      
      if (data) {
        setUserVote(data.vote_type as 'up' | 'down');
      }
    } catch (error) {
      // If error, vote doesn't exist
      setUserVote(null);
    }
  };

  const checkIfSaved = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('user_id', user.id)
        .eq('thread_id', threadId)
        .single();
      
      setSaved(!!data);
    } catch (error) {
      // If error, bookmark doesn't exist
      setSaved(false);
    }
  };
  
  const fetchVoteCount = async () => {
    try {
      // Count upvotes
      const { count: upvotes } = await supabase
        .from('votes')
        .select('id', { count: 'exact' })
        .eq('thread_id', threadId)
        .eq('vote_type', 'up');
      
      // Count downvotes
      const { count: downvotes } = await supabase
        .from('votes')
        .select('id', { count: 'exact' })
        .eq('thread_id', threadId)
        .eq('vote_type', 'down');
      
      setVotes((upvotes || 0) - (downvotes || 0));
    } catch (error) {
      console.error('Error fetching vote count:', error);
    }
  };
  
  const handleVote = async (type: 'up' | 'down') => {
    const success = await voteThread(type);
    if (success) {
      // Update UI
      if (userVote === type) {
        // Remove vote
        setVotes(type === 'up' ? votes - 1 : votes + 1);
        setUserVote(null);
      } else if (userVote === null) {
        // Add new vote
        setVotes(type === 'up' ? votes + 1 : votes - 1);
        setUserVote(type);
      } else {
        // Change vote type
        setVotes(type === 'up' ? votes + 2 : votes - 2);
        setUserVote(type);
      }
    }
  };
  
  const handleToggleSave = async () => {
    const result = await toggleBookmark();
    if (result !== null) {
      setSaved(result);
    }
  };
  
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied",
      description: "Thread link copied to clipboard",
    });
  };
  
  useEffect(() => {
    if (threadId) {
      fetchVoteCount();
      checkUserVote();
      checkIfSaved();
    }
  }, [threadId, user]);

  return {
    votes,
    userVote,
    saved,
    isVoting,
    isBookmarking,
    handleVote,
    handleToggleSave,
    handleShare
  };
};
