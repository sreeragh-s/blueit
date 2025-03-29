
import ThreadCard from "@/components/ThreadCard";
import { ThreadWithRelations, ThreadCardProps } from "@/types/supabase";

interface ThreadListProps {
  threads: ThreadWithRelations[];
}

const ThreadList = ({ threads }: ThreadListProps) => {
  return (
    <>
      {threads.map((thread) => {
        // Ensure thread has a valid ID before rendering
        if (!thread.id) return null;
        
        return (
          <ThreadCard 
            key={thread.id} 
            thread={{
              id: thread.id, // Keep as string, no conversion
              title: thread.title,
              content: thread.content,
              author: {
                name: thread.author.name,
                avatar: thread.author.avatar
              },
              community: {
                name: thread.community.name,
                id: thread.community.id // Keep as string, no conversion
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
