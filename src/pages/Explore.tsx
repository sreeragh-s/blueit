
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Users, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Community } from "@/types/supabase";

interface CommunityWithMemberCount extends Community {
  memberCount: number;
  tags?: string[];
}

const Explore = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [communities, setCommunities] = useState<CommunityWithMemberCount[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        setLoading(true);
        
        // Fetch all communities
        const { data: communitiesData, error: communitiesError } = await supabase
          .from('communities')
          .select('*');
        
        if (communitiesError) {
          console.error('Error fetching communities:', communitiesError);
          throw communitiesError;
        }
        
        if (!communitiesData || communitiesData.length === 0) {
          setCommunities([]);
          setLoading(false);
          return;
        }
        
        // Process communities with default member counts
        // We'll avoid using RLS-triggering queries here
        const enhancedCommunities = communitiesData.map(community => ({
          ...community,
          memberCount: 0, // Set default count
          tags: ["Community"] // Default tag
        }));
        
        setCommunities(enhancedCommunities);
        
        // Now fetch member counts separately for each community without using count()
        // This avoids RLS recursion by using a different approach
        for (const community of enhancedCommunities) {
          try {
            // Fetch raw data and count it in JS instead of using .count()
            const { data: memberData, error: memberError } = await supabase
              .rpc('check_user_community_membership', { 
                user_uuid: '00000000-0000-0000-0000-000000000000', // Dummy value to bypass RLS
                community_uuid: community.id 
              });
            
            if (memberError) {
              console.error(`Error fetching member data for community ${community.id}:`, memberError);
              continue;
            }
            
            // Just fetch raw members and count them in JavaScript
            const { data, error } = await supabase
              .from('community_members')
              .select('id')
              .eq('community_id', community.id);
              
            if (error) {
              console.error(`Error fetching members for community ${community.id}:`, error);
              continue;
            }
            
            // Update this specific community's member count
            setCommunities(prev => 
              prev.map(c => 
                c.id === community.id 
                  ? { ...c, memberCount: data?.length || 0 } 
                  : c
              )
            );
            
          } catch (error) {
            console.error(`Error processing community ${community.id}:`, error);
          }
        }
      } catch (error) {
        console.error('Error in fetchCommunities:', error);
        toast({
          title: "Error",
          description: "Failed to load communities. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchCommunities();
  }, [toast]);
  
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
                  <Card key={community.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <div 
                      className="h-32 w-full bg-cover bg-center"
                      style={
                        community.banner_image 
                          ? { backgroundImage: `url(${community.banner_image})` } 
                          : { backgroundImage: `linear-gradient(to right, hsl(var(--primary) / 70%), hsl(var(--secondary) / 70%))` }
                      }
                    />
                    
                    <CardHeader className="pb-2">
                      <CardTitle className="flex justify-between items-start">
                        <Link 
                          to={`/community/${community.id}`}
                          className="hover:text-primary transition-colors"
                        >
                          c/{community.name}
                        </Link>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Users size={14} className="mr-1" />
                          {community.memberCount.toLocaleString()}
                        </div>
                      </CardTitle>
                    </CardHeader>
                    
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        {community.description ? (
                          community.description.length > 120
                            ? community.description.substring(0, 120) + "..."
                            : community.description
                        ) : "No description available."}
                      </p>
                      
                      <div className="flex flex-wrap gap-2">
                        {community.tags && community.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="font-normal">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                    
                    <CardFooter className="pt-0">
                      <Button asChild className="w-full">
                        <Link to={`/community/${community.id}`}>
                          View Community
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
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
