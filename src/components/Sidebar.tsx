
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Home, 
  Compass, 
  TrendingUp, 
  PlusCircle,
  Heart,
  Star,
  BookOpen,
  Gamepad2,
  Laptop,
  Music,
  Camera
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

// Sample community data
const communities = [
  { id: 1, name: "Technology", icon: <Laptop size={18} />, color: "bg-blue-500" },
  { id: 2, name: "Photography", icon: <Camera size={18} />, color: "bg-pink-500" },
  { id: 3, name: "Music", icon: <Music size={18} />, color: "bg-purple-500" },
  { id: 4, name: "Gaming", icon: <Gamepad2 size={18} />, color: "bg-green-500" },
  { id: 5, name: "Books", icon: <BookOpen size={18} />, color: "bg-yellow-500" },
  { id: 6, name: "Sports", icon: <Heart size={18} />, color: "bg-red-500" },
  { id: 7, name: "Science", icon: <Star size={18} />, color: "bg-indigo-500" },
];

const Sidebar = ({ className }: SidebarProps) => {
  const isMobile = useIsMobile();
  
  // If mobile, don't render the sidebar
  if (isMobile) return null;
  
  return (
    <div className={cn("pb-12 w-[260px] shrink-0 border-r bg-background", className)}>
      <div className="space-y-4 py-4">
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
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link to="/trending">
                <TrendingUp className="mr-2 h-4 w-4" />
                Trending
              </Link>
            </Button>
          </div>
        </div>
        
        <div className="px-4 py-2">
          <div className="flex items-center justify-between">
            <h2 className="px-2 text-lg font-semibold tracking-tight">
              My Communities
            </h2>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
              <PlusCircle className="h-4 w-4" />
              <span className="sr-only">Create community</span>
            </Button>
          </div>
          
          <ScrollArea className="h-[300px]">
            <div className="space-y-1 p-2">
              {communities.map((community) => (
                <Button
                  key={community.id}
                  variant="ghost"
                  className="w-full justify-start font-normal"
                  asChild
                >
                  <Link to={`/community/${community.id}`}>
                    <div className={`${community.color} rounded-md h-4 w-4 mr-2 flex items-center justify-center text-white`}></div>
                    {community.name}
                  </Link>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
