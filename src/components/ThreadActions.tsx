
import { Button } from "@/components/ui/button";
import { Share2, Bookmark, Flag } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThreadActionsProps {
  commentCount?: number; // Keep this prop for backward compatibility
  saved: boolean;
  isBookmarking: boolean;
  onShare: () => void;
  onToggleSave: () => void;
}

const ThreadActions = ({
  saved,
  isBookmarking,
  onShare,
  onToggleSave
}: ThreadActionsProps) => {
  return (
    <div className="flex items-center gap-3">
      <Button 
        variant="ghost" 
        size="sm" 
        className="flex items-center gap-1"
        onClick={onShare}
      >
        <Share2 size={16} />
        <span>Share</span>
      </Button>
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
  );
};

export default ThreadActions;
