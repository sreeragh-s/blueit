
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Bookmark, Compass, Home, FileText } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const SidebarNavigation = () => {
  const { user } = useAuth();
  const location = useLocation();
  const isMyPostsActive = location.pathname === "/explore" && location.search.includes("tab=my-posts");

  return (
    <div className="px-4 py-2">
      <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
        Discover
      </h2>
      <div className="space-y-1">
        <Button 
          variant={location.pathname === "/" ? "default" : "ghost"} 
          className="w-full justify-start" 
          asChild
        >
          <Link to="/">
            <Home className="mr-2 h-4 w-4" />
            Home
          </Link>
        </Button>
        <Button 
          variant={location.pathname === "/explore" && !isMyPostsActive ? "default" : "ghost"} 
          className="w-full justify-start" 
          asChild
        >
          <Link to="/explore">
            <Compass className="mr-2 h-4 w-4" />
            Explore
          </Link>
        </Button>
        {user && (
          <>
            <Button 
              variant={location.pathname === "/saved" ? "default" : "ghost"} 
              className="w-full justify-start" 
              asChild
            >
              <Link to="/saved">
                <Bookmark className="mr-2 h-4 w-4" />
                Saved
              </Link>
            </Button>
            <Button 
              variant={isMyPostsActive ? "default" : "ghost"} 
              className="w-full justify-start" 
              asChild
            >
              <Link to="/explore?tab=my-posts">
                <FileText className="mr-2 h-4 w-4" />
                My Posts
              </Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default SidebarNavigation;
