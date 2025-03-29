
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

interface ThreadCardCommentFormProps {
  threadId: string;  // Assuming this is now a proper UUID from the database
  onCommentAdded: () => void;
}

const ThreadCardCommentForm = ({ threadId, onCommentAdded }: ThreadCardCommentFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmitComment = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "You need to sign in to comment.",
        variant: "destructive"
      });
      return;
    }
    
    if (!commentText.trim()) return;
    
    try {
      setIsSubmitting(true);
      
      // Extensive logging for debugging
      console.log("Comment submission inputs:", {
        threadId,  // Log the threadId directly
        threadIdType: typeof threadId,
        threadIdLength: threadId.length,
        userId: user.id,
        commentText
      });
      
      // Validate UUID format for threadId
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(threadId)) {
        console.error("Invalid UUID format for threadId:", threadId);
        toast({
          title: "Error",
          description: "Invalid thread ID. Please try again.",
          variant: "destructive"
        });
        return;
      }
      
      const { data: newComment, error } = await supabase
        .from('comments')
        .insert({
          content: commentText,
          thread_id: threadId,
          user_id: user.id
        })
        .select()
        .single();
      
      if (error) {
        console.error("Supabase error during comment insertion:", error);
        throw error;
      }
      
      console.log("Comment successfully added:", newComment);
      
      setCommentText("");
      onCommentAdded();
      
      toast({
        title: "Comment posted",
        description: "Your comment has been posted successfully.",
      });
    } catch (error) {
      console.error("Failed to submit comment:", error);
      toast({
        title: "Error",
        description: "Failed to post your comment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="p-3 text-center text-sm text-muted-foreground">
        <a href="/login" className="text-primary hover:underline">Sign in</a> to leave a comment
      </div>
    );
  }

  return (
    <div className="p-3 border-t">
      <div className="flex items-start gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={user?.user_metadata?.avatar_url} alt="Your Avatar" />
          <AvatarFallback>
            {user?.user_metadata?.username?.slice(0, 2).toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <Textarea
            placeholder="What are your thoughts?"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="min-h-[80px] w-full text-sm"
            disabled={isSubmitting}
          />
          <div className="mt-2 flex justify-end">
            <Button 
              size="sm" 
              onClick={handleSubmitComment}
              disabled={!commentText.trim() || isSubmitting}
            >
              {isSubmitting ? "Posting..." : "Comment"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreadCardCommentForm;
