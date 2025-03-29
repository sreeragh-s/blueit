
import { Button } from "@/components/ui/button";
import { MessageSquare, Share2, Bookmark, Flag } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThreadActionsProps {
  commentCount: number;
  saved: boolean;
  isBookmarking: boolean;
  onShare: () => void;
  onToggleSave: () => void;
}

const ThreadActions = ({
  commentCount,
  saved,
  isBookmarking,
  onShare,
  onToggleSave
}: ThreadActionsProps) => {
  return (
    <div className="px-4 py-2 flex justify-between items-center border-t bg-muted/20">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" className="flex items-center gap-1">
          <MessageSquare size={16} />
          <span>{commentCount} Comments</span>
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center gap-1"
          onClick={onShare}
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
          onClick={onToggleSave}
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
  );
};

export default ThreadActions;
