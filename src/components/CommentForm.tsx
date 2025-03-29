
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@supabase/supabase-js";

interface CommentFormProps {
  user: User | null;
  onSubmit: (content: string) => Promise<void>;
}

const CommentForm = ({ user, onSubmit }: CommentFormProps) => {
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async () => {
    if (!commentText.trim()) return;
    
    try {
      setIsSubmitting(true);
      await onSubmit(commentText);
      setCommentText("");
    } catch (error) {
      console.error("Failed to submit comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-card rounded-lg border p-4 mb-6">
      <div className="flex items-start gap-3 mb-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={user?.user_metadata?.avatar_url || "/placeholder.svg"} alt="Your Avatar" />
          <AvatarFallback>
            {user?.user_metadata?.username?.slice(0, 2).toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        <Textarea
          placeholder="What are your thoughts?"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          className="flex-1 min-h-[100px]"
        />
      </div>
      <div className="flex justify-end">
        <Button 
          onClick={handleSubmit} 
          disabled={!commentText.trim() || !user || isSubmitting}
        >
          {isSubmitting ? "Posting..." : "Comment"}
        </Button>
      </div>
    </div>
  );
};

export default CommentForm;
