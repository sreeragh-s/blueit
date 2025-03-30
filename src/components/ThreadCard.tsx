
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
      "thread-card mb-4", 
      isMobile ? "mx-0 my-2" : "mb-4"
    )}>
      <CardContent className={cn("p-4", compact ? "pb-2" : "pb-4")}>
        <div className="flex items-start">
          <ThreadVoteSection threadId={threadId} initialVotes={thread.votes} />
          
          <div className="flex-1">
            <ThreadCardHeader thread={thread} />
            <ThreadCardBody thread={thread} compact={compact} />
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="px-4 py-2 flex flex-col border-t bg-muted/20">
        <div className="w-full flex justify-between">
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center gap-1"
          >
            <MessageSquare size={16} />
            <span>{commentCount} Comments</span>
          </Button>
          
          <ThreadActions 
            saved={saved} 
            isBookmarking={isBookmarking} 
            onToggleSave={handleToggleSave} 
            onShare={handleShare}
            threadContent={thread.content}
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

