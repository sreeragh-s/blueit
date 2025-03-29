
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import ThreadCard from "@/components/ThreadCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  Clock, 
  Flame, 
  MessageSquare, 
  PlusCircle,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
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

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, session } = useAuth();
  const [activeTab, setActiveTab] = useState("trending");
  const [threads, setThreads] = useState<ThreadWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user && !session) {
      navigate("/login");
    }
  }, [user, session, navigate]);
  
  // Fetch threads from Supabase
  useEffect(() => {
    if (!user) return;
    
    const fetchThreads = async () => {
      setIsLoading(true);
      try {
        // Get threads - using untyped query with type casting
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
            
            // Get upvotes count using untyped query with type casting
            const { count: upvotes, error: upvotesError } = await supabase
              .from('votes')
              .select('id', { count: 'exact' })
              .eq('thread_id', threadData.id)
              .eq('vote_type', 'up');
              
            if (upvotesError) {
              console.error('Error counting upvotes:', upvotesError);
            }
            
            // Get downvotes count using untyped query with type casting
            const { count: downvotes, error: downvotesError } = await supabase
              .from('votes')
              .select('id', { count: 'exact' })
              .eq('thread_id', threadData.id)
              .eq('vote_type', 'down');
            
            if (downvotesError) {
              console.error('Error counting downvotes:', downvotesError);
            }
            
            // Get comment count using untyped query with type casting
            const { count: commentCount, error: commentCountError } = await supabase
              .from('comments')
              .select('id', { count: 'exact' })
              .eq('thread_id', threadData.id);
            
            if (commentCountError) {
              console.error('Error counting comments:', commentCountError);
            }
            
            // Get tags using untyped query with type casting
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
  }, [user, toast]);
  
  // Sort threads based on active tab
  const sortedThreads = [...threads].sort((a, b) => {
    switch (activeTab) {
      case "trending":
        return (b.votes + b.commentCount) - (a.votes + a.commentCount);
      case "new":
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case "top":
        return b.votes - a.votes;
      case "comments":
        return b.commentCount - a.commentCount;
      default:
        return 0;
    }
  });
  
  if (!user) {
    return null; // Don't render anything if not authenticated
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container flex">
        <Sidebar />
        
        <main className="flex-1 p-4 lg:p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Home Feed</h1>
            <Button asChild>
              <Link to="/create">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Thread
              </Link>
            </Button>
          </div>
          
          <Tabs defaultValue="trending" value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList>
              <TabsTrigger value="trending">
                <TrendingUp className="mr-2 h-4 w-4" />
                Trending
              </TabsTrigger>
              <TabsTrigger value="new">
                <Clock className="mr-2 h-4 w-4" />
                New
              </TabsTrigger>
              <TabsTrigger value="top">
                <Flame className="mr-2 h-4 w-4" />
                Top
              </TabsTrigger>
              <TabsTrigger value="comments">
                <MessageSquare className="mr-2 h-4 w-4" />
                Most Comments
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="mt-4 space-y-4">
              {isLoading ? (
                <div className="flex justify-center items-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : sortedThreads.length > 0 ? (
                sortedThreads.map((thread) => (
                  <ThreadCard 
                    key={thread.id} 
                    thread={{
                      id: thread.id,
                      title: thread.title,
                      content: thread.content,
                      author: {
                        name: thread.author.name,
                        avatar: thread.author.avatar
                      },
                      community: {
                        name: thread.community.name,
                        id: thread.community.id
                      },
                      votes: thread.votes,
                      commentCount: thread.commentCount,
                      tags: thread.tags,
                      createdAt: new Date(thread.created_at).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })
                    }} 
                  />
                ))
              ) : (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No threads found. Be the first to create one!</p>
                  <Button asChild className="mt-4">
                    <Link to="/create">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Create Thread
                    </Link>
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default Index;
