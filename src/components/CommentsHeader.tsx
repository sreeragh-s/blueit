
interface CommentsHeaderProps {
  count: number;
}

const CommentsHeader = ({ count }: CommentsHeaderProps) => {
  return <h2 className="text-lg font-semibold mb-4">Comments ({count})</h2>;
};

export default CommentsHeader;
