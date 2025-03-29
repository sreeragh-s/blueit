
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CommentQueryResult } from "@/types/supabase";
import { User } from "@supabase/supabase-js";

export const useThreadComments = (threadId: string) => {
  const { toast } = useToast();
  const [comments, setComments] = useState<any[]>([]);
  
  const fetchComments = async () => {
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
      
      if (commentsError) throw commentsError;
      
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
      
      setComments(topLevelComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleSubmitComment = async (user: User | null, content: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "You need to sign in to comment.",
        variant: "destructive"
      });
      return;
    }
    
    if (!content.trim()) return;
    
    try {
      const { data: newComment, error } = await supabase
        .from('comments')
        .insert({
          content,
          thread_id: threadId,
          user_id: user.id
        })
        .select()
        .single();
      
      if (error) throw error;
      
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
        replies: []
      };
      
      setComments([processedComment, ...comments]);
      
      return processedComment;
    } catch (error) {
      console.error('Error adding comment:', error);
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
