
import { Clock, MessageSquare } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ThreadFilterTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  children: React.ReactNode;
}

const ThreadFilterTabs = ({ activeTab, onTabChange, children }: ThreadFilterTabsProps) => {
  return (
    <Tabs defaultValue="new" value={activeTab} onValueChange={onTabChange} className="mb-6">
      <TabsList>
        <TabsTrigger value="new">
          <Clock className="mr-2 h-4 w-4" />
          New
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
