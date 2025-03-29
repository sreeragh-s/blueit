
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Bell, PlusCircle, SettingsIcon, Loader2 } from "lucide-react";

interface CommunityActionBarProps {
  isAdmin: boolean;
  isJoined: boolean;
  joiningLoading: boolean;
  communityName: string;
  onJoinCommunity: () => void;
  onOpenEditCommunity: () => void;
}

const CommunityActionBar = ({
  isAdmin,
  isJoined,
  joiningLoading,
  communityName,
  onJoinCommunity,
  onOpenEditCommunity
}: CommunityActionBarProps) => {
  return (
    <div className="bg-card border-b px-4 py-3 flex justify-between items-center">
      <div className="flex items-center gap-4">
        {isAdmin ? (
          <Button 
            variant="outline"
            onClick={onOpenEditCommunity}
          >
            <SettingsIcon className="mr-2 h-4 w-4" />
            Community Settings
          </Button>
        ) : (
          <Button 
            variant={isJoined ? "outline" : "default"}
            onClick={onJoinCommunity}
            disabled={joiningLoading}
          >
            {joiningLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isJoined ? "Leaving..." : "Joining..."}
              </>
            ) : (
              isJoined ? "Joined" : "Join Community"
            )}
          </Button>
        )}
        
        <Button variant="ghost" size="icon">
          <Bell size={20} />
        </Button>
      </div>
      
      <Button variant="default" asChild>
        <Link to="/create">
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Thread
        </Link>
      </Button>
    </div>
  );
};

export default CommunityActionBar;
