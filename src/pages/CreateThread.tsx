
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import CreateThreadForm from "@/components/CreateThreadForm";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const CreateThread = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
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
      
      <div className="container flex">
        <Sidebar />
        
        <main className="flex-1 p-4 lg:p-6">
          <Button variant="ghost" className="mb-4" asChild>
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to feed
            </Link>
          </Button>
          
          <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Create a New Thread</h1>
            
            <div className="bg-card rounded-lg border p-6">
              <CreateThreadForm />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CreateThread;
