
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import ThreadCard from "@/components/ThreadCard";
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
  Bell
} from "lucide-react";

// Sample community data
const sampleCommunity = {
  id: 1,
  name: "Technology",
  description: "A place to discuss all things technology - from the latest gadgets and software to programming and tech industry news.",
  bannerImage: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=1200&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
  memberCount: 52384,
  isJoined: false,
  createdAt: "2 years ago",
  rules: [
    "Be respectful to others",
    "No spam or self-promotion",
    "Use descriptive titles for posts",
    "Mark spoilers appropriately",
    "Keep content relevant to technology"
  ]
};

// Sample thread data
const sampleThreads = [
  {
    id: 1,
    title: "What's your favorite development stack for building modern web applications?",
    content: "I've been experimenting with different tech stacks lately and wanted to hear what others are using. Currently I'm working with React, TypeScript, and Tailwind CSS on the frontend with Node.js and Express on the backend. What's your go-to stack and why do you prefer it?",
    author: { name: "techEnthusiast", avatar: "/placeholder.svg" },
    community: { name: "Technology", id: 1 },
    votes: 127,
    commentCount: 48,
    tags: ["Web Development", "Programming", "Tech Stack"],
    createdAt: "3 hours ago"
  },
  {
    id: 6,
    title: "Apple just announced their new M3 MacBook Pro lineup - thoughts?",
    content: "Apple unveiled their new MacBook Pro lineup with the M3 chips today. The performance gains look impressive but the price is still high. What do you think? Is it worth upgrading from an M1?",
    author: { name: "appleFan", avatar: "/placeholder.svg" },
    community: { name: "Technology", id: 1 },
    votes: 98,
    commentCount: 64,
    tags: ["Apple", "Hardware", "MacBook"],
    createdAt: "8 hours ago"
  },
  {
    id: 7,
    title: "Open source AI models are getting impressive - check out this new project",
    content: "I've been testing some of the latest open source AI models and they're starting to rival the paid options. This new model from Meta can run locally on decent hardware and produces results nearly as good as GPT-4.",
    author: { name: "ai_researcher", avatar: "/placeholder.svg" },
    community: { name: "Technology", id: 1 },
    votes: 156,
    commentCount: 37,
    tags: ["AI", "Machine Learning", "Open Source"],
    createdAt: "1 day ago"
  },
  {
    id: 8,
    title: "Mechanical keyboard recommendations for programmers?",
    content: "I'm in the market for a new mechanical keyboard and want something that's good for long coding sessions. Preferably not too loud but with good tactile feedback. Budget is around $150. Any recommendations?",
    author: { name: "codingTypist", avatar: "/placeholder.svg" },
    community: { name: "Technology", id: 1 },
    votes: 78,
    commentCount: 92,
    tags: ["Hardware", "Keyboards", "Peripherals"],
    createdAt: "2 days ago"
  },
];

const CommunityDetail = () => {
  const { communityId } = useParams();
  const [community, setCommunity] = useState(sampleCommunity);
  const [threads, setThreads] = useState(sampleThreads);
  const [isJoined, setIsJoined] = useState(community.isJoined);
  const [activeTab, setActiveTab] = useState("threads");
  const [sortOption, setSortOption] = useState("trending");
  
  const handleJoinCommunity = () => {
    setIsJoined(!isJoined);
  };
  
  // Sort threads based on active sort option
  const getSortedThreads = () => {
    let sortedThreads = [...threads];
    
    switch (sortOption) {
      case "trending":
        return sortedThreads.sort((a, b) => b.votes + b.commentCount - (a.votes + a.commentCount));
      case "new":
        return sortedThreads; // Already sorted by newest in our sample
      case "top":
        return sortedThreads.sort((a, b) => b.votes - a.votes);
      case "comments":
        return sortedThreads.sort((a, b) => b.commentCount - a.commentCount);
      default:
        return sortedThreads;
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container flex">
        <Sidebar />
        
        <main className="flex-1">
          {/* Community Banner */}
          <div 
            className="h-40 md:h-60 w-full bg-cover bg-center relative"
            style={{ backgroundImage: `url(${community.bannerImage})` }}
          >
            <div className="absolute inset-0 bg-black/40"></div>
            <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6 flex flex-col">
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                c/{community.name}
              </h1>
              <p className="text-white/80 text-sm mt-1">
                {community.memberCount.toLocaleString()} members • Created {community.createdAt}
              </p>
            </div>
          </div>
          
          {/* Community Actions */}
          <div className="bg-card border-b px-4 py-3 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button 
                variant={isJoined ? "outline" : "default"}
                onClick={handleJoinCommunity}
              >
                {isJoined ? "Joined" : "Join Community"}
              </Button>
              
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
                  {getSortedThreads().map((thread) => (
                    <ThreadCard key={thread.id} thread={thread} />
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="about" className="mt-4">
                <div className="bg-card rounded-lg border p-6">
                  <h2 className="text-xl font-semibold mb-4">About c/{community.name}</h2>
                  <p className="text-foreground/90 mb-6">{community.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-muted/30 rounded-md p-4">
                      <h3 className="font-medium mb-1">Members</h3>
                      <p className="text-2xl font-bold">{community.memberCount.toLocaleString()}</p>
                    </div>
                    <div className="bg-muted/30 rounded-md p-4">
                      <h3 className="font-medium mb-1">Created</h3>
                      <p className="text-2xl font-bold">{community.createdAt}</p>
                    </div>
                  </div>
                  
                  <Button className="w-full">
                    {isJoined ? "Leave Community" : "Join Community"}
                  </Button>
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
                  <ol className="list-decimal pl-5 space-y-3">
                    {community.rules.map((rule, index) => (
                      <li key={index} className="text-foreground/90">
                        {rule}
                      </li>
                    ))}
                  </ol>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CommunityDetail;
