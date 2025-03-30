
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThreadCardProps } from "@/types/supabase";
import { useState } from "react";

interface ThreadCardBodyProps {
  thread: ThreadCardProps;
  compact?: boolean;
}

const ThreadCardBody = ({ thread, compact = false }: ThreadCardBodyProps) => {
  const [showFullContent, setShowFullContent] = useState(false);
  
  if (compact) {
    return null;
  }
  
  const isContentTruncated = thread.content && thread.content.length > 200;
  const displayContent = showFullContent 
    ? thread.content 
    : isContentTruncated 
      ? thread.content.substring(0, 200) + "..." 
      : thread.content;
  
  return (
    <>
      <div className="mb-3">
        <p className="text-foreground/90">
          {displayContent}
        </p>
        
        {isContentTruncated && (
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
        <div className="flex flex-wrap gap-2 mb-3">
          {thread.tags.map((tag, i) => (
            <Badge key={i} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </>
  );
};

export default ThreadCardBody;
