
import { useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThreadWithRelations } from "@/types/supabase";

interface ThreadContentProps {
  thread: ThreadWithRelations;
}

const ThreadContent = ({ thread }: ThreadContentProps) => {
  const [showFullContent, setShowFullContent] = useState(true);
  
  const formatContent = (content: string) => {
    if (!content) return [];
    
    // For thread detail view, we'll still format with paragraphs
    // but potentially limit the content if it's very long
    const contentToFormat = content;
    
    return contentToFormat.split('\n\n').map((paragraph, idx) => (
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

  // Calculate if content is long enough to truncate
  // In thread detail view, we'll use a higher threshold
  const isContentLong = thread.content && thread.content.length > 800;
  const contentToDisplay = showFullContent || !isContentLong 
    ? thread.content 
    : thread.content.substring(0, 800) + "...";

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
        {formatContent(contentToDisplay)}
        
        {isContentLong && (
          <Button
            variant="link"
            className="px-0 h-auto text-primary"
            onClick={() => setShowFullContent(!showFullContent)}
          >
            {showFullContent ? "Show less" : "Show more"}
          </Button>
        )}
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
