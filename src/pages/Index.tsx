
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
  PlusCircle 
} from "lucide-react";

// Sample data
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
    id: 2,
    title: "Just got a new camera! Looking for tips on landscape photography",
    content: "I finally upgraded my camera gear and got a Sony Alpha a7 III. I'm planning a trip to Yosemite next month and would love some tips for landscape photography. Any recommendations on lenses, settings, or composition techniques?",
    author: { name: "photoNewbie", avatar: "/placeholder.svg" },
    community: { name: "Photography", id: 2 },
    votes: 89,
    commentCount: 32,
    tags: ["Landscape", "Camera Gear", "Photography Tips"],
    createdAt: "5 hours ago"
  },
  {
    id: 3,
    title: "Has anyone played the new indie game 'Hollow Knight: Silksong'?",
    content: "I've been waiting for this game for years and it's finally out! I'm about 10 hours in and I'm blown away by the level design and atmosphere. Curious to hear what others think about it compared to the original Hollow Knight.",
    author: { name: "gamingFanatic", avatar: "/placeholder.svg" },
    community: { name: "Gaming", id: 4 },
    votes: 215,
    commentCount: 87,
    tags: ["Indie Games", "Metroidvania", "Hollow Knight"],
    createdAt: "1 day ago"
  },
  {
    id: 4,
    title: "Book recommendations similar to Project Hail Mary by Andy Weir?",
    content: "I just finished Project Hail Mary and absolutely loved it. The mix of hard sci-fi with character development and humor was perfect. Can anyone recommend similar books that capture that same feeling?",
    author: { name: "bookworm42", avatar: "/placeholder.svg" },
    community: { name: "Books", id: 5 },
    votes: 76,
    commentCount: 41,
    tags: ["Sci-Fi", "Book Recommendations", "Andy Weir"],
    createdAt: "2 days ago"
  },
];

const Index = () => {
  const [activeTab, setActiveTab] = useState("trending");
  const [threads, setThreads] = useState(sampleThreads);
  
  // Sort threads based on active tab
  useEffect(() => {
    let sortedThreads = [...sampleThreads];
    
    switch (activeTab) {
      case "trending":
        sortedThreads.sort((a, b) => b.votes + b.commentCount - (a.votes + a.commentCount));
        break;
      case "new":
        sortedThreads = sampleThreads; // Already sorted by newest in our sample
        break;
      case "top":
        sortedThreads.sort((a, b) => b.votes - a.votes);
        break;
      case "comments":
        sortedThreads.sort((a, b) => b.commentCount - a.commentCount);
        break;
      default:
        break;
    }
    
    setThreads(sortedThreads);
  }, [activeTab]);
  
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
            
            <TabsContent value="trending" className="mt-4 space-y-4">
              {threads.map((thread) => (
                <ThreadCard key={thread.id} thread={thread} />
              ))}
            </TabsContent>
            
            <TabsContent value="new" className="mt-4 space-y-4">
              {threads.map((thread) => (
                <ThreadCard key={thread.id} thread={thread} />
              ))}
            </TabsContent>
            
            <TabsContent value="top" className="mt-4 space-y-4">
              {threads.map((thread) => (
                <ThreadCard key={thread.id} thread={thread} />
              ))}
            </TabsContent>
            
            <TabsContent value="comments" className="mt-4 space-y-4">
              {threads.map((thread) => (
                <ThreadCard key={thread.id} thread={thread} />
              ))}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default Index;
