
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThreadVoteControlsProps {
  votes: number;
  userVote: 'up' | 'down' | null;
  isVoting: boolean;
  onVote: (type: 'up' | 'down') => void;
  vertical?: boolean;
}

const ThreadVoteControls = ({
  votes, 
  userVote, 
  isVoting, 
  onVote, 
  vertical = true
}: ThreadVoteControlsProps) => {
  return (
    <div className={cn(
      "flex items-center", 
      vertical ? "flex-col mr-4" : "flex-row gap-2"
    )}>
      <Button 
        variant="ghost" 
        size="icon" 
        className={cn("h-8 w-8 rounded-full", userVote === 'up' ? "text-primary" : "")}
        onClick={() => onVote('up')}
        disabled={isVoting}
      >
        <ThumbsUp size={16} />
      </Button>
      
      <span className={cn(
        "text-sm font-medium", 
        vertical ? "py-1" : "px-1"
      )}>
        {votes}
      </span>
      
      <Button 
        variant="ghost" 
        size="icon" 
        className={cn("h-8 w-8 rounded-full", userVote === 'down' ? "text-destructive" : "")}
        onClick={() => onVote('down')}
        disabled={isVoting}
      >
        <ThumbsDown size={16} />
      </Button>
    </div>
  );
};

export default ThreadVoteControls;
