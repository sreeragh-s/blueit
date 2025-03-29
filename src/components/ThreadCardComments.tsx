
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import ThreadCardComment from "@/components/ThreadCardComment";
import ThreadCardCommentForm from "@/components/ThreadCardCommentForm";
import { supabase } from "@/integrations/supabase/client";

interface ThreadCardCommentsProps {
  threadId: string;  // This should be a UUID from the database
  commentCount: number;
  onCommentCountChange?: (count: number) => void;
  showAllComments?: boolean;
  onViewAllComments?: () => void;
  commentsToShow?: number;
}

interface ProfileData {
  id: string;
  username: string;
  avatar_url?: string;
}

const ThreadCardComments = ({ 
  threadId, 
  commentCount,
  onCommentCountChange,
  showAllComments = false,
  onViewAllComments,
  commentsToShow = 5
}: ThreadCardCommentsProps) => {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [allComments, setAllComments] = useState<any[]>([]);
  
  console.log("[ThreadCardComments] Received threadId:", {
    value: threadId,
    type: typeof threadId,
    length: threadId?.length,
    isUuid: threadId?.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i) !== null
  });
  
  const fetchComments = async () => {
    if (!threadId) return;
    
    console.log("[ThreadCardComments] Fetching comments for threadId:", threadId);
    
    // Validate UUID format for threadId
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(threadId)) {
      console.error("[ThreadCardComments] Invalid UUID format for threadId:", threadId);
      return;
    }
    
    try {
      setLoading(true);
      
      // First, get comments
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          user_id,
          parent_id
        `)
        .eq('thread_id', threadId)
        .is('parent_id', null) // Only get top-level comments
        .order('created_at', { ascending: false })
        .limit(commentsToShow); // Limit to specified number of comments
      
      if (commentsError) {
        console.error("[ThreadCardComments] Error fetching comments:", commentsError);
        throw commentsError;
      }
      
      if (!commentsData || commentsData.length === 0) {
        setComments([]);
        setLoading(false);
        return;
      }
      
      // Process comments to include user profiles and vote counts
      const processedComments = await Promise.all(
        commentsData.map(async (comment) => {
          // Get user profile for comment
          const { data: profileData } = await supabase
            .from('profiles')
            .select('username, avatar_url')
            .eq('id', comment.user_id)
            .single();
          
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
          
          // Get replies for this comment
          const { data: repliesData } = await supabase
            .from('comments')
            .select(`
              id,
              content,
              created_at,
              user_id
            `)
            .eq('thread_id', threadId)
            .eq('parent_id', comment.id)
            .order('created_at', { ascending: true });
            
          // Process replies to include user profiles and vote counts
          const processedReplies = repliesData ? await Promise.all(
            repliesData.map(async (reply) => {
              // Get user profile for reply
              const { data: replyProfileData } = await supabase
                .from('profiles')
                .select('username, avatar_url')
                .eq('id', reply.user_id)
                .single();
              
              // Count upvotes for reply
              const { count: replyUpvotes } = await supabase
                .from('votes')
                .select('id', { count: 'exact' })
                .eq('comment_id', reply.id)
                .eq('vote_type', 'up');
              
              // Count downvotes for reply
              const { count: replyDownvotes } = await supabase
                .from('votes')
                .select('id', { count: 'exact' })
                .eq('comment_id', reply.id)
                .eq('vote_type', 'down');
              
              return {
                id: reply.id,
                content: reply.content,
                author: {
                  name: replyProfileData?.username || 'Anonymous',
                  avatar: replyProfileData?.avatar_url
                },
                votes: ((replyUpvotes || 0) - (replyDownvotes || 0)),
                createdAt: new Date(reply.created_at).toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }),
                parent_id: comment.id
              };
            })
          ) : [];
          
          return {
            id: comment.id,
            content: comment.content,
            author: {
              name: profileData?.username || 'Anonymous',
              avatar: profileData?.avatar_url
            },
            votes: ((upvotes || 0) - (downvotes || 0)),
            createdAt: new Date(comment.created_at).toLocaleDateString('en-US', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }),
            replies: processedReplies || []
          };
        })
      );
      
      console.log("[ThreadCardComments] Processed comments:", processedComments);
      setComments(processedComments);
      
      // Get total comment count
      const { count: totalCount, error: countError } = await supabase
        .from('comments')
        .select('id', { count: 'exact' })
        .eq('thread_id', threadId);
        
      if (!countError && totalCount !== null && onCommentCountChange) {
        onCommentCountChange(totalCount);
      }
    } catch (error) {
      console.error('[ThreadCardComments] Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchAllComments = async () => {
    if (!threadId) return;
    
    console.log("[ThreadCardComments] Fetching all comments for threadId:", threadId);
    
    // Validate UUID format for threadId
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(threadId)) {
      console.error("[ThreadCardComments] Invalid UUID format for threadId:", threadId);
      return;
    }
    
    try {
      setLoading(true);
      
      // Get all comments for this thread
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          user_id,
          parent_id
        `)
        .eq('thread_id', threadId)
        .order('created_at', { ascending: false });
      
      if (commentsError) {
        console.error("[ThreadCardComments] Error fetching all comments:", commentsError);
        throw commentsError;
      }
      
      if (!commentsData || commentsData.length === 0) {
        setAllComments([]);
        setLoading(false);
        return;
      }
      
      // Process comments to include user profiles and vote counts
      // First, get all top-level comments
      const topLevelComments = commentsData.filter(comment => comment.parent_id === null);
      // Then get all replies
      const replies = commentsData.filter(comment => comment.parent_id !== null);
      
      // Build a comment tree with proper nesting for 5 levels
      const buildCommentTree = async (comments, replies, level = 0) => {
        if (level >= 5) return []; // Prevent excessive nesting
        
        return Promise.all(comments.map(async (comment) => {
          // Get user profile for comment
          const { data: profileData } = await supabase
            .from('profiles')
            .select('username, avatar_url')
            .eq('id', comment.user_id)
            .single();
          
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
          
          // Get comment's direct replies
          const commentReplies = replies.filter(reply => reply.parent_id === comment.id);
          
          // Process nested replies recursively
          const processedReplies = await buildCommentTree(commentReplies, replies, level + 1);
          
          return {
            id: comment.id,
            content: comment.content,
            author: {
              name: profileData?.username || 'Anonymous',
              avatar: profileData?.avatar_url
            },
            votes: ((upvotes || 0) - (downvotes || 0)),
            createdAt: new Date(comment.created_at).toLocaleDateString('en-US', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }),
            level,
            parent_id: comment.parent_id,
            user_id: comment.user_id,
            replies: processedReplies
          };
        }));
      };
      
      // Build the full comment tree
      const processedComments = await buildCommentTree(topLevelComments, replies);
      
      console.log("[ThreadCardComments] All processed comments:", processedComments);
      setAllComments(processedComments);
    } catch (error) {
      console.error('[ThreadCardComments] Error fetching all comments:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchComments();
  }, [threadId, commentsToShow]);
  
  const handleViewAllComments = async () => {
    if (onViewAllComments) {
      onViewAllComments();
    }
    await fetchAllComments();
  };
  
  const handleCommentAdded = (newComment: any) => {
    console.log("[ThreadCardComments] Comment added:", newComment);
    
    // Update comment count
    if (onCommentCountChange) {
      onCommentCountChange(commentCount + 1);
    }
    
    // Implementation with proper support for 5 levels of nesting
    const updateCommentsWithReply = (commentsArray, newReply) => {
      // For a top-level comment
      if (!newReply.parent_id) {
        return [{ ...newReply, replies: [] }, ...commentsArray];
      }
      
      // For nested replies - recursively update the comment tree
      return commentsArray.map(comment => {
        // If this is the parent comment, add the reply to its replies
        if (comment.id === newReply.parent_id) {
          return {
            ...comment,
            replies: [newReply, ...(comment.replies || [])]
          };
        }
        
        // If this comment has replies, search them recursively
        if (comment.replies && comment.replies.length > 0) {
          return {
            ...comment,
            replies: updateCommentsWithReply(comment.replies, newReply)
          };
        }
        
        // Otherwise return the comment unchanged
        return comment;
      });
    };
    
    if (showAllComments) {
      // Update allComments state with proper nesting
      setAllComments(prevComments => updateCommentsWithReply(prevComments, newComment));
    } else {
      // Update comments state with proper nesting
      setComments(prevComments => updateCommentsWithReply(prevComments, newComment));
    }
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
        ) : showAllComments ? (
          allComments.length > 0 ? (
            <div className="space-y-3">
              {allComments.map(comment => (
                <ThreadCardComment 
                  key={comment.id} 
                  comment={comment} 
                  threadId={threadId}
                  onCommentAdded={handleCommentAdded}
                  level={0}
                  maxLevel={5}
                />
              ))}
            </div>
          ) : (
            <div className="p-3 text-center text-sm text-muted-foreground">
              No comments yet. Be the first to comment!
            </div>
          )
        ) : comments.length > 0 ? (
          <div className="space-y-3">
            {comments.map(comment => (
              <ThreadCardComment 
                key={comment.id} 
                comment={comment} 
                threadId={threadId}
                onCommentAdded={handleCommentAdded}
                level={0}
                maxLevel={5}
                showOnlyOneReply={true} // Added this prop
              />
            ))}
          </div>
        ) : (
          <div className="p-3 text-center text-sm text-muted-foreground">
            No comments yet. Be the first to comment!
          </div>
        )}
      </div>
      
      {!showAllComments && commentCount > comments.reduce((total, comment) => {
        // Count this comment
        let count = 1;
        // Add all replies recursively
        const countReplies = (replies) => {
          if (!replies || !replies.length) return 0;
          return replies.reduce((sum, reply) => {
            return sum + 1 + countReplies(reply.replies);
          }, 0);
        };
        count += countReplies(comment.replies);
        return total + count;
      }, 0) && (
        <div className="p-3 text-center">
          <Button 
            variant="link"
            size="sm"
            onClick={handleViewAllComments}
          >
            View all {commentCount} comments
          </Button>
        </div>
      )}
    </div>
  );
};

export default ThreadCardComments;
