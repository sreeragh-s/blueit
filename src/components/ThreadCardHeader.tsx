
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { ThreadCardProps } from "@/types/supabase";

interface ThreadCardHeaderProps {
  thread: ThreadCardProps;
}

const ThreadCardHeader = ({ thread }: ThreadCardHeaderProps) => {
  return (
    <>
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="outline" className="hover:bg-accent">
          <Link to={`/community/${thread.community.id}`}>
            c/{thread.community.name}
          </Link>
        </Badge>
        <span className="text-sm text-muted-foreground">
          Posted by u/{thread.author.name} · {thread.createdAt}
        </span>
      </div>
      
      <Link to={`/thread/${thread.id}`}>
        <h3 className="text-lg font-semibold mb-2 hover:text-primary transition-colors">
          {thread.title}
        </h3>
      </Link>
    </>
  );
};

export default ThreadCardHeader;
