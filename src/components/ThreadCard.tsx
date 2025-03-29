
import { useState } from "react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, ThumbsDown, MessageSquare, Share2, Bookmark } from "lucide-react";

interface ThreadCardProps {
  thread: {
    id: number;
    title: string;
    content: string;
    author: {
      name: string;
      avatar?: string;
    };
    community: {
      name: string;
      id: number;
    };
    votes: number;
    commentCount: number;
    tags?: string[];
    createdAt: string;
  };
  compact?: boolean;
}

const ThreadCard = ({ thread, compact = false }: ThreadCardProps) => {
  const [votes, setVotes] = useState(thread.votes);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [saved, setSaved] = useState(false);

  const handleVote = (type: 'up' | 'down') => {
    if (userVote === type) {
      // Undo vote
      setVotes(type === 'up' ? votes - 1 : votes + 1);
      setUserVote(null);
    } else {
      // Change vote
      if (userVote === 'up' && type === 'down') {
        setVotes(votes - 2);
      } else if (userVote === 'down' && type === 'up') {
        setVotes(votes + 2);
      } else {
        setVotes(type === 'up' ? votes + 1 : votes - 1);
      }
      setUserVote(type);
    }
  };

  return (
    <Card className="thread-card mb-4">
      <CardContent className={cn("p-4", compact ? "pb-2" : "pb-4")}>
        <div className="flex items-start">
          <div className="flex flex-col items-center mr-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn("h-8 w-8 rounded-full", userVote === 'up' ? "text-primary" : "")}
              onClick={() => handleVote('up')}
            >
              <ThumbsUp size={16} />
            </Button>
            <span className="text-sm font-medium py-1">{votes}</span>
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn("h-8 w-8 rounded-full", userVote === 'down' ? "text-destructive" : "")}
              onClick={() => handleVote('down')}
            >
              <ThumbsDown size={16} />
            </Button>
          </div>
          
          <div className="flex-1">
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
            
            {!compact && (
              <div className="mb-3">
                <p className="text-foreground/90">
                  {thread.content.length > 200 
                    ? thread.content.substring(0, 200) + "..." 
                    : thread.content}
                </p>
              </div>
            )}
            
            {thread.tags && thread.tags.length > 0 && !compact && (
              <div className="flex flex-wrap gap-2 mb-3">
                {thread.tags.map((tag, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="px-4 py-2 flex justify-between border-t bg-muted/20">
        <Button variant="ghost" size="sm" asChild>
          <Link to={`/thread/${thread.id}`} className="flex items-center gap-1">
            <MessageSquare size={16} />
            <span>{thread.commentCount} Comments</span>
          </Link>
        </Button>
        
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Share2 size={16} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn("h-8 w-8", saved ? "text-primary" : "")}
            onClick={() => setSaved(!saved)}
          >
            <Bookmark size={16} />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

import { cn } from "@/lib/utils";
export default ThreadCard;
