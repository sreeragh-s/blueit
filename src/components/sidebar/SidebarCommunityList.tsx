
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  BookOpen, 
  Camera, 
  Gamepad2, 
  Heart, 
  Laptop, 
  Music, 
  PlusCircle,
  Star 
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface Channel {
  id: string;
  name: string;
  icon: JSX.Element;
  color: string;
}

const defaultChannelIcons = [
  { icon: <Laptop size={18} />, color: "bg-blue-500" },
  { icon: <Camera size={18} />, color: "bg-pink-500" },
  { icon: <Music size={18} />, color: "bg-purple-500" },
  { icon: <Gamepad2 size={18} />, color: "bg-green-500" },
  { icon: <BookOpen size={18} />, color: "bg-yellow-500" },
  { icon: <Heart size={18} />, color: "bg-red-500" },
  { icon: <Star size={18} />, color: "bg-indigo-500" },
];

const SidebarCommunityList = ({ 
  onCreateCommunity 
}: { 
  onCreateCommunity: () => void 
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (user) {
      fetchUserChannels();
    }
  }, [user]);
  
  const fetchUserChannels = async () => {
    try {
      setLoading(true);
      
      // Get channels the user is a member of
      const { data: memberships, error: membershipError } = await supabase
        .from('community_members')
        .select('community_id')
        .eq('user_id', user?.id);
      
      if (membershipError) throw membershipError;
      
      if (memberships && memberships.length > 0) {
        // Get channel details for each membership
        const communityIds = memberships.map(m => m.community_id);
        
        const { data: communityData, error: communityError } = await supabase
          .from('communities')
          .select('id, name')
          .in('id', communityIds);
        
        if (communityError) throw communityError;
        
        if (communityData) {
          // Assign a random icon and color to each channel
          const channelsWithIcons = communityData.map((community, index) => {
            const iconIndex = index % defaultChannelIcons.length;
            return {
              ...community,
              icon: defaultChannelIcons[iconIndex].icon,
              color: defaultChannelIcons[iconIndex].color
            };
          });
          
          setChannels(channelsWithIcons);
        }
      }
    } catch (error) {
      console.error('Error fetching channels:', error);
      toast({
        title: "Error",
        description: "Failed to fetch channels. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 py-2 flex-1 overflow-hidden flex flex-col">
      <div className="flex items-center justify-between">
        <h2 className="px-2 text-lg font-semibold tracking-tight">
          My Channels
        </h2>
        {user ? (
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-8 w-8 p-0"
            onClick={onCreateCommunity}
          >
            <PlusCircle className="h-4 w-4" />
            <span className="sr-only">Create channel</span>
          </Button>
        ) : null}
      </div>
      
      <ScrollArea className="flex-1">
        <div className="space-y-1 p-2">
          {loading ? (
            <div className="text-sm text-muted-foreground px-2 py-1.5">Loading channels...</div>
          ) : channels.length > 0 ? (
            channels.map((channel) => (
              <Button
                key={channel.id}
                variant="ghost"
                className="w-full justify-start font-normal"
                asChild
              >
                <Link to={`/community/${channel.id}`}>
                  <div className={`${channel.color} rounded-md h-4 w-4 mr-2 flex items-center justify-center text-white`}>
                    {channel.icon}
                  </div>
                  {channel.name}
                </Link>
              </Button>
            ))
          ) : user ? (
            <div className="text-sm text-muted-foreground px-2 py-1.5">
              You haven't joined any channels yet.
            </div>
          ) : (
            <div className="text-sm text-muted-foreground px-2 py-1.5">
              Sign in to join channels.
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default SidebarCommunityList;
