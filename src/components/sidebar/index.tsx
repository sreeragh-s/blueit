
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import { PlusCircle } from "lucide-react";
import CreateCommunityDialog from "@/components/CreateCommunityDialog";
import SidebarNavigation from "./SidebarNavigation";
import SidebarCommunityList from "./SidebarCommunityList";

interface SidebarProps {
  className?: string;
}

const Sidebar = ({ className }: SidebarProps) => {
  const isMobile = useIsMobile();
  const [isCreateCommunityOpen, setIsCreateCommunityOpen] = useState(false);
  
  // Content that will be shared between mobile and desktop sidebar
  const sidebarContent = (
    <>
      <SidebarNavigation />
      <SidebarCommunityList onCreateCommunity={() => setIsCreateCommunityOpen(true)} />

      {/* Create Community Dialog */}
      <CreateCommunityDialog 
        open={isCreateCommunityOpen} 
        onOpenChange={setIsCreateCommunityOpen} 
        onCommunityCreated={() => {}} // The function is defined in SidebarCommunityList
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
    <div className={cn("w-[260px] shrink-0 border-r bg-background h-screen", className)}>
      <div className="flex flex-col h-full overflow-hidden">
        {sidebarContent}
      </div>
    </div>
  );
};

export default Sidebar;
