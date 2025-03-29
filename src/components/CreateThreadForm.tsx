
import { useState } from "react";
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
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Sample community data
const communities = [
  { id: 1, name: "Technology" },
  { id: 2, name: "Photography" },
  { id: 3, name: "Music" },
  { id: 4, name: "Gaming" },
  { id: 5, name: "Books" },
  { id: 6, name: "Sports" },
  { id: 7, name: "Science" },
];

const CreateThreadForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [communityId, setCommunityId] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
  
  const handleSubmit = (e: React.FormEvent) => {
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
    
    // Simulate API call with timeout
    setTimeout(() => {
      console.log("Creating thread:", { title, content, communityId, tags });
      toast({
        title: "Thread created!",
        description: "Your thread has been successfully posted.",
      });
      
      // Navigate to the community page or thread detail
      navigate(`/community/${communityId}`);
    }, 1000);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="community" className="block text-sm font-medium mb-1">
            Community <span className="text-red-500">*</span>
          </label>
          <Select 
            value={communityId} 
            onValueChange={setCommunityId}
          >
            <SelectTrigger id="community">
              <SelectValue placeholder="Select a community" />
            </SelectTrigger>
            <SelectContent>
              {communities.map((community) => (
                <SelectItem key={community.id} value={community.id.toString()}>
                  c/{community.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
          disabled={isSubmitting || !title.trim() || !content.trim() || !communityId}
        >
          {isSubmitting ? "Posting..." : "Post Thread"}
        </Button>
      </div>
    </form>
  );
};

export default CreateThreadForm;
