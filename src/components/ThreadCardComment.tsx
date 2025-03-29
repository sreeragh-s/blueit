
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CommentProps {
  comment: {
    id: string;
    content: string;
    author: {
      name: string;
      avatar?: string;
    };
    votes: number;
    createdAt: string;
  };
  onReplyClick?: () => void;
}

const ThreadCardComment = ({ comment, onReplyClick }: CommentProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [votes, setVotes] = useState(comment.votes);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  
  const handleVote = async (type: 'up' | 'down') => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "You need to sign in to vote on comments.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Check if user has already voted
      const { data: existingVoteData } = await supabase
        .from('votes')
        .select('*')
        .eq('comment_id', comment.id)
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (existingVoteData) {
        if (existingVoteData.vote_type === type) {
          // Remove vote if clicking the same button again
          await supabase
            .from('votes')
            .delete()
            .eq('id', existingVoteData.id);
          
          // Update UI
          setVotes(type === 'up' ? votes - 1 : votes + 1);
          setUserVote(null);
        } else {
          // Update vote if changing vote type
          await supabase
            .from('votes')
            .update({ vote_type: type })
            .eq('id', existingVoteData.id);
          
          // Update UI
          setVotes(type === 'up' ? votes + 2 : votes - 2);
          setUserVote(type);
        }
      } else {
        // Create new vote
        await supabase
          .from('votes')
          .insert({
            comment_id: comment.id,
            user_id: user.id,
            vote_type: type
          });
        
        // Update UI
        setVotes(type === 'up' ? votes + 1 : votes - 1);
        setUserVote(type);
      }
    } catch (error) {
      console.error('Error voting on comment:', error);
      toast({
        title: "Error",
        description: "Failed to register your vote. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="py-3 border-b last:border-b-0">
      <div className="flex items-start gap-2">
        <Avatar className="h-6 w-6">
          <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
          <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium">{comment.author.name}</span>
            <span className="text-xs text-muted-foreground">{comment.createdAt}</span>
          </div>
          
          <p className="text-sm mt-1">{comment.content}</p>
          
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn("h-6 w-6 rounded-full", userVote === 'up' ? "text-primary" : "")}
                onClick={() => handleVote('up')}
              >
                <ThumbsUp size={12} />
              </Button>
              <span className="text-xs font-medium px-1">{votes}</span>
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn("h-6 w-6 rounded-full", userVote === 'down' ? "text-destructive" : "")}
                onClick={() => handleVote('down')}
              >
                <ThumbsDown size={12} />
              </Button>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 text-xs"
              onClick={onReplyClick}
            >
              <MessageSquare size={12} className="mr-1" />
              Reply
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreadCardComment;
