
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CommentReplyFormProps {
  commentId: string;
  onReplySubmitted: (reply: any) => void;
  onCancel: () => void;
}

const CommentReplyForm = ({ commentId, onReplySubmitted, onCancel }: CommentReplyFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmitReply = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "You need to sign in to reply to comments.",
        variant: "destructive"
      });
      return;
    }
    
    if (!replyContent.trim()) return;
    
    try {
      setIsSubmitting(true);
      
      // Get thread_id from parent comment by looking at the URL
      const threadId = window.location.pathname.split('/').pop();
      
      console.log("Submitting reply:", {
        threadId,
        userId: user.id,
        parentId: commentId,
        content: replyContent
      });
      
      // Validate UUID format for commentId
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(commentId)) {
        console.error("Invalid UUID format for commentId:", commentId);
        throw new Error(`Invalid UUID format for commentId: ${commentId}`);
      }
      
      // Validate threadId if extracted from URL
      if (threadId && !uuidRegex.test(threadId)) {
        console.error("Invalid UUID format for threadId:", threadId);
        throw new Error(`Invalid UUID format for threadId: ${threadId}`);
      }
      
      const { data: newReply, error } = await supabase
        .from('comments')
        .insert({
          content: replyContent,
          thread_id: threadId,
          user_id: user.id,
          parent_id: commentId
        })
        .select(`
          id,
          content,
          created_at,
          user_id,
          profiles:user_id(id, username, avatar_url)
        `)
        .single();
      
      if (error) throw error;
      
      console.log("Reply successfully added:", newReply);
      
      // Format the reply to match our comment interface
      const formattedReply = {
        id: newReply.id,
        content: newReply.content,
        author: {
          name: user.user_metadata.username || 'Anonymous',
          avatar: user.user_metadata.avatar_url
        },
        votes: 0,
        createdAt: "Just now",
        parent_id: commentId,
        user_id: user.id
      };
      
      // Reset form
      setReplyContent("");
      
      // Call the callback to update the parent component
      onReplySubmitted(formattedReply);
      onCancel();
      
      toast({
        title: "Reply posted",
        description: "Your reply has been posted successfully.",
      });
    } catch (error) {
      console.error('Error adding reply:', error);
      toast({
        title: "Error",
        description: "Failed to post your reply. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-3">
      <Textarea
        placeholder="Write a reply..."
        value={replyContent}
        onChange={(e) => setReplyContent(e.target.value)}
        className="min-h-[100px] text-sm"
      />
      <div className="flex justify-end gap-2 mt-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button 
          size="sm" 
          onClick={handleSubmitReply}
          disabled={!replyContent.trim() || isSubmitting || !user}
        >
          {isSubmitting ? 'Posting...' : 'Reply'}
        </Button>
      </div>
    </div>
  );
};

export default CommentReplyForm;
