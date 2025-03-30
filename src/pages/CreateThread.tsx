
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import MainLayout from "@/components/layout/MainLayout";
import CreateThreadForm from "@/components/CreateThreadForm";
import ThreadHeader from "@/components/ThreadHeader";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const CreateThread = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [hasChannels, setHasChannels] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      checkUserChannels();
    } else {
      setLoading(false);
    }
  }, [user]);

  const checkUserChannels = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('community_members')
        .select('id')
        .eq('user_id', user?.id)
        .limit(1);
      
      if (error) throw error;
      
      setHasChannels(data && data.length > 0);
    } catch (error) {
      console.error('Error checking user channels:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto pt-16 px-4 text-center">
          <h1 className="text-3xl font-bold mb-6">Sign In Required</h1>
          <p className="text-lg text-muted-foreground mb-8">
            You need to be signed in to create a thread.
          </p>
          <Button onClick={() => navigate('/login')} size="lg">
            Sign In
          </Button>
        </div>
      </div>
    );
  }

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
