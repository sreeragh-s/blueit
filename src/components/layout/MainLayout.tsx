
import { ReactNode } from "react";
import Sidebar from "@/components/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Sidebar is hidden on mobile and shown via drawer/sheet */}
      {!isMobile && <Sidebar />}
      <div className="flex-1 w-full p-4 md:p-6 overflow-y-auto">
        <div className="w-full max-w-full mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
