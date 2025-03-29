
import { TrendingUp, Clock, Flame, MessageSquare } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ThreadFilterTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  children: React.ReactNode;
}

const ThreadFilterTabs = ({ activeTab, onTabChange, children }: ThreadFilterTabsProps) => {
  return (
    <Tabs defaultValue="trending" value={activeTab} onValueChange={onTabChange} className="mb-6">
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
      
      <TabsContent value={activeTab} className="mt-4 space-y-4">
        {children}
      </TabsContent>
    </Tabs>
  );
};

export default ThreadFilterTabs;
