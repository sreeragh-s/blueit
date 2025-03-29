
import React from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { Loader2 } from "lucide-react";

const CommunityLoading = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container flex">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading community...</p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CommunityLoading;
