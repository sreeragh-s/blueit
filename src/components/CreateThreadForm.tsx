
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface UserCommunity {
  id: string;
  name: string;
  is_private: boolean;
}

const CreateThreadForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [communityId, setCommunityId] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userCommunities, setUserCommunities] = useState<UserCommunity[]>([]);
  const [loadingCommunities, setLoadingCommunities] = useState(true);
  
  useEffect(() => {
    if (user) {
      fetchUserCommunities();
    }
  }, [user]);
  
  const fetchUserCommunities = async () => {
    try {
      setLoadingCommunities(true);
      
      // Get communities the user is a member of
      const { data: memberships, error: membershipError } = await supabase
        .from('community_members')
        .select('community_id')
        .eq('user_id', user?.id);
      
      if (membershipError) throw membershipError;
      
      if (memberships && memberships.length > 0) {
        // Get community details for each membership
        const communityIds = memberships.map(m => m.community_id);
        
        const { data: communityData, error: communityError } = await supabase
          .from('communities')
          .select('id, name, is_private')
          .in('id', communityIds);
        
        if (communityError) throw communityError;
        
        if (communityData) {
          setUserCommunities(communityData);
        }
      } else {
        setUserCommunities([]);
      }
    } catch (error) {
      console.error('Error fetching user communities:', error);
      toast({
        title: "Error",
        description: "Failed to fetch your communities. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoadingCommunities(false);
    }
  };
  
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim()) && tags.length < 5) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };
  
  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };
  
  const generateInviteLink = (communityId: string) => {
    return `${window.location.origin}/community/${communityId}`;
  };
  
  const copyInviteLink = (communityId: string) => {
    const link = generateInviteLink(communityId);
    navigator.clipboard.writeText(link);
    toast({
      title: "Copied to clipboard",
      description: "Invite link has been copied to your clipboard.",
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !communityId) {
      toast({
        title: "Missing fields",
        description: "Please fill out all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create the thread
      const { data, error } = await supabase
        .from('threads')
        .insert({
          title,
          content,
          community_id: communityId,
          user_id: user?.id
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Add tags if there are any
      if (tags.length > 0) {
        for (const tag of tags) {
          // Check if tag exists
          let tagId;
          const { data: existingTag } = await supabase
            .from('tags')
            .select('id')
            .eq('name', tag)
            .single();
          
          if (existingTag) {
            tagId = existingTag.id;
          } else {
            // Create tag if it doesn't exist
            const { data: newTag, error: tagError } = await supabase
              .from('tags')
              .insert({ name: tag })
              .select()
              .single();
            
            if (tagError) continue;
            tagId = newTag.id;
          }
          
          // Link tag to thread
          await supabase
            .from('thread_tags')
            .insert({
              thread_id: data.id,
              tag_id: tagId
            });
        }
      }
      
      toast({
        title: "Thread created!",
        description: "Your thread has been successfully posted.",
      });
      
      // Navigate to the thread detail
      navigate(`/thread/${data.id}`);
    } catch (error: any) {
      console.error('Error creating thread:', error);
      toast({
        title: "Failed to create thread",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="community" className="block text-sm font-medium mb-1">
            Community <span className="text-red-500">*</span>
          </label>
          {loadingCommunities ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading your communities...
            </div>
          ) : userCommunities.length === 0 ? (
            <div className="text-muted-foreground">
              You haven't joined any communities yet. 
              <Button 
                variant="link" 
                className="p-0 h-auto" 
                onClick={() => navigate('/explore')}
              >
                Explore communities
              </Button>
            </div>
          ) : (
            <Select 
              value={communityId} 
              onValueChange={setCommunityId}
            >
              <SelectTrigger id="community">
                <SelectValue placeholder="Select a community" />
              </SelectTrigger>
              <SelectContent>
                {userCommunities.map((community) => (
                  <SelectItem key={community.id} value={community.id.toString()}>
                    <div className="flex items-center justify-between w-full">
                      <span>c/{community.name}</span>
                      {community.is_private && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-2 h-6 px-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyInviteLink(community.id);
                          }}
                        >
                          Invite
                        </Button>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title for your thread"
            maxLength={300}
            required
          />
          <p className="text-xs text-muted-foreground mt-1">
            {title.length}/300 characters
          </p>
        </div>
        
        <div>
          <label htmlFor="content" className="block text-sm font-medium mb-1">
            Content <span className="text-red-500">*</span>
          </label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your thread content here..."
            className="min-h-[200px]"
            required
          />
        </div>
        
        <div>
          <label htmlFor="tags" className="block text-sm font-medium mb-1">
            Tags <span className="text-xs text-muted-foreground">(Optional, max 5)</span>
          </label>
          <div className="flex items-center gap-2">
            <Input
              id="tags"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add tags (press Enter)"
              disabled={tags.length >= 5}
            />
            <Button 
              type="button" 
              onClick={handleAddTag} 
              variant="outline"
              disabled={!tagInput.trim() || tags.length >= 5}
            >
              Add
            </Button>
          </div>
          
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="px-2 py-1">
                  {tag}
                  <X 
                    size={14} 
                    className="ml-1 cursor-pointer" 
                    onClick={() => handleRemoveTag(tag)}
                  />
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button 
          type="submit" 
          disabled={isSubmitting || !title.trim() || !content.trim() || !communityId || loadingCommunities}
        >
          {isSubmitting ? "Posting..." : "Post Thread"}
        </Button>
      </div>
    </form>
  );
};

export default CreateThreadForm;
