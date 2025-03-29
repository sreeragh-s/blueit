
import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Users } from "lucide-react";

// Sample communities data
const sampleCommunities = [
  {
    id: 1,
    name: "Technology",
    description: "Discuss the latest in tech, gadgets, programming, and digital trends.",
    memberCount: 52384,
    bannerImage: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=1200&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    tags: ["Tech", "Programming", "Gadgets"]
  },
  {
    id: 2,
    name: "Photography",
    description: "Share your photos, get feedback, and discuss photography techniques.",
    memberCount: 38762,
    bannerImage: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1200&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    tags: ["Photos", "Cameras", "Editing"]
  },
  {
    id: 3,
    name: "Music",
    description: "For all music lovers - discuss bands, songs, instruments, and music theory.",
    memberCount: 67129,
    bannerImage: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1200&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    tags: ["Artists", "Instruments", "Genres"]
  },
  {
    id: 4,
    name: "Gaming",
    description: "Video games, board games, card games - all gaming discussions welcome!",
    memberCount: 104782,
    bannerImage: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    tags: ["Video Games", "Board Games", "eSports"]
  },
  {
    id: 5,
    name: "Books",
    description: "Book recommendations, discussions, and literary analysis.",
    memberCount: 28945,
    bannerImage: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=1200&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    tags: ["Fiction", "Non-fiction", "Reading"]
  },
  {
    id: 6,
    name: "Sports",
    description: "All sports discussions, from professional leagues to amateur tips.",
    memberCount: 82561,
    bannerImage: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    tags: ["Teams", "Fitness", "Events"]
  },
  {
    id: 7,
    name: "Science",
    description: "Explore scientific discoveries, theories, and research across all fields.",
    memberCount: 45128,
    bannerImage: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=1200&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    tags: ["Research", "Space", "Biology"]
  },
  {
    id: 8,
    name: "Cooking",
    description: "Recipes, cooking techniques, food pics, and culinary discussions.",
    memberCount: 63472,
    bannerImage: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    tags: ["Recipes", "Food", "Baking"]
  }
];

const Explore = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [communities, setCommunities] = useState(sampleCommunities);
  
  // Filter communities based on search query
  const filteredCommunities = communities.filter(community => 
    community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    community.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    community.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container flex">
        <Sidebar />
        
        <main className="flex-1 p-4 lg:p-6">
          <h1 className="text-2xl font-bold mb-6">Explore Communities</h1>
          
          <div className="mb-6 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search communities by name, description, or tags..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCommunities.map((community) => (
              <Card key={community.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <div 
                  className="h-32 w-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${community.bannerImage})` }}
                />
                
                <CardHeader className="pb-2">
                  <CardTitle className="flex justify-between items-start">
                    <Link 
                      to={`/community/${community.id}`}
                      className="hover:text-primary transition-colors"
                    >
                      c/{community.name}
                    </Link>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users size={14} className="mr-1" />
                      {community.memberCount.toLocaleString()}
                    </div>
                  </CardTitle>
                </CardHeader>
                
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {community.description.length > 120
                      ? community.description.substring(0, 120) + "..."
                      : community.description
                    }
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    {community.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="font-normal">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
                
                <CardFooter className="pt-0">
                  <Button asChild className="w-full">
                    <Link to={`/community/${community.id}`}>
                      View Community
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          {filteredCommunities.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium">No communities found</h3>
              <p className="text-muted-foreground mt-1">
                Try a different search term or create a new community.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Explore;
