
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Thread } from "@/types/supabase";

interface ThreadWithRelations extends Thread {
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  community: {
    id: string;
    name: string;
  };
  votes: number;
  commentCount: number;
  tags: string[];
}

export const useThreads = (userId?: string) => {
  const { toast } = useToast();
  const [threads, setThreads] = useState<ThreadWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    
    const fetchThreads = async () => {
      setIsLoading(true);
      try {
        // Get threads using type casting
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
        
        if (threadsError) {
          console.error('Error fetching threads:', threadsError);
          throw threadsError;
        }
        
        if (!threadsData || threadsData.length === 0) {
          setThreads([]);
          setIsLoading(false);
          return;
        }
        
        // Process the threads to match our frontend structure
        const processedThreads = await Promise.all(
          threadsData.map(async (thread) => {
            const threadData = thread as Thread;
            
            // Get author info from profiles
            const { data: authorData, error: authorError } = await supabase
              .from('profiles')
              .select('id, username, avatar_url')
              .eq('id', threadData.user_id)
              .single();
            
            if (authorError) {
              console.error('Error fetching author data:', authorError);
            }
            
            // Get community info
            const { data: communityData, error: communityError } = await supabase
              .from('communities')
              .select('id, name')
              .eq('id', threadData.community_id)
              .single();
            
            if (communityError) {
              console.error('Error fetching community data:', communityError);
            }
            
            // Get upvotes count using type casting
            const { count: upvotes, error: upvotesError } = await supabase
              .from('votes')
              .select('id', { count: 'exact' })
              .eq('thread_id', threadData.id)
              .eq('vote_type', 'up');
              
            if (upvotesError) {
              console.error('Error counting upvotes:', upvotesError);
            }
            
            // Get downvotes count using type casting
            const { count: downvotes, error: downvotesError } = await supabase
              .from('votes')
              .select('id', { count: 'exact' })
              .eq('thread_id', threadData.id)
              .eq('vote_type', 'down');
            
            if (downvotesError) {
              console.error('Error counting downvotes:', downvotesError);
            }
            
            // Get comment count using type casting
            const { count: commentCount, error: commentCountError } = await supabase
              .from('comments')
              .select('id', { count: 'exact' })
              .eq('thread_id', threadData.id);
            
            if (commentCountError) {
              console.error('Error counting comments:', commentCountError);
            }
            
            // Get tags using type casting
            const { data: tagsData, error: tagsError } = await supabase
              .from('thread_tags')
              .select('tags:tag_id(name)')
              .eq('thread_id', threadData.id);
            
            if (tagsError) {
              console.error('Error fetching tags:', tagsError);
            }
            
            const tags = tagsData && tagsData.length > 0
              ? tagsData.map(tag => (tag.tags as any)?.name).filter(Boolean)
              : [];
              
            return {
              ...threadData,
              community: {
                id: communityData?.id || '',
                name: communityData?.name || 'Unknown'
              },
              author: {
                id: authorData?.id || '',
                name: authorData?.username || 'Anonymous',
                avatar: authorData?.avatar_url
              },
              votes: ((upvotes || 0) - (downvotes || 0)) as number,
              commentCount: commentCount as number || 0,
              tags: tags as string[]
            };
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
        setIsLoading(false);
      }
    };
    
    fetchThreads();
  }, [userId, toast]);

  return {
    threads,
    isLoading
  };
};
