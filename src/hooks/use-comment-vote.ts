
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export const useCommentVote = (commentId: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [votes, setVotes] = useState<number>(0);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [isVoting, setIsVoting] = useState<boolean>(false);
  
  // Check if user has voted on this comment
  useEffect(() => {
    const checkUserVote = async () => {
      if (!user || !commentId) return;
      
      try {
        const { data } = await supabase
          .from('votes')
          .select('vote_type')
          .eq('user_id', user.id)
          .eq('comment_id', commentId)
          .maybeSingle();
        
        if (data) {
          setUserVote(data.vote_type as 'up' | 'down');
        }
      } catch (error) {
        // If error, vote doesn't exist
      }
    };
    
    checkUserVote();
  }, [user, commentId]);

  // Fetch comment votes
  useEffect(() => {
    const fetchVotes = async () => {
      if (!commentId) return;
      
      try {
        // Count upvotes
        const { count: upvotes } = await supabase
          .from('votes')
          .select('id', { count: 'exact' })
          .eq('comment_id', commentId)
          .eq('vote_type', 'up');
        
        // Count downvotes
        const { count: downvotes } = await supabase
          .from('votes')
          .select('id', { count: 'exact' })
          .eq('comment_id', commentId)
          .eq('vote_type', 'down');
        
        setVotes((upvotes || 0) - (downvotes || 0));
      } catch (error) {
        console.error('Error fetching comment votes:', error);
      }
    };
    
    fetchVotes();
  }, [commentId]);

  const handleVote = async (type: 'up' | 'down') => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "You need to sign in to vote on comments.",
        variant: "destructive"
      });
      return;
    }
    
    setIsVoting(true);
    
    try {
      console.log("Voting on comment:", {
        commentId,
        userId: user.id,
        voteType: type
      });
      
      // Validate UUID format for commentId
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(commentId)) {
        console.error("Invalid UUID format for commentId:", commentId);
        toast({
          title: "Error",
          description: "Invalid comment ID format. Please try again.",
          variant: "destructive"
        });
        return;
      }
      
      // Check if user has already voted
      const { data: existingVoteData } = await supabase
        .from('votes')
        .select('*')
        .eq('comment_id', commentId)
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (existingVoteData) {
        if (existingVoteData.vote_type === type) {
          // Remove vote if clicking the same button again
          await supabase
            .from('votes')
            .delete()
            .eq('id', existingVoteData.id);
          
          // Update UI
          setVotes(type === 'up' ? votes - 1 : votes + 1);
          setUserVote(null);
          
          toast({
            title: "Vote removed",
            description: "Your vote has been removed",
          });
        } else {
          // Update vote if changing vote type
          await supabase
            .from('votes')
            .update({ vote_type: type })
            .eq('id', existingVoteData.id);
          
          // Update UI
          setVotes(type === 'up' ? votes + 2 : votes - 2);
          setUserVote(type);
          
          toast({
            title: "Vote updated",
            description: `You ${type}voted this comment`,
          });
        }
      } else {
        // Create new vote
        await supabase
          .from('votes')
          .insert({
            comment_id: commentId,
            user_id: user.id,
            vote_type: type
          });
        
        // Update UI
        setVotes(type === 'up' ? votes + 1 : votes - 1);
        setUserVote(type);
        
        toast({
          title: "Vote registered",
          description: `You ${type}voted this comment`,
        });
      }
    } catch (error) {
      console.error('Error voting on comment:', error);
      toast({
        title: "Error",
        description: "Failed to register your vote. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsVoting(false);
    }
  };

  return {
    votes,
    setVotes,
    userVote,
    handleVote,
    isVoting
  };
};
