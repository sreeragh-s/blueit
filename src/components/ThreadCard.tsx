
import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import ThreadCardHeader from "@/components/ThreadCardHeader";
import ThreadCardBody from "@/components/ThreadCardBody";
import ThreadActions from "@/components/ThreadActions";
import ThreadCardComments from "@/components/ThreadCardComments";
import ThreadVoteSection from "@/components/thread/ThreadVoteSection";
import { useThreadSharing } from "@/utils/shareUtils";
import { ThreadCardProps } from "@/types/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

interface Props {
  thread: ThreadCardProps;
  compact?: boolean;
}

const ThreadCard = ({ thread, compact = false }: Props) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [commentCount, setCommentCount] = useState(thread.commentCount);
  const [showAllComments, setShowAllComments] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);
  
  const threadId = thread?.id ? String(thread.id) : null;
  
  const shareThread = useThreadSharing();

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

    if (user && threadId) {
      checkIfSaved();
    }
  }, [user, threadId]);

  const handleToggleSave = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "You need to sign in to save threads.",
        variant: "destructive"
      });
      return false;
    }
    
    if (!threadId) {
      toast({
        title: "Error",
        description: "Invalid thread. Cannot save.",
        variant: "destructive"
      });
      return false;
    }
    
    setIsBookmarking(true);
    
    try {
      if (saved) {
        await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('thread_id', threadId);
        
        setSaved(false);
      } else {
        await supabase
          .from('bookmarks')
          .insert({
            thread_id: threadId,
            user_id: user.id
          });
        
        setSaved(true);
      }
      
      return true;
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast({
        title: "Error",
        description: "Failed to save thread. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsBookmarking(false);
    }
  };

  const handleViewAllComments = () => {
    setShowAllComments(true);
  };

  const handleShare = () => {
    shareThread(threadId || '');
  };

  const handleCommentCountChange = (count: number) => {
    setCommentCount(count);
  };

  if (!thread || !threadId) {
    return null;
  }

  return (
    <Card className={cn(
      "thread-card", 
      isMobile ? "mx-0 my-2 rounded-none border-x-0" : "mb-4"
    )}>
      <CardContent className={cn("p-4", compact ? "pb-2" : "pb-4", isMobile && "px-2")}>
        <div className="flex flex-col">
          <ThreadCardHeader thread={thread} />
          <ThreadCardBody thread={thread} compact={compact} />
        </div>
      </CardContent>
      
      <CardFooter className={cn("px-4 py-2 flex flex-col border-t bg-muted/20", isMobile && "px-2")}>
        <div className="w-full flex justify-between items-center mb-2">
          {isMobile && (
            <ThreadVoteControls 
              votes={thread.votes} 
              userVote={null} 
              isVoting={false} 
              onVote={() => {}} 
              vertical={false} 
            />
          )}
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center gap-1"
          >
            <MessageSquare size={16} />
            {!isMobile && <span>{commentCount} Comments</span>}
            {isMobile && <span>{commentCount}</span>}
          </Button>
          
          <ThreadActions 
            saved={saved} 
            isBookmarking={isBookmarking} 
            onToggleSave={handleToggleSave} 
            onShare={handleShare}
            threadContent={thread.content}
            isMobile={isMobile}
          />
        </div>
        
        <ThreadCardComments 
          threadId={threadId} 
          commentCount={commentCount}
          onCommentCountChange={handleCommentCountChange}
          showAllComments={showAllComments}
          onViewAllComments={handleViewAllComments}
          commentsToShow={3}
        />
      </CardFooter>
    </Card>
  );
};

export default ThreadCard;
