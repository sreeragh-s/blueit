
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Thread, ThreadWithRelations } from "@/types/supabase";

export const useThreads = (userId?: string) => {
  const { toast } = useToast();
  const [threads, setThreads] = useState<ThreadWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    
    const fetchThreads = async () => {
      setIsLoading(true);
      try {
        // Correctly typed Supabase query
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
          .order('created_at', { ascending: false });
        
        if (threadsError) throw threadsError;
        if (!threadsData?.length) {
          setThreads([]);
          setIsLoading(false);
          return;
        }
        
        // Log thread IDs from database for debugging
        console.log("[useThreads] Raw thread IDs from DB:", 
          threadsData.map(thread => ({ 
            id: thread.id, 
            type: typeof thread.id 
          }))
        );
        
        // Process threads with proper async handling
        const processedThreads = await Promise.all(
          threadsData.map(async (thread) => {
            // Fetch author
            const { data: authorData } = await supabase
              .from('profiles')
              .select('id, username, avatar_url')
              .eq('id', thread.user_id)
              .single();
            
            // Fetch community
            const { data: communityData } = await supabase
              .from('communities')
              .select('id, name')
              .eq('id', thread.community_id)
              .single();
            
            // Count upvotes
            const { count: upvotes } = await supabase
              .from('votes')
              .select('id', { count: 'exact' })
              .eq('thread_id', thread.id)
              .eq('vote_type', 'up');
            
            // Count downvotes
            const { count: downvotes } = await supabase
              .from('votes')
              .select('id', { count: 'exact' })
              .eq('thread_id', thread.id)
              .eq('vote_type', 'down');
            
            // Count comments
            const { count: commentCount } = await supabase
              .from('comments')
              .select('id', { count: 'exact' })
              .eq('thread_id', thread.id);
            
            // Fetch tags
            const { data: tagsData } = await supabase
              .from('thread_tags')
              .select('tags:tag_id(name)');
            
            const tags = tagsData?.map(tag => 
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
        
        console.log("[useThreads] Processed thread IDs:", 
          processedThreads.map(thread => ({ 
            id: thread.id, 
            type: typeof thread.id 
          }))
        );
        
        setThreads(processedThreads);
      } catch (error) {
        console.error('[useThreads] Error fetching threads:', error);
        toast({
          title: 'Error',
          description: 'Failed to load threads. Please try again.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchThreads();
  }, [userId, toast]);

  return { threads, isLoading };
};
