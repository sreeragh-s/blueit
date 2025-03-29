
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import ThreadCardHeader from "@/components/ThreadCardHeader";
import ThreadCardBody from "@/components/ThreadCardBody";
import ThreadVoteControls from "@/components/ThreadVoteControls";
import ThreadActions from "@/components/ThreadActions";
import ThreadCardComments from "@/components/ThreadCardComments";
import { useAuth } from "@/contexts/AuthContext";
import { useThread } from "@/hooks/use-thread";
import { useToast } from "@/hooks/use-toast";
import { ThreadCardProps } from "@/types/supabase";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  thread: ThreadCardProps;
  compact?: boolean;
}

const ThreadCard = ({ thread, compact = false }: Props) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [votes, setVotes] = useState(thread.votes);
  const [commentCount, setCommentCount] = useState(thread.commentCount);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [saved, setSaved] = useState(false);
  
  // Convert thread.id to string and ensure it's in UUID format
  // Log the original thread ID for debugging
  console.log("[ThreadCard] Original thread.id:", {
    id: thread?.id,
    type: typeof thread?.id
  });
  
  // Extract the raw UUID from thread.id if it exists, otherwise null
  const threadId = thread?.id ? String(thread.id) : null;
  
  // Log the processed threadId
  console.log("[ThreadCard] Processed threadId:", {
    value: threadId,
    type: typeof threadId,
    isUuid: threadId?.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i) !== null
  });
  
  const { 
    voteThread, 
    toggleBookmark, 
    isVoting, 
    isBookmarking 
  } = useThread(threadId || '');

  useEffect(() => {
    const checkUserInteractions = async () => {
      if (!user || !threadId) return;
      
      await checkUserVote();
      await checkIfSaved();
    };
    
    checkUserInteractions();
  }, [user, threadId]);

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
    
    const result = await toggleBookmark();
    if (result !== null) {
      setSaved(result);
    }
  };

  const handleShare = () => {
    if (!threadId) {
      toast({
        title: "Error",
        description: "Cannot share invalid thread.",
        variant: "destructive"
      });
      return;
    }
    
    const url = `${window.location.origin}/thread/${threadId}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link copied",
      description: "Thread link copied to clipboard",
    });
  };

  if (!thread || !threadId) {
    return null;
  }

  return (
    <Card className="thread-card mb-4">
      <CardContent className={cn("p-4", compact ? "pb-2" : "pb-4")}>
        <div className="flex items-start">
          <ThreadVoteControls 
            votes={votes} 
            userVote={userVote} 
            isVoting={isVoting} 
            onVote={handleVote} 
          />
          
          <div className="flex-1">
            <ThreadCardHeader thread={thread} />
            <ThreadCardBody thread={thread} compact={compact} />
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="px-4 py-2 flex flex-col border-t bg-muted/20">
        <div className="w-full flex justify-between">
          <Button variant="ghost" size="sm" className="flex items-center gap-1">
            <MessageSquare size={16} />
            <span>{commentCount} Comments</span>
          </Button>
          
          <ThreadActions 
            saved={saved} 
            isBookmarking={isBookmarking} 
            onToggleSave={handleToggleSave}
            onShare={handleShare}
            commentCount={0} // Not used in this context, but required by component props
          />
        </div>
        
        {!compact && (
          <ThreadCardComments threadId={threadId} commentCount={commentCount} />
        )}
      </CardFooter>
    </Card>
  );
};

export default ThreadCard;
