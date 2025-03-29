
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { ThreadWithRelations } from "@/types/supabase";

interface ThreadContentProps {
  thread: ThreadWithRelations;
}

const ThreadContent = ({ thread }: ThreadContentProps) => {
  const formatContent = (content: string) => {
    if (!content) return [];
    
    return content.split('\n\n').map((paragraph, idx) => (
      <p key={idx} className="mb-4">
        {paragraph.split('\n').map((line, lineIdx) => (
          <span key={lineIdx}>
            {line}
            {lineIdx < paragraph.split('\n').length - 1 && <br />}
          </span>
        ))}
      </p>
    ));
  };

  return (
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="outline" className="hover:bg-accent">
          <Link to={`/community/${thread.community.id}`}>
            c/{thread.community.name}
          </Link>
        </Badge>
        <span className="text-sm text-muted-foreground">
          Posted by u/{thread.author.name} · {thread.createdAt || ''}
        </span>
      </div>
      
      <h1 className="text-2xl font-bold mb-4">{thread.title}</h1>
      
      <div className="mb-4">
        {formatContent(thread.content)}
      </div>
      
      {thread.tags && thread.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {thread.tags.map((tag: string, i: number) => (
            <Badge key={i} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default ThreadContent;
