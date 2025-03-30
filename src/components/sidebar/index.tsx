
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import CreateCommunityDialog from "@/components/CreateCommunityDialog";
import SidebarNavigation from "./SidebarNavigation";
import SidebarCommunityList from "./SidebarCommunityList";
import { useAuth } from "@/contexts/AuthContext";

interface SidebarProps {
  className?: string;
}

const Sidebar = ({ className }: SidebarProps) => {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [isCreateCommunityOpen, setIsCreateCommunityOpen] = useState(false);
  
  // Content that will be shared between mobile and desktop sidebar
  const sidebarContent = (
    <>
      <SidebarNavigation />
      <SidebarCommunityList onCreateCommunity={() => setIsCreateCommunityOpen(true)} />

      {/* Create Channel Dialog */}
      <CreateCommunityDialog 
        open={isCreateCommunityOpen} 
        onOpenChange={setIsCreateCommunityOpen} 
        onCommunityCreated={async () => {
          // Modified to return a Promise to match the expected type
          return Promise.resolve();
        }} 
      />
    </>
  );
  
  // If mobile, render within Sheet
  if (isMobile) {
    return (
      <div className={cn("w-full h-full flex flex-col", className)}>
        {sidebarContent}
      </div>
    );
  }
  
  // Desktop sidebar
  return (
    <div className={cn("w-[260px] shrink-0 border-r bg-background h-[calc(100vh-2rem)] overflow-y-auto hidden md:block", className)}>
      <div className="flex flex-col h-full">
        {sidebarContent}
      </div>
    </div>
  );
};

export default Sidebar;
