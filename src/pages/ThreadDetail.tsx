
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import CommentCard from "@/components/CommentCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare, 
  Share2, 
  Bookmark, 
  Flag,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useThread } from "@/hooks/use-thread";
import { ThreadWithRelations, ThreadQueryResult, CommentQueryResult } from "@/types/supabase";
import ThreadLoadingState from "@/components/ThreadLoadingState";

const ThreadDetail = () => {
  const { threadId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [thread, setThread] = useState<ThreadWithRelations | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState("");
  const [votes, setVotes] = useState(0);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const { voteThread, toggleBookmark, isVoting, isBookmarking } = useThread(threadId || '');
  
  useEffect(() => {
    if (!threadId || isNaN(Number(threadId))) {
      navigate('/');
      toast({
        title: "Invalid thread",
        description: "The thread you're trying to view doesn't exist.",
        variant: "destructive"
      });
      return;
    }
    
    fetchThread();
    fetchComments();
    checkIfSaved();
    checkUserVote();
  }, [threadId, user]);
  
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
      navigate('/');
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
            // Placeholder for replies, to be implemented later
            replies: []
          };
        })
      );
      
      setComments(processedComments);
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
  
  const handleToggleBookmark = async () => {
    const result = await toggleBookmark();
    if (result !== null) {
      setSaved(result);
    }
  };
  
  const handleSubmitComment = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "You need to sign in to comment.",
        variant: "destructive"
      });
      return;
    }
    
    if (!commentText.trim()) return;
    
    try {
      const { data: newComment, error } = await supabase
        .from('comments')
        .insert({
          content: commentText,
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
      setCommentText("");
      
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
  
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied",
      description: "Thread link copied to clipboard",
    });
  };
  
  const formatContent = (content: string) => {
    if (!content) return [];
    
    return content.split('\n\n').map((paragraph, idx) => (
      <p key={idx} className="mb-4">
        {paragraph.split('\n').map((line, lineIdx) => (
          <span key={lineIdx}>
            {line}
            {lineIdx < paragraph.split('\n').length - 1 && <br />}
          </span>
        ))}
      </p>
    ));
  };
  
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
          <Button variant="ghost" className="mb-4" asChild>
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to feed
            </Link>
          </Button>
          
          <div className="thread-card mb-6">
            <div className="flex items-start p-4">
              <div className="flex flex-col items-center mr-4">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={cn("h-8 w-8 rounded-full", userVote === 'up' ? "text-primary" : "")}
                  onClick={() => handleVote('up')}
                  disabled={isVoting}
                >
                  <ThumbsUp size={16} />
                </Button>
                <span className="text-sm font-medium py-1">{votes}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={cn("h-8 w-8 rounded-full", userVote === 'down' ? "text-destructive" : "")}
                  onClick={() => handleVote('down')}
                  disabled={isVoting}
                >
                  <ThumbsDown size={16} />
                </Button>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="hover:bg-accent">
                    <Link to={`/community/${thread.community.id}`}>
                      c/{thread.community.name}
                    </Link>
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Posted by u/{thread.author.name} · {thread.createdAt || ''}
                  </span>
                </div>
                
                <h1 className="text-2xl font-bold mb-4">{thread.title}</h1>
                
                <div className="mb-4">
                  {formatContent(thread.content)}
                </div>
                
                {thread.tags && thread.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {thread.tags.map((tag: string, i: number) => (
                      <Badge key={i} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="px-4 py-2 flex justify-between items-center border-t bg-muted/20">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" className="flex items-center gap-1">
                  <MessageSquare size={16} />
                  <span>{comments.length} Comments</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex items-center gap-1"
                  onClick={handleShare}
                >
                  <Share2 size={16} />
                  <span>Share</span>
                </Button>
              </div>
              
              <div className="flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={cn("flex items-center gap-1", saved ? "text-primary" : "")}
                  onClick={handleToggleBookmark}
                  disabled={isBookmarking}
                >
                  <Bookmark size={16} />
                  <span>{saved ? "Saved" : "Save"}</span>
                </Button>
                <Button variant="ghost" size="sm" className="flex items-center gap-1">
                  <Flag size={16} />
                  <span>Report</span>
                </Button>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4">Comments ({comments.length})</h2>
            
            <div className="bg-card rounded-lg border p-4 mb-6">
              <div className="flex items-start gap-3 mb-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.user_metadata?.avatar_url || "/placeholder.svg"} alt="Your Avatar" />
                  <AvatarFallback>
                    {user?.user_metadata?.username?.slice(0, 2).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <Textarea
                  placeholder="What are your thoughts?"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="flex-1 min-h-[100px]"
                />
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSubmitComment} disabled={!commentText.trim() || !user}>
                  Comment
                </Button>
              </div>
            </div>
            
            <div className="space-y-4">
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <CommentCard key={comment.id} comment={comment} />
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No comments yet. Be the first to comment!
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ThreadDetail;
