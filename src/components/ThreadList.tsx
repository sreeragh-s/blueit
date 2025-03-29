
import ThreadCard from "@/components/ThreadCard";
import { ThreadWithRelations } from "@/types/supabase";

interface ThreadListProps {
  threads: ThreadWithRelations[];
}

const ThreadList = ({ threads }: ThreadListProps) => {
  return (
    <>
      {threads.map((thread) => (
        <ThreadCard 
          key={thread.id} 
          thread={{
            id: Number(thread.id), // Convert string to number
            title: thread.title,
            content: thread.content,
            author: {
              name: thread.author.name,
              avatar: thread.author.avatar
            },
            community: {
              name: thread.community.name,
              id: Number(thread.community.id) // Convert string to number
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
      ))}
    </>
  );
};

export default ThreadList;
