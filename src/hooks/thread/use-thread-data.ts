
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ThreadWithRelations, ThreadQueryResult } from "@/types/supabase";

export const useThreadData = (threadId: string) => {
  const { toast } = useToast();
  const [thread, setThread] = useState<ThreadWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [exists, setExists] = useState<boolean | null>(null);

  const fetchThread = async () => {
    try {
      setLoading(true);
      const { data: threadData, error: threadError } = await supabase
        .from('threads')
        .select(`
          id,
          title,
          content,
          created_at,
          updated_at,
          user_id,
          community_id,
          communities:community_id(id, name),
          profiles:user_id(id, username, avatar_url)
        `)
        .eq('id', threadId)
        .single();
      
      if (threadError) throw threadError;
      if (!threadData) throw new Error("Thread not found");
      
      // Convert to our query result type with proper type assertion
      const typedThreadData = threadData as unknown as ThreadQueryResult;
      
      // Count upvotes
      const { count: upvotes } = await supabase
        .from('votes')
        .select('id', { count: 'exact' })
        .eq('thread_id', threadId)
        .eq('vote_type', 'up');
      
      // Count downvotes
      const { count: downvotes } = await supabase
        .from('votes')
        .select('id', { count: 'exact' })
        .eq('thread_id', threadId)
        .eq('vote_type', 'down');
      
      // Fetch tags
      const { data: tagsData } = await supabase
        .from('thread_tags')
        .select('tags:tag_id(name)')
        .eq('thread_id', threadId);
      
      const tags = tagsData?.map(tag => 
        (tag.tags as any)?.name
      ).filter(Boolean) || [];
      
      // Count comments
      const { count: commentCount } = await supabase
        .from('comments')
        .select('id', { count: 'exact' })
        .eq('thread_id', threadId);
      
      const formattedDate = new Date(typedThreadData.created_at).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });

      setThread({
        ...typedThreadData,
        author: {
          id: typedThreadData.profiles?.id || 'unknown',
          name: typedThreadData.profiles?.username || 'Anonymous',
          avatar: typedThreadData.profiles?.avatar_url
        },
        community: {
          id: typedThreadData.communities?.id || 'unknown',
          name: typedThreadData.communities?.name || 'Unknown Community'
        },
        votes: ((upvotes || 0) - (downvotes || 0)),
        commentCount: commentCount || 0,
        tags: tags,
        createdAt: formattedDate
      });
      
      setExists(true);
    } catch (error) {
      console.error('Error fetching thread:', error);
      toast({
        title: "Error",
        description: "Failed to load thread details. It may not exist or you don't have access.",
        variant: "destructive"
      });
      setExists(false);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (threadId) {
      fetchThread();
    }
  }, [threadId]);

  return {
    thread,
    loading,
    exists,
    refetchThread: fetchThread
  };
};
