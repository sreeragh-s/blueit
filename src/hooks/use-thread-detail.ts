
import { useAuth } from "@/contexts/AuthContext";
import { useThreadData } from "@/hooks/thread/use-thread-data";
import { useThreadComments } from "@/hooks/thread/use-thread-comments";
import { useThreadInteractions } from "@/hooks/thread/use-thread-interactions";

export const useThreadDetail = (threadId: string) => {
  const { user } = useAuth();
  const { thread, loading, exists, refetchThread } = useThreadData(threadId);
  const { comments, fetchComments, handleSubmitComment } = useThreadComments(threadId);
  const { 
    votes, 
    userVote, 
    saved, 
    isVoting, 
    isBookmarking, 
    handleVote, 
    handleToggleSave, 
    handleShare 
  } = useThreadInteractions(threadId, user);

  const submitComment = async (content: string) => {
    const newComment = await handleSubmitComment(user, content);
    if (newComment && thread) {
      // Update comment count in thread
      refetchThread();
    }
    return newComment;
  };

  return {
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
    handleSubmitComment: submitComment
  };
};
