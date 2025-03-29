
import React from "react";
import { Link } from "react-router-dom";
import ThreadList from "@/components/ThreadList";
import ThreadFilterTabs from "@/components/ThreadFilterTabs";
import { Button } from "@/components/ui/button";
import { MessageSquare, PlusCircle, Loader2 } from "lucide-react";
import { ThreadWithRelations } from "@/types/supabase";

interface CommunityThreadsTabProps {
  threads: ThreadWithRelations[];
  threadsLoading: boolean;
  sortOption: string;
  onSortChange: (sortOption: string) => void;
}

const CommunityThreadsTab = ({
  threads,
  threadsLoading,
  sortOption,
  onSortChange
}: CommunityThreadsTabProps) => {
  return (
    <>
      <div className="mb-4">
        <ThreadFilterTabs 
          activeTab={sortOption} 
          onTabChange={onSortChange}
        >
          {threadsLoading ? (
            <div className="flex flex-col items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading threads...</p>
            </div>
          ) : threads.length > 0 ? (
            <ThreadList threads={threads} />
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
        </ThreadFilterTabs>
      </div>
    </>
  );
};

export default CommunityThreadsTab;
