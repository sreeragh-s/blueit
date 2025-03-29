
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import CommentCard from "@/components/CommentCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare, 
  Share2, 
  Bookmark, 
  Flag 
} from "lucide-react";
import { cn } from "@/lib/utils";

// Sample thread data
const sampleThread = {
  id: 1,
  title: "What's your favorite development stack for building modern web applications?",
  content: "I've been experimenting with different tech stacks lately and wanted to hear what others are using. Currently I'm working with React, TypeScript, and Tailwind CSS on the frontend with Node.js and Express on the backend. What's your go-to stack and why do you prefer it?\n\nI'm particularly interested in hearing about:\n\n- Frontend frameworks (React vs Vue vs Angular vs Svelte)\n- CSS approaches (Tailwind vs CSS-in-JS vs SCSS)\n- Backend technologies (Node vs Python vs Go vs Ruby)\n- Database choices (SQL vs NoSQL)\n\nAlso, if you have any recommendations for learning resources, please share!",
  author: { name: "techEnthusiast", avatar: "/placeholder.svg" },
  community: { name: "Technology", id: 1 },
  votes: 127,
  commentCount: 3,
  tags: ["Web Development", "Programming", "Tech Stack"],
  createdAt: "3 hours ago"
};

// Sample comments data
const sampleComments = [
  {
    id: 1,
    content: "I've been using the MERN stack (MongoDB, Express, React, Node.js) for a few years now and it's been great for building full-stack applications quickly. The JavaScript everywhere approach means I don't have to context-switch between languages.",
    author: { name: "devPro", avatar: "/placeholder.svg" },
    votes: 45,
    createdAt: "2 hours ago",
    replies: [
      {
        id: 2,
        content: "I agree about the MERN stack! I would add TypeScript to that mix though. It has saved me countless hours of debugging by catching errors at compile time.",
        author: { name: "typescript_fan", avatar: "/placeholder.svg" },
        votes: 23,
        createdAt: "1 hour ago",
        replies: [
          {
            id: 3,
            content: "Absolutely! TypeScript is a game-changer. Have you tried using Prisma with MongoDB? It gives you type-safety for your database queries too.",
            author: { name: "techEnthusiast", avatar: "/placeholder.svg" },
            votes: 12,
            createdAt: "45 minutes ago"
          }
        ]
      }
    ]
  },
  {
    id: 4,
    content: "I've recently switched from React to Svelte for frontend development and I'm loving it. The bundle sizes are smaller and the reactivity model feels more intuitive. Paired with FastAPI on the backend and PostgreSQL for the database, it's been a joy to work with.",
    author: { name: "svelte_convert", avatar: "/placeholder.svg" },
    votes: 32,
    createdAt: "1 hour ago"
  },
  {
    id: 5,
    content: "For learning resources, I highly recommend The Odin Project for a comprehensive full-stack curriculum. It's free and community-driven. Frontend Masters also has excellent advanced courses if you're willing to pay for them.",
    author: { name: "learning_dev", avatar: "/placeholder.svg" },
    votes: 19,
    createdAt: "30 minutes ago"
  }
];

const ThreadDetail = () => {
  const { threadId } = useParams();
  const [thread] = useState(sampleThread);
  const [comments, setComments] = useState(sampleComments);
  const [commentText, setCommentText] = useState("");
  const [votes, setVotes] = useState(thread.votes);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [saved, setSaved] = useState(false);
  
  const handleVote = (type: 'up' | 'down') => {
    if (userVote === type) {
      // Undo vote
      setVotes(type === 'up' ? votes - 1 : votes + 1);
      setUserVote(null);
    } else {
      // Change vote
      if (userVote === 'up' && type === 'down') {
        setVotes(votes - 2);
      } else if (userVote === 'down' && type === 'up') {
        setVotes(votes + 2);
      } else {
        setVotes(type === 'up' ? votes + 1 : votes - 1);
      }
      setUserVote(type);
    }
  };
  
  const handleSubmitComment = () => {
    if (commentText.trim()) {
      const newComment = {
        id: comments.length + 1,
        content: commentText,
        author: { name: "currentUser", avatar: "/placeholder.svg" },
        votes: 0,
        createdAt: "Just now"
      };
      
      setComments([newComment, ...comments]);
      setCommentText("");
    }
  };
  
  // Format the content with line breaks
  const formattedContent = thread.content.split('\n\n').map((paragraph, idx) => (
    <p key={idx} className="mb-4">
      {paragraph.split('\n').map((line, lineIdx) => (
        <span key={lineIdx}>
          {line}
          {lineIdx < paragraph.split('\n').length - 1 && <br />}
        </span>
      ))}
    </p>
  ));
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container flex">
        <Sidebar />
        
        <main className="flex-1 p-4 lg:p-6">
          <Button variant="ghost" className="mb-4" asChild>
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to feed
            </Link>
          </Button>
          
          <div className="thread-card mb-6">
            <div className="flex items-start p-4">
              <div className="flex flex-col items-center mr-4">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={cn("h-8 w-8 rounded-full", userVote === 'up' ? "text-primary" : "")}
                  onClick={() => handleVote('up')}
                >
                  <ThumbsUp size={16} />
                </Button>
                <span className="text-sm font-medium py-1">{votes}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={cn("h-8 w-8 rounded-full", userVote === 'down' ? "text-destructive" : "")}
                  onClick={() => handleVote('down')}
                >
                  <ThumbsDown size={16} />
                </Button>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="hover:bg-accent">
                    <Link to={`/community/${thread.community.id}`}>
                      c/{thread.community.name}
                    </Link>
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Posted by u/{thread.author.name} · {thread.createdAt}
                  </span>
                </div>
                
                <h1 className="text-2xl font-bold mb-4">{thread.title}</h1>
                
                <div className="mb-4">
                  {formattedContent}
                </div>
                
                {thread.tags && thread.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {thread.tags.map((tag, i) => (
                      <Badge key={i} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="px-4 py-2 flex justify-between items-center border-t bg-muted/20">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" className="flex items-center gap-1">
                  <MessageSquare size={16} />
                  <span>{comments.length} Comments</span>
                </Button>
                <Button variant="ghost" size="sm" className="flex items-center gap-1">
                  <Share2 size={16} />
                  <span>Share</span>
                </Button>
              </div>
              
              <div className="flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={cn("flex items-center gap-1", saved ? "text-primary" : "")}
                  onClick={() => setSaved(!saved)}
                >
                  <Bookmark size={16} />
                  <span>{saved ? "Saved" : "Save"}</span>
                </Button>
                <Button variant="ghost" size="sm" className="flex items-center gap-1">
                  <Flag size={16} />
                  <span>Report</span>
                </Button>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4">Comments ({comments.length})</h2>
            
            <div className="bg-card rounded-lg border p-4 mb-6">
              <div className="flex items-start gap-3 mb-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg" alt="Your Avatar" />
                  <AvatarFallback>YA</AvatarFallback>
                </Avatar>
                <Textarea
                  placeholder="What are your thoughts?"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="flex-1 min-h-[100px]"
                />
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSubmitComment} disabled={!commentText.trim()}>
                  Comment
                </Button>
              </div>
            </div>
            
            <div className="space-y-4">
              {comments.map((comment) => (
                <CommentCard key={comment.id} comment={comment} />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ThreadDetail;
