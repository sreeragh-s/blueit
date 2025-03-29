
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface CommunityAboutProps {
  community: any;
  isJoined: boolean;
  joiningLoading: boolean;
  onJoinCommunity: () => void;
}

const CommunityAbout = ({ 
  community, 
  isJoined, 
  joiningLoading, 
  onJoinCommunity 
}: CommunityAboutProps) => {
  return (
    <div className="bg-card rounded-lg border p-6">
      <h2 className="text-xl font-semibold mb-4">About c/{community.name}</h2>
      <p className="text-foreground/90 mb-6">{community.description}</p>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-muted/30 rounded-md p-4">
          <h3 className="font-medium mb-1">Created</h3>
          <p className="text-lg font-bold">
            {new Date(community.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="bg-muted/30 rounded-md p-4">
          <h3 className="font-medium mb-1">Type</h3>
          <p className="text-lg font-bold">{community.is_private ? "Private" : "Public"}</p>
        </div>
      </div>
      
      {!isJoined && (
        <Button className="w-full" onClick={onJoinCommunity} disabled={joiningLoading}>
          {joiningLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Joining...
            </>
          ) : (
            "Join Community"
          )}
        </Button>
      )}
    </div>
  );
};

export default CommunityAbout;
