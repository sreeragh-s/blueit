
import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import MainLayout from "@/components/layout/MainLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageSquare, 
  Users, 
  Info,
  Shield
} from "lucide-react";
import EditCommunityDialog from "@/components/EditCommunityDialog";
import { useCommunityDetail } from "@/hooks/use-community-detail";

// Import refactored components
import CommunityBanner from "@/components/community/CommunityBanner";
import CommunityActionBar from "@/components/community/CommunityActionBar";
import CommunityThreadsTab from "@/components/community/CommunityThreadsTab";
import CommunityAbout from "@/components/community/CommunityAbout";
import CommunityMembers from "@/components/community/CommunityMembers";
import CommunityRules from "@/components/community/CommunityRules";
import CommunityLoading from "@/components/community/CommunityLoading";
import CommunityNotFound from "@/components/community/CommunityNotFound";

const CommunityDetail = () => {
  const { communityId } = useParams();
  
  const {
    community,
    threads,
    isJoined,
    isAdmin,
    activeTab,
    sortOption,
    loading,
    threadsLoading,
    joiningLoading,
    isEditCommunityOpen,
    setActiveTab,
    setSortOption,
    handleJoinCommunity,
    setIsEditCommunityOpen,
    fetchCommunityData
  } = useCommunityDetail(communityId);
  
  if (loading) {
    return <CommunityLoading />;
  }
  
  if (!community) {
    return <CommunityNotFound />;
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="flex flex-1 overflow-hidden w-full">
        <MainLayout>
          <CommunityBanner 
            name={community.name} 
            bannerImage={community.banner_image} 
          />
          
          <CommunityActionBar 
            isAdmin={isAdmin}
            isJoined={isJoined}
            joiningLoading={joiningLoading}
            communityName={community.name}
            onJoinCommunity={handleJoinCommunity}
            onOpenEditCommunity={() => setIsEditCommunityOpen(true)}
          />
          
          <div className="mt-4">
            <Tabs defaultValue="threads" value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList>
                <TabsTrigger value="threads">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Threads
                </TabsTrigger>
                <TabsTrigger value="about">
                  <Info className="mr-2 h-4 w-4" />
                  About
                </TabsTrigger>
                <TabsTrigger value="members">
                  <Users className="mr-2 h-4 w-4" />
                  Members
                </TabsTrigger>
                <TabsTrigger value="rules">
                  <Shield className="mr-2 h-4 w-4" />
                  Rules
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="threads" className="mt-4">
                <CommunityThreadsTab 
                  threads={threads}
                  threadsLoading={threadsLoading}
                  sortOption={sortOption}
                  onSortChange={setSortOption}
                />
              </TabsContent>
              
              <TabsContent value="about" className="mt-4">
                <CommunityAbout 
                  community={community}
                  isJoined={isJoined}
                  joiningLoading={joiningLoading}
                  onJoinCommunity={handleJoinCommunity}
                />
              </TabsContent>
              
              <TabsContent value="members" className="mt-4">
                <CommunityMembers />
              </TabsContent>
              
              <TabsContent value="rules" className="mt-4">
                <CommunityRules rules={community.rules} />
              </TabsContent>
            </Tabs>
          </div>
          
          {community && isAdmin && (
            <EditCommunityDialog
              open={isEditCommunityOpen}
              onOpenChange={setIsEditCommunityOpen}
              community={community}
              onCommunityUpdated={fetchCommunityData}
            />
          )}
        </MainLayout>
      </div>
    </div>
  );
};

export default CommunityDetail;
