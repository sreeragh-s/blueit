
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, ThumbsDown, MessageSquare, Share2, Bookmark } from "lucide-react";
import { ThreadCardProps } from "@/types/supabase";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ThreadCardComments from "@/components/ThreadCardComments";

interface Props {
  thread: ThreadCardProps;
  compact?: boolean;
}

const ThreadCard = ({ thread, compact = false }: Props) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [votes, setVotes] = useState(thread.votes);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [saved, setSaved] = useState(false);
  const [commentCount, setCommentCount] = useState(thread.commentCount);
  
  const threadId = thread?.id ? String(thread.id) : null;

  useEffect(() => {
    const checkUserInteractions = async () => {
      if (!user || !threadId) return;
      
      await checkUserVote();
      await checkIfSaved();
    };
    
    checkUserInteractions();
  }, [user, threadId]);

  const checkUserVote = async () => {
    if (!user || !threadId) return;
    
    try {
      const { data } = await supabase
        .from('votes')
        .select('vote_type')
        .eq('user_id', user.id)
        .eq('thread_id', threadId)
        .maybeSingle();
      
      if (data) {
        setUserVote(data.vote_type as 'up' | 'down');
      }
    } catch (error) {
      // If error, vote doesn't exist
    }
  };

  const checkIfSaved = async () => {
    if (!user || !threadId) return;
    
    try {
      const { data } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('user_id', user.id)
        .eq('thread_id', threadId)
        .maybeSingle();
      
      setSaved(!!data);
    } catch (error) {
      // If error, bookmark doesn't exist
    }
  };

  const handleVote = async (type: 'up' | 'down') => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "You need to sign in to vote.",
        variant: "destructive"
      });
      return;
    }
    
    if (!threadId) {
      toast({
        title: "Error",
        description: "Invalid thread. Cannot vote.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const { data: existingVoteData } = await supabase
        .from('votes')
        .select('*')
        .eq('thread_id', threadId)
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (existingVoteData) {
        if (existingVoteData.vote_type === type) {
          await supabase
            .from('votes')
            .delete()
            .eq('id', existingVoteData.id);
          
          setVotes(type === 'up' ? votes - 1 : votes + 1);
          setUserVote(null);
          
          toast({
            title: "Vote removed",
            description: "Your vote has been removed",
          });
        } else {
          await supabase
            .from('votes')
            .update({ vote_type: type })
            .eq('id', existingVoteData.id);
          
          setVotes(type === 'up' ? votes + 2 : votes - 2);
          setUserVote(type);
          
          toast({
            title: "Vote updated",
            description: `You ${type}voted this thread`,
          });
        }
      } else {
        await supabase
          .from('votes')
          .insert({
            thread_id: threadId,
            user_id: user.id,
            vote_type: type
          });
        
        setVotes(type === 'up' ? votes + 1 : votes - 1);
        setUserVote(type);
        
        toast({
          title: "Vote registered",
          description: `You ${type}voted this thread`,
        });
      }
    } catch (error) {
      console.error('Error voting on thread:', error);
      toast({
        title: "Error",
        description: "Failed to register your vote. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleToggleSave = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "You need to sign in to save threads.",
        variant: "destructive"
      });
      return;
    }
    
    if (!threadId) {
      toast({
        title: "Error",
        description: "Invalid thread. Cannot save.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      if (saved) {
        const { data: bookmarkData } = await supabase
          .from('bookmarks')
          .select('id')
          .eq('thread_id', threadId)
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (bookmarkData) {
          await supabase
            .from('bookmarks')
            .delete()
            .eq('id', bookmarkData.id);
        }
        
        setSaved(false);
        toast({
          title: "Thread unsaved",
          description: "Thread removed from your saved items",
        });
      } else {
        await supabase
          .from('bookmarks')
          .insert({
            thread_id: threadId,
            user_id: user.id
          });
        
        setSaved(true);
        toast({
          title: "Thread saved",
          description: "Thread added to your saved items",
        });
      }
    } catch (error) {
      console.error('Error saving/unsaving thread:', error);
      toast({
        title: "Error",
        description: "Failed to update saved status. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleShare = () => {
    if (!threadId) {
      toast({
        title: "Error",
        description: "Cannot share invalid thread.",
        variant: "destructive"
      });
      return;
    }
    
    const url = `${window.location.origin}/thread/${threadId}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link copied",
      description: "Thread link copied to clipboard",
    });
  };

  if (!thread || !threadId) {
    return null;
  }

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
            
            <Link to={`/thread/${threadId}`}>
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
      
      <CardFooter className="px-4 py-2 flex flex-col border-t bg-muted/20">
        <div className="w-full flex justify-between">
          <Button variant="ghost" size="sm" className="flex items-center gap-1">
            <MessageSquare size={16} />
            <span>{commentCount} Comments</span>
          </Button>
          
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={handleShare}
            >
              <Share2 size={16} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn("h-8 w-8", saved ? "text-primary" : "")}
              onClick={handleToggleSave}
            >
              <Bookmark size={16} />
            </Button>
          </div>
        </div>
        
        {!compact && (
          <ThreadCardComments threadId={threadId} commentCount={commentCount} />
        )}
      </CardFooter>
    </Card>
  );
};

export default ThreadCard;
