
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import CommentItem from "./CommentItem";
import { Link } from "react-router-dom";

interface CommentSectionProps {
  comments: any[];
  threadId: string;
  onSubmitComment: (content: string) => void;
}

export function CommentSection({ comments, threadId, onSubmitComment }: CommentSectionProps) {
  const { user } = useAuth();
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!commentText.trim()) return;
    
    setIsSubmitting(true);
    await onSubmitComment(commentText);
    setCommentText("");
    setIsSubmitting(false);
  };
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Comments</h2>
      
      <Card className="p-4">
        {user ? (
          <div className="flex gap-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback>
                {user?.user_metadata?.username?.slice(0, 2).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="What are your thoughts?"
                className="min-h-[100px] mb-2"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                disabled={isSubmitting}
              />
              <div className="flex justify-end">
                <Button 
                  onClick={handleSubmit} 
                  disabled={!commentText.trim() || isSubmitting}
                >
                  {isSubmitting ? "Posting..." : "Comment"}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">
              Sign in to join the conversation
            </p>
            <Button asChild>
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
        )}
      </Card>
      
      {comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem 
              key={comment.id} 
              comment={comment} 
              threadId={threadId} 
            />
          ))}
        </div>
      ) : (
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
        </Card>
      )}
    </div>
  );
}
