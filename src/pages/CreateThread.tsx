
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import MainLayout from "@/components/layout/MainLayout";
import CreateThreadForm from "@/components/CreateThreadForm";
import ThreadHeader from "@/components/ThreadHeader";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const CreateThread = () => {
  const { user } = useAuth();
  const [hasCommunities, setHasCommunities] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      checkUserCommunities();
    }
  }, [user]);

  const checkUserCommunities = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('community_members')
        .select('id')
        .eq('user_id', user?.id)
        .limit(1);
      
      if (error) throw error;
      
      setHasCommunities(data && data.length > 0);
    } catch (error) {
      console.error('Error checking user communities:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="flex flex-1 overflow-hidden w-full">
        <MainLayout>
          <ThreadHeader />
          
          <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Create a New Thread</h1>
            
            <div className="bg-card rounded-lg border p-6">
              <CreateThreadForm />
            </div>
          </div>
        </MainLayout>
      </div>
    </div>
  );
};

export default CreateThread;
