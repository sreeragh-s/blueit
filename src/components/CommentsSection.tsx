
import CommentCard from "@/components/CommentCard";
import CommentForm from "@/components/CommentForm";
import { User } from "@supabase/supabase-js";

interface CommentsSectionProps {
  user: User | null;
  comments: any[];
  onSubmitComment: (content: string) => Promise<void>;
}

const CommentsSection = ({ user, comments, onSubmitComment }: CommentsSectionProps) => {
  return (
    <div className="w-full mb-6">
      <h2 className="text-lg font-semibold mb-4">Comments ({comments.length})</h2>
      
      <CommentForm user={user} onSubmit={onSubmitComment} />
      
      <div className="w-full space-y-4">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <CommentCard key={comment.id} comment={comment} />
          ))
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            No comments yet. Be the first to comment!
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentsSection;
