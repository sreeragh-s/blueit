
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ThreadWithRelations } from "@/types/supabase";
import { useNavigate } from "react-router-dom";

export const useCommunityDetail = (communityId: string | undefined) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [community, setCommunity] = useState<any>(null);
  const [threads, setThreads] = useState<ThreadWithRelations[]>([]);
  const [isJoined, setIsJoined] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState("threads");
  const [sortOption, setSortOption] = useState("new");
  const [loading, setLoading] = useState(true);
  const [threadsLoading, setThreadsLoading] = useState(true);
  const [joiningLoading, setJoiningLoading] = useState(false);
  const [isEditCommunityOpen, setIsEditCommunityOpen] = useState(false);

  // Fetch community data
  useEffect(() => {
    if (communityId) {
      fetchCommunityData();
    }
  }, [communityId, user]);
  
  // Fetch community threads
  useEffect(() => {
    if (communityId) {
      fetchCommunityThreads();
    }
  }, [communityId, sortOption]);

  const fetchCommunityData = async () => {
    if (!communityId) return;
    
    try {
      setLoading(true);
      
      const { data: communityData, error: communityError } = await supabase
        .from('communities')
        .select('*')
        .eq('id', communityId)
        .single();
      
      if (communityError) {
        throw communityError;
      }
      
      setCommunity(communityData);
      
      if (user) {
        const { data: memberData, error: memberError } = await supabase
          .from('community_members')
          .select('role')
          .eq('community_id', communityId)
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (!memberError && memberData) {
          setIsJoined(true);
          setIsAdmin(memberData.role === 'admin');
        } else {
          setIsJoined(false);
          setIsAdmin(false);
        }
      }
    } catch (error: any) {
      console.error("Error fetching community:", error);
      toast({
        title: "Error",
        description: "Failed to load community data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCommunityThreads = async () => {
    if (!communityId) return;
    
    try {
      setThreadsLoading(true);
      
      const { data: threadsData, error: threadsError } = await supabase
        .from('threads')
        .select(`
          id, 
          title, 
          content, 
          created_at,
          user_id,
          community_id
        `)
        .eq('community_id', communityId)
        .order('created_at', { ascending: sortOption === 'new' ? false : true });
      
      if (threadsError) throw threadsError;
      
      if (!threadsData || threadsData.length === 0) {
        setThreads([]);
        setThreadsLoading(false);
        return;
      }
      
      const processedThreads = await Promise.all(
        threadsData.map(async (thread) => {
          const { data: authorData } = await supabase
            .from('profiles')
            .select('id, username, avatar_url')
            .eq('id', thread.user_id)
            .single();
          
          const { data: communityData } = await supabase
            .from('communities')
            .select('id, name')
            .eq('id', thread.community_id)
            .single();
          
          const { count: upvotes } = await supabase
            .from('votes')
            .select('id', { count: 'exact' })
            .eq('thread_id', thread.id)
            .eq('vote_type', 'up');
          
          const { count: downvotes } = await supabase
            .from('votes')
            .select('id', { count: 'exact' })
            .eq('thread_id', thread.id)
            .eq('vote_type', 'down');
          
          const { count: commentCount } = await supabase
            .from('comments')
            .select('id', { count: 'exact' })
            .eq('thread_id', thread.id);
          
          const tagsData = await supabase
            .from('thread_tags')
            .select('tags:tag_id(name)')
            .eq('thread_id', thread.id);
          
          const tags = tagsData.data?.map(tag => 
            (tag.tags as any)?.name
          ).filter(Boolean) || [];
          
          return {
            ...thread,
            community: {
              id: communityData?.id || '',
              name: communityData?.name || 'Unknown'
            },
            author: {
              id: authorData?.id || '',
              name: authorData?.username || 'Anonymous',
              avatar: authorData?.avatar_url
            },
            votes: ((upvotes || 0) - (downvotes || 0)),
            commentCount: commentCount || 0,
            tags: tags
          } as ThreadWithRelations;
        })
      );
      
      setThreads(processedThreads);
    } catch (error) {
      console.error('Error fetching threads:', error);
      toast({
        title: 'Error',
        description: 'Failed to load threads. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setThreadsLoading(false);
    }
  };

  const handleJoinCommunity = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    try {
      setJoiningLoading(true);
      
      if (isJoined) {
        const { error } = await supabase
          .from('community_members')
          .delete()
          .eq('community_id', communityId)
          .eq('user_id', user.id);
        
        if (error) throw error;
        
        setIsJoined(false);
        setIsAdmin(false);
        
        toast({
          title: "Left Community",
          description: `You have left ${community.name}`,
        });
      } else {
        const { error } = await supabase
          .from('community_members')
          .insert({
            community_id: communityId,
            user_id: user.id,
            role: 'member',
          });
        
        if (error) throw error;
        
        setIsJoined(true);
        
        toast({
          title: "Joined Community",
          description: `Welcome to ${community.name}!`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update membership",
        variant: "destructive",
      });
    } finally {
      setJoiningLoading(false);
    }
  };

  const getSortedThreads = () => {
    let sortedThreads = [...threads];
    
    switch (sortOption) {
      case "new":
        return sortedThreads;
      case "comments":
        return sortedThreads.sort((a, b) => b.commentCount - a.commentCount);
      default:
        return sortedThreads;
    }
  };

  return {
    community,
    threads: getSortedThreads(),
    isJoined,
    isAdmin,
    activeTab,
    sortOption,
    loading,
    threadsLoading,
    joiningLoading,
    isEditCommunityOpen,
    setActiveTab,
    setSortOption,
    handleJoinCommunity,
    setIsEditCommunityOpen,
    fetchCommunityData
  };
};
