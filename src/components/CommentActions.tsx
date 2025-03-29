
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, Reply } from "lucide-react";
import { cn } from "@/lib/utils";

interface CommentActionsProps {
  votes: number;
  userVote: 'up' | 'down' | null;
  onVote: (type: 'up' | 'down') => void;
  onReply: () => void;
  showReplyButton: boolean;
}

const CommentActions = ({ 
  votes, 
  userVote, 
  onVote, 
  onReply, 
  showReplyButton 
}: CommentActionsProps) => {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn("h-7 w-7 rounded-full", userVote === 'up' ? "text-primary" : "")}
          onClick={() => onVote('up')}
        >
          <ThumbsUp size={14} />
        </Button>
        <span className="text-xs font-medium px-1">{votes}</span>
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn("h-7 w-7 rounded-full", userVote === 'down' ? "text-destructive" : "")}
          onClick={() => onVote('down')}
        >
          <ThumbsDown size={14} />
        </Button>
      </div>
      
      {showReplyButton && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-7 text-xs"
          onClick={onReply}
          type="button"
        >
          <Reply size={14} className="mr-1" />
          Reply
        </Button>
      )}
    </div>
  );
};

export default CommentActions;
