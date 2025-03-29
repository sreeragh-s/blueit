
import { Button } from "@/components/ui/button";
import { Share2, Bookmark, Flag, Headphones } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useElevenLabs } from "@/hooks/use-elevenlabs";

interface ThreadActionsProps {
  saved: boolean;
  isBookmarking: boolean;
  onShare: () => void;
  onToggleSave: () => void;
  threadContent?: string;
}

const ThreadActions = ({
  saved,
  isBookmarking,
  onShare,
  onToggleSave,
  threadContent = ""
}: ThreadActionsProps) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { speakText, stopSpeaking } = useElevenLabs();

  const handleListen = async () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    if (!threadContent) return;

    setIsSpeaking(true);
    await speakText(threadContent);
    setIsSpeaking(false);
  };

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
      <Button 
        variant="ghost" 
        size="sm" 
        className={cn("flex items-center gap-1", isSpeaking ? "text-primary" : "")}
        onClick={handleListen}
      >
        <Headphones size={16} />
        <span>{isSpeaking ? "Stop" : "Listen"}</span>
      </Button>
      <Button variant="ghost" size="sm" className="flex items-center gap-1">
        <Flag size={16} />
        <span>Report</span>
      </Button>
    </div>
  );
};

export default ThreadActions;
