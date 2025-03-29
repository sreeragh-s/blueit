
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ThumbsUp, ThumbsDown, Reply, MoreVertical, Flag } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CommentProps {
  comment: {
    id: number;
    content: string;
    author: {
      name: string;
      avatar?: string;
    };
    votes: number;
    createdAt: string;
    replies?: CommentProps["comment"][];
  };
  level?: number;
}

const CommentCard = ({ comment, level = 0 }: CommentProps) => {
  const [votes, setVotes] = useState(comment.votes);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  
  const handleVote = (type: 'up' | 'down') => {
    if (userVote === type) {
      // Undo vote
      setVotes(type === 'up' ? votes - 1 : votes + 1);
      setUserVote(null);
    } else {
      // Change vote
      if (userVote === 'up' && type === 'down') {
        setVotes(votes - 2);
      } else if (userVote === 'down' && type === 'up') {
        setVotes(votes + 2);
      } else {
        setVotes(type === 'up' ? votes + 1 : votes - 1);
      }
      setUserVote(type);
    }
  };
  
  const handleSubmitReply = () => {
    if (replyContent.trim()) {
      console.log("Reply submitted:", replyContent);
      setReplyContent("");
      setShowReplyForm(false);
    }
  };
  
  // Limit nesting to 5 levels deep
  const maxLevel = 5;
  
  return (
    <div className={cn("comment-card", level > 0 && "ml-6 mt-3")}>
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
                  disabled={!replyContent.trim()}
                >
                  Reply
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
