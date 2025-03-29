
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Thread, ThreadWithRelations } from "@/types/supabase";

export const useBookmarkedThreads = (userId?: string) => {
  const { toast } = useToast();
  const [threads, setThreads] = useState<ThreadWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    
    const fetchBookmarkedThreads = async () => {
      setIsLoading(true);
      try {
        // First get all bookmark IDs for the user
        const { data: bookmarksData, error: bookmarksError } = await supabase
          .from('bookmarks')
          .select('thread_id')
          .eq('user_id', userId);
        
        if (bookmarksError) throw bookmarksError;
        if (!bookmarksData?.length) {
          setThreads([]);
          setIsLoading(false);
          return;
        }
        
        const threadIds = bookmarksData.map(bookmark => bookmark.thread_id);
        
        // Then fetch all threads with those IDs
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
          .in('id', threadIds);
        
        if (threadsError) throw threadsError;
        if (!threadsData?.length) {
          setThreads([]);
          setIsLoading(false);
          return;
        }
        
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
        
        setThreads(processedThreads);
      } catch (error) {
        console.error('[useBookmarkedThreads] Error fetching bookmarked threads:', error);
        toast({
          title: 'Error',
          description: 'Failed to load saved threads. Please try again.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBookmarkedThreads();
  }, [userId, toast]);

  return { threads, isLoading };
};
