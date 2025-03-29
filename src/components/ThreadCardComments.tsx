
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import ThreadCardComment from "@/components/ThreadCardComment";
import ThreadCardCommentForm from "@/components/ThreadCardCommentForm";
import { supabase } from "@/integrations/supabase/client";

interface ThreadCardCommentsProps {
  threadId: string;  // This should be a UUID from the database
  commentCount: number;
}

// Define a type for the profile data structure
interface ProfileData {
  id?: string;
  username?: string;
  avatar_url?: string;
}

const ThreadCardComments = ({ threadId, commentCount }: ThreadCardCommentsProps) => {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Add debug information about the incoming threadId
  console.log("[ThreadCardComments] Received threadId:", {
    value: threadId,
    type: typeof threadId,
    length: threadId?.length,
    isUuid: threadId?.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i) !== null
  });
  
  const fetchComments = async () => {
    if (!threadId) return;
    
    // Log the threadId for debugging
    console.log("[ThreadCardComments] Fetching comments for threadId:", threadId);
    
    // Validate UUID format for threadId
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(threadId)) {
      console.error("[ThreadCardComments] Invalid UUID format for threadId:", threadId);
      return;
    }
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          user_id,
          profiles:user_id(id, username, avatar_url)
        `)
        .eq('thread_id', threadId)
        .is('parent_id', null) // Only get top-level comments
        .order('created_at', { ascending: false })
        .limit(5); // Limit to 5 most recent comments
      
      if (error) {
        console.error("[ThreadCardComments] Error fetching comments:", error);
        throw error;
      }
      
      console.log("[ThreadCardComments] Fetched comments:", data);
      
      if (!data) return;
      
      // Process comments to count votes
      const processedComments = await Promise.all(
        data.map(async (comment) => {
          // Count upvotes for comment
          const { count: upvotes } = await supabase
            .from('votes')
            .select('id', { count: 'exact' })
            .eq('comment_id', comment.id)
            .eq('vote_type', 'up');
          
          // Count downvotes for comment
          const { count: downvotes } = await supabase
            .from('votes')
            .select('id', { count: 'exact' })
            .eq('comment_id', comment.id)
            .eq('vote_type', 'down');
          
          // Make sure we have a valid profiles object from the join
          const authorProfile = comment.profiles as ProfileData || {};
          
          return {
            id: comment.id,
            content: comment.content,
            author: {
              name: authorProfile?.username || 'Anonymous',
              avatar: authorProfile?.avatar_url
            },
            votes: ((upvotes || 0) - (downvotes || 0)),
            createdAt: new Date(comment.created_at).toLocaleDateString('en-US', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
          };
        })
      );
      
      console.log("[ThreadCardComments] Processed comments:", processedComments);
      setComments(processedComments);
    } catch (error) {
      console.error('[ThreadCardComments] Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchComments();
  }, [threadId]);
  
  const handleCommentAdded = () => {
    console.log("[ThreadCardComments] Comment added, refreshing comments");
    fetchComments();
  };
  
  return (
    <div className="mt-3 border-t pt-3">
      <ThreadCardCommentForm 
        threadId={threadId} 
        onCommentAdded={handleCommentAdded} 
      />
      
      <div className="mt-3">
        {loading ? (
          <div className="p-3 text-center text-sm text-muted-foreground">Loading comments...</div>
        ) : comments.length > 0 ? (
          <div className="divide-y">
            {comments.map((comment) => (
              <ThreadCardComment key={comment.id} comment={comment} />
            ))}
          </div>
        ) : (
          <div className="p-3 text-center text-sm text-muted-foreground">
            No comments yet. Be the first to comment!
          </div>
        )}
      </div>
      
      {commentCount > comments.length && comments.length > 0 && (
        <div className="p-3 text-center">
          <Button 
            variant="link"
            size="sm"
            asChild
          >
            <a href={`/thread/${threadId}`}>View all {commentCount} comments</a>
          </Button>
        </div>
      )}
    </div>
  );
};

export default ThreadCardComments;
