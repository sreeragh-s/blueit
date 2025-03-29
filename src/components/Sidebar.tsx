
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Home, 
  Compass, 
  PlusCircle,
  Heart,
  Star,
  BookOpen,
  Gamepad2,
  Laptop,
  Music,
  Camera
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import CreateCommunityDialog from "./CreateCommunityDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SidebarProps {
  className?: string;
}

interface Community {
  id: string;
  name: string;
  icon: JSX.Element;
  color: string;
}

const defaultCommunityIcons = [
  { icon: <Laptop size={18} />, color: "bg-blue-500" },
  { icon: <Camera size={18} />, color: "bg-pink-500" },
  { icon: <Music size={18} />, color: "bg-purple-500" },
  { icon: <Gamepad2 size={18} />, color: "bg-green-500" },
  { icon: <BookOpen size={18} />, color: "bg-yellow-500" },
  { icon: <Heart size={18} />, color: "bg-red-500" },
  { icon: <Star size={18} />, color: "bg-indigo-500" },
];

const Sidebar = ({ className }: SidebarProps) => {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCreateCommunityOpen, setIsCreateCommunityOpen] = useState(false);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (user) {
      fetchUserCommunities();
    }
  }, [user]);
  
  const fetchUserCommunities = async () => {
    try {
      setLoading(true);
      
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
          .select('id, name')
          .in('id', communityIds);
        
        if (communityError) throw communityError;
        
        if (communityData) {
          // Assign a random icon and color to each community
          const communitiesWithIcons = communityData.map((community, index) => {
            const iconIndex = index % defaultCommunityIcons.length;
            return {
              ...community,
              icon: defaultCommunityIcons[iconIndex].icon,
              color: defaultCommunityIcons[iconIndex].color
            };
          });
          
          setCommunities(communitiesWithIcons);
        }
      }
    } catch (error) {
      console.error('Error fetching communities:', error);
      toast({
        title: "Error",
        description: "Failed to fetch communities. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  // If mobile, don't render the sidebar
  if (isMobile) return null;
  
  return (
    <div className={cn("w-[260px] shrink-0 border-r bg-background flex flex-col h-full", className)}>
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="px-4 py-2">
          <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
            Discover
          </h2>
          <div className="space-y-1">
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link to="/">
                <Home className="mr-2 h-4 w-4" />
                Home
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link to="/explore">
                <Compass className="mr-2 h-4 w-4" />
                Explore
              </Link>
            </Button>
          </div>
        </div>
        
        <div className="px-4 py-2 flex-1 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between">
            <h2 className="px-2 text-lg font-semibold tracking-tight">
              My Communities
            </h2>
            {user ? (
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-8 w-8 p-0"
                onClick={() => setIsCreateCommunityOpen(true)}
              >
                <PlusCircle className="h-4 w-4" />
                <span className="sr-only">Create community</span>
              </Button>
            ) : null}
          </div>
          
          <ScrollArea className="flex-1">
            <div className="space-y-1 p-2">
              {loading ? (
                <div className="text-sm text-muted-foreground px-2 py-1.5">Loading communities...</div>
              ) : communities.length > 0 ? (
                communities.map((community) => (
                  <Button
                    key={community.id}
                    variant="ghost"
                    className="w-full justify-start font-normal"
                    asChild
                  >
                    <Link to={`/community/${community.id}`}>
                      <div className={`${community.color} rounded-md h-4 w-4 mr-2 flex items-center justify-center text-white`}>
                        {community.icon}
                      </div>
                      {community.name}
                    </Link>
                  </Button>
                ))
              ) : user ? (
                <div className="text-sm text-muted-foreground px-2 py-1.5">
                  You haven't joined any communities yet.
                </div>
              ) : (
                <div className="text-sm text-muted-foreground px-2 py-1.5">
                  Sign in to join communities.
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Create Community Dialog */}
      <CreateCommunityDialog 
        open={isCreateCommunityOpen} 
        onOpenChange={setIsCreateCommunityOpen} 
        onCommunityCreated={fetchUserCommunities}
      />
    </div>
  );
};

export default Sidebar;
