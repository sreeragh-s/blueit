
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, MessageSquareReply, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

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
    parent_id?: string | null;
    user_id?: string;
    replies?: any[];
    level?: number;
  };
  threadId: string;
  onCommentAdded: (newComment: any) => void;
  level?: number;  // Added nested level parameter
  maxLevel?: number; // Max level of nesting allowed
  showOnlyOneReply?: boolean; // New prop to control reply display
}

const ThreadCardComment = ({ 
  comment, 
  threadId,
  onCommentAdded,
  level = 0,
  maxLevel = 5,
  showOnlyOneReply = false
}: CommentProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [votes, setVotes] = useState(comment.votes);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [repliesExpanded, setRepliesExpanded] = useState(false);
  const [showMoreReplies, setShowMoreReplies] = useState(false);
  
  const hasReplies = comment.replies && comment.replies.length > 0;
  const canNestFurther = level < maxLevel - 1;
  
  // Determine which replies to show
  const visibleReplies = showOnlyOneReply && !showMoreReplies && comment.replies && comment.replies.length > 0
    ? [comment.replies[0]]
    : comment.replies;
  
  // Count additional replies that are hidden
  const hiddenRepliesCount = showOnlyOneReply && !showMoreReplies && comment.replies 
    ? comment.replies.length - 1 
    : 0;

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
        } else {
          // Update vote if changing vote type
          await supabase
            .from('votes')
            .update({ vote_type: type })
            .eq('id', existingVoteData.id);
          
          // Update UI
          setVotes(type === 'up' ? votes + 2 : votes - 2);
          setUserVote(type);
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

  const handleReplyClick = () => {
    console.log("Reply clicked for comment:", comment.id);
    setShowReplyForm(!showReplyForm);
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
    
    if (!replyText.trim()) return;
    
    try {
      setIsSubmitting(true);
      
      console.log("Submitting reply to comment:", {
        parentId: comment.id,
        threadId,
        content: replyText
      });
      
      const { data: newReply, error } = await supabase
        .from('comments')
        .insert({
          content: replyText,
          thread_id: threadId,
          user_id: user.id,
          parent_id: comment.id
        })
        .select()
        .single();
      
      if (error) {
        console.error("Error submitting reply:", error);
        throw error;
      }
      
      console.log("Reply submitted successfully:", newReply);
      
      // Create the processed reply object
      const processedReply = {
        id: newReply.id,
        content: newReply.content,
        author: {
          name: user.user_metadata.username || 'Anonymous',
          avatar: user.user_metadata.avatar_url
        },
        votes: 0,
        createdAt: "Just now",
        parent_id: comment.id,
        user_id: user.id,
        replies: [],
        level: level + 1
      };
      
      setReplyText("");
      setShowReplyForm(false);
      
      // Pass the new reply to the parent component
      onCommentAdded(processedReply);
      
      toast({
        title: "Reply posted",
        description: "Your reply has been posted successfully."
      });
    } catch (error) {
      console.error("Failed to submit reply:", error);
      toast({
        title: "Error",
        description: "Failed to post your reply. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleReplies = () => {
    setRepliesExpanded(!repliesExpanded);
  };
  
  const handleShowMoreReplies = () => {
    setShowMoreReplies(true);
  };

  // Get indentation based on nesting level
  const getIndentClass = () => {
    return level > 0 ? `pl-${Math.min(level * 2, 8)}` : '';
  };

  // Get background color based on nesting level for visual hierarchy
  const getLevelBackground = () => {
    const colors = [
      '',
      'bg-muted/10',
      'bg-muted/20',
      'bg-muted/30',
      'bg-muted/40'
    ];
    return colors[Math.min(level, colors.length - 1)];
  };

  return (
    <div className={`py-3 border-b last:border-b-0 ${getLevelBackground()}`}>
      <div className="flex items-start gap-2">
        <Avatar className="h-6 w-6">
          <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
          <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium">{comment.author.name}</span>
            <span className="text-xs text-muted-foreground">{comment.createdAt}</span>
          </div>
          
          <p className="text-sm mt-1">{comment.content}</p>
          
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn("h-6 w-6 rounded-full", userVote === 'up' ? "text-primary" : "")}
                onClick={() => handleVote('up')}
              >
                <ThumbsUp size={12} />
              </Button>
              <span className="text-xs font-medium px-1">{votes}</span>
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn("h-6 w-6 rounded-full", userVote === 'down' ? "text-destructive" : "")}
                onClick={() => handleVote('down')}
              >
                <ThumbsDown size={12} />
              </Button>
            </div>
            
            {/* Only show Reply button if user is signed in and we haven't reached max nesting */}
            {user && canNestFurther && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 text-xs"
                onClick={handleReplyClick}
                data-comment-id={comment.id}
              >
                <MessageSquareReply size={12} className="mr-1" />
                Reply
              </Button>
            )}
          </div>
          
          {showReplyForm && canNestFurther && (
            <div className="mt-3">
              <div className="flex items-start gap-2">
                <Avatar className="h-5 w-5">
                  <AvatarImage src={user?.user_metadata?.avatar_url} alt="Your Avatar" />
                  <AvatarFallback>
                    {user?.user_metadata?.username?.slice(0, 1).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <textarea
                    className="min-h-[60px] w-full text-sm p-2 rounded-md border border-input resize-none"
                    placeholder="Write a reply..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    disabled={isSubmitting}
                  />
                  <div className="mt-2 flex justify-end">
                    <Button 
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs mr-2"
                      onClick={() => setShowReplyForm(false)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button 
                      size="sm" 
                      className="h-7 text-xs"
                      onClick={handleSubmitReply}
                      disabled={!replyText.trim() || isSubmitting}
                    >
                      {isSubmitting ? "Posting..." : "Reply"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Nested replies */}
          {hasReplies && (
            <Collapsible open={repliesExpanded} onOpenChange={toggleReplies} className="mt-3">
              <div className="flex items-center gap-2">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 text-xs flex items-center">
                    {repliesExpanded ? (
                      <>
                        <ChevronUp size={12} className="mr-1" />
                        Hide replies
                      </>
                    ) : (
                      <>
                        <ChevronDown size={12} className="mr-1" />
                        Show replies
                      </>
                    )}
                  </Button>
                </CollapsibleTrigger>
              </div>
              
              <CollapsibleContent>
                <div className={`mt-3 border-l-2 border-muted ${getIndentClass()}`}>
                  {visibleReplies && visibleReplies.map(reply => (
                    <ThreadCardComment
                      key={reply.id}
                      comment={{...reply, level: level + 1}}
                      threadId={threadId}
                      onCommentAdded={onCommentAdded}
                      level={level + 1}
                      maxLevel={maxLevel}
                      showOnlyOneReply={showOnlyOneReply}
                    />
                  ))}
                  
                  {/* Show "View more replies" button when needed */}
                  {hiddenRepliesCount > 0 && (
                    <div className="pl-2 pt-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-xs flex items-center"
                        onClick={handleShowMoreReplies}
                      >
                        <ChevronDown size={12} className="mr-1" />
                        View {hiddenRepliesCount} more {hiddenRepliesCount === 1 ? 'reply' : 'replies'}
                      </Button>
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThreadCardComment;
