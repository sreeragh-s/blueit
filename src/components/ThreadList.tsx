
import ThreadCard from "@/components/ThreadCard";
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
      ))}
    </>
  );
};

export default ThreadList;
