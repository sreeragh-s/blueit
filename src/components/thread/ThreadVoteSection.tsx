
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import ThreadVoteControls from "@/components/ThreadVoteControls";

interface ThreadVoteSectionProps {
  threadId: string;
  initialVotes: number;
}

const ThreadVoteSection = ({ threadId, initialVotes }: ThreadVoteSectionProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [votes, setVotes] = useState(initialVotes);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [isVoting, setIsVoting] = useState(false);

  useEffect(() => {
    const checkUserVote = async () => {
      if (!user || !threadId) return;
      
      try {
        const { data } = await supabase
          .from('votes')
          .select('vote_type')
          .eq('user_id', user.id)
          .eq('thread_id', threadId)
          .maybeSingle();
        
        if (data) {
          setUserVote(data.vote_type as 'up' | 'down');
        }
      } catch (error) {
        // If error, vote doesn't exist
      }
    };

    checkUserVote();
  }, [user, threadId]);

  const handleVote = async (type: 'up' | 'down') => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "You need to sign in to vote.",
        variant: "destructive"
      });
      return;
    }
    
    if (!threadId) {
      toast({
        title: "Error",
        description: "Invalid thread. Cannot vote.",
        variant: "destructive"
      });
      return;
    }
    
    setIsVoting(true);
    
    try {
      // Check if vote exists
      const { data: existingVote } = await supabase
        .from('votes')
        .select('id, vote_type')
        .eq('user_id', user.id)
        .eq('thread_id', threadId)
        .maybeSingle();
      
      if (!existingVote) {
        // Create new vote
        await supabase
          .from('votes')
          .insert({
            thread_id: threadId,
            user_id: user.id,
            vote_type: type
          });
        
        setVotes(type === 'up' ? votes + 1 : votes - 1);
        setUserVote(type);
      } else if (existingVote.vote_type === type) {
        // Remove vote if same type
        await supabase
          .from('votes')
          .delete()
          .eq('id', existingVote.id);
        
        setVotes(type === 'up' ? votes - 1 : votes + 1);
        setUserVote(null);
      } else {
        // Change vote type
        await supabase
          .from('votes')
          .update({ vote_type: type })
          .eq('id', existingVote.id);
        
        setVotes(type === 'up' ? votes + 2 : votes - 2);
        setUserVote(type);
      }
      
      return true;
    } catch (error) {
      console.error('Error voting:', error);
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

  return (
    <ThreadVoteControls 
      votes={votes} 
      userVote={userVote} 
      isVoting={isVoting} 
      onVote={handleVote} 
    />
  );
};

export default ThreadVoteSection;
