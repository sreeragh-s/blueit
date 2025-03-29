
import { Badge } from "@/components/ui/badge";
import { ThreadCardProps } from "@/types/supabase";

interface ThreadCardBodyProps {
  thread: ThreadCardProps;
  compact?: boolean;
}

const ThreadCardBody = ({ thread, compact = false }: ThreadCardBodyProps) => {
  if (compact) {
    return null;
  }
  
  return (
    <>
      <div className="mb-3">
        <p className="text-foreground/90">
          {thread.content.length > 200 
            ? thread.content.substring(0, 200) + "..." 
            : thread.content}
        </p>
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
