import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { BotIcon, Github, Menu, Bell, LogOut, Settings, Bookmark } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import Sidebar from "./sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        {isMobile && (
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[80vw] max-w-[300px]">
              <div className="h-full py-4 overflow-auto">
                <Sidebar className="border-0" />
              </div>
            </SheetContent>
          </Sheet>
        )}
        
        <div className="flex items-center gap-2 mr-4">
          <Link to="/" className="flex items-center space-x-2">
            <span className="flex font-bold text-xl"><BotIcon className="text-primary mr-2"/>Blueit</span>
          </Link>
        </div>
        
        <div className="flex items-center gap-4 ml-auto">
          <a 
            href="https://github.com/sreeragh-s/blueit" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hidden md:flex"
          >
            <Button variant="outline" size="icon" aria-label="GitHub Repository">
              <Github className="h-5 w-5" />
            </Button>
          </a>
          
          {user ? (
            <>
              <NavigationMenu className="hidden md:block">
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <Link to="/explore">
                      <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                        Explore
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Link to="/create">
                      <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                        Create
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
              
              <Button variant="ghost" size="icon" aria-label="Notifications" className="hidden md:flex">
                <Bell className="h-5 w-5" />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.avatar_url || "/placeholder.svg"} alt={profile?.username || user.email} />
                      <AvatarFallback>{profile?.username?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{profile?.username || user.email}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/saved')}>
                    <Bookmark className="mr-2 h-4 w-4" />
                    <span>Bookmarks</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <a 
                href="https://github.com/sreeragh-s/blueit" 
                target="_blank" 
                rel="noopener noreferrer"
                className="md:hidden"
              >
                <Button variant="outline" size="icon" aria-label="GitHub Repository">
                  <Github className="h-5 w-5" />
                </Button>
              </a>
              
              <NavigationMenu className="hidden md:block">
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <Link to="/explore">
                      <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                        Explore
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
              <Button onClick={() => navigate('/login')}>
                Login
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
