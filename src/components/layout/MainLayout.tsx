
import { ReactNode } from "react";
import Sidebar from "@/components/sidebar";
import { useAuth } from "@/contexts/AuthContext";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 w-full p-4 md:p-6 max-w-full">
        {children}
      </div>
    </div>
  );
};

export default MainLayout;
