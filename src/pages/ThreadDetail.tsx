
import { useParams, useNavigate } from "react-router-dom";
import { useThreadDetail } from "@/hooks/use-thread-detail";
import MainLayout from "@/components/layout/MainLayout";
import ThreadHeader from "@/components/ThreadHeader";
import ThreadContent from "@/components/ThreadContent";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import ThreadVoteSection from "@/components/thread/ThreadVoteSection";
import ThreadBookmarkSection from "@/components/thread/ThreadBookmarkSection";
import { Share } from "lucide-react";
import { CommentSection } from "@/components/comments/CommentSection";

const ThreadDetail = () => {
  const { threadId } = useParams<{ threadId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const {
    thread,
    comments,
    votes,
    userVote,
    saved,
    loading,
    exists,
    isVoting,
    isBookmarking,
    handleVote,
    handleToggleSave,
    handleShare,
    handleSubmitComment
  } = useThreadDetail(threadId || '');

  if (loading) {
    return (
      <MainLayout>
        <ThreadHeader />
        <Card className="p-6">
          <div className="flex gap-4">
            <div className="flex flex-col items-center space-y-2">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </div>
            <div className="flex-1 space-y-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          </div>
        </Card>
      </MainLayout>
    );
  }

  if (!exists || !thread) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <h1 className="text-2xl font-bold mb-4">Thread not found</h1>
          <p className="text-muted-foreground mb-6">This thread may have been removed or never existed.</p>
          <Button onClick={() => navigate("/")}>Return to Home</Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <ThreadHeader />
      <Card className="mb-4">
        <div className="p-6">
          <div className="flex gap-4">
            <ThreadVoteSection 
              threadId={thread.id} 
              initialVotes={votes}
              userVote={userVote}
              onVote={handleVote}
              isVoting={isVoting}
            />
            
            <ThreadContent thread={thread} />
          </div>
          
          <div className="flex justify-end gap-2 mt-4 border-t pt-4">
            <ThreadBookmarkSection
              saved={saved}
              isBookmarking={isBookmarking}
              onToggleSave={handleToggleSave}
            />
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleShare(thread.id)}
            >
              <Share size={16} className="mr-2" />
              Share
            </Button>
          </div>
        </div>
      </Card>

      <CommentSection 
        comments={comments} 
        threadId={thread.id} 
        onSubmitComment={(content) => handleSubmitComment(content)} 
      />
    </MainLayout>
  );
};

export default ThreadDetail;
