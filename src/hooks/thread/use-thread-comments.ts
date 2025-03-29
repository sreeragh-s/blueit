
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CommentQueryResult } from "@/types/supabase";
import { User } from "@supabase/supabase-js";

export const useThreadComments = (threadId: string) => {
  const { toast } = useToast();
  const [comments, setComments] = useState<any[]>([]);
  
  const fetchComments = async () => {
    // Log for debugging
    console.log("useThreadComments - Fetching comments for threadId:", threadId);
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(threadId)) {
      console.error("Invalid UUID format in useThreadComments:", threadId);
      return;
    }
    
    try {
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          updated_at,
          thread_id,
          parent_id,
          user_id,
          profiles:user_id(id, username, avatar_url)
        `)
        .eq('thread_id', threadId)
        .order('created_at', { ascending: false });
      
      if (commentsError) {
        console.error("Error fetching comments in useThreadComments:", commentsError);
        throw commentsError;
      }
      
      console.log("useThreadComments - Raw comments data:", commentsData);
      
      // Process comments to count votes
      const processedComments = await Promise.all(
        commentsData.map(async (comment) => {
          // Cast to our query result type with proper type assertion
          const typedComment = comment as unknown as CommentQueryResult;
          
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
          
          return {
            id: typedComment.id,
            content: typedComment.content,
            author: {
              name: typedComment.profiles?.username || 'Anonymous',
              avatar: typedComment.profiles?.avatar_url
            },
            votes: ((upvotes || 0) - (downvotes || 0)),
            createdAt: new Date(typedComment.created_at).toLocaleDateString('en-US', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }),
            parent_id: typedComment.parent_id,
            user_id: typedComment.user_id,
            replies: []
          };
        })
      );
      
      // Organize comments with replies nested
      const topLevelComments = processedComments.filter(comment => !comment.parent_id);
      const replyComments = processedComments.filter(comment => comment.parent_id);
      
      // Add replies to their parent comments
      replyComments.forEach(reply => {
        const parent = processedComments.find(comment => comment.id === reply.parent_id);
        if (parent) {
          if (!parent.replies) parent.replies = [];
          parent.replies.push(reply);
        }
      });
      
      console.log("useThreadComments - Processed comments:", topLevelComments);
      
      setComments(topLevelComments);
    } catch (error) {
      console.error('Error fetching comments in useThreadComments:', error);
    }
  };

  const handleSubmitComment = async (user: User | null, content: string, parentId?: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "You need to sign in to comment.",
        variant: "destructive"
      });
      return;
    }
    
    if (!content.trim()) return;
    
    // Log for debugging
    console.log("handleSubmitComment - Inputs:", {
      threadId,
      userId: user.id,
      content,
      parentId
    });
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(threadId)) {
      console.error("Invalid UUID format in handleSubmitComment:", threadId);
      toast({
        title: "Error",
        description: "Invalid thread ID format. Please try again.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const commentData: any = {
        content,
        thread_id: threadId,
        user_id: user.id
      };
      
      // Add parent_id if this is a reply
      if (parentId) {
        commentData.parent_id = parentId;
      }
      
      const { data: newComment, error } = await supabase
        .from('comments')
        .insert(commentData)
        .select()
        .single();
      
      if (error) {
        console.error('Error adding comment in useThreadComments:', error);
        throw error;
      }
      
      console.log("handleSubmitComment - New comment added:", newComment);
      
      // Add the new comment to the UI immediately
      const processedComment = {
        id: newComment.id,
        content: newComment.content,
        author: {
          name: user.user_metadata.username || 'Anonymous',
          avatar: user.user_metadata.avatar_url
        },
        votes: 0,
        createdAt: "Just now",
        parent_id: parentId,
        replies: []
      };
      
      if (parentId) {
        // If this is a reply, find parent and add to its replies
        setComments(prevComments => {
          return prevComments.map(comment => {
            if (comment.id === parentId) {
              return {
                ...comment,
                replies: [processedComment, ...(comment.replies || [])]
              };
            }
            return comment;
          });
        });
      } else {
        // If top-level comment, add to beginning of list
        setComments([processedComment, ...comments]);
      }
      
      return processedComment;
    } catch (error) {
      console.error('Error adding comment in useThreadComments:', error);
      toast({
        title: "Error",
        description: "Failed to post your comment. Please try again.",
        variant: "destructive"
      });
      return null;
    }
  };
  
  useEffect(() => {
    if (threadId) {
      fetchComments();
    }
  }, [threadId]);

  return {
    comments,
    fetchComments,
    handleSubmitComment
  };
};
