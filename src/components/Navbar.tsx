
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Bell, 
  Menu, 
  X,
  LogOut,
  Settings,
  User
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  
  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
  };
  
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          {isMobile && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          )}
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground rounded-md h-8 w-8 flex items-center justify-center font-bold">
              CT
            </div>
            <h1 className="text-xl font-bold hidden sm:block">CommunityThreads</h1>
          </Link>
        </div>
        
        <div className="hidden md:flex items-center relative max-w-sm w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search communities and threads..."
            className="pl-9 shadow-none"
          />
        </div>
        
        <div className="flex items-center gap-2">
          {!isMobile && (
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <Bell size={20} />
            </Button>
          )}
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    {profile?.avatar_url ? (
                      <AvatarImage src={profile.avatar_url} alt={profile?.username || "User"} />
                    ) : (
                      <AvatarFallback>{getInitials(profile?.username)}</AvatarFallback>
                    )}
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{profile?.username || "User"}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex space-x-2">
              <Button variant="ghost" asChild>
                <Link to="/login">Log in</Link>
              </Button>
              <Button asChild>
                <Link to="/signup">Sign up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMobile && isMenuOpen && (
        <div className="absolute left-0 right-0 top-16 bg-background border-b p-4 flex flex-col gap-2 animate-fade-in">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="pl-9 shadow-none"
            />
          </div>
          <Button variant="ghost" className="justify-start" asChild>
            <Link to="/explore">Explore Communities</Link>
          </Button>
          <Button variant="ghost" className="justify-start" asChild>
            <Link to="/trending">Trending</Link>
          </Button>
          <Button variant="ghost" className="justify-start text-muted-foreground">
            <Bell size={16} className="mr-2" /> Notifications
          </Button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
