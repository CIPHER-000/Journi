import { LayoutDashboard, Map, BookOpen, FileText, Settings, CreditCard, ChevronLeft, ChevronRight, Menu } from "lucide-react";
import { JourniIcon } from "../logos/JourniIcon";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";

interface AppSidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function AppSidebar({ currentPage, onPageChange, isCollapsed, onToggleCollapse }: AppSidebarProps) {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "journeys", label: "My Journeys", icon: Map },
    { id: "templates", label: "Templates", icon: BookOpen },
    { id: "reports", label: "Reports", icon: FileText },
    { id: "settings", label: "Settings", icon: Settings },
    { id: "account", label: "Account/Upgrade", icon: CreditCard }
  ];

  // Show expand button when collapsed
  if (isCollapsed) {
    return (
      <div className="hidden lg:flex w-16 bg-white border-r border-gray-200">
        <div className="flex flex-col items-center py-4 space-y-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="h-8 w-8 p-0 hover:bg-gray-100"
            title="Expand sidebar"
          >
            <Menu className="h-4 w-4" />
          </Button>
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <JourniIcon size="xs" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="hidden lg:flex w-64 bg-white border-r border-gray-200 flex-col max-h-screen">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <JourniIcon size="sm" />
          <span className="font-semibold text-gray-900">Journi</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="h-8 w-8 p-0 hover:bg-gray-100"
          title="Collapse sidebar"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>

      {/* Navigation - Scrollable */}
      <ScrollArea className="flex-1 px-4 py-4">
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  isActive 
                    ? "bg-green-50 text-green-700 border border-green-200" 
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? "text-green-600" : "text-gray-500"}`} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </ScrollArea>

      {/* User Profile at Bottom */}
      <div className="p-4 border-t border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-green-700 font-medium text-sm">JD</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 text-sm truncate">John Doe</p>
            <p className="text-gray-500 text-xs truncate">Free Plan</p>
          </div>
        </div>
      </div>
    </div>
  );
}