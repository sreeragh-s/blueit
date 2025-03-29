
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ThreadWithRelations, ThreadQueryResult, CommentQueryResult } from "@/types/supabase";
import { useThread } from "@/hooks/use-thread";

export const useThreadDetail = (threadId: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [thread, setThread] = useState<ThreadWithRelations | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [votes, setVotes] = useState(0);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const { voteThread, toggleBookmark, isVoting, isBookmarking } = useThread(threadId || '');

  const fetchThread = async () => {
    try {
      setLoading(true);
      const { data: threadData, error: threadError } = await supabase
        .from('threads')
        .select(`
          id,
          title,
          content,
          created_at,
          updated_at,
          user_id,
          community_id,
          communities:community_id(id, name),
          profiles:user_id(id, username, avatar_url)
        `)
        .eq('id', threadId)
        .single();
      
      if (threadError) throw threadError;
      if (!threadData) throw new Error("Thread not found");
      
      // Convert to our query result type with proper type assertion
      const typedThreadData = threadData as unknown as ThreadQueryResult;
      
      // Count upvotes
      const { count: upvotes } = await supabase
        .from('votes')
        .select('id', { count: 'exact' })
        .eq('thread_id', threadId)
        .eq('vote_type', 'up');
      
      // Count downvotes
      const { count: downvotes } = await supabase
        .from('votes')
        .select('id', { count: 'exact' })
        .eq('thread_id', threadId)
        .eq('vote_type', 'down');
      
      // Fetch tags
      const { data: tagsData } = await supabase
        .from('thread_tags')
        .select('tags:tag_id(name)')
        .eq('thread_id', threadId);
      
      const tags = tagsData?.map(tag => 
        (tag.tags as any)?.name
      ).filter(Boolean) || [];
      
      // Count comments
      const { count: commentCount } = await supabase
        .from('comments')
        .select('id', { count: 'exact' })
        .eq('thread_id', threadId);
      
      const formattedDate = new Date(typedThreadData.created_at).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });

      setThread({
        ...typedThreadData,
        author: {
          id: typedThreadData.profiles?.id || 'unknown',
          name: typedThreadData.profiles?.username || 'Anonymous',
          avatar: typedThreadData.profiles?.avatar_url
        },
        community: {
          id: typedThreadData.communities?.id || 'unknown',
          name: typedThreadData.communities?.name || 'Unknown Community'
        },
        votes: ((upvotes || 0) - (downvotes || 0)),
        commentCount: commentCount || 0,
        tags: tags,
        createdAt: formattedDate
      });
      
      setVotes((upvotes || 0) - (downvotes || 0));
    } catch (error) {
      console.error('Error fetching thread:', error);
      toast({
        title: "Error",
        description: "Failed to load thread details. It may not exist or you don't have access.",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };
  
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
  
  const checkIfSaved = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('user_id', user.id)
        .eq('thread_id', threadId)
        .single();
      
      setSaved(!!data);
    } catch (error) {
      // If error, bookmark doesn't exist
      setSaved(false);
    }
  };
  
  const checkUserVote = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('votes')
        .select('vote_type')
        .eq('user_id', user.id)
        .eq('thread_id', threadId)
        .single();
      
      if (data) {
        setUserVote(data.vote_type as 'up' | 'down');
      }
    } catch (error) {
      // If error, vote doesn't exist
      setUserVote(null);
    }
  };
  
  const handleVote = async (type: 'up' | 'down') => {
    const success = await voteThread(type);
    if (success) {
      // Update UI
      if (userVote === type) {
        // Remove vote
        setVotes(type === 'up' ? votes - 1 : votes + 1);
        setUserVote(null);
      } else if (userVote === null) {
        // Add new vote
        setVotes(type === 'up' ? votes + 1 : votes - 1);
        setUserVote(type);
      } else {
        // Change vote type
        setVotes(type === 'up' ? votes + 2 : votes - 2);
        setUserVote(type);
      }
    }
  };
  
  const handleToggleSave = async () => {
    const result = await toggleBookmark();
    if (result !== null) {
      setSaved(result);
    }
  };
  
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied",
      description: "Thread link copied to clipboard",
    });
  };
  
  const handleSubmitComment = async (content: string) => {
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
      
      // Refresh comment count
      if (thread) {
        setThread({
          ...thread,
          commentCount: (thread.commentCount || 0) + 1
        });
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: "Failed to post your comment. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  useEffect(() => {
    if (threadId) {
      fetchThread();
      fetchComments();
      checkIfSaved();
      checkUserVote();
    }
  }, [threadId, user]);

  return {
    thread,
    comments,
    votes,
    userVote,
    saved,
    loading,
    isVoting,
    isBookmarking,
    handleVote,
    handleToggleSave,
    handleShare,
    handleSubmitComment
  };
};
