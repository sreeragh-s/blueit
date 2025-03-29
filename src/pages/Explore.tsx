
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import CommunityCard from "@/components/CommunityCard";
import { useCommunities } from "@/hooks/use-communities";

const Explore = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { communities, loading } = useCommunities();
  
  // Filter communities based on search query
  const filteredCommunities = communities.filter(community => 
    community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (community.description && community.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (community.tags && community.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
  );
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container flex">
        <Sidebar />
        
        <main className="flex-1 p-4 lg:p-6">
          <h1 className="text-2xl font-bold mb-6">Explore Communities</h1>
          
          <div className="mb-6 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search communities by name, description, or tags..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCommunities.length > 0 ? (
                filteredCommunities.map((community) => (
                  <CommunityCard key={community.id} community={community} />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <h3 className="text-lg font-medium">No communities found</h3>
                  <p className="text-muted-foreground mt-1">
                    Try a different search term or create a new community.
                  </p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Explore;
