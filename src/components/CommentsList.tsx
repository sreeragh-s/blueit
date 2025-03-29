
import CommentCard from "@/components/CommentCard";

interface CommentsListProps {
  comments: any[];
}

const CommentsList = ({ comments }: CommentsListProps) => {
  if (comments.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground w-full">
        No comments yet. Be the first to comment!
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {comments.map((comment) => (
        <CommentCard key={comment.id} comment={comment} />
      ))}
    </div>
  );
};

export default CommentsList;
