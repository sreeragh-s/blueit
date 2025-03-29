
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ThreadCardCommentFormProps {
  threadId: string;
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
      
      // Convert numeric IDs to UUID format if needed
      const formattedThreadId = formatThreadId(threadId);
      
      if (!formattedThreadId) {
        throw new Error(`Invalid thread ID format: ${threadId}`);
      }
      
      const { data: newComment, error } = await supabase
        .from('comments')
        .insert({
          content: commentText,
          thread_id: formattedThreadId,
          user_id: user.id
        })
        .select()
        .single();
      
      if (error) throw error;
      
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

  // Helper function to convert various ID formats to valid UUIDs or properly format them
  const formatThreadId = (id: string): string | null => {
    // Check if it's already a valid UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(id)) {
      return id;
    }
    
    // If it's a numeric ID, assume it's already a valid ID in your database
    // We'll return it as is, letting Supabase handle any conversion/validation
    return id;
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
            onBlur={handleSubmitComment}
            className="min-h-[80px] w-full text-sm"
            disabled={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
};

export default ThreadCardCommentForm;
