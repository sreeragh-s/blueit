
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ThumbsUp, ThumbsDown, Reply, MoreVertical, Flag } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CommentProps {
  comment: {
    id: string;
    content: string;
    author: {
      name: string;
      avatar?: string;
    };
    votes: number;
    createdAt: string;
    replies?: CommentProps["comment"][];
    parent_id?: string | null;
    user_id?: string;
  };
  level?: number;
}

const CommentCard = ({ comment, level = 0 }: CommentProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [votes, setVotes] = useState(comment.votes);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Check if user has voted on this comment
  useEffect(() => {
    const checkUserVote = async () => {
      if (!user || !comment.id) return;
      
      try {
        const { data } = await supabase
          .from('votes')
          .select('vote_type')
          .eq('user_id', user.id)
          .eq('comment_id', comment.id)
          .single();
        
        if (data) {
          setUserVote(data.vote_type as 'up' | 'down');
        }
      } catch (error) {
        // If error, vote doesn't exist
      }
    };
    
    checkUserVote();
  }, [user, comment.id]);
  
  const handleVote = async (type: 'up' | 'down') => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "You need to sign in to vote on comments.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      console.log("Voting on comment:", {
        commentId: comment.id,
        userId: user.id,
        voteType: type
      });
      
      // Validate UUID format for comment.id
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(comment.id)) {
        console.error("Invalid UUID format for comment.id:", comment.id);
        toast({
          title: "Error",
          description: "Invalid comment ID format. Please try again.",
          variant: "destructive"
        });
        return;
      }
      
      // Check if user has already voted
      const { data: existingVoteData } = await supabase
        .from('votes')
        .select('*')
        .eq('comment_id', comment.id)
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (existingVoteData) {
        if (existingVoteData.vote_type === type) {
          // Remove vote if clicking the same button again
          await supabase
            .from('votes')
            .delete()
            .eq('id', existingVoteData.id);
          
          // Update UI
          setVotes(type === 'up' ? votes - 1 : votes + 1);
          setUserVote(null);
          
          toast({
            title: "Vote removed",
            description: "Your vote has been removed",
          });
        } else {
          // Update vote if changing vote type
          await supabase
            .from('votes')
            .update({ vote_type: type })
            .eq('id', existingVoteData.id);
          
          // Update UI
          setVotes(type === 'up' ? votes + 2 : votes - 2);
          setUserVote(type);
          
          toast({
            title: "Vote updated",
            description: `You ${type}voted this comment`,
          });
        }
      } else {
        // Create new vote
        await supabase
          .from('votes')
          .insert({
            comment_id: comment.id,
            user_id: user.id,
            vote_type: type
          });
        
        // Update UI
        setVotes(type === 'up' ? votes + 1 : votes - 1);
        setUserVote(type);
        
        toast({
          title: "Vote registered",
          description: `You ${type}voted this comment`,
        });
      }
    } catch (error) {
      console.error('Error voting on comment:', error);
      toast({
        title: "Error",
        description: "Failed to register your vote. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleSubmitReply = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "You need to sign in to reply to comments.",
        variant: "destructive"
      });
      return;
    }
    
    if (!replyContent.trim()) return;
    
    try {
      setIsSubmitting(true);
      
      // Get thread_id from parent comment by looking at the URL
      const threadId = window.location.pathname.split('/').pop();
      
      console.log("Submitting reply:", {
        threadId,
        userId: user.id,
        parentId: comment.id,
        content: replyContent
      });
      
      // Validate UUID format for comment.id
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(comment.id)) {
        console.error("Invalid UUID format for comment.id:", comment.id);
        throw new Error(`Invalid UUID format for comment.id: ${comment.id}`);
      }
      
      // Validate threadId if extracted from URL
      if (threadId && !uuidRegex.test(threadId)) {
        console.error("Invalid UUID format for threadId:", threadId);
        throw new Error(`Invalid UUID format for threadId: ${threadId}`);
      }
      
      const { data: newReply, error } = await supabase
        .from('comments')
        .insert({
          content: replyContent,
          thread_id: threadId,
          user_id: user.id,
          parent_id: comment.id
        })
        .select(`
          id,
          content,
          created_at,
          user_id,
          profiles:user_id(id, username, avatar_url)
        `)
        .single();
      
      if (error) throw error;
      
      console.log("Reply successfully added:", newReply);
      
      // Format the reply to match our comment interface
      const formattedReply = {
        id: newReply.id,
        content: newReply.content,
        author: {
          name: user.user_metadata.username || 'Anonymous',
          avatar: user.user_metadata.avatar_url
        },
        votes: 0,
        createdAt: "Just now",
        parent_id: comment.id,
        replies: []
      };
      
      // Add the reply to the UI
      if (!comment.replies) {
        comment.replies = [formattedReply];
      } else {
        comment.replies = [formattedReply, ...comment.replies];
      }
      
      // Reset form
      setReplyContent("");
      setShowReplyForm(false);
      
      toast({
        title: "Reply posted",
        description: "Your reply has been posted successfully.",
      });
    } catch (error) {
      console.error('Error adding reply:', error);
      toast({
        title: "Error",
        description: "Failed to post your reply. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Limit nesting to 5 levels deep
  const maxLevel = 5;
  
  return (
    <div className={cn("comment-card bg-card border rounded-lg p-4", level > 0 && "ml-6 mt-3")}>
      <div className="flex items-start gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
          <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium">{comment.author.name}</span>
              <span className="text-xs text-muted-foreground">{comment.createdAt}</span>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="flex items-center">
                  <Flag className="mr-2 h-4 w-4" />
                  <span>Report</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="my-2">
            <p className="text-sm">{comment.content}</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn("h-7 w-7 rounded-full", userVote === 'up' ? "text-primary" : "")}
                onClick={() => handleVote('up')}
              >
                <ThumbsUp size={14} />
              </Button>
              <span className="text-xs font-medium px-1">{votes}</span>
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn("h-7 w-7 rounded-full", userVote === 'down' ? "text-destructive" : "")}
                onClick={() => handleVote('down')}
              >
                <ThumbsDown size={14} />
              </Button>
            </div>
            
            {level < maxLevel && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 text-xs"
                onClick={() => setShowReplyForm(!showReplyForm)}
              >
                <Reply size={14} className="mr-1" />
                Reply
              </Button>
            )}
          </div>
          
          {showReplyForm && (
            <div className="mt-3">
              <Textarea
                placeholder="Write a reply..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="min-h-[100px] text-sm"
              />
              <div className="flex justify-end gap-2 mt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowReplyForm(false)}
                >
                  Cancel
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleSubmitReply}
                  disabled={!replyContent.trim() || isSubmitting || !user}
                >
                  {isSubmitting ? 'Posting...' : 'Reply'}
                </Button>
              </div>
            </div>
          )}
          
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3">
              {comment.replies.map((reply) => (
                <CommentCard key={reply.id} comment={reply} level={level + 1} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentCard;
