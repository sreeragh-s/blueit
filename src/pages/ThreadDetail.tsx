
import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { useToast } from "@/hooks/use-toast";
import { useThreadDetail } from "@/hooks/use-thread-detail";
import ThreadHeader from "@/components/ThreadHeader";
import ThreadContent from "@/components/ThreadContent";
import ThreadVoteControls from "@/components/ThreadVoteControls";
import ThreadActions from "@/components/ThreadActions";
import CommentsSection from "@/components/CommentsSection";
import ThreadLoadingState from "@/components/ThreadLoadingState";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const ThreadDetail = () => {
  const { threadId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Initialize the hook with threadId
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
  
  // Navigate away if thread doesn't exist
  useEffect(() => {
    if (exists === false) {
      navigate('/');
      toast({
        title: "Invalid thread",
        description: "The thread you're trying to view doesn't exist.",
        variant: "destructive"
      });
    }
  }, [exists, navigate, toast]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container flex">
          <Sidebar />
          <main className="flex-1 p-4 lg:p-6 flex justify-center items-center">
            <ThreadLoadingState />
          </main>
        </div>
      </div>
    );
  }
  
  if (!thread) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container flex">
          <Sidebar />
          <main className="flex-1 p-4 lg:p-6 flex justify-center items-center">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">Thread not found or you don't have access to it.</p>
              <Button asChild>
                <Link to="/">Go back to home</Link>
              </Button>
            </div>
          </main>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container flex">
        <Sidebar />
        <main className="flex-1 p-4 lg:p-6">
          <ThreadHeader />
          
          <div className="thread-card mb-6">
            <div className="flex items-start p-4">
              <ThreadVoteControls 
                votes={votes} 
                userVote={userVote} 
                isVoting={isVoting} 
                onVote={handleVote} 
              />
              <ThreadContent thread={thread} />
            </div>
            
            <ThreadActions 
              saved={saved} 
              isBookmarking={isBookmarking} 
              onShare={handleShare} 
              onToggleSave={handleToggleSave} 
            />
          </div>
          
          <CommentsSection 
            user={user} 
            comments={comments} 
            onSubmitComment={(content) => handleSubmitComment(content).then(() => {})} 
          />
        </main>
      </div>
    </div>
  );
};

export default ThreadDetail;
