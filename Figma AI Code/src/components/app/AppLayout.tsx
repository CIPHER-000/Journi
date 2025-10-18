import { ReactNode, useState } from "react";
import { AppSidebar } from "./AppSidebar";
import { AppTopBar } from "./AppTopBar";

interface AppLayoutProps {
  children: ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
}

export function AppLayout({ children, currentPage, onPageChange }: AppLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Sidebar */}
      <AppSidebar 
        currentPage={currentPage} 
        onPageChange={onPageChange}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <AppTopBar />
        
        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}