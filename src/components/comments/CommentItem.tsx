
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useCommentVote } from "@/hooks/use-comment-vote";
import { ArrowUp, ArrowDown, Reply } from "lucide-react";

interface CommentItemProps {
  comment: any;
  threadId: string;
  level?: number;
}

const CommentItem = ({ comment, threadId, level = 0 }: CommentItemProps) => {
  const { user } = useAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { votes, userVote, handleVote: vote, isVoting = false } = useCommentVote(comment.id);

  const handleReply = async () => {
    if (!replyText.trim() || !user) return;
    
    setIsSubmitting(true);
    // Add reply logic would go here
    // After successful reply:
    setReplyText("");
    setShowReplyForm(false);
    setIsSubmitting(false);
  };

  // Limit nesting level for UI clarity
  const maxLevel = 5;
  const isNested = level > 0;

  return (
    <Card className={`p-4 ${isNested ? 'ml-6' : ''}`}>
      <div className="flex gap-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.author?.avatar} />
          <AvatarFallback>
            {comment.author?.name?.slice(0, 2).toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex justify-between items-center">
            <div className="font-medium">
              {comment.author?.name || "Anonymous"}
            </div>
            <span className="text-xs text-muted-foreground">
              {comment.createdAt}
            </span>
          </div>
          <p className="my-2 text-sm">{comment.content}</p>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0" 
                onClick={() => vote('up')}
                disabled={isVoting}
              >
                <ArrowUp 
                  className={`h-4 w-4 ${userVote === 'up' ? 'text-primary' : ''}`}
                />
              </Button>
              <span className="text-sm mx-1">{comment.votes || votes || 0}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0" 
                onClick={() => vote('down')}
                disabled={isVoting}
              >
                <ArrowDown 
                  className={`h-4 w-4 ${userVote === 'down' ? 'text-primary' : ''}`} 
                />
              </Button>
            </div>
            
            {user && level < maxLevel && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowReplyForm(!showReplyForm)}
              >
                <Reply className="h-4 w-4 mr-1" />
                Reply
              </Button>
            )}
          </div>
          
          {showReplyForm && (
            <div className="mt-2">
              <Textarea
                placeholder="Write a reply..."
                className="min-h-[80px] text-sm mb-2"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                disabled={isSubmitting}
              />
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowReplyForm(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleReply}
                  disabled={!replyText.trim() || isSubmitting}
                >
                  {isSubmitting ? "Posting..." : "Reply"}
                </Button>
              </div>
            </div>
          )}
          
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 space-y-4">
              {comment.replies.map((reply: any) => (
                <CommentItem 
                  key={reply.id} 
                  comment={reply} 
                  threadId={threadId} 
                  level={level + 1} 
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default CommentItem;
