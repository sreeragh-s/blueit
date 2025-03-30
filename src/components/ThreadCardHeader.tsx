
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { ThreadCardProps } from "@/types/supabase";
import { useIsMobile } from "@/hooks/use-mobile";

interface ThreadCardHeaderProps {
  thread: ThreadCardProps;
}

const ThreadCardHeader = ({ thread }: ThreadCardHeaderProps) => {
  const isMobile = useIsMobile();
  
  return (
    <>
      <div className="flex items-center gap-2 mb-1">
        <Badge variant="outline" className="hover:bg-accent">
          <Link to={`/community/${thread.community.id}`}>
            c/{thread.community.name}
          </Link>
        </Badge>
        
        {!isMobile && (
          <span className="text-sm text-muted-foreground">
            Posted by u/{thread.author.name} · {thread.createdAt}
          </span>
        )}
      </div>
      
      {isMobile && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-muted-foreground">
            u/{thread.author.name}
          </span>
          <span className="text-xs text-muted-foreground">
            {thread.createdAt}
          </span>
        </div>
      )}
      
      <Link to={`/thread/${thread.id}`}>
        <h3 className="text-lg font-semibold mb-2 hover:text-primary transition-colors">
          {thread.title}
        </h3>
      </Link>
    </>
  );
};

export default ThreadCardHeader;
