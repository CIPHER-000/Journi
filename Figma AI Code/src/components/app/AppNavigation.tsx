import { useState } from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Bell, Menu, X, Crown } from "lucide-react";
import { JourniCombinationMark } from "../logos/JourniCombinationMark";

interface AppNavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export function AppNavigation({ currentPage, onPageChange }: AppNavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: "dashboard", label: "Dashboard" },
    { id: "journeys", label: "Journeys" },
    { id: "templates", label: "Templates" },
    { id: "reports", label: "Reports" },
    { id: "settings", label: "Settings" }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-b">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button onClick={() => onPageChange("dashboard")}>
            <JourniCombinationMark size="md" />
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`transition-colors hover:text-foreground ${
                  currentPage === item.id 
                    ? "text-foreground font-medium" 
                    : "text-muted-foreground"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 bg-green-600 text-xs">
                2
              </Badge>
            </Button>

            {/* Upgrade Button */}
            <Button size="sm" className="bg-green-600 hover:bg-green-700 gap-2">
              <Crown className="h-4 w-4" />
              Upgrade
            </Button>

            {/* User Avatar */}
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-700 font-medium text-sm">JD</span>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="space-y-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onPageChange(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left transition-colors hover:text-foreground ${
                    currentPage === item.id 
                      ? "text-foreground font-medium" 
                      : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <div className="flex flex-col gap-2 pt-4">
                <Button variant="ghost" size="sm" className="justify-start gap-2">
                  <Bell className="h-4 w-4" />
                  Notifications
                  <Badge className="ml-auto bg-green-600">2</Badge>
                </Button>
                <Button size="sm" className="justify-start bg-green-600 hover:bg-green-700 gap-2">
                  <Crown className="h-4 w-4" />
                  Upgrade
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}