
import { useToast } from "@/hooks/use-toast";

export const useThreadSharing = () => {
  const { toast } = useToast();

  const shareThread = (threadId: string) => {
    if (!threadId) {
      toast({
        title: "Error",
        description: "Cannot share invalid thread.",
        variant: "destructive"
      });
      return;
    }
    
    const url = `${window.location.origin}/thread/${threadId}`;
    navigator.clipboard.writeText(url);
    
    toast({
      title: "Link copied",
      description: "Thread link copied to clipboard",
    });
  };

  return shareThread;
};
