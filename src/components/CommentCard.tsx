
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCommentVote } from "@/hooks/use-comment-vote";
import CommentActions from "@/components/CommentActions";
import CommentHeader from "@/components/CommentHeader";
import CommentReplyForm from "@/components/CommentReplyForm";

interface CommentProps {
  comment: {
    id: string;
    content: string;
    author: {
      name: string;
      avatar?: string;
    };
    votes: number;
    createdAt: string;
    replies?: CommentProps["comment"][];
    parent_id?: string | null;
    user_id?: string;
  };
  level?: number;
}

const CommentCard = ({ comment, level = 0 }: CommentProps) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [localReplies, setLocalReplies] = useState<CommentProps["comment"][]>(
    comment.replies || []
  );
  
  const { votes, setVotes, userVote, handleVote } = useCommentVote(comment.id);
  
  // Initialize votes from prop
  useState(() => {
    setVotes(comment.votes);
  });
  
  const handleReplySubmitted = (reply: CommentProps["comment"]) => {
    setLocalReplies([reply, ...localReplies]);
  };
  
  // Limit nesting to 5 levels deep
  const maxLevel = 5;
  
  return (
    <div className={cn("comment-card bg-card border rounded-lg p-4", level > 0 && "ml-6 mt-3")}>
      <div className="flex items-start gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
          <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <CommentHeader 
            authorName={comment.author.name} 
            createdAt={comment.createdAt} 
          />
          
          <div className="my-2">
            <p className="text-sm">{comment.content}</p>
          </div>
          
          <CommentActions
            votes={votes}
            userVote={userVote}
            onVote={handleVote}
            onReply={() => setShowReplyForm(!showReplyForm)}
            showReplyButton={level < maxLevel}
          />
          
          {showReplyForm && (
            <CommentReplyForm
              commentId={comment.id}
              onReplySubmitted={handleReplySubmitted}
              onCancel={() => setShowReplyForm(false)}
            />
          )}
          
          {localReplies.length > 0 && (
            <div className="mt-3">
              {localReplies.map((reply) => (
                <CommentCard key={reply.id} comment={reply} level={level + 1} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function to add cn utility
const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

export default CommentCard;
