
import ThreadCard from "@/components/ThreadCard";
import { ThreadWithRelations, ThreadCardProps } from "@/types/supabase";

interface ThreadListProps {
  threads: ThreadWithRelations[];
}

const ThreadList = ({ threads }: ThreadListProps) => {
  console.log("[ThreadList] Received threads:", threads.map(thread => ({
    id: thread.id,
    idType: typeof thread.id
  })));
  
  return (
    <>
      {threads.map((thread) => {
        // Ensure thread has a valid ID before rendering
        if (!thread.id) return null;
        
        // Log the thread ID we're about to pass to ThreadCard
        console.log("[ThreadList] Passing thread:", {
          id: thread.id,
          type: typeof thread.id
        });
        
        return (
          <ThreadCard 
            key={thread.id} 
            thread={{
              id: thread.id, // Now correctly matching the string type expected by ThreadCardProps
              title: thread.title,
              content: thread.content,
              author: {
                name: thread.author.name,
                avatar: thread.author.avatar
              },
              community: {
                name: thread.community.name,
                id: thread.community.id // Now correctly matching the string type expected by ThreadCardProps
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
        );
      })}
    </>
  );
};

export default ThreadList;
