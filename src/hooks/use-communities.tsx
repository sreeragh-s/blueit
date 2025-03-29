
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Community } from "@/types/supabase";

export interface CommunityWithMemberCount extends Community {
  memberCount: number;
  tags?: string[];
}

export function useCommunities() {
  const [communities, setCommunities] = useState<CommunityWithMemberCount[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    fetchCommunities();
  }, []);
  
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
      
      // Process communities with default member counts and extract tags
      const enhancedCommunities = communitiesData.map(community => {
        // Create tags from community name and description
        let tags: string[] = ["Community"];
        
        if (community.name) {
          // Split name and add first word as a tag
          const nameWords = community.name.split(' ');
          if (nameWords.length > 0) {
            tags = [nameWords[0]];
          }
          
          // Extract topic from description if available
          if (community.description) {
            const words = community.description.toLowerCase().split(' ');
            const topicWords = words.filter(word => 
              word.length > 3 && 
              !['this', 'that', 'with', 'have', 'from', 'about', 'community'].includes(word)
            );
            
            if (topicWords.length > 0) {
              // Add first significant word from description as additional tag
              const topicTag = topicWords[0].charAt(0).toUpperCase() + topicWords[0].slice(1);
              if (!tags.includes(topicTag)) {
                tags.push(topicTag);
              }
            }
          }
        }
        
        return {
          ...community,
          memberCount: 0, // Set default count
          tags: tags
        };
      });
      
      setCommunities(enhancedCommunities);
      
      // Now fetch member counts separately for each community
      for (const community of enhancedCommunities) {
        try {
          // Use a direct count approach rather than a potentially problematic aggregate
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
  
  return { communities, loading, fetchCommunities };
}
