
import React from "react";
import { Loader2 } from "lucide-react";
import CommunityCard from "@/components/CommunityCard";
import { CommunityWithMemberCount } from "@/hooks/use-communities";

interface CommunityTabProps {
  communities: CommunityWithMemberCount[];
  loading: boolean;
  searchQuery: string;
}

const CommunityTab = ({ communities, loading, searchQuery }: CommunityTabProps) => {
  const filteredCommunities = communities.filter(community => 
    community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (community.description && community.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (community.tags && community.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredCommunities.length > 0 ? (
        filteredCommunities.map((community) => (
          <CommunityCard key={community.id} community={community} />
        ))
      ) : (
        <div className="col-span-full text-center py-12">
          <h3 className="text-lg font-medium">No channels found</h3>
          <p className="text-muted-foreground mt-1">
            Try a different search term or create a new channel.
          </p>
        </div>
      )}
    </div>
  );
};

export default CommunityTab;
