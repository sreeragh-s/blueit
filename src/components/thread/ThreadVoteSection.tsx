
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import ThreadVoteControls from "@/components/ThreadVoteControls";

interface ThreadVoteSectionProps {
  threadId: string;
  initialVotes?: number;
  userVote?: 'up' | 'down' | null;
  isVoting?: boolean;
  onVote?: (type: 'up' | 'down') => Promise<boolean>;
}

const ThreadVoteSection = ({ 
  threadId, 
  initialVotes = 0,
  userVote: externalUserVote = null,
  isVoting: externalIsVoting = false,
  onVote: externalVote
}: ThreadVoteSectionProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [votes, setVotes] = useState(initialVotes);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(externalUserVote);
  const [isVoting, setIsVoting] = useState(externalIsVoting);

  useEffect(() => {
    setVotes(initialVotes);
  }, [initialVotes]);

  useEffect(() => {
    setUserVote(externalUserVote);
  }, [externalUserVote]);

  useEffect(() => {
    setIsVoting(externalIsVoting);
  }, [externalIsVoting]);

  useEffect(() => {
    const checkUserVote = async () => {
      if (!user || !threadId || externalVote) return;
      
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

    const fetchVoteCount = async () => {
      if (!threadId || externalVote) return;
      
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

    if (!externalVote) {
      checkUserVote();
      fetchVoteCount();
    }
  }, [user, threadId, externalVote]);

  const handleVote = async (type: 'up' | 'down') => {
    if (externalVote) {
      await externalVote(type);
      return;
    }

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
    } catch (error) {
      console.error('Error voting:', error);
      toast({
        title: "Error",
        description: "Failed to register your vote. Please try again.",
        variant: "destructive"
      });
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
