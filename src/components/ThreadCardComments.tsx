
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import ThreadCardComment from "@/components/ThreadCardComment";
import ThreadCardCommentForm from "@/components/ThreadCardCommentForm";
import { supabase } from "@/integrations/supabase/client";

interface ThreadCardCommentsProps {
  threadId: string;
  commentCount: number;
}

// Define a type for the profile data structure
interface ProfileData {
  id?: string;
  username?: string;
  avatar_url?: string;
}

const ThreadCardComments = ({ threadId, commentCount }: ThreadCardCommentsProps) => {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const fetchComments = async () => {
    if (!threadId) return;
    
    // Format thread ID for database compatibility
    const formattedThreadId = formatThreadId(threadId);
    
    if (!formattedThreadId) {
      console.error(`Invalid thread ID format: ${threadId}`);
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
        .eq('thread_id', formattedThreadId)
        .is('parent_id', null) // Only get top-level comments
        .order('created_at', { ascending: false })
        .limit(5); // Limit to 5 most recent comments
      
      if (error) throw error;
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
          // The key is to use the correct path when accessing the joined profiles data
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
      
      setComments(processedComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to convert various ID formats to valid IDs for database queries
  const formatThreadId = (id: string): string | null => {
    // Check if it's already a valid UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(id)) {
      return id;
    }
    
    // If it's a numeric ID, assume it's already a valid ID in your database
    // We'll return it as is, letting Supabase handle any conversion/validation
    return id;
  };
  
  useEffect(() => {
    if (showComments) {
      fetchComments();
    }
  }, [showComments, threadId]);
  
  const handleCommentAdded = () => {
    fetchComments();
  };
  
  return (
    <div className="mt-1">
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start text-muted-foreground"
        onClick={() => setShowComments(!showComments)}
      >
        <MessageSquare size={16} className="mr-2" />
        {commentCount} {commentCount === 1 ? 'Comment' : 'Comments'}
      </Button>
      
      {showComments && (
        <div className="mt-2 border rounded-md">
          <ThreadCardCommentForm 
            threadId={threadId} 
            onCommentAdded={handleCommentAdded} 
          />
          
          <div className="divide-y">
            {loading ? (
              <div className="p-3 text-center text-sm text-muted-foreground">Loading comments...</div>
            ) : comments.length > 0 ? (
              comments.map((comment) => (
                <ThreadCardComment key={comment.id} comment={comment} />
              ))
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
      )}
    </div>
  );
};

export default ThreadCardComments;
