
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

// Define thread interface based on our database schema
interface Thread {
  id: string;
  title: string;
  content: string;
  created_at: string;
  community: {
    id: string;
    name: string;
  };
  author: {
    id: string;
    name: string;
    avatar?: string;
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
  const [threads, setThreads] = useState<Thread[]>([]);
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
        // Get threads with community info
        const { data: threadsData, error: threadsError } = await supabase
          .from('threads')
          .select(`
            id, 
            title, 
            content, 
            created_at,
            communities:community_id (id, name)
          `)
          .order('created_at', { ascending: false });
        
        if (threadsError) throw threadsError;
        
        // Process the threads to match our frontend structure
        const processedThreads = await Promise.all(
          threadsData.map(async (thread) => {
            // Get author info from profiles
            const { data: authorData } = await supabase
              .from('profiles')
              .select('id, username, avatar_url')
              .eq('id', thread.user_id)
              .single();
            
            // Get vote count
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
            
            // Get comment count
            const { count: commentCount } = await supabase
              .from('comments')
              .select('id', { count: 'exact' })
              .eq('thread_id', thread.id);
            
            // Get tags
            const { data: tagsData } = await supabase
              .from('thread_tags')
              .select('tags:tag_id (name)')
              .eq('thread_id', thread.id);
            
            const tags = tagsData 
              ? tagsData.map(tag => tag.tags.name) 
              : [];
              
            return {
              id: thread.id,
              title: thread.title,
              content: thread.content,
              created_at: thread.created_at,
              community: {
                id: thread.communities?.id || '',
                name: thread.communities?.name || 'Unknown'
              },
              author: {
                id: authorData?.id || '',
                name: authorData?.username || 'Anonymous',
                avatar: authorData?.avatar_url
              },
              votes: (upvotes || 0) - (downvotes || 0),
              commentCount: commentCount || 0,
              tags
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
