
import React from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";

const CommunityNotFound = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Community Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The community you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Button asChild>
              <Link to="/explore">Explore Communities</Link>
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CommunityNotFound;
