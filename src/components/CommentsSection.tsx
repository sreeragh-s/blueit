
import CommentsHeader from "@/components/CommentsHeader";
import CommentsList from "@/components/CommentsList";
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
      <CommentsHeader count={comments.length} />
      <CommentForm user={user} onSubmit={onSubmitComment} />
      <CommentsList comments={comments} />
    </div>
  );
};

export default CommentsSection;
