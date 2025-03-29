import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import ThreadList from "@/components/ThreadList";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  PlusCircle, 
  TrendingUp, 
  Clock, 
  Flame, 
  MessageSquare, 
  Users, 
  Info,
  Shield,
  Bell,
  Settings as SettingsIcon,
  Loader2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import EditCommunityDialog from "@/components/EditCommunityDialog";
import { ThreadWithRelations } from "@/types/supabase";

const CommunityDetail = () => {
  const { communityId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [community, setCommunity] = useState<any>(null);
  const [threads, setThreads] = useState<ThreadWithRelations[]>([]);
  const [isJoined, setIsJoined] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState("threads");
  const [sortOption, setSortOption] = useState("trending");
  const [loading, setLoading] = useState(true);
  const [threadsLoading, setThreadsLoading] = useState(true);
  const [joiningLoading, setJoiningLoading] = useState(false);
  const [isEditCommunityOpen, setIsEditCommunityOpen] = useState(false);
  
  useEffect(() => {
    if (communityId) {
      fetchCommunityData();
    }
  }, [communityId, user]);
  
  useEffect(() => {
    if (communityId) {
      fetchCommunityThreads();
    }
  }, [communityId, sortOption]);
  
  const fetchCommunityThreads = async () => {
    if (!communityId) return;
    
    try {
      setThreadsLoading(true);
      
      // Fetch threads for this community
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
        .order(getSortOrderColumn(), { ascending: sortOption === 'new' ? false : true });
      
      if (threadsError) throw threadsError;
      
      if (!threadsData || threadsData.length === 0) {
        setThreads([]);
        setThreadsLoading(false);
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
            .select('tags:tag_id(name)')
            .eq('thread_id', thread.id);
          
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

  const fetchCommunityData = async () => {
    if (!communityId) return;
    
    try {
      setLoading(true);
      
      // Fetch community details
      const { data: communityData, error: communityError } = await supabase
        .from('communities')
        .select('*')
        .eq('id', communityId)
        .single();
      
      if (communityError) {
        throw communityError;
      }
      
      setCommunity(communityData);
      
      // Check if user is a member and their role
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

  const getSortOrderColumn = () => {
    switch (sortOption) {
      case "new":
        return 'created_at';
      case "top":
        // This is handled client-side since it requires aggregating votes
        return 'created_at';
      case "comments":
        // This is handled client-side since it requires counting comments
        return 'created_at';
      case "trending":
      default:
        // This is handled client-side since it combines votes and comments
        return 'created_at';
    }
  };
  
  // Sort threads based on active sort option
  const getSortedThreads = () => {
    let sortedThreads = [...threads];
    
    switch (sortOption) {
      case "trending":
        return sortedThreads.sort((a, b) => (b.votes + b.commentCount) - (a.votes + a.commentCount));
      case "new":
        // Already sorted by created_at in the query
        return sortedThreads;
      case "top":
        return sortedThreads.sort((a, b) => b.votes - a.votes);
      case "comments":
        return sortedThreads.sort((a, b) => b.commentCount - a.commentCount);
      default:
        return sortedThreads;
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
        // Leave community
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
        // Join community
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
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container flex">
          <Sidebar />
          <main className="flex-1 flex items-center justify-center p-6">
            <div className="flex flex-col items-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading community...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }
  
  if (!community) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container flex">
          <Sidebar />
          <main className="flex-1 p-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Community Not Found</h1>
              <p className="text-muted-foreground mb-6">
                The community you're looking for doesn't exist or you don't have permission to view it.
              </p>
              <Button asChild>
                <Link to="/explore">Explore Communities</Link>
              </Button>
            </div>
          </main>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container flex">
        <Sidebar />
        
        <main className="flex-1">
          {/* Community Banner */}
          <div 
            className="h-40 md:h-60 w-full bg-cover bg-center relative"
            style={{ backgroundImage: `url(${community.banner_image || "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=1200&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"})` }}
          >
            <div className="absolute inset-0 bg-black/40"></div>
            <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6 flex flex-col">
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                c/{community.name}
              </h1>
              <p className="text-white/80 text-sm mt-1">
                {/* Replace with actual member count */ }
                {/* Created {community.created_at} */ }
              </p>
            </div>
          </div>
          
          {/* Community Actions */}
          <div className="bg-card border-b px-4 py-3 flex justify-between items-center">
            <div className="flex items-center gap-4">
              {isAdmin ? (
                <Button 
                  variant="outline"
                  onClick={() => setIsEditCommunityOpen(true)}
                >
                  <SettingsIcon className="mr-2 h-4 w-4" />
                  Community Settings
                </Button>
              ) : (
                <Button 
                  variant={isJoined ? "outline" : "default"}
                  onClick={handleJoinCommunity}
                  disabled={joiningLoading}
                >
                  {joiningLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isJoined ? "Leaving..." : "Joining..."}
                    </>
                  ) : (
                    isJoined ? "Joined" : "Join Community"
                  )}
                </Button>
              )}
              
              <Button variant="ghost" size="icon">
                <Bell size={20} />
              </Button>
            </div>
            
            <Button variant="default" asChild>
              <Link to="/create">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Thread
              </Link>
            </Button>
          </div>
          
          <div className="p-4 lg:p-6">
            <Tabs defaultValue="threads" value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList>
                <TabsTrigger value="threads">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Threads
                </TabsTrigger>
                <TabsTrigger value="about">
                  <Info className="mr-2 h-4 w-4" />
                  About
                </TabsTrigger>
                <TabsTrigger value="members">
                  <Users className="mr-2 h-4 w-4" />
                  Members
                </TabsTrigger>
                <TabsTrigger value="rules">
                  <Shield className="mr-2 h-4 w-4" />
                  Rules
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="threads" className="mt-4">
                <div className="mb-4">
                  <TabsList>
                    <TabsTrigger 
                      value="trending" 
                      onClick={() => setSortOption("trending")}
                      data-active={sortOption === "trending"}
                      className={sortOption === "trending" ? "bg-primary text-primary-foreground" : ""}
                    >
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Trending
                    </TabsTrigger>
                    <TabsTrigger 
                      value="new" 
                      onClick={() => setSortOption("new")}
                      data-active={sortOption === "new"}
                      className={sortOption === "new" ? "bg-primary text-primary-foreground" : ""}
                    >
                      <Clock className="mr-2 h-4 w-4" />
                      New
                    </TabsTrigger>
                    <TabsTrigger 
                      value="top" 
                      onClick={() => setSortOption("top")}
                      data-active={sortOption === "top"}
                      className={sortOption === "top" ? "bg-primary text-primary-foreground" : ""}
                    >
                      <Flame className="mr-2 h-4 w-4" />
                      Top
                    </TabsTrigger>
                    <TabsTrigger 
                      value="comments" 
                      onClick={() => setSortOption("comments")}
                      data-active={sortOption === "comments"}
                      className={sortOption === "comments" ? "bg-primary text-primary-foreground" : ""}
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Most Comments
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <div className="space-y-4">
                  {threadsLoading ? (
                    <div className="flex flex-col items-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                      <p className="text-muted-foreground">Loading threads...</p>
                    </div>
                  ) : threads.length > 0 ? (
                    <ThreadList threads={getSortedThreads()} />
                  ) : (
                    <div className="text-center py-12 bg-card rounded-lg border">
                      <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No threads yet</h3>
                      <p className="text-muted-foreground mb-6">
                        Be the first to start a conversation in this community!
                      </p>
                      <Button asChild>
                        <Link to="/create">
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Create Thread
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="about" className="mt-4">
                <div className="bg-card rounded-lg border p-6">
                  <h2 className="text-xl font-semibold mb-4">About c/{community.name}</h2>
                  <p className="text-foreground/90 mb-6">{community.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-muted/30 rounded-md p-4">
                      <h3 className="font-medium mb-1">Created</h3>
                      <p className="text-lg font-bold">
                        {new Date(community.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="bg-muted/30 rounded-md p-4">
                      <h3 className="font-medium mb-1">Type</h3>
                      <p className="text-lg font-bold">{community.is_private ? "Private" : "Public"}</p>
                    </div>
                  </div>
                  
                  {!isJoined && (
                    <Button className="w-full" onClick={handleJoinCommunity} disabled={joiningLoading}>
                      {joiningLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Joining...
                        </>
                      ) : (
                        "Join Community"
                      )}
                    </Button>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="members" className="mt-4">
                <div className="bg-card rounded-lg border p-6">
                  <h2 className="text-xl font-semibold mb-4">Members</h2>
                  <p className="text-muted-foreground">
                    This feature will be available soon. Stay tuned!
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="rules" className="mt-4">
                <div className="bg-card rounded-lg border p-6">
                  <h2 className="text-xl font-semibold mb-4">Community Rules</h2>
                  {community.rules && community.rules.length > 0 ? (
                    <ol className="list-decimal pl-5 space-y-3">
                      {community.rules.map((rule, index) => (
                        <li key={index} className="text-foreground/90">
                          {rule}
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="text-muted-foreground">
                      No rules have been set for this community yet.
                    </p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
      
      {/* Edit Community Dialog */}
      {community && isAdmin && (
        <EditCommunityDialog
          open={isEditCommunityOpen}
          onOpenChange={setIsEditCommunityOpen}
          community={community}
          onCommunityUpdated={fetchCommunityData}
        />
      )}
    </div>
  );
};

export default CommunityDetail;
