
import { Button } from "@/components/ui/button";
import { Share2, Bookmark, Flag, Headphones } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useElevenLabs } from "@/hooks/use-elevenlabs";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

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
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showKeyDialog, setShowKeyDialog] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const { speakText, stopSpeaking, isLoading, hasApiKey, isApiKeyValid } = useElevenLabs();

  const handleListen = async () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    if (!threadContent) {
      toast({
        title: "No content to read",
        description: "This thread doesn't have any content to read aloud.",
        variant: "destructive"
      });
      return;
    }

    if (isApiKeyValid === false) {
      setShowKeyDialog(true);
      return;
    }

    setIsSpeaking(true);
    const success = await speakText(threadContent);
    if (!success) {
      setIsSpeaking(false);
    }
  };

  const handleSaveClick = () => {
    if (!user) {
      setShowLoginDialog(true);
      return;
    }
    onToggleSave();
  };

  return (
    <>
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
          onClick={handleSaveClick}
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
          disabled={isLoading}
          title={!hasApiKey ? "ElevenLabs API key issue" : ""}
        >
          <Headphones size={16} />
          <span>{isLoading ? "Loading..." : isSpeaking ? "Stop" : "Listen"}</span>
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center gap-1"
          onClick={() => !user ? setShowLoginDialog(true) : null}
        >
          <Flag size={16} />
          <span>Report</span>
        </Button>
      </div>
      
      <Dialog open={showKeyDialog} onOpenChange={setShowKeyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>API Key Invalid</DialogTitle>
            <DialogDescription>
              The ElevenLabs API key is invalid or has expired. To use the Listen feature, please add a valid API key in the project settings.
            </DialogDescription>
          </DialogHeader>
          <Alert className="mt-4">
            <AlertDescription>
              Please check your API key format and ensure it's correctly entered in the Supabase secrets.
            </AlertDescription>
          </Alert>
          <DialogFooter className="mt-4">
            <Button onClick={() => setShowKeyDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Login Required</DialogTitle>
            <DialogDescription>
              You need to be logged in to use this feature.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowLoginDialog(false)}>Cancel</Button>
            <Button onClick={() => navigate('/login')}>Login</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ThreadActions;
